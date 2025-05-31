import { Box, Typography } from "@mui/material";
import { observer } from "mobx-react";
import { useStore } from "../store/StoreContext";
import styled from "styled-components";

const MicVisualizerBox = styled(Box)`
  display: flex;
  gap: 0.5;
  height: 40;
`;

const MicVisualizer = observer(() => {
  const audioAction = useStore()?.qnaStore?.audioAction;
  if (!audioAction) return null;
  //TODO: visualizer 번듯한걸로
  return (
    <MicVisualizerBox>
      <Typography>{audioAction.volume}</Typography>
    </MicVisualizerBox>
  );
});

export default MicVisualizer;
