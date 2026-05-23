import { InstanceObject } from "../models/common";
import { Swap } from "../models/draft-transform";
import { accessPathInObject } from "../utils/path-access";
import { valuesAreEqual } from "../utils/values-are-equal";

export function checkSwapCondition(
  instance: InstanceObject,
  oldInstance: InstanceObject,
  transitions: Record<string, Swap>,
): boolean {
  return Object.entries(transitions).every(([path, { from, to }]) => {
    // FIXME: Decidir abordagem: Se não tiver o valor, da erro silencioso

    const oldValue = accessPathInObject(oldInstance, path);
    const value = accessPathInObject(instance, path);

    const pathChanged = checkPathChanged(instance, oldInstance, path);

    if (!pathChanged) return false;

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
  return paths.some((path) => checkPathChanged(instance, oldInstance, path));
}

export function checkPathChanged(
  instance: InstanceObject,
  oldInstance: InstanceObject,
  path: string,
): boolean {
  const value = accessPathInObject(instance, path);
  const oldValue = accessPathInObject(oldInstance, path);
  return !valuesAreEqual(value, oldValue);
}
