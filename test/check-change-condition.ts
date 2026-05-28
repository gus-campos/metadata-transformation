// import { describe, expect, it } from "vitest";
// import {
//   checkSwapCondition,
//   checkChangedCondition,
// } from "../src/processing/check-change-condition";
// import { InstanceObject, Value } from "../src/models/common";
// import { Swap } from "../src/models/draft-transform";

// // ─── Helpers ────────────────────────────────────────────────────────────────

// const obj = (fields: Record<string, Value | Value[] | InstanceObject>) =>
//   fields as InstanceObject;

// const swap = (fields: Record<string, Swap>): Record<string, Swap> => fields;

// // ─── checkSwapCondition ──────────────────────────────────────────────────────

// describe("checkSwapCondition", () => {
//   describe("from e to definidos — string", () => {
//     it("retorna true quando o campo transitou de from para to", () => {
//       expect(
//         checkSwapCondition(
//           obj({ status: "active" }),
//           obj({ status: "inactive" }),
//           swap({ status: { from: "inactive", to: "active" } }),
//         ),
//       ).toBe(true);
//     });

//     it("retorna false quando o valor novo não bate com to", () => {
//       expect(
//         checkSwapCondition(
//           obj({ status: "pending" }),
//           obj({ status: "inactive" }),
//           swap({ status: { from: "inactive", to: "active" } }),
//         ),
//       ).toBe(false);
//     });

//     it("retorna false quando o valor antigo não bate com from", () => {
//       expect(
//         checkSwapCondition(
//           obj({ status: "active" }),
//           obj({ status: "pending" }),
//           swap({ status: { from: "inactive", to: "active" } }),
//         ),
//       ).toBe(false);
//     });
//   });

//   describe("from e to definidos — number", () => {
//     it("retorna true para transição numérica correta", () => {
//       expect(
//         checkSwapCondition(
//           obj({ score: 10 }),
//           obj({ score: 0 }),
//           swap({ score: { from: 0, to: 10 } }),
//         ),
//       ).toBe(true);
//     });

//     it("retorna false quando número novo não bate com to", () => {
//       expect(
//         checkSwapCondition(
//           obj({ score: 5 }),
//           obj({ score: 0 }),
//           swap({ score: { from: 0, to: 10 } }),
//         ),
//       ).toBe(false);
//     });
//   });

//   describe("from e to definidos — null", () => {
//     it("retorna true ao transitar de null para string", () => {
//       expect(
//         checkSwapCondition(
//           obj({ field: "valor" }),
//           obj({ field: null }),
//           swap({ field: { from: null, to: "valor" } }),
//         ),
//       ).toBe(true);
//     });

//     it("retorna true ao transitar de string para null", () => {
//       expect(
//         checkSwapCondition(
//           obj({ field: null }),
//           obj({ field: "valor" }),
//           swap({ field: { from: "valor", to: null } }),
//         ),
//       ).toBe(true);
//     });

//     it("retorna false quando esperava null mas veio outro valor", () => {
//       expect(
//         checkSwapCondition(
//           obj({ field: "outro" }),
//           obj({ field: null }),
//           swap({ field: { from: null, to: "valor" } }),
//         ),
//       ).toBe(false);
//     });
//   });

//   describe("from e to definidos — Date", () => {
//     const d1 = new Date("2024-01-01");
//     const d2 = new Date("2024-06-01");

//     it("retorna true para transição de datas corretas", () => {
//       expect(
//         checkSwapCondition(
//           obj({ deadline: d2 }),
//           obj({ deadline: d1 }),
//           swap({ deadline: { from: d1, to: d2 } }),
//         ),
//       ).toBe(true);
//     });

//     it("retorna false quando data nova não bate", () => {
//       expect(
//         checkSwapCondition(
//           obj({ deadline: d1 }),
//           obj({ deadline: d1 }),
//           swap({ deadline: { from: d1, to: d2 } }),
//         ),
//       ).toBe(false);
//     });
//   });

