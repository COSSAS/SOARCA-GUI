import { Execution, ManualOutArgsUpdatePayload } from "@/types";
import { HttpMutationMethod, mutationToApi } from "./utils";

export const postStepActionResult = (data: ManualOutArgsUpdatePayload) =>
  mutationToApi<Execution>(
    HttpMutationMethod.POST,
    `/api/manual/continue`,
    data,
  );
