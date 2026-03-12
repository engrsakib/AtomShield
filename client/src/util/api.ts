import Cookies from "js-cookie";

export async function api(
  path: string,
  options: RequestInit = {}
) {
  // 🔥 Read token from localStorage
  const accessToken =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const refreshToken =
    typeof window !== "undefined"
      ? localStorage.getItem("refresh_token")
      : null;

  // 🔥 Merge headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
    "x-refresh-token": refreshToken || "",
  };

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // allows cookie but not required
  };

  // auto stringify
  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(path, config);
  return res.json();
}
