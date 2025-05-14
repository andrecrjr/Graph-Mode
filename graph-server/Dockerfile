FROM node:22-alpine

WORKDIR /server

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

EXPOSE 3001

CMD ["pnpm", "start:dev"]