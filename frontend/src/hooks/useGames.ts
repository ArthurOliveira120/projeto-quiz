import { useContext } from "react";
import { GameContext } from "../contexts/GameContext";

export function useGames() {
    const context = useContext(GameContext);

    if (!context) {
        throw new Error("useGames deve ser usado dentro de um <GameProvider>.");
    }

    return context;
}