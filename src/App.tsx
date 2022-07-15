import * as React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { calculateDiffs, DiffResult } from "./calculateDiffs";
import { JsonInput } from "./JsonInput";
import { JsonOutput } from "./JsonOutput";
import { Logo } from "./Logo";
import { theme } from "./theme";
import { Link } from "react-router-dom";
import { deviceSizeBreakpoints } from "./deviceSizeBreakpoints";
import { TitleInput } from "./TitleInput";
import { sampleData } from "./sampleData";
import { Button } from "./Button";

const Root = styled("div")(() => ({
  display: "flex",
  flexDirection: "column" as const,
  color: theme.dark.pallete.font.default,
  backgroundColor: theme.dark.pallete.background.main,
  flexGrow: 1,
}));

const ContentContainer = styled("div")(() => ({
  [`@media ${deviceSizeBreakpoints.zero}`]: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gridGap: "1rem",
    padding: "1rem",
  },
  [`@media ${deviceSizeBreakpoints.laptop}`]: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridGap: "0.2rem",
    padding: "1rem",
  },
}));

const ActionsContainer = styled("div")(() => ({
  display: "flex",
  justifyContent: "flex-end",
  paddingRight: "1rem",
  paddingLeft: "1rem",
}));

const TitleLink = styled(Link)(() => ({
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  color: "inherit",
}));

const Header = styled("header")(() => ({
  display: "flex",
  alignItems: "center",
  paddingLeft: "1.25rem",
  paddingRight: "1.25rem",
}));

const Title = styled("h1")(() => ({
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 15,
  paddingTop: "0.75rem",
  paddingBottom: "0.75rem",
}));

const InputContainer = styled("div")(() => ({
  display: "flex",
  flexDirection: "column" as const,
}));

const StyledTitleInput = styled(TitleInput)(() => ({
  marginBottom: "0.75rem",
}));

const ActionButton = styled(Button)(() => ({
  "&:not(:last-child)": {
    marginRight: "0.5rem",
  },
}));

export const App: React.FC = React.memo(() => {
  const [leftTitle, setLeftTitle] = useState<string>("");
  const [rightTitle, setRightTitle] = useState<string>("");
  const [leftInput, setLeftInput] = useState<string>("");
  const [rightInput, setRightInput] = useState<string>("");
  const [result, setResult] = useState<DiffResult>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const leftTitleParam = searchParams.get("leftTitle");
    const leftInputParam = searchParams.get("leftInput");
    const rightTitleParam = searchParams.get("rightTitle");
    const rightInputParam = searchParams.get("rightInput");
    if (leftInputParam && rightInputParam) {
      setResult(
        calculateDiffs({
          leftTitle: leftTitleParam || "",
          leftInput: leftInputParam,
          rightTitle: rightTitleParam || "",
          rightInput: rightInputParam,
        })
      );
      setCopied(false);
    } else {
      setResult(undefined);
    }
  }, [searchParams]);

  return (
    <Root>
      <Header>
        <TitleLink to="/">
          <Logo height="2em" fill={theme.dark.pallete.font.default} />
          <Title>JSON Diff</Title>
        </TitleLink>
      </Header>
      <ActionsContainer>
        {result ? (
          <>
            <ActionButton
              disabled={copied}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
              }}
            >
              {copied ? "Copied to clipboard!" : "Copy Link"}
            </ActionButton>
            <ActionButton
              onClick={() => {
                setSearchParams({}, { replace: true });
              }}
            >
              Perform a new diff
            </ActionButton>
          </>
        ) : (
          <>
            <ActionButton
              onClick={() => {
                setLeftTitle(sampleData.leftTitle);
                setLeftInput(sampleData.leftInput);
                setRightTitle(sampleData.rightTitle);
                setRightInput(sampleData.rightInput);
              }}
            >
              Sample Data
            </ActionButton>
            <ActionButton
              onClick={() => {
                setSearchParams(
                  {
                    leftTitle,
                    leftInput,
                    rightTitle,
                    rightInput,
                  },
                  { replace: true }
                );
              }}
            >
              Compare
            </ActionButton>
          </>
        )}
      </ActionsContainer>
      <ContentContainer>
        {result?.valid === true ? (
          <>
            <JsonOutput
              side="left"
              title={result.leftTitle}
              diffs={result.diffs}
            >
              {result.leftOutput}
            </JsonOutput>
            <JsonOutput
              side="right"
              title={result.rightTitle}
              diffs={result.diffs}
            >
              {result.rightOutput}
            </JsonOutput>
          </>
        ) : (
          <>
            <InputContainer>
              <StyledTitleInput
                placeholder="Title"
                aria-label="Left Input"
                value={leftTitle}
                onChange={({ target: { value: input } }) => {
                  setLeftTitle(input);
                }}
              />
              <JsonInput
                aria-label="Left Input"
                value={leftInput}
                onChange={({ target: { value: input } }) => {
                  setLeftInput(input);
                }}
              />
            </InputContainer>
            <InputContainer>
              <StyledTitleInput
                placeholder="Title"
                aria-label="Right Input"
                value={rightTitle}
                onChange={({ target: { value: input } }) => {
                  setRightTitle(input);
                }}
              />
              <JsonInput
                aria-label="Right Input"
                value={rightInput}
                onChange={({ target: { value: input } }) => {
                  setRightInput(input);
                }}
              />
            </InputContainer>
          </>
        )}
      </ContentContainer>
    </Root>
  );
});
