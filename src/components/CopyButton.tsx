import { IconCopy } from "@tabler/icons-react";
import React from "react";
import toast from "react-hot-toast";

import { formatErrorForToast } from "@/api/utils";
import { Button } from "./Button";
import Icon from "./Icon";

export interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  $value: string;
}

/**
 * Small icon-only button to copy text to clipboard.
 * @param $value - The text to copy to the clipboard.
 * @param title - The tooltip/title for the button (default: "Copy").
 * @param disabled - Whether the button is disabled (default: false).
 * @example
 * <CopyButton $value="Some text to copy" />
 */
export const CopyButton: React.FC<CopyButtonProps> = ({
  $value,
  disabled = false,
  ...rest
}) => {
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || !$value) return;

    try {
      await navigator.clipboard.writeText($value);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error(formatErrorForToast(err, "Failed to copy to clipboard"));
    }
  };

  return (
    <Button
      type="button"
      $ghost
      onClick={handleClick}
      disabled={disabled}
      {...rest}
    >
      <Icon $icon={IconCopy} />
    </Button>
  );
};

export default CopyButton;
