import { Link, Text } from "@/components";

import { SUPPORTED_SPEC_VERSIONS } from "../model/specs";

type UnsupportedSpecProps = {
  version: string;
  /** Link to the JSON editor, if there is one for this page. */
  jsonEditorPath?: string;
};

export const UnsupportedSpec: React.FC<UnsupportedSpecProps> = ({
  version,
  jsonEditorPath,
}) => (
  <Text>
    This playbook uses {version || "an unknown spec version"}. The diagram
    supports {SUPPORTED_SPEC_VERSIONS.join(", ")}.{" "}
    {jsonEditorPath && <Link $to={jsonEditorPath}>Edit it as JSON</Link>}
  </Text>
);
