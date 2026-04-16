import os
import json
import logging
from typing import List, Dict
from dotenv import load_dotenv

# Load Env
load_dotenv()

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

try:
    from supabase import create_client, Client
except ImportError:
    Client = None

try:
    from groq import Groq
except ImportError:
    Groq = None

from .prompts import LegalPrompts

logger = logging.getLogger(__name__)

class RAGEngine:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        self.supabase: Client = None
        
        if supabase_url and supabase_key and Client:
            self.supabase = create_client(supabase_url, supabase_key)
        else:
            logger.warning("Supabase URL or Key is missing in env. Context retrieval will use placeholders.")

        # Initialize Embedding Model
        self.embedding_model = None
        if SentenceTransformer:
            logging.info("Loading embedding model 'all-MiniLM-L6-v2'...")
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        else:
            logger.warning("SentenceTransformer not installed. Context retrieval will use placeholders.")

        # Initialize Groq LLM
        self.groq_client = None
        groq_api_key = os.getenv("GROQ_API_KEY")
        if groq_api_key and Groq:
            self.groq_client = Groq(api_key=groq_api_key)
            self.groq_model = "llama-3.3-70b-versatile" # Fast and fully free
        else:
            logger.warning("GROQ API Key missing or groq not installed. Generation will use placeholders.")


    def retrieve_context(self, query: str, top_k: int = 4) -> List[Dict]:
        """
        Retrieves relevant legal sections based on the query.
        """
        if not self.supabase or not self.embedding_model:
            logger.error("Supabase or Embedding model not configured!")
            return [{"chunk_text": "Missing Supabase/Embedding configuration."}]

        # Generate embedding for query
        query_embedding = self.embedding_model.encode(query).tolist()

        try:
            # Call the match_legal_documents RPC
            response = self.supabase.rpc(
                "match_legal_documents",
                {
                    "query_embedding": query_embedding,
                    "match_threshold": 0.3, # Adjust based on needed confidence
                    "match_count": top_k
                }
            ).execute()
            
            return response.data
        except Exception as e:
            logger.error(f"Error querying Supabase: {e}")
            return []

    def generate_steps(self, query: str, context_chunks: List[Dict]) -> Dict:
        """
        Uses an LLM (Groq API) to generate step-by-step guidance.
        """
        if not self.groq_client:
            return {
                "response": "Please set GROQ_API_KEY to use AI generation.",
                "steps": ["Setup Groq API Key in .env"],
                "citations": []
            }

        # Build context string
        context_string = "\n\n".join([
            f"Source: {chunk.get('act_name')} Section {chunk.get('section')} - {chunk.get('title')}\n{chunk.get('chunk_text')}" 
            for chunk in context_chunks
        ])

        try:
            # Build Messages Array
            messages = [
                {
                    "role": "system",
                    "content": LegalPrompts.MENTOR_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": f"Context:\n{context_string}\n\nUser Issue:\n{query}"
                }
            ]

            # Use Groq Client with JSON Mode
            chat_completion = self.groq_client.chat.completions.create(
                model=self.groq_model,
                messages=messages,
                temperature=0.3,
                max_tokens=1024,
                response_format={"type": "json_object"}
            )
            
            result_json = chat_completion.choices[0].message.content
            
            try:
                parsed_result = json.loads(result_json)
                
                # Filter None sources
                parsed_result["citations"] = [
                    f"{c.get('act_name')} Section {c.get('section')}" for c in context_chunks if c.get('act_name')
                ]
                return parsed_result
                
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON from Groq. Raw output: {result_json}")
                return {
                    "response": result_json,
                    "steps": [],
                    "citations": []
                }
                
        except Exception as e:
            logger.error(f"Error generating from Groq: {e}")
            return {
                "response": f"An error occurred while generating a response: {str(e)}",
                "steps": [],
                "citations": []
            }
