import { baseUrl } from "./apiConfig";

const defaultHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export const authApi = {
  login: (email: string, password: string) =>
    fetch(baseUrl + "/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
      headers: defaultHeaders,
    }).then((res) => res.json()),
  register: (name: string, email: string, password: string) =>
    fetch(baseUrl + "/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
      headers: defaultHeaders,
    }).then((res) => res.json()),
  getCurrentUser: () =>
    fetch(baseUrl + "/api/auth/profile", {
      method: "GET",
      headers: {
        ...defaultHeaders,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .catch(() => null),
  logout: () =>
    fetch(baseUrl + "/api/auth/logout", {
      method: "POST",
      headers: {
        ...defaultHeaders,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }),
};
