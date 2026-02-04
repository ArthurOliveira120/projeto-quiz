import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { supabase } from "./supabase";
import sessionsRoutes from "./routes/sessions";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/sessions", sessionsRoutes);

app.get("/", (_, res) => res.json({ status: "ok" }));

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

type Player = { name: string; socketId: string };
type GameState = { started: boolean; currentQuestion: number };
type Answer = { playerName: string; optionId: number };
type QuestionState = { questionId: number; answers: Answer[] };

const playersByPin: Record<string, Player[]> = {};
const gameStateByPin: Record<string, GameState> = {};
const hostByPin: Record<string, string> = {};
const socketToPlayer: Record<string, { pin: string; name: string }> = {};
const answersByPin: Record<string, QuestionState | null> = {};
const scoreByPin: Record<string, Record<string, number>> = {};

io.on("connection", (socket) => {
  console.log("🟢 Conectado:", socket.id);

  socket.on("host_join", ({ pin }) => {
    if (!pin) {
      console.log("❌ host_join sem pin");
      return;
    }

    socket.join(pin);
    hostByPin[pin] = socket.id;

    console.log(`🎮 Host entrou na sala ${pin}`);

    socket.emit("host_joined", { pin });
  });

  socket.on("player_join", ({ pin, name }) => {
    if (!pin || !name) return;

    socket.join(pin);

    playersByPin[pin] ??= [];

    const exists = playersByPin[pin].find((p) => p.name === name);
    if (exists) exists.socketId = socket.id;
    else playersByPin[pin].push({ name, socketId: socket.id });

    socketToPlayer[socket.id] = { pin, name };

    io.to(pin).emit(
      "players_update",
      playersByPin[pin].map((p) => p.name),
    );
  });

  socket.on("start_game", ({ pin }) => {
    if (hostByPin[pin] !== socket.id) return;

    gameStateByPin[pin] = { started: true, currentQuestion: 0 };
    scoreByPin[pin] = {};

    io.to(pin).emit("game_started");
  });

  socket.on("next_question", async ({ pin }) => {
    const game = gameStateByPin[pin];
    if (!game?.started) return;

    const { data: session } = await supabase
      .from("game_sessions")
      .select("game_id")
      .eq("pin", pin)
      .single();

    if (!session) return;

    const { data: question } = await supabase
      .from("questions")
      .select("*")
      .eq("game_id", session.game_id)
      .order("order")
      .range(game.currentQuestion, game.currentQuestion)
      .single();

    if (!question) {
      io.to(pin).emit("game_finished");
      return;
    }

    const { data: options } = await supabase
      .from("options")
      .select("id, text, order")
      .eq("question_id", question.id)
      .order("order");

    answersByPin[pin] = { questionId: question.id, answers: [] };
    game.currentQuestion++;

    io.to(pin).emit("question", {
      id: question.id,
      text: question.text,
      options,
    });
  });

  socket.on(
    "submit_answer",
    async ({ pin, playerId, playerName, questionId, optionId }) => {
      const state = answersByPin[pin];
      if (!state || state.questionId !== questionId) return;

      if (state.answers.some((a) => a.playerName === playerName)) return;

      state.answers.push({ playerName, optionId });

      await supabase.from("answers").insert({
        pin,
        player_id: playerId,
        player_name: playerName,
        question_id: questionId,
        option_id: optionId,
      });

      io.to(hostByPin[pin]).emit("player_answered", {
        playerName,
        total: state.answers.length,
      });
    },
  );

  socket.on("finish_question", async ({ pin }) => {
    const state = answersByPin[pin];
    if (!state) return;

    const { data: correct } = await supabase
      .from("options")
      .select("id")
      .eq("question_id", state.questionId)
      .eq("is_correct", true)
      .single();

    if (!correct) return;

    for (const answer of state.answers) {
      if (!scoreByPin[pin][answer.playerName]) {
        scoreByPin[pin][answer.playerName] = 0;
      }

      if (answer.optionId === correct.id) {
        scoreByPin[pin][answer.playerName] += 1;
      }
    }

    io.to(pin).emit("question_result", {
      correctOptionId: correct.id,
    });

    answersByPin[pin] = null;
  });

  socket.on("show_ranking", ({ pin }) => {
    if (hostByPin[pin] !== socket.id) return;

    const scores = scoreByPin[pin] || {};

    const ranking = Object.entries(scores)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    io.to(pin).emit("ranking", ranking);
  });

  socket.on("disconnect", () => {
    const player = socketToPlayer[socket.id];
    if (!player) return;

    playersByPin[player.pin] = playersByPin[player.pin]?.filter(
      (p) => p.socketId !== socket.id,
    );

    io.to(player.pin).emit(
      "players_update",
      playersByPin[player.pin]?.map((p) => p.name) ?? [],
    );

    delete socketToPlayer[socket.id];
  });
});

httpServer.listen(3001, () => console.log("🚀 Backend rodando na porta 3001"));
