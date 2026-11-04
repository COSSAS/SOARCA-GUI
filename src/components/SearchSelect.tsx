import { useMemo } from "react";
import ReactSelect, {
  type MultiValue,
  type Props as ReactSelectProps,
  type SingleValue,
  type StylesConfig,
  type Theme as SelectTheme,
} from "react-select";
import CreatableSelect from "react-select/creatable";
import { type DefaultTheme, useTheme } from "styled-components";

import { getControlSize, ThemeSize } from "./utils";

export type SearchSelectOption = { value: string; label: string };

type CommonProps = {
  inputId?: string;
  $options: SearchSelectOption[];
  /** Lets the user type a value that is not in the options. */
  $creatable?: boolean;
  $placeholder?: string;
  $size?: ThemeSize;
  /** Shows the error border. */
  $invalid?: boolean;
};

export type SearchSelectProps = CommonProps &
  (
    | {
        $multi?: false;
        $value: string | undefined;
        $onChange: (value: string | undefined) => void;
      }
    | { $multi: true; $value: string[]; $onChange: (value: string[]) => void }
  );

type Option = SearchSelectOption;

const toValues = (selected: MultiValue<Option> | SingleValue<Option>): string[] => {
  if (!selected) return [];
  return "value" in selected
    ? [selected.value]
    : selected.map((option) => option.value);
};

/** Maps react-select's colour slots to the app theme, so the control, menu and chips follow light and dark mode. */
const toSelectTheme =
  ({ colors }: DefaultTheme) =>
  (base: SelectTheme): SelectTheme => ({
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary.main,
      primary75: colors.primary.hover,
      primary50: colors.primary.bg,
      primary25: colors.background.secondary,
      danger: colors.error.text,
      dangerLight: colors.error.bg,
      neutral0: colors.background.primary,
      neutral5: colors.background.secondary,
      neutral10: colors.info.bg,
      neutral20: colors.border.medium,
      neutral30: colors.primary.hover,
      neutral40: colors.text.tertiary,
      neutral50: colors.text.placeholder,
      neutral60: colors.text.secondary,
      neutral70: colors.text.primary,
      neutral80: colors.text.primary,
      neutral90: colors.text.primary,
    },
  });

const useSelectStyles = (size: ThemeSize, invalid: boolean) => {
  const theme = useTheme();
  return useMemo(() => {
    const { height, paddingX, fontSize } = getControlSize(theme, size);
    const { primary, error, text } = theme.colors;
    const styles: StylesConfig<Option, boolean> = {
      control: (base, state) => ({
        ...base,
        minHeight: height,
        fontSize,
        borderRadius: theme.radius.md,
        borderColor: invalid ? error.border : base.borderColor,
        boxShadow: state.isFocused
          ? `0 0 8px 0 ${primary.main}20, 0 0 12px 0 ${primary.main}10`
          : "none",
        transition: `border-color ${theme.transitions.base}`,
      }),
      valueContainer: (base) => ({ ...base, padding: `2px ${paddingX}` }),
      dropdownIndicator: (base) => ({ ...base, padding: theme.spacing.xs }),
      clearIndicator: (base) => ({ ...base, padding: theme.spacing.xs }),
      multiValue: (base) => ({ ...base, borderRadius: theme.radius.sm }),
      multiValueLabel: (base) => ({ ...base, color: theme.colors.info.text }),
      menu: (base) => ({
        ...base,
        fontSize,
        border: `1px solid ${theme.colors.border.medium}`,
      }),
      menuPortal: (base) => ({ ...base, zIndex: theme.zIndex.dropdown }),
      // A tint with normal text stays readable in both modes, unlike text on the solid primary colour.
      option: (base, state) => ({
        ...base,
        color: text.primary,
        fontWeight: state.isSelected ? theme.fonts.weight.semibold : undefined,
        backgroundColor: state.isSelected ? primary.bg : base.backgroundColor,
      }),
    };
    return { styles, selectTheme: toSelectTheme(theme) };
  }, [theme, size, invalid]);
};

/**
 * Searchable select built on react-select, styled like `Input`.
 * Values are plain strings. A value that is not in `$options` is shown as is.
 * @param $multi - Picks many values. `$value` and `$onChange` then use string arrays.
 * @param $creatable - Allows values that are not in the options.
 * @param $invalid - Shows the error border.
 * @example
 * <SearchSelect inputId="agent" $options={agents} $value={agent} $onChange={setAgent} />
 * @example
 * <SearchSelect $multi $creatable $options={[]} $value={labels} $onChange={setLabels} />
 */
export const SearchSelect: React.FC<SearchSelectProps> = (props) => {
  const { $options, $creatable, $placeholder, $size = ThemeSize.Medium, $invalid = false } = props;
  const { styles, selectTheme } = useSelectStyles($size, $invalid);
  const toOption = (value: string): Option =>
    $options.find((option) => option.value === value) ?? { value, label: value };

  const selectProps: ReactSelectProps<Option, boolean> = {
    inputId: props.inputId,
    options: $options,
    isMulti: !!props.$multi,
    isClearable: true,
    placeholder: $placeholder ?? "Select…",
    value: props.$multi
      ? props.$value.map(toOption)
      : props.$value
        ? toOption(props.$value)
        : null,
    onChange: (selected) => {
      const values = toValues(selected);
      if (props.$multi) props.$onChange(values);
      else props.$onChange(values[0]);
    },
    menuPortalTarget: document.body,
    menuPlacement: "auto",
    styles,
    theme: selectTheme,
  };

  return $creatable ? (
    <CreatableSelect
      {...selectProps}
      formatCreateLabel={(text) => `Use "${text}"`}
      noOptionsMessage={() => "Type to add a value"}
    />
  ) : (
    <ReactSelect {...selectProps} />
  );
};
