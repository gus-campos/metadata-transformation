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
  if (isPlainObject(got) && isPlainObject(expected)) {
    
    // TODO: Decidir se deve forçar comparação de class id com class.id tbm 
    // return isMatch(
    //   { ...got, _class: { _id: got._classId } },
    //   { ...expected, _class: { _id: expected._classId } },
    // );
    return isMatch(got, expected);
  }

  // Não faz diferenciação entre null e undefined, para facilitar declaração
  // TODO: Verificar se pode ser importante checar null e undefined em específico
  return (got ?? null) === (expected ?? null);
}