//   describe("from indefinido (qualquer valor anterior)", () => {
//     it("retorna true independente do valor antigo quando from é undefined", () => {
//       expect(
//         checkSwapCondition(
//           obj({ status: "active" }),
//           obj({ status: "qualquercoisa" }),
//           swap({ status: { to: "active" } }),
//         ),
//       ).toBe(true);
//     });

//     it("retorna false quando o valor novo não bate com to, mesmo sem from", () => {
//       expect(
//         checkSwapCondition(
//           obj({ status: "inactive" }),
//           obj({ status: "qualquercoisa" }),
//           swap({ status: { to: "active" } }),
//         ),
//       ).toBe(false);
//     });

//     it("retorna true quando campo antigo era undefined e from é undefined", () => {
//       expect(
//         checkSwapCondition(
//           obj({ status: "active" }),
//           obj({}),
//           swap({ status: { to: "active" } }),
//         ),
//       ).toBe(true);
//     });
//   });

//   describe("to indefinido (qualquer valor novo)", () => {
//     it("retorna true independente do valor novo quando to é undefined", () => {
//       expect(
//         checkSwapCondition(
//           obj({ status: "qualquercoisa" }),
//           obj({ status: "inactive" }),
//           swap({ status: { from: "inactive" } }),
//         ),
//       ).toBe(true);
//     });

//     it("retorna false quando o valor antigo não bate com from, mesmo sem to", () => {
//       expect(
//         checkSwapCondition(
//           obj({ status: "qualquercoisa" }),
//           obj({ status: "active" }),
//           swap({ status: { from: "inactive" } }),
//         ),
//       ).toBe(false);
//     });

//     it("retorna false quando campo antigo era undefined mas from exige valor específico", () => {
//       expect(
//         checkSwapCondition(
//           obj({ status: "active" }),
//           obj({}),
//           swap({ status: { from: "inactive", to: "active" } }),
//         ),
//       ).toBe(false);
//     });
//   });

//   describe("from e to indefinidos", () => {
//     it("retorna true para qualquer combinação de valores", () => {
//       expect(
//         checkSwapCondition(
//           obj({ status: "active" }),
//           obj({ status: "inactive" }),
//           swap({ status: {} }),
//         ),
//       ).toBe(true);
//     });

//     it("retorna true mesmo quando campo era undefined", () => {
//       expect(
//         checkSwapCondition(
//           obj({ status: "active" }),
//           obj({}),
//           swap({ status: {} }),
//         ),
//       ).toBe(true);
//     });
//   });

//   describe("múltiplas chaves (todas devem ser true)", () => {
//     it("retorna true quando todas as chaves satisfazem a transição", () => {
//       expect(
//         checkSwapCondition(
//           obj({ status: "active", score: 10 }),
//           obj({ status: "inactive", score: 0 }),
//           swap({
//             status: { from: "inactive", to: "active" },
//             score: { from: 0, to: 10 },
//           }),
//         ),
//       ).toBe(true);
//     });

//     it("retorna false quando ao menos uma chave não satisfaz", () => {
//       expect(
//         checkSwapCondition(
//           obj({ status: "active", score: 5 }),
//           obj({ status: "inactive", score: 0 }),
//           swap({
//             status: { from: "inactive", to: "active" },
//             score: { from: 0, to: 10 },
//           }),
//         ),
//       ).toBe(false);
//     });
//   });
// });

// // ─── checkChangedCondition ───────────────────────────────────────────────────

// describe("checkChangedCondition", () => {
//   describe("string simples (não array)", () => {
//     it("retorna true quando o campo mudou passando string simples", () => {
//       expect(
//         checkChangedCondition(obj({ name: "João" }), obj({ name: "Maria" }), [
//           "name",
//         ]),
//       ).toBe(true);
//     });

