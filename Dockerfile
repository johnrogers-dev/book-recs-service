# first stage builds the app
FROM node:10 as ts-builder

# Create app directory
WORKDIR /usr/src/book-recs-service

COPY . .

RUN npm install
RUN npm run clean
RUN npm run build

# second stage creates production image
FROM node:10 as book-recs-service
WORKDIR /usr/src/grid-edge-agent
COPY --from=ts-builder ./usr/src/book-recs-service/build ./build
COPY --from=ts-builder ./usr/src/book-recs-service/.env ./
COPY --from=ts-builder ./usr/src/book-recs-service/logs ./logs
COPY package* ./
RUN npm install --production
EXPOSE 3000
CMD npm run prod