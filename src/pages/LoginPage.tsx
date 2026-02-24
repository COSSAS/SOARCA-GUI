import { HelpCircle, KeyRound, LockKeyholeOpen } from "lucide-react";
import styled from "styled-components";

import soarcaBackground from "@/assets/soarca-background.jpg";
import logoDark from "@/assets/soarca-logo-cropped-dark.svg";
import logo from "@/assets/soarca-logo-cropped.svg";

import {
  Button,
  ButtonWidth,
  FormContainer,
  FormGroup,
  FormLabel,
  Icon,
  ImageContainer,
  Input,
  Link,
  PageContainer,
  Spacer,
  ThemeVariant,
} from "@/components";
import { useThemeMode } from "@/theme";

export const LoginPage: React.FC = () => {
  const { resolved } = useThemeMode();
  return (
    <PageContainer $backgroundImage={soarcaBackground}>
      <LoginCard>
        <LoginCardHeader>
          <Spacer $gap="md" $align="center" $justify="center">
            <ImageContainer
              src={resolved === "dark" ? logoDark : logo}
              alt="SOARCA Logo"
            />
          </Spacer>
        </LoginCardHeader>
        <LoginCardBody>
          <FormContainer>
            <FormGroup>
              <FormLabel htmlFor="email">Email address</FormLabel>
              <Input id="email" type="email" placeholder="you@example.com" />
            </FormGroup>
            <FormGroup>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input id="password" type="password" placeholder="••••••••" />
            </FormGroup>
            <Button
              type="submit"
              $variant={ThemeVariant.Primary}
              $width={ButtonWidth.Full}
            >
              Log in
            </Button>
            <Button
              type="button"
              $variant={ThemeVariant.Primary}
              $width={ButtonWidth.Full}
            >
              <Icon $icon={LockKeyholeOpen} />
              Log in with OIDC
            </Button>
          </FormContainer>
        </LoginCardBody>
        <LoginCardFooter>
          <Spacer
            $direction="horizontal"
            $align="center"
            $justify="space-between"
          >
            <Link $to="/forgot-password" $variant="subtle">
              <Icon $icon={KeyRound} />
              Forgot password
            </Link>
            <Link $to="/help" $variant="subtle">
              <Icon $icon={HelpCircle} />
              Help
            </Link>
          </Spacer>
        </LoginCardFooter>
      </LoginCard>
    </PageContainer>
  );
};

const LoginCard = styled.div`
  width: 100%;
  max-width: 28rem;
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.radius.lg};
  border-top: 1px solid transparent;

  margin: 0 auto;
  box-shadow: ${({ theme }) => theme.shadows.base};

  overflow: hidden;
`;

const LoginCardHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  padding: ${({ theme }) => theme.spacing["3xl"]} ${({ theme }) => theme.spacing.xl};
`;

const LoginCardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const LoginCardFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  padding: ${({ theme }) => theme.spacing.xl};
`;
