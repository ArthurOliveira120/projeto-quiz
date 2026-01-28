import { useEffect } from "react";
import { socket } from "../services/socket";

export function useSocket() {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      // NÃO desconectar aqui
      // socket deve viver enquanto a app vive
    };
  }, []);

  return socket;
}
