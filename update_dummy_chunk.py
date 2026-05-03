import asyncio
from open_notebook.database.repository import repo_query

async def main():
    try:
        await repo_query("UPDATE source_chunk:dummy_123 SET page_number=1")
        print("Updated dummy chunk!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
