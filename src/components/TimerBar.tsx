import { LinearProgress, Typography, Box } from "@mui/material";
import { styled } from "styled-components";

interface Props {
  percent: number;
  label: string;
}

const BarContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  margin: "0 auto 16px";
  align-items: center;
  width: 50vw;
`;

const Bar = styled(LinearProgress)`
  flex: 1;
`;

const TimerBar: React.FC<Props> = ({ percent, label }) => (
  <BarContainer>
    <Bar variant="determinate" value={percent} />
    <Typography variant="body2">{label}</Typography>
  </BarContainer>
);

export default TimerBar;
