import { Box, Typography, Button } from "@mui/material";
import { observer } from "mobx-react";
import type React from "react";
import { useStore } from "../store/StoreContext";

const WhisperDownloader: React.FC = observer(() => {
  const whisperAction = useStore()?.qnaStore.whisperAction;
  if (!whisperAction) return null;
  return (
    <>
      <Box sx={{ mt: 3 }}>
        {whisperAction.modelReady ? (
          <Typography color="success.main">모델 준비 완료 ✔</Typography>
        ) : (
          <>
            <Button
              variant="contained"
              disabled={whisperAction.loading}
              onClick={() => whisperAction.loadModel()}
            >
              모델 다운로드(75 MB)
            </Button>
            {whisperAction.loading && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {Math.round(whisperAction.progress * 100)}%
              </Typography>
            )}
            {whisperAction.error && (
              <Typography color="error">{whisperAction.error}</Typography>
            )}
          </>
        )}
      </Box>
    </>
  );
});

export default WhisperDownloader;
