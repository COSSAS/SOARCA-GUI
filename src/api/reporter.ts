import { PlaybookExecutionReport } from "@/types";
import { fetchFromApi, SOARCA_URI } from "./utils";

export const getReporterState = () =>
  fetchFromApi<PlaybookExecutionReport[]>(`${SOARCA_URI}/reporter/`);

export const getReportOfExecutionById = (executionId: string) =>
  fetchFromApi<PlaybookExecutionReport>(
    `${SOARCA_URI}/reporter/${executionId}`,
  );
