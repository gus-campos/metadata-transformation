import { describe, expect, it } from "vitest";
import { PlainObject } from "../src/models/common";
import { accessPathInObject } from "../src/processing/path-access";

const object: PlainObject = {
  name: "Pedro",
  age: 30,
  active: true,
  score: 0,
  data: {
    person: {
      name: {
        firstName: "Pedro",
        lastName: "Silva",
      },
    },
  },
  withNull: null,
  withDate: new Date("2024-01-01"),
};

describe("accessPathInObject", () => {
  describe("Caminho válido", () => {
    it("acessa chave de primeiro nível", () => {
      expect(accessPathInObject("name", object)).toBe("Pedro");
    });

    it("acessa chave de primeiro nível com valor numérico", () => {
      expect(accessPathInObject("age", object)).toBe(30);
    });

    it("acessa chave de primeiro nível com valor booleano", () => {
      expect(accessPathInObject("active", object)).toBe(true);
    });

    it("acessa chave de primeiro nível com valor zero", () => {
      expect(accessPathInObject("score", object)).toBe(0);
    });

    it("acessa caminho profundo", () => {
      expect(accessPathInObject("data.person.name.firstName", object)).toBe(
        "Pedro",
      );
    });

    it("acessa caminho intermediário retornando objeto", () => {
      expect(accessPathInObject("data.person.name", object)).toEqual({
        firstName: "Pedro",
        lastName: "Silva",
      });
    });
  });
  
  describe("Caminho não encontrado — deve retornar undefined", () => {
    it("chave inexistente no primeiro nível", () => {
      expect(accessPathInObject("nonexistent", object)).toBeUndefined();
    });

    it("chave intermediária inexistente", () => {
      expect(
        accessPathInObject("data.nonexistent.name", object),
      ).toBeUndefined();
    });

    it("chave após valor primitivo (string)", () => {
      expect(accessPathInObject("name.extra", object)).toBeUndefined();
    });

    it("chave após valor primitivo (number)", () => {
      expect(accessPathInObject("age.extra", object)).toBeUndefined();
    });

    it("chave após valor nulo", () => {
      expect(accessPathInObject("withNull.extra", object)).toBeUndefined();
    });

    it("chave após Date", () => {
      expect(accessPathInObject("withDate.extra", object)).toBeUndefined();
    });

    it("caminho vazio", () => {
      expect(accessPathInObject("", object)).toBeUndefined();
    });
  });

  describe("Tipos especiais como valor final", () => {
    it("retorna null quando é o valor final do caminho", () => {
      expect(accessPathInObject("withNull", object)).toBeNull();
    });

    it("retorna Date quando é o valor final do caminho", () => {
      expect(accessPathInObject("withDate", object)).toBeInstanceOf(Date);
    });
  });
});
