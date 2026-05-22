import { InstanceObject } from "../models/common";
import { DraftTransform, FieldDraftTransform } from "../models/draft-transform";
import {
  checkChangedCondition,
  checkTransitionedCondition,
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
    lookupInstance: structuredClone(instance),
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

  const { _if, _changed, _transitioned, _match, _setValue } = fieldTransform;

  // Verificar mesmo que não tenha condição para aplicar
  // pra manter consistência no fluxo de erros e execuções

  const isMatchTruthy = !_match
    ? true
    : checkMatchCondition(context.lookupInstance, _match);

  const isIfTruthy = !_if ? true : _if(context.lookupInstance, context.oldInstance);

  const isChangedTruthy = !_changed
    ? true
    : checkChangedCondition(context.lookupInstance, context.oldInstance, _changed);

  const isTransitionedTruthy = !_transitioned
    ? true
    : checkTransitionedCondition(
        context.lookupInstance,
        context.oldInstance,
        _transitioned,
      );

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
