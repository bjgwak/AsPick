import { Suspense } from "react";
import Loading from "../components/Loading";
import { useStore } from "../store/StoreContext";
import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MicCheck from "../components/MicCheck";
import Layout from "../components/Layout";
let promise: Promise<void> | null = null;
let error: unknown = null;
let done = false;

const StandbyContents: React.FC = () => {
  const { keywordStore, qnaStore } = useStore()!;
  const navigate = useNavigate();

  if (!keywordStore || !qnaStore) return null;

  if (!done) {
    if (!promise) {
      promise = qnaStore.geminiAction
        .queryQuestions(keywordStore.selectedKeywords)
        .then(() => {
          done = true;
        })
        .catch((e) => {
          error = e;
        });
    }
    if (error) throw error;
    throw promise;
  }

  return (
    <>
      <Stack spacing={2} direction="column" alignItems="center">
        <Button variant="contained" onClick={() => navigate("/interview")}>
          인터뷰 모드
        </Button>
        <Button variant="outlined" onClick={() => navigate("/exam")}>
          시험 모드
        </Button>
      </Stack>
    </>
  );
};

const StandbyPage: React.FC = () => {
  return (
    <Layout title="대기 중">
      <Suspense fallback={<Loading />}>
        <MicCheck />
        <StandbyContents />
      </Suspense>
    </Layout>
  );
};
export default StandbyPage;
