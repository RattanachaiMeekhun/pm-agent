from contextlib import asynccontextmanager
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver 
from psycopg_pool import AsyncConnectionPool
from app.config import settings

@asynccontextmanager
async def get_checkpointer():
    """
    Context manager to provide a Postgres checkpointer.
    """
    if not settings.SQLALCHEMY_DATABASE_URI:
        raise ValueError("DATABASE_URL is not set in .env")

    # ใช้ AsyncConnectionPool จาก psycopg_pool
    # kwargs={"autocommit": True} จำเป็นสำหรับบาง operation
    async with AsyncConnectionPool(
        conninfo=settings.SQLALCHEMY_DATABASE_URI,
        max_size=20,
        kwargs={"autocommit": True} 
    ) as pool:
        
        # สร้าง Checkpointer
        checkpointer = AsyncPostgresSaver(pool)
        
        # *** สำคัญ: ต้องสั่ง setup เพื่อสร้างตารางใน DB ครั้งแรก ***
        await checkpointer.setup()
        
        yield checkpointer