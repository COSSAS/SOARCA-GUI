import { DetailsItem, DetailsValue, FormLabel } from "@/components";
import type { AuthPrincipal } from "@/types";

interface AccountDetailsProps {
  principal: AuthPrincipal;
  showPermissions?: boolean;
}

export const AccountDetails = ({
  principal,
  showPermissions = false,
}: AccountDetailsProps) => (
  <>
    <DetailsItem>
      <FormLabel>Full name</FormLabel>
      <DetailsValue>{principal.name || "Not provided"}</DetailsValue>
    </DetailsItem>
    <DetailsItem>
      <FormLabel>Email</FormLabel>
      <DetailsValue>{principal.email || "Not provided"}</DetailsValue>
    </DetailsItem>
    <DetailsItem>
      <FormLabel>Roles</FormLabel>
      <DetailsValue>
        {principal.roles?.join(", ") || "None assigned"}
      </DetailsValue>
    </DetailsItem>
    {showPermissions && (
      <DetailsItem>
        <FormLabel>Permissions</FormLabel>
        <DetailsValue>
          {Object.keys(principal.permissions)
            .filter((permission) => principal.permissions[permission])
            .join(", ") || "None assigned"}
        </DetailsValue>
      </DetailsItem>
    )}
  </>
);
