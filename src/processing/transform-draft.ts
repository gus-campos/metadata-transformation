import { InstanceObject } from "../models/common";
import { DraftTransform, FieldDraftTransform } from "../models/draft-transform";
import { accessPathInObject } from "../utils/path-access";
import { safeClone } from "../utils/safe-clone";
import {
  checkChangedCondition,
  checkSwapCondition,
} from "./check-change-condition";
import { checkMatchCondition } from "./check-match-condition";

type FieldDraftContext = {
  instance: InstanceObject;
  oldInstance: InstanceObject;
  lookupInstance: InstanceObject;
  fieldIdentifier: string;
};

export function transformDraft(
  instance: InstanceObject,
  oldInstance: InstanceObject,
  draftTransform: DraftTransform,
) {
  // Para campo e sua transformação

  const context = {
    instance,
    oldInstance,
    // Isso é necessário para não fazer comparações com novos valores
    lookupInstance: safeClone(instance),
    fieldIdentifier: "",
  };

  for (const [fieldIdentifier, fieldTransform] of Object.entries(
    draftTransform,
  )) {
    context.fieldIdentifier = fieldIdentifier;
    fieldTransformDraft(context, fieldTransform);
  }
}

export function fieldTransformDraft(
  context: FieldDraftContext,
  fieldTransform: FieldDraftTransform | FieldDraftTransform[],
) {
  // Array: chamar recursivamente para os itens

  if (Array.isArray(fieldTransform)) {
    for (const transform of fieldTransform)
      fieldTransformDraft(context, transform);

    return;
  }

  const { _if, _changed, _swapped, _match, _setValue } = fieldTransform;

  // Verificar mesmo que não tenha condição para aplicar
  // pra manter consistência no fluxo de erros e execuções

  const isMatchTruthy = !_match
    ? true
    : checkMatchCondition(context.lookupInstance, _match);

  const fieldValue = accessPathInObject(
    context.lookupInstance,
    context.fieldIdentifier,
  );

  const isIfTruthy = !_if
    ? true
    : _if(fieldValue, context.lookupInstance, context.oldInstance);

  // TODO: Inserir testes para valor único
  const isChangedTruthy = !_changed
    ? true
    : checkChangedCondition(
        context.lookupInstance,
        context.oldInstance,
        Array.isArray(_changed) ? _changed : [_changed],
      );

  const isTransitionedTruthy = !_swapped
    ? true
    : checkSwapCondition(context.lookupInstance, context.oldInstance, _swapped);

  if (
    _setValue !== undefined &&
    isMatchTruthy &&
    isIfTruthy &&
    isChangedTruthy &&
    isTransitionedTruthy
  ) {
    context.instance[context.fieldIdentifier] = _setValue;
  }
}
