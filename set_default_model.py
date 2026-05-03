import asyncio
from open_notebook.database.repository import repo_query

async def main():
    try:
        # Get the ID of the gemini embedding model we created
        models = await repo_query(
            "SELECT id FROM model WHERE name = 'gemini-embedding-2' AND provider = 'google' LIMIT 1"
        )
        if not models:
            print("Model not found in DB!")
            return
            
        model_id = models[0]['id']
        print(f"Setting default embedding model to: {model_id}")
        
        # Ensure default_models record exists or update it
        res = await repo_query(
            """
            UPSERT open_notebook:default_models SET 
                default_embedding_model = $model_id
            """,
            {"model_id": model_id}
        )
        print("Updated default models:", res)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
