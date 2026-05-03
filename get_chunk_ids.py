import asyncio
from open_notebook.database.repository import repo_query

async def main():
    chunks = await repo_query(
        "SELECT id FROM source_chunk WHERE source_id = $sid LIMIT 3",
        {"sid": "source:ybnjalx0yyrwyeoqyujo"}
    )
    print("Chunk IDs:", [c["id"] for c in chunks])

if __name__ == "__main__":
    asyncio.run(main())
