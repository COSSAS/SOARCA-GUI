import { NotificationCard, ThemeVariant } from "@/components";

import type { Issue } from "../model/rules";
import { IssueList } from "./Panel.styles";

const Notice: React.FC<{ issues: Issue[]; variant: ThemeVariant }> = ({ issues, variant }) =>
  issues.length > 0 && (
    <NotificationCard $variant={variant}>
      <IssueList>
        {issues.map((issue) => (
          <li key={issue.message}>{issue.message}</li>
        ))}
      </IssueList>
    </NotificationCard>
  );

/** Issues of a step or the playbook that belong to no single field. */
export const IssueNotices: React.FC<{ issues: Issue[] }> = ({ issues }) => (
  <>
    <Notice issues={issues.filter((issue) => issue.blocking)} variant={ThemeVariant.Error} />
    <Notice issues={issues.filter((issue) => !issue.blocking)} variant={ThemeVariant.Warning} />
  </>
);
