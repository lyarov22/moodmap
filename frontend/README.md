# MoodMap Frontend

React Native + Expo приложение для MoodMap.

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `env.example`:
```bash
cp env.example .env
```

3. Настройте переменные в `.env`:
```
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token_here
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Запуск

### Локально
```bash
npm start
```

### Web
```bash
npm run web
```

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

## Функции

- Интерактивная карта с Mapbox
- 5 кнопок настроения (😡 😞 😐 🙂 😃)
- Автоматическое получение геолокации
- Отображение меток настроения на карте
- Цветовая индикация настроения
- Поддержка web через react-native-web

## Настройка

1. Получите бесплатный токен Mapbox на https://account.mapbox.com/
2. Создайте `.env` файл с вашими токенами (EXPO_PUBLIC_*)
3. Убедитесь, что backend запущен на порту 8000
