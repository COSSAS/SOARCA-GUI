import { Execution, Variables } from "@/types";
import { HttpMutationMethod, mutationToApi } from "./utils";

export const triggerPlaybookById = (
  playbookId: string,
  variables?: Variables,
) => {
  return mutationToApi<Execution>(
    HttpMutationMethod.POST,
    `/api/trigger/playbook/${playbookId}`,
    variables ?? {},
  );
};
