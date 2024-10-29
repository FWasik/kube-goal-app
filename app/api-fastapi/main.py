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

DATABASE_URL = os.getenv("DATABASE_URL")
DATABASE_NAME = os.getenv("MONGO_INITDB_DATABASE")

client = AsyncIOMotorClient(DATABASE_URL)
db = client[DATABASE_NAME]
collection = db.goals

class Goal(BaseModel):
    title: str

@app.post("/api/goals")
async def create_goal(goal: Goal):
    result = await collection.insert_one(goal.dict())
    return {"id": str(result.inserted_id), "title": goal.title}

@app.get("/api/goals")
async def get_goals():
    goals = await collection.find().to_list(1000)
    return [{"id": str(goal["_id"]), "title": goal["title"]} for goal in goals]

@app.delete("/api/goals/{goal_id}")
async def delete_goal(goal_id: str):
    result = await collection.delete_one({"_id": ObjectId(goal_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"status": "Goal deleted successfully"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}