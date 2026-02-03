import { Execution, ManualOutArgsUpdatePayload } from "@/types";
import { HttpMutationMethod, mutationToApi, SOARCA_URI } from "./utils";

export const postStepActionResult = (data: ManualOutArgsUpdatePayload) =>
  mutationToApi<Execution>(
    HttpMutationMethod.POST,
    `${SOARCA_URI}/manual/continue`,
    data,
  );
