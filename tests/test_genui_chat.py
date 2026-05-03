import json
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

@pytest.fixture
def mock_openai():
    with patch("api.routers.genui_chat.OpenAI") as mock:
        # Mock client and its completions.create
        mock_client = MagicMock()
        mock.return_value = mock_client
        
        # Mock streaming response
        mock_chunk = MagicMock()
        mock_chunk.choices = [MagicMock()]
        mock_chunk.choices[0].delta.content = "Hello from mock AI!"
        mock_chunk.model_dump_json.return_value = json.dumps({"choices": [{"delta": {"content": "Hello from mock AI!"}}]})
        
        mock_client.chat.completions.create.return_value = [mock_chunk]
        yield mock_client

@pytest.fixture
def mock_db():
    with patch("open_notebook.domain.genui.repo_query") as mock_query, \
         patch("open_notebook.domain.genui.ObjectModel.save") as mock_save, \
         patch("open_notebook.domain.genui.ObjectModel.get") as mock_get:
        
        # Mock session list
        mock_query.return_value = [
            {"id": "genui_session:1", "title": "Test Chat", "created": "2024-01-01T00:00:00", "updated": "2024-01-01T00:00:00"}
        ]
        
        # Mock specific session
        mock_session = MagicMock()
        mock_session.id = "genui_session:1"
        mock_session.title = "Test Chat"
        mock_get.return_value = mock_session
        
        yield {"query": mock_query, "save": mock_save, "get": mock_get}

def test_get_genui_sessions(mock_db):
    response = client.get("/api/genui/sessions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["title"] == "Test Chat"

def test_create_genui_session(mock_db):
    response = client.post("/api/genui/sessions", json={"title": "New Chat"})
    assert response.status_code == 200
    assert response.json()["title"] == "New Chat"

def test_genui_chat_stream(mock_openai, mock_db):
    # Mock environment variables
    with patch.dict("os.environ", {"GEMINI_API_KEY": "test-key"}):
        payload = {
            "threadId": "genui_session:1",
            "messages": [{"role": "user", "content": "Hi"}],
            "systemPrompt": "Test prompt"
        }
        response = client.post("/api/genui/chat", json=payload)
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/event-stream"
        
        # Check if we get data chunks
        chunks = response.text.split("\n\n")
        assert any("Hello from mock AI!" in chunk for chunk in chunks)
        assert chunks[-2] == "data: [DONE]"

def test_genui_chat_no_key():
    # Test failure when no keys are provided
    with patch.dict("os.environ", {}, clear=True):
        payload = {
            "threadId": "ephemeral",
            "messages": [{"role": "user", "content": "Hi"}]
        }
        response = client.post("/api/genui/chat", json=payload)
        # Should fail with 500 or handle gracefully
        assert response.status_code == 500
        assert "No AI API key found" in response.json()["detail"]
