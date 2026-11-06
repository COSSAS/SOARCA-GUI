import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { createPlaybook } from "@/api/playbooks";
import { formatErrorForToast } from "@/api/utils";
import type { Playbook } from "@/types";
import { PATHS } from "@/utils";

import { createEmptyPlaybook } from "../model/edits";
import { getSpec, LATEST_SPEC } from "../model/specs";
import { VisualEditor } from "./VisualEditor";

export const PlaybookVisualCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [spec, setSpec] = useState(LATEST_SPEC);
  const [initial] = useState(() => createEmptyPlaybook(LATEST_SPEC.version));

  const changeSpec = (version: string) => {
    const next = getSpec(version);
    if (next) setSpec(next);
  };

  const createMutation = useMutation({
    mutationFn: createPlaybook,
    onSuccess: () => {
      toast.success("Playbook created successfully!");
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
    },
    onError: (err: Error) =>
      toast.error(formatErrorForToast(err, "Failed to create playbook")),
  });

  const save = (data: Playbook, onSaved: () => void) =>
    createMutation.mutate(data, {
      onSuccess: () => {
        onSaved();
        navigate(PATHS.PLAYBOOKS.BASE);
      },
    });

  return (
    <VisualEditor
      title="New playbook"
      saveLabel="Create"
      initial={initial}
      spec={spec}
      onChangeSpec={changeSpec}
      isSaving={createMutation.isPending}
      onSave={save}
      onCancel={() => navigate(PATHS.PLAYBOOKS.BASE)}
    />
  );
};
