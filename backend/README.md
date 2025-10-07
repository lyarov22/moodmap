# MoodMap Backend

FastAPI backend для MoodMap приложения.

## Установка

1. Установите зависимости:
```bash
pip install -r requirements.txt
```

2. Создайте файл `.env` на основе `env.example`:
```bash
cp env.example .env
```

3. Настройте MongoDB URL в `.env` файле.

## Запуск

### Локально
```bash
uvicorn main:app --reload
```

### Docker
```bash
docker-compose up --build
```

## API Endpoints

- `POST /api/mood` - Создать новую метку настроения
- `GET /api/moods` - Получить все метки настроения
- `GET /health` - Проверка здоровья сервиса

## Структура данных

```json
{
  "_id": "ObjectId",
  "ip": "string",
  "mood": 1-5,
  "timestamp": "ISODate",
  "coords": {
    "lat": "float",
    "lng": "float"
  }
}
```
