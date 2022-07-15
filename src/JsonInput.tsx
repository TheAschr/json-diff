import React from 'react';
import styled from 'styled-components';
import { theme } from './theme';

const Root = styled('textarea')(() => ({
  backgroundColor: theme.dark.pallete.background.dark,
  color: theme.dark.pallete.font.default,
  borderRadius: theme.dark.borderRadius,
  padding: 15
}));

export type JsonInputProps = Omit<
  React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>,
  'ref'
>;

export const JsonInput: React.FC<JsonInputProps> = React.memo(
  React.forwardRef<HTMLTextAreaElement, JsonInputProps>(({ ...props }, ref) => {
    return <Root ref={ref} rows={45} {...props} />;
  })
);
