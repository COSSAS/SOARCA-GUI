import {
  IconActivity,
  IconBook,
  IconChevronLeft,
  IconChevronRight,
  IconFilePlus,
  IconHome,
  IconMenu2,
  IconNotebook,
  IconSettings,
  IconX,
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
import { PATHS, SOARCA_DOC_URL } from "@/utils";

import {
  Button,
  Icon,
  NavItem,
  Popover,
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarAction,
  SidebarActionLabel,
  SidebarLabel,
  SidebarLogo,
  SidebarLogos,
  SidebarNav,
  Spacer,
  ThemeSize,
  ThemeVariant,
} from "@/components";

import { useThemeMode } from "@/theme/ThemeModeContext";
import {
  ContentArea,
  AccountAvatar,
  AccountMenu,
  AccountMenuContent,
  MainContent,
  MainHeader,
  MainWrapper,
  MobileLogo,
  MobileMenuButton,
  Overlay,
} from "./MainPage.styles";
import { AccountDetails } from "./AccountDetails";
import { StatusIndicator } from "./StatusIndicator";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === "true",
  );

  const toggleCollapsed = () => {
    localStorage.setItem(COLLAPSED_KEY, String(!collapsed));
    setCollapsed(!collapsed);
  };

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  return (
    <MainWrapper>
      <Overlay $isOpen={sidebarOpen} onClick={closeSidebar} />
      <Sidebar $isOpen={sidebarOpen} $collapsed={collapsed}>
        <SidebarHeader>
          <SidebarLogos>
            <SidebarLogo
              src={resolved === "dark" ? logoDark : logo}
              alt="SOARCA Logo"
              $hidden={collapsed}
            />
            <SidebarLogo
              src={logoSmall}
              alt=""
              $small
              $hidden={!collapsed}
            />
          </SidebarLogos>
          <RequirePermission permission={Permissions.PlaybookWrite}>
            <SidebarAction
              $variant={ThemeVariant.Primary}
              $fullWidth
              title={collapsed ? "New playbook" : undefined}
              onClick={() => handleNavigation(PATHS.PLAYBOOKS.NEW)}
            >
              <Icon $icon={IconFilePlus} />
              <SidebarActionLabel $hidden={collapsed}>New playbook</SidebarActionLabel>
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
        <SidebarFooter>
          <NavItem
            href={SOARCA_DOC_URL}
            target="_blank"
            rel="help noopener noreferrer"
            title="Docs"
          >
            <Icon $icon={IconBook} />
          </NavItem>
          <NavItem
            as="button"
            type="button"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleCollapsed}
          >
            <Icon $icon={collapsed ? IconChevronRight : IconChevronLeft} />
          </NavItem>
        </SidebarFooter>
      </Sidebar>
      <ContentArea>
        <MainHeader>
          <StatusIndicator />
          <Spacer $gap="lg" $align="center" className="mobile-menu">
            <MobileLogo
              src={logoSmall}
              alt="SOARCA Logo"
              className="mobile-logo"
            />
            <MobileMenuButton
              onClick={sidebarOpen ? closeSidebar : openSidebar}
            >
              {sidebarOpen ? (
                <Icon $icon={IconX} $size={ThemeSize.Large} />
              ) : (
                <Icon $icon={IconMenu2} $size={ThemeSize.Large} />
              )}
            </MobileMenuButton>
          </Spacer>
          {auth.user && !auth.user.anonymous && (
            <AccountMenu>
              <Popover
                id="account-menu"
                $label="Account menu"
                $trigger={
                  <AccountAvatar aria-hidden="true">
                    {initial(auth.user)}
                  </AccountAvatar>
                }
              >
                <AccountMenuContent
                  $direction="vertical"
                  $align="stretch"
                  $gap="md"
                >
                  <AccountDetails user={auth.user} />
                  <Button
                    $variant={ThemeVariant.Error}
                    $fullWidth
                    onClick={auth.logout}
                  >
                    Log out
                  </Button>
                </AccountMenuContent>
              </Popover>
            </AccountMenu>
          )}
        </MainHeader>
        <MainContent>
          <Outlet />
        </MainContent>
      </ContentArea>
    </MainWrapper>
  );
};
