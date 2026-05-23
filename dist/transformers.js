"use strict";

// src/utils/is-plain-object.ts
function isPlainObject(val) {
  return typeof val === "object" && val !== null && !Array.isArray(val) && !(val instanceof Date);
}

// src/utils/path-access.ts
function accessPathInObject(object, path) {
  const pathArray = path.split(".");
  return accessSequenceKeysInObject(object, pathArray);
}
function accessSequenceKeysInObject(object, pathArray) {
  const [firstKey, ...pathRest] = pathArray;
  if (!firstKey) return void 0;
  const result = object[firstKey];
  if (result === void 0) return void 0;
  if (pathRest.length === 0) return result;
  if (!isPlainObject(result))
    return void 0;
  return accessSequenceKeysInObject(result, pathRest);
}

// src/utils/get-typed-entries.ts
function getTypedEntries(obj) {
  return Object.entries(obj);
}

// src/processing/apply-metadata.ts
var BEHAVIOR_DEFINITION = {
  omitted: { hidden: true, required: false, readOnly: false },
  mandatory: { hidden: false, required: true, readOnly: false },
  editable: { hidden: false, required: false, readOnly: false },
  displayed: { hidden: false, required: false, readOnly: true }
};
function applyMetadata(metadata, fieldIdentifier, metadataApply) {
  if (!(fieldIdentifier in metadata.fields)) {
    throw new Error(
      `O identificador ${fieldIdentifier} n\xE3o existe no metadata. Os campos do metadata s\xE3o ${Object.keys(metadata.fields).join(", ")}`
    );
  }
  const fieldMetadata = metadata.fields[fieldIdentifier];
  const { behavior } = metadataApply;
  if (behavior) {
    const behaviorPropsToApply = BEHAVIOR_DEFINITION[behavior];
    for (const [prop, value] of getTypedEntries(behaviorPropsToApply))
      fieldMetadata[prop] = value;
  }
  const entries = getTypedEntries(metadataApply);
  for (const [propKey, value] of entries) {
    const field = fieldMetadata;
    if (propKey === "valueOptions") {
      const current = fieldMetadata.valueOptions;
      const incoming = value;
      current.splice(0, current.length, ...incoming);
    } else if (propKey !== "behavior") {
      field[propKey] = value;
    }
  }
}

// src/utils/values-are-equal.ts
function valuesAreEqual(a, b) {
  if (a === void 0 || b === void 0)
    return a === b;
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((value, index) => valuesAreEqual(value, b[index]));
  if (!Array.isArray(a) && !Array.isArray(b)) return valuesAreEqualHelper(a, b);
  return false;
}
function valuesAreEqualHelper(a, b) {
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();
  if (isPlainObject(a) && isPlainObject(b))
    return JSON.stringify(a) === JSON.stringify(b);
  return a === b;
}

// src/processing/check-match-condition.ts
function checkMatchCondition(instance, matchCondition) {
  return checkMatchConditionHelper(instance, matchCondition, "every");
}
function checkMatchConditionHelper(instance, matchCondition, mode) {
  const evaluationOfAllConditions = Object.entries(matchCondition).map(
    ([key, content]) => {
      if (key === "_not") {
        const notCondition = content;
        return !checkMatchConditionHelper(instance, notCondition, "every");
      }
      if (key === "_some") {
        const someCondition = content;
        return checkMatchConditionHelper(instance, someCondition, "some");
      }
      const path = key;
      const valueExpected = content;
      return checkFieldMatch(instance, path, valueExpected);
    }
  );
  if (mode === "every") {
    return evaluationOfAllConditions.every(Boolean);
  }
  return evaluationOfAllConditions.some(Boolean);
}
function checkFieldMatch(instance, pathToField, valueExpected) {
  const valueGot = accessPathInObject(instance, pathToField);
  if (valueGot === void 0) return false;
  const arrayGot = Array.isArray(valueGot) ? valueGot : [valueGot];
  const arrayExpected = Array.isArray(valueExpected) ? valueExpected : [valueExpected];
  if (arrayExpected.length === 0) return true;
  return arrayGot.some(
    (valueGot2) => arrayExpected.some(
      (valueExpected2) => valuesAreEqual(valueGot2, valueExpected2)
    )
  );
}

// src/processing/transform-metadata.ts
function transformMetadata(metadata, instance, metadataTransform) {
  for (const [fieldIdentifier, fieldTransform] of Object.entries(
    metadataTransform
  ))
    fieldTransformMetadata(
      { metadata, instance, fieldIdentifier },
      fieldTransform
    );
}
function fieldTransformMetadata(context, fieldTransform) {
  if (Array.isArray(fieldTransform)) {
    for (const transform of fieldTransform)
      fieldTransformMetadata(context, transform);
    return;
  }
  const { _if, _match, _apply } = fieldTransform;
  const isMatchTruthy = !_match ? true : checkMatchCondition(context.instance, _match);
  const fieldValue = accessPathInObject(
    context.instance,
    context.fieldIdentifier
  );
  const isIfTruthy = !_if ? true : _if(fieldValue, context.instance);
  if (_apply && isMatchTruthy && isIfTruthy)
    applyMetadata(context.metadata, context.fieldIdentifier, _apply);
}

