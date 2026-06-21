// to-metadata-transform.spec.ts

import { describe, expect, it } from "vitest";
import { toFieldsMetadataTransform } from "../src/models/slim/slim-metadata-transform";

describe("toFieldsMetadataTransform", () => {
    it("should normalize single transform into array", () => {
        const result = toFieldsMetadataTransform({
            fieldName: {
                _apply: "mandatory",
            },
        });

        expect(result).toEqual({
            fieldName: [
                {
                    _apply: {
                        hidden: false,
                        required: true,
                        readOnly: false,
                    },
                },
            ],
        });
    });

    it("should preserve array transforms", () => {
        const result = toFieldsMetadataTransform({
            age: [
                {
                    _apply: "required",
                },
                {
                    _apply: "readOnly",
                },
            ],
        });

        expect(result).toEqual({
            age: [
                {
                    _apply: {
                        required: true,
                    },
                },
                {
                    _apply: {
                        readOnly: true,
                    },
                },
            ],
        });
    });

    it("should transform nested metadata props inside apply", () => {
        const result = toFieldsMetadataTransform({
            cpf: {
                _apply: {
                    behavior: "displayed",
                    placeholder: "CPF",
                },
            },
        });

        expect(result).toEqual({
            cpf: [
                {
                    _apply: {
                        hidden: false,
                        required: false,
                        readOnly: true,
                        placeholder: {
                            pt: "CPF",
                            _current: "CPF",
                        },
                    },
                },
            ],
        });
    });

    it("should preserve existing transform properties", () => {
        const result = toFieldsMetadataTransform({
            status: {
                _match: {
                    field: { _anyOf: ["ACTIVE"] },
                },
                _apply: "editable",
            },
        });

        expect(result).toEqual({
            status: [
                {
                    _match: {
                        field: { _anyOf: ["ACTIVE"] },
                    },
                    _apply: {
                        hidden: false,
                        required: false,
                        readOnly: false,
                    },
                },
            ],
        });
    });

    it("should resolve named condition into __conditionsMatches", () => {
        const result = toFieldsMetadataTransform({
            _conditions: {
                isActive: { status: { _anyOf: ["ACTIVE"] } },
            },
            fieldName: {
                _condition: "isActive",
                _apply: "mandatory",
            },
        });

        expect(result).toEqual({
            fieldName: [
                {
                    _apply: {
                        hidden: false,
                        required: true,
                        readOnly: false,
                    },
                    __conditionsMatches: [{ status: { _anyOf: ["ACTIVE"] } }],
                },
            ],
        });
    });

    it("should resolve multiple named conditions into __conditionsMatches", () => {
        const result = toFieldsMetadataTransform({
            _conditions: {
                isActive: { status: { _anyOf: ["ACTIVE"] } },
                isAdmin: { role: { _anyOf: ["ADMIN"] } },
            },
            fieldName: {
                _condition: ["isActive", "isAdmin"],
                _apply: "mandatory",
            },
        });

        expect(result).toEqual({
            fieldName: [
                {
                    _apply: {
                        hidden: false,
                        required: true,
                        readOnly: false,
                    },
                    __conditionsMatches: [
                        { status: { _anyOf: ["ACTIVE"] } },
                        { role: { _anyOf: ["ADMIN"] } },
                    ],
                },
            ],
        });
    });

    it("should throw if condition fieldName is referenced but _conditions is not defined", () => {
        expect(() =>
            toFieldsMetadataTransform({
                fieldName: {
                    _condition: "isActive",
                    _apply: "mandatory",
                },
            }),
        ).toThrow("Não foi definida nenhuma condição");
    });

    it("should throw if condition fieldName is not defined in _conditions", () => {
        expect(() =>
            toFieldsMetadataTransform({
                _conditions: {
                    isActive: { status: { _anyOf: ["ACTIVE"] } },
                },
                fieldName: {
                    _condition: "isAdmin",
                    _apply: "mandatory",
                },
            }),
        ).toThrow("As seguintes condições não foram definidas: isAdmin");
    });

    it("should not include __conditionsMatches if no _condition specified", () => {
        const result = toFieldsMetadataTransform({
            _conditions: {
                isActive: { status: { _anyOf: ["ACTIVE"] } },
            },
            fieldName: {
                _apply: "mandatory",
            },
        });

        expect(result).toEqual({
            fieldName: [
                {
                    _apply: {
                        hidden: false,
                        required: true,
                        readOnly: false,
                    },
                },
            ],
        });
    });

    it("should preserve _if in transform", () => {
        const ifFn = () => true;

        const result = toFieldsMetadataTransform({
            fieldName: {
                _if: ifFn,
                _apply: "mandatory",
            },
        });

        expect(result).toEqual({
            fieldName: [
                {
                    _if: ifFn,
                    _apply: {
                        hidden: false,
                        required: true,
                        readOnly: false,
                    },
                },
            ],
        });
    });

    it("should resolve condition in array of transforms", () => {
        const result = toFieldsMetadataTransform({
            _conditions: {
                isActive: { status: { _anyOf: ["ACTIVE"] } },
            },
            fieldName: [
                {
                    _condition: "isActive",
                    _apply: "mandatory",
                },
                {
                    _apply: "readOnly",
                },
            ],
        });

        expect(result).toEqual({
            fieldName: [
                {
                    _apply: {
                        hidden: false,
                        required: true,
                        readOnly: false,
                    },
                    __conditionsMatches: [{ status: { _anyOf: ["ACTIVE"] } }],
                },
                {
                    _apply: {
                        readOnly: true,
                    },
                },
            ],
        });
    });

    it("should transform multiple fields independently", () => {
        const result = toFieldsMetadataTransform({
            fieldName: {
                _apply: "mandatory",
            },
            age: {
                _apply: "readOnly",
            },
        });

        expect(result).toEqual({
            fieldName: [
                {
                    _apply: {
                        hidden: false,
                        required: true,
                        readOnly: false,
                    },
                },
            ],
            age: [
                {
                    _apply: {
                        readOnly: true,
                    },
                },
            ],
        });
    });

    it("should ignore _conditions if no field references it", () => {
        const result = toFieldsMetadataTransform({
            _conditions: {
                isActive: { status: { _anyOf: ["ACTIVE"] } },
            },
            fieldName: {
                _apply: "mandatory",
            },
        });

        expect(result).toEqual({
            fieldName: [
                {
                    _apply: {
                        hidden: false,
                        required: true,
                        readOnly: false,
                    },
                },
            ],
        });
    });

    it("should use fieldIdentifier for implicit match conversion", () => {
        const result = toFieldsMetadataTransform({
            status: {
                _match: "ACTIVE",
            },
        });

        expect(result).toEqual({
            status: [
                {
                    _match: {
                        status: { _anyOf: ["ACTIVE"] },
                    },
                },
            ],
        });
    });

    it("should use fieldIdentifier for implicit match array conversion", () => {
        const result = toFieldsMetadataTransform({
            status: {
                _match: ["ACTIVE", "PENDING"],
            },
        });

        expect(result).toEqual({
            status: [
                {
                    _match: {
                        status: { _anyOf: ["ACTIVE", "PENDING"] },
                    },
                },
            ],
        });
    });
});
