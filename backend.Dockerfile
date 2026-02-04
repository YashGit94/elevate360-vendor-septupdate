FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --only=production
COPY src/index.js ./src/index.js
EXPOSE 8080
CMD ["node", "src/index.js"]
