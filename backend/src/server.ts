import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { supabase } from "./supabase";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

/* =========================
   TIPOS
========================= */
type Player = {
  name: string;
  socketId: string;
};

type GameState = {
  started: boolean;
  currentQuestion: number;
};

/* =========================
   ESTADO EM MEMÓRIA
========================= */
const playersByPin: Record<string, Player[]> = {};
const gameStateByPin: Record<string, GameState> = {};
const hostByPin: Record<string, string> = {}; // socketId do host
const socketToPlayer: Record<string, { pin: string; name: string }> = {};

/* =========================
   SOCKET
========================= */
io.on("connection", (socket) => {
  console.log("🟢 Conectado:", socket.id);

  /* ===== HOST JOIN ===== */
  socket.on("host_join", ({ pin }) => {
    socket.join(pin);
    hostByPin[pin] = socket.id;

    console.log(`🎮 Host conectado na sala ${pin}`);
  });

  /* ===== PLAYER JOIN ===== */
  socket.on("player_join", async ({ pin, name }) => {
    console.log("📥 player_join recebido", pin, name);
    if (!pin || !name) return;

    socket.join(pin);

    if (!playersByPin[pin]) {
      playersByPin[pin] = [];
    }

    const existing = playersByPin[pin].find((p) => p.name === name);

    if (existing) {
      existing.socketId = socket.id;
    } else {
      playersByPin[pin].push({ name, socketId: socket.id });
    }

    socketToPlayer[socket.id] = { pin, name };

    console.log(`👤 ${name} entrou na sala ${pin}`);

    io.to(pin).emit(
      "players_update",
      playersByPin[pin].map((p) => p.name),
    );
  });

  /* ===== START GAME ===== */
  socket.on("start_game", ({ pin }) => {
    if (hostByPin[pin] !== socket.id) {
      console.log("⛔ Tentativa de start sem ser host");
      return;
    }

    gameStateByPin[pin] = {
      started: true,
      currentQuestion: 0,
    };

    console.log(`🔥 Jogo ${pin} iniciado`);

    io.to(pin).emit("game_started");
  });

  /* ===== NEXT QUESTION ===== */

  socket.on("next_question", async ({ pin }) => {
    const gameState = gameStateByPin[pin];

    if (!gameState || !gameState.started) {
      console.log("⛔ Jogo não iniciado");
      return;
    }

    console.log(
      `➡️ Buscando pergunta ${gameState.currentQuestion} da sala ${pin}`,
    );

    // buscar sessão
    const { data: session, error: sessionError } = await supabase
      .from("game_sessions")
      .select("game_id")
      .eq("pin", pin)
      .single();

    if (sessionError || !session) {
      console.log("❌ Sessão inválida");
      return;
    }

    // buscar pergunta
    const { data: question } = await supabase
      .from("questions")
      .select("*")
      .eq("game_id", session.game_id)
      .order("order", { ascending: true })
      .range(gameState.currentQuestion, gameState.currentQuestion)
      .single();

    if (!question) {
      console.log("🏁 Jogo finalizado");
      io.to(pin).emit("game_finished");
      return;
    }

    // buscar opções
    const { data: options } = await supabase
      .from("options")
      .select("id, text, order")
      .eq("question_id", question.id)
      .order("order", { ascending: true });

    gameState.currentQuestion += 1;

    io.to(pin).emit("question", {
      id: question.id,
      text: question.text,
      options,
    });

    console.log(`📨 Pergunta enviada: ${question.text}`);
  });

  /* ===== SUBMIT ANSWER ===== */
  socket.on(
    "submit_answer",
    async ({ pin, questionId, optionId, playerName }) => {
      console.log(`📝 ${playerName} respondeu a pergunta ${questionId}`);
    },
  );

  /* ===== DISCONNECT ===== */
  socket.on("disconnect", () => {
    const player = socketToPlayer[socket.id];
    if (!player) return;

    const { pin, name } = player;

    playersByPin[pin] = playersByPin[pin]?.filter(
      (p) => p.socketId !== socket.id,
    );

    io.to(pin).emit(
      "players_update",
      playersByPin[pin]?.map((p) => p.name) ?? [],
    );

    delete socketToPlayer[socket.id];

    console.log(`🔴 ${name} saiu da sala ${pin}`);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
