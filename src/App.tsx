import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { calculateDiffs, DiffResult } from './calculateDiffs';
import { JsonInput } from './JsonInput';
import { JsonOutput } from './JsonOutput';
import { theme } from './theme';

const Root = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column' as const,
  backgroundColor: theme.dark.pallete.background.main,
  flexGrow: 1
}));

const LEFT_DEFAULT_VALUE = JSON.stringify({
  'Aidan Gillen': {
    array: ['Game of Thron"es', 'The Wire'],
    string: 'some string',
    int: 2,
    aboolean: true,
    boolean: true,
    object: {
      foo: 'bar',
      object1: { 'new prop1': 'new prop value' },
      object2: { 'new prop1': 'new prop value' },
      object3: { 'new prop1': 'new prop value' },
      object4: { 'new prop1': 'new prop value' }
    }
  },
  'Amy Ryan': { one: 'In Treatment', two: 'The Wire' },
  'Annie Fitzgerald': ['Big Love', 'True Blood'],
  'Anwan Glover': ['Treme', 'The Wire'],
  'Alexander Skarsgard': ['Generation Kill', 'True Blood'],
  'Clarke Peters': null
});

const RIGHT_DEFAULT_VALUE = JSON.stringify({
  'Aidan Gillen': {
    array: ['Game of Thrones', 'The Wire'],
    string: 'some string',
    int: '2',
    otherint: 4,
    aboolean: 'true',
    boolean: false,
    object: { foo: 'bar' }
  },
  'Amy Ryan': ['In Treatment', 'The Wire'],
  'Annie Fitzgerald': ['True Blood', 'Big Love', 'The Sopranos', 'Oz'],
  'Anwan Glover': ['Treme', 'The Wire'],
  'Alexander Skarsg?rd': ['Generation Kill', 'True Blood'],
  'Alice Farmer': ['The Corner', 'Oz', 'The Wire']
});

const ContentContainer = styled('div')(() => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gridGap: '0.2rem',
  padding: '0.2rem'
}));

const ActionsContainer = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '0.2rem'
}));

export const App: React.FC = React.memo(() => {
  const [leftInput, setLeftInput] = useState<string>('');
  const [rightInput, setRightInput] = useState<string>('');
  const [result, setResult] = useState<DiffResult>();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const leftParam = searchParams.get('left');
    const rightParam = searchParams.get('right');
    if (leftParam && rightParam) {
      setResult(calculateDiffs({ leftInput: leftParam, rightInput: rightParam }));
    } else {
      setResult(undefined);
    }
  }, [searchParams]);

  return (
    <Root>
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
              value={leftInput}
              onChange={({ target: { value: input } }) => {
                setLeftInput(input);
              }}
            />
            <JsonInput
              value={rightInput}
              onChange={({ target: { value: input } }) => {
                setRightInput(input);
              }}
            />
          </>
        )}
      </ContentContainer>
      <ActionsContainer>
        {result && (
          <button
            onClick={() => {
              setSearchParams({}, { replace: true });
            }}>
            Perform a new diff
          </button>
        )}
        {!result && (
          <button
            onClick={() => {
              setLeftInput(LEFT_DEFAULT_VALUE);
              setRightInput(RIGHT_DEFAULT_VALUE);
            }}>
            Sample Data
          </button>
        )}
        <button
          onClick={() => {
            setSearchParams(
              {
                left: leftInput,
                right: rightInput
              },
              { replace: true }
            );
          }}>
          Compare
        </button>
      </ActionsContainer>
    </Root>
  );
});
