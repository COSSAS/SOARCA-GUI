import styled from "styled-components";
import { DetailsValue, Spacer } from "@/components";
import { ScrollArea } from "@/components/ScrollArea";

export const AccountMenu = styled.div`
  margin-inline: -${({ theme }) => theme.spacing.xs};

  > button {
    gap: ${({ theme }) => theme.spacing.sm};
    justify-content: flex-start;

    width: 100%;
    padding: ${({ theme }) => theme.spacing.xs};
    border-radius: ${({ theme }) => theme.radius.md};

    text-align: left;
  }
`;

export const AccountMenuContent = styled(Spacer)`
  padding: ${({ theme }) => theme.spacing.md};

  ${DetailsValue} {
    overflow: hidden;
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const AccountAvatar = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${({ theme }) => theme.radius.full};

  font: ${({ theme }) => theme.typography.bodyMedium.font};
  color: ${({ theme }) => theme.colors.info.solidText};

  background: ${({ theme }) => theme.colors.info.solidBg};
`;

export const AccountIdentity = styled.span`
  overflow: hidden;
  display: flex;
  flex: 1;
  flex-direction: column;

  min-width: 0;
`;

export const AccountName = styled.span`
  overflow: hidden;
  font: ${({ theme }) => theme.typography.bodyMedium.font};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const AccountEmail = styled.span`
  overflow: hidden;

  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MainWrapper = styled.div`
  overflow: hidden;
  display: flex;
  height: 100vh;
`;

// A size container, so MainContent can take the visible height with cqh.
export const ContentArea = styled(ScrollArea)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.secondary.bg};

  > [data-radix-scroll-area-viewport] {
    container-type: size;
  }
`;

// Grows with its page. A page marked with data-fill-height gets exactly the
// visible height instead, so it can scroll parts of itself.
export const MainContent = styled.main`
  min-width: 550px;
  padding: ${({ theme }) => theme.spacing.lg};

  &:has(> [data-fill-height]) {
    height: 100cqh;
  }
`;
