import React from 'react';
import styled from 'styled-components';
import { Diff } from './calculateDiffs';
import { theme } from './theme';

const Root = styled('table')(() => ({
  backgroundColor: theme.dark.pallete.background.dark,
  color: 'white',
  borderRadius: theme.dark.borderRadius,
  borderSpacing: 0,
  border: `1px solid ${theme.dark.pallete.border.default}`
}));

const ROW_HEIGHT = 20;

const LineNumberCol = styled('td')(() => ({
  color: theme.dark.pallete.font.subtle,
  textAlign: 'right' as const,
  paddingLeft: 10,
  paddingRight: 10,
  lineHeight: `${ROW_HEIGHT}px`
}));

const ContentCol = styled('td')(() => ({
  paddingLeft: 24,
  lineHeight: `${ROW_HEIGHT}px`
}));

const Content = styled('span')(() => ({
  color: theme.dark.pallete.font.light,
  wordWrap: 'break-word' as const,
  whiteSpace: 'pre-wrap' as const
}));

export interface JsonOutputProps
  extends Omit<
    React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>,
    'ref' | 'children'
  > {
  side: 'left' | 'right';
  diffs: Diff[];
  children: string;
}

export const JsonOutput: React.FC<JsonOutputProps> = React.memo(
  React.forwardRef<HTMLTableElement, JsonOutputProps>(
    ({ side, diffs, children, ...props }, ref) => {
      return (
        <Root ref={ref} {...props}>
          <tbody>
            {children.split('\n').map((line, index) => {
              const diff = diffs.find(
                (d) => (side === 'left' ? d.path1.line : d.path2.line) - 1 === index
              );
              let lineBackgroundColor: string | undefined;
              if (diff) {
                switch (diff.type) {
                  case 'missing':
                    lineBackgroundColor = theme.dark.pallete.success.solid;
                    break;
                  case 'type':
                    lineBackgroundColor = theme.dark.pallete.error.solid;
                    break;
                  case 'eq':
                    lineBackgroundColor = theme.dark.pallete.grey.solid;
                    break;
                  default:
                    throw new Error(`Unhandled diff type '${diff.type}'`);
                }
              } else {
                lineBackgroundColor = undefined;
              }
              let contentBackgroundColor: string | undefined;
              if (diff) {
                switch (diff.type) {
                  case 'missing':
                    contentBackgroundColor = theme.dark.pallete.success.transparent;
                    break;
                  case 'type':
                    contentBackgroundColor = theme.dark.pallete.error.transparent;
                    break;
                  case 'eq':
                    contentBackgroundColor = theme.dark.pallete.grey.transparent;
                    break;
                  default:
                    throw new Error(`Unhandled diff type '${diff.type}'`);
                }
              } else {
                contentBackgroundColor = undefined;
              }
              return (
                <tr key={index}>
                  <LineNumberCol style={{ backgroundColor: lineBackgroundColor }}>
                    {index + 1}
                  </LineNumberCol>
                  <ContentCol style={{ backgroundColor: contentBackgroundColor }}>
                    <Content>{line}</Content>
                  </ContentCol>
                </tr>
              );
            })}
          </tbody>
        </Root>
      );
    }
  )
);
