import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";

import { getPlaybookById, updatePlaybook } from "@/api/playbooks";
import { formatErrorForToast, getErrorFromApiResponse } from "@/api/utils";
import {
  Button,
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  Icon,
  Link,
  Spacer,
  SuspenseCard,
  ThemeVariant,
} from "@/components";
import { ErrorResponse, Playbook } from "@/types";
import { PATHS } from "@/utils";

import CodeEditor from "@/components/CodeEditor";
import { ActionButtons, EditorHint, ErrorMessage } from "./shared.styles";
import { validatePlaybookJson } from "./utils";

export const PlaybookEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { playbookId } = useParams();
  const [jsonContent, setJsonContent] = useState<string>("");
  const [error, setError] = useState<string>("");

  const updateMutation = useMutation({
    mutationFn: (data: Playbook) => updatePlaybook(playbookId!, data),
    onSuccess: () => {
      toast.success("Playbook updated successfully!");
      navigate(PATHS.PLAYBOOKS.DETAIL.replace(":playbookId", playbookId!));
    },
    onError: (err: Error) => {
      const errorMessage = err.message || "Failed to update playbook";
      setError(errorMessage);
      toast.error(formatErrorForToast(err, "Failed to update playbook"));
    },
  });

  const {
    data: playbook,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["playbook", playbookId],
    queryFn: () => getPlaybookById(playbookId!),
    enabled: !!playbookId,
  });

  const fetchPlaybookError = getErrorFromApiResponse(
    queryError as Error,
  ) as ErrorResponse;

  const initialJsonContent = useMemo(() => {
    return playbook ? JSON.stringify(playbook, null, 2) : "";
  }, [playbook]);

  const handleSubmit = () => {
    if (!playbookId) {
      setError("Playbook ID is missing");
      return;
    }

    const contentToValidate = jsonContent.trim()
      ? jsonContent
      : initialJsonContent;
    const validation = validatePlaybookJson(contentToValidate);

    if (!validation.valid || !validation.data) {
      setError(validation.error || "Invalid JSON");
      return;
    }

    setError("");
    updateMutation.mutate(validation.data);
  };

  const contentToCheck = jsonContent.trim() || initialJsonContent.trim();
  const canSubmit = !!contentToCheck && !error && !updateMutation.isPending;
  const hasChanges = contentToCheck !== initialJsonContent.trim();

  return (
    <Spacer $direction="vertical" $gap="lg" $align="start">
      <Link $to={PATHS.PLAYBOOKS.DETAIL.replace(":playbookId", playbookId!)}>
        <Icon $icon={ArrowLeft} />
        Back to playbook
      </Link>

      <SuspenseCard
        $isLoading={isLoading}
        $isError={isError}
        $errorMessage={fetchPlaybookError?.message}
        $returnedNoContent={!isLoading && !isError && !playbook}
        $noContentMessage="Playbook not found"
      >
        <CardContainer>
          <CardHeader>
            <CardTitle>Edit Playbook: {playbook?.name}</CardTitle>
          </CardHeader>
          <CardBody>
            <EditorHint>
              Edit the playbook JSON below. Changes will be validated before
              saving.
            </EditorHint>

            <CodeEditor
              $value={jsonContent || initialJsonContent}
              $onChange={(v) => {
                setJsonContent(v);
                setError("");
                if (v.trim()) {
                  const validation = validatePlaybookJson(v);
                  if (!validation.valid)
                    setError(validation.error || "Invalid JSON");
                }
              }}
              $placeholder="Edit your CACAO playbook JSON here..."
              $disabled={updateMutation.isPending}
              $hasError={!!error}
              $minHeight="500px"
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <ActionButtons>
              <Button
                $variant={ThemeVariant.Primary}
                $ghost
                onClick={() =>
                  navigate(
                    PATHS.PLAYBOOKS.DETAIL.replace(":playbookId", playbookId!),
                  )
                }
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                $variant={ThemeVariant.Success}
                onClick={handleSubmit}
                disabled={!canSubmit || !hasChanges}
              >
                Save
              </Button>
            </ActionButtons>
          </CardBody>
        </CardContainer>
      </SuspenseCard>
    </Spacer>
  );
};
