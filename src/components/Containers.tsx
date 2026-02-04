import styled from "styled-components";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  $backgroundImage?: string;
}

/**
 * Full-height page container with centered content.
 * Useful for simple pages with minimal layout requirements, such as login or error pages.
 * Accepts an optional background image.
 * @param $backgroundImage - URL of the background image
 * @example
 * <PageContainer $backgroundImage={soarcaBackground}>
 *   <YourContent />
 * </PageContainer>
 */
export const PageContainer = styled.div<PageContainerProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  min-height: 100vh;

  background-color: ${({ theme }) => theme.colors.background.secondary};
  ${({ $backgroundImage }) =>
    $backgroundImage &&
    `
    background-image: url(${$backgroundImage});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  `}

  padding: 0;
`;
