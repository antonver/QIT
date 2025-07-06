from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api import router, admin_router
from app.db_models import create_tables, Base, engine
from fastapi.responses import JSONResponse
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Инициализируем базу данных при старте
@app.on_event("startup")
async def startup_event():
    logger.info("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

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
    allow_origins=["*"],  # Временно разрешаем все домены для отладки
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=600,  # Кэшировать preflight ответы на 10 минут
)

@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request headers: {request.headers}")
    
    if request.method == "OPTIONS":
        logger.info("Processing OPTIONS request")
        response = JSONResponse(
            status_code=200,
            content={"message": "OK"}
        )
        origin = request.headers.get("Origin")
        logger.info(f"Origin header: {origin}")
        
        # Временно разрешаем все домены для отладки
        response.headers["Access-Control-Allow-Origin"] = origin or "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "600"
        
        logger.info(f"Response headers: {response.headers}")
        return response
    
    response = await call_next(request)
    origin = request.headers.get("Origin")
    
    # Временно разрешаем все домены для отладки
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    
    logger.info(f"Response status code: {response.status_code}")
    logger.info(f"Response headers: {response.headers}")
    return response

# Добавляем роутеры
app.include_router(router)
app.include_router(admin_router)