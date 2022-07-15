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

const Root = styled("div")(() => ({
  display: "flex",
  flexDirection: "column" as const,
  color: theme.dark.pallete.font.default,
  backgroundColor: theme.dark.pallete.background.main,
  flexGrow: 1,
}));

const LEFT_DEFAULT_VALUE = JSON.stringify({
  "Aidan Gillen": {
    array: ['Game of Thron"es', "The Wire"],
    string: "some string",
    int: 2,
    aboolean: true,
    boolean: true,
    object: {
      foo: "bar",
      object1: { "new prop1": "new prop value" },
      object2: { "new prop1": "new prop value" },
      object3: { "new prop1": "new prop value" },
      object4: { "new prop1": "new prop value" },
    },
  },
  "Amy Ryan": { one: "In Treatment", two: "The Wire" },
  "Annie Fitzgerald": ["Big Love", "True Blood"],
  "Anwan Glover": ["Treme", "The Wire"],
  "Alexander Skarsgard": ["Generation Kill", "True Blood"],
  "Clarke Peters": null,
});

const RIGHT_DEFAULT_VALUE = JSON.stringify({
  "Aidan Gillen": {
    array: ["Game of Thrones", "The Wire"],
    string: "some string",
    int: "2",
    otherint: 4,
    aboolean: "true",
    boolean: false,
    object: { foo: "bar" },
  },
  "Amy Ryan": ["In Treatment", "The Wire"],
  "Annie Fitzgerald": ["True Blood", "Big Love", "The Sopranos", "Oz"],
  "Anwan Glover": ["Treme", "The Wire"],
  "Alexander Skarsg?rd": ["Generation Kill", "True Blood"],
  "Alice Farmer": ["The Corner", "Oz", "The Wire"],
});

const ContentContainer = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gridGap: "0.2rem",
  padding: "1rem",
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

export const App: React.FC = React.memo(() => {
  const [leftInput, setLeftInput] = useState<string>("");
  const [rightInput, setRightInput] = useState<string>("");
  const [result, setResult] = useState<DiffResult>();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const leftParam = searchParams.get("left");
    const rightParam = searchParams.get("right");
    if (leftParam && rightParam) {
      setResult(
        calculateDiffs({ leftInput: leftParam, rightInput: rightParam })
      );
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
        {result && (
          <button
            onClick={() => {
              setSearchParams({}, { replace: true });
            }}
          >
            Perform a new diff
          </button>
        )}
        {!result && (
          <button
            onClick={() => {
              setLeftInput(LEFT_DEFAULT_VALUE);
              setRightInput(RIGHT_DEFAULT_VALUE);
            }}
          >
            Sample Data
          </button>
        )}
        <button
          onClick={() => {
            setSearchParams(
              {
                left: leftInput,
                right: rightInput,
              },
              { replace: true }
            );
          }}
        >
          Compare
        </button>
      </ActionsContainer>
      <ContentContainer>
        {result?.valid === true ? (
          <>
            <JsonOutput side="left" diffs={result.diffs}>
              {result.leftOutput}
            </JsonOutput>
            <JsonOutput side="right" diffs={result.diffs}>
              {result.rightOutput}
            </JsonOutput>
          </>
        ) : (
          <>
            <JsonInput
              aria-label="Left Input"
              value={leftInput}
              onChange={({ target: { value: input } }) => {
                setLeftInput(input);
              }}
            />
            <JsonInput
              aria-label="Right Input"
              value={rightInput}
              onChange={({ target: { value: input } }) => {
                setRightInput(input);
              }}
            />
          </>
        )}
      </ContentContainer>
    </Root>
  );
});
