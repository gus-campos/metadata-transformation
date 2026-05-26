import { InstanceObject, Value } from "../models/pure/common";
import { isPlainObject } from "./is-plain-object";

export function valuesAreEqual(
  a: Value | InstanceObject | undefined,
  b: Value | InstanceObject | undefined,
): boolean {
  if (a === undefined || b === undefined) return a === b;

  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();

  if (isPlainObject(a) && isPlainObject(b))
    return JSON.stringify(a) === JSON.stringify(b);

  return a === b;
}

// quando o objeto é obtido?