import { InstanceObject } from "../models/common";
import { Transition } from "../models/draft-transform";
import { accessPathInObject } from "../utils/path-access";
import { valuesAreEqual } from "../utils/values-are-equal";

export function checkTransitionedCondition(
  instance: InstanceObject,
  oldInstance: InstanceObject,
  transitions: Record<string, Transition>,
): boolean {
  return Object.entries(transitions).every(([path, { from, to }]) => {

    // FIXME: Decidir abordagem: Se não tiver o valor, da erro silencioso

    const oldValue = accessPathInObject(oldInstance, path);
    const value = accessPathInObject(instance, path);

    if (from !== undefined && !valuesAreEqual(from, oldValue)) return false;
    if (to !== undefined && !valuesAreEqual(to, value)) return false;

    return true;
  });
}

export function checkChangedCondition(
  instance: InstanceObject,
  oldInstance: InstanceObject,
  paths: string[],
): boolean {
  const oldValues = paths.map((path) => accessPathInObject(oldInstance, path));
  const values = paths.map((path) => accessPathInObject(instance, path));

  return values.some((value, index) => {
    const oldValue = oldValues[index];
    return !valuesAreEqual(value, oldValue);
  });
}
