import { $el } from "../../scripts/ui.js";
import { api } from "../../scripts/api.js";

const DEBUG = true;
export function debug(data) {
    if (DEBUG) {
        api.fetchApi(_endpoint("debug"), {
            method: "POST", 
            body: JSON.stringify(data)
        });
    }
}

const author = "jupo";
const packageName = "JoinPrompt";

export function _name(name) {
    return `${author}.${packageName}.${name}`;
}

export function _endpoint(url) {
    return `/${author}/${packageName}/${url}`;
}

export async function api_get(url) {
    const res = await api.fetchApi(_endpoint(url));
    const result = await res.json();
    return result;
}

export async function api_post(url, options) {
    const body = {
        method: "POST", 
        body: JSON.stringify(options)
    };
    const res = await api.fetchApi(_endpoint(url), body);
    const result = await res.json();
    return result;
}

export function addStylesheet(url) {
    if (url.endsWith(".js")) {
        url = url.substr(0, url.length - 2) + "css";
    }
    $el("link", {
        parent: document.head, 
        rel: "stylesheet", 
        type: "text/css", 
        href: url.startsWith("http") ? url: getUrl(url), 
    });
}

