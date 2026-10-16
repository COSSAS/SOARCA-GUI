import styled from "styled-components";
import { getControlSize, ThemeSize } from "./utils";

interface ControlSizeProps {
  $size?: ThemeSize;
}

/**
 * Standard form input with theme-based styling, focus states, and validation support.
 * Provides hover and focus states with border color transitions and subtle shadows.
 * Automatically fills container width with proper box-sizing for predictable layouts.
 * @param $size - Same sizes as Button, so an Input and a Button of the same size line up. Defaults to Medium.
 * @example
 * <Input type="text" placeholder="Enter your name" />
 * @example
 * <Input type="search" $size={ThemeSize.Small} placeholder="Search" />
 */
export const Input = styled.input<ControlSizeProps>`
  width: 100%;
  box-sizing: border-box;

  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.md};

  ${({ $size = ThemeSize.Medium, theme }) => {
    const { height, paddingX } = getControlSize(theme, $size);
    return `
      height: ${height};
      padding: 0 ${paddingX};
    `;
  }};

  font: ${({ theme }) => theme.typography.body.font};
  font-size: ${({ $size = ThemeSize.Medium, theme }) =>
    getControlSize(theme, $size).fontSize};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.primary};

  transition: border-color ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.hover};
  }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow:
      0 0 8px 0px ${({ theme }) => theme.colors.primary.main}20,
      0 0 12px 0px ${({ theme }) => theme.colors.primary.main}10;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.placeholder};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.background.secondary};
  }
`;

/**
 * Styled select element keeping the same visuals as the `Input` component.
 * Option elements are styled where supported by the browser.
 */
const StyledSelect = styled.select<ControlSizeProps>`
  width: 100%;
  box-sizing: border-box;
  appearance: none;
  -webkit-appearance: none;

  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.md};

  ${({ $size = ThemeSize.Medium, theme }) => {
    const { height, paddingX } = getControlSize(theme, $size);
    return `
      height: ${height};
      padding: 0 ${theme.spacing["2xl"]} 0 ${paddingX};
    `;
  }};

  font: ${({ theme }) => theme.typography.body.font};
  font-size: ${({ $size = ThemeSize.Medium, theme }) =>
    getControlSize(theme, $size).fontSize};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background.primary};
  background-image: ${({ theme }) => {
    const color = theme.colors.text.tertiary.replace("#", "%23");
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='${color}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C%2Fsvg%3E")`;
  }};
  background-repeat: no-repeat;
  background-position: right ${({ theme }) => theme.spacing.md} center;

  transition: border-color ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.hover};
  }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow:
      0 0 8px 0px ${({ theme }) => theme.colors.primary.main}20,
      0 0 12px 0px ${({ theme }) => theme.colors.primary.main}10;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }

  & > option {
    font: ${({ theme }) => theme.typography.body.font};
    padding: ${({ theme }) => `${theme.spacing.md}`};
    line-height: 1.75;
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.background.primary};
    border-radius: ${({ theme }) => theme.radius.md};
  }

  & > option:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
  }
`;

const StyledOption = styled.option`
  font: ${({ theme }) => theme.typography.body.font};

  padding: ${({ theme }) => `${theme.spacing.md}`};
  line-height: 1.75;

  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.radius.md};
`;

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value">,
    ControlSizeProps {
  $value?: string | number;
  $onChange?: (value: string) => void;
  $options: Array<{
    value: string;
    label: React.ReactNode;
    disabled?: boolean;
  }>;
  $placeholder?: string;
}

/**
 * Controlled Select component that accepts `$value`, `$onChange` and `$options`.
 * Renders styled options and falls back to children if provided.
 * @param $value - Controlled value of the select (string|number).
 * @param $onChange - Handler invoked with the selected value.
 * @param $options - Array of options to render: { value, label, disabled? }.
 * @param $placeholder - Optional placeholder entry rendered with empty value.
 * @param $size - Same sizes as Button. Defaults to Medium.
 */
export const Select: React.FC<SelectProps> = ({
  $value,
  $onChange,
  $options,
  $placeholder,
  children,
  ...rest
}) => {
  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    if ($onChange) $onChange(e.target.value);
    if (rest.onChange)
      (rest.onChange as React.ChangeEventHandler<HTMLSelectElement>)(e);
  };

  return (
    <StyledSelect value={$value} onChange={handleChange} {...rest}>
      {typeof $placeholder === "string" && (
        <StyledOption value="">{$placeholder}</StyledOption>
      )}
      {($options || []).map((opt) => (
        <StyledOption key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </StyledOption>
      ))}
      {children}
    </StyledSelect>
  );
};

/**
 * Form group container for label + input pairs with consistent spacing.
 * Stacks label and input vertically with a small gap and adds bottom margin between groups.
 * Last FormGroup automatically removes bottom margin to prevent unnecessary spacing.
 * @example
 * <FormGroup>
 *   <FormLabel htmlFor="email">Email</FormLabel>
 *   <Input id="email" type="email" />
 * </FormGroup>
 */
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * Form label component with secondary text color for accessibility and visual hierarchy.
 * Should be paired with form inputs using the htmlFor attribute for proper association.
 * @example
 * <FormLabel htmlFor="username">Username</FormLabel>
 * <Input id="username" type="text" />
 */
export const FormLabel = styled.label`
  font: ${({ theme }) => theme.typography.bodyMedium.font};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/**
 * Form container wrapper that stacks form groups vertically with consistent spacing.
 * Provides a semantic form element with flexbox layout for predictable child alignment.
 * @example
 * <FormContainer onSubmit={handleSubmit}>
 *   <FormGroup>
 *     <FormLabel>Name</FormLabel>
 *     <Input type="text" />
 *   </FormGroup>
 *   <Button type="submit">Submit</Button>
 * </FormContainer>
 */
export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;
