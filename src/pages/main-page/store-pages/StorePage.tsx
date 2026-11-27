import { NavLink, useLocation } from "react-router";

import { useAuth } from "@/auth/AuthContext";
import { PATHS } from "@/utils";

import { ResourcesLayout, TableTabs } from "./StorePages.styles";
import { SecretsPage } from "./SecretsPage";
import { RESOURCE_TABS, resourceTabAt } from "./utils";
import { VariablesPage } from "./VariablesPage";

export function StorePage() {
  const { can } = useAuth();
  const { pathname } = useLocation();

  return (
    <ResourcesLayout>
      <TableTabs>
        {RESOURCE_TABS.filter((tab) => can(tab.permission)).map((tab) => (
          <NavLink key={tab.path} to={tab.path}>
            {tab.label}
          </NavLink>
        ))}
      </TableTabs>
      {resourceTabAt(pathname)?.path === PATHS.SECRETS ? (
        <SecretsPage />
      ) : (
        <VariablesPage />
      )}
    </ResourcesLayout>
  );
}
