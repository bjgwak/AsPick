import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useStore } from "../store/StoreContext";
import KeywordButton from "../components/KeywordButton";

const SelectPage = observer(() => {
  const store = useStore();
  if (!store) return;

  useEffect(() => {
    for (const keyword of store.keywords) {
      console.log(keyword);
    }
  }, []);

  function handleKeywordToggle(s: string) {
    store?.toggleKeywords(s);
    console.log(store?.selectedKeywords);
  }

  return (
    <>
      {[...store.keywords].map((keyword) => (
        <KeywordButton
          isSelected={store.selectedKeywords.has(keyword)}
          keyword={keyword}
          key={keyword}
          onClick={handleKeywordToggle}
        ></KeywordButton>
      ))}
    </>
  );
});

export default SelectPage;
