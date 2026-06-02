import apiClient from "./client";

const TOKEN_KEY = "token";

export async function login(email, password) {
  const response = await apiClient.post("/auth/login", {
    email,
    password,
  });

  const token = response.data.token;
  localStorage.setItem(TOKEN_KEY, token);

  return token;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}