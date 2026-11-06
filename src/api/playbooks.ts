import { Playbook } from "@/types";
import {
  deleteToApi,
  fetchFromApi,
  HttpMutationMethod,
  mutationToApi,
} from "./utils";

/** SOARCA returns 0001-01-01T00:00:00Z for a validity date that was never set. */
const UNSET_DATE = "0001-01-01";

const dropUnsetDates = (playbook: Playbook): Playbook => {
  const next = { ...playbook };
  if (next.valid_from?.startsWith(UNSET_DATE)) delete next.valid_from;
  if (next.valid_until?.startsWith(UNSET_DATE)) delete next.valid_until;
  return next;
};

export const getPlaybooks = () =>
  fetchFromApi<Playbook[]>(`/api/playbook/`).then((playbooks) =>
    playbooks.map(dropUnsetDates),
  );

export const getPlaybookById = (playbookId: string) =>
  fetchFromApi<Playbook>(`/api/playbook/${playbookId}`).then(dropUnsetDates);

export const createPlaybook = (playbook: Partial<Playbook>) =>
  mutationToApi<Playbook>(HttpMutationMethod.POST, `/api/playbook/`, playbook);

export const updatePlaybook = (playbookId: string, patch: Partial<Playbook>) =>
  mutationToApi<Playbook>(
    HttpMutationMethod.PUT,
    `/api/playbook/${playbookId}`,
    patch,
  );

export const deletePlaybook = (playbookId: string) =>
  deleteToApi(`/api/playbook/${playbookId}`);
