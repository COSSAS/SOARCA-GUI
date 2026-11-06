import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const PixelHeart = styled.span`
  display: inline-block;
  margin: 0 4px;
  font-size: 16px;
  animation: ${rotate} 3s linear infinite;
`;

export const MadeWithLove = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;
