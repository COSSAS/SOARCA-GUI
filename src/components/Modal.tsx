import React, { useCallback } from "react";
import styled from "styled-components";

import { IconX } from "@tabler/icons-react";
import { Icon } from "./Icon";

const Overlay = styled.dialog`
  align-items: center;
  justify-content: center;
  overflow: hidden;

  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;

  border: 0;
  background: transparent;

  &[open] {
    display: flex;
  }

  &::backdrop {
    background: ${({ theme }) => theme.colors.background.overlay};
    backdrop-filter: blur(${({ theme }) => theme.effects.backdropBlur});
  }
`;

const Dialog = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  width: min(640px, 90vw);
  max-height: 90vh;

  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.background.primary};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

/**
 * Modal header section with info-colored background and consistent padding.
 * Displays at the top of the modal with a bottom border separator.
 * Commonly contains a title and optional close button.
 * @example
 * <Modal.Header>
 *   <h2>Confirm Action</h2>
 *   <ModalCloseButton onClick={onClose} />
 * </Modal.Header>
 */
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};

  background-color: ${({ theme }) => theme.colors.info.solidBg};

  color: ${({ theme }) => theme.colors.info.solidText};
  font: ${({ theme }) => theme.typography.h3.font};
`;

/**
 * Modal body section with scrollable overflow for long content.
 * Main content area of the modal with consistent padding and text styling.
 * Automatically scrolls if content exceeds available height.
 * @example
 * <Modal.Body>
 *   <p>This is the main content of the modal.</p>
 * </Modal.Body>
 */
const Body = styled.div`
  overflow: auto;

  padding: ${({ theme }) => theme.spacing.lg};

  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.body.font};
`;

/**
 * Modal footer section for action buttons, aligned to the right.
 * Displays at the bottom of the modal with a top border separator.
 * Typically contains action buttons like Cancel/Confirm.
 * @example
 * <Modal.Footer>
 *   <Button $variant="secondary" onClick={onClose}>Cancel</Button>
 *   <Button onClick={handleSubmit}>Confirm</Button>
 * </Modal.Footer>
 */
const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};

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

  border: none;
  background: none;

  color: ${({ theme }) => theme.colors.primary.text};

  cursor: pointer;
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
 * @param children - Use `Modal.Header`, `Modal.Body`, and `Modal.Footer` to structure content.
 * @example
 * <Modal $isOpen={isOpen} $onClose={handleClose}>
 *   <Modal.Header>Title <Modal.CloseButton onClick={handleClose} /></Modal.Header>
 *   <Modal.Body>Content</Modal.Body>
 *   <Modal.Footer><Button onClick={handleClose}>Close</Button></Modal.Footer>
 * </Modal>
 */
export const Modal: React.FC<ModalProps> & {
  Header: typeof Header;
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
Modal.Body = Body;
Modal.Footer = Footer;
Modal.CloseButton = ModalCloseButton;
