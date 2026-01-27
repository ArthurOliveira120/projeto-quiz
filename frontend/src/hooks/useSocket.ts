import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  if (!socketRef.current) {
    socketRef.current = io(BACKEND_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
  }

  useEffect(() => {
    const socket = socketRef.current!;

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

  return socketRef.current!;
}
