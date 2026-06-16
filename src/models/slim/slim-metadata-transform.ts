import {
  FieldMetadataTransform,
  FieldsApply,
  FieldsMetadataTransform,
  RuleMetadataTransform,
  RulesMetadataTransform,
} from "../pure/metadata-transform";
import {
  ApplyTermProps,
  SlimApply,
  SlimApplyObject,
  toApply,
} from "./slim-apply";
import {
  SlimImplicitMatchCondition,
  SlimMatchCondition,
  toMatchCondition,
} from "./slim-match";

type SlimFieldMetadataTransform = FieldMetadataTransform &
  SlimImplicitMatchCondition &
  SlimApply;

export type SlimMetadataTransform = {
  [fieldIdentifier: string]:
    | SlimFieldMetadataTransform
    | SlimFieldMetadataTransform[];
};

// ======================== RulesMetadataTransform ========================

export type SlimFieldsApply = {
  _apply: {
    [fieldIdentifier: string]:
      | ApplyTermProps["_apply"]
      | SlimApplyObject["_apply"];
  };
};

export type SlimRuleMetadataTransform = RuleMetadataTransform &
  // Não pode ter campo implícito no match
  SlimMatchCondition &
  SlimFieldsApply;

export type SlimRulesMetadataTransform = SlimRuleMetadataTransform[];

// ======================== Converters ========================

export function toFieldsMetadataTransform(
  transform: SlimMetadataTransform,
): FieldsMetadataTransform {
  const simpleTransform = {} as FieldsMetadataTransform;

  for (const [fieldIdentifier, fieldTransform] of Object.entries(transform)) {
    const fieldTransformArray = Array.isArray(fieldTransform)
      ? fieldTransform
      : [fieldTransform];

    simpleTransform[fieldIdentifier] = fieldTransformArray.map((transform) =>
      toFieldMetadataTransform(transform, fieldIdentifier),
    );
  }

  return simpleTransform;
}

function toFieldMetadataTransform(
  fieldTransform: SlimFieldMetadataTransform,
  fieldIdentifier: string,
): FieldMetadataTransform {
  return {
    ...fieldTransform,
    ...toApply(fieldTransform),
    ...toMatchCondition(fieldTransform, fieldIdentifier),
  };
}

export function toRulesMetadataTransform(
  rulesTransform: SlimRulesMetadataTransform,
): RulesMetadataTransform {
  return rulesTransform.map((ruleTransform) => {
    return {
      ...ruleTransform,
      ...toFieldsApply(ruleTransform),
      ...toMatchCondition(ruleTransform),
    };
  });
}

function toFieldsApply(slimFieldsApply: SlimFieldsApply): FieldsApply {
  const fieldsApply = { _apply: {} } as FieldsApply;

  for (const [fieldIdentifier, applyContent] of Object.entries(
    slimFieldsApply._apply,
  )) {
    fieldsApply._apply[fieldIdentifier] = toApply({
      _apply: applyContent,
    } as SlimApply)._apply;
  }

  return fieldsApply;
}
