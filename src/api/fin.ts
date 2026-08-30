import { Fin, FinListResponse } from "@/types";
import { deleteToApi, fetchFromApi } from "./utils";

export const getFins = async (): Promise<Fin[]> => {
  const response = await fetchFromApi<FinListResponse>(`/api/fin/`);
  return response.fins;
};

export const getFinById = (finId: string) =>
  fetchFromApi<Fin>(`/api/fin/${finId}`);

export const deleteFin = (finId: string) =>
  deleteToApi(`/api/fin/${finId}`);
