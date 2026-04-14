# 🚀 How to Run LexisCo

Follow these steps to get the legal assistant running locally.

## 🎨 Frontend (React + Vite)
1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
   *The app will be available at http://localhost:5173*

## ⚙️ Backend (FastAPI)
1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```
2. **Create a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Mac/Linux
   # venv\Scripts\activate   # On Windows
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```
5. **Start the backend server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The API will be available at http://localhost:8000*

## 📍 Project Structure
- `frontend/`: React application (UI/UX)
- `backend/`: FastAPI application (RAG Engine + LLM)
- `data/`: Place your legal PDFs/Txt files here for indexing.
- `notebooks/`: For testing chunking and embeddings.
