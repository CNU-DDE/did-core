import { validate } from './validation';

export function getHost() {
    return validate({
        name:   "BROCCOLI_HOST",
        value:  process.env.BROCCOLI_HOST,
    });
}

export function getPort() {
    return validate({
        name:   "BROCCOLI_PORT",
        value:  process.env.BROCCOLI_PORT
    });
}
