import { Playbook } from "@/types";
import {
  deleteToApi,
  fetchFromApi,
  HttpMutationMethod,
  mutationToApi,
  SOARCA_URI,
} from "./utils";

export const getPlaybooks = () =>
  fetchFromApi<Playbook[]>(`${SOARCA_URI}/playbook/`);

export const getPlaybookById = (playbookId: string) =>
  fetchFromApi<Playbook>(`${SOARCA_URI}/playbook/${playbookId}`);

export const createPlaybook = (playbook: Partial<Playbook>) =>
  mutationToApi<Playbook>(
    HttpMutationMethod.POST,
    `${SOARCA_URI}/playbook/`,
    playbook,
  );

export const updatePlaybook = (playbookId: string, patch: Partial<Playbook>) =>
  mutationToApi<Playbook>(
    HttpMutationMethod.PUT,
    `${SOARCA_URI}/playbook/${playbookId}`,
    patch,
  );

export const deletePlaybook = (playbookId: string) =>
  deleteToApi(`${SOARCA_URI}/playbook/${playbookId}`);
