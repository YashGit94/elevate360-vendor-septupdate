FROM node:20-alpine
WORKDIR /app

# Copy dependency files and install production-only dependencies
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copy the server source code and service account keys
COPY src/index.js ./src/index.js
COPY src/keys.json ./src/keys.json

# Expose the port defined in your index.js
EXPOSE 3001
CMD ["node", "src/index.js"]
