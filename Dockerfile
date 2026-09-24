# Install dependencies and build the application
FROM node:24-alpine AS builder
RUN apk add --no-cache git
WORKDIR /app
ARG VITE_APP_VERSION=development
ENV VITE_APP_VERSION=${VITE_APP_VERSION}
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && rm -rf dist/cyclonedx

# Serve with nginx
FROM nginx:alpine AS production
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8081
CMD ["nginx", "-g", "daemon off;"]