import { Chip } from "@mui/material";
import styled from "styled-components";

const StyledButton = styled(Chip)`
  border: 1px solid #000000;
  width: 10vw;
`;

interface keywordButtonProps {
  keyword: string;
  isSelected: boolean;
  onClick: (s: string) => void;
}
const KeywordButton: React.FC<keywordButtonProps> = ({
  keyword,
  isSelected,
  onClick,
}: keywordButtonProps) => {
  return (
    <StyledButton
      onClick={() => {
        onClick(keyword);
      }}
      label={keyword}
      color={isSelected ? "primary" : "default"}
    ></StyledButton>
  );
};

export default KeywordButton;
