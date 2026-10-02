import React, { createContext, useContext, useLayoutEffect, useState } from 'react';
import Navbar from './Navbar.jsx';

const SessionNavigationContext = createContext(null);

export function SessionNavigationProvider({ children }) {
  const [hidden, setHidden] = useState(false);
  return <SessionNavigationContext.Provider value={setHidden}>
    <div hidden={hidden} style={{ display: hidden ? 'none' : 'contents' }}><Navbar /></div>
    {children}
  </SessionNavigationContext.Provider>;
}

export function useSessionNavigation(active) {
  const setHidden = useContext(SessionNavigationContext);
  useLayoutEffect(() => {
    if (!setHidden) return;
    setHidden(Boolean(active));
    return () => setHidden(false);
  }, [active, setHidden]);
}
