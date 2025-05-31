import { CircularProgress, Typography, Box } from "@mui/material";
import { styled } from "styled-components";

const PrepWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  position: relative;
  align-items: center;
`;

const CenterText = styled(Typography)`
  position: absolute;
  text-align: center;
`;

const PrepOverlay: React.FC = () => (
  <PrepWrapper>
    <CircularProgress size={90} thickness={4} />
    <CenterText variant="h6">준비!</CenterText>
  </PrepWrapper>
);

export default PrepOverlay;
