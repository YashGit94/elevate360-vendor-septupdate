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

# Install only production dependencies for the backend
COPY package*.json ./
RUN npm install --only=production

# Copy backend source code and BigQuery keys
COPY src/index.js ./src/

# Copy built Angular files to the backend's public directory
# The path dist/sitexx is defined in your angular.json
COPY --from=build /app/dist/sitexx ./public

# Set Cloud Run defaults
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/index.js"]
