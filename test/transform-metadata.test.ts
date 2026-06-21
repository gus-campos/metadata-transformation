import { describe, it, expect, vi } from "vitest";
import {
    transformMetadataField,
    transformMetadata,
    transformMetadataByRule,
} from "../src/processing/transform-metadata";
import {
    FieldMetadataTransform,
    FieldsMetadataTransform,
    MetadataProps,
} from "../src/models/pure/metadata-transform";
import { InstanceObject, Metadata } from "../src/models/pure/common";

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
                breakLine: false,
                valueOptions: [],
                query: {},
                minMultiplicity: 0,
                maxMultiplicity: 10,
                editHelp: { pt: "editHelpPt", _current: "editHelpCurrent" },
                name: { pt: "namePt", _current: "nameCurrent" },
                placeholder: {
                    pt: "placeholderPt",
                    _current: "placeholderCurent",
                },
                mask: { _id: "ID_MASK" },
                ...overrides["campo1"],
            },
            tipo: {
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
                placeholder: {
                    pt: "placeholderPt",
                    _current: "placeholderCurent",
                },
                mask: { _id: "ID_MASK" },
                ...overrides["campo1"],
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

        transformMetadataField(
            { metadata, instance, fieldIdentifier: "status" },
            transform,
        );

        expect(metadata.fields.status!.hidden).toBe(true);
    });

    it("não faz nada quando não há _apply", () => {
        const metadata = makeMetadata();
        const original = { ...metadata.fields.status! };
        const transform: FieldMetadataTransform = {
            _match: { status: { _anyOf: ["ativo"] } },
        };

        transformMetadataField(
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

        transformMetadataField(
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

        transformMetadataField(
            { metadata, instance, fieldIdentifier: "status" },
            transform,
        );

        expect(metadata.fields.status!.required).toBe(false);
    });

    it("passa a instância correta pro _if", () => {
        const metadata = makeMetadata();
        const _if = vi.fn(() => true);
        const transform: FieldMetadataTransform = {
            _if,
            _apply: { hidden: true },
        };

        transformMetadataField(
            { metadata, instance, fieldIdentifier: "status" },
            transform,
        );

        expect(_if).toHaveBeenCalledWith({
            obj: instance,
            value: instance.status,
        });
    });
});

// ---- fieldTransformMetadata — _match _anyOf ----------------------------------

describe("fieldTransformMetadata — _match _anyOf", () => {
    it("aplica quando _match _anyOf satisfeito", () => {
        const metadata = makeMetadata();
        const transform: FieldMetadataTransform = {
            _match: { status: { _anyOf: ["ativo"] } },
            _apply: { readOnly: true },
        };

        transformMetadataField(
            { metadata, instance, fieldIdentifier: "status" },
            transform,
        );

        expect(metadata.fields.status!.readOnly).toBe(true);
    });

    it("não aplica quando _match _anyOf não satisfeito", () => {
        const metadata = makeMetadata();
        const transform: FieldMetadataTransform = {
            _match: { status: { _anyOf: ["inativo"] } },
            _apply: { readOnly: true },
        };

        transformMetadataField(
            { metadata, instance, fieldIdentifier: "status" },
            transform,
        );

        expect(metadata.fields.status!.readOnly).toBe(false);
    });
});

// ---- fieldTransformMetadata — _match _allOf ----------------------------------

describe("fieldTransformMetadata — _match _allOf", () => {
    it("aplica quando _match _allOf satisfeito", () => {
        const metadata = makeMetadata();
        const transform: FieldMetadataTransform = {
            _match: { status: { _allOf: ["ativo"] } },
            _apply: { readOnly: true },
        };

        transformMetadataField(
            { metadata, instance, fieldIdentifier: "status" },
            transform,
        );

        expect(metadata.fields.status!.readOnly).toBe(true);
    });

    it("não aplica quando algum critério do _allOf não é satisfeito", () => {
        const metadata = makeMetadata();
        const transform: FieldMetadataTransform = {
            _match: { status: { _allOf: ["ativo", "inativo"] } },
            _apply: { readOnly: true },
        };

        transformMetadataField(
            { metadata, instance, fieldIdentifier: "status" },
            transform,
        );

        expect(metadata.fields.status!.readOnly).toBe(false);
    });

    it("não aplica quando nenhum critério do _allOf é satisfeito", () => {
        const metadata = makeMetadata();
        const transform: FieldMetadataTransform = {
            _match: { status: { _allOf: ["inativo", "pendente"] } },
            _apply: { readOnly: true },
        };

        transformMetadataField(
            { metadata, instance, fieldIdentifier: "status" },
            transform,
        );

        expect(metadata.fields.status!.readOnly).toBe(false);
    });
});

// ---- fieldTransformMetadata — _if + _match _anyOf ----------------------------

