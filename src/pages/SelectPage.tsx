import { observer } from "mobx-react";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router";
import styled from "styled-components";
import KeywordList from "../components/KeywordList";
import KeywordSearchBar from "../components/KeywordSearchBar";
import { useStore } from "../store/StoreContext";
import WhisperDownloader from "../components/WhisperDownLoader";

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const SelectPage: React.FC = observer(() => {
  const { keywordStore, qnaStore } = useStore()!;
  const navigate = useNavigate();
  if (!keywordStore || !qnaStore) return null;

  return (
    <SelectContainer>
      <KeywordSearchBar></KeywordSearchBar>
      <KeywordList></KeywordList>
      <ButtonContainer>
        <Button
          onClick={() => {
            keywordStore.clearKeywords();
          }}
        >
          초기화
        </Button>
        <Button
          onClick={() => {
            navigate("/standby");
          }}
        >
          시작
        </Button>
      </ButtonContainer>
      <WhisperDownloader />
      <TextField
        label="Gemini API Key"
        size="small"
        value={qnaStore.geminiAction.apiKey}
        onChange={(e) => qnaStore.geminiAction.setApiKey(e.target.value)}
        sx={{ mt: 2 }}
      />
    </SelectContainer>
  );
});

export default SelectPage;
