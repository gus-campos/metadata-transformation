import { Value } from "./common";


/*
* Match poderia permitir passar apenas o valor esperado 
* para o pŕoprio campo, invés de um objeto. Ainda, poderia
* aceitar isso recursivamente, como:
* 
* {
*   _match: {
*     _not: "valor1"
*   }
* }
*
* {
*   _match: "valor1"
* }
* 
* Será que é exagero? Será que é útil?
*/

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