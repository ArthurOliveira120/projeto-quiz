export type Game = {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    is_public: boolean;
}

export type Option = {
  id: string;
  text: string;
  order: number;
};

export type Question = {
  id: string;
  text: string;
  options: Option[];
};

export type GameState = {
  started: boolean;
  finished: boolean;
  currentQuestion?: Question;
};