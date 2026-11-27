import { useId } from "react";

import { DetailsItem, FormLabel, RadioGroup } from "@/components";
import { useThemeMode, type ThemeMode } from "@/theme";

const options: { label: string; value: ThemeMode }[] = [
  { label: "System", value: "auto" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export function ThemeModeControl() {
  const id = useId();
  const { mode, setMode } = useThemeMode();

  return (
    <DetailsItem>
      <FormLabel as="span" id={`${id}-label`}>
        Theme
      </FormLabel>
      <RadioGroup
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        name={`${id}-theme-mode`}
        $options={options}
        $value={mode}
        $onChange={(value) => {
          const option = options.find((item) => item.value === value);
          if (!option) throw new Error(`Unknown theme mode: ${value}`);
          setMode(option.value);
        }}
      />
    </DetailsItem>
  );
}
