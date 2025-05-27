// MicCheck.tsx
import { useEffect, useRef, useState } from "react";
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
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [volume, setVolume] = useState<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const qnaStore = useStore()?.qnaStore;
  if (!qnaStore) return;

  const fetchDevices = async () => {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = allDevices.filter((d) => d.kind === "audioinput");
    setDevices(audioInputs);
    if (audioInputs.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(audioInputs[0].deviceId);
    }
  };

  const setupStream = async (deviceId: string) => {
    if (qnaStore.micStream) {
      qnaStore.micStream.getTracks().forEach((track) => track.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId },
      video: false,
    });

    qnaStore.micStream = stream;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;

    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateVolume = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(avg);
      }
      animationRef.current = requestAnimationFrame(updateVolume);
    };

    cancelAnimationFrame(animationRef.current ?? 0);
    updateVolume();
  };

  useEffect(() => {
    fetchDevices();
    navigator.mediaDevices.addEventListener("devicechange", fetchDevices);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", fetchDevices);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (qnaStore.micStream) {
        qnaStore.micStream.getTracks().forEach((track) => track.stop());
        qnaStore.micStream = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selectedDeviceId) {
      setupStream(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  return (
    <Box>
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="mic-select-label">Mic</InputLabel>
        <Select
          labelId="mic-select-label"
          value={selectedDeviceId}
          label="Mic"
          onChange={(e) => setSelectedDeviceId(e.target.value)}
        >
          {devices.map((device) => (
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
        value={Math.min(volume, 100)}
        sx={{ height: 10 }}
      />
    </Box>
  );
});

export default MicCheck;
