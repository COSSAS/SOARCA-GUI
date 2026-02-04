import styled from "styled-components";

interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  $direction?: "horizontal" | "vertical";
  $gap?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  $align?: "start" | "center" | "end" | "stretch";
  $justify?:
    | "start"
    | "center"
    | "end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  $wrap?: boolean;
}

/**
 * A flexible spacer/flex container component to arrange child elements.
 * Supports customizable direction, gap, alignment, justification, and wrapping.
 * @param $direction - "horizontal" | "vertical" (default: "horizontal")
 * @param $gap - spacing size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" (default: "md")
 * @param $align - "start" | "center" | "end" | "stretch" (default: "center")
 * @param $justify - "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly" (default: "center")
 * @param $wrap - boolean (default: false)
 */
export const Spacer = styled.div<SpacerProps>`
  display: flex;
  flex-direction: ${({ $direction }) =>
    $direction === "vertical" ? "column" : "row"};
  flex-wrap: ${({ $wrap = false }) => ($wrap ? "wrap" : "nowrap")};

  gap: ${({ $gap = "md", theme }) => theme.spacing[$gap]};

  align-items: ${({ $align = "center" }) => {
    switch ($align) {
      case "start":
        return "flex-start";
      case "end":
        return "flex-end";
      case "center":
        return "center";
      case "stretch":
        return "stretch";
      default:
        return "center";
    }
  }};

  justify-content: ${({ $justify = "center" }) => {
    switch ($justify) {
      case "start":
        return "flex-start";
      case "end":
        return "flex-end";
      case "center":
        return "center";
      case "space-between":
        return "space-between";
      case "space-around":
        return "space-around";
      case "space-evenly":
        return "space-evenly";
      default:
        return "flex-start";
    }
  }};
`;
