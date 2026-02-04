import { Input, Select } from "@/components";
import React from "react";

interface VariableInputProps {
  variableKey: string;
  type: string;
  value: string;
  disabled: boolean;
  onChange: (key: string, value: string) => void;
}

export const VariableInput: React.FC<VariableInputProps> = ({
  variableKey,
  type,
  value,
  disabled,
  onChange,
}) => {
  switch (type) {
    case "bool":
      return (
        <Select
          id="select"
          $value={value}
          onChange={(e) => onChange(variableKey, e.target.value)}
          disabled={disabled}
          $options={[
            { value: "true", label: "True" },
            { value: "false", label: "False" },
          ]}
        />
      );
    case "integer":
    case "long":
      return (
        <Input
          type="number"
          step="1"
          value={value}
          onChange={(e) => onChange(variableKey, e.target.value)}
          disabled={disabled}
          placeholder="Enter integer value"
          pattern="^-?\d+$"
        />
      );
    case "float":
      return (
        <Input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(variableKey, e.target.value)}
          disabled={disabled}
          placeholder="Enter float value"
          pattern="^-?\d+(\.\d+)?$"
        />
      );
    case "hexstring":
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || /^0x[0-9a-fA-F]*$/.test(val)) {
              onChange(variableKey, val);
            }
          }}
          disabled={disabled}
          placeholder="0x..."
          pattern="^0x[0-9a-fA-F]*$"
        />
      );
    case "ipv4-addr":
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(variableKey, e.target.value)}
          disabled={disabled}
          placeholder="192.168.1.1"
          pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
        />
      );
    case "ipv6-addr":
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(variableKey, e.target.value)}
          disabled={disabled}
          placeholder="2001:0db8:85a3::8a2e:0370:7334"
          pattern="^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$"
        />
      );
    case "mac-addr":
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(variableKey, e.target.value)}
          disabled={disabled}
          placeholder="00:1A:2B:3C:4D:5E"
          pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
        />
      );
    case "uri":
      return (
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(variableKey, e.target.value)}
          disabled={disabled}
          placeholder="https://example.com"
        />
      );
    case "uuid":
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(variableKey, e.target.value)}
          disabled={disabled}
          placeholder="550e8400-e29b-41d4-a716-446655440000"
          pattern="^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
        />
      );
    case "hash":
    case "md5-hash":
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(variableKey, e.target.value)}
          disabled={disabled}
          placeholder={`${type === "md5-hash" ? "MD5" : "Hash"} hash (32 characters)`}
          pattern="^[a-fA-F0-9]{32}$"
        />
      );
    case "sha256-hash":
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(variableKey, e.target.value)}
          disabled={disabled}
          placeholder="SHA-256 hash (64 characters)"
          pattern="^[a-fA-F0-9]{64}$"
        />
      );
    case "string":
    default:
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(variableKey, e.target.value)}
          disabled={disabled}
          placeholder="Enter value"
        />
      );
  }
};
