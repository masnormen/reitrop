import { client } from "@repo/sdk/client";
import { zErrorResponse } from "@repo/sdk/zod";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { SESSION_JWT_STORAGE_KEY } from "@/atoms/index";

// Set Dayjs locale and timezone

// import "dayjs/locale/id";
// dayjs.locale("id");
const DEFAULT_TIMEZONE = "Asia/Jakarta";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.tz.setDefault(DEFAULT_TIMEZONE);

// Configure SDK client

client.setConfig({
  baseURL: import.meta.env.VITE_API_URL,
});

client.instance.interceptors.request.use((config) => {
  const sessionJwt = JSON.parse(localStorage.getItem(SESSION_JWT_STORAGE_KEY) || "null");
  if (sessionJwt) {
    config.headers.Authorization = `Bearer ${sessionJwt}`;
  }
  return config;
});

client.instance.interceptors.response.use(undefined, (error) => {
  const parsedError = zErrorResponse.safeParse(error.response?.data);
  if (parsedError.success && parsedError.data.errorCode === "SESSION_EXPIRED") {
    localStorage.removeItem(SESSION_JWT_STORAGE_KEY);
    window.location.href = "/"; // Redirect to home page on session expiration
  }
});
