import React from "react";
import styled from "styled-components";
import { Diff } from "./calculateDiffs";
import { theme } from "./theme";

const Root = styled("div")(() => ({
  display: "flex",
  flexDirection: "column" as const,
  borderRadius: theme.dark.borderRadius,
  overflow: "hidden",
}));

const Header = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  padding: "1rem 1.25rem",
  backgroundColor: "#2b2a2a",
  borderBottom: `1px solid ${theme.dark.pallete.border.jsonOutput}`,
}));

const Footer = styled("div")(() => ({
  padding: "1rem 1.25rem",
  backgroundColor: "#2b2a2a",
  borderTop: `1px solid ${theme.dark.pallete.border.jsonOutput}`,
}));

const Title = styled("h3")(() => ({
  margin: 0,
}));

const Table = styled("table")(() => ({
  borderSpacing: 0,
  fontFamily: "'Source Code Pro', monospace",
  backgroundColor: theme.dark.pallete.background.input,
}));

const ROW_HEIGHT = 20;

const LineNumberCol = styled("td")(() => ({
  color: "#999999",
  textAlign: "right" as const,
  paddingLeft: 10,
  paddingRight: 10,
  lineHeight: `${ROW_HEIGHT}px`,
}));

const ContentCol = styled("td")(() => ({
  paddingLeft: 24,
  lineHeight: `${ROW_HEIGHT}px`,
}));

const Content = styled("span")(() => ({
  color: theme.dark.pallete.font.default,
  wordWrap: "break-word" as const,
  whiteSpace: "pre-wrap" as const,
}));

export interface JsonOutputProps
  extends Omit<
    React.DetailedHTMLProps<
      React.TableHTMLAttributes<HTMLTableElement>,
      HTMLTableElement
    >,
    "ref" | "children" | "title"
  > {
  title?: string | null;
  side: "left" | "right";
  diffs: Diff[];
  children: string;
}

export const JsonOutput: React.FC<JsonOutputProps> = React.memo(
  React.forwardRef<HTMLTableElement, JsonOutputProps>(
    ({ title, side, diffs, children, ...props }, ref) => {
      return (
        <Root>
          <Header>{title?.trim() !== "" && <Title>{title}</Title>}</Header>
          <Table ref={ref} {...props}>
            <tbody>
              {children.split("\n").map((line, index) => {
                const diff = diffs.find(
                  (d) =>
                    (side === "left" ? d.path1.line : d.path2.line) - 1 ===
                    index
                );
                let lineBackgroundColor: string | undefined;
                if (diff) {
                  switch (diff.type) {
                    case "missing":
                      lineBackgroundColor = theme.dark.pallete.success.solid;
                      break;
                    case "type":
                      lineBackgroundColor = theme.dark.pallete.error.solid;
                      break;
                    case "eq":
                      lineBackgroundColor = "#6567b18f";
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
                    case "missing":
                      contentBackgroundColor =
                        theme.dark.pallete.success.transparent;
                      break;
                    case "type":
                      contentBackgroundColor =
                        theme.dark.pallete.error.transparent;
                      break;
                    case "eq":
                      contentBackgroundColor = "#6567b14d";
                      break;
                    default:
                      throw new Error(`Unhandled diff type '${diff.type}'`);
                  }
                } else {
                  contentBackgroundColor = undefined;
                }
                return (
                  <tr key={index}>
                    <LineNumberCol
                      style={{ backgroundColor: lineBackgroundColor }}
                    >
                      {index + 1}
                    </LineNumberCol>
                    <ContentCol
                      style={{ backgroundColor: contentBackgroundColor }}
                    >
                      <Content>{line}</Content>
                    </ContentCol>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Footer />
        </Root>
      );
    }
  )
);
