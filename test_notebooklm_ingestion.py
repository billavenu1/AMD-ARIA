import asyncio
import os
import fitz  # PyMuPDF
from pathlib import Path
from loguru import logger
from surrealdb import Surreal

# Mock implementation of what the new backend models will look like
# In the real code, these would be in open_notebook/domain/notebook.py

async def test_pdf_ingestion(pdf_path: str, db_url: str = "ws://localhost:8000/rpc"):
    """
    Simulates the NotebookLM ingestion pipeline:
    1. Connects to SurrealDB
    2. Parses PDF
    3. Extracts text and chunks it
    4. Extracts images and saves them to static assets folder
    5. Saves SourceChunk objects to DB
    """
    logger.info(f"Starting test ingestion for {pdf_path}")
    
    # Setup SurrealDB connection
    db = Surreal(db_url)
    await db.connect()
    await db.signin({"user": "root", "pass": "root"})
    await db.use("test", "test")
    
    # Ensure assets directory exists for images
    assets_dir = Path("surreal_data/assets")
    assets_dir.mkdir(parents=True, exist_ok=True)
    
    # Open PDF
    doc = fitz.open(pdf_path)
    
    # 1. Create Source Document
    source_id = "source:sample_pdf"
    await db.create(source_id, {
        "title": Path(pdf_path).name,
        "full_text": "" # We won't use this anymore for RAG, we use chunks
    })
    
    logger.info(f"Processing {len(doc)} pages...")
    
    # 2. Extract Text and Images page by page
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        
        # Extract text (Chunking strategy: 1 chunk = 1 page for simplicity in this test)
        text_content = page.get_text()
        
        # Extract images
        image_list = page.get_images(full=True)
        image_paths = []
        
        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            # Save image locally
            image_filename = f"source_{page_num}_{img_index}.{image_ext}"
            image_path = assets_dir / image_filename
            with open(image_path, "wb") as f:
                f.write(image_bytes)
                
            # Store the URL path that the frontend will use to fetch it
            image_paths.append(f"/assets/{image_filename}")
            
        logger.info(f"Page {page_num}: Extracted {len(image_paths)} images")
        
        # 3. Create SourceChunk in SurrealDB
        chunk_id = f"source_chunk:page_{page_num}"
        await db.create(chunk_id, {
            "source_id": source_id,
            "chunk_index": page_num,
            "text_content": text_content,
            "page_number": page_num + 1,
            "image_paths": image_paths
        })
        
        # 4. Create SourceEmbedding (Mocked vector)
        await db.create(f"source_embedding:page_{page_num}", {
            "chunk_id": chunk_id,
            "content": text_content,
            # "embedding": [...] # This is where the actual vector goes
        })
        
    logger.info("Ingestion complete! All chunks and images stored in SurrealDB.")
    
    # 5. Verify the insertion
    chunks = await db.query(f"SELECT * FROM source_chunk WHERE source_id = '{source_id}'")
    logger.info(f"Verification: Found {len(chunks[0]['result'])} chunks in database.")
    for chunk in chunks[0]['result']:
        logger.info(f"Chunk {chunk['id']} has {len(chunk['image_paths'])} images: {chunk['image_paths']}")

if __name__ == "__main__":
    # Point this to the sample PDF
    sample_pdf_dir = Path("c:/Users/venub/Desktop/Projects/AMD hackathon/ARIA/sample-pdf")
    
    # Find a PDF in the directory
    pdf_files = list(sample_pdf_dir.glob("*.pdf"))
    if not pdf_files:
        print(f"Please place a PDF file in {sample_pdf_dir} to test.")
    else:
        pdf_path = str(pdf_files[0])
        asyncio.run(test_pdf_ingestion(pdf_path))
