import { CodeEditor, Input, Select, ThemeSize } from "@/components";

interface VariableInputProps {
  /** Id of the control, for a label's htmlFor. */
  id?: string;
  variableKey: string;
  type: string;
  value: string;
  disabled?: boolean;
  $size?: ThemeSize;
  onChange: (key: string, value: string) => void;
}

type TextFormat = {
  inputType?: "number" | "url";
  step?: string;
  placeholder: string;
  pattern?: string;
};

const INTEGER_FORMAT: TextFormat = {
  inputType: "number",
  step: "1",
  placeholder: "Enter integer value",
  pattern: "^-?\\d+$",
};

const TEXT_FORMATS: Record<string, TextFormat> = {
  integer: INTEGER_FORMAT,
  long: INTEGER_FORMAT,
  float: {
    inputType: "number",
    step: "any",
    placeholder: "Enter float value",
    pattern: "^-?\\d+(\\.\\d+)?$",
  },
  "ipv4-addr": {
    placeholder: "192.168.1.1",
    pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$",
  },
  "ipv6-addr": {
    placeholder: "2001:0db8:85a3::8a2e:0370:7334",
    pattern: "^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$",
  },
  "mac-addr": {
    placeholder: "00:1A:2B:3C:4D:5E",
    pattern: "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$",
  },
  uri: { inputType: "url", placeholder: "https://example.com" },
  uuid: {
    placeholder: "550e8400-e29b-41d4-a716-446655440000",
    pattern:
      "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
  },
  hash: { placeholder: "Hash value (hex string)", pattern: "^[a-fA-F0-9]+$" },
  "md5-hash": {
    placeholder: "MD5 hash (32 characters)",
    pattern: "^[a-fA-F0-9]{32}$",
  },
  "sha256-hash": {
    placeholder: "SHA-256 hash (64 characters)",
    pattern: "^[a-fA-F0-9]{64}$",
  },
};

const isInvalidJson = (text: string) => {
  if (text.trim() === "") return false;
  try {
    JSON.parse(text);
    return false;
  } catch {
    return true;
  }
};

/** Input for a CACAO variable value. The control and its checks depend on the variable type. */
export const VariableInput: React.FC<VariableInputProps> = ({
  id,
  variableKey,
  type,
  value,
  disabled,
  $size,
  onChange,
}) => {
  const change = (next: string) => onChange(variableKey, next);

  switch (type) {
    case "bool":
      return (
        <Select
          id={id}
          $size={$size}
          $value={value}
          onChange={(e) => change(e.target.value)}
          disabled={disabled}
          $placeholder="Not set"
          $options={[
            { value: "true", label: "True" },
            { value: "false", label: "False" },
          ]}
        />
      );
    case "hexstring":
      return (
        <Input
          id={id}
          $size={$size}
          type="text"
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || /^0x[0-9a-fA-F]*$/.test(val)) change(val);
          }}
          disabled={disabled}
          placeholder="0x..."
          pattern="^0x[0-9a-fA-F]*$"
        />
      );
    case "dictionary":
      return (
        <CodeEditor
          $inputId={id}
          $value={value}
          $onChange={change}
          disabled={disabled}
          placeholder='{"key": "value"}'
          $hasError={isInvalidJson(value)}
          $minHeight="100px"
        />
      );
    default: {
      const format: TextFormat = TEXT_FORMATS[type] ?? {
        placeholder: "Enter value",
      };
      return (
        <Input
          id={id}
          $size={$size}
          type={format.inputType ?? "text"}
          step={format.step}
          value={value}
          onChange={(e) => change(e.target.value)}
          disabled={disabled}
          placeholder={format.placeholder}
          pattern={format.pattern}
        />
      );
    }
  }
};
