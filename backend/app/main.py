from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from datetime import datetime

from .rag_engine import RAGEngine
load_dotenv()

app = FastAPI(title="LexisCo API") 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    language: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/register")
async def register_user(req: RegisterRequest):
    if not rag_engine.supabase:
        raise HTTPException(status_code=500, detail="Supabase client not configured")
    try:
        res = rag_engine.supabase.auth.sign_up({
            "email": req.email,
            "password": req.password,
            "options": {
                "data": {
                    "name": req.name,
                    "phone": req.phone,
                    "language": req.language
                }
            }
        })
        if not res.user:
            raise HTTPException(status_code=400, detail="Signup failed.")

        # Auto-confirm the email using the admin API so users can login immediately
        try:
            rag_engine.supabase.auth.admin.update_user_by_id(
                res.user.id,
                {"email_confirm": True}
            )
        except Exception as confirm_err:
            import logging
            logging.warning(f"Could not auto-confirm email: {confirm_err}")

        # Sign in immediately to get a session token
        login_res = rag_engine.supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password
        })

        token = login_res.session.access_token if login_res.session else "no-session"
        return {
            "token": token,
            "user": {
                "id": res.user.id,
                "email": res.user.email,
                "name": req.name
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login")
async def login_user(req: LoginRequest):
    if not rag_engine.supabase:
        raise HTTPException(status_code=500, detail="Supabase client not configured")
    try:
        res = rag_engine.supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password
        })
        # If successfully signed in, res.session should be present
        if not res.session:
            raise HTTPException(status_code=401, detail="Invalid session/email verification required")
        
        name = req.email
        if hasattr(res.user, "user_metadata") and res.user.user_metadata:
            name = res.user.user_metadata.get("name", req.email)
            
        return {
            "token": res.session.access_token,
            "user": {
                "id": res.user.id,
                "email": res.user.email,
                "name": name
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/api/auth/google")
async def google_oauth():
    if not rag_engine.supabase:
        raise HTTPException(status_code=500, detail="Supabase client not configured")
    try:
        res = rag_engine.supabase.auth.sign_in_with_oauth({
            "provider": "google",
            "options": {
                "redirect_to": os.getenv("AUTH_REDIRECT_URL", "http://localhost:5173/auth/callback")
            }
        })
        return {"url": res.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
    
    comp_name = data.get("complainantName") or "[Name]"
    father_name = data.get("fatherName") or "[Relative Name]"
    address = data.get("address") or "[Address]"
    phone = data.get("phone") or "[Phone]"
    date_inc = data.get("dateOfIncident") or "[Date]"
    time_inc = data.get("timeOfIncident") or "[Time]"
    location = data.get("location") or "[Location]"
    nature = data.get("natureOfOffence") or "specified incident"
    accused = data.get("accusedName") or "Unknown"
    description = data.get("description") or "[Detailed Description]"
    
    evidence_list = data.get("evidence", [])
    evidence = ", ".join(evidence_list) if evidence_list else "None listed."

    if doc_type == "FIR":
        header_title = "FIRST INFORMATION REPORT (FIR)"
        authority = "The Officer In-Charge,\n[Police Station Name]"
        subject_prefix = "Information regarding"
        action = "first information report"
    elif doc_type == "LEGAL NOTICE" or doc_type == "LEGAL_NOTICE":
        header_title = "LEGAL NOTICE"
        authority = "[Recipient Name],\n[Recipient Address]"
        subject_prefix = "Legal Notice regarding"
        action = "legal notice"
    elif doc_type == "COMPLAINT":
        header_title = "FORMAL COMPLAINT"
        authority = "The District Consumer Disputes Redressal Commission / Honorable Forum,\n[Jurisdiction Placeholder]"
        subject_prefix = "Complaint regarding"
        action = "formal complaint"
    else:
        raise HTTPException(status_code=400, detail="Invalid document type. Allowed types: FIR, Legal Notice, Complaint.")

    document = f"""{header_title}
--------------------------------------------------

To,
{authority}

Date: {today}

Subject: {subject_prefix} {nature}.

Respected Sir/Madam,

I, {comp_name}, son/daughter/spouse of {father_name}, residing at {address}, bearing contact number {phone}, beg to state the following:

1. That on {date_inc} at approximately {time_inc}, an incident/issue occurred at {location}.
2. The accused person(s) / opposing party, namely {accused}, was/were involved.
3. Description of Event / Grievance:
{description}

4. Evidence Available:
{evidence}

I request you to kindly register this {action} and take necessary legal action at the earliest.

Yours faithfully,

(Signature)
{comp_name}"""

    return {
        "type": doc_type,
        "document": document
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)