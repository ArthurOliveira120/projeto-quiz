import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SessionProvider } from "./contexts/SessionContext";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";
import { GameProvider } from "./contexts/GameContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <GameProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </GameProvider>
      </SessionProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
