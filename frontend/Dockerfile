FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --prefer-offline

COPY . .

EXPOSE 8180

# Run Expo web server
CMD ["npm", "run", "web", "--", "--port", "8180", "--non-interactive"]


