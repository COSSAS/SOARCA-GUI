import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  input, button, textarea, select {
    font: inherit;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
  }

  /* Headings are chosen for document structure; their look comes from theme.typography. */
  h1, h2, h3, h4, h5, h6 {
    font-size: inherit;
    font-weight: inherit;
  }

  p, h1, h2, h3, h4, h5, h6 {
    overflow-wrap: break-word;
  }

  p {
    text-wrap: pretty;
  }

  img {
    display: block;
    max-width: 100%;
  }

  html, body, #root {
    width: 100%;
    height: 100%;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.family.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.primary};
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  /* Native scrollbars that remain, e.g. in text areas and the code editor. */
  * {
    scrollbar-color: ${({ theme }) => theme.colors.primary.main} transparent;
    scrollbar-width: thin;
  }
`;
