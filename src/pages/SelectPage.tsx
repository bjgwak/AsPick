import { observer } from "mobx-react";
import { Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import styled, { css, keyframes } from "styled-components";
import KeywordList from "../components/KeywordList";
import KeywordSearchBar from "../components/KeywordSearchBar";
import { useStore } from "../store/StoreContext";
import WhisperDownloader from "../components/WhisperDownLoader";
import { useState } from "react";

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const shakeKeyframes = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
`;

const ApiKeyField = styled(TextField)<{ $shake: boolean }>`
  ${(props) =>
    props.$shake &&
    css`
      animation: ${shakeKeyframes} 0.5s ease;
    `}
`;

const SelectPage: React.FC = observer(() => {
  const { keywordStore, qnaStore } = useStore()!;
  const navigate = useNavigate();
  const [isApiKeyError, setIsApiKeyError] = useState<boolean>(false);
  const [isShake, setIsShake] = useState<boolean>(false);
  if (!keywordStore || !qnaStore) return null;

  const handleStart = async () => {
    if (await qnaStore.geminiAction.validateApiKey()) {
      setIsApiKeyError(false);
      navigate("/standby");
    } else {
      setIsApiKeyError(true);
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500); // 흔들림 종료
    }
  };
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
        <Button onClick={handleStart}>시작</Button>
      </ButtonContainer>
      <WhisperDownloader />
      <ApiKeyField
        label="Gemini API Key"
        size="small"
        value={qnaStore.geminiAction.apiKey}
        onChange={(e) => qnaStore.geminiAction.setApiKey(e.target.value)}
        error={isApiKeyError}
        $shake={isShake}
        sx={{ mt: 2 }}
      />
      {isApiKeyError && (
        <Typography color="error" variant="body2">
          유효하지 않은 API 키입니다.
        </Typography>
      )}
    </SelectContainer>
  );
});

export default SelectPage;
