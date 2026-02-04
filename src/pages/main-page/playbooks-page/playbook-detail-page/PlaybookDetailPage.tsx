import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileJson, Pencil, Play, Trash } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";

import { deletePlaybook, getPlaybookById } from "@/api/playbooks";
import { triggerPlaybookById } from "@/api/trigger";
import { formatErrorForToast, getErrorFromApiResponse } from "@/api/utils";
import {
  Button,
  ButtonWidth,
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  ExportButton,
  Icon,
  Link,
  Spacer,
  SuspenseCard,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import { ErrorResponse, Execution, Playbook } from "@/types";
import { PATHS } from "@/utils";

import { generatePlaybookFilename, getOrderedSteps } from "../utils";
import {
  PlaybookAdditionalDetails,
  PlaybookMainDetails,
} from "./PlaybookDetailCards";
import {
  LeftColumn,
  RightColumn,
  TwoColumnLayout,
} from "./PlaybookDetailPage.styles";
import PlaybookTimeline from "./PlaybookTimeline";

export const PlaybookDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { playbookId } = useParams();
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["playbook", playbookId],
    queryFn: () => getPlaybookById(playbookId!),
    enabled: !!playbookId,
    refetchOnWindowFocus: false,
  });

  const [openRunConfirm, setOpenRunConfirm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const mutation = useMutation({
    mutationFn: () => triggerPlaybookById(playbookId!),
    onSuccess: (data: Execution) => {
      toast.success("Playbook started");
      // Use the API's `execution_id` when available and
      // navigate directly to the detailed execution report.
      if (data && data.execution_id) {
        navigate(
          PATHS.MONITORING.DETAIL.replace(":executionId", data.execution_id),
        );
      } else {
        navigate(PATHS.MONITORING.BASE);
      }
    },
    onError: (err: Error) => {
      toast.error(formatErrorForToast(err, "Failed to trigger playbook"));
    },
  });

  // Mutation for deleting a playbook
  const deleteMutation = useMutation({
    mutationFn: () => deletePlaybook(playbookId!),
    onSuccess: () => {
      toast.success("Playbook deleted");
      navigate(PATHS.PLAYBOOKS.BASE);
    },
    onError: (err: Error) => {
      toast.error(formatErrorForToast(err, "Failed to delete playbook"));
    },
  });

  const playbook: Playbook | undefined = data;
  const parsedError = getErrorFromApiResponse(error as Error) as ErrorResponse;

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const orderedSteps = playbook
    ? getOrderedSteps(playbook.workflow, playbook.workflow_start)
    : [];

  return (
    <SuspenseCard
      $isLoading={isLoading}
      $isError={isError}
      $errorMessage={parsedError?.message}
      $returnedNoContent={!isLoading && !isError && !playbook}
      $noContentMessage="Playbook not found"
    >
      {playbook && (
        <Spacer $direction="vertical" $gap="lg" $align="start">
          <Spacer
            style={{ width: "100%" }}
            $direction="horizontal"
            $gap="lg"
            $align="center"
            $justify="space-between"
          >
            <Link $to={PATHS.PLAYBOOKS.BASE}>
              <Icon $icon={ArrowLeft} />
              Back to playbooks
            </Link>
            <Spacer $direction="horizontal" $gap="sm">
              <Button
                $variant={ThemeVariant.Primary}
                $size={ThemeSize.Small}
                $width={ButtonWidth.Full}
                $ghost
                onClick={() =>
                  navigate(
                    PATHS.PLAYBOOKS.EDIT.replace(":playbookId", playbookId!),
                  )
                }
              >
                <Icon $icon={Pencil} $size={ThemeSize.Medium} />
                Edit
              </Button>
              <Button
                $variant={ThemeVariant.Error}
                $size={ThemeSize.Small}
                $width={ButtonWidth.Full}
                $ghost
                onClick={() => setOpenDeleteConfirm(true)}
                disabled={deleteMutation.isPending}
              >
                <Icon $icon={Trash} $size={ThemeSize.Medium} />
                Delete
              </Button>
              <Button
                $variant={ThemeVariant.Success}
                $size={ThemeSize.Small}
                $width={ButtonWidth.Full}
                $ghost
                onClick={() => setOpenRunConfirm(true)}
                disabled={mutation.isPending}
              >
                <Icon $icon={Play} $size={ThemeSize.Medium} />
                Run
              </Button>

              <ExportButton
                $variant={ThemeVariant.Accent}
                $size={ThemeSize.Small}
                $ghost
                $data={playbook}
                $filename={
                  playbook ? generatePlaybookFilename(playbook) : undefined
                }
                $format="json"
                $onSuccess={() => toast.success("Playbook exported")}
                $onError={(err) =>
                  toast.error(
                    formatErrorForToast(
                      err as Error,
                      "Failed to export playbook",
                    ),
                  )
                }
                disabled={!playbook}
              >
                <Icon $icon={FileJson} $size={ThemeSize.Medium} />
                Export
              </ExportButton>

              <ConfirmDialog
                $isOpen={openRunConfirm}
                $title="Run playbook"
                $description={`Run the playbook '${playbook?.name}' now?`}
                $confirmLabel="Run"
                $cancelLabel="Cancel"
                $confirmVariant={ThemeVariant.Success}
                $isPending={mutation.isPending}
                $onCancel={() => setOpenRunConfirm(false)}
                $onConfirm={() => {
                  setOpenRunConfirm(false);
                  mutation.mutate();
                }}
              />

              <ConfirmDialog
                $isOpen={openDeleteConfirm}
                $title="Delete playbook"
                $description={`Delete the playbook '${playbook?.name}'? This action cannot be undone.`}
                $confirmLabel="Delete"
                $cancelLabel="Cancel"
                $confirmVariant={ThemeVariant.Error}
                $isPending={deleteMutation.isPending}
                $onCancel={() => setOpenDeleteConfirm(false)}
                $onConfirm={() => {
                  setOpenDeleteConfirm(false);
                  deleteMutation.mutate();
                }}
              />
            </Spacer>
          </Spacer>

          <TwoColumnLayout>
            <LeftColumn>
              <CardContainer>
                <CardHeader>
                  <CardTitle>Playbook information</CardTitle>
                </CardHeader>
                <CardBody>
                  <SuspenseCard
                    $isLoading={isLoading}
                    $isError={isError}
                    $errorMessage={parsedError?.message}
                    $returnedNoContent={!isLoading && !isError && !playbook}
                    $noContentMessage="Playbook not found"
                  >
                    <PlaybookMainDetails playbook={playbook} />
                  </SuspenseCard>
                </CardBody>
              </CardContainer>
              <CardContainer>
                <CardHeader>
                  <CardTitle>Additional details</CardTitle>
                </CardHeader>
                <CardBody>
                  <SuspenseCard
                    $isLoading={isLoading}
                    $isError={isError}
                    $errorMessage={parsedError?.message}
                    $returnedNoContent={!isLoading && !isError && !playbook}
                    $noContentMessage="Playbook not found"
                  >
                    <PlaybookAdditionalDetails playbook={playbook} />
                  </SuspenseCard>
                </CardBody>
              </CardContainer>
            </LeftColumn>
            <RightColumn>
              <CardContainer>
                <CardHeader>
                  <CardTitle>Workflow steps ({orderedSteps.length})</CardTitle>
                </CardHeader>
                <CardBody>
                  <SuspenseCard
                    $isLoading={isLoading}
                    $isError={isError}
                    $errorMessage={parsedError?.message}
                    $returnedNoContent={!isLoading && !isError && !playbook}
                    $noContentMessage="Playbook not found"
                  >
                    <PlaybookTimeline
                      steps={orderedSteps}
                      expandedSteps={expandedSteps}
                      toggleStep={toggleStep}
                      playbookWorkflow={playbook.workflow}
                    />
                  </SuspenseCard>
                </CardBody>
              </CardContainer>
            </RightColumn>
          </TwoColumnLayout>
        </Spacer>
      )}
    </SuspenseCard>
  );
};
