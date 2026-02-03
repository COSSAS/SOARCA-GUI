import React from "react";
import styled from "styled-components";

const EditorContainer = styled.div`
  width: 100%;

  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const EditorTextarea = styled.textarea<{
  $hasError?: boolean;
  $minHeight?: string;
}>`
  width: 100%;
  box-sizing: border-box;
  min-height: ${({ $minHeight = "400px" }) => $minHeight};

  padding: ${({ theme }) => theme.spacing.md};

  border-radius: ${({ theme }) => theme.radius.md};
  border: 2px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error.border : theme.colors.border.medium};

  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.code_small.font};

  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error.border : theme.colors.info.border};
    background-color: ${({ theme }) => theme.colors.background.primary};
  }

  &:disabled {
    opacity: ${({ theme }) => theme.interactions.disabledOpacity};
    cursor: not-allowed;
  }
`;

export interface CodeEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  $value: string;
  $onChange: (value: string) => void;
  $placeholder?: string;
  $disabled?: boolean;
  $hasError?: boolean;
  $minHeight?: string;
}

/**
 * A simple, styled textarea intended for editing code or preformatted text.
 * It is a controlled component and relies on `$value` / `$onChange` for state.
 * @param $value - Current text content of the editor.
 * @param $onChange - Callback invoked with new text when the content changes.
 * @param $placeholder - Optional placeholder text when editor is empty.
 * @param $disabled - When true the editor is non-editable and shows disabled visuals.
 * @param $hasError - When true the editor displays an error border state.
 * @param $minHeight - Optional CSS min-height for the editor area (defaults to `400px`).
 * @example:
 * <CodeEditor
 *   $value={source}
 *   $onChange={setSource}
 *   $placeholder="Paste JSON here"
 * />
 */
export const CodeEditor: React.FC<CodeEditorProps> = ({
  $value,
  $onChange,
  $placeholder,
  $disabled,
  $hasError,
  $minHeight,
  ...rest
}) => {
  return (
    <EditorContainer {...rest}>
      <EditorTextarea
        value={$value}
        onChange={(e) => $onChange(e.target.value)}
        placeholder={$placeholder}
        disabled={$disabled}
        $hasError={$hasError}
        $minHeight={$minHeight}
      />
    </EditorContainer>
  );
};

export default CodeEditor;
