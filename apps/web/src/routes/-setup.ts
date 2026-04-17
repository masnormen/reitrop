import { client } from "@repo/sdk/client";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// Set Dayjs locale and timezone

// import "dayjs/locale/id";
// dayjs.locale("id");
const DEFAULT_TIMEZONE = "Asia/Jakarta";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(DEFAULT_TIMEZONE);

// Configure SDK client

client.setConfig({
  baseURL: import.meta.env.VITE_API_URL,
});
