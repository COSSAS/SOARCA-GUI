import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";

import { getPlaybookById, updatePlaybook } from "@/api/playbooks";
import { formatErrorForToast, getErrorFromApiResponse } from "@/api/utils";
import { CenteredCardContent, Spinner, Text, ThemeSize } from "@/components";
import type { Playbook } from "@/types";
import { PATHS } from "@/utils";

import { getSpec } from "../model/specs";
import { UnsupportedSpec } from "./UnsupportedSpec";
import { VisualEditor } from "./VisualEditor";

export const PlaybookVisualEditPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { playbookId = "" } = useParams();
  const detailPath = PATHS.PLAYBOOKS.DETAIL.replace(":playbookId", playbookId);

  const {
    data: playbook,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["playbook", playbookId],
    queryFn: () => getPlaybookById(playbookId),
    enabled: !!playbookId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Playbook) => updatePlaybook(playbookId, data),
    onSuccess: () => {
      toast.success("Playbook updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["playbook", playbookId] });
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
    },
    onError: (err: Error) =>
      toast.error(formatErrorForToast(err, "Failed to update playbook")),
  });

  const save = (data: Playbook, onSaved: () => void) =>
    updateMutation.mutate(data, {
      onSuccess: () => {
        onSaved();
        navigate(detailPath);
      },
    });

  if (isLoading)
    return (
      <CenteredCardContent>
        <Spinner $size={ThemeSize.Medium} />
      </CenteredCardContent>
    );

  if (isError || !playbook)
    return (
      <Text>
        {isError
          ? getErrorFromApiResponse(error)?.message || "Could not load playbook"
          : "Playbook not found"}
      </Text>
    );

  const spec = getSpec(playbook.spec_version);
  if (!spec) return <UnsupportedSpec version={playbook.spec_version} />;

  return (
    <VisualEditor
      key={playbook.id}
      title={`Edit playbook: ${playbook.name}`}
      saveLabel="Save"
      initial={playbook}
      spec={spec}
      isSaving={updateMutation.isPending}
      onSave={save}
      onCancel={() => navigate(detailPath)}
    />
  );
};
