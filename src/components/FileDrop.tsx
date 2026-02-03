import { Button, Icon, ThemeSize, ThemeVariant } from "@/components";
import { Trash2, Upload } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import styled from "styled-components";

const DropZone = styled.div<{
  $isDragActive: boolean;
  $hasError: boolean;
}>`
  border: 2px dashed
    ${({ theme, $isDragActive, $hasError }) =>
      $hasError
        ? theme.colors.error.border
        : $isDragActive
          ? theme.colors.info.border
          : theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.md};

  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  text-align: center;
  cursor: pointer;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background-color: ${({ theme, $isDragActive }) =>
    $isDragActive ? theme.colors.info.bg : theme.colors.background.secondary};

  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.info.border};
    background-color: ${({ theme }) => theme.colors.info.bg};
  }
`;

const DropZoneText = styled.p`
  margin: 0;
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const DropZoneHint = styled.span`
  font: ${({ theme }) => theme.typography.small.font};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const FileName = styled.div`
  font: ${({ theme }) => theme.typography.bodyMedium.font};
  color: ${({ theme }) => theme.colors.text.primary};

  margin-top: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export interface FileDropProps extends React.HTMLAttributes<HTMLDivElement> {
  $fileName?: string;
  $onChange: (content: string, filename?: string) => void;
  $onRemove?: () => void;
  $accept?: string;
  $disabled?: boolean;
  $error?: string;
}

/**
 * FileDrop
 *
 * Simple drag-and-drop and file picker component for single-file uploads.
 * Uses `onChange(content, filename?)` to deliver the file contents to the parent.
 * @param $fileName - Optional currently selected filename to display.
 * @param $onChange - Called with (content, filename) when a file is selected or dropped.
 * @param $onRemove - Optional callback when the remove button is clicked.
 * @param $accept - File extension filter (e.g. ".json"). Defaults to ".json".
 * @param $disabled - When true, disables interactions.
 * @param $error - Optional error message to display under the drop zone.
 * @example
 * <FileDrop $onChange={(content, filename) => setFile(content)} $accept=".json" />
 */
export const FileDrop: React.FC<FileDropProps> = ({
  $fileName,
  $onChange,
  $onRemove,
  $accept = ".json",
  $disabled,
  $error,
  ...rest
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const readFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        $onChange(content, file.name);
      };
      reader.onerror = () => {
        // propagate empty content on error so parent can show message
        $onChange("", file.name);
      };
      reader.readAsText(file);
    },
    [$onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if ($disabled) return;
      setIsDragActive(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if ($accept && !file.name.endsWith($accept)) {
          $onChange("", file.name);
          return;
        }
        readFile(file);
      }
    },
    [$accept, $disabled, $onChange, readFile],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if ($disabled) return;
      setIsDragActive(true);
    },
    [$disabled],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
    },
    [],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if ($accept && !file.name.endsWith($accept)) {
          $onChange("", file.name);
          return;
        }
        readFile(file);
      }
    },
    [$accept, $onChange, readFile],
  );

  return (
    <div {...rest}>
      <input
        ref={inputRef}
        type="file"
        accept={$accept}
        onChange={handleFileSelect}
        style={{ display: "none" }}
        disabled={$disabled}
      />
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if ($disabled) return;
          inputRef.current?.click();
        }}
      >
        <DropZone $isDragActive={isDragActive} $hasError={!!$error}>
          <Icon $icon={Upload} $size={ThemeSize.ExtraLarge} />
          <DropZoneText>Click to browse or drag a file here</DropZoneText>
          <DropZoneHint>Only {$accept} files are accepted</DropZoneHint>
          {$fileName && (
            <FileName>
              {$fileName}
              <Button
                $variant={ThemeVariant.Error}
                $size={ThemeSize.Small}
                disabled={$disabled}
                title="Remove file"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  $onRemove?.();
                }}
              >
                <Icon $icon={Trash2} $size={ThemeSize.Medium} />
              </Button>
            </FileName>
          )}
        </DropZone>
      </label>
    </div>
  );
};

export default FileDrop;
