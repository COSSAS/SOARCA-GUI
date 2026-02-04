import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, FileJson, Upload } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { createPlaybook } from "@/api/playbooks";
import { formatErrorForToast } from "@/api/utils";
import {
  Button,
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  Icon,
  Link,
  Spacer,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import { Playbook } from "@/types";
import { PATHS } from "@/utils";

import CodeEditor from "@/components/CodeEditor";
import FileDrop from "@/components/FileDrop";
import { MethodButton, MethodSelector } from "./PlaybookCreatePage.styles";
import { ActionButtons, ErrorMessage } from "./shared.styles";
import { validatePlaybookJson } from "./utils";

type CreationMethod = "upload" | "editor";

export const PlaybookCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<CreationMethod>("upload");
  const [jsonContent, setJsonContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const createMutation = useMutation({
    mutationFn: (playbook: Playbook) => createPlaybook(playbook),
    onSuccess: () => {
      toast.success("Playbook created successfully!");
      navigate(PATHS.PLAYBOOKS.BASE);
    },
    onError: (err: Error) => {
      const errorMessage = err.message || "Failed to create playbook";
      setError(errorMessage);
      toast.error(formatErrorForToast(err, "Failed to create playbook"));
    },
  });

  const handleSubmit = () => {
    const validation = validatePlaybookJson(jsonContent);

    if (!validation.valid || !validation.data) {
      setError(validation.error || "Invalid JSON");
      return;
    }

    setError("");
    createMutation.mutate(validation.data);
  };

  const handleMethodChange = (newMethod: CreationMethod) => {
    setMethod(newMethod);
    setJsonContent("");
    setFileName("");
    setError("");
  };

  const canSubmit = jsonContent.trim() && !error && !createMutation.isPending;

  return (
    <Spacer $direction="vertical" $gap="lg" $align="start">
      <Link $to={PATHS.PLAYBOOKS.BASE}>
        <Icon $icon={ArrowLeft} />
        Back to playbooks
      </Link>

      <CardContainer>
        <CardHeader>
          <CardTitle>Create new playbook</CardTitle>
        </CardHeader>
        <CardBody>
          <MethodSelector>
            <MethodButton
              $active={method === "upload"}
              onClick={() => handleMethodChange("upload")}
              disabled={createMutation.isPending}
            >
              <Icon $icon={Upload} $size={ThemeSize.Medium} />
              Upload JSON file
            </MethodButton>
            <MethodButton
              $active={method === "editor"}
              onClick={() => handleMethodChange("editor")}
              disabled={createMutation.isPending}
            >
              <Icon $icon={FileJson} $size={ThemeSize.Medium} />
              JSON Editor
            </MethodButton>
          </MethodSelector>

          {method === "upload" ? (
            <>
              <FileDrop
                $fileName={fileName}
                $onChange={(content, filename) => {
                  setFileName(filename || "");
                  setJsonContent(content);
                  setError("");
                  if (content.trim()) {
                    const validation = validatePlaybookJson(content);
                    if (!validation.valid)
                      setError(validation.error || "Invalid JSON");
                  }
                }}
                $onRemove={() => {
                  setFileName("");
                  setJsonContent("");
                  setError("");
                }}
                $accept=".json"
                $disabled={createMutation.isPending}
                $error={error}
              />
            </>
          ) : (
            <CodeEditor
              $value={jsonContent}
              $onChange={(v) => {
                setJsonContent(v);
                setError("");
                if (v.trim()) {
                  const validation = validatePlaybookJson(v);
                  if (!validation.valid)
                    setError(validation.error || "Invalid JSON");
                }
              }}
              $placeholder="Paste or write your CACAO playbook JSON here..."
              $disabled={createMutation.isPending}
              $hasError={!!error}
              $minHeight="400px"
            />
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ActionButtons>
            <Button
              $variant={ThemeVariant.Primary}
              $ghost
              onClick={() => navigate(PATHS.PLAYBOOKS.BASE)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              $variant={ThemeVariant.Success}
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              Create playbook
            </Button>
          </ActionButtons>
        </CardBody>
      </CardContainer>
    </Spacer>
  );
};
