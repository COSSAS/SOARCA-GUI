import { useQuery } from "@tanstack/react-query";
import { BadgeAlert, Check, Play, X } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";

import { getReporterState } from "@/api/reporter";
import { getErrorFromApiResponse } from "@/api/utils";
import {
  Badge,
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  Cell,
  CenteredCardContent,
  HeaderCell,
  Icon,
  Row,
  Spacer,
  Spinner,
  Table,
  TableBody,
  TableHead,
  Text,
} from "@/components";
import { ThemeSize, ThemeVariant } from "@/components/utils";
import { PlaybookExecutionStatus } from "@/enums";
import {
  getBadgeVariantFromStatus,
  getPlaybookStatusFromSoarcaStatus,
} from "@/pages/main-page/monitoring-page/utils";
import { PlaybookRunReport } from "@/types";
import {
  computeDurationMs,
  formatDateTime,
  formatDuration,
  groupBy,
  PATHS,
} from "@/utils";

interface PlaybookRow {
  id: string;
  name: string;
  startTime: string;
  durationMs?: number;
  status: PlaybookExecutionStatus;
  hasActionRequired: boolean; // this will indicate if there are ongoing manual actions that require user intervention
}

const hasOngoingManualActions = (report: PlaybookRunReport): boolean => {
  const steps = Object.values(report.step_results || {});
  return steps.some(
    (step) => step.automated_execution === false && step.status === "ongoing",
  );
};

const parseReportToRows = (
  reports: PlaybookRunReport[],
): PlaybookRow[] => {
  return reports.map((report) => {
    const status = getPlaybookStatusFromSoarcaStatus(report.status);
    return {
      id: report.run_id,
      name: report.name,
      startTime: formatDateTime(report.started),
      durationMs: computeDurationMs(report.started, report.ended),
      status,
      hasActionRequired: hasOngoingManualActions(report),
    };
  });
};

export const MonitoringPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["monitoring"],
    queryFn: getReporterState,
    refetchInterval: (_, query) => (query.state.error ? 10000 : 1000),
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    retry: 3,
  });

  const rows = parseReportToRows(data || []) as PlaybookRow[];
  const parsedError = getErrorFromApiResponse(error);

  const navigateToExecutionDetail = (executionId: string) => {
    navigate(PATHS.MONITORING.DETAIL.replace(":executionId", executionId));
  };

  const renderBody = () => {
    if (isLoading)
      return (
        <CenteredCardContent>
          <Spinner $size={ThemeSize.Large} />
        </CenteredCardContent>
      );
    if (isError)
      return <Text>{parsedError?.message || "Could not load executions"}</Text>;
    if (rows.length === 0)
      return <Text>It looks like nothing is happening...</Text>;
    return (
      <Table>
        <TableHead>
          <tr>
            <HeaderCell>Playbook name</HeaderCell>
            <HeaderCell>Start time</HeaderCell>
            <HeaderCell>Execution duration</HeaderCell>
            <HeaderCell>Status</HeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <Row
              key={r.id}
              $isClickable
              onClick={() => navigateToExecutionDetail(r.id)}
            >
              <Cell>{r.name}</Cell>
              <Cell>{r.startTime}</Cell>
              <Cell>{formatDuration(r.durationMs)}</Cell>
              <Cell>
                <Badge
                  $variant={getBadgeVariantFromStatus(r.status)}
                  title={
                    r.hasActionRequired ? "Manual action(s) needed" : undefined
                  }
                >
                  {r.status}
                  {r.hasActionRequired && (
                    <Icon $icon={BadgeAlert} $size={ThemeSize.Medium} />
                  )}
                </Badge>
              </Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <CardContainer>
      <PlaybooksExecutionsCardHeader rows={rows} />
      <CardBody>{renderBody()}</CardBody>
    </CardContainer>
  );
};

interface PlaybooksExecutionsCardHeaderProps {
  rows: PlaybookRow[];
}

const PlaybooksExecutionsCardHeader: React.FC<
  PlaybooksExecutionsCardHeaderProps
> = ({ rows }) => {
  const groupedByStatus = groupBy(rows, (r) => r.status);

  const executedCount =
    groupedByStatus[PlaybookExecutionStatus.Executed]?.length || 0;
  const runningCount =
    groupedByStatus[PlaybookExecutionStatus.Running]?.length || 0;
  const failedCount =
    groupedByStatus[PlaybookExecutionStatus.Failed]?.length || 0;

  return (
    <CardHeader>
      <CardTitle>Playbooks executions</CardTitle>
      <Spacer $direction="horizontal" $gap="md">
        <Badge $variant={ThemeVariant.Success}>
          <Icon $icon={Check} /> {PlaybookExecutionStatus.Executed}{" "}
          <strong>{executedCount}</strong>
        </Badge>
        <Badge $variant={ThemeVariant.Warning}>
          <Icon $icon={Play} /> {PlaybookExecutionStatus.Running}{" "}
          <strong>{runningCount}</strong>
        </Badge>
        <Badge $variant={ThemeVariant.Error}>
          <Icon $icon={X} /> {PlaybookExecutionStatus.Failed}{" "}
          <strong>{failedCount}</strong>
        </Badge>
      </Spacer>
    </CardHeader>
  );
};
