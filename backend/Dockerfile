FROM node:20.11-alpine3.19

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

USER node

CMD ["node", "index.js"]
