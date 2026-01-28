import styles from "./Play.module.css";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useSession } from "../hooks/useSession";
import type { Question } from "../types/game";

export function Play() {
  const { pin } = useParams<{ pin: string }>();
  const socket = useSocket();
  const { session } = useSession();
  const navigate = useNavigate();
  const joinedRef = useRef(false);

  const [question, setQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (!pin || !session || !socket.connected || joinedRef.current) return;

    const name =
      session.user.user_metadata?.username ||
      session.user.email?.split("@")[0] ||
      "Jogador";

    socket.emit("player_join", {
      pin,
      name,
    });

    joinedRef.current = true;

    socket.on("join_error", (err) => {
      alert(err.message);
      navigate("/");
    });

    return () => {
      socket.off("join_error");
    };
  }, [pin, session, socket.connected]);

  useEffect(() => {
    socket.on("question", (data: Question) => {
      setQuestion(data);
    });

    return () => {
      socket.off("question");
    };
  }, [socket]);

  function handleAnswer(optionId: string) {
    if (!question || !pin) return;

    socket.emit("submit_answer", {
      pin,
      questionId: question.id,
      optionId,
      playerName: session?.user.user_metadata.username,
    });
  }

  return (
    <div className={styles.container}>
      {!question ? (
        <div className={styles.waiting}>
          <h1>Sala {pin}</h1>
          <p>Aguardando o host iniciar o jogo…</p>
        </div>
      ) : (
        <>
          <div className={styles.question}>
            <h1>{question.text}</h1>
          </div>

          <div className={styles.options}>
            {question.options.map((opt) => (
              <button
                key={opt.id}
                className={styles.opt}
                onClick={() => handleAnswer(opt.id)}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
