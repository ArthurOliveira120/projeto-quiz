import { useState } from "react";
import { useSession } from "../contexts/SessionContext";

import styles from "./SessionNameInput.module.css";
import { Button } from "./Button";

export function SessionNameInput() {
  const { session, setName } = useSession();
  const [value, setValue] = useState(session.name ?? "");

  function handleSave() {
    if (!value.trim()) return;
    setName(value.trim());
  }

  return (
    <div className={styles.inputContainer}>
      <input
        type="text"
        placeholder="Seu nome"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={styles.inputName}
      />
      <Button size="sm" onClick={handleSave}>
        Salvar nome
      </Button>

      {session.name && (
        <p>
          Nome atual: <strong>{session.name}</strong>
        </p>
      )}
    </div>
  );
}
