import React from "react";
import { useNavigate } from "react-router";
import styled from "styled-components";

const StyledLink = styled.a<{ $subtle?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  text-decoration: none;

  ${({ $subtle, theme }) =>
    $subtle
      ? `
        color: ${theme.colors.text.tertiary};
        &:hover { color: ${theme.colors.text.secondary}; }
      `
      : `
        color: ${theme.colors.primary.main};
        &:hover { color: ${theme.colors.primary.hover}; }
      `}

  transition: all ${({ theme }) => theme.transitions.base};

  font: ${({ theme }) => theme.typography.body.font};

  svg {
    flex-shrink: 0;
  }

  &:active {
    transform: scale(0.98);
  }
`;

interface LinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  /** Muted text color instead of the primary color. */
  $subtle?: boolean;
  /** Target path. Internal "/..." paths use navigate; others use normal navigation. */
  $to: string;
}

/**
 * Smart link component that automatically uses react-router navigation for internal paths.
 * Detects internal routes (starting with "/") and prevents default anchor behavior to use navigate() instead.
 * External URLs or non-path hrefs use standard anchor navigation. Supports all standard anchor attributes.
 * @param $to - Target path or URL. Paths starting with "/" use react-router navigate, others use normal anchor behavior.
 * @param $subtle - When true, uses muted text with a lighter hover instead of the primary color. Defaults to false.
 * @example
 * // Internal navigation with primary styling
 * <Link $to="/dashboard">Go to Dashboard</Link>
 * @example
 * // External link with subtle styling
 * <Link $to="https://example.com" $subtle target="_blank">External Site</Link>
 * @example
 * // Internal link with icon
 * <Link $to="/settings"><SettingsIcon /> Settings</Link>
 */
export const Link: React.FC<LinkProps> = ({ $to, onClick, ...rest }) => {
  const navigate = useNavigate();

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (onClick) {
      onClick(event);
    }

    if (event.defaultPrevented) return;

    if ($to && $to.startsWith("/")) {
      event.preventDefault();
      navigate($to);
    }
  };

  return <StyledLink href={$to} onClick={handleClick} {...rest} />;
};
