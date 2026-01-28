import styles from "./Play.module.css";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useSocket } from "../hooks/useSocket";

import type { Question } from "../types/game";

type QuestionResult = {
  correctOptionId: string;
  results: {
    playerName: string;
    correct: boolean;
  }[];
};

export function Play() {
  const { pin } = useParams<{ pin: string }>();
  const socket = useSocket();
  const navigate = useNavigate();

  const joinedRef = useRef(false);

  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<QuestionResult | null>(null);
  const [ranking, setRanking] = useState<{ name: string; score: number }[]>([]);

  const playerName = localStorage.getItem("player_name") || "Jogador";

  useEffect(() => {
    if (!pin || !socket.connected || joinedRef.current) return;

    console.log("🚀 Enviando player_join", playerName);

    socket.emit("player_join", {
      pin,
      name: playerName,
    });

    joinedRef.current = true;

    socket.on("join_error", (err) => {
      alert(err.message);
      navigate("/");
    });

    return () => {
      socket.off("join_error");
    };
  }, [pin, socket.connected]);

  useEffect(() => {
    socket.on("question", (data: Question) => {
      setQuestion(data);
      setSelectedOption(null);
      setResult(null);
    });

    return () => {
      socket.off("question");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("question_result", (data: QuestionResult) => {
      setResult(data);
    });

    return () => {
      socket.off("question_result");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("question_result", ({ correctOptionId }) => {
      setQuestion((prev) =>
        prev
          ? {
              ...prev,
              options: prev.options.map((opt) => ({
                ...opt,
                isCorrect: opt.id === correctOptionId,
              })),
            }
          : prev,
      );
    });

    return () => {
      socket.off("question_result");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("ranking", setRanking);

    return () => {
      socket.off("ranking");
    };
  }, [socket]);

  function handleAnswer(optionId: string) {
    if (!question || !pin || selectedOption) return;

    setSelectedOption(optionId);

    socket.emit("submit_answer", {
      pin,
      questionId: question.id,
      optionId,
      playerName,
    });
  }

  //  if (ranking.length > 0) {
  //    return (
  //      <div className={styles.container}>
  //        <h1 className={styles.rankingTitle}>🏆 Ranking Final</h1>
  //
  //        <ul className={styles.ranking}>
  //          {ranking.map((p, i) => (
  //            <li
  //              key={i}
  //              className={`${styles.rankingItem} ${
  //                i === 0
  //                  ? styles.first
  //                  : i === 1
  //                    ? styles.second
  //                    : i === 2
  //                      ? styles.third
  //                      : ""
  //              }`}
  //            >
  //              <span className={styles.position}>{i + 1}º</span>
  //              <span className={styles.playerName}>{p.name}</span>
  //              <span className={styles.score}>{p.score} pts</span>
  //            </li>
  //          ))}
  //        </ul>
  //      </div>
  //    );
  //  }

  return (
    <div className={styles.container}>
      {ranking.length > 0 ? (
        <div className={styles.container}>
          <h1 className={styles.rankingTitle}>🏆 Ranking Final</h1>

          <ul className={styles.ranking}>
            {ranking.map((p, i) => (
              <li
                key={i}
                className={`${styles.rankingItem} ${
                  i === 0
                    ? styles.first
                    : i === 1
                      ? styles.second
                      : i === 2
                        ? styles.third
                        : ""
                }`}
              >
                <span className={styles.position}>{i + 1}º</span>
                <span className={styles.playerName}>{p.name}</span>
                <span className={styles.score}>{p.score} pts</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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

          {result ? (
            <div className={styles.result}>
              {result.correctOptionId === selectedOption ? (
                <p className={styles.correct}>✅ Você acertou!</p>
              ) : (
                <p className={styles.wrong}>❌ Você errou</p>
              )}
            </div>
          ) : (
            <div className={styles.options}>
              {question.options.map((opt) => {
                const isSelected = selectedOption === opt.id;

                return (
                  <button
                    key={opt.id}
                    className={`${styles.opt} ${
                      isSelected ? styles.selected : ""
                    }`}
                    onClick={() => handleAnswer(opt.id)}
                    disabled={!!selectedOption}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
