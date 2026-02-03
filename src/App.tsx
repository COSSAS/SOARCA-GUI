import { Navigate, Route, Routes } from "react-router";

import { ToasterSetup } from "./ToasterSetup";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { MainPage } from "./pages/main-page/MainPage";
import { SettingsPage } from "./pages/main-page/SettingsPage";
import { ExecutionDetailPage } from "./pages/main-page/monitoring-page/ExecutionDetailPage";
import { MonitoringPage } from "./pages/main-page/monitoring-page/MonitoringPage";
import { PlaybookCreatePage } from "./pages/main-page/playbooks-page/PlaybookCreatePage";
import { PlaybookEditPage } from "./pages/main-page/playbooks-page/PlaybookEditPage";
import { PlaybooksPage } from "./pages/main-page/playbooks-page/PlaybooksPage";
import { PlaybookDetailPage } from "./pages/main-page/playbooks-page/playbook-detail-page/PlaybookDetailPage";
import { PATHS } from "./utils";

function App() {
  return (
    <>
      <ToasterSetup />
      <Routes>
        <Route path={PATHS.LOGIN} element={<LoginPage />} />
        <Route path={PATHS.NOT_FOUND} element={<NotFoundPage />} />
        <Route path={PATHS.BASE} element={<MainPage />}>
          <Route index element={<Navigate to={PATHS.DASHBOARD} replace />} />
          <Route
            path={PATHS.DASHBOARD}
            element={<PlaceholderPage content="⚠️ Dashboard coming soon!" />}
          />
          <Route path={PATHS.PLAYBOOKS.BASE} element={<PlaybooksPage />} />
          <Route path={PATHS.PLAYBOOKS.NEW} element={<PlaybookCreatePage />} />
          <Route path={PATHS.PLAYBOOKS.EDIT} element={<PlaybookEditPage />} />
          <Route
            path={PATHS.PLAYBOOKS.DETAIL}
            element={<PlaybookDetailPage />}
          />
          <Route path={PATHS.MONITORING.BASE} element={<MonitoringPage />} />
          <Route
            path={PATHS.MONITORING.DETAIL}
            element={<ExecutionDetailPage />}
          />
          <Route path={PATHS.SETTINGS} element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to={PATHS.NOT_FOUND} replace />} />
      </Routes>
    </>
  );
}

export default App;
