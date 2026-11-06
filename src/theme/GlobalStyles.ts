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

  :root {
    --scrollbar-track: ${({ theme }) => theme.colors.background.tertiary};
    --scrollbar-thumb: ${({ theme }) => theme.colors.border.light};
    --scrollbar-thumb-hover: ${({ theme }) => theme.colors.primary.hover};
    --scrollbar-size: 10px;
    --scrollbar-radius: 9999px;
  }

  /* Firefox */
  * {
    scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
    scrollbar-width: thin;
  }

  /* WebKit (Chrome, Edge, Safari) */
  *::-webkit-scrollbar {
    width: var(--scrollbar-size);
    height: var(--scrollbar-size);
  }

  *::-webkit-scrollbar-track {
    border-radius: var(--scrollbar-radius);
    background: var(--scrollbar-track);
  }

  *::-webkit-scrollbar-thumb {
    min-height: 28px;
    border: 3px solid var(--scrollbar-track);
    border-radius: var(--scrollbar-radius);
    background-color: var(--scrollbar-thumb);
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
