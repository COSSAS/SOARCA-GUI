import styled from "styled-components";

/**
 * Standard form input with theme-based styling, focus states, and validation support.
 * Provides hover and focus states with border color transitions and subtle shadows.
 * Automatically fills container width with proper box-sizing for predictable layouts.
 * @example
 * <Input type="text" placeholder="Enter your name" />
 * @example
 * <Input type="email" required disabled />
 */
export const Input = styled.input`
  width: 100%;
  box-sizing: border-box;

  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.md};

  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};

  font: ${({ theme }) => theme.typography.caption.font};
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
const StyledSelect = styled.select`
  width: 100%;
  box-sizing: border-box;

  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.md};

  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};

  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.primary};
  line-height: 1.5;

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
    background: ${({ theme }) => theme.colors.background.secondary};
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

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "value"
> {
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
