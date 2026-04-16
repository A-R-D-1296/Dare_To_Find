import asyncio
from app.rag_engine import RAGEngine

engine = RAGEngine()
query = "Someone stole my phone on the train yesterday and I don't know what to do."
try:
    print("Retrieving context...")
    context = engine.retrieve_context(query)
    print(f"Context: {context}")
    print("Generating steps...")
    res = engine.generate_steps(query, context)
    print(res)
except Exception as e:
    import traceback
    traceback.print_exc()
