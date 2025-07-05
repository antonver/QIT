from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone
import json
import os

class Answer(BaseModel):
    id: int
    text: str

class Question(BaseModel):
    id: int
    text: str
    answers: List[Answer]

class Test(BaseModel):
    id: int
    title: str
    questions: List[Question]

class UserAnswer(BaseModel):
    question_id: int
    answer_id: int

class Result(BaseModel):
    id: int
    test_id: int
    score: int
    details: Optional[str] = None

Base = declarative_base()

class Session(Base):
    __tablename__ = "sessions"
    
    token = Column(String, primary_key=True)
    answers = Column(Text, default='[]')
    aeon_answers = Column(Text, default='{}')
    asked_questions = Column(Text, default='[]')
    current_question_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed = Column(Boolean, default=False)
    question_order = Column(Text, default='[]')
    last_activity = Column(DateTime, default=lambda: datetime.now(timezone.utc))

# Создаем подключение к базе данных
def get_database_url():
    """Получает URL базы данных из переменных окружения"""
    database_url = os.getenv('DATABASE_URL')
    if database_url and database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    return database_url or 'sqlite:///./test.db'

engine = create_engine(get_database_url())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Создаем таблицы
def create_tables():
    Base.metadata.create_all(bind=engine)

# Функция для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()