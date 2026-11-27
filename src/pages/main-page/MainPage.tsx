import {
  IconActivity,
  IconChevronLeft,
  IconChevronRight,
  IconFilePlus,
  IconHome,
  IconLogout,
  IconNotebook,
  IconSettings,
  type TablerIcon,
} from "@tabler/icons-react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

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
import { ThemeModeControl } from "./ThemeModeControl";

interface NavRoute {
  path: string;
  label: string;
  icon: TablerIcon;
  permission?: Permission;
}

const NAV_ROUTES: NavRoute[] = [
  { path: PATHS.DASHBOARD, label: "Dashboard", icon: IconHome },
  {
    path: PATHS.PLAYBOOKS.BASE,
    label: "Playbooks",
    icon: IconNotebook,
    permission: Permissions.PlaybookRead,
  },
  {
    path: PATHS.MONITORING.BASE,
    label: "Monitoring",
    icon: IconActivity,
    permission: Permissions.PlaybookRead,
  },
  { path: PATHS.SETTINGS, label: "Settings", icon: IconSettings },
];

const initial = (user: SessionUser) =>
  (user.name?.trim() || user.email || "?").charAt(0).toLocaleUpperCase();

const COLLAPSED_KEY = "soarca-sidebar-collapsed";

export const MainPage: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { resolved } = useThemeMode();
  const location = useLocation();
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
          {NAV_ROUTES.filter(
            (route) => !route.permission || auth.can(route.permission),
          ).map((route) => (
            <NavItem
              key={route.path}
              $isActive={
                location.pathname === route.path ||
                (route.path === PATHS.MONITORING.BASE &&
                  location.pathname.includes(PATHS.MONITORING.BASE)) ||
                (route.path === PATHS.PLAYBOOKS.BASE &&
                  location.pathname.includes(PATHS.PLAYBOOKS.BASE))
              }
              title={collapsed ? route.label : undefined}
              onClick={() => handleNavigation(route.path)}
            >
              <Icon $icon={route.icon} />
              <SidebarLabel $hidden={collapsed}>{route.label}</SidebarLabel>
            </NavItem>
          ))}
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
      <ContentArea>
        <MainContent>
          <Outlet />
        </MainContent>
      </ContentArea>
    </MainWrapper>
  );
};
