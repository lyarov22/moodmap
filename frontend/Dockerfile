FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --prefer-offline

COPY . .

# Собираем статику (Next.js, Expo web и т.п.)
RUN npm run web:build

# Устанавливаем легкий сервер для статики
RUN npm install -g serve

EXPOSE 8180

CMD ["serve", "-s", "web-build", "-l", "8180"]
