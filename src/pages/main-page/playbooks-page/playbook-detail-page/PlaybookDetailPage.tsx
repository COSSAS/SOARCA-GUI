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
  CenteredCardContent,
  ConfirmDialog,
  ExportButton,
  Icon,
  Link,
  Spacer,
  Spinner,
  Text,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import { RunStarted, Playbook } from "@/types";
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
import { RunPlaybookModal } from "./RunPlaybookModal";

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
  const [openRunModal, setOpenRunModal] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const navigateToExecution = (data: RunStarted) => {
    if (data?.run_id) {
      navigate(PATHS.MONITORING.DETAIL.replace(":executionId", data.run_id));
    } else {
      navigate(PATHS.MONITORING.BASE);
    }
  };

  const mutation = useMutation({
    mutationFn: () => triggerPlaybookById(playbookId!),
    onSuccess: (data: RunStarted) => {
      toast.success("Playbook started");
      navigateToExecution(data);
    },
    onError: (err: Error) => {
      toast.error(formatErrorForToast(err, "Failed to trigger playbook"));
    },
  });

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
  const hasExternalVars = Object.values(
    playbook?.playbook_variables ?? {},
  ).some((v) => v.external === true);
  const parsedError = getErrorFromApiResponse(error);

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

  if (isLoading) {
    return (
      <Spacer $direction="vertical" $gap="lg" $align="start">
        <Link $to={PATHS.PLAYBOOKS.BASE}>
          <Icon $icon={ArrowLeft} />
          Back to playbooks
        </Link>
        <CardContainer>
          <CardBody>
            <CenteredCardContent>
              <Spinner $size={ThemeSize.Large} />
            </CenteredCardContent>
          </CardBody>
        </CardContainer>
      </Spacer>
    );
  }

  if (isError || !playbook) {
    return (
      <Spacer $direction="vertical" $gap="lg" $align="start">
        <Link $to={PATHS.PLAYBOOKS.BASE}>
          <Icon $icon={ArrowLeft} />
          Back to playbooks
        </Link>
        <CardContainer>
          <CardHeader>
            <CardTitle>Playbook</CardTitle>
          </CardHeader>
          <CardBody>
            <Text>
              {isError
                ? parsedError?.message || "Could not load playbook"
                : "Playbook not found"}
            </Text>
          </CardBody>
        </CardContainer>
      </Spacer>
    );
  }

  return (
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
              navigate(PATHS.PLAYBOOKS.EDIT.replace(":playbookId", playbookId!))
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
            onClick={() =>
              hasExternalVars ? setOpenRunModal(true) : setOpenRunConfirm(true)
            }
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
            $filename={generatePlaybookFilename(playbook)}
            $format="json"
            $onSuccess={() => toast.success("Playbook exported")}
            $onError={(err) =>
              toast.error(formatErrorForToast(err, "Failed to export playbook"))
            }
          >
            <Icon $icon={FileJson} $size={ThemeSize.Medium} />
            Export
          </ExportButton>

          <ConfirmDialog
            $isOpen={openRunConfirm}
            $title="Run playbook"
            $description={`Run the playbook '${playbook.name}' now?`}
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
            $description={`Delete the playbook '${playbook.name}'? This action cannot be undone.`}
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
          {openRunModal && (
            <RunPlaybookModal
              key={playbook.id}
              playbook={playbook}
              isOpen={openRunModal}
              onClose={() => setOpenRunModal(false)}
              onSuccess={navigateToExecution}
            />
          )}
        </Spacer>
      </Spacer>

      <TwoColumnLayout>
        <LeftColumn>
          <CardContainer>
            <CardHeader>
              <CardTitle>Playbook information</CardTitle>
            </CardHeader>
            <CardBody>
              <PlaybookMainDetails playbook={playbook} />
            </CardBody>
          </CardContainer>
          <CardContainer>
            <CardHeader>
              <CardTitle>Additional details</CardTitle>
            </CardHeader>
            <CardBody>
              <PlaybookAdditionalDetails playbook={playbook} />
            </CardBody>
          </CardContainer>
        </LeftColumn>
        <RightColumn>
          <CardContainer>
            <CardHeader>
              <CardTitle>Workflow steps ({orderedSteps.length})</CardTitle>
            </CardHeader>
            <CardBody>
              <PlaybookTimeline
                steps={orderedSteps}
                expandedSteps={expandedSteps}
                toggleStep={toggleStep}
                playbookWorkflow={playbook.workflow}
              />
            </CardBody>
          </CardContainer>
        </RightColumn>
      </TwoColumnLayout>
    </Spacer>
  );
};
