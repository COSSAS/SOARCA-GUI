import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconDotsVertical,
  IconFileCode,
  IconPencil,
  IconPlayerPlay,
  IconTrash,
} from "@tabler/icons-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import styled from "styled-components";

import { deletePlaybook } from "@/api/playbooks";
import { triggerPlaybookById } from "@/api/trigger";
import { formatErrorForToast } from "@/api/utils";
import { RequirePermission } from "@/auth/AuthGate";
import { Permissions } from "@/auth/permissions";
import {
  ConfirmDialog,
  downloadExport,
  getVariantColors,
  Icon,
  Popover,
  PopoverItem,
  ThemeVariant,
} from "@/components";
import { Execution, Playbook } from "@/types";
import { PATHS } from "@/utils";

import { RunPlaybookModal } from "./playbook-detail-page/RunPlaybookModal";
import { generatePlaybookFilename } from "./utils";

interface PlaybookActionsMenuProps {
  playbook: Playbook;
}

const PlaybookActionItem = styled(PopoverItem)<{ $variant: ThemeVariant }>`
  ${({ theme, $variant }) => {
    const colors = getVariantColors(theme, $variant);
    return `
      color: ${colors.border};

      &:hover:not(:disabled) {
        background: color-mix(
          in srgb,
          ${colors.solidBg} ${theme.interactions.subtleMix},
          ${theme.colors.background.primary}
        );
      }

      &:focus-visible {
        outline-color: ${colors.border};
      }
    `;
  }}
`;

export const PlaybookActionsMenu: React.FC<PlaybookActionsMenuProps> = ({
  playbook,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<"run" | "variables" | "delete" | null>(null);

  const hasExternalVars = Object.values(playbook.playbook_variables ?? {}).some(
    (variable) => variable.external === true,
  );

  const navigateToExecution = (data: Execution) => {
    if (data?.execution_id) {
      navigate(
        PATHS.MONITORING.DETAIL.replace(":executionId", data.execution_id),
      );
    } else {
      navigate(PATHS.MONITORING.BASE);
    }
  };

  const runMutation = useMutation({
    mutationFn: () => triggerPlaybookById(playbook.id),
    onSuccess: (data: Execution) => {
      toast.success("Playbook started");
      navigateToExecution(data);
    },
    onError: (error: Error) => {
      toast.error(formatErrorForToast(error, "Failed to trigger playbook"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePlaybook(playbook.id),
    onSuccess: () => {
      toast.success("Playbook deleted");
      queryClient.removeQueries({
        queryKey: ["playbook", playbook.id],
        exact: true,
      });
      return queryClient.invalidateQueries({ queryKey: ["playbooks"] });
    },
    onError: (error: Error) => {
      toast.error(formatErrorForToast(error, "Failed to delete playbook"));
    },
  });

  const handleExport = () => {
    try {
      downloadExport(playbook, "json", generatePlaybookFilename(playbook));
      toast.success("Playbook exported");
    } catch (error) {
      toast.error(formatErrorForToast(error, "Failed to export playbook"));
    }
  };

  return (
    <>
      <Popover
        id={`playbook-actions-${playbook.id}`}
        $label={`Actions for ${playbook.name}`}
        $trigger={<Icon $icon={IconDotsVertical} />}
      >
        <RequirePermission permission={Permissions.PlaybookWrite}>
          <PopoverItem
            onClick={() =>
              navigate(PATHS.PLAYBOOKS.EDIT.replace(":playbookId", playbook.id))
            }
          >
            <Icon $icon={IconPencil} />
            Edit
          </PopoverItem>
        </RequirePermission>
        <PlaybookActionItem $variant={ThemeVariant.Accent} onClick={handleExport}>
          <Icon $icon={IconFileCode} />
          Export
        </PlaybookActionItem>
        <RequirePermission permission={Permissions.PlaybookExecute}>
          <PlaybookActionItem
            $variant={ThemeVariant.Success}
            onClick={() => setDialog(hasExternalVars ? "variables" : "run")}
            disabled={runMutation.isPending}
          >
            <Icon $icon={IconPlayerPlay} />
            Run
          </PlaybookActionItem>
        </RequirePermission>
        <RequirePermission permission={Permissions.PlaybookWrite}>
          <PlaybookActionItem
            $variant={ThemeVariant.Error}
            onClick={() => setDialog("delete")}
            disabled={deleteMutation.isPending}
          >
            <Icon $icon={IconTrash} />
            Delete
          </PlaybookActionItem>
        </RequirePermission>
      </Popover>

      <ConfirmDialog
        $isOpen={dialog === "run"}
        $title="Run playbook"
        $description={`Run the playbook '${playbook.name}' now?`}
        $confirmLabel="Run"
        $cancelLabel="Cancel"
        $confirmVariant={ThemeVariant.Success}
        $isPending={runMutation.isPending}
        $onCancel={() => setDialog(null)}
        $onConfirm={() => {
          setDialog(null);
          runMutation.mutate();
        }}
      />

      <ConfirmDialog
        $isOpen={dialog === "delete"}
        $title="Delete playbook"
        $description={`Delete the playbook '${playbook.name}'? This action cannot be undone.`}
        $confirmLabel="Delete"
        $cancelLabel="Cancel"
        $confirmVariant={ThemeVariant.Error}
        $isPending={deleteMutation.isPending}
        $onCancel={() => setDialog(null)}
        $onConfirm={() => {
          setDialog(null);
          deleteMutation.mutate();
        }}
      />

      {dialog === "variables" && (
        <RunPlaybookModal
          playbook={playbook}
          isOpen
          onClose={() => setDialog(null)}
          onSuccess={navigateToExecution}
        />
      )}
    </>
  );
};
