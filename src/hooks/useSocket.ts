import { useEffect } from "react";
import { socket } from "../services/socket";

export function useSocket() {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  return socket;
}
