import { observer } from "mobx-react";
import { useStore } from "../store/StoreContext";
import KeywordButton from "./KeywordButton";
import { useEffect } from "react";
import styled from "styled-components";

const KeywordListWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;
const KeywordList = observer(() => {
  const store = useStore()?.keywordStore;
  if (!store) return;

  function handleKeywordToggle(s: string) {
    store?.toggleKeywords(s);
    console.log(store?.selectedKeywords);
  }

  useEffect(() => {
    for (const keyword of store.keywords) {
      console.log(keyword);
    }
  }, []);

  return (
    <KeywordListWrapper>
      {[...store.keywords].map((keyword) => (
        <KeywordButton
          isSelected={store.selectedKeywords.has(keyword)}
          keyword={keyword}
          key={keyword}
          onClick={handleKeywordToggle}
        ></KeywordButton>
      ))}
    </KeywordListWrapper>
  );
});

export default KeywordList;
