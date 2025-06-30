from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from .config import settings
from .models import Base

# Create database engine
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables
Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    """
    Provides a database session for each request.
    Automatically closes the session when done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()