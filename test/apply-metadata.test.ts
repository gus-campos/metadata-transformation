import { describe, it, expect } from "vitest";
import { applyMetadata } from "../src/processing/apply-metadata";
import { MetadataProps } from "../src/models/pure/metadata-transform";
import { Metadata } from "../src/models/pure/common";

// ---- helpers ----------------------------------------------------------------

function makeMetadata(
  overrides: Record<string, Partial<MetadataProps>> = {},
): Metadata {
  return {
    fields: {
      campo1: {
        hidden: false,
        required: false,
        readOnly: false,
        size: "md",
        breakLine: false,
        valueOptions: [],
        query: {},
        minMultiplicity: 0,
        maxMultiplicity: 10,
        editHelp: { pt: "editHelpPt", _current: "editHelpCurrent" },
        name: { pt: "namePt", _current: "nameCurrent" },
        placeholder: { pt: "placeholderPt", _current: "placeholderCurent" },
        mask: { _id: "ID_MASK" },
        ...overrides["campo1"],
      },
      campo2: {
        hidden: false,
        required: false,
        readOnly: false,
        size: "md",
        breakLine: false,
        valueOptions: [],
        query: {},
        minMultiplicity: 0,
        maxMultiplicity: 10,
        editHelp: { pt: "editHelpPt", _current: "editHelpCurrent" },
        name: { pt: "namePt", _current: "nameCurrent" },
        placeholder: { pt: "placeholderPt", _current: "placeholderCurent" },
        mask: { _id: "ID_MASK" },
        ...overrides["campo2"],
      },
    },
  };
}

// ---- behavior ---------------------------------------------------------------

// describe("ApplyMetadata — behavior", () => {
//   it("omitted: oculta, não obrigatório, não readOnly", () => {
//     const metadata = makeMetadata();
//     applyMetadata(metadata, "campo1", { behavior: "omitted" });

//     expect(metadata.fields.campo1!).toMatchObject({
//       hidden: true,
//       required: false,
//       readOnly: false,
//     });
//   });

//   it("mandatory: visível, obrigatório, não readOnly", () => {
//     const metadata = makeMetadata();
//     applyMetadata(metadata, "campo1", { behavior: "mandatory" });

//     expect(metadata.fields.campo1!).toMatchObject({
//       hidden: false,
//       required: true,
//       readOnly: false,
//     });
//   });

//   it("editable: visível, não obrigatório, não readOnly", () => {
//     const metadata = makeMetadata();
//     applyMetadata(metadata, "campo1", { behavior: "editable" });

//     expect(metadata.fields.campo1!).toMatchObject({
//       hidden: false,
//       required: false,
//       readOnly: false,
//     });
//   });

//   it("displayed: visível, não obrigatório, readOnly", () => {
//     const metadata = makeMetadata();
//     applyMetadata(metadata, "campo1", { behavior: "displayed" });

//     expect(metadata.fields.campo1!).toMatchObject({
//       hidden: false,
//       required: false,
//       readOnly: true,
//     });
//   });
// });

// ---- behaviorProps ----------------------------------------------------------

describe("ApplyMetadata — BehaviorProps", () => {
  it("aplica hidden, required e readOnly individualmente", () => {
    const metadata = makeMetadata();
    applyMetadata(metadata, "campo1", {
      hidden: true,
      required: true,
      readOnly: false,
    });

    expect(metadata.fields.campo1!).toMatchObject({
      hidden: true,
      required: true,
      readOnly: false,
    });
  });

  it("aplica apenas hidden sem sobrescrever outros campos", () => {
    const metadata = makeMetadata({ campo1: { required: true } });
    applyMetadata(metadata, "campo1", { hidden: true });

    expect(metadata.fields.campo1!.hidden).toBe(true);
    expect(metadata.fields.campo1!.required).toBe(true); // inalterado
  });
});

// ---- ExtraMetadataProps -----------------------------------------------------

describe("ApplyMetadata — ExtraMetadataProps", () => {
  it("aplica size e breakLine junto com BehaviorProps", () => {
    const metadata = makeMetadata();
    applyMetadata(metadata, "campo1", {
      hidden: true,
      size: "sm",
      breakLine: true,
    });

    expect(metadata.fields.campo1!).toMatchObject({
      hidden: true,
      size: "sm",
      breakLine: true,
    });
  });

  it("aplica valueOptions e query", () => {
    const metadata = makeMetadata();
    const valueOptions = [{ value: "v1", identifier: "i1" }];
    const query = { filter: "ativo" };

    applyMetadata(metadata, "campo1", { hidden: false, valueOptions, query });

    expect(metadata.fields.campo1!.valueOptions).toEqual(valueOptions);
    expect(metadata.fields.campo1!.query).toEqual(query);
  });

  //   it("aplica ExtraMetadataProps junto com behavior", () => {
  //     const metadata = makeMetadata();

  //     applyMetadata(metadata, "campo1", {
  //       behavior: "displayed",
  //       breakLine: true,
  //       size: "bg",
  //     });

  //     expect(metadata.fields.campo1!).toMatchObject({
  //       readOnly: true,
  //       breakLine: true,
  //       size: "bg",
  //     });
  //   });
});

