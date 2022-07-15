import React from "react";
import styled from "styled-components";
import { theme } from "./theme";

const Root = styled("input")(() => ({
  backgroundColor: theme.dark.pallete.background.input,
  color: theme.dark.pallete.font.default,
  borderRadius: theme.dark.borderRadius,
  transition: "all 100ms ease 0s",
  outline: "none",
  border: `1px solid ${theme.dark.pallete.border.input}`,
  "&:hover": {
    border: `1px solid ${theme.dark.pallete.border.inputHovered}`,
  },
  fontFamily: "'Source Code Pro', monospace",
  padding: 15,
}));

export type TitleInputProps = Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  "ref"
>;

export const TitleInput: React.FC<TitleInputProps> = React.memo(
  React.forwardRef<HTMLInputElement, TitleInputProps>(({ ...props }, ref) => {
    return <Root ref={ref} {...props} />;
  })
);
