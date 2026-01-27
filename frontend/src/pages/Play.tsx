import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useSession } from "../hooks/useSession";

export function Play() {
  const { pin } = useParams<{ pin: string }>();
  const socket = useSocket();
  const { session } = useSession();
  const navigate = useNavigate();
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!pin || !session || joinedRef.current) return;

    const username = session.user.user_metadata.username;

    socket.emit("join_game", {
      pin,
      name: username,
    });

    joinedRef.current = true;

    socket.on("join_error", (err) => {
      alert(err.message);
      navigate("/");
    });

    return () => {
      socket.off("join_error");
    };
  }, [pin, session, socket]);

  return (
    <div>
      <h1>Entrou na sala {pin}</h1>
      <p>Aguardando o host iniciar o jogo…</p>
    </div>
  );
}
