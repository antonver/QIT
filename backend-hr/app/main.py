from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api import router, admin_router
from app.db_models import create_tables
from fastapi.responses import JSONResponse

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
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=600,  # Кэшировать preflight ответы на 10 минут
)

@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        response = JSONResponse(
            status_code=200,
            content={"message": "OK"}
        )
        origin = request.headers.get("Origin")
        if origin in origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Max-Age"] = "600"
        return response
    
    response = await call_next(request)
    origin = request.headers.get("Origin")
    if origin in origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# Добавляем роутеры
app.include_router(router)
app.include_router(admin_router)