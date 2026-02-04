import React from "react";
import { Button } from "./Button";
import { ButtonWidth } from "./utils";

/**
 * Extra formats supported by ExportButton
 */
export type ExportFormat =
  | "json"
  | "txt"
  | ((data: unknown) => { blob: Blob; filename: string });

export interface ExportButtonProps extends React.ComponentProps<typeof Button> {
  $data: unknown;
  $format: ExportFormat;
  $filename?: string;
  $onSuccess?: () => void;
  $onError?: (err: unknown) => void;
}

const getDefaultFilename = (extension: string) =>
  `export-${new Date().toISOString().replace(/[:.]/g, "-")}.${extension}`;

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
      let blob: Blob;
      let outName = $filename;

      // the user provides a custom formatter function
      if (typeof $format === "function") {
        const { blob: customBlob, filename: customFilename } = $format($data);
        blob = customBlob;
        outName = customFilename;
        // json format
      } else if ($format === "json") {
        const json = JSON.stringify($data, null, 2);
        blob = new Blob([json], { type: "application/json" });
        if (!outName) outName = getDefaultFilename("json");
        // plain text format
      } else if ($format === "txt") {
        const text = typeof $data === "string" ? $data : String($data);
        blob = new Blob([text], { type: "text/plain" });
        if (!outName) outName = getDefaultFilename("txt");
      }

      // trigger download
      const url = URL.createObjectURL(blob!);
      const a = document.createElement("a");
      a.href = url;
      a.download = outName || "export";
      document.body.appendChild(a);
      a.click();

      // cleanup
      a.remove();
      URL.revokeObjectURL(url);

      // callbacks
      if ($onSuccess) $onSuccess();
    } catch (err) {
      if ($onError) $onError(err);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      $width={buttonProps.$width ?? ButtonWidth.Full}
      {...buttonProps}
    >
      {children}
    </Button>
  );
};

export default ExportButton;
