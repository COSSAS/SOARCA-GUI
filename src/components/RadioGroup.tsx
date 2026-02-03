import React from "react";
import styled from "styled-components";

const RadioGroupContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const RadioLabel = styled.label<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};

  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const RadioInput = styled.input`
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  position: relative;
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }

  &:checked {
    border-color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ theme }) => theme.colors.primary.main};
  }

  &:checked::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.background.primary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  $options: RadioOption[];
  $value: string;
  $onChange: (value: string) => void;
  $disabled?: boolean;
}

/**
 * Radio component for selecting a single option from multiple choices.
 * Renders a horizontal list of radio buttons with custom styling matching the theme.
 * Each radio button shows a filled circle when selected with smooth transitions.
 * Supports controlled state management and disabled mode for all options.
 * @param name - Shared name attribute for all radio inputs in this group. Groups options together for mutual exclusivity.
 * @param $options - Array of { label, value } option objects to render as radio buttons.
 * @param $value - Currently selected option value (controlled component pattern).
 * @param $onChange - Callback fired with the newly selected value when user clicks an option.
 * @param $disabled - When true, disables all options in the group with reduced opacity and no-allowed cursor. Defaults to false.
 * @example
 * const [selected, setSelected] = useState("option1");
 * <RadioGroup
 *   name="choice"
 *   $options={[
 *     { label: "Option 1", value: "option1" },
 *     { label: "Option 2", value: "option2" }
 *   ]}
 *   $value={selected}
 *   $onChange={setSelected}
 * />
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  $options,
  $value,
  $onChange,
  $disabled = false,
  ...rest
}) => {
  return (
    <RadioGroupContainer {...rest}>
      {$options.map((option) => (
        <RadioLabel key={option.value} $disabled={$disabled}>
          <RadioInput
            type="radio"
            name={name}
            value={option.value}
            checked={$value === option.value}
            onChange={(e) => $onChange(e.target.value)}
            disabled={$disabled}
          />
          <span>{option.label}</span>
        </RadioLabel>
      ))}
    </RadioGroupContainer>
  );
};
