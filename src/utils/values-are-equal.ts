import { InstanceObject, Value } from "../models/pure/common";
import { isPlainObject } from "./is-plain-object";
import isMatch from "lodash/isMatch";

export function valuesAreEqual(
  got: Value | InstanceObject | undefined,
  expected: Value | InstanceObject | undefined,
): boolean {
  if (got === undefined || expected === undefined) return got === expected;

  if (got instanceof Date && expected instanceof Date)
    return got.getTime() === expected.getTime();

  // Compara objetos profundamente, mas só procura no got oq vem no expected
  if (isPlainObject(got) && isPlainObject(expected))
    return isMatch(got, expected);

  return got === expected;
}

// quando o objeto é obtido?
