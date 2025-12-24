FROM node:23-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
RUN mkdir -p /app/www /tmp/nginx/client_temp /tmp/nginx/proxy_temp
COPY --from=build /app/dist /app/www
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
