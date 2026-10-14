export type ExportFormat =
  | "json"
  | "txt"
  | ((data: unknown) => { blob: Blob; filename: string });

const getDefaultFilename = (extension: string) =>
  `export-${new Date().toISOString().replace(/[:.]/g, "-")}.${extension}`;

export const downloadExport = (
  data: unknown,
  format: ExportFormat,
  filename?: string,
) => {
  let blob: Blob;
  let outputFilename = filename;

  if (typeof format === "function") {
    const result = format(data);
    blob = result.blob;
    outputFilename = result.filename;
  } else if (format === "json") {
    blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    outputFilename ??= getDefaultFilename("json");
  } else {
    blob = new Blob([typeof data === "string" ? data : String(data)], {
      type: "text/plain",
    });
    outputFilename ??= getDefaultFilename("txt");
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = outputFilename || "export";
  try {
    document.body.appendChild(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    URL.revokeObjectURL(url);
  }
};
