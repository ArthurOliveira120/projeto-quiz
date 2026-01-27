import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";
import type { GameState, Question } from "../types/game";

export function useGameSession(pin: string, playerName: string) {
  const socket = useSocket();

  const [players, setPlayers] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    started: false,
    finished: false,
  });

  useEffect(() => {
    if (!pin || !playerName) return;

    socket.emit("join_game", { pin, name: playerName });

    return () => {
      socket.off("players_update");
      socket.off("game_started");
      socket.off("question");
      socket.off("game_finished");
    };
  }, [pin, playerName, socket]);

  useEffect(() => {
    socket.on("players_update", (players: string[]) => {
      setPlayers(players);
    });

    return () => {
      socket.off("players_update");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("game_started", () => {
      setGameState({
        started: true,
        finished: false,
      });
    });

    return () => {
      socket.off("game_started");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("question", (question: Question) => {
      setGameState({
        started: true,
        finished: false,
        currentQuestion: question,
      });
    });

    return () => {
      socket.off("question");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("game_finished", () => {
      setGameState({
        started: true,
        finished: true,
      });
    });

    return () => {
      socket.off("game_finished");
    };
  }, [socket]);

  function startGame() {
    socket.emit("start_game", { pin });
  }

  function nextQuestion() {
    socket.emit("next_question", { pin });
  }

  return {
    players,
    gameState,
    startGame,
    nextQuestion,
  };
}
