import asyncio
import sqlite3
from typing import Annotated, Optional

from ai_prompter import Prompter
from langchain_core.messages import AIMessage, SystemMessage
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict

from open_notebook.ai.provision import provision_langchain_model
from open_notebook.config import LANGGRAPH_CHECKPOINT_FILE
from open_notebook.domain.notebook import Notebook
from open_notebook.exceptions import OpenNotebookError
from open_notebook.utils import clean_thinking_content
from open_notebook.utils.error_classifier import classify_error
from open_notebook.utils.text_utils import extract_text_content


class ThreadState(TypedDict):
    messages: Annotated[list, add_messages]
    notebook: Optional[Notebook]
    context: Optional[str]
    context_config: Optional[dict]
    model_override: Optional[str]


def _format_chat_context(context_data: dict) -> str:
    """Format the context dictionary into a string with chunks."""
    if not isinstance(context_data, dict):
        return str(context_data)
        
    context_parts = []
    
    if context_data.get("sources"):
        context_parts.append("## SOURCES")
        for source in context_data["sources"]:
            context_parts.append(f"**Source ID:** {source.get('id', 'Unknown')}")
            context_parts.append(f"**Title:** {source.get('title', 'No title')}")
            
            if source.get("chunks"):
                context_parts.append("**Chunks:**")
                for chunk in source["chunks"]:
                    chunk_id = chunk.get("id", "").replace("source_chunk:", "") if chunk.get("id") else ""
                    context_parts.append(f"[chunk:{chunk_id}]")
                    context_parts.append(f"{chunk.get('text_content', '')}")
                    context_parts.append("")
            elif source.get("full_text"):
                full_text = source["full_text"]
                if len(full_text) > 100000:
                    full_text = full_text[:100000] + "...\n[Content truncated]"
                context_parts.append(f"**Content:**\n{full_text}")
            
            # Add insights if present
            if source.get("insights"):
                context_parts.append("**Insights:**")
                for insight in source["insights"]:
                    context_parts.append(f"[insight:{insight.get('id', '').replace('source_insight:', '')}] {insight.get('content', '')}")
            
            context_parts.append("")
            
    if context_data.get("notes"):
        context_parts.append("## NOTES")
        for note in context_data["notes"]:
            context_parts.append(f"**Note ID:** {note.get('id', 'Unknown')}")
            context_parts.append(f"**Title:** {note.get('title', 'No title')}")
            context_parts.append(f"**Content:**\n{note.get('content', '')}")
            context_parts.append("")
            
    return "\n".join(context_parts)

def call_model_with_messages(state: ThreadState, config: RunnableConfig) -> dict:
    try:
        # Format context if it's a dict
        formatted_state = dict(state)
        if formatted_state.get("context") and isinstance(formatted_state["context"], dict):
            formatted_state["context"] = _format_chat_context(formatted_state["context"])
            
        system_prompt = Prompter(prompt_template="chat/system").render(data=formatted_state)  # type: ignore[arg-type]
        payload = [SystemMessage(content=system_prompt)] + state.get("messages", [])
        model_id = config.get("configurable", {}).get("model_id") or state.get(
            "model_override"
        )

        # Handle async model provisioning from sync context
        def run_in_new_loop():
            """Run the async function in a new event loop"""
            new_loop = asyncio.new_event_loop()
            try:
                asyncio.set_event_loop(new_loop)
                return new_loop.run_until_complete(
                    provision_langchain_model(
                        str(payload), model_id, "chat", max_tokens=8192
                    )
                )
            finally:
                new_loop.close()
                asyncio.set_event_loop(None)

        try:
            # Try to get the current event loop
            asyncio.get_running_loop()
            # If we're in an event loop, run in a thread with a new loop
            import concurrent.futures

            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(run_in_new_loop)
                model = future.result()
        except RuntimeError:
            # No event loop running, safe to use asyncio.run()
            model = asyncio.run(
                provision_langchain_model(
                    str(payload),
                    model_id,
                    "chat",
                    max_tokens=8192,
                )
            )

        ai_message = model.invoke(payload)

        # Clean thinking content from AI response (e.g., <think>...</think> tags)
        content = extract_text_content(ai_message.content)
        cleaned_content = clean_thinking_content(content)
        cleaned_message = ai_message.model_copy(update={"content": cleaned_content})

        return {"messages": cleaned_message}
    except OpenNotebookError:
        raise
    except Exception as e:
        error_class, user_message = classify_error(e)
        raise error_class(user_message) from e


conn = sqlite3.connect(
    LANGGRAPH_CHECKPOINT_FILE,
    check_same_thread=False,
)
memory = SqliteSaver(conn)

agent_state = StateGraph(ThreadState)
agent_state.add_node("agent", call_model_with_messages)
agent_state.add_edge(START, "agent")
agent_state.add_edge("agent", END)
graph = agent_state.compile(checkpointer=memory)
