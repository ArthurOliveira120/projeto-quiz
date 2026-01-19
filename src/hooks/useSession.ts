import { useEffect, useState } from "react";

type Session = {
  token: string;
  user: string;
};

export function useSession() {
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

  return { session, setSession };
}