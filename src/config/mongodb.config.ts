import { validate } from './validation';

export function getHost() {
    return validate({
        name:   "MONGODB_HOST",
        value:  process.env.MONGODB_HOST,
    });
}

export function getPort() {
    return validate({
        name:   "MONGODB_PORT",
        value:  process.env.MONGODB_PORT,
    });
}

export function getRootUser() {
    return validate({
        name:   "MONGODB_ROOT_USER",
        value:  process.env.MONGODB_ROOT_USER,
    });
}

export function getRootPassword() {
    return validate({
        name:   "MONGODB_ROOT_PASSWORD",
        value:  process.env.MONGODB_ROOT_PASSWORD,
    });
}

export function getUser() {
    return validate({
        name:   "MONGODB_USER",
        value:  process.env.MONGODB_USER,
    });
}

export function getPassword() {
    return validate({
        name:   "MONGODB_PASSWORD",
        value:  process.env.MONGODB_PASSWORD,
    });
}

export function getDatabase() {
    return validate({
        name:   "MONGODB_DATABASE",
        value:  process.env.MONGODB_DATABASE,
    });
}

export function getURL() {
    return `mongodb://${getUser()}:${getPassword()}@${getHost()}:${getPort()}/${getDatabase()}`;
}
