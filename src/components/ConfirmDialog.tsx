import React from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { ThemeVariant } from "./utils";

export interface ConfirmDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  $isOpen: boolean;
  $title: string;
  $description?: React.ReactNode;
  $confirmLabel?: string;
  $cancelLabel?: string;
  $onCancel: () => void;
  $onConfirm: () => void;
  $isPending?: boolean;
  $confirmVariant?: ThemeVariant;
  $cancelVariant?: ThemeVariant;
}

/**
 * Confirmation dialog component with customizable title, description, and action buttons.
 * This is essentially a pre-configured Modal with Confirm/Cancel buttons.
 * @param props @see ConfirmDialogProps
 * @example
 * <ConfirmDialog
 *  $isOpen={isOpen}
 *  $title="Delete Item"
 *  $description="Are you sure you want to delete this item? This action cannot be undone."
 *  $onCancel={handleCancel}
 *  $onConfirm={handleConfirm}
 *  $isPending={isDeleting}
 *  $confirmVariant={ThemeVariant.Error}
 * />
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  $isOpen,
  $title,
  $description,
  $onCancel,
  $onConfirm,
  $isPending = false,
  $confirmLabel = "Confirm",
  $cancelLabel = "Cancel",
  $confirmVariant = ThemeVariant.Primary,
  $cancelVariant = ThemeVariant.Primary,
  ...rest
}) => {
  return (
    <Modal
      $isOpen={$isOpen}
      $onClose={() => !$isPending && $onCancel()}
      aria-label={$title}
      {...rest}
    >
      <Modal.Header>
        {$title}
        <Modal.CloseButton onClick={$onCancel} disabled={$isPending} />
      </Modal.Header>
      <Modal.Body>{$description}</Modal.Body>
      <Modal.Footer>
        <Button
          $variant={$cancelVariant}
          $ghost
          disabled={$isPending}
          onClick={$onCancel}
        >
          {$cancelLabel}
        </Button>
        <Button
          $variant={$confirmVariant}
          disabled={$isPending}
          onClick={$onConfirm}
        >
          {$confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
