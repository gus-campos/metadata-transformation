// import { ExeptionHandling, InstanceObject, Value } from "./common";
// import { MatchCondition } from "./instance-condition";

// export type ChangeIfCondition = {
//   _if?: (
//     fieldValue: Value | Value[] | undefined,
//     object: InstanceObject,
//     oldObject: InstanceObject,
//   ) => boolean;
// };

// export type Swap = { from?: Value; to?: Value };

// export type FieldDraftTransform = ExeptionHandling &
//   MatchCondition &
//   ChangeIfCondition & {
//     _swapped?: Record<string, Swap>;
//     _changed?: string | string[];
//     _set?: Value | Value[];
//   };

// export type DraftTransform = Record<
//   string,
//   FieldDraftTransform | FieldDraftTransform[]
// >;

// // =============================================================================

// const example: FieldDraftTransform = {
//   _if: (value, obj, old) => true,

//   _match: {
//     campo1: "valor1",

//     _not: {
//       campo2: "valor2",
//     },

//     _some: {
//       campo3: null,
//       campo4: 0,
//     },
//   },

//   _changed: ["campo1", "campo2", "campo3"],

//   _swapped: {
//     campo1: {
//       from: 0,
//     },
//     campo2: {
//       to: 10,
//     },
//     campo3: {
//       from: 0,
//       to: 10,
//     },
//   },

//   _set: 101,
// };
