import { Text } from "@/components";
import styled from "styled-components";

interface PlaceholderPageProps {
  content: string;
}

const PlaceholderContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.background.primary};
`;

const PlaceholderText = styled(Text)`
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  content,
}) => {
  return (
    <PlaceholderContainer>
      <PlaceholderText>{content}</PlaceholderText>
    </PlaceholderContainer>
  );
};
