import { describe, it, expect, vi } from "vitest";
import { InstanceObject, Metadata, MetadataProps } from "../src/models/common";
import {
  fieldTransformMetadata,
  transformMetadata,
} from "../src/processing/transform-metadata";
import {
  FieldMetadataTransform,
  MetadataTransform,
} from "../src/models/metadata-transform";

// ---- factories --------------------------------------------------------------

function makeMetadata(
  overrides: Record<string, Partial<MetadataProps>> = {},
): Metadata {
  return {
    fields: {
      status: {
        hidden: false,
        required: false,
        readOnly: false,
        size: "md",
        breakline: false,
        valueOptions: [],
        query: {},
        ...overrides.status,
      },
      tipo: {
        hidden: false,
        required: false,
        readOnly: false,
        size: "md",
        breakline: false,
        valueOptions: [],
        query: {},
        ...overrides.tipo,
      },
    },
  };
}

const instance: InstanceObject = {
  status: "ativo",
  tipo: "admin",
  valor: null,
};

// ---- fieldTransformMetadata — _apply ----------------------------------------

describe("fieldTransformMetadata — _apply", () => {
  it("aplica quando não há condição alguma", () => {
    const metadata = makeMetadata();
    const transform: FieldMetadataTransform = {
      _apply: { hidden: true },
    };

    fieldTransformMetadata(
      { metadata, instance, fieldIdentifier: "status" },
      transform,
    );

    expect(metadata.fields.status!.hidden).toBe(true);
  });

  it("não faz nada quando não há _apply", () => {
    const metadata = makeMetadata();
    const original = { ...metadata.fields.status! };
    const transform: FieldMetadataTransform = {
      _match: { status: "ativo" },
    };

    fieldTransformMetadata(
      { metadata, instance, fieldIdentifier: "status" },
      transform,
    );

    expect(metadata.fields.status!).toMatchObject(original);
  });
});

// ---- fieldTransformMetadata — _if -------------------------------------------

describe("fieldTransformMetadata — _if", () => {
  it("aplica quando _if retorna true", () => {
    const metadata = makeMetadata();
    const transform: FieldMetadataTransform = {
      _if: () => true,
      _apply: { required: true },
    };

    fieldTransformMetadata(
      { metadata, instance, fieldIdentifier: "status" },
      transform,
    );

    expect(metadata.fields.status!.required).toBe(true);
  });

  it("não aplica quando _if retorna false", () => {
    const metadata = makeMetadata();
    const transform: FieldMetadataTransform = {
      _if: () => false,
      _apply: { required: true },
    };

    fieldTransformMetadata(
      { metadata, instance, fieldIdentifier: "status" },
      transform,
    );

    expect(metadata.fields.status!.required).toBe(false);
  });

  it("passa a instância correta pro _if", () => {
    const metadata = makeMetadata();
    const _if = vi.fn(() => true);
    const transform: FieldMetadataTransform = { _if, _apply: { hidden: true } };

    fieldTransformMetadata(
      { metadata, instance, fieldIdentifier: "status" },
      transform,
    );

    expect(_if).toHaveBeenCalledWith(instance.status, instance);
  });
});

// ---- fieldTransformMetadata — _match ----------------------------------------

describe("fieldTransformMetadata — _match", () => {
  it("aplica quando _match satisfeito", () => {
    const metadata = makeMetadata();
    const transform: FieldMetadataTransform = {
      _match: { status: "ativo" },
      _apply: { readOnly: true },
    };

    fieldTransformMetadata(
      { metadata, instance, fieldIdentifier: "status" },
      transform,
    );

    expect(metadata.fields.status!.readOnly).toBe(true);
  });

  it("não aplica quando _match não satisfeito", () => {
    const metadata = makeMetadata();
    const transform: FieldMetadataTransform = {
      _match: { status: "inativo" },
      _apply: { readOnly: true },
    };

    fieldTransformMetadata(
      { metadata, instance, fieldIdentifier: "status" },
      transform,
    );

    expect(metadata.fields.status!.readOnly).toBe(false);
  });
});

// ---- fieldTransformMetadata — _if + _match ----------------------------------

