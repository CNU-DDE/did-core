import axios from "axios";

export function sendBroccoliGetRequest(path: string, accessToken: string) {
    return axios.get("http://localhost:60072/api/v0" + path, {
        headers: {
            Cookie: "access_token=" + accessToken,
        },
    });
}
