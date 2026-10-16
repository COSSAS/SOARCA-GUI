import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router";

import soarcaBackground from "@/assets/soarca-background.jpg";
import {
  Button,
  Icon,
  PageContainer,
  ThemeVariant,
} from "@/components";
import { PATHS } from "@/utils";
import styled from "styled-components";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer $backgroundImage={soarcaBackground}>
      <ErrorContainer>
        <ErrorCode>404</ErrorCode>
        <ErrorTitle>We can’t find that page</ErrorTitle>
        <ErrorDescription>
          Sorry, the page you're looking for doesn't exist or has been moved.
        </ErrorDescription>
        <ButtonGroup>
          <Button
            $variant={ThemeVariant.Primary}
            $ghost
            $fullWidth
            onClick={() => navigate(-1)}
          >
            <Icon $icon={IconArrowLeft} />
            Go Back
          </Button>
          <Button
            $fullWidth
            onClick={() => navigate(PATHS.BASE)}
          >
            Take me home
          </Button>
        </ButtonGroup>
      </ErrorContainer>
    </PageContainer>
  );
};

const ErrorContainer = styled.div`
  /* Layout */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* Spacing */
  gap: ${({ theme }) => theme.spacing["2xl"]};
  padding: ${({ theme }) => theme.spacing["3xl"]};

  /* Colors & Background */
  background-color: ${({ theme }) => theme.colors.background.primary};

  /* Shape & Visuals */
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadows.base};

  /* Sizing */
  width: 32rem;
  text-align: center;
`;

const ErrorCode = styled.h1`
  /* Typography */
  font-size: 5rem;
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.primary.main};
  line-height: 1;
`;

const ErrorTitle = styled.h2`
  /* Typography */
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.h2.font};
`;

const ErrorDescription = styled.p`
  /* Typography & Layout */
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 400px;
  font: ${({ theme }) => theme.typography.body.font};
`;

const ButtonGroup = styled.div`
  /* Layout */
  display: flex;

  /* Spacing */
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};

  /* Alignment */
  justify-content: center;
  flex-wrap: wrap;
`;
