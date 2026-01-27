import { jwtDecode } from "jwt-decode";

export function setToken(access, refresh) {
    localStorage.setItem("access", access);
    if (refresh) {
        localStorage.setItem("refresh", refresh);
    }
    const decoded = jwtDecode(access);
    localStorage.setItem(
        "user",
        JSON.stringify({
            username: decoded.username,
        })
    );
}

export function getToken() {
    return localStorage.getItem("access");
}

export function getUser() {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        console.log("DECODED TOKEN 👉", decoded);
        return {
            username: decoded.username,
        };
    } catch {
        return null;
    }
}

export function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
}

export function isLoggedIn() {
    return !!getToken();
}