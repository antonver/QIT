from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router, admin_router
from app.db_models import create_tables

app = FastAPI()

# Инициализируем базу данных при старте
@app.on_event("startup")
async def startup_event():
    create_tables()

# Настройка CORS для разрешения запросов с фронтенда
origins = [
    "https://aeon-messenger.vercel.app",
    "https://qit-5mzhhnk1m-antonvers-projects.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://aeon-hr-fixed-backend-540e49434c71.herokuapp.com",
    # Добавляем домен без протокола для большей гибкости
    "aeon-hr-fixed-backend-540e49434c71.herokuapp.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.herokuapp\.com",  # Разрешаем все поддомены Heroku
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],
    expose_headers=["*"],
    max_age=600,  # Кэшировать preflight ответы на 10 минут
)

# Добавляем роутеры
app.include_router(router)
app.include_router(admin_router)