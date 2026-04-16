import os
import json
import logging
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Load environment variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") # Use Service Role key for raw DB writes

def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        logging.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
        return

    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Initialize Embedding Model
    # "all-MiniLM-L6-v2" generates 384-dimensional embeddings, perfect for standard semantic search.
    logging.info("Loading embedding model 'all-MiniLM-L6-v2'...")
    model = SentenceTransformer('all-MiniLM-L6-v2')

    # Load chunked data
    script_dir = Path(__file__).resolve().parent
    backend_dir = script_dir.parent
    data_path = backend_dir / "data" / "processed_chunks.json"

    if not data_path.exists():
        logging.error(f"Data file not found at {data_path}. Run ingest_data.py first.")
        return

    with open(data_path, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    if not chunks:
        logging.info("No chunks found in processed_chunks.json")
        return

    logging.info(f"Loaded {len(chunks)} chunks. Starting embedding generation and database insert...")

    BATCH_SIZE = 100
    for i in tqdm(range(0, len(chunks), BATCH_SIZE), desc="Processing Chunks"):
        batch = chunks[i:i + BATCH_SIZE]
        texts = [item["text"] for item in batch]
        
        # Generate embeddings
        embeddings = model.encode(texts).tolist()

        # Prepare records for Supabase insertion
        records = []
        for j, item in enumerate(batch):
            meta = item.get("metadata", {})
            record = {
                "act_name": meta.get("act_name"),
                "section": meta.get("section"),
                "title": meta.get("title"),
                "law_type": meta.get("law_type"),
                "language": meta.get("language"),
                "source_file": meta.get("source_file"),
                "chunk_text": item["text"],
                "embedding": embeddings[j]
            }
            records.append(record)

        try:
            # Insert into supabase
            supabase.table("legal_documents").insert(records).execute()
        except Exception as e:
            logging.error(f"Error inserting batch starting at index {i}: {e}")

    logging.info("Database seeding complete!")

if __name__ == "__main__":
    main()
