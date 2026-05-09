from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn

from rag_engine import get_rag_engine

app = FastAPI(title="QuangHung Mobile - RAG AI Service")

class ChatRequest(BaseModel):
    message: str
    userId: Optional[str] = None
    conversationId: Optional[str] = None
    history: Optional[List[Dict]] = []

class ChatResponse(BaseModel):
    response: str
    intent: Optional[str] = None

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        if not request.message:
            raise HTTPException(status_code=400, detail="Message is required")
            
        engine = get_rag_engine()
        answer = engine.process_chat(request.message, request.history)
        
        return ChatResponse(response=answer)
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/reload-vectorstore")
async def reload_vectorstore():
    try:
        engine = get_rag_engine()
        engine.reload_vectorstore()
        return {"status": "success", "message": "Đã đồng bộ lại dữ liệu RAG thành công"}
    except Exception as e:
        print(f"Error reloading vectorstore: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "RAG AI Service is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
