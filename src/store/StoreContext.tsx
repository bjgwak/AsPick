import { createContext, useContext } from "react";
import GlobalStore from "./GlobalStore";

export const StoreContext = createContext<GlobalStore | null>(null);

const globalStoreInstance = new GlobalStore();

export const StoreProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <StoreContext.Provider value={globalStoreInstance}>
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  return useContext(StoreContext);
}
