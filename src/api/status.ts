import { Status } from "@/types";
import { fetchFromApi, SOARCA_URI } from "./utils";

export const getPingStatus = async () => fetch(`${SOARCA_URI}/status/ping`);

export const getSystemStatus = async () =>
  fetchFromApi<Status>(`${SOARCA_URI}/status/`);
