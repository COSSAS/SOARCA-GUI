import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Info, SquareChartGantt } from "lucide-react";
import React from "react";
import { useParams } from "react-router";

import { getReportOfExecutionById } from "@/api/reporter";
import {
  Badge,
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  ExpandableText,
  FormLabel,
  Icon,
  Link,
  Spacer,
  SuspenseCard,
  Tabs,
  TabsProvider,
  Text,
  ThemeSize,
  useTabs,
} from "@/components";
import {
  getBadgeVariantFromStatus,
  getIconFromStatus,
  getPlaybookStatusFromSoarcaStatus,
} from "@/pages/main-page/monitoring-page/utils";
import { PlaybookExecutionReport, StepExecutionReport } from "@/types";
import {
  DetailsGrid,
  DetailsItem,
  DetailsValue,
  NoStepsMessage,
  ResponsiveLayout,
  TabContent,
  TabsSection,
} from "./ExecutionDetailPage.styles";

import { getErrorFromApiResponse } from "@/api/utils";
import { SoarcaApiPlaybookExecutionStatus } from "@/enums";
import { formatDateTime, PATHS } from "@/utils";
import { DetailsTabView } from "./details-tab-view/DetailsTabView";
import { TimelineTabView } from "./timeline-tab-view/TimelineTabView";

const TABS = { timeline: "timeline", detailed: "detailed" } as const;

export const ExecutionDetailPage: React.FC = () => {
  const { executionId } = useParams();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["report", executionId],
    queryFn: () => getReportOfExecutionById(executionId!),
    enabled: !!executionId, // only run the query if executionId is defined
    staleTime: 1000,
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: (data) => {
      // if the status of the playbook is ongoing, refetch every second
      // otherwise there is no point in refetching
      if (!data) return false;
      return data.status === SoarcaApiPlaybookExecutionStatus.ONGOING
        ? 1000
        : false;
    },
    refetchIntervalInBackground: true,
  });

  const report: PlaybookExecutionReport | undefined = data;
  const steps = Object.values(report?.step_results || {});
  const status = getPlaybookStatusFromSoarcaStatus(report?.status);
  const parsedError = getErrorFromApiResponse(error as Error);

  return (
    <Spacer $direction="vertical" $gap="lg" $align="start">
      <Link $to={PATHS.MONITORING.BASE}>
        <Icon $icon={ArrowLeft} />
        Back to monitoring
      </Link>
      <SuspenseCard
        $isLoading={isLoading}
        $isError={isError}
        $errorMessage={parsedError?.message}
        $returnedNoContent={!isLoading && !isError && !report}
        $noContentMessage="No report data found for this execution."
      >
        <CardContainer>
          <CardHeader>
            <CardTitle>{report?.name}</CardTitle>
          </CardHeader>
          <CardBody>
            <ResponsiveLayout>
              <DetailsGrid>
                <DetailsItem>
                  <FormLabel>Execution ID</FormLabel>
                  <Text>{report?.execution_id}</Text>
                </DetailsItem>
                <DetailsItem>
                  <FormLabel>Status</FormLabel>
                  <Badge $variant={getBadgeVariantFromStatus(status)}>
                    <Icon
                      $icon={getIconFromStatus(status)}
                      $size={ThemeSize.Medium}
                    />
                    {status}
                  </Badge>
                </DetailsItem>
                <DetailsItem>
                  <FormLabel>Description</FormLabel>
                  <ExpandableText
                    $text={
                      <DetailsValue>{report?.description || "—"}</DetailsValue>
                    }
                  />
                </DetailsItem>
                <DetailsItem>
                  <FormLabel>Status details</FormLabel>
                  <ExpandableText
                    $text={
                      <DetailsValue>{report?.status_text || "—"}</DetailsValue>
                    }
                  />
                </DetailsItem>
                <DetailsItem>
                  <FormLabel>Started</FormLabel>
                  <Text>{formatDateTime(report?.started)}</Text>
                </DetailsItem>
                <DetailsItem>
                  <FormLabel>Ended</FormLabel>
                  <Text>{formatDateTime(report?.ended)}</Text>
                </DetailsItem>
              </DetailsGrid>
              {steps.length === 0 ? (
                <NoStepsMessage>
                  <Text>No steps found for this execution.</Text>
                </NoStepsMessage>
              ) : (
                <TabsProvider initialTab={TABS.timeline}>
                  <TabsSection>
                    <Tabs
                      tabs={[
                        {
                          id: TABS.timeline,
                          label: (
                            <Spacer
                              $direction="horizontal"
                              $gap="xs"
                              $align="center"
                            >
                              <Icon $icon={SquareChartGantt} /> Timeline
                            </Spacer>
                          ),
                        },
                        {
                          id: TABS.detailed,
                          label: (
                            <Spacer
                              $direction="horizontal"
                              $gap="xs"
                              $align="center"
                            >
                              <Icon $icon={Info} /> Details
                            </Spacer>
                          ),
                        },
                      ]}
                    />
                    <TabContentRenderer
                      steps={steps}
                      playbookId={report?.playbook_id}
                      executionId={report?.execution_id}
                      onRefetch={refetch}
                    />
                  </TabsSection>
                </TabsProvider>
              )}
            </ResponsiveLayout>
          </CardBody>
        </CardContainer>
      </SuspenseCard>
    </Spacer>
  );
};

interface TabContentRendererProps {
  steps: StepExecutionReport[];
  playbookId?: string;
  executionId?: string;
  onRefetch?: () => Promise<
    QueryObserverResult<PlaybookExecutionReport, unknown>
  >;
}

const TabContentRenderer: React.FC<TabContentRendererProps> = ({
  steps,
  playbookId,
  executionId,
  onRefetch,
}) => {
  const { activeTab } = useTabs();

  return (
    <TabContent>
      {activeTab === TABS.timeline ? (
        <TimelineTabView
          steps={steps}
          playbookId={playbookId}
          executionId={executionId}
          onRefetch={onRefetch}
        />
      ) : (
        <DetailsTabView steps={steps} />
      )}
    </TabContent>
  );
};
