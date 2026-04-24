"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type RightRailContextValue = {
  topContent: ReactNode;
  setTopContent: (content: ReactNode) => void;
};

const RightRailContext = createContext<RightRailContextValue>({
  topContent: null,
  setTopContent: () => {},
});

export function RightRailProvider({ children }: { children: ReactNode }) {
  const [topContent, setTopContentState] = useState<ReactNode>(null);
  const setTopContent = useCallback((content: ReactNode) => {
    setTopContentState(content);
  }, []);

  return (
    <RightRailContext.Provider value={{ topContent, setTopContent }}>
      {children}
    </RightRailContext.Provider>
  );
}

export function useRightRailTop() {
  return useContext(RightRailContext);
}
