import { queryOptions } from "@tanstack/react-query";

import { getPlaybookById, getPlaybooks } from "./playbooks";

/** Every component that reads playbooks uses these, so keys and caching match. */
export const playbookQueries = {
  list: () => queryOptions({ queryKey: ["playbooks"], queryFn: getPlaybooks }),
  detail: (playbookId: string) =>
    queryOptions({
      queryKey: ["playbook", playbookId],
      queryFn: () => getPlaybookById(playbookId),
      enabled: !!playbookId,
    }),
};
