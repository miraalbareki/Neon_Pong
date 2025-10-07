# Frontend builder stage
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY ./Front-end/package*.json ./
RUN npm install --no-audit --no-fund
COPY ./Front-end/ ./
RUN npm run build

# Production nginx stage
FROM nginx:stable

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx config and custom mime types
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/mime.types /etc/nginx/mime.types

# Copy certificates
COPY ./certs /etc/nginx/certs

# Copy frontend build from builder stage
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
