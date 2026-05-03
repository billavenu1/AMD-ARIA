import json
import asyncio
from typing import List, Optional, Any, AsyncGenerator

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from loguru import logger

from open_notebook.database.repository import repo_query, ensure_record_id
from open_notebook.domain.genui import GenUISession, GenUIMessage

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
import os

router = APIRouter()

class SessionResponse(BaseModel):
    id: str
    title: str
    created: str
    updated: str

class MessageItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    threadId: Optional[str] = None
    messages: List[MessageItem]

@router.post("/sessions", response_model=SessionResponse)
async def create_session():
    session = GenUISession()
    await session.save()
    return SessionResponse(
        id=session.id or "",
        title=session.title,
        created=str(session.created),
        updated=str(session.updated)
    )

@router.get("/sessions", response_model=List[SessionResponse])
async def list_sessions():
    sessions = await repo_query("SELECT * FROM genui_session ORDER BY updated DESC")
    return [SessionResponse(
        id=str(s["id"]),
        title=s.get("title", "New Chat"),
        created=str(s.get("created", "")),
        updated=str(s.get("updated", ""))
    ) for s in sessions]

@router.get("/sessions/{session_id}", response_model=List[MessageItem])
async def get_session_history(session_id: str):
    full_session_id = session_id if session_id.startswith("genui_session:") else f"genui_session:{session_id}"
    session = await GenUISession.get(full_session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = await session.get_messages()
    return [MessageItem(role=msg.role, content=msg.content) for msg in messages]

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    full_session_id = session_id if session_id.startswith("genui_session:") else f"genui_session:{session_id}"
    session = await GenUISession.get(full_session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Delete messages first
    await repo_query("DELETE FROM genui_message WHERE session_id = $id", {"id": ensure_record_id(full_session_id)})
    await session.delete()
    return {"success": True}

async def generate_chat_stream(request: ChatRequest) -> AsyncGenerator[str, None]:
    # Extract thread ID or create new if not provided
    session_id = request.threadId
    if not session_id:
        session = GenUISession()
        await session.save()
        session_id = str(session.id)
    else:
        full_session_id = session_id if session_id.startswith("genui_session:") else f"genui_session:{session_id}"
        session = await GenUISession.get(full_session_id)
        if not session:
            session = GenUISession()
            session.id = ensure_record_id(full_session_id)
            await session.save()
            session_id = str(session.id)

    # Save user messages to DB if new
    # OpenUI passes the full message history
    # So we'll clear the history and re-save, or just save the last one if it's simpler
    # For now, clear and re-save to keep order correct
    full_session_id = session_id if session_id.startswith("genui_session:") else f"genui_session:{session_id}"
    await repo_query("DELETE FROM genui_message WHERE session_id = $id", {"id": ensure_record_id(full_session_id)})

    for i, msg in enumerate(request.messages):
        db_msg = GenUIMessage(
            session_id=full_session_id,
            role=msg.role,
            content=msg.content,
            order=i
        )
        await db_msg.save()

    # Set title based on first user message if it's a new session
    if len(request.messages) > 0 and session.title == "New Chat":
        first_user_msg = next((m for m in request.messages if m.role == "user" or m.role == "human"), None)
        if first_user_msg:
            session.title = first_user_msg.content[:30] + ("..." if len(first_user_msg.content) > 30 else "")
            await session.save()

    # Prepare langchain messages
    langchain_messages = []
    for msg in request.messages:
        if msg.role == "user" or msg.role == "human":
            langchain_messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant" or msg.role == "ai":
            langchain_messages.append(AIMessage(content=msg.content))
        elif msg.role == "system":
            langchain_messages.append(SystemMessage(content=msg.content))

    # We use Google Generative AI for generation
    # Provide system prompt to output OpenUI formatting if needed
    system_prompt = SystemMessage(content="You are an expert web developer. You build web applications using React, Tailwind CSS, and other modern web technologies. You can generate UI components based on user requests.")

    if not any(isinstance(m, SystemMessage) for m in langchain_messages):
        langchain_messages.insert(0, system_prompt)

    try:
        # Check if GEMINI_API_KEY is available
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            # Fallback to dummy generation
            yield 'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gemini-pro","choices":[{"index":0,"delta":{"role":"assistant","content":"I need a Gemini API key to generate UI. Please set GEMINI_API_KEY in your environment."},"finish_reason":null}]}\n\n'
            yield 'data: [DONE]\n\n'
            return

        model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key)

        full_response = ""
        async for chunk in model.astream(langchain_messages):
            if chunk.content:
                full_response += chunk.content
                # Format to match OpenAI SSE stream format that OpenUI expects
                json_data = json.dumps({
                    "id": f"chatcmpl-{session_id}",
                    "object": "chat.completion.chunk",
                    "created": 1694268190,
                    "model": "gemini-2.5-flash",
                    "choices": [
                        {
                            "index": 0,
                            "delta": {"content": chunk.content},
                            "finish_reason": None
                        }
                    ]
                })
                yield f"data: {json_data}\n\n"

        # Final empty chunk with finish_reason
        final_json = json.dumps({
            "id": f"chatcmpl-{session_id}",
            "object": "chat.completion.chunk",
            "created": 1694268190,
            "model": "gemini-2.5-flash",
            "choices": [
                {
                    "index": 0,
                    "delta": {},
                    "finish_reason": "stop"
                }
            ]
        })
        yield f"data: {final_json}\n\n"
        yield "data: [DONE]\n\n"

        # Save assistant message to DB
        db_msg = GenUIMessage(
            session_id=full_session_id,
            role="assistant",
            content=full_response,
            order=len(request.messages)
        )
        await db_msg.save()

    except Exception as e:
        logger.error(f"Error generating chat: {e}")
        error_json = json.dumps({
            "error": str(e)
        })
        yield f"data: {error_json}\n\n"
        yield "data: [DONE]\n\n"

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    return StreamingResponse(
        generate_chat_stream(request),
        media_type="text/event-stream"
    )
