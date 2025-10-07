FROM node:20-alpine
WORKDIR /app
COPY dist ./dist
RUN npm install -g serve
EXPOSE 8180
CMD ["serve", "-s", "dist", "-l", "8180"]
