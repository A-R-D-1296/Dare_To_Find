from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from .rag_engine import RAGEngine
load_dotenv()

app = FastAPI(title="LexisCo API")

# Initialize RAGEngine (This will load the model, make sure resources are sufficient)
rag_engine = RAGEngine()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[dict] = None

@app.get("/")
async def root():
    return {"message": "Welcome to LexisCo - Your Legal Action Assistant"}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # We assume the last message from user is the query
        user_messages = [m.content for m in request.messages if m.role == 'user']
        if not user_messages:
            raise HTTPException(status_code=400, detail="No user message found")
        
        query = user_messages[-1]
        
        # 1. Retrieve Context from Supabase
        context_chunks = rag_engine.retrieve_context(query)
        
        # 2. Generate Steps using Gemini
        result = rag_engine.generate_steps(query, context_chunks)
        
        return result
    except HTTPException as he:
        raise he  # Let FastAPI handle it and return 400
    except Exception as e:
        import traceback
        traceback.print_exc() # Print full stack trace to the terminal
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/api/generate-document")
async def generate_document(data: dict):
    # Logic to generate FIR/Complaint drafts
    return {"message": "Document generation logic goes here"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
