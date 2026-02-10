import os
from dotenv import load_dotenv # <--- เพิ่มบรรทัดนี้

# โหลด .env ทันทีที่ไฟล์นี้ทำงาน
load_dotenv()

from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.chat_models import ChatOllama

def get_llm():
    """
    Factory function to initialize the LLM based on environment variables.
    """
    provider = os.getenv("LLM_PROVIDER", "openai").lower()
    model_name = os.getenv("LLM_MODEL_NAME", "gpt-4o")
    api_key = os.getenv("LLM_API_KEY")
    base_url = os.getenv("LLM_BASE_URL") # ใช้สำหรับ DeepSeek หรือ Local API

    if provider == "openai":
        return ChatOpenAI(
            model=model_name, 
            api_key=api_key,
            temperature=0.7
        )
    
    elif provider == "openrouter":
        return ChatOpenAI(
            api_key=api_key,
            base_url=base_url or "https://openrouter.ai/api/v1",
            temperature=0.7
        )
    
    elif provider == "deepseek":
        # DeepSeek ใช้ Client เดียวกับ OpenAI แต่เปลี่ยน Base URL
        return ChatOpenAI(
            api_key=api_key,
            base_url=base_url or "https://api.deepseek.com",
            temperature=0.7
        )

    elif provider == "anthropic":
        return ChatAnthropic(
            model=model_name, 
            api_key=api_key,
            temperature=0.7
        )
    
    elif provider == "google":
        return ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=api_key,
            temperature=0.7
        )

    elif provider == "ollama":
        # สำหรับรัน Local Model
        return ChatOllama(
            model=model_name,
            base_url=base_url or "http://localhost:11434",
            temperature=0.7
        )
    
    else:
        raise ValueError(f"Unsupported LLM_PROVIDER: {provider}")