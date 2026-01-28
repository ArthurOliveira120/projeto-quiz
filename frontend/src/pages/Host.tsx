import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useSocket } from "../hooks/useSocket";
import { useSession } from "../hooks/useSession";

import styles from "./Host.module.css";
import { Button } from "../components/Button";

import type { Question } from "../types/game";

export function Host() {
  const { pin } = useParams<{ pin: string }>();
  const socket = useSocket();
  const { session } = useSession();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);

  console.log("PIN:", pin);
  console.log("socket connected?", socket.connected);

  useEffect(() => {
    if (!pin || !session) return;

    const username =
      session.user.user_metadata?.username ||
      session.user.email?.split("@")[0] ||
      "Jogador";

    socket.emit("host_join", { pin });

    socket.on("players_update", setPlayers);

    socket.on("game_started", () => {
      setGameStarted(true);
      socket.emit("next_question", { pin });
    });

    socket.on("question", (question: Question) => {
      setQuestion(question);
    });

    socket.on("join_error", (err) => {
      alert(err.message);
      navigate("/");
    });

    return () => {
      socket.off("players_update");
      socket.off("game_started");
      socket.off("question");
      socket.off("join_error");
    };
  }, [pin, session, socket]);

  useEffect(() => {
    socket.on("player_answered", ({ playerName }) => {
      console.log(`${playerName} respondeu`);
    });

    return () => {
      socket.off("player_answered");
    };
  }, [socket]);

  function handleStartGame() {
    console.log("função do carai sendo chamada");

    if (!pin) {
      console.log("pin inválido");
      return;
    }

    if (!socket.connected) {
      console.log("Socket não conectado");
      return;
    }

    console.log("emitindo o start game");
    socket.emit("start_game", { pin });
  }

  function handleNextQuestion() {
    socket.emit("next_question", { pin });
  }

  return (
    <div className={styles.container}>
      <h1>Host — Sala {pin}</h1>

      <div className={styles.players}>
        <h2>Jogadores ({players.length})</h2>

        {players.length === 0 && <p>Nenhum jogador conectado</p>}

        <ul>
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
      </div>

      <div className={styles.controls}>
        {!gameStarted ? (
          <Button
            variant="primary"
            size="lg"
            disabled={players.length === 0}
            onClick={handleStartGame}
          >
            Iniciar Jogo
          </Button>
        ) : (
          <Button variant="secondary" size="lg" onClick={handleNextQuestion}>
            Próxima Pergunta
          </Button>
        )}
      </div>

      {question && (
        <div className={styles.question}>
          <h2>{question.text}</h2>

          <div className={styles.options}>
            {question.options.map((opt) => (
              <div key={opt.id} className={styles.option}>
                {opt.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
