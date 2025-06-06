import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SelectPage from "./pages/SelectPage";
import InterviewPage from "./pages/InterviewPage";
import ResultPage from "./pages/ResultPage";
import StandbyPage from "./pages/StandbyPage";
import ExamPage from "./pages/ExamPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path={"/"} element={<Navigate to={"/select"} />}></Route>
          <Route path={"/select"} element={<SelectPage />}></Route>
          <Route path={"/standby"} element={<StandbyPage />}></Route>
          <Route path={"/exam"} element={<ExamPage />}></Route>
          <Route path={"/interview"} element={<InterviewPage />}></Route>
          <Route path={"/result"} element={<ResultPage />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
