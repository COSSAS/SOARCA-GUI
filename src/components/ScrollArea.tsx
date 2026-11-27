import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import type { HTMLAttributes, Ref } from "react";
import styled from "styled-components";

/** Pointer area of a scrollbar. The visible thumb is a 2px line in its middle. */
const TRACK_SIZE = "12px";

// A flex column, so the viewport shrinks to a height or max-height set on the area.
const Root = styled(ScrollAreaPrimitive.Root)`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;

  &:has(> [data-orientation="horizontal"]) {
    padding-bottom: ${TRACK_SIZE};
  }
`;

// Set --scroll-area-radius on a rounded, bordered area to clip the content
// to the inside of its border.
const Viewport = styled(ScrollAreaPrimitive.Viewport)`
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  border-radius: var(--scroll-area-radius, 0);
`;

const Track = styled(ScrollAreaPrimitive.Scrollbar)`
  touch-action: none;
  user-select: none;
  display: flex;
  align-items: center;

  &[data-orientation="vertical"] {
    --radix-scroll-area-thumb-width: ${TRACK_SIZE};

    flex-direction: column;
    width: ${TRACK_SIZE};
  }

  &[data-orientation="horizontal"] {
    --radix-scroll-area-thumb-height: ${TRACK_SIZE};

    height: ${TRACK_SIZE};
  }
`;

const Thumb = styled(ScrollAreaPrimitive.Thumb)`
  position: relative;

  &::before {
    content: "";
    position: absolute;
    border-radius: ${({ theme }) => theme.radius.full};
    background: ${({ theme }) => theme.colors.primary.main};
  }

  [data-orientation="vertical"] > &::before {
    inset: 0 5px;
  }

  [data-orientation="horizontal"] > &::before {
    inset: 5px 0;
  }
`;

/**
 * Scrolls its content with thin scrollbars that show only on overflow. The
 * horizontal scrollbar takes space below the content. The vertical scrollbar
 * lies over the right edge of the content, so the content never shifts. With
 * `scrollbarOutside`, it sits in the 12px just outside the right edge instead,
 * and the parent must leave that space free. With `horizontalOnly`, the area
 * never scrolls up and down.
 */
export function ScrollArea({
  children,
  scrollbarOutside = false,
  horizontalOnly = false,
  ref,
  ...rest
}: Omit<HTMLAttributes<HTMLDivElement>, "dir"> & {
  scrollbarOutside?: boolean;
  horizontalOnly?: boolean;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <Root {...rest} type="auto">
      <Viewport ref={ref} disableImplicitContentElement>
        <ScrollAreaPrimitive.Content style={{ display: "block", minWidth: 0 }}>
          {children}
        </ScrollAreaPrimitive.Content>
      </Viewport>
      {!horizontalOnly && (
        <Track
          orientation="vertical"
          // Radix sets `right: 0` inline, so only an inline style can move the track.
          style={scrollbarOutside ? { right: `-${TRACK_SIZE}` } : undefined}
        >
          <Thumb />
        </Track>
      )}
      <Track orientation="horizontal">
        <Thumb />
      </Track>
    </Root>
  );
}
