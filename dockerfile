


FROM node:22-alpine

WORKDIR /user/src/app

COPY package*.json ./

RUN ["npm", 'install']

COPY . .

CMD [ "npm", "run", "dev" ]