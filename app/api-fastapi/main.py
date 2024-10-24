from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_DB_USERNAME = os.getenv("MONGO_INITDB_ROOT_USERNAME")
MONGO_DB_PASSWORD = os.getenv("MONGO_INITDB_ROOT_PASSWORD")
MONGO_DB_NAME = os.getenv("MONGO_INITDB_DATABASE")

client = AsyncIOMotorClient(f"mongodb://{MONGO_DB_USERNAME}:{MONGO_DB_PASSWORD}@mongodb:27017/{MONGO_DB_NAME}?authSource=admin")
db = client.goalapp
collection = db.tasks

class Task(BaseModel):
    title: str

@app.post("/api/tasks")
async def create_task(task: Task):
    result = await collection.insert_one(task.dict())
    return {"id": str(result.inserted_id), "title": task.title}

@app.get("/api/tasks")
async def get_tasks():
    tasks = await collection.find().to_list(1000)
    return [{"id": str(task["_id"]), "title": task["title"]} for task in tasks]