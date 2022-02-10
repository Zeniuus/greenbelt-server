FROM node:16-alpine3.15

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY config/ ./config/
COPY src/ ./src/

CMD ["npm", "run", "cronjob"]
