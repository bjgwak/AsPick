import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";
import styled from "styled-components";
import KeywordList from "../components/KeywordList";
import KeywordSearchBar from "../components/KeywordSearchBar";
import { useStore } from "../store/StoreContext";

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
  const navigate = useNavigate();
  const store = useStore()?.keywordStore;
  if (!store) return;

  return (
    <SelectContainer>
      <KeywordSearchBar></KeywordSearchBar>
      <KeywordList></KeywordList>
      <ButtonContainer>
        <Button
          onClick={() => {
            store.clearKeywords();
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
    </SelectContainer>
  );
});

export default SelectPage;
