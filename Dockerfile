FROM node:18.14

ENV NODE_ENV production

COPY ./src /app/src/
COPY package*.json /app

WORKDIR /app

RUN npm ci

EXPOSE 3000

CMD ["npm", "start"]