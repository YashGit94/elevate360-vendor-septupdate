# Stage 1: Build Angular Frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Run Express Backend
FROM node:20-alpine
WORKDIR /app

# Copy backend dependencies and source
COPY package*.json ./
RUN npm install --only=production
COPY src/index.js ./src/
# Ensure your BigQuery keys are included if not using IAM roles
COPY src/keys.json ./src/ 

# Copy built Angular files to be served by Express
# Based on angular.json, the output path is dist/sitexx
COPY --from=build /app/dist/sitexx ./public

# Set Cloud Run environment variables
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "src/index.js"]
