import asyncio
from open_notebook.database.repository import repo_query

async def main():
    res = await repo_query("SELECT id, title, full_text FROM source")
    for r in res:
        text_len = len(r.get('full_text') or '')
        print(f"ID: {r['id']} | Title: {r['title']} | Content Length: {text_len}")

if __name__ == "__main__":
    asyncio.run(main())
