import {
  IconActivity,
  IconChevronLeft,
  IconChevronRight,
  IconFilePlus,
  IconHome,
  IconLogout,
  IconNotebook,
  IconSettings,
  IconStack2,
  type TablerIcon,
} from "@tabler/icons-react";
import { useState } from "react";
import { matchPath, Outlet, useLocation, useNavigate } from "react-router";

import logoDark from "@/assets/soarca-logo-cropped-dark.svg";
import logo from "@/assets/soarca-logo-cropped.svg";
import logoSmall from "@/assets/soarca-logo-small.svg";
import { useAuth } from "@/auth/AuthContext";
import { RequirePermission } from "@/auth/AuthGate";
import { Permissions, type Permission } from "@/auth/permissions";
import type { SessionUser } from "@/types";
import { PATHS } from "@/utils";

import {
  Button,
  Icon,
  NavItem,
  Popover,
  Sidebar,
  SidebarBottom,
  SidebarFooter,
  SidebarHeader,
  SidebarAction,
  SidebarActionLabel,
  SidebarLabel,
  SidebarLogo,
  SidebarLogos,
  SidebarNav,
  ThemeVariant,
} from "@/components";

import { useThemeMode } from "@/theme/ThemeModeContext";
import {
  ContentArea,
  AccountAvatar,
  AccountEmail,
  AccountIdentity,
  AccountMenu,
  AccountMenuContent,
  AccountName,
  MainContent,
  MainWrapper,
} from "./MainPage.styles";
import { AccountDetails } from "./AccountDetails";
import { StatusIndicator } from "./StatusIndicator";
import { resourceTabAt, RESOURCE_TABS } from "./store-pages/utils";
import { ThemeModeControl } from "./ThemeModeControl";

interface NavRoute {
  label: string;
  icon: TablerIcon;
  /** The item opens the first permitted page and is active on any of them. */
  pages: readonly { path: string; permission?: Permission }[];
}

const NAV_ROUTES: NavRoute[] = [
  { label: "Dashboard", icon: IconHome, pages: [{ path: PATHS.DASHBOARD }] },
  {
    label: "Playbooks",
    icon: IconNotebook,
    pages: [
      { path: PATHS.PLAYBOOKS.BASE, permission: Permissions.PlaybookRead },
    ],
  },
  {
    label: "Monitoring",
    icon: IconActivity,
    pages: [
      { path: PATHS.MONITORING.BASE, permission: Permissions.PlaybookRead },
    ],
  },
  { label: "Resources", icon: IconStack2, pages: RESOURCE_TABS },
  { label: "Settings", icon: IconSettings, pages: [{ path: PATHS.SETTINGS }] },
];

const initial = (user: SessionUser) =>
  (user.name?.trim() || user.email || "?").charAt(0).toLocaleUpperCase();

const COLLAPSED_KEY = "soarca-sidebar-collapsed";

export const MainPage: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { resolved } = useThemeMode();
  const location = useLocation();
  const isResources = !!resourceTabAt(location.pathname);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === "true",
  );

  const toggleCollapsed = () => {
    localStorage.setItem(COLLAPSED_KEY, String(!collapsed));
    setCollapsed(!collapsed);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <MainWrapper>
      <Sidebar $collapsed={collapsed}>
        <SidebarHeader>
          <SidebarLogos>
            <SidebarLogo
              src={resolved === "dark" ? logoDark : logo}
              alt="SOARCA Logo"
              $hidden={collapsed}
            />
            <SidebarLogo src={logoSmall} alt="" $small $hidden={!collapsed} />
            <StatusIndicator collapsed={collapsed} />
          </SidebarLogos>
          <RequirePermission permission={Permissions.PlaybookWrite}>
            <SidebarAction
              $variant={ThemeVariant.Primary}
              title={collapsed ? "New playbook" : undefined}
              onClick={() => handleNavigation(PATHS.PLAYBOOKS.NEW)}
            >
              <Icon $icon={IconFilePlus} />
              <SidebarActionLabel $hidden={collapsed}>
                New playbook
              </SidebarActionLabel>
            </SidebarAction>
          </RequirePermission>
        </SidebarHeader>
        <SidebarNav>
          {NAV_ROUTES.map((route) => {
            const target = route.pages.find(
              (page) => !page.permission || auth.can(page.permission),
            );
            if (!target) return null;
            return (
              <NavItem
                key={route.label}
                $isActive={route.pages.some(
                  (page) =>
                    !!matchPath(
                      { path: page.path, end: false },
                      location.pathname,
                    ),
                )}
                title={collapsed ? route.label : undefined}
                onClick={() => handleNavigation(target.path)}
              >
                <Icon $icon={route.icon} />
                <SidebarLabel $hidden={collapsed}>{route.label}</SidebarLabel>
              </NavItem>
            );
          })}
        </SidebarNav>
        <SidebarBottom>
          {auth.user && !auth.user.anonymous && (
            <AccountMenu>
              <Popover
                id="account-menu"
                $label="Account menu"
                $trigger={
                  <>
                    <AccountAvatar>{initial(auth.user)}</AccountAvatar>
                    <AccountIdentity>
                      <AccountName>{auth.user.name || "Account"}</AccountName>
                      <AccountEmail title={auth.user.email || undefined}>
                        {auth.user.email || "Not provided"}
                      </AccountEmail>
                    </AccountIdentity>
                  </>
                }
              >
                <AccountMenuContent
                  $direction="vertical"
                  $align="stretch"
                  $gap="md"
                >
                  <AccountDetails user={auth.user} />
                  <ThemeModeControl />
                  <Button
                    $variant={ThemeVariant.Error}
                    $fullWidth
                    onClick={auth.logout}
                  >
                    <Icon $icon={IconLogout} />
                    Log out
                  </Button>
                </AccountMenuContent>
              </Popover>
            </AccountMenu>
          )}
          <SidebarFooter>
            <NavItem
              as="button"
              type="button"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={toggleCollapsed}
            >
              <Icon $icon={collapsed ? IconChevronRight : IconChevronLeft} />
            </NavItem>
          </SidebarFooter>
        </SidebarBottom>
      </Sidebar>
      <ContentArea $resources={isResources}>
        <MainContent $resources={isResources}>
          <Outlet />
        </MainContent>
      </ContentArea>
    </MainWrapper>
  );
};
