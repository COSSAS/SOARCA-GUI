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
    background: none;
    border: none;
    cursor: pointer;
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
    height: 100%;
    width: 100%;
  }

  body {
    background-color: ${({ theme }) => theme.colors.background.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.fonts.family.primary};
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  :root {
    --scrollbar-track: ${({ theme }) => theme.colors.background.tertiary};
    --scrollbar-thumb: ${({ theme }) => theme.colors.border.light};
    --scrollbar-thumb-hover: ${({ theme }) => theme.colors.primary.hover};
    --scrollbar-size: 10px;
    --scrollbar-radius: 9999px;
  }

  /* Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
  }

  /* WebKit (Chrome, Edge, Safari) */
  *::-webkit-scrollbar {
    width: var(--scrollbar-size);
    height: var(--scrollbar-size);
  }

  *::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
    border-radius: var(--scrollbar-radius);
  }

  *::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-thumb);
    border-radius: var(--scrollbar-radius);
    border: 3px solid var(--scrollbar-track);
    min-height: 28px;
  }

  *::-webkit-scrollbar-thumb:hover {
    background-color: var(--scrollbar-thumb-hover);
  }

  *::-webkit-scrollbar-corner {
    background: var(--scrollbar-track);
  }

  pre, code, textarea {
    scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
  }
`;
