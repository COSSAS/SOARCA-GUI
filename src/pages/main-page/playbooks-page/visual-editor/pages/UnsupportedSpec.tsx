import { Text } from "@/components";

import { SUPPORTED_SPEC_VERSIONS } from "../model/specs";

export const UnsupportedSpec: React.FC<{ version: string }> = ({ version }) => (
  <Text>
    This playbook uses {version || "an unknown spec version"}. The editor
    supports {SUPPORTED_SPEC_VERSIONS.join(", ")}.
  </Text>
);
