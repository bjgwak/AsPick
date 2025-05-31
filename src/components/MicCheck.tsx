import { useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  LinearProgress,
  Button,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useStore } from "../store/StoreContext";

const MicCheck = observer(() => {
  const qnaStore = useStore()?.qnaStore;
  if (!qnaStore) return null;

  const audioAction = qnaStore.audioAction;
  const recordAction = qnaStore.recordAction;
  const whisperAction = qnaStore.whisperAction;

  useEffect(() => {
    audioAction.init();
    return () => audioAction.cleanup();
  }, []);

  return (
    <Box>
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="mic-select-label">Mic</InputLabel>
        <Select
          labelId="mic-select-label"
          value={audioAction.selectedDeviceId}
          label="Mic"
          onChange={(e) => audioAction.selectDevice(e.target.value)}
        >
          {audioAction.devices.map((d) => (
            <MenuItem key={d.deviceId} value={d.deviceId}>
              {d.label || `Mic ${d.deviceId}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="body2" gutterBottom>
        Input Level
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.min(audioAction.volume, 100)}
        sx={{ height: 10 }}
      />

      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          onClick={() => {
            recordAction.startRecord();
          }}
        >
          시작
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            recordAction.stopRecord();
          }}
        >
          중지
        </Button>
      </Box>

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

      <Button
        sx={{ mt: 2 }}
        variant="contained"
        disabled={!qnaStore.blob || !whisperAction.modelReady}
        onClick={async () => {
          if (!qnaStore.blob) return;
          await whisperAction.transcribeBlob(qnaStore.blob);
        }}
      >
        Transcribe
      </Button>
    </Box>
  );
});

export default MicCheck;
