import { Box, Button, styled, TextField, Typography } from "@mui/material";
import { observer } from "mobx-react";
import { useMemo, useState } from "react";
import { useStore } from "../store/StoreContext";

const KeywordText = styled(Typography)`
  &:hover {
    background-color: gray;
  }
`;

const KeywordSearchBar = observer(() => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const store = useStore()?.keywordStore;
  if (!store) return;

  const searchedKeywords = useMemo(() => {
    return [...store.keywords].filter((val) => val.startsWith(searchTerm));
  }, [searchTerm, store.keywords]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleAdd = () => {
    store.addKeywords(searchTerm);
    setSearchTerm("");
  };

  const handleToggle = (keyword: string) => {
    store.toggleKeywords(keyword);
    setSearchTerm("");
  };

  return (
    <>
      <TextField value={searchTerm} onChange={handleSearchChange}></TextField>
      {searchTerm && searchedKeywords.length > 0 && (
        <Box
          sx={{
            marginTop: 1,
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: 1,
          }}
        >
          {searchedKeywords.map((val) => (
            <KeywordText
              key={val}
              sx={{ padding: "4px 8px" }}
              onClick={() => {
                handleToggle(val);
              }}
            >
              {val}
            </KeywordText>
          ))}
        </Box>
      )}
      {searchTerm && searchedKeywords.length === 0 && (
        <Box sx={{ marginTop: 1, padding: 1 }}>
          <Typography color="textSecondary">
            일치하는 키워드가 없습니다. 추가할까요?
          </Typography>
          <Button onClick={handleAdd}>추가</Button>
        </Box>
      )}
    </>
  );
});

export default KeywordSearchBar;
