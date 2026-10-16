import React from "react";
import { Button } from "./Button";
import { downloadExport, ExportFormat } from "./export";

export type { ExportFormat } from "./export";

export interface ExportButtonProps extends React.ComponentProps<typeof Button> {
  $data: unknown;
  $format: ExportFormat;
  $filename?: string;
  $onSuccess?: () => void;
  $onError?: (err: unknown) => void;
}

/**
 * ExportButton component to export data as a file in various formats.
 *
 * @param $data - The value to export. Can be any serializable value for json or a string for txt.
 * @param $filename - Optional suggested filename. If not provided, defaults to export-<timestamp>.<ext>.
 * @param $format - **(required)** Selects how to transform data into a Blob. Can be 'json', 'txt', or a custom function returning { blob, filename? }.
 * @param $onSuccess - Optional callback invoked after successful export.
 * @param $onError - Optional callback invoked if export fails.
 * @example
 * <ExportButton $data={playbook} $filename={`${playbook.id}.json`} $format="json">Export</ExportButton>
 */
export const ExportButton: React.FC<ExportButtonProps> = ({
  $data,
  $format,
  $filename,
  $onSuccess,
  $onError,
  children,
  ...buttonProps
}) => {
  const handleClick = () => {
    try {
      downloadExport($data, $format, $filename);
      if ($onSuccess) $onSuccess();
    } catch (err) {
      if ($onError) $onError(err);
    }
  };

  return (
    <Button type="button" onClick={handleClick} {...buttonProps}>
      {children}
    </Button>
  );
};

export default ExportButton;
