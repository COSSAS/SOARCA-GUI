import { Playbook } from "@/types";
import {
  deleteToApi,
  fetchFromApi,
  HttpMutationMethod,
  mutationToApi,
} from "./utils";

export const getPlaybooks = () => fetchFromApi<Playbook[]>(`/api/playbook/`);

export const getPlaybookById = (playbookId: string) =>
  fetchFromApi<Playbook>(`/api/playbook/${playbookId}`);

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
