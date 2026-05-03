import asyncio
from open_notebook.database.repository import repo_query

async def main():
    try:
        query = """
        CREATE source_chunk:dummy_123 SET 
            source_id='source:ybnjalx0yyrwyeoqyujo', 
            chunk_index=0, 
            text_content='This is a dummy chunk text to test the hover card!', 
            image_paths=['/assets/dummy.png']
        """
        await repo_query(query)
        print("Dummy chunk created!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
