FROM node:14.17.1-slim

WORKDIR /src

COPY package.json /src/

RUN npm install

COPY . .

EXPOSE 80

CMD ["npm", "run", "dev"]