import { validate } from './validation';

export function getAPIVersion() {
    return validate({
        name:   "API_VERSION",
        value:  process.env.API_VERSION,
    });
}

export function getInfuraProjectId() {
    return validate({
        name:   "INFURA_PID",
        value:  process.env.INFURA_PID,
    });
}
