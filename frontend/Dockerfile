# Dev-mode image: runs the same Vite dev server the team already uses via
# `npm run dev`, just made reachable from outside the container. Not a
# production build/serve image (unrelated to the Vercel deploy in README
# section VI).
FROM node:22-alpine
WORKDIR /app

# Installed before the source is copied so this layer caches, and so the
# image's own Linux node_modules isn't overwritten by the later COPY . . —
# see docker-compose.yml's node_modules anonymous volume for the runtime half
# of this (it stops the host's Windows node_modules from shadowing this one).
COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5173

# --host 0.0.0.0 is added only here, at the container boundary, so running
# `npm run dev` directly on the host keeps its current localhost-only
# default unchanged - vite.config.js/package.json are untouched.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
