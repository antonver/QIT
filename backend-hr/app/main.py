from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router, admin_router

app = FastAPI()

# Настройка CORS для разрешения запросов с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aeon-messenger.vercel.app",
        "https://qit-5mzhhnk1m-antonvers-projects.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(admin_router)