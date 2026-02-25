import { PlaybookExecutionReport } from "@/types";
import { fetchFromApi } from "./utils";

export const getReporterState = () =>
  fetchFromApi<PlaybookExecutionReport[]>(`/api/reporter/`);

export const getReportOfExecutionById = (executionId: string) =>
  fetchFromApi<PlaybookExecutionReport>(`/api/reporter/${executionId}`);
