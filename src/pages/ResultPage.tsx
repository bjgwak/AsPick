import { Button } from "@mui/material";
import { Suspense } from "react";
import { useNavigate } from "react-router";
import Loading from "../components/Loading";
import { useStore } from "../store/StoreContext";
import ResultBox from "../components/ResultBox";

let promise: Promise<void> | null = null;
let error: unknown = null;
let done = false;

const ResultContents: React.FC = () => {
  const qnaStore = useStore()?.qnaStore;
  const navigate = useNavigate();

  if (!qnaStore) return null;

  if (!done) {
    if (!promise) {
      promise = qnaStore.geminiAction
        .queryResults()
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

  const handleReset = () => {
    //store나 관련 데이터 리셋
    navigate("/");
  };

  return (
    <>
      {qnaStore.results.map((value, index) => (
        <ResultBox result={`${index}: ${value}`} key={index}></ResultBox>
      ))}
      <Button onClick={handleReset}>처음으로</Button>
    </>
  );
};

export default function ResultPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResultContents />
    </Suspense>
  );
}