//     it("retorna false quando o campo não mudou passando string simples", () => {
//       expect(
//         checkChangedCondition(obj({ name: "João" }), obj({ name: "João" }), [
//           "name",
//         ]),
//       ).toBe(false);
//     });
//   });

//   describe("campo único em array", () => {
//     it("retorna true quando o campo mudou — string", () => {
//       expect(
//         checkChangedCondition(obj({ name: "João" }), obj({ name: "Maria" }), [
//           "name",
//         ]),
//       ).toBe(true);
//     });

//     it("retorna false quando o campo não mudou — string", () => {
//       expect(
//         checkChangedCondition(obj({ name: "João" }), obj({ name: "João" }), [
//           "name",
//         ]),
//       ).toBe(false);
//     });

//     it("retorna true quando campo era undefined e agora tem valor", () => {
//       expect(
//         checkChangedCondition(obj({ name: "João" }), obj({}), ["name"]),
//       ).toBe(true);
//     });

//     it("retorna true quando campo tinha valor e agora é undefined", () => {
//       expect(
//         checkChangedCondition(obj({}), obj({ name: "João" }), ["name"]),
//       ).toBe(true);
//     });

//     it("retorna false quando campo é undefined nos dois", () => {
//       expect(checkChangedCondition(obj({}), obj({}), ["name"])).toBe(false);
//     });
//   });

//   describe("tipos de Value", () => {
//     it("retorna true para mudança de number", () => {
//       expect(
//         checkChangedCondition(obj({ score: 10 }), obj({ score: 9 }), ["score"]),
//       ).toBe(true);
//     });

//     it("retorna false quando number não mudou", () => {
//       expect(
//         checkChangedCondition(obj({ score: 10 }), obj({ score: 10 }), [
//           "score",
//         ]),
//       ).toBe(false);
//     });

//     it("retorna true quando campo foi de null para string", () => {
//       expect(
//         checkChangedCondition(obj({ field: "valor" }), obj({ field: null }), [
//           "field",
//         ]),
//       ).toBe(true);
//     });

//     it("retorna true quando campo foi de string para null", () => {
//       expect(
//         checkChangedCondition(obj({ field: null }), obj({ field: "valor" }), [
//           "field",
//         ]),
//       ).toBe(true);
//     });

//     it("retorna false quando campo é null nos dois", () => {
//       expect(
//         checkChangedCondition(obj({ field: null }), obj({ field: null }), [
//           "field",
//         ]),
//       ).toBe(false);
//     });

//     it("retorna true para mudança de Date", () => {
//       expect(
//         checkChangedCondition(
//           obj({ deadline: new Date("2024-06-01") }),
//           obj({ deadline: new Date("2024-01-01") }),
//           ["deadline"],
//         ),
//       ).toBe(true);
//     });

//     it("retorna false quando Date não mudou", () => {
//       const d = new Date("2024-01-01");
//       expect(
//         checkChangedCondition(obj({ deadline: d }), obj({ deadline: d }), [
//           "deadline",
//         ]),
//       ).toBe(false);
//     });
//   });

//   describe("múltiplos campos (basta um mudar)", () => {
//     it("retorna true quando apenas um dos campos mudou", () => {
//       expect(
//         checkChangedCondition(
//           obj({ name: "João", score: 10 }),
//           obj({ name: "Maria", score: 10 }),
//           ["name", "score"],
//         ),
//       ).toBe(true);
//     });

//     it("retorna true quando todos os campos mudaram", () => {
//       expect(
//         checkChangedCondition(
//           obj({ name: "João", score: 10 }),
//           obj({ name: "Maria", score: 9 }),
//           ["name", "score"],
//         ),
//       ).toBe(true);
//     });

//     it("retorna false quando nenhum dos campos mudou", () => {
//       expect(
//         checkChangedCondition(
//           obj({ name: "João", score: 10 }),
//           obj({ name: "João", score: 10 }),
//           ["name", "score"],
//         ),
//       ).toBe(false);
//     });
//   });
// });
