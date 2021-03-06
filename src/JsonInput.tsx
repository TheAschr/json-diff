import React from "react";
import styled from "styled-components";
import { theme } from "./theme";

const Root = styled("textarea")(() => ({
  backgroundColor: theme.dark.pallete.background.input,
  color: theme.dark.pallete.font.default,
  borderRadius: theme.dark.borderRadius,
  transition: "all 100ms ease 0s",
  overflow: "hidden",
  outline: "none",
  border: `1px solid ${theme.dark.pallete.border.input}`,
  "&:hover": {
    border: `1px solid ${theme.dark.pallete.border.inputHovered}`,
  },
  padding: 15,
  fontFamily: "'Source Code Pro', monospace",
}));

export type JsonInputProps = Omit<
  React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >,
  "ref"
>;

export const JsonInput: React.FC<JsonInputProps> = React.memo(
  React.forwardRef<HTMLTextAreaElement, JsonInputProps>(({ ...props }, ref) => {
    return <Root ref={ref} rows={45} {...props} />;
  })
);
