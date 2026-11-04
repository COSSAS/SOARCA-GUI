import React, { createContext, useContext } from "react";
import {
  PopoverContent,
  PopoverItemButton,
  PopoverTrigger,
} from "./Popover.styles";

const PopoverContext = createContext<string | undefined>(undefined);

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  $label: string;
  $trigger: React.ReactNode;
  children: React.ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({
  $label,
  $trigger,
  id,
  children,
  ...contentProps
}) => {
  const anchorName = `--${id}`;

  return (
    <>
      <PopoverTrigger
        type="button"
        $anchorName={anchorName}
        popoverTarget={id}
        aria-controls={id}
        aria-label={$label}
      >
        {$trigger}
      </PopoverTrigger>
      <PopoverContext.Provider value={id}>
        <PopoverContent
          role="group"
          aria-label={$label}
          {...contentProps}
          id={id}
          popover="auto"
          $anchorName={anchorName}
        >
          {children}
        </PopoverContent>
      </PopoverContext.Provider>
    </>
  );
};

export type PopoverItemProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const PopoverItem: React.FC<PopoverItemProps> = ({ children, ...props }) => {
  const targetId = useContext(PopoverContext);

  return (
    <PopoverItemButton
      type="button"
      popoverTarget={targetId}
      popoverTargetAction="hide"
      {...props}
    >
      {children}
    </PopoverItemButton>
  );
};
