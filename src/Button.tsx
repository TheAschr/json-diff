import React from "react";
import styled from "styled-components";
import { theme } from "./theme";

const Root = styled("button")(() => ({
  borderRadius: 2,
  backgroundColor: "#2b2a2a",
  color: theme.dark.pallete.font.default,
  padding: "5px 16px",
  border: "none",
  cursor: "pointer",
  "&:hover": {
    background:
      "linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), #2b2a2a",
  },
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
