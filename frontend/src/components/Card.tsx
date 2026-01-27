import styles from "./Card.module.css";

import { Button } from "./Button";
import { useNavigate } from "react-router-dom";

type cardProps = {
  index: number;
  gameId: string;
  title: string;
};

export function Card({ index, gameId, title }: cardProps) {
  const navigate = useNavigate();

  async function handleStartGame() {
    const res = await fetch(
      "https://projeto-quiz-backend.onrender.com/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId,
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao iniciar jogo");
      return;
    }

    navigate(`/host/${data.pin}`);
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardInfos}>
        <h4>{index}</h4>
        <h4>{title}</h4>
      </div>
      <div className={styles.cardButtons}>
        <Button size="sm" onClick={handleStartGame}>
          Jogar
        </Button>
        <Button size="sm">Editar</Button>
        <Button size="sm">Excluir</Button>
      </div>
    </div>
  );
}
