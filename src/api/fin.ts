import { Fin, FinListResponse } from "@/types";
import { fetchFromApi } from "./utils";

export const getFins = async (): Promise<Fin[]> => {
  const response = await fetchFromApi<FinListResponse>(`/api/fin/`);
  return response.fins;
};

export const getFinById = (finId: string) =>
  fetchFromApi<Fin>(`/api/fin/${finId}`);
