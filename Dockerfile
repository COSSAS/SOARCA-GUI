# Stage 1: Development environment
FROM node:24-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 2: Build for production
FROM development AS builder
COPY . .
RUN npm run build

# Stage 3: Production environment
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]