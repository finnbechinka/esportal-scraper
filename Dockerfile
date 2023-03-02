FROM node:18.14 as builder

WORKDIR /usr/app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:18.14

ENV NODE_ENV production

WORKDIR /usr/app

COPY package*.json .

RUN npm install --production

COPY --from=builder /usr/app/dist ./dist
COPY --from=builder /usr/app/src/misc ./src/misc

EXPOSE 3000

CMD node dist/server.js