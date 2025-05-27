import { useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  LinearProgress,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useStore } from "../store/StoreContext";

const MicCheck = observer(() => {
  const qnaStore = useStore()?.qnaStore;
  if (!qnaStore) return;
  const audioAction = qnaStore.audioAction;

  useEffect(() => {
    audioAction.init();
    return () => {
      audioAction.cleanup();
    };
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
          {audioAction.devices.map((device) => (
            <MenuItem key={device.deviceId} value={device.deviceId}>
              {device.label || `Mic ${device.deviceId}`}
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
    </Box>
  );
});

export default MicCheck;
