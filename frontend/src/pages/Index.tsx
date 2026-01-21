import { Button } from "../components/Button";
import { SessionNameInput } from "../components/SessionNameInput";

import styles from "./Index.module.css";
import { useSession } from "../contexts/SessionContext";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export function Index() {
  const { session } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  return (
    <>
      <div className={styles.container}>
        <h1>Quiz</h1>

        <SessionNameInput />

        <div className={styles.enterPin}>
          <input
            type="text"
            className={styles.inputRoomPin}
            placeholder="PIN da sala"
            ref={inputRef}
          />
          <Button
            className={styles.enterRoomButton}
            onClick={() => {
              navigate(`/play/${inputRef.current?.value}`);
            }}
          >
            Entrar na sala
          </Button>
        </div>

        <br></br>
        <div>
          <strong>Session Name:</strong> {session.id}
        </div>
      </div>
    </>
  );
}
