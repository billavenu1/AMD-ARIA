import asyncio
from open_notebook.database.repository import repo_query

async def main():
    try:
        # Check if it already exists
        models = await repo_query(
            "SELECT id FROM model WHERE name = 'gemini-embedding-2' AND provider = 'google'"
        )
        if models:
            print("Model already exists in DB:", models[0]['id'])
        else:
            print("Adding model 'gemini-embedding-2' to DB...")
            res = await repo_query(
                """
                CREATE model SET 
                    name = 'gemini-embedding-2',
                    provider = 'google',
                    type = 'embedding'
                """
            )
            print("Model created:", res[0]['id'])
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
