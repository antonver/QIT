from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime

# Определяем URL базы данных
def get_database_url():
    # Проверяем наличие DATABASE_URL (для Heroku)
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        # Heroku предоставляет URL, начинающийся с postgres://, но SQLAlchemy требует postgresql://
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        return database_url
    
    # Для локальной разработки используем SQLite
    return "sqlite:///./test.db"

# Создаем движок базы данных
engine = create_engine(
    get_database_url(),
    connect_args={"check_same_thread": False} if "sqlite" in get_database_url() else {}
)

# Создаем базовый класс для моделей
Base = declarative_base()

# Создаем класс сессии
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Определяем модель пользователя
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(Integer, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=True)
    language_code = Column(String, default="en")
    is_premium = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    profile_photo_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Определяем модель сессии
class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    answers = Column(JSON, default=list)
    aeon_answers = Column(JSON, default=dict)
    asked_questions = Column(JSON, default=list)
    current_question_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed = Column(Boolean, default=False)
    question_order = Column(JSON, default=list)
    last_activity = Column(DateTime, default=datetime.utcnow)

def create_tables():
    Base.metadata.create_all(bind=engine) 