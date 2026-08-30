import { RunStarted, Variables } from "@/types";
import { HttpMutationMethod, mutationToApi } from "./utils";

export const triggerPlaybookById = (
  playbookId: string,
  variables?: Variables,
) => {
  return mutationToApi<RunStarted>(
    HttpMutationMethod.POST,
    `/api/trigger/playbook/${playbookId}`,
    variables ?? {},
  );
};
