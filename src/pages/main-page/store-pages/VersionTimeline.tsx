import { useLayoutEffect, useRef, type ReactNode } from "react";
import styled from "styled-components";

import { ScrollArea } from "@/components/ScrollArea";

type VersionState = "current" | "previous" | "deleted" | "destroyed";
type LegendState = VersionState | "invalid";

type VersionTimelineItem = {
  version: number;
  current?: boolean;
  state?: Exclude<VersionState, "current">;
  modifiedTitle: string;
  details?: ReactNode;
  action?: ReactNode;
};

const stateLabels: Record<LegendState, { label: string; title: string }> = {
  current: { label: "Current", title: "The version in use" },
  previous: { label: "Previous", title: "An older version, not in use" },
  invalid: {
    label: "Invalid",
    title: "SOARCA cannot read this secret. Fix it in the secret backend.",
  },
  deleted: {
    label: "Deleted",
    title: "Hidden from use. An operator can still restore it.",
  },
  destroyed: {
    label: "Destroyed",
    title: "Data removed for good. It cannot be restored.",
  },
};

// `data-details` on the list switches to wide entries with centred dots.
// `data-current` marks the current version; `data-state` marks another version state.

const Timeline = styled.ol`
  display: flex;
  width: max-content;
  margin-inline: auto;
  list-style: none;

  &[data-details] {
    max-width: 100%;
  }
`;

const Entry = styled.li`
  position: relative;

  display: flex;
  flex: 0 0 14rem;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  min-width: 0;
  max-width: 100%;
  padding-bottom: ${({ theme }) => theme.spacing.xs};

  &:last-child {
    flex-basis: auto;
    width: max-content;
    max-width: 14rem;
  }

  [data-details] > & {
    flex: 1 1 auto;
    min-width: 14rem;
    max-width: max-content;
  }

  [data-details] > &:last-child {
    width: auto;
    max-width: max-content;
  }
`;

const Node = styled.div`
  position: relative;
  width: 100%;
  height: 0.7rem;

  &::before,
  &::after {
    content: "";

    position: absolute;
    top: 0.3rem;

    height: 1px;

    background: ${({ theme }) => theme.colors.border.medium};
  }

  &::before {
    display: none;
  }

  &::after {
    left: 0.65rem;
    width: calc(100% - 0.65rem);
  }

  [data-details] &::before {
    left: 0;
    display: block;
    width: 50%;
  }

  [data-details] &::after {
    left: 50%;
    width: 50%;
  }

  [data-details] li:first-child &::before,
  li:last-child &::after {
    display: none;
  }
`;

const Dot = styled.span`
  position: relative;
  z-index: 1;

  display: block;

  width: 0.7rem;
  height: 0.7rem;
  border: 2px solid ${({ theme }) => theme.colors.border.dark};
  border-radius: 50%;

  background: ${({ theme }) => theme.colors.dataTable.detailBg};

  [data-details] & {
    margin-left: calc(50% - 0.35rem);
  }

  [data-current] & {
    border-color: ${({ theme }) => theme.colors.success.text};
  }

  [data-state="deleted"] & {
    border-color: ${({ theme }) => theme.colors.warning.text};
  }

  [data-state="destroyed"] & {
    border-color: ${({ theme }) => theme.colors.error.text};
  }

  [data-state="invalid"] & {
    border-color: ${({ theme }) => theme.colors.accent.text};
  }
`;

const Version = styled.strong`
  [data-current] & {
    color: ${({ theme }) => theme.colors.success.text};
  }

  [data-state="deleted"] & {
    color: ${({ theme }) => theme.colors.warning.text};
  }

  [data-state="destroyed"] & {
    color: ${({ theme }) => theme.colors.error.text};
  }
`;

const Legend = styled.ul`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;

  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.text.secondary};
  list-style: none;

  li {
    display: flex;
    gap: ${({ theme }) => theme.spacing.xs};
    align-items: center;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;
  align-self: center;

  width: max-content;
  min-width: 0;
  max-width: 100%;

  font: ${({ theme }) => theme.typography.caption.font};
  text-align: center;

  [data-details] & {
    padding-inline: 0.5rem;
  }
`;

const Heading = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;

  min-height: ${({ theme }) => theme.control_height.sm};

  font: ${({ theme }) => theme.typography.caption.font};

  [data-details] & {
    padding-left: calc(50% - 0.35rem);
  }
`;

/** Explains the colors that `VersionTimeline` uses for the given states. */
export function VersionLegend({ states }: { states: LegendState[] }) {
  return (
    <Legend aria-label="Version colors">
      {states.map((state) => (
        <li
          key={state}
          title={stateLabels[state].title}
          data-current={state === "current" || undefined}
          data-state={state}
        >
          <Dot />
          {stateLabels[state].label}
        </li>
      ))}
    </Legend>
  );
}

export function VersionTimeline({
  items,
  label,
}: {
  items: VersionTimelineItem[];
  label: string;
}) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const currentVersion = items.find((item) => item.current)?.version;
  const hasDetails = items.some((item) => item.details != null);

  // Keeps the current version in view, also after a resize, until the user scrolls it away.
  useLayoutEffect(() => {
    const timeline = timelineRef.current;
    const current = timeline?.querySelector("[data-current]");
    if (!timeline || !current) return;

    const showCurrent = () => {
      const bounds = timeline.getBoundingClientRect();
      const currentBounds = current.getBoundingClientRect();
      if (currentBounds.right > bounds.right)
        timeline.scrollLeft += currentBounds.right - bounds.right;
      else if (currentBounds.left < bounds.left)
        timeline.scrollLeft += currentBounds.left - bounds.left;
    };
    let followCurrent = true;
    const onScroll = () => {
      const bounds = timeline.getBoundingClientRect();
      const currentBounds = current.getBoundingClientRect();
      followCurrent =
        currentBounds.left >= bounds.left - 1 &&
        currentBounds.right <= bounds.right + 1;
    };

    showCurrent();
    timeline.addEventListener("scroll", onScroll);
    const observer = new ResizeObserver(() => {
      if (followCurrent) showCurrent();
    });
    observer.observe(timeline);
    return () => {
      timeline.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [currentVersion]);

  return (
    <ScrollArea ref={timelineRef} horizontalOnly>
      <Timeline aria-label={label} data-details={hasDetails || undefined}>
        {items.map((item) => (
          <Entry
            key={item.version}
            data-current={item.current || undefined}
            data-state={item.state}
          >
            <Heading>
              <Version
                title={
                  item.current
                    ? `Current version\n${item.modifiedTitle}`
                    : item.state
                      ? `${stateLabels[item.state].label}. ${stateLabels[item.state].title}\n${item.modifiedTitle}`
                      : item.modifiedTitle
                }
              >
                v{item.version}
              </Version>
              {item.action}
            </Heading>
            <Node>
              <Dot />
            </Node>
            <Content>{item.details}</Content>
          </Entry>
        ))}
      </Timeline>
    </ScrollArea>
  );
}
