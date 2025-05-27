import { Typography, Box } from "@mui/material";
import { useStore } from "../store/StoreContext";
import { observer } from "mobx-react";
import Loading from "../components/Loading";
import QuestionBox from "../components/QuestionBox";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ExamePageContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background-color: grey;
`;

const ExamPage: React.FC = observer(() => {
  const qnaStore = useStore()?.qnaStore;
  if (!qnaStore) return null;

  const navigate = useNavigate();

  const [isButtonActivated, setIsButtonActivated] = useState<boolean[]>(
    new Array(qnaStore.questions.length).fill(true)
  );

  const test: string[] = ["1", "2"];

  const submitAnswer = (idx: number, answer: string) => {
    qnaStore.submitAnswer(idx, answer);
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
    <ExamePageContainer>
      {test.map((value, idx) => (
        <QuestionBox
          question={value}
          submitAnswer={submitAnswer}
          index={idx}
          key={idx}
          isActivated={isButtonActivated[idx]}
        ></QuestionBox>
      ))}
    </ExamePageContainer>
  );
});

export default ExamPage;
