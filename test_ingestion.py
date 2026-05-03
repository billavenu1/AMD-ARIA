"""
Test the ingestion pipeline end-to-end:
1. Check if the source exists
2. Manually trigger the embed_source command
3. Verify chunks are created in DB
4. Verify the API endpoint returns correct data
"""
import asyncio
import urllib.request
import urllib.error
import json
from pathlib import Path

SOURCE_ID = "source:ybnjalx0yyrwyeoqyujo"

async def step1_check_source():
    from open_notebook.domain.notebook import Source
    print("\n[Step 1] Checking source exists...")
    source = await Source.get(SOURCE_ID)
    if not source:
        print("  [FAIL] Source not found!")
        return None
    print(f"  [OK] Source found: {source.title}")
    print(f"     File path: {source.asset.file_path if source.asset else 'No asset'}")
    print(f"     Full text: {'Yes (' + str(len(source.full_text)) + ' chars)' if source.full_text else 'None'}")
    return source

async def step2_check_existing_chunks():
    from open_notebook.database.repository import repo_query
    print("\n[Step 2] Checking existing chunks...")
    chunks = await repo_query(
        "SELECT id, chunk_index, page_number, array::len(image_paths) as img_count FROM source_chunk WHERE source_id = $sid",
        {"sid": SOURCE_ID}
    )
    print(f"  Found {len(chunks)} chunks")
    for c in chunks[:5]:
        print(f"  - Chunk {c['chunk_index']}: page {c.get('page_number', '?')}, images: {c.get('img_count', 0)}")
    return chunks

async def step3_run_embed():
    from commands.embedding_commands import EmbedSourceInput, embed_source_command
    print("\n[Step 3] Running embed_source_command directly...")
    try:
        result = await embed_source_command(EmbedSourceInput(source_id=SOURCE_ID))
        print(f"  [OK] Success! chunks_created={result.chunks_created}, time={result.processing_time:.2f}s")
    except Exception as e:
        import traceback
        print(f"  [FAIL] Failed: {e}")
        traceback.print_exc()

async def step4_verify_chunks():
    from open_notebook.database.repository import repo_query
    print("\n[Step 4] Verifying chunks after embedding...")
    chunks = await repo_query(
        "SELECT id, chunk_index, page_number, array::len(image_paths) as img_count FROM source_chunk WHERE source_id = $sid",
        {"sid": SOURCE_ID}
    )
    print(f"  Found {len(chunks)} chunks after embedding")
    for c in chunks[:5]:
        print(f"  - Chunk {c['chunk_index']}: page {c.get('page_number', '?')}, images: {c.get('img_count', 0)}")

def step5_test_api():
    print("\n[Step 5] Testing /api/sources/chunks/ API endpoint...")
    try:
        url = "http://localhost:5055/api/sources/chunks/dummy_123"
        res = urllib.request.urlopen(url)
        data = json.loads(res.read())
        print(f"  [OK] API works! Title={data.get('source_title')}")
    except urllib.error.HTTPError as e:
        print(f"  [FAIL] API error {e.code}: {e.read().decode()}")
    except Exception as e:
        print(f"  [FAIL] Error: {e}")

async def main():
    print("=" * 50)
    print("  ARIA INGESTION PIPELINE TEST")
    print("=" * 50)

    source = await step1_check_source()
    if not source:
        return

    if source.asset and source.asset.file_path:
        fp = Path(source.asset.file_path)
        print(f"  File exists on disk: {fp.exists()} -> {fp}")
        if not fp.exists():
            print("  [FAIL] PDF file is missing from disk! Re-upload the source.")
            return

    await step2_check_existing_chunks()
    await step3_run_embed()
    await step4_verify_chunks()
    step5_test_api()

    print("\n" + "=" * 50)
    print("  DONE")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(main())
