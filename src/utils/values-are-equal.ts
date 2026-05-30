import { InstanceObject, Value } from "../models/pure/common";
import { isPlainObject } from "./is-plain-object";
import isMatch from "lodash/isMatch";

export function valuesAreEqual(
  got: Value | InstanceObject | undefined,
  expected: Value | InstanceObject | undefined,
): boolean {

  if (got instanceof Date && expected instanceof Date)
    return got.getTime() === expected.getTime();

  // Compara objetos profundamente, mas só procura no got oq vem no expected
  if (isPlainObject(got) && isPlainObject(expected))
    return isMatch(got, expected);

  // Não faz diferenciação entre null e undefines, para facilitar declaração
  // TODO: Verificar se pode ser importante checar um específico 
  return (got ?? null) === (expected ?? null);
}