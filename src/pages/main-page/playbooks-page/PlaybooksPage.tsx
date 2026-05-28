import { ThemeSize, ThemeVariant } from "@/components";
import { useQuery } from "@tanstack/react-query";
import { FilePlusCorner, MoreVertical } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { getPlaybooks } from "@/api/playbooks";
import { getErrorFromApiResponse } from "@/api/utils";
import {
  Button,
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  CenteredCardContent,
  Icon,
  Spinner,
  Text,
} from "@/components";
import { Playbook, Step } from "@/types";
import { PATHS, sortByString } from "@/utils";

import {
  PlaybookActions,
  PlaybookDescription,
  PlaybookInfo,
  PlaybookList,
  PlaybookListItem,
  PlaybookName,
  TimelineContainer,
  TimelineDot,
  TimelineLabel,
  TimelineLine,
  TimelineStep,
  TimelineSteps,
} from "./PlaybooksPage.styles";
import { getOrderedSteps } from "./utils";

interface PlaybookTimelineProps {
  workflow: Record<string, Step>;
  workflowStart: string;
}

const PlaybookTimeline: React.FC<PlaybookTimelineProps> = ({
  workflow,
  workflowStart,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Calculate max visible steps based on container width
  const getMaxVisibleSteps = () => {
    if (containerWidth < 200) return 1;
    if (containerWidth < 400) return 2;
    if (containerWidth < 600) return 3;
    if (containerWidth < 800) return 4;
    if (containerWidth < 1000) return 5;
    if (containerWidth < 1200) return 6;
    return 8;
  };

  const steps = getOrderedSteps(workflow, workflowStart);
  const maxVisible = getMaxVisibleSteps();
  const displaySteps = steps.slice(0, maxVisible);
  const hiddenCount = Math.max(0, steps.length - maxVisible);

  return (
    <TimelineContainer ref={containerRef}>
      <TimelineLine />
      <TimelineSteps>
        {displaySteps.map((step, index) => {
          const position = index % 2 === 0 ? "top" : "bottom";
          const stepType = step.type || "action";

          return (
            <TimelineStep key={step.id} $position={position}>
              <TimelineDot $type={stepType} />
              <TimelineLabel $position={position} title={step.name || step.id}>
                {step.name || step.type || "Step"}
              </TimelineLabel>
            </TimelineStep>
          );
        })}
        {hiddenCount > 0 && (
          <TimelineStep $position="bottom">
            <TimelineDot $type="action" />
            <TimelineLabel $position="bottom">
              +{hiddenCount} more
            </TimelineLabel>
          </TimelineStep>
        )}
      </TimelineSteps>
    </TimelineContainer>
  );
};

interface PlaybookItemProps {
  playbook: Playbook;
  onClick: () => void;
}

const PlaybookItem: React.FC<PlaybookItemProps> = ({ playbook, onClick }) => {
  return (
    <PlaybookListItem onClick={onClick}>
      <PlaybookInfo>
        <PlaybookName>{playbook.name}</PlaybookName>
        <PlaybookDescription>
          {playbook.description || "No description available"}
        </PlaybookDescription>
      </PlaybookInfo>

      <PlaybookTimeline
        workflow={playbook.workflow}
        workflowStart={playbook.workflow_start}
      />
      <PlaybookActions onClick={(e) => e.stopPropagation()}>
        <Icon $icon={MoreVertical} />
      </PlaybookActions>
    </PlaybookListItem>
  );
};

export const PlaybooksPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["playbooks"],
    queryFn: getPlaybooks,
    refetchOnWindowFocus: false,
  });

  const sortedPlaybooks = sortByString(
    [...(data || [])],
    (p) => p.name || "",
    true,
    false,
  );

  const parsedError = getErrorFromApiResponse(error);

  const handlePlaybookClick = (playbookId: string) => {
    navigate(PATHS.PLAYBOOKS.DETAIL.replace(":playbookId", playbookId));
  };

  const renderBody = () => {
    if (isLoading)
      return (
        <CenteredCardContent>
          <Spinner $size={ThemeSize.Large} />
        </CenteredCardContent>
      );
    if (isError)
      return <Text>{parsedError?.message || "Could not load playbooks"}</Text>;
    if (sortedPlaybooks.length === 0)
      return <Text>No playbooks available</Text>;
    return (
      <PlaybookList>
        {sortedPlaybooks.map((playbook) => (
          <PlaybookItem
            key={playbook.id}
            playbook={playbook}
            onClick={() => handlePlaybookClick(playbook.id)}
          />
        ))}
      </PlaybookList>
    );
  };

  return (
    <CardContainer>
      <CardHeader>
        <CardTitle>Playbooks</CardTitle>
        <Button
          $variant={ThemeVariant.Primary}
          $size={ThemeSize.Small}
          onClick={() => navigate(PATHS.PLAYBOOKS.NEW)}
        >
          <Icon $icon={FilePlusCorner} $size={ThemeSize.Medium} />
          New
        </Button>
      </CardHeader>
      <CardBody>{renderBody()}</CardBody>
    </CardContainer>
  );
};
