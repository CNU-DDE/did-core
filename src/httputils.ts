import axios from "axios";
import Env from "./config/env.config";
import Const from "./config/const.config";

export function sendBroccoliGetRequest(path: string, accessToken: string) {
    return axios.get(`http://${Env.get('broccoli.host')}:${Env.get('broccoli.port')}/api/${Const.API_VERSION}${path}`, {
        headers: {
            Cookie: "access_token=" + accessToken,
        },
    });
}
