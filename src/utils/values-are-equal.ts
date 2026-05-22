import { Value } from "../models/common";
import { isPlainObject } from "./is-plain-object";

export function valuesAreEqual(
  a: Value | Value[] | undefined,
  b: Value | Value[] | undefined,
): boolean {

  if (a === undefined || b === undefined) 
    return a === b;

  if (Array.isArray(a) && Array.isArray(b))
    return (
      a.length === b.length &&
      a.every((value, index) => valuesAreEqual(value, b[index]!))
    );

  if (!Array.isArray(a) && !Array.isArray(b)) return valuesAreEqualHelper(a, b);

  return false;
}

function valuesAreEqualHelper(a: Value, b: Value): boolean {
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();

  if (isPlainObject(a) && isPlainObject(b))
    return JSON.stringify(a) === JSON.stringify(b);

  return a === b;
}
