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
  resize: vertical;

  width: 100%;
  min-height: ${({ $minHeight = "400px" }) => $minHeight};
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error.border : theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.md};

  font: ${({ theme }) => theme.typography.code.font};
  color: ${({ theme }) => theme.colors.text.primary};

  background-color: ${({ theme }) => theme.colors.background.secondary};

  &:focus {
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error.border : theme.colors.info.border};
    background-color: ${({ theme }) => theme.colors.background.primary};
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: ${({ theme }) => theme.interactions.disabledOpacity};
  }
`;

export interface CodeEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  $value: string;
  $onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  $hasError?: boolean;
  $minHeight?: string;
  /** Id of the textarea, so a label can point to it. */
  $inputId?: string;
}

/**
 * A simple, styled textarea intended for editing code or preformatted text.
 * It is a controlled component and relies on `$value` / `$onChange` for state.
 * @param $value - Current text content of the editor.
 * @param $onChange - Callback invoked with new text when the content changes.
 * @param placeholder - Optional placeholder text when editor is empty.
 * @param disabled - When true the editor is non-editable and shows disabled visuals.
 * @param $hasError - When true the editor displays an error border state.
 * @param $minHeight - Optional CSS min-height for the editor area (defaults to `400px`).
 * @param $inputId - Optional id of the textarea, for a `<label htmlFor>`.
 * @example:
 * <CodeEditor
 *   $value={source}
 *   $onChange={setSource}
 *   placeholder="Paste JSON here"
 * />
 */
export const CodeEditor: React.FC<CodeEditorProps> = ({
  $value,
  $onChange,
  placeholder,
  disabled,
  $hasError,
  $minHeight,
  $inputId,
  ...rest
}) => {
  return (
    <EditorContainer {...rest}>
      <EditorTextarea
        id={$inputId}
        value={$value}
        onChange={(e) => $onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        $hasError={$hasError}
        $minHeight={$minHeight}
      />
    </EditorContainer>
  );
};

export default CodeEditor;
