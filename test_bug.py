import asyncio
from open_notebook.domain.notebook import SourceChunk, Source

async def main():
    try:
        print("Getting chunk...")
        chunk = await SourceChunk.get('source_chunk:dummy_123')
        if not chunk:
            print("Chunk is None!")
            return
            
        print("Model dump...")
        data = chunk.model_dump()
        print("Data:", data)
        
        print("Getting source...")
        s = await Source.get(data['source_id'])
        print("Source:", s.title if s else "None")
        
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
