# Stage 1: Build the Angular application
FROM node:20-alpine AS build-step
WORKDIR /app

# Copy dependency files first to leverage Docker cache
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the project for production as defined in package.json
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
# Copy the built artifacts from the 'dist/sitexx' directory defined in angular.json
COPY --from=build-step /app/dist/sitexx /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
