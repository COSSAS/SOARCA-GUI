import {
  Activity,
  BookOpen,
  FilePlusCorner,
  Home,
  LayoutDashboard,
  LucideIcon,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import logoDark from "@/assets/soarca-logo-cropped-dark.svg";
import logo from "@/assets/soarca-logo-cropped.svg";
import logoSmall from "@/assets/soarca-logo-small.svg";
import { PATHS, SOARCA_DOC_URL } from "@/utils";

import {
  Button,
  ButtonWidth,
  Icon,
  ImageContainer,
  Link,
  NavItem,
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarLogoContainer,
  SidebarNav,
  Spacer,
  ThemeSize,
  ThemeVariant,
} from "@/components";

import { useThemeMode } from "@/theme/ThemeModeContext";
import {
  ContentArea,
  MainContent,
  MainHeader,
  MainWrapper,
  MobileMenuButton,
  Overlay,
} from "./MainPage.styles";
import { StatusIndicator } from "./StatusIndicator";

interface NavRoute {
  path: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ROUTES: NavRoute[] = [
  { path: PATHS.DASHBOARD, label: "Dashboard (Soon™)", icon: Home },
  {
    path: PATHS.PLAYBOOKS.BASE,
    label: "Playbooks (Beta)",
    icon: LayoutDashboard,
  },
  { path: PATHS.MONITORING.BASE, label: "Monitoring", icon: Activity },
  { path: PATHS.SETTINGS, label: "Settings (Beta)", icon: Settings },
];

export const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { resolved } = useThemeMode();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  return (
    <MainWrapper>
      <Overlay $isOpen={sidebarOpen} onClick={closeSidebar} />
      <Sidebar $isOpen={sidebarOpen}>
        <SidebarHeader>
          <SidebarLogoContainer>
            <ImageContainer
              src={resolved === "dark" ? logoDark : logo}
              alt="SOARCA Logo"
              $width="11.5rem"
            />
          </SidebarLogoContainer>
          <Button
            $variant={ThemeVariant.Primary}
            $size={ThemeSize.Small}
            $width={ButtonWidth.Full}
            onClick={() => handleNavigation(PATHS.PLAYBOOKS.NEW)}
          >
            <Icon $icon={FilePlusCorner} />
            New playbook
          </Button>
        </SidebarHeader>
        <SidebarNav>
          {NAV_ROUTES.map((route) => (
            <NavItem
              key={route.path}
              $isActive={
                location.pathname === route.path ||
                (route.path === PATHS.MONITORING.BASE &&
                  location.pathname.includes(PATHS.MONITORING.BASE)) ||
                (route.path === PATHS.PLAYBOOKS.BASE &&
                  location.pathname.includes(PATHS.PLAYBOOKS.BASE))
              }
              onClick={() => handleNavigation(route.path)}
            >
              <Icon $icon={route.icon} />
              {route.label}
            </NavItem>
          ))}
        </SidebarNav>
        <SidebarFooter>
          <Link
            $variant="subtle"
            $to={SOARCA_DOC_URL}
            target="_blank"
            rel="help noopener noreferrer"
          >
            <Icon $icon={BookOpen} />
            Docs
          </Link>
        </SidebarFooter>
      </Sidebar>
      <ContentArea>
        <MainHeader>
          <StatusIndicator />
          <Spacer $gap="lg" $align="center" className="mobile-menu">
            <ImageContainer
              src={logoSmall}
              alt="SOARCA Logo"
              $width="2.5rem"
              style={{ display: "none" }}
              className="mobile-logo"
            />
            <MobileMenuButton
              onClick={sidebarOpen ? closeSidebar : openSidebar}
            >
              {sidebarOpen ? (
                <Icon $icon={X} $size={ThemeSize.ExtraLarge} />
              ) : (
                <Icon $icon={Menu} $size={ThemeSize.ExtraLarge} />
              )}
            </MobileMenuButton>
          </Spacer>
        </MainHeader>
        <MainContent>
          <Outlet />
        </MainContent>
      </ContentArea>
    </MainWrapper>
  );
};
