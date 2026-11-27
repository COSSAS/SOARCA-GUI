import React, { useCallback } from "react";
import styled from "styled-components";

import { IconX } from "@tabler/icons-react";
import { Icon } from "./Icon";
import { ScrollArea } from "./ScrollArea";

const Overlay = styled.dialog`
  overflow: hidden;
  align-items: center;
  justify-content: center;

  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  border: 0;

  background: transparent;

  &::backdrop {
    background: ${({ theme }) => theme.colors.background.overlay};
    backdrop-filter: blur(${({ theme }) => theme.effects.backdropBlur});
  }

  &[open] {
    display: flex;
  }
`;

const Dialog = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;

  width: min(640px, 90vw);
  max-height: 90vh;
  border: 1px solid ${({ theme }) => theme.colors.dataTable.border};
  border-radius: ${({ theme }) => theme.radius.lg};

  background: ${({ theme }) => theme.colors.background.primary};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

/**
 * Modal header section with the colors of a table header and consistent padding.
 * Contains a Modal.Title and optional close button.
 * @example
 * <Modal.Header>
 *   <Modal.Title>Confirm action</Modal.Title>
 *   <Modal.CloseButton onClick={onClose} />
 * </Modal.Header>
 */
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dataTable.border};

  color: ${({ theme }) => theme.colors.dataTable.headerText};

  background-color: ${({ theme }) => theme.colors.dataTable.headerBg};
`;

/**
 * Modal title, rendered as an h2.
 * @example
 * <Modal.Title>Run playbook</Modal.Title>
 */
const Title = styled.h2`
  font: ${({ theme }) => theme.typography.h2.font};
`;

const BodyContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;

/**
 * Modal body section with consistent padding and text styling.
 * Scrolls if the content is higher than the space left in the modal.
 * @example
 * <Modal.Body>
 *   <p>This is the main content of the modal.</p>
 * </Modal.Body>
 */
const Body = ({ children }: { children: React.ReactNode }) => (
  <ScrollArea>
    <BodyContent>{children}</BodyContent>
  </ScrollArea>
);

/**
 * Modal footer section for action buttons, aligned to the right.
 * Displays at the bottom of the modal with a top border separator.
 * Typically contains action buttons like Cancel/Confirm.
 * @example
 * <Modal.Footer>
 *   <Button $variant="primary" $ghost onClick={onClose}>Cancel</Button>
 *   <Button onClick={handleSubmit}>Confirm</Button>
 * </Modal.Footer>
 */
const Footer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;

  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

/**
 * Simple close button styled for modal headers.
 * Renders as an "×" character with no background or border.
 * @example
 * <CloseButton onClick={onClose}>×</CloseButton>
 */
const CloseButton = styled.button`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.dataTable.headerText};
`;

/**
 * ModalCloseButton
 *
 * Simple close button used inside modal headers. Renders an `X` icon and forwards button props.
 * @param props - Standard button attributes (onClick, title, etc.)
 * @example
 * <Modal.CloseButton onClick={onClose} />
 */
export const ModalCloseButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  return (
    <CloseButton type="button" aria-label="Close dialog" {...props}>
      <Icon $icon={IconX} $stroke={4} />
    </CloseButton>
  );
};

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  $isOpen: boolean;
  $onClose: () => void;
  children: React.ReactNode;
}

/**
 * Modal
 *
 * Native modal dialog providing `Header`, `Body`, and `Footer` layout slots and an optional close button.
 * Renders with `showModal()` when `$isOpen` is true and handles Escape and backdrop clicks.
 * @param $isOpen - Controls whether the modal is visible.
 * @param $onClose - Callback invoked when the user requests to close the modal (Escape, backdrop click, or CloseButton).
 * @param children - Use `Modal.Header` (with a `Modal.Title`), `Modal.Body`, and `Modal.Footer` to structure content.
 * @example
 * <Modal $isOpen={isOpen} $onClose={handleClose}>
 *   <Modal.Header>
 *     <Modal.Title>Title</Modal.Title>
 *     <Modal.CloseButton onClick={handleClose} />
 *   </Modal.Header>
 *   <Modal.Body>Content</Modal.Body>
 *   <Modal.Footer><Button onClick={handleClose}>Close</Button></Modal.Footer>
 * </Modal>
 */
export const Modal: React.FC<ModalProps> & {
  Header: typeof Header;
  Title: typeof Title;
  Body: typeof Body;
  Footer: typeof Footer;
  CloseButton: typeof ModalCloseButton;
} = ({
  $isOpen,
  $onClose,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...rest
}) => {
  const openDialog = useCallback((dialog: HTMLDialogElement | null) => {
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  if (!$isOpen) return null;

  return (
    <Overlay
      ref={openDialog}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      onCancel={(event) => {
        event.preventDefault();
        $onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) $onClose();
      }}
    >
      <Dialog
        {...rest}
        onClick={(event) => {
          event.stopPropagation();
          rest.onClick?.(event);
        }}
      >
        {children}
      </Dialog>
    </Overlay>
  );
};

Modal.Header = Header;
Modal.Title = Title;
Modal.Body = Body;
Modal.Footer = Footer;
Modal.CloseButton = ModalCloseButton;
