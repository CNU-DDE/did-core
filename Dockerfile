# Dangling image for bundling
FROM node:16 AS bundler

LABEL description="Injik/did-core API server bundler"

WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build

# Actual output image
FROM node:16-slim

LABEL name="Haeram Kim"
LABEL email="haeram.kim1@gmail.com"
LABEL image_version="1.0.0"
LABEL app_version="1.0.0"
LABEL description="Injik/did-core API server image"

WORKDIR /etc/injik/didcore
COPY --from=bundler /usr/src/app/dist ./dist
COPY --from=bundler /usr/src/app/package*.json ./
COPY --from=bundler /usr/src/app/docker-entrypoint.sh ./
RUN npm install --only=prod

RUN adduser -u 5678 --disabled-password --gecos "" injik && chown -R injik /etc/injik/didcore
USER injik

EXPOSE 7771
ENTRYPOINT [ "/etc/injik/didcore/docker-entrypoint.sh" ]
