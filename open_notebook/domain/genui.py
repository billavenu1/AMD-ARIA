import asyncio
from typing import ClassVar, Optional, List
from loguru import logger
from pydantic import Field, ConfigDict

from open_notebook.database.repository import ensure_record_id, repo_query
from open_notebook.domain.base import ObjectModel
from open_notebook.exceptions import DatabaseOperationError


class GenUISession(ObjectModel):
    table_name: ClassVar[str] = "genui_session"
    title: str = "New Chat"

    async def get_messages(self) -> List["GenUIMessage"]:
        try:
            msgs = await repo_query(
                """
                SELECT * FROM genui_message WHERE session_id = $id ORDER BY order ASC
                """,
                {"id": ensure_record_id(self.id)},
            )
            return [GenUIMessage(**msg) for msg in msgs] if msgs else []
        except Exception as e:
            logger.error(f"Error fetching messages for genui session {self.id}: {str(e)}")
            raise DatabaseOperationError(e)


class GenUIMessage(ObjectModel):
    table_name: ClassVar[str] = "genui_message"
    session_id: str
    role: str
    content: str
    order: int