// ---- mutação ----------------------------------------------------------------

describe("ApplyMetadata — mutação", () => {
  it("muta o objeto metadata diretamente", () => {
    const metadata = makeMetadata();
    const fieldBefore = metadata.fields.campo1!;

    applyMetadata(metadata, "campo1", { hidden: true });

    expect(metadata.fields.campo1!).toBe(fieldBefore); // mesma referência
    expect(metadata.fields.campo1!.hidden).toBe(true);
  });

  it("não afeta outros campos do metadata", () => {
    const metadata = makeMetadata();

    applyMetadata(metadata, "campo1", { hidden: true });

    expect(metadata.fields.campo2).toMatchObject({
      hidden: false,
      required: false,
      readOnly: false,
      size: "md",
      breakLine: false,
    });
  });
});

// ---- entradas inválidas dentro do tipo -------------------------------------

describe("ApplyMetadata — fieldIdentifier inexistente", () => {
  it("lança ao tentar aplicar em campo que não existe no metadata", () => {
    const metadata = makeMetadata();

    expect(() =>
      applyMetadata(metadata, "campoInexistente", { hidden: true }),
    ).toThrow();
  });

  it("não afeta outros campos ao falhar em campo inexistente", () => {
    const metadata = makeMetadata();

    try {
      applyMetadata(metadata, "campoInexistente", { hidden: true });
    } catch {}

    expect(metadata.fields.campo1!).toMatchObject({ hidden: false });
    expect(metadata.fields.campo2).toMatchObject({ hidden: false });
  });
});

// describe("ApplyMetadata — behavior indefinido", () => {
//   it("lança ou ignora ao receber behavior undefined", () => {
//     const metadata = makeMetadata();

//     expect(() =>
//       applyMetadata(metadata, "campo1", { behavior: undefined }),
//     ).not.toThrow();
//   });
// });

describe("ApplyMetadata — _apply vazio", () => {
  it("não altera o campo ao receber objeto vazio", () => {
    const metadata = makeMetadata();
    const original = { ...metadata.fields.campo1! };

    applyMetadata(metadata, "campo1", {} as any);

    expect(metadata.fields.campo1!).toMatchObject(original);
  });
});

describe("ApplyMetadata — valueOptions", () => {
  it("mantém a mesma referência do array ao atualizar", () => {
    const metadata = makeMetadata();
    const ref = metadata.fields.campo1!.valueOptions!;

    applyMetadata(metadata, "campo1", {
      valueOptions: [{ value: "v1", identifier: "i1" }],
    });

    expect(metadata.fields.campo1!.valueOptions).toBe(ref);
  });

  it("substitui os itens corretamente", () => {
    const metadata = makeMetadata({
      campo1: { valueOptions: [{ value: "antigo", identifier: "a" }] },
    });

    applyMetadata(metadata, "campo1", {
      valueOptions: [
        { value: "v1", identifier: "i1" },
        { value: "v2", identifier: "i2" },
      ],
    });

    expect(metadata.fields.campo1!.valueOptions).toEqual([
      { value: "v1", identifier: "i1" },
      { value: "v2", identifier: "i2" },
    ]);
  });

  it("limpa o array ao receber vazio", () => {
    const metadata = makeMetadata({
      campo1: { valueOptions: [{ value: "v1", identifier: "i1" }] },
    });

    applyMetadata(metadata, "campo1", { valueOptions: [] });

    expect(metadata.fields.campo1!.valueOptions).toEqual([]);
  });

  it("não afeta valueOptions de outros campos", () => {
    const metadata = makeMetadata({
      campo2: { valueOptions: [{ value: "v2", identifier: "i2" }] },
    });

    applyMetadata(metadata, "campo1", {
      valueOptions: [{ value: "v1", identifier: "i1" }],
    });

    expect(metadata.fields.campo2!.valueOptions).toEqual([
      { value: "v2", identifier: "i2" },
    ]);
  });
});

describe("ApplyMetadata — query", () => {
  it("substitui o query inteiro", () => {
    const metadata = makeMetadata({ campo1: { query: { antigo: "valor" } } });

    applyMetadata(metadata, "campo1", { query: { novo: "valor" } });

    expect(metadata.fields.campo1!.query).toEqual({ novo: "valor" });
  });

  it("limpa o query ao receber objeto vazio", () => {
    const metadata = makeMetadata({ campo1: { query: { filtro: "ativo" } } });

    applyMetadata(metadata, "campo1", { query: {} });

    expect(metadata.fields.campo1!.query).toEqual({});
  });

  it("não afeta query de outros campos", () => {
    const metadata = makeMetadata({ campo2: { query: { filtro: "ativo" } } });

    applyMetadata(metadata, "campo1", { query: { outro: "valor" } });

    expect(metadata.fields.campo2!.query).toEqual({ filtro: "ativo" });
  });
});
