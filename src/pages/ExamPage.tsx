import { Typography, Box, Paper } from "@mui/material";
import { useStore } from "../store/StoreContext";
import { observer } from "mobx-react";
import Loading from "../components/Loading";
import QuestionBox from "../components/QuestionBox";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { spacing } from "../tokens";
import Layout from "../components/Layout";

const ExamePageContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md}px;
  padding: ${spacing.lg}px;
`;

const ExamPage: React.FC = observer(() => {
  const qnaStore = useStore()?.qnaStore;
  if (!qnaStore) return null;

  const navigate = useNavigate();

  const [isButtonActivated, setIsButtonActivated] = useState<boolean[]>(
    new Array(qnaStore.questions.length).fill(true)
  );

  const submitAnswer = (idx: number, answer: string) => {
    qnaStore.answers[idx] = answer;
    setIsButtonActivated((prev) => {
      const updated = [...prev];
      updated[idx] = false;
      return updated;
    });
  };

  useEffect(() => {
    if (isButtonActivated.every((value) => value === false))
      navigate("/result");
  }, [isButtonActivated]);

  return (
    <Layout title="필기 시험">
      <ExamePageContainer>
        {qnaStore.questions.map((value, idx) => (
          <QuestionBox
            question={value}
            submitAnswer={submitAnswer}
            index={idx}
            key={idx}
            isActivated={isButtonActivated[idx]}
          ></QuestionBox>
        ))}
      </ExamePageContainer>
    </Layout>
  );
});

export default ExamPage;
