import styled from "styled-components";

/**
 * Basic card container with border, shadow, and theme-based styling.
 * Provides a white background with rounded corners and subtle elevation.
 * Use as a wrapper for CardHeader, CardBody, and CardFooter components.
 * @example
 * <CardContainer>
 *   <CardHeader><CardTitle>Title</CardTitle></CardHeader>
 *   <CardBody>Content goes here</CardBody>
 * </CardContainer>
 */
export const CardContainer = styled.div`
  box-sizing: border-box;
  width: 100%;

  background: ${({ theme }) => theme.colors.background.primary};

  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.md};

  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  $isClickable?: boolean;
}

/**
 * Card header section with bottom border separator.
 * Displays title and optional actions in a space-between layout.
 * Can be made clickable for expandable cards using $isClickable prop.
 * @param $isClickable - When true, changes cursor to pointer for interactive headers. Defaults to false.
 * @example
 * <CardHeader>
 *   <CardTitle>Report Details</CardTitle>
 *   <button>Action</button>
 * </CardHeader>
 */
export const CardHeader = styled.div<CardHeaderProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};

  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};

  cursor: ${({ $isClickable }) => ($isClickable ? "pointer" : "default")};
`;
/**
 * Card title component typically used within CardHeader for consistent heading styling.
 * @example
 * <CardTitle>Execution Report</CardTitle>
 */
export const CardTitle = styled.h2`
  margin: 0;

  font: ${({ theme }) => theme.typography.bodyMedium.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;
/**
 * Card body section for main content with padding.
 * @example
 * <CardBody>
 *   <p>Main content area</p>
 * </CardBody>
 */
export const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;
/**
 * Card footer section for actions, aligned to the right.
 * @example
 * <CardFooter>
 *   <Button $variant="secondary">Cancel</Button>
 *   <Button>Save</Button>
 * </CardFooter>
 */
export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};

  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;
