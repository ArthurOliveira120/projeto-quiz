import styles from "./Option.module.css";

type OptionProps = {
  id: number;
  text: string;
  order: number;
  isCorrect: boolean;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
};

export function Option({
  text,
  order,
  isCorrect,
  selected,
  disabled,
  onClick,
}: OptionProps) {
  const figures = ["🟥", "🔼", "🟢", "🔶", "⏹️", "█", "﴿", "ﷴ"];

  const classNames = [
    styles.option,
    selected && (isCorrect ? styles.correct : styles.wrong),
    disabled && !selected && styles.disabled,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classNames} onClick={onClick} disabled={disabled}>
      <span className={styles.icon}>{figures[order]}</span>
      <span className={styles.text}>{text}</span>
    </button>
  );
}
