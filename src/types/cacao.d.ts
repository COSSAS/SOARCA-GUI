import { ISODateString } from "./common";

export type Headers = Record<string, string[]>;
export type Extensions = Record<string, unknown>;

export type ExternalReferences = {
  name: string;
  description?: string;
  external_id?: string;
  reference_id?: string;
  source?: string;
  url?: string;
};

export type Contact = {
  contact_details?: string;
  email?: Record<string, string>;
  phone?: Record<string, string>;
};

export type CivicLocation = {
  administrative_area?: string;
  building_details?: string;
  city?: string;
  country?: string;
  description?: string;
  latitude?: string;
  longitude?: string;
  name?: string;
  network_details?: string;
  postal_code?: string;
  precision?: string;
  region?: string;
  street_address?: string;
};

export type Addresses = Record<string, string[]>;

export type AuthenticationInformation = {
  description?: string;
  id?: string;
  kms?: boolean;
  kms_key_identifier?: string;
  name?: string;
  oauth_header?: string;
  password?: string;
  private_key?: string;
  token?: string;
  type: string;
  user_id?: string;
  username?: string;
};

export type AuthenticationInformations = Record<
  string,
  AuthenticationInformation
>;

export type Cases = Record<string, string>;

export type Variable = {
  constant?: boolean;
  description?: string;
  external?: boolean;
  name?: string; // __variable_name__ utility field
  type: string; // OASIS variable-type-ov
  value?: string;
};

export type Variables = Record<string, Variable>;

export type Command = {
  command: string;
  command_b64?: string;
  content?: string;
  content_b64?: string;
  description?: string;
  headers?: Headers;
  playbook_activity?: string;
  type: string;
  version?: string;
};

export type AgentTarget = {
  address?: Addresses;
  agent_target_extensions?: Extensions;
  authentication_info?: string; // reference id
  category?: string[];
  contact?: Contact;
  description?: string;
  id?: string;
  location?: CivicLocation;
  logical?: string[];
  name: string;
  port?: string;
  sector?: string;
  type: string;
};

export type AgentTargets = Record<string, AgentTarget>;

export type Step = {
  agent?: string;
  authentication_info?: string;
  cases?: Cases;
  commands?: Command[];
  condition?: string;
  delay?: number;
  description?: string;
  external_references?: ExternalReferences[];
  id?: string;
  in_args?: string[];
  name?: string;
  next_steps?: string[];
  on_completion?: string;
  on_failure?: string;
  on_false?: string;
  on_success?: string;
  on_true?: string;
  out_args?: string[];
  owner?: string;
  playbook_id?: string;
  playbook_version?: string;
  step_extensions?: Extensions;
  step_variables?: Variables;
  switch?: string;
  targets?: string[];
  timeout?: number;
  type: string;
  uuid?: string; // utility field in backend
};

export type Workflow = Record<string, Step>;

export type DataMarking = {
  affected_party_notifications?: string;
  attribution?: string;
  created: ISODateString;
  created_by: string;
  description?: string;
  encrypt_in_transit?: string;
  end_date?: ISODateString;
  external_references?: ExternalReferences[];
  id: string;
  iep_version?: string;
  labels?: string[];
  marking_extensions?: Extensions;
  name?: string;
  permitted_actions?: string;
  revoked?: boolean;
  start_date?: ISODateString;
  statement?: string;
  tlp?: string;
  tlpv2_level?: string;
  type: string;
  unmodified_resale?: string;
  valid_from?: ISODateString;
  valid_until?: ISODateString;
};

export type DataMarkings = Record<string, DataMarking>;

export type ExtensionDefinition = {
  created_by: string;
  schema: string;
  type: string;
  version: string;
  description?: string;
  external_references?: ExternalReferences[];
  id?: string;
  name?: string;
};

export type ExtensionDefinitions = Record<string, ExtensionDefinition>;

export type Playbook = {
  agent_definitions?: AgentTargets;
  authentication_info_definitions?: AuthenticationInformations;
  created: ISODateString;
  created_by: string;
  data_marking_definitions?: DataMarkings;
  derived_from?: string[];
  description?: string;
  extension_definitions?: ExtensionDefinitions;
  external_references?: ExternalReferences[];
  id: string;
  impact?: number;
  labels?: string[];
  markings?: string[];
  modified: ISODateString;
  name: string;
  playbook_extensions?: Extensions;
  playbook_types?: string[]; // e.g. investigation
  playbook_variables?: Variables;
  priority?: number;
  severity?: number;
  spec_version: string; // cacao-2.0
  target_definitions?: AgentTargets;
  type: string; // playbook
  valid_from?: ISODateString;
  valid_until?: ISODateString;
  workflow: Record<string, Step>;
  workflow_exception?: string;
  workflow_start: string;
};
