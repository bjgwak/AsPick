import { createContext, useContext } from "react";
import RootStore from "./RootStore";

export const StoreContext = createContext<RootStore | null>(null);

const rootStoreInstance = new RootStore();

export const StoreProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <StoreContext.Provider value={rootStoreInstance}>
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  return useContext(StoreContext);
}
