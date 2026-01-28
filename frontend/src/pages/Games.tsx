import styles from "./Games.module.css";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useSession } from "../hooks/useSession";
import { supabase } from "../services/supabase";
import { useEffect, useState } from "react";
import type { Game } from "../types/game";

export function Games() {
  const { session } = useSession();
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    async function fetchGames() {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("user_id", session?.user.id);

      if (error) throw error;

      if (data) {
        setGames(data);
      }
    }

    fetchGames();
  }, []);

  return (
    <>
      <div className={styles.gamesContainer}>
        <h4>Jogos salvos</h4>
        <div className={styles.gameList}>
          {games.map((item, index) => (
            <Card
              key={index + 1}
              index={index + 1}
              gameId={item.id}
              title={item.title}
            />
          ))}

          <Button size="md" variant="outline">
            {" "}
            + Novo jogo
          </Button>
        </div>
      </div>
    </>
  );
}
