import asyncio
import random
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Координаты Алматы (центр города)
ALMATY_CENTER_LAT = 43.1620
ALMATY_CENTER_LNG = 76.5412

# Радиус для генерации случайных координат (примерно 10 км)
RADIUS_DEGREES = 0.1

async def generate_test_data():
    """Генерирует 100 тестовых записей настроений в пределах Алматы"""
    
    # Подключение к MongoDB
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/moodmap")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.moodmap
    moods_collection = db.moods
    
    print("Подключение к базе данных...")
    
    # Очищаем существующие данные (опционально)
    # await moods_collection.delete_many({})
    # print("Очищены существующие данные")
    
    # Генерируем 100 записей
    test_moods = []
    base_time = datetime.utcnow()
    
    for i in range(100):
        # Генерируем случайные координаты в пределах Алматы
        lat = ALMATY_CENTER_LAT + random.uniform(-RADIUS_DEGREES, RADIUS_DEGREES)
        lng = ALMATY_CENTER_LNG + random.uniform(-RADIUS_DEGREES, RADIUS_DEGREES)
        
        # Генерируем случайное настроение (1-5)
        mood = random.randint(1, 5)
        
        # Генерируем случайное время в последние 24 часа
        random_hours_ago = random.randint(0, 24)
        timestamp = base_time - timedelta(hours=random_hours_ago)
        
        # Фиксированный IP для имитации сервисного трафика
        ip = "0.0.0.0"
        
        mood_doc = {
            "ip": ip,
            "mood": mood,
            "timestamp": timestamp,
            "coords": {
                "lat": round(lat, 6),
                "lng": round(lng, 6)
            }
        }
        
        test_moods.append(mood_doc)
    
    # Вставляем все записи в базу данных
    print(f"Вставляем {len(test_moods)} записей в базу данных...")
    result = await moods_collection.insert_many(test_moods)
    
    print(f"Успешно добавлено {len(result.inserted_ids)} записей!")
    
    # Показываем статистику
    total_count = await moods_collection.count_documents({})
    recent_count = await moods_collection.count_documents({
        "timestamp": {"$gte": datetime.utcnow() - timedelta(days=1)}
    })
    
    print(f"Всего записей в базе: {total_count}")
    print(f"Записей за последние 24 часа: {recent_count}")
    
    # Статистика по настроениям
    mood_stats = {}
    for mood_level in range(1, 6):
        count = await moods_collection.count_documents({"mood": mood_level})
        mood_stats[mood_level] = count
        print(f"Настроение {mood_level}: {count} записей")
    
    client.close()
    print("Готово!")

if __name__ == "__main__":
    asyncio.run(generate_test_data())
