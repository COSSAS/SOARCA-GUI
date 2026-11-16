import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconArrowLeft } from "@tabler/icons-react";
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
  CenteredCardContent,
  Icon,
  Link,
  Spacer,
  Spinner,
  Text,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import CodeEditor from "@/components/CodeEditor";
import { Playbook } from "@/types";
import { PATHS } from "@/utils";

import { ActionButtons, ErrorMessage } from "./shared.styles";
import { validatePlaybookJson } from "./utils";

export const PlaybookJsonEditPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { playbookId = "" } = useParams();
  const detailPath = PATHS.PLAYBOOKS.DETAIL.replace(":playbookId", playbookId);
  const [jsonContent, setJsonContent] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const {
    data: playbook,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["playbook", playbookId],
    queryFn: () => getPlaybookById(playbookId),
    enabled: !!playbookId,
    refetchOnWindowFocus: false,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Playbook) => updatePlaybook(playbookId, data),
    onSuccess: () => {
      toast.success("Playbook updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["playbook", playbookId] });
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      navigate(detailPath);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to update playbook");
      toast.error(formatErrorForToast(err, "Failed to update playbook"));
    },
  });

  const initialJsonContent = useMemo(
    () => (playbook ? JSON.stringify(playbook, null, 2) : ""),
    [playbook],
  );
  const currentContent = jsonContent ?? initialJsonContent;

  const handleChange = (value: string) => {
    setJsonContent(value);
    const validation = validatePlaybookJson(value);
    setError(validation.valid ? "" : validation.error || "Invalid JSON");
  };

  const handleSubmit = () => {
    const validation = validatePlaybookJson(currentContent);
    if (!validation.valid || !validation.data) {
      setError(validation.error || "Invalid JSON");
      return;
    }
    setError("");
    updateMutation.mutate(validation.data);
  };

  const hasChanges = currentContent.trim() !== initialJsonContent.trim();
  const canSubmit = hasChanges && !error && !updateMutation.isPending;

  return (
    <Spacer $direction="vertical" $gap="lg" $align="start">
      <Link $to={detailPath}>
        <Icon $icon={IconArrowLeft} />
        Back to playbook
      </Link>

      <CardContainer>
        <CardHeader>
          <CardTitle>Edit playbook JSON: {playbook?.name ?? "..."}</CardTitle>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <CenteredCardContent>
              <Spinner $size={ThemeSize.Medium} />
            </CenteredCardContent>
          ) : isError || !playbook ? (
            <Text>
              {isError
                ? getErrorFromApiResponse(queryError)?.message ||
                  "Could not load playbook"
                : "Playbook not found"}
            </Text>
          ) : (
            <>
              <Text>
                Edit the playbook JSON below. The GUI checks it before saving.
              </Text>
              <CodeEditor
                $value={currentContent}
                $onChange={handleChange}
                placeholder="Edit your CACAO playbook JSON here..."
                disabled={updateMutation.isPending}
                $hasError={!!error}
                $minHeight="500px"
              />
              {error && <ErrorMessage>{error}</ErrorMessage>}
              <ActionButtons>
                <Button
                  $variant={ThemeVariant.Primary}
                  $ghost
                  onClick={() => navigate(detailPath)}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  $variant={ThemeVariant.Success}
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                >
                  Save
                </Button>
              </ActionButtons>
            </>
          )}
        </CardBody>
      </CardContainer>
    </Spacer>
  );
};
