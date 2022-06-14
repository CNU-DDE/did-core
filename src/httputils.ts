import axios from "axios";
import * as broccoli from "src/config/broccoli.config";
import * as common from "src/config/common.config";

export function sendBroccoliGetRequest(path: string, accessToken: string) {
    return axios.get(`http://${broccoli.getHost()}:${broccoli.getPort()}/api/${common.getAPIVersion()}${path}`, {
        headers: {
            Cookie: "access_token=" + accessToken,
        },
    });
}
