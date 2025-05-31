import { useEffect, useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { useStore } from "../store/StoreContext";
import TimerBar from "../components/TimerBar";
import PrepOverlay from "../components/PrepOverlay";
import MicVisualizer from "../components/MicVisualizer";
import styled from "styled-components";

const QUESTION_TIME = 90;
const PREP_TIME = 5;

const InterviewBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const InterviewPage: React.FC = observer(() => {
  const { qnaStore } = useStore() ?? {};
  const navigate = useNavigate();
  if (!qnaStore) return null;

  useEffect(() => {
    qnaStore.audioAction.init();
    return () => qnaStore.audioAction.cleanup();
  }, []);

  const [isPrepared, setIsPrepared] = useState(true);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    setIsPrepared(true);
    setTimeLeft(QUESTION_TIME);

    qnaStore.recordAction.startRecord();

    const prepId = window.setTimeout(() => {
      setIsPrepared(false);
      timerRef.current = window.setInterval(
        () => setTimeLeft((t) => t - 1),
        1000
      );
    }, PREP_TIME * 1000);

    return () => {
      clearTimeout(prepId);
      clearInterval(timerRef.current);
      qnaStore.recordAction.stopRecord();
      qnaStore.whisperAction.transcribeBlob(qnaStore.blob);
    };
  }, [qnaStore.currentQuestionIndex]);

  useEffect(() => {
    if (!isPrepared && timeLeft <= 0) handleNextButton();
  }, [timeLeft, isPrepared]);

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${`${s % 60}`.padStart(2, "0")}`;

  const percent = (timeLeft / QUESTION_TIME) * 100;

  const handleNextButton = () => {
    qnaStore.requestNextQuestion();
    clearInterval(timerRef.current);
    if (qnaStore.currentQuestionIndex >= qnaStore.questions.length) {
      navigate("/result");
    }
  };

  return (
    <InterviewBox>
      {isPrepared ? (
        <PrepOverlay />
      ) : (
        <>
          <TimerBar
            percent={percent}
            label={`${fmt(timeLeft)} / ${fmt(QUESTION_TIME)}`}
          />
          <Typography variant="h6" marginBottom={3}>
            {qnaStore.questions[qnaStore.currentQuestionIndex]}
          </Typography>
          <MicVisualizer />
          <Button
            variant="contained"
            color={
              qnaStore.currentQuestionIndex >= qnaStore.questions.length - 1
                ? "secondary"
                : "primary"
            }
            sx={{ mt: 4 }}
            onClick={handleNextButton}
          >
            {qnaStore.currentQuestionIndex >= qnaStore.questions.length - 1
              ? "종료"
              : "다음"}
          </Button>
        </>
      )}
    </InterviewBox>
  );
});

export default InterviewPage;
