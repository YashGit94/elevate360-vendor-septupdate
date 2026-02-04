FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --only=production
COPY src/index.js ./src/index.js
# REMOVE THIS LINE: COPY src/keys.json ./src/keys.json
EXPOSE 8080
CMD ["node", "src/index.js"]
