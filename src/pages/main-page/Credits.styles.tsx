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
  font-size: 16px;
  animation: ${rotate} 3s linear infinite;
  margin: 0 4px;
`;

export const MadeWithLove = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
