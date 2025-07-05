from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router, admin_router
from app.models import create_tables

app = FastAPI()

# Добавляем CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создаем таблицы при запуске
create_tables()

# Подключаем роутеры
app.include_router(router)
app.include_router(admin_router)