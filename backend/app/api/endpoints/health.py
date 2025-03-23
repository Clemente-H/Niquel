from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter()

@router.get("/")
def health_check():
    """
    Basic Endpoint to check if the API is working
    """
    return {"status": "ok", "message": "API is running fine"}

@router.get("/db")
def database_health_check(db: Session = Depends(get_db)):
    """
    Endpoint to check the database connection
    """
    try:
        # Try to execute a simple query to verify that the DB is working
        db.execute("SELECT 1")
        return {"status": "ok", "message": "Connection to the database is working"}
    except Exception as e:
        return {"status": "error", "message": f"Error in DB connetion: {str(e)}"}