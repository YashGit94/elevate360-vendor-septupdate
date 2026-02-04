FROM node:20-alpine
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copy only the server source code
COPY src/index.js ./src/index.js

# Expose 8080 for Cloud Run
EXPOSE 8080

CMD ["node", "src/index.js"]
