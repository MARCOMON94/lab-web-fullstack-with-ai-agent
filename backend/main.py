import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from langchain_core.messages import HumanMessage
from pydantic import BaseModel

# Permite importar el agente desde backend/agent/agente.py
BASE_DIR = Path(__file__).resolve().parent
AGENT_DIR = BASE_DIR / "agent"
sys.path.append(str(AGENT_DIR))

from agente import agente

load_dotenv()

app = FastAPI(
    title="App Fullstack con Agente IA",
    description="API FastAPI con agente LangGraph, CORS, auth demo y streaming SSE",
    version="1.0.0"
)

ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEMO_TOKEN = os.getenv("DEMO_TOKEN", "demo-token-12345")
security = HTTPBearer()


def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    if creds.credentials != DEMO_TOKEN:
        raise HTTPException(status_code=401, detail="Token inválido")
    return {"user": "demo"}


class ChatInput(BaseModel):
    message: str
    session_id: str = "default"


@app.get("/")
def root():
    return {
        "message": "API funcionando",
        "routes": ["/api/chat", "/api/chat/stream"]
    }


@app.post("/api/chat")
def chat(body: ChatInput, user=Depends(get_current_user)):
    config = {
        "configurable": {
            "thread_id": body.session_id
        }
    }

    resultado = agente.invoke(
        {
            "mensajes": [
                HumanMessage(content=body.message)
            ]
        },
        config=config
    )

    return {
        "respuesta": resultado["mensajes"][-1].content
    }


@app.post("/api/chat/stream")
async def chat_stream(body: ChatInput, user=Depends(get_current_user)):
    async def generar():
        async for chunk in agente.astream(
            {
                "mensajes": [
                    HumanMessage(content=body.message)
                ]
            },
            config={
                "configurable": {
                    "thread_id": body.session_id
                }
            },
        ):
            if "mensajes" in chunk:
                content = chunk["mensajes"][-1].content
                if content:
                    safe = content.replace("\n", "\\n")
                    yield f"data: {safe}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generar(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        },
    )