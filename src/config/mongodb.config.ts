export function getHost() {
    return process.env.MONGODB_HOST;
}

export function getPort() {
    return process.env.MONGODB_PORT;
}

export function getRootUser() {
    return process.env.MONGODB_ROOT_USER;
}

export function getRootPassword() {
    return process.env.MONGODB_ROOT_PASSWORD;
}

export function getUser() {
    return process.env.MONGODB_USER;
}

export function getPassword() {
    return process.env.MONGODB_PASSWORD;
}

export function getDatabase() {
    return process.env.MONGODB_DATABASE;
}

export function getURL() {
    return `mongodb://${getUser()}:${getPassword()}@${getHost()}:${getPort()}/${getDatabase()}`;
}
