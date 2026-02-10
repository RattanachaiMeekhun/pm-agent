import os
from dotenv import load_dotenv

# Load variables from .env file into os.environ
load_dotenv()

# Access them using os.getenv
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Database URL
# Support both names during migration if needed, but prefer DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("URL_DATABASE")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL (or URL_DATABASE) is not set. Please check your .env file.")

if not ANTHROPIC_API_KEY:
    # Warning only for now, as user might not have set it yet
    print("Warning: ANTHROPIC_API_KEY is not set.")
