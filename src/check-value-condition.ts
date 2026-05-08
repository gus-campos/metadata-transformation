import { InstanceObject, UnitValueCondition, ValueConditionAre, ValueConditionIf, ValueConditionIs, ValueConditionIsIn, ValueConditionIsNot, ValueConditionIsNotIn, ValueConditionSomeIs } from "../models/metadata-transform";

// Passar pra commum...?
function checkValueCondition(valueCondition: UnitValueCondition, object: InstanceObject): boolean {
  // descobrir qual é o tipo, e chamar função correspondente
  // set global
  return true;
}

function checkValueConditionIs(valueCondition: ValueConditionIs, object: InstanceObject): boolean {
  return true;
}

function checkValueConditionIsNot(valueCondition: ValueConditionIsNot, object: InstanceObject): boolean {
  return true;
}

function checkValueConditionIsIn(valueCondition: ValueConditionIsIn, object: InstanceObject): boolean {
  return true;
}

function checkValueConditionIsNotIn(valueCondition: ValueConditionIsNotIn, object: InstanceObject): boolean {
  return true;
}

function checkValueConditionAre(valueCondition: ValueConditionAre, object: InstanceObject): boolean {
  return true;
}

function checkValueConditionSomeIs(valueCondition: ValueConditionSomeIs, object: InstanceObject): boolean {
  return true;
}

function checkValueConditionIf(valueCondition: ValueConditionIf, object: InstanceObject): boolean {
  return true;
}
