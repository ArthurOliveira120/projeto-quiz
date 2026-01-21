import styles from "./Header.module.css";

import { Button } from "./Button";
import { useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { Link, useNavigate } from "react-router-dom";

export function Header() {
  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Conectado:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  return (
    <div className={styles.header}>
      <div className={styles.buttons}>
        <Link to="/" className={styles.link}>Master Quiz</Link>
        <Button variant="secondary" size="md" className={styles.myGamesButton} onClick={() => navigate("/games")}>
          Meus Jogos
        </Button>
      </div>
    </div>
  );
}
