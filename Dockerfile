# Dangling image for bundling
FROM node:16 AS bundler

LABEL description="Injik/did-core API server bundler"

WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build

# Actual output image
FROM node:16

LABEL name="Haeram Kim"
LABEL email="haeram.kim1@gmail.com"
LABEL image_version="1.0.0"
LABEL app_version="1.0.0"
LABEL description="Injik/did-core API server image"

WORKDIR /opt
COPY --from=bundler /usr/src/app/dist/* ./
COPY --from=bundler /usr/src/app/package*.json ./
RUN npm install --only=prod

EXPOSE 7771
ENTRYPOINT [ "node", "index.js" ]
