import styles from "./GamesList.module.css";

import { Card } from "../components/Card";
import { Button } from "../components/Button";

import { CircularProgress } from "@mui/material";
import { useGames } from "../hooks/useGames";

import { useState } from "react";

export function GamesList() {
  const { games, loading } = useGames();
  const [loadingGame, setLoadingGame] = useState(false);

  return (
    <>
      <div className={styles.gamesContainer}>
        <h4>Jogos salvos</h4>
        <div className={styles.gameList}>
          {loading || loadingGame ? (
            <div className={styles.loading}>
              <CircularProgress
                thickness={5}
                sx={{ color: "blue" }}
                style={{ margin: "2rem auto", display: "block" }}
              />
              <p>Loading games...</p>
            </div>
          ) : (
            games.map((item, index) => (
              <Card
                key={index + 1}
                index={index + 1}
                gameId={item.id}
                title={item.title}
                setLoadingGame={setLoadingGame}
              />
            ))
          )}

          <Button size="md" variant="outline">
            {" "}
            + Novo jogo
          </Button>
        </div>
      </div>
    </>
  );
}
