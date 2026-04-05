from dotenv import load_dotenv
import os

load_dotenv()


def get(key:str) -> str :
    val=os.getenv(key)
    if not val:
        raise ValueError(f"Missing environment variable:{key}")
    return val



DATABASE_URL=get("DATABASE_URL")
GEMINI_API_KEY = get("GEMINI_API_KEY")
SECRET_KEY     = get("SECRET_KEY")
ALGORITHM      = "HS256"
TOKEN_EXPIRE   = 2