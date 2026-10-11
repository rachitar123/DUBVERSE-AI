import asyncio
from concurrent.futures import ThreadPoolExecutor
from app.database import SessionLocal
from app.services.dubbing_engine import process_project_pipeline

executor = ThreadPoolExecutor(max_workers=4)

def enqueue_dubbing_task(project_id: int):
    """Enqueues a project dubbing task into the background worker pool."""
    executor.submit(process_project_pipeline, project_id, SessionLocal)
