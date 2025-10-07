# MoodMap

Приложение для отображения настроения пользователей на карте мира.

## Структура проекта

```
moodmap/
├── backend/          # FastAPI backend
└── frontend/         # React Native + Expo frontend
```

## Быстрый старт

### Backend

1. Перейдите в папку backend:
```bash
cd backend
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Создайте файл `.env`:
```bash
cp env.example .env
```

4. Настройте MongoDB URL в `.env`

5. Запустите сервер:
```bash
uvicorn main:app --reload
```

### Frontend

1. Перейдите в папку frontend:
```bash
cd frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте Mapbox токен в `App.js`

4. Запустите приложение:
```bash
npm start
```

## Технологии

### Backend
- FastAPI (Python 3.11+)
- MongoDB Atlas
- Motor (асинхронный MongoDB драйвер)
- Docker поддержка

### Frontend
- React Native + Expo
- Mapbox Maps
- Expo Location
- React Native Web

## API Endpoints

- `POST /api/mood` - Создать метку настроения
- `GET /api/moods` - Получить все метки
- `GET /health` - Проверка здоровья

## Требования

- MongoDB Atlas аккаунт
- Mapbox аккаунт (бесплатный план)
- Node.js 18+
- Python 3.11+
