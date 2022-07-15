import React from "react";
import styled from "styled-components";
import { theme } from "./theme";

const Root = styled("button")(({ disabled }) => ({
  borderRadius: 2,
  backgroundColor: !disabled ? "#2b2a2a" : "#6a6a6a",
  color: theme.dark.pallete.font.default,
  padding: "5px 16px",
  border: "none",
  cursor: !disabled ? "pointer" : undefined,
  "&:hover": !disabled
    ? {
        background:
          "linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), #2b2a2a",
      }
    : undefined,
  fontSize: "medium",
}));

export type ButtonProps = Omit<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >,
  "ref"
>;

export const Button: React.FC<ButtonProps> = React.memo(
  React.forwardRef<HTMLButtonElement, ButtonProps>(({ ...props }, ref) => {
    return <Root ref={ref} {...props} />;
  })
);
