import { describe, it, expect, vi } from "vitest";
import { transformDraft, fieldTransformDraft } from "../src/processing/transform-draft";
import { InstanceObject } from "../src/models/common";
import { FieldDraftTransform, DraftTransform } from "../src/models/draft-transform";

// ---- factories --------------------------------------------------------------

function makeInstance(overrides: Partial<InstanceObject> = {}): InstanceObject {
  return {
    status: "ativo",
    tipo: "admin",
    valor: null,
    campo1: "original",
    campo2: 42,
    ...overrides,
  };
}

function makeContext(
  instanceOverrides: Partial<InstanceObject> = {},
  oldOverrides: Partial<InstanceObject> = {},
  fieldIdentifier: string = "campo1",
) {
  const instance = makeInstance(instanceOverrides);
  const oldInstance = makeInstance(oldOverrides);

  return {
    instance,
    oldInstance,
    lookupInstance: structuredClone(instance),
    fieldIdentifier,
  };
}

// ---- _setValue --------------------------------------------------------------

describe("fieldTransformDraft — _setValue", () => {
  it("aplica valor quando não há condição", () => {
    const context = makeContext();
    fieldTransformDraft(context, { _setValue: "novo" });
    expect(context.instance.campo1).toBe("novo");
  });

  it("aplica null", () => {
    const context = makeContext({ campo1: "valor" });
    fieldTransformDraft(context, { _setValue: null });
    expect(context.instance.campo1).toBeNull();
  });

  it("aplica número", () => {
    const context = makeContext();
    fieldTransformDraft(context, { _setValue: 99 });
    expect(context.instance.campo1).toBe(99);
  });

  it("aplica array de valores", () => {
    const context = makeContext();
    fieldTransformDraft(context, { _setValue: ["a", "b"] });
    expect(context.instance.campo1).toEqual(["a", "b"]);
  });

  it("não altera quando _setValue é undefined", () => {
    const context = makeContext();
    fieldTransformDraft(context, {});
    expect(context.instance.campo1).toBe("original");
  });
});

// ---- _match -----------------------------------------------------------------

describe("fieldTransformDraft — _match", () => {
  it("aplica quando _match satisfeito", () => {
    const context = makeContext();
    fieldTransformDraft(context, { _match: { status: "ativo" }, _setValue: "novo" });
    expect(context.instance.campo1).toBe("novo");
  });

  it("não aplica quando _match não satisfeito", () => {
    const context = makeContext();
    fieldTransformDraft(context, { _match: { status: "inativo" }, _setValue: "novo" });
    expect(context.instance.campo1).toBe("original");
  });

  it("usa lookupInstance para o _match, não instance", () => {
    const context = makeContext();
    // Modifica instance diretamente — lookupInstance não deve refletir
    context.instance.status = "inativo";
    fieldTransformDraft(context, { _match: { status: "ativo" }, _setValue: "novo" });
    expect(context.instance.campo1).toBe("novo"); // lookup ainda é "ativo"
  });
});

// ---- _if --------------------------------------------------------------------

describe("fieldTransformDraft — _if", () => {
  it("aplica quando _if retorna true", () => {
    const context = makeContext();
    fieldTransformDraft(context, { _if: () => true, _setValue: "novo" });
    expect(context.instance.campo1).toBe("novo");
  });

  it("não aplica quando _if retorna false", () => {
    const context = makeContext();
    fieldTransformDraft(context, { _if: () => false, _setValue: "novo" });
    expect(context.instance.campo1).toBe("original");
  });

  it("passa lookupInstance e oldInstance pro _if", () => {
    const context = makeContext();
    const _if = vi.fn(() => true);
    fieldTransformDraft(context, { _if, _setValue: "novo" });
    expect(_if).toHaveBeenCalledWith(context.lookupInstance.campo1, context.lookupInstance, context.oldInstance);
  });
});

// ---- _changed ---------------------------------------------------------------

