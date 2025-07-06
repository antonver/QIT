from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router, admin_router, init_database

app = FastAPI()

# Инициализируем базу данных при старте
@app.on_event("startup")
async def startup_event():
    init_database()

# Настройка CORS для разрешения запросов с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aeon-messenger.vercel.app",
        "https://qit-5mzhhnk1m-antonvers-projects.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://aeon-hr-fixed-backend-540e49434c71.herokuapp.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(admin_router)