describe("fieldTransformMetadata — _if + _match _anyOf", () => {
    it("aplica quando ambos são verdadeiros", () => {
        const metadata = makeMetadata();
        const transform: FieldMetadataTransform = {
            _if: ({ obj }) => obj.tipo === "admin",
            _match: { status: { _anyOf: ["ativo"] } },
            _apply: { hidden: true },
        };

        transformMetadataField(
            { metadata, instance, fieldIdentifier: "status" },
            transform,
        );

        expect(metadata.fields.status!.hidden).toBe(true);
    });

    it("não aplica quando _if false e _match _anyOf true", () => {
        const metadata = makeMetadata();
        const transform: FieldMetadataTransform = {
            _if: () => false,
            _match: { status: { _anyOf: ["ativo"] } },
            _apply: { hidden: true },
        };

        transformMetadataField(
            { metadata, instance, fieldIdentifier: "status" },
            transform,
        );

        expect(metadata.fields.status!.hidden).toBe(false);
    });

    it("não aplica quando _if true e _match _anyOf false", () => {
        const metadata = makeMetadata();
        const transform: FieldMetadataTransform = {
            _if: () => true,
            _match: { status: { _anyOf: ["inativo"] } },
            _apply: { hidden: true },
        };

        transformMetadataField(
            { metadata, instance, fieldIdentifier: "status" },
            transform,
        );

        expect(metadata.fields.status!.hidden).toBe(false);
    });
});

// ---- fieldTransformMetadata — _if + _match _allOf ----------------------------

describe("fieldTransformMetadata — _if + _match _allOf", () => {
    it("aplica quando _if true e _match _allOf satisfeito", () => {
        const metadata = makeMetadata();
        const transform: FieldMetadataTransform = {
            _if: () => true,
            _match: { status: { _allOf: ["ativo"] } },
            _apply: { hidden: true },
        };

        transformMetadataField(
            { metadata, instance, fieldIdentifier: "status" },
            transform,
        );

        expect(metadata.fields.status!.hidden).toBe(true);
    });

    it("não aplica quando _if false e _match _allOf satisfeito", () => {
        const metadata = makeMetadata();
        const transform: FieldMetadataTransform = {
            _if: () => false,
            _match: { status: { _allOf: ["ativo"] } },
            _apply: { hidden: true },
        };

        transformMetadataField(
            { metadata, instance, fieldIdentifier: "status" },
            transform,
        );

        expect(metadata.fields.status!.hidden).toBe(false);
    });

    it("não aplica quando _if true e _match _allOf não satisfeito", () => {
        const metadata = makeMetadata();
        const transform: FieldMetadataTransform = {
            _if: () => true,
            _match: { status: { _allOf: ["inativo"] } },
            _apply: { hidden: true },
        };

        transformMetadataField(
            { metadata, instance, fieldIdentifier: "status" },
            transform,
        );

        expect(metadata.fields.status!.hidden).toBe(false);
    });
});

// ---- fieldTransformMetadata — array de transforms ---------------------------

describe("fieldTransformMetadata — array de transforms", () => {
    it("aplica todos os transforms em ordem", () => {
        const metadata = makeMetadata();
        const transforms: FieldMetadataTransform[] = [
            { _apply: { hidden: true } },
            { _apply: { required: true } },
        ];

        transforms.forEach((transform) =>
            transformMetadataField(
                { metadata, instance, fieldIdentifier: "status" },
                transform,
            ),
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

        transforms.forEach((transform) =>
            transformMetadataField(
                { metadata, instance, fieldIdentifier: "status" },
                transform,
            ),
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

        transforms.forEach((transform) =>
            transformMetadataField(
                { metadata, instance, fieldIdentifier: "status" },
                transform,
            ),
        );

        expect(metadata.fields.status!.hidden).toBe(false);
    });

    //   it("array vazio não altera o metadata", () => {
    //     const metadata = makeMetadata();
    //     const original = { ...metadata.fields.status! };

    //     transformMetadataField(
    //       { metadata, instance, fieldIdentifier: "status" },
    //       [],
    //     );

    //     expect(metadata.fields.status!).toMatchObject(original);
    //   });
});

// ---- transformMetadata ------------------------------------------------------

describe("transformMetadata", () => {
    it("aplica transform para cada campo", () => {
        const metadata = makeMetadata();
        const metadataTransform: FieldsMetadataTransform = {
            status: [{ _apply: { hidden: true } }],
            tipo: [{ _apply: { required: true } }],
        };

        transformMetadata(metadata, instance, metadataTransform);

        expect(metadata.fields.status!.hidden).toBe(true);
        expect(metadata.fields.tipo!.required).toBe(true);
    });

    it("lança erro para os campos do transform que não existem no metadata", () => {
        const metadata = makeMetadata();
        const metadataTransform: FieldsMetadataTransform = {
            campoInexistente: [{ _apply: { hidden: true } }],
        };

        expect(() =>
            transformMetadata(metadata, instance, metadataTransform),
        ).toThrow();
    });

    it("não afeta campos sem entrada no metadataTransform", () => {
        const metadata = makeMetadata();
        const metadataTransform: FieldsMetadataTransform = {
            status: [{ _apply: { hidden: true } }],
        };

        transformMetadata(metadata, instance, metadataTransform);

        expect(metadata.fields.tipo!.hidden).toBe(false);
    });

    it("aceita array de transforms por campo", () => {
        const metadata = makeMetadata();
        const metadataTransform: FieldsMetadataTransform = {
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
        const metadataTransform: FieldsMetadataTransform = {
            status: [{ _if, _apply: { hidden: true } }],
        };

        transformMetadata(metadata, instance, metadataTransform);

        expect(_if).toHaveBeenCalledWith({
            obj: instance,
            value: instance.status,
        });
    });
});