// src/utils/safe-clone.ts
function safeClone(obj, seen = /* @__PURE__ */ new WeakMap()) {
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") return obj;
  try {
    if (seen.has(obj)) return seen.get(obj);
  } catch {
    return obj;
  }
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);
  if (typeof obj === "function") return obj;
  if (obj instanceof Map) {
    const clone2 = /* @__PURE__ */ new Map();
    seen.set(obj, clone2);
    obj.forEach((v, k) => clone2.set(safeClone(k, seen), safeClone(v, seen)));
    return clone2;
  }
  if (obj instanceof Set) {
    const clone2 = /* @__PURE__ */ new Set();
    seen.set(obj, clone2);
    obj.forEach((v) => clone2.add(safeClone(v, seen)));
    return clone2;
  }
  if (Array.isArray(obj)) {
    const clone2 = [];
    seen.set(obj, clone2);
    obj.forEach((item, i) => {
      clone2[i] = safeClone(item, seen);
    });
    return clone2;
  }
  const clone = Object.create(Object.getPrototypeOf(obj));
  try {
    seen.set(obj, clone);
  } catch {
    return obj;
  }
  for (const key of Reflect.ownKeys(obj)) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
    if ("value" in descriptor) {
      descriptor.value = safeClone(descriptor.value, seen);
    }
    Object.defineProperty(clone, key, descriptor);
  }
  return clone;
}

// src/processing/check-change-condition.ts
function checkSwapCondition(instance, oldInstance, transitions) {
  return Object.entries(transitions).every(([path, { from, to }]) => {
    const oldValue = accessPathInObject(oldInstance, path);
    const value = accessPathInObject(instance, path);
    const pathChanged = checkPathChanged(instance, oldInstance, path);
    if (!pathChanged) return false;
    if (from !== void 0 && !valuesAreEqual(from, oldValue)) return false;
    if (to !== void 0 && !valuesAreEqual(to, value)) return false;
    return true;
  });
}
function checkChangedCondition(instance, oldInstance, paths) {
  return paths.some((path) => checkPathChanged(instance, oldInstance, path));
}
function checkPathChanged(instance, oldInstance, path) {
  const value = accessPathInObject(instance, path);
  const oldValue = accessPathInObject(oldInstance, path);
  return !valuesAreEqual(value, oldValue);
}

// src/processing/transform-draft.ts
function transformDraft(instance, oldInstance, draftTransform) {
  const context = {
    instance,
    oldInstance,
    // Isso é necessário para não fazer comparações com novos valores
    lookupInstance: safeClone(instance),
    fieldIdentifier: ""
  };
  for (const [fieldIdentifier, fieldTransform] of Object.entries(
    draftTransform
  )) {
    context.fieldIdentifier = fieldIdentifier;
    fieldTransformDraft(context, fieldTransform);
  }
}
function fieldTransformDraft(context, fieldTransform) {
  if (Array.isArray(fieldTransform)) {
    for (const transform of fieldTransform)
      fieldTransformDraft(context, transform);
    return;
  }
  const { _if, _changed, _swapped, _match, _setValue } = fieldTransform;
  const isMatchTruthy = !_match ? true : checkMatchCondition(context.lookupInstance, _match);
  const fieldValue = accessPathInObject(
    context.lookupInstance,
    context.fieldIdentifier
  );
  const isIfTruthy = !_if ? true : _if(fieldValue, context.lookupInstance, context.oldInstance);
  const isChangedTruthy = !_changed ? true : checkChangedCondition(
    context.lookupInstance,
    context.oldInstance,
    Array.isArray(_changed) ? _changed : [_changed]
  );
  const isTransitionedTruthy = !_swapped ? true : checkSwapCondition(context.lookupInstance, context.oldInstance, _swapped);
  if (_setValue !== void 0 && isMatchTruthy && isIfTruthy && isChangedTruthy && isTransitionedTruthy) {
    context.instance[context.fieldIdentifier] = _setValue;
  }
}

// src/factory.ts
var factory = (ctx) => ({
  transformMetadata: (metadataTransform) => {
    if (ctx._metadata === void 0)
      throw new Error("_metadata n\xE3o est\xE1 definido");
    if (ctx._object === void 0)
      throw new Error("_object n\xE3o est\xE1 definido");
    transformMetadata(ctx._metadata, ctx._object, metadataTransform);
  },
  transformDraft: (metadataTransform) => {
    if (ctx._oldObject === void 0)
      throw new Error("_oldObject n\xE3o est\xE1 definido");
    if (ctx._object === void 0)
      throw new Error("_object n\xE3o est\xE1 definido");
    transformDraft(ctx._object, ctx._oldObject, metadataTransform);
  }
});
module.exports = factory;
