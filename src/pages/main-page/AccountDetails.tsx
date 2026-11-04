import { DetailsItem, DetailsValue, FormLabel } from "@/components";
import type { SessionUser } from "@/types";

interface AccountDetailsProps {
  user: SessionUser;
  detailed?: boolean;
}

export const AccountDetails = ({
  user,
  detailed = false,
}: AccountDetailsProps) => (
  <>
    <DetailsItem>
      <FormLabel>Full name</FormLabel>
      <DetailsValue>{user.name || "Not provided"}</DetailsValue>
    </DetailsItem>
    <DetailsItem>
      <FormLabel>Email</FormLabel>
      <DetailsValue>{user.email || "Not provided"}</DetailsValue>
    </DetailsItem>
    {detailed && (
      <>
        <DetailsItem>
          <FormLabel>Account ID</FormLabel>
          <DetailsValue>{user.subject}</DetailsValue>
        </DetailsItem>
        <DetailsItem>
          <FormLabel>Permissions</FormLabel>
          <DetailsValue>
            {user.permissions.join(", ") || "None assigned"}
          </DetailsValue>
        </DetailsItem>
      </>
    )}
  </>
);
