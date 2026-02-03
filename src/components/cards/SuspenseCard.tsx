import React from "react";
import styled from "styled-components";

import { theme } from "@/theme";
import { shimmer } from "@/theme/animations";
import { Text } from "../Typography";
import { CardBody, CardContainer, CardFooter, CardHeader } from "./Card";

const SuspenseBody = styled(CardBody)`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.spacing.md};
`;

const SkeletonLine = styled.div`
  height: 1.5rem;

  border-radius: ${({ theme }) => theme.radius.full};

  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.info.bg} 0%,
    ${({ theme }) => theme.colors.accent.bg} 50%,
    ${({ theme }) => theme.colors.info.bg} 100%
  );
  background-size: 200px 100%;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  animation: ${shimmer} 1.5s linear infinite;
`;

const SkeletonWrapper = styled.div<{ $visible: boolean }>`
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};

  transition: opacity ${({ theme }) => theme.transitions.base};
`;

const ErrorWrapper = styled.div<{ $visible: boolean }>`
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};

  transition: opacity ${({ theme }) => theme.transitions.base};

  color: ${({ theme }) => theme.colors.error.text};
  text-align: center;
`;

const NoContentWrapper = styled.div<{ $visible: boolean }>`
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};

  transition: opacity ${({ theme }) => theme.transitions.base};

  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

export interface SuspenseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  $header?: React.ReactNode;
  $footer?: React.ReactNode;
  $isLoading: boolean;
  $isError?: boolean;
  $errorMessage?: string;
  $returnedNoContent?: boolean;
  $noContentMessage?: string;
}

/**
 * SuspenseCard for displaying a subtle, animated loading skeleton inside a card shell.
 * @param $header - Optional header content rendered in the non-loading card header area.
 * @param $footer - Optional footer content rendered in the card footer area.
 * @param $isLoading - When true shows the glowing skeleton instead of the actual children content.
 * @param $isError - When true shows an error state instead of normal content once loading has finished.
 * @param $errorMessage - Optional specific error message; falls back to a generic one.
 * @param $returnedNoContent - When true shows a no-content state instead of normal content (success but empty).
 * @param $noContentMessage - Optional specific no-content message; falls back to a generic one.
 * @example
 * <SuspenseCard
 *   $header={<CardTitle>Loading report</CardTitle>}
 *   $isLoading={isFetching}
 *   $isError={isError}
 *   $errorMessage={errorText}
 *   $returnedNoContent={!data}
 *   $noContentMessage="No report data available"
 * >
 *   <ActualContent />
 * </SuspenseCard>
 * @todo This card should probably be made to support the promise, and handle the states using the state of the promise.
 */
export const SuspenseCard: React.FC<SuspenseCardProps> = ({
  $header,
  $footer,
  $isLoading,
  $isError = false,
  $errorMessage,
  $returnedNoContent = false,
  $noContentMessage,
  children,
  ...rest
}) => {
  if ($isLoading) {
    return (
      <CardContainer {...rest}>
        {$header ? <CardHeader>{$header}</CardHeader> : null}
        <SkeletonWrapper $visible={true}>
          <SuspenseBody>
            <SkeletonLine />
            <SkeletonLine />
            <SkeletonLine style={{ width: "70%" }} />
            <SkeletonLine />
            <SkeletonLine style={{ width: "50%" }} />
            <SkeletonLine />
            <SkeletonLine style={{ width: "70%" }} />
          </SuspenseBody>
        </SkeletonWrapper>
        {$footer ? <CardFooter>{$footer}</CardFooter> : null}
      </CardContainer>
    );
  }

  if ($isError) {
    return (
      <CardContainer {...rest}>
        {$header ? <CardHeader>{$header}</CardHeader> : null}
        <SuspenseBody>
          <ErrorWrapper $visible={true}>
            <Text $color={theme.colors.error.text}>
              {$errorMessage || "Something went wrong while loading this data."}
            </Text>
          </ErrorWrapper>
        </SuspenseBody>
        {$footer ? <CardFooter>{$footer}</CardFooter> : null}
      </CardContainer>
    );
  }

  if ($returnedNoContent) {
    return (
      <CardContainer {...rest}>
        {$header ? <CardHeader>{$header}</CardHeader> : null}
        <SuspenseBody>
          <NoContentWrapper $visible={true}>
            <Text>
              {$noContentMessage ||
                "No content was found. The request was successful, but the expected data is not available."}
            </Text>
          </NoContentWrapper>
        </SuspenseBody>
        {$footer ? <CardFooter>{$footer}</CardFooter> : null}
      </CardContainer>
    );
  }

  return <>{children}</>;
};