describe("fieldTransformMetadata — _if + _match", () => {
  it("aplica quando ambos são verdadeiros", () => {
    const metadata = makeMetadata();
    const transform: FieldMetadataTransform = {
      _if: (_, obj) => obj.tipo === "admin",
      _match: { status: "ativo" },
      _apply: { hidden: true },
    };

    fieldTransformMetadata(
      { metadata, instance, fieldIdentifier: "status" },
      transform,
    );

    expect(metadata.fields.status!.hidden).toBe(true);
  });

  it("não aplica quando _if false e _match true", () => {
    const metadata = makeMetadata();
    const transform: FieldMetadataTransform = {
      _if: () => false,
      _match: { status: "ativo" },
      _apply: { hidden: true },
    };

    fieldTransformMetadata(
      { metadata, instance, fieldIdentifier: "status" },
      transform,
    );

    expect(metadata.fields.status!.hidden).toBe(false);
  });

  it("não aplica quando _if true e _match false", () => {
    const metadata = makeMetadata();
    const transform: FieldMetadataTransform = {
      _if: () => true,
      _match: { status: "inativo" },
      _apply: { hidden: true },
    };

    fieldTransformMetadata(
      { metadata, instance, fieldIdentifier: "status" },
      transform,
    );

    expect(metadata.fields.status!.hidden).toBe(false);
  });
});

// ---- fieldTransformMetadata — array -----------------------------------------

describe("fieldTransformMetadata — array de transforms", () => {
  it("aplica todos os transforms em ordem", () => {
    const metadata = makeMetadata();
    const transforms: FieldMetadataTransform[] = [
      { _apply: { hidden: true } },
      { _apply: { required: true } },
    ];

    fieldTransformMetadata(
      { metadata, instance, fieldIdentifier: "status" },
      transforms,
    );

    expect(metadata.fields.status!.hidden).toBe(true);
    expect(metadata.fields.status!.required).toBe(true);
  });

  it("aplica apenas os transforms com condição satisfeita", () => {
    const metadata = makeMetadata();
    const transforms: FieldMetadataTransform[] = [
      { _if: () => true, _apply: { hidden: true } },
      { _if: () => false, _apply: { required: true } },
    ];

    fieldTransformMetadata(
      { metadata, instance, fieldIdentifier: "status" },
      transforms,
    );

    expect(metadata.fields.status!.hidden).toBe(true);
    expect(metadata.fields.status!.required).toBe(false);
  });

  it("o segundo transform pode sobrescrever o primeiro", () => {
    const metadata = makeMetadata();
    const transforms: FieldMetadataTransform[] = [
      { _apply: { hidden: true } },
      { _apply: { hidden: false } },
    ];

    fieldTransformMetadata(
      { metadata, instance, fieldIdentifier: "status" },
      transforms,
    );

    expect(metadata.fields.status!.hidden).toBe(false);
  });

  it("array vazio não altera o metadata", () => {
    const metadata = makeMetadata();
    const original = { ...metadata.fields.status! };

    fieldTransformMetadata(
      { metadata, instance, fieldIdentifier: "status" },
      [],
    );

    expect(metadata.fields.status!).toMatchObject(original);
  });
});

// ---- transformMetadata ------------------------------------------------------

describe("transformMetadata", () => {
  it("aplica transform para cada campo", () => {
    const metadata = makeMetadata();
    const metadataTransform: MetadataTransform = {
      status: { _apply: { hidden: true } },
      tipo: { _apply: { required: true } },
    };

    transformMetadata(metadata, instance, metadataTransform);

    expect(metadata.fields.status!.hidden).toBe(true);
    expect(metadata.fields.tipo!.required).toBe(true);
  });

  it("lança erro para os campos do transform que não existem no metadata", () => {
    const metadata = makeMetadata();
    const metadataTransform: MetadataTransform = {
      campoInexistente: { _apply: { hidden: true } },
    };

    expect(() =>
      transformMetadata(metadata, instance, metadataTransform),
    ).toThrow();
  });

  it("não afeta campos sem entrada no metadataTransform", () => {
    const metadata = makeMetadata();
    const metadataTransform: MetadataTransform = {
      status: { _apply: { hidden: true } },
    };

    transformMetadata(metadata, instance, metadataTransform);

    expect(metadata.fields.tipo!.hidden).toBe(false);
  });

  it("aceita array de transforms por campo", () => {
    const metadata = makeMetadata();
    const metadataTransform: MetadataTransform = {
      status: [
        { _apply: { hidden: true } },
        { _if: () => false, _apply: { required: true } },
      ],
    };

    transformMetadata(metadata, instance, metadataTransform);

    expect(metadata.fields.status!.hidden).toBe(true);
    expect(metadata.fields.status!.required).toBe(false);
  });

  it("passa a instância correta para as condições", () => {
    const metadata = makeMetadata();
    const _if = vi.fn(() => true);
    const metadataTransform: MetadataTransform = {
      status: { _if, _apply: { hidden: true } },
    };

    transformMetadata(metadata, instance, metadataTransform);

    expect(_if).toHaveBeenCalledWith(instance.status, instance);
  });
});
