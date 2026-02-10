import { Status } from "@/types";
import { fetchFromApi } from "./utils";

export const getPingStatus = async () => fetch(`/api/status/ping`);

export const getSystemStatus = async () => fetchFromApi<Status>(`/api/status/`);
