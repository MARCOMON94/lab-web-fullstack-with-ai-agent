from fastapi import FastAPI
from pydantic import BaseModel
from langchain_core.messages import HumanMessage

from agente import agente


app = FastAPI(
    title="Asistente de Soporte con LangChain",
    description="API de chat con RAG, memoria, tools y LangGraph",
    version="1.0.0"
)


class MensajeRequest(BaseModel):
    session_id: str
    mensaje: str


@app.post("/chat")
def chat(request: MensajeRequest):
    config = {
        "configurable": {
            "thread_id": request.session_id
        }
    }

    resultado = agente.invoke(
        {
            "mensajes": [
                HumanMessage(content=request.mensaje)
            ]
        },
        config=config
    )

    return {
        "respuesta": resultado["mensajes"][-1].content
    }


@app.delete("/chat/{session_id}")
def limpiar_sesion(session_id: str):
    return {
        "mensaje": f"Sesión {session_id} cerrada"
    }
