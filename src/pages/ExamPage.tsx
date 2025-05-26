import { Typography, Box } from "@mui/material";
import { useStore } from "../store/StoreContext";
import { observer } from "mobx-react";
import Loading from "../components/Loading";
import QuestionBox from "../components/QuestionBox";
import styled from "styled-components";

const ExamePageContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background-color: grey;
`;

const ExamPage = observer(() => {
  const qnaStore = useStore()?.qnaStore;
  if (!qnaStore) return;

  const test: string[] = ["1", "2"];

  const submitAnswer = (idx: number, answer: string) => {
    qnaStore.submitAnswer(idx, answer);
  };
  return (
    <ExamePageContainer>
      {test.map((value, idx) => (
        <QuestionBox
          question={value}
          submitAnswer={submitAnswer}
          index={idx}
          key={idx}
        ></QuestionBox>
      ))}
    </ExamePageContainer>
  );
});

export default ExamPage;
