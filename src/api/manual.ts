import {
  Execution,
  InteractionCommandData,
  ManualOutArgsUpdatePayload,
} from "@/types";
import { fetchFromApi, HttpMutationMethod, mutationToApi } from "./utils";

export const postStepActionResult = (data: ManualOutArgsUpdatePayload) =>
  mutationToApi<Execution>(
    HttpMutationMethod.POST,
    `/api/manual/continue`,
    data,
  );

export const getStepManualData = (executionId: string, stepId: string) =>
  fetchFromApi<InteractionCommandData>(`/api/manual/${executionId}/${stepId}`);
