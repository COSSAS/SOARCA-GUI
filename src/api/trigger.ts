import { Execution } from "@/types";
import { HttpMutationMethod, mutationToApi } from "./utils";

export const triggerPlaybookById = (playbookId: string) => {
  return mutationToApi<Execution>(
    HttpMutationMethod.POST,
    `/api/trigger/playbook/${playbookId}`,
    {},
  );
};
