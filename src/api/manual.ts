import {
  Execution,
  InteractionCommandData,
  ManualOutArgsUpdatePayload,
} from "@/types";
import { fetchFromApi, HttpMutationMethod, mutationToApi } from "./utils";

export const putStepActionResult = (
  executionId: string,
  stepExecutionId: string,
  data: ManualOutArgsUpdatePayload,
) =>
  mutationToApi<Execution>(
    HttpMutationMethod.PUT,
    `/api/manual/${executionId}/${stepExecutionId}`,
    data,
  );

export const getStepManualData = (
  executionId: string,
  stepExecutionId: string,
) =>
  fetchFromApi<InteractionCommandData>(
    `/api/manual/${executionId}/${stepExecutionId}`,
  );
