import React from "react";
import styled from "styled-components";

import { X } from "lucide-react";
import { Icon } from "./Icon";

const Overlay = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;

  inset: 0;

  background: ${({ theme }) => theme.colors.background.overlay};
  z-index: ${({ theme }) => theme.zIndex.modalBackdrop};
  backdrop-filter: blur(2px);

  cursor: not-allowed;
`;

const Dialog = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: ${({ theme }) => theme.zIndex.modal};

  width: min(640px, 90vw);
  max-height: 90vh;

  cursor: default;

  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.radius.lg};
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

  font: ${({ theme }) => theme.typography.h3.font};

  color: ${({ theme }) => theme.colors.info.solidText};
  background-color: ${({ theme }) => theme.colors.info.solidBg};
  border-radius: ${({ theme }) => `${theme.radius.lg} ${theme.radius.lg} 0 0`};
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
  padding: ${({ theme }) => theme.spacing.lg};
  overflow: auto;
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

  background: none;
  border: none;
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
    <CloseButton {...props}>
      <Icon $icon={X} $stroke={4} />
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
 * Full-screen modal component providing `Header`, `Body`, and `Footer` layout slots and an optional close button.
 * Renders only when `$isOpen` is true and handles overlay clicks to close.
 * @param $isOpen - Controls whether the modal is visible.
 * @param $onClose - Callback invoked when the user requests to close the modal (overlay click or CloseButton).
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
} = ({ $isOpen, $onClose, children, ...rest }) => {
  if (!$isOpen) return null;

  return (
    <Overlay onClick={$onClose}>
      <Dialog onClick={(e) => e.stopPropagation()} {...rest}>
        {children}
      </Dialog>
    </Overlay>
  );
};

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;
Modal.CloseButton = ModalCloseButton;
