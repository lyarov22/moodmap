from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from typing import List, Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import uvicorn

load_dotenv()

app = FastAPI(title="MoodMap API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/moodmap")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.moodmap
moods_collection = db.moods

# Pydantic models
class MoodRequest(BaseModel):
    mood: int = Field(..., ge=1, le=5, description="Mood level from 1 to 5")
    lat: float = Field(..., description="Latitude")
    lng: float = Field(..., description="Longitude")

class MoodResponse(BaseModel):
    success: bool

class MoodData(BaseModel):
    coords: dict
    mood: int
    ip: Optional[str] = None
    timestamp: Optional[datetime] = None

def get_client_ip(request: Request) -> str:
    """Get client IP address"""
    x_forwarded_for = request.headers.get('x-forwarded-for')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.client.host
    return ip

scheduler = AsyncIOScheduler()

async def seed_daily_data():
    try:
        print("[Seed] Generating daily test data (00:00)...")
        # Импортируем здесь чтобы избежать циклических зависимостей
        from seed_data import generate_test_data
        await generate_test_data()
        print("[Seed] Done")
    except Exception as e:
        print(f"[Seed] Failed: {e}")

@app.on_event("startup")
async def startup_db_client():
    try:
        await client.admin.command('ping')
        print("Connected to MongoDB!")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
    # Планировщик ежедневного джоба в 00:00 (UTC)
    try:
        scheduler.add_job(seed_daily_data, CronTrigger(hour=0, minute=0))
        scheduler.start()
        print("Scheduler started: daily seed at 00:00 UTC")
    except Exception as e:
        print(f"Failed to start scheduler: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection"""
    client.close()
    try:
        scheduler.shutdown(wait=False)
    except Exception:
        pass

@app.post("/api/mood", response_model=MoodResponse)
async def create_mood(mood_data: MoodRequest, request: Request):
    """Create a new mood entry with cooldown check"""
    try:
        client_ip = get_client_ip(request)
        
        # Check cooldown (3 hours)
        three_hours_ago = datetime.utcnow() - timedelta(hours=3)
        existing_mood = await moods_collection.find_one({
            "ip": client_ip,
            "timestamp": {"$gte": three_hours_ago}
        })
        
        if existing_mood:
            raise HTTPException(
                status_code=429, 
                detail="Вы можете оставить только одно настроение за 3 часа"
            )
        
        # Create new mood document
        mood_doc = {
            "ip": client_ip,
            "mood": mood_data.mood,
            "timestamp": datetime.utcnow(),
            "coords": {
                "lat": mood_data.lat,
                "lng": mood_data.lng
            }
        }
        
        result = await moods_collection.insert_one(mood_doc)
        
        if result.inserted_id:
            return MoodResponse(success=True)
        else:
            raise HTTPException(status_code=500, detail="Не удалось сохранить настроение")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/moods", response_model=List[MoodData])
async def get_moods():
    """Get mood entries from last 24 hours"""
    try:
        one_day_ago = datetime.utcnow() - timedelta(days=1)
        moods = []
        async for mood in moods_collection.find(
            {"timestamp": {"$gte": one_day_ago}}, 
            {"_id": 0}
        ):
            moods.append(MoodData(
                coords=mood["coords"],
                mood=mood["mood"],
                # ip=mood.get("ip"),
                ip="****",
                timestamp=mood.get("timestamp")
            ))
        return moods
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Не удалось получить настроения: {str(e)}")

@app.get("/")
async def root():
    return {"message": "MoodMap API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
