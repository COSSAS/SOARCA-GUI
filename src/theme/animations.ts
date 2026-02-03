import { keyframes } from "styled-components";

/**
 * Pulse animation where the element fades in and out.
 */
export const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

/**
 * Creates a moving gradient effect by moving the background.
 */
export const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
`;

/**
 * Fade in and slide up animation.
 */
export const fadeInSlide = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/**
 * Continuous 360-degree rotation animation.
 */
export const spin = keyframes`
  to { transform: rotate(360deg); }
`;
