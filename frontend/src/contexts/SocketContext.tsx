import { createContext, useContext, useEffect } from "react";
import { socket } from "../services/socket";

const SocketContext = createContext(socket);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("🟢 Socket conectado:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket desconectado");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
