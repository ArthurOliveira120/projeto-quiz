import { createContext, useContext, useEffect, useState } from "react";

type Session = {
  token: string;
  user: string;
};

type SessionContextType = {
  session: Session | null;
  login: (data: Session) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const stored = localStorage.getItem("session");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (session)
      localStorage.setItem("session", JSON.stringify(session));
    else
      localStorage.removeItem("session");
  }, [session]);

  function login(data: Session) {
    setSession(data);
  }

  function logout() {
    setSession(null);
  }

  return (
    <SessionContext.Provider value={{ session, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
