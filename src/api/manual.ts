import {
  RunStarted,
  InteractionCommandData,
  ManualOutArgsUpdatePayload,
} from "@/types";
import { fetchFromApi, HttpMutationMethod, mutationToApi } from "./utils";

export const putStepActionResult = (
  runId: string,
  stepRunId: string,
  data: ManualOutArgsUpdatePayload,
) =>
  mutationToApi<RunStarted>(
    HttpMutationMethod.PUT,
    `/api/manual/${runId}/${stepRunId}`,
    data,
  );

export const getStepManualData = (runId: string, stepRunId: string) =>
  fetchFromApi<InteractionCommandData>(`/api/manual/${runId}/${stepRunId}`);
