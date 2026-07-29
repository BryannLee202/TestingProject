FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 5173
# --host so Vite listens on 0.0.0.0 inside the container, reachable via the
# port mapping in docker-compose.yml (default is localhost-only, which
# would be unreachable from outside the container).
CMD ["npm", "run", "dev", "--", "--host"]
