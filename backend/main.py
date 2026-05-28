import os
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends, HTTPException

ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

DEMO_TOKEN = os.getenv("DEMO_TOKEN", "demo-token-12345")
security = HTTPBearer()

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    if creds.credentials != DEMO_TOKEN:
        raise HTTPException(status_code=401, detail="Token inválido")
    return {"user": "demo"}