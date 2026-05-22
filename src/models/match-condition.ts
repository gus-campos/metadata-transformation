import { Value } from "./common";


export type MatchCondition = {
  _not?: MatchCondition;
  _some?: MatchCondition;
  [identifier: string]:
  | Value
  // Implicitamente é uma operação de "includes"
  | Value[]
  // TODO: Validar manualmente que não será passado o último caso
  // TODO: Explicar isso aqui em comentário
  | undefined
  | MatchCondition;
};

export const MATCH_CONDITION_KEYS = ["_not", "_some"] as const;

// Quando for campo de array, o que fazer? 
// Tratar a passagem de um Value, como se fosse um includes?