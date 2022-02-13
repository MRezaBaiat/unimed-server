FROM node:16.13.2 AS BUILD_IMAGE

WORKDIR '/dist'

COPY /package.json .
COPY /tsconfig.json .
COPY /yarn.lock .
RUN git config --global user.name rezabaiat
RUN git config --global user.password 1Professional1
RUN yarn install --production
ARG CACHEBUST=1
RUN yarn upgrade api

COPY src ./src

FROM node:16.13.2

WORKDIR '/app'

COPY --from=BUILD_IMAGE /dist/src ./src
COPY --from=BUILD_IMAGE /dist/node_modules ./node_modules
COPY --from=BUILD_IMAGE /dist/package.json .

EXPOSE 5000

CMD ["node","./src/main.js"]
