import { Suspense } from "react";
import Loading from "../components/Loading";
import { useStore } from "../store/StoreContext";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
let promise: Promise<void> | null = null;
let error: unknown = null;
let done = false;

const StandbyContents: React.FC = () => {
  const { keywordStore, qnaStore } = useStore()!;
  const navigate = useNavigate();

  if (!keywordStore || !qnaStore) return null;

  if (!done) {
    if (!promise) {
      promise = qnaStore
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
      <Button onClick={() => navigate("/interview")}>interview</Button>
      <Button onClick={() => navigate("/exam")}>exam</Button>
    </>
  );
};

const StandbyPage: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <StandbyContents />
    </Suspense>
  );
};
export default StandbyPage;