describe("fieldTransformDraft — _changed", () => {
  it("aplica quando campo mudou", () => {
    const context = makeContext({ status: "inativo" }, { status: "ativo" });
    fieldTransformDraft(context, { _changed: ["status"], _setValue: "novo" });
    expect(context.instance.campo1).toBe("novo");
  });

  it("não aplica quando campo não mudou", () => {
    const context = makeContext({ status: "ativo" }, { status: "ativo" });
    fieldTransformDraft(context, { _changed: ["status"], _setValue: "novo" });
    expect(context.instance.campo1).toBe("original");
  });

  it("aplica quando ao menos um dos campos mudou", () => {
    const context = makeContext({ status: "inativo" }, { status: "ativo" });
    fieldTransformDraft(context, { _changed: ["status", "tipo"], _setValue: "novo" });
    expect(context.instance.campo1).toBe("novo");
  });

  it("não aplica quando nenhum dos campos mudou", () => {
    const context = makeContext();
    fieldTransformDraft(context, { _changed: ["status", "tipo"], _setValue: "novo" });
    expect(context.instance.campo1).toBe("original");
  });

  it("usa lookupInstance para _changed, não instance", () => {
    const context = makeContext();
    context.instance.status = "inativo"; // muda instance mas não lookup
    fieldTransformDraft(context, { _changed: ["status"], _setValue: "novo" });
    expect(context.instance.campo1).toBe("original"); // lookup === old
  });
});

// ---- _swapped ----------------------------------------------------------

describe("fieldTransformDraft — _swapped", () => {
  it("aplica quando from e to batem", () => {
    const context = makeContext({ status: "inativo" }, { status: "ativo" });
    fieldTransformDraft(context, {
      _swapped: { status: { from: "ativo", to: "inativo" } },
      _setValue: "novo",
    });
    expect(context.instance.campo1).toBe("novo");
  });

  it("não aplica quando from não bate", () => {
    const context = makeContext({ status: "inativo" }, { status: "bloqueado" });
    fieldTransformDraft(context, {
      _swapped: { status: { from: "ativo", to: "inativo" } },
      _setValue: "novo",
    });
    expect(context.instance.campo1).toBe("original");
  });

  it("não aplica quando to não bate", () => {
    const context = makeContext({ status: "bloqueado" }, { status: "ativo" });
    fieldTransformDraft(context, {
      _swapped: { status: { from: "ativo", to: "inativo" } },
      _setValue: "novo",
    });
    expect(context.instance.campo1).toBe("original");
  });

  it("aplica com apenas from definido", () => {
    const context = makeContext({ status: "qualquer" }, { status: "ativo" });
    fieldTransformDraft(context, {
      _swapped: { status: { from: "ativo" } },
      _setValue: "novo",
    });
    expect(context.instance.campo1).toBe("novo");
  });

  it("aplica com apenas to definido", () => {
    const context = makeContext({ status: "inativo" }, { status: "qualquer" });
    fieldTransformDraft(context, {
      _swapped: { status: { to: "inativo" } },
      _setValue: "novo",
    });
    expect(context.instance.campo1).toBe("novo");
  });

  it("verifica múltiplos campos — todos devem bater", () => {
    const context = makeContext(
      { status: "inativo", tipo: "user" },
      { status: "ativo", tipo: "admin" },
    );
    fieldTransformDraft(context, {
      _swapped: {
        status: { from: "ativo", to: "inativo" },
        tipo: { from: "admin", to: "user" },
      },
      _setValue: "novo",
    });
    expect(context.instance.campo1).toBe("novo");
  });

  it("não aplica quando um dos campos não bate", () => {
    const context = makeContext(
      { status: "inativo", tipo: "admin" }, // tipo não mudou
      { status: "ativo", tipo: "admin" },
    );
    fieldTransformDraft(context, {
      _swapped: {
        status: { from: "ativo", to: "inativo" },
        tipo: { from: "admin", to: "user" },
      },
      _setValue: "novo",
    });
    expect(context.instance.campo1).toBe("original");
  });
});

// ---- combinações ------------------------------------------------------------

