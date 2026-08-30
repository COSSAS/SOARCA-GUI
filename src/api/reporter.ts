import { PlaybookRunReport } from "@/types";
import { fetchFromApi } from "./utils";

export const getReporterState = () =>
  fetchFromApi<PlaybookRunReport[]>(`/api/reporter/`);

export const getReportOfExecutionById = (runId: string) =>
  fetchFromApi<PlaybookRunReport>(`/api/reporter/${runId}`);
