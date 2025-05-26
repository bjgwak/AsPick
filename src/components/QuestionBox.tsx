import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import styled from "styled-components";

const QBcontainer = styled(Box)`
  background-color: #5a50c7;
`;

interface QuestionBoxProps {
  question: string;
  submitAnswer: (idx: number, answer: string) => void;
  index: number;
}

function QuestionBox({ question, submitAnswer, index }: QuestionBoxProps) {
  const [answer, setAnswer] = useState<string>("");

  const handleAnswerTyped = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
  };
  return (
    <>
      <QBcontainer>
        <Typography>{question}</Typography>
        <TextField value={answer} onChange={handleAnswerTyped}></TextField>
        <Button
          onClick={() => {
            submitAnswer(index, answer);
          }}
        >
          제출
        </Button>
      </QBcontainer>
    </>
  );
}

export default QuestionBox;