describe("fieldTransformDraft — combinações de condições", () => {
  it("todas as condições verdadeiras aplica", () => {
    const context = makeContext({ status: "inativo" }, { status: "ativo" });
    fieldTransformDraft(context, {
      _if: () => true,
      _match: { tipo: "admin" },
      _changed: ["status"],
      _swapped: { status: { from: "ativo", to: "inativo" } },
      _setValue: "novo",
    });
    expect(context.instance.campo1).toBe("novo");
  });

  it("uma condição falsa bloqueia o apply", () => {
    const context = makeContext({ status: "inativo" }, { status: "ativo" });
    fieldTransformDraft(context, {
      _if: () => false, // ← falso
      _match: { tipo: "admin" },
      _changed: ["status"],
      _setValue: "novo",
    });
    expect(context.instance.campo1).toBe("original");
  });
});

// ---- array de transforms ----------------------------------------------------

describe("fieldTransformDraft — array", () => {
  it("aplica todos em ordem", () => {
    const context = makeContext();
    fieldTransformDraft(context, [
      { _setValue: "primeiro" },
      { _setValue: "segundo" },
    ]);
    expect(context.instance.campo1).toBe("segundo");
  });

  it("o segundo transform enxerga o valor já alterado via lookupInstance", () => {
    const context = makeContext();
    // lookupInstance é clonado antes — segundo transform não vê mudança do primeiro
    fieldTransformDraft(context, [
      { _setValue: "primeiro" },
      { _match: { campo1: "primeiro" }, _setValue: "segundo" },
    ]);
    // lookup ainda tem "original", então _match falha
    expect(context.instance.campo1).toBe("primeiro");
  });

  it("aplica apenas os com condição satisfeita", () => {
    const context = makeContext();
    fieldTransformDraft(context, [
      { _if: () => true,  _setValue: "aplicado" },
      { _if: () => false, _setValue: "ignorado" },
    ]);
    expect(context.instance.campo1).toBe("aplicado");
  });

  it("array vazio não altera nada", () => {
    const context = makeContext();
    fieldTransformDraft(context, []);
    expect(context.instance.campo1).toBe("original");
  });
});

// ---- transformDraft ---------------------------------------------------------

describe("transformDraft", () => {
  it("aplica transform para cada campo", () => {
    const instance = makeInstance();
    const old = makeInstance();
    const draftTransform: DraftTransform = {
      campo1: { _setValue: "novo1" },
      campo2: { _setValue: 99 },
    };

    transformDraft(instance, old, draftTransform);

    expect(instance.campo1).toBe("novo1");
    expect(instance.campo2).toBe(99);
  });

  it("lookupInstance é isolado — transforms não se afetam entre si", () => {
    const instance = makeInstance();
    const old = makeInstance();
    const draftTransform: DraftTransform = {
      campo1: { _setValue: "novo" },
      // campo2 depende do valor original de campo1, não do novo
      campo2: { _match: { campo1: "original" }, _setValue: 99 },
    };

    transformDraft(instance, old, draftTransform);

    expect(instance.campo1).toBe("novo");
    expect(instance.campo2).toBe(99); // lookup ainda tem "original"
  });

  it("não afeta campos sem entrada no draftTransform", () => {
    const instance = makeInstance();
    const old = makeInstance();

    transformDraft(instance, old, { campo1: { _setValue: "novo" } });

    expect(instance.campo2).toBe(42);
  });

  it("campo inexistente no draftTransform não lança erro", () => {
    const instance = makeInstance();
    const old = makeInstance();

    expect(() =>
      transformDraft(instance, old, { campoInexistente: { _setValue: "novo" } }),
    ).not.toThrow();
  });
});

// ---- isolamento do lookupInstance -------------------------------------------

describe("transformDraft — isolamento do lookupInstance", () => {
  it("múltiplos campos com _setValue não se interferem via lookup", () => {
    const instance = makeInstance({ campo1: "a", campo2: 1 });
    const old = makeInstance({ campo1: "a", campo2: 1 });

    transformDraft(instance, old, {
      campo1: { _setValue: "b" },
      campo2: { _match: { campo1: "a" }, _setValue: 2 }, // lookup ainda é "a"
    });

    expect(instance.campo1).toBe("b");
    expect(instance.campo2).toBe(2);
  });
});