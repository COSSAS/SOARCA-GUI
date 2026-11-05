import { useMutation, useQuery } from "@tanstack/react-query";
import {
  IconArrowLeft,
  IconFileCode,
  IconPencil,
  IconPlayerPlay,
  IconTrash,
} from "@tabler/icons-react";
import React, { Suspense, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";

import { deletePlaybook, getPlaybookById } from "@/api/playbooks";
import { triggerPlaybookById } from "@/api/trigger";
import { formatErrorForToast, getErrorFromApiResponse } from "@/api/utils";
import { RequirePermission } from "@/auth/AuthGate";
import { Permissions } from "@/auth/permissions";
import {
  Button,
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
import { Execution, Playbook } from "@/types";
import { PATHS } from "@/utils";

import { generatePlaybookFilename } from "../utils";
import {
  DetailHeader,
  DetailPage,
  PageTitle,
  TitleRow,
} from "./PlaybookDetailPage.styles";
import { PlaybookPanels } from "./PlaybookPanels";
import { RunPlaybookModal } from "./RunPlaybookModal";

const loading = (
  <CenteredCardContent>
    <Spinner $size={ThemeSize.Medium} />
  </CenteredCardContent>
);

export const PlaybookDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { playbookId } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["playbook", playbookId],
    queryFn: () => getPlaybookById(playbookId!),
    enabled: !!playbookId,
    refetchOnWindowFocus: false,
  });

  const [openRunConfirm, setOpenRunConfirm] = useState(false);
  const [openRunModal, setOpenRunModal] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const navigateToExecution = (data: Execution) => {
    if (data?.execution_id) {
      navigate(
        PATHS.MONITORING.DETAIL.replace(":executionId", data.execution_id),
      );
    } else {
      navigate(PATHS.MONITORING.BASE);
    }
  };

  const mutation = useMutation({
    mutationFn: () => triggerPlaybookById(playbookId!),
    onSuccess: (data: Execution) => {
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

  if (isLoading) return loading;

  if (isError || !playbook) {
    return (
      <Spacer $direction="vertical" $gap="lg" $align="start">
        <Link $to={PATHS.PLAYBOOKS.BASE}>
          <Icon $icon={IconArrowLeft} />
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

  const content = (
    <DetailPage>
      <DetailHeader>
        <TitleRow>
          <Link $to={PATHS.PLAYBOOKS.BASE} title="Back to playbooks">
            <Icon $icon={IconArrowLeft} />
          </Link>
          <PageTitle title={playbook.name}>{playbook.name}</PageTitle>
        </TitleRow>
        <Spacer $direction="horizontal" $gap="sm">
          <RequirePermission permission={Permissions.PlaybookWrite}>
            <Button
              $variant={ThemeVariant.Primary}
              $ghost
              onClick={() =>
                navigate(
                  PATHS.PLAYBOOKS.EDIT.replace(":playbookId", playbookId!),
                )
              }
            >
              <Icon $icon={IconPencil} />
              Edit
            </Button>
            <Button
              $variant={ThemeVariant.Error}
              $ghost
              onClick={() => setOpenDeleteConfirm(true)}
              disabled={deleteMutation.isPending}
            >
              <Icon $icon={IconTrash} />
              Delete
            </Button>
          </RequirePermission>
          <RequirePermission permission={Permissions.PlaybookExecute}>
            <Button
              $variant={ThemeVariant.Success}
              $ghost
              onClick={() =>
                hasExternalVars
                  ? setOpenRunModal(true)
                  : setOpenRunConfirm(true)
              }
              disabled={mutation.isPending}
            >
              <Icon $icon={IconPlayerPlay} />
              Run
            </Button>
          </RequirePermission>
          <ExportButton
            $variant={ThemeVariant.Accent}
            $ghost
            $data={playbook}
            $fileName={generatePlaybookFilename(playbook)}
            $format="json"
            $onSuccess={() => toast.success("Playbook exported")}
            $onError={(err) =>
              toast.error(
                formatErrorForToast(err, "Failed to export playbook"),
              )
            }
          >
            <Icon $icon={IconFileCode} />
            Export
          </ExportButton>
        </Spacer>
      </DetailHeader>

      <PlaybookPanels key={playbook.id} playbook={playbook} />
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
    </DetailPage>
  );

  // The diagram chunk loads after the playbook; one fallback covers both waits.
  return <Suspense fallback={loading}>{content}</Suspense>;
};
