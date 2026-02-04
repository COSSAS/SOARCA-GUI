import { Execution } from "@/types";
import { HttpMutationMethod, mutationToApi, SOARCA_URI } from "./utils";

export const triggerPlaybookById = (playbookId: string) => {
  return mutationToApi<Execution>(
    HttpMutationMethod.POST,
    `${SOARCA_URI}/trigger/playbook/${playbookId}`,
    {},
  );
};
