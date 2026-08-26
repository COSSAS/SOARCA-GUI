import { Step } from "./cacao";
import { ISODateString } from "./common";

// One executable capability a Fin offers, declared at registration time.
// A Fin registration may declare more than one Capability.
export type FinCapability = {
  type: string; // routing key: agent_definitions[...].type in a playbook
  description?: string;
  version?: string;
  step_examples?: Step[]; // illustrative example steps, never validated by SOARCA
};

// A currently-registered Fin, as returned by the read-only discovery API
// (GET /api/fin/, GET /api/fin/{fin_id}). The fin_token is never exposed.
export type Fin = {
  fin_id: string;
  display_name?: string;
  protocol_version?: string;
  capabilities: FinCapability[];
  registered_at: ISODateString;
  last_seen: ISODateString;
};

export type FinListResponse = {
  fins: Fin[];
};
