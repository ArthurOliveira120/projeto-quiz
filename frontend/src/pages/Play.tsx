import styles from "./Play.module.css";
import { useEffect, useState } from "react";
import { Option } from "../components/Option";

type OptionProps = {
  id: number;
  question_id: number;
  text: string;
  is_correct: boolean;
};

export function Play() {
  const [options, setOptions] = useState<OptionProps[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  useEffect(() => {
    setOptions([
      { id: 12, question_id: 1, text: "reco", is_correct: false },
      { id: 13, question_id: 1, text: "deco", is_correct: false },
      { id: 14, question_id: 1, text: "hekko", is_correct: true },
      { id: 15, question_id: 1, text: "meco", is_correct: false },
      { id: 16, question_id: 1, text: "teco", is_correct: false },
      { id: 17, question_id: 1, text: "leco", is_correct: false },
      { id: 18, question_id: 1, text: "neco", is_correct: false },
      { id: 19, question_id: 1, text: "ceco", is_correct: false },
    ]);
  }, []);

  function handleSelect(optionId: number) {
    if (selectedOptionId !== null) return;
    setSelectedOptionId(optionId);

    // 🔜 aqui depois entra o socket.emit("submit-answer")
  }

  return (
    <div className={styles.optionsGrid}>
      {options.map((item, index) => (
        <Option
          key={item.id}
          id={item.id}
          text={item.text}
          isCorrect={item.is_correct}
          order={index}
          selected={selectedOptionId === item.id}
          disabled={selectedOptionId !== null}
          onClick={() => handleSelect(item.id)}
        />
      ))}
    </div>
  );
}
