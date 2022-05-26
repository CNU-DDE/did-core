# Injik/did-core

Microservice sub-repository for injik/did-core

## Prerequisite

To develop, `npm` must be installed on your development machine.

Also, *project id* of [Infura](https://infura.io/)
is needed for both developing and running it.

You must do `export INFURA_PID=${PROJECT_ID}` to run this.

## Code development

1. Install dependencies:

```bash
npm install; git restore package*.json
```

2. Build source

```bash
npm run build
```

3. Build and run

```bash
npm run start
```

## Usage

As Injik/did-core is designed to use as a Kubernetes pod,
it's packaged as a Docker image.

You can find and use it in [Docker hub](https://hub.docker.com/r/haeramkeem/did-core)

Here's example of how to run a container:

```bash
docker run -d \
-p 60071:7771 \
-h 0.0.0.0 \
-e INFURA_PID=${YOUR_INFURA_PROJECT_ID} \
haeramkeem/did-core
```
