import { useEffect, useRef, useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { useStore } from "../store/StoreContext";
import TimerBar from "../components/TimerBar";
import PrepOverlay from "../components/PrepOverlay";
import MicVisualizer from "../components/MicVisualizer";
import styled from "styled-components";
import { spacing } from "../tokens";
import Layout from "../components/Layout";

const QUESTION_TIME = 90;
const PREP_TIME = 5;

const InterviewBox = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.md}px;
  padding: ${spacing.lg}px;
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
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setIsPrepared(true);
    setTimeLeft(QUESTION_TIME);

    const prepId = window.setTimeout(() => {
      setIsPrepared(false);

      qnaStore.recordAction.startRecord();

      intervalRef.current = window.setInterval(
        () => setTimeLeft((t) => t - 1),
        1000
      );
    }, PREP_TIME * 1000);

    return () => {
      clearTimeout(prepId);
      if (intervalRef.current) clearInterval(intervalRef.current);

      qnaStore.recordAction.stopRecord(qnaStore.currentQuestionIndex);
    };
  }, [qnaStore.currentQuestionIndex]);

  useEffect(() => {
    if (!isPrepared && timeLeft <= 0) handleNextButton();
  }, [timeLeft, isPrepared]);

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${`${s % 60}`.padStart(2, "0")}`;
  const percent = (timeLeft / QUESTION_TIME) * 100;

  const handleNextButton = async () => {
    await qnaStore.recordAction.stopRecord(qnaStore.currentQuestionIndex);

    qnaStore.requestNextQuestion();

    if (qnaStore.currentQuestionIndex >= qnaStore.questions.length) {
      navigate("/result");
    }
  };

  return (
    <Layout title="면접 진행">
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
    </Layout>
  );
});

export default InterviewPage;
