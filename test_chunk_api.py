import asyncio
import json
import urllib.request
import urllib.error
from open_notebook.database.repository import repo_query

async def main():
    try:
        print("[*] Fetching chunks from database...")
        res = await repo_query('SELECT * FROM source_chunk LIMIT 1')
        if not res:
            print("No chunks found in database!")
            return
            
        chunk_id = res[0]["id"]
        # Remove 'source_chunk:' prefix if present
        if chunk_id.startswith("source_chunk:"):
            chunk_id = chunk_id.replace("source_chunk:", "")
            
        print(f"[*] Found chunk ID: {chunk_id}")
        print(f"[*] Testing API endpoint: http://localhost:5055/api/sources/chunks/{chunk_id}")
        
        try:
            req = urllib.request.urlopen(f'http://localhost:5055/api/sources/chunks/{chunk_id}')
            data = json.loads(req.read())
            print("[+] API Success!")
            print("Title:", data.get("source_title"))
            print("Text:", data.get("text_content")[:100], "...")
            print("Images:", data.get("image_paths"))
        except urllib.error.HTTPError as e:
            print(f"[-] API HTTP Error: {e.code} {e.reason}")
            print(e.read().decode('utf-8'))
        except Exception as e:
            print(f"[-] API Error: {e}")
            
    except Exception as e:
        print(f"Error querying db: {e}")

if __name__ == "__main__":
    asyncio.run(main())
