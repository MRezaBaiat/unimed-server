FROM node:16.13.2 AS BUILD_IMAGE

WORKDIR '/dist'

COPY /package.json .
COPY /tsconfig.json .
COPY /yarn.lock .
COPY .env.stage.prd .
RUN yarn install
ARG CACHEBUST=1
RUN yarn upgrade matap-api

COPY src ./src

FROM node:16.13.2

WORKDIR '/app'

COPY --from=BUILD_IMAGE /dist/src ./src
COPY --from=BUILD_IMAGE /dist/.env.stage.prd .
COPY --from=BUILD_IMAGE /dist/node_modules ./node_modules
COPY --from=BUILD_IMAGE /dist/package.json .

EXPOSE 5000

CMD ["node","./src/main.js"]
