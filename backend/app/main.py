from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from datetime import datetime  # ✅ added

from .rag_engine import RAGEngine
load_dotenv()

app = FastAPI(title="LexisCo API")

# Initialize RAGEngine
rag_engine = RAGEngine()

# ✅ generate current date
today = datetime.now().strftime("%d-%m-%Y")

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
        user_messages = [m.content for m in request.messages if m.role == 'user']
        if not user_messages:
            raise HTTPException(status_code=400, detail="No user message found")
        
        query = user_messages[-1]
        
        context_chunks = rag_engine.retrieve_context(query)
        result = rag_engine.generate_steps(query, context_chunks)
        
        return result

    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/api/generate-document")
async def generate_document(data: dict):
    doc_type = data.get("type", "").upper()
    details = data.get("details", "")

    if doc_type == "FIR":
        document = f"""FIRST INFORMATION REPORT (FIR)

Date: {today}

To,
The Officer-in-Charge,
[Police Station Name]
[City, State]

Subject: First Information Report regarding {details[:40] + '...' if len(details) > 40 else details}.

Respected Sir/Madam,

I am writing to report the following incident:
{details}

I request you to kindly register an FIR and take necessary legal action.

Yours faithfully,
[Your Name]
[Contact Information]"""

    elif doc_type == "LEGAL NOTICE" or doc_type == "LEGAL_NOTICE":
        document = f"""LEGAL NOTICE

Date: {today}

To,
[Recipient Name]
[Recipient Address]

Subject: Legal Notice regarding {details[:40] + '...' if len(details) > 40 else details}.

Under instructions from my client, I hereby serve you with this legal notice:

{details}

You are required to comply with the terms of this notice within [Number] days, failing which appropriate legal action will be initiated against you.

Yours sincerely,
[Your Name/Advocate Name]"""

    elif doc_type == "COMPLAINT":
        document = f"""FORMAL COMPLAINT

Date: {today}

To,
[Authority Name]
[Address]

Subject: Formal Complaint regarding {details[:40] + '...' if len(details) > 40 else details}.

Respected Authority,

I hereby lodge a formal complaint stating the following facts:

{details}

I request you to kindly investigate this matter and take appropriate action at the earliest.

Yours faithfully,
[Your Name]
[Contact Information]"""

    else:
        raise HTTPException(status_code=400, detail="Invalid document type. Allowed types: FIR, Legal Notice, Complaint.")

    return {
        "type": doc_type,
        "document": document
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)