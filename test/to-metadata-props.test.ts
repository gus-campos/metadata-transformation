import { describe, expect, it } from "vitest";
import { toMetadataProps } from "../src/models/slim/slim-metadata-props";

describe("toMetadataProps", () => {
    it("should expand behavior shortcut", () => {
        const result = toMetadataProps({
            behavior: "mandatory",
        });

        expect(result).toEqual({
            hidden: false,
            required: true,
            readOnly: false,
        });
    });

    it("should transform multiplicity number into min/max multiplicity", () => {
        const result = toMetadataProps({
            multiplicity: 3,
        });

        expect(result).toEqual({
            minMultiplicity: 3,
            maxMultiplicity: 3,
        });
    });

    it("should transform multiplicity tuple into range", () => {
        const result = toMetadataProps({
            multiplicity: [1, 5],
        });

        expect(result).toEqual({
            minMultiplicity: 1,
            maxMultiplicity: 5,
        });
    });

    // TESTAR SE MANTEM A MULTIPLICIDADE ANTERIOR QUANDO NULL

    it("should keep null multiplicity values", () => {
        const result = toMetadataProps({
            multiplicity: [0, null],
        });

        expect(result).toEqual({
            minMultiplicity: 0,
            maxMultiplicity: undefined,
        });
    });

    //   it("should transform string mask into array", () => {
    //     const result = toMetadataProps({
    //       mask: "money",
    //     });

    //     expect(result).toEqual({
    //       mask: { _id: "money" },
    //     });
    //   });

    //   it("should convert mask id to mask object", () => {
    //     const result = toMetadataProps({
    //       mask: "ID",
    //     });

    //     expect(result).toEqual({
    //       mask: { _id: "ID" },
    //     });
    //   });

    it("should transform simple named props into localized object", () => {
        const result = toMetadataProps({
            name: "Nome",
            editHelp: "Ajuda",
            placeholder: "Digite aqui",
        });

        expect(result).toEqual({
            name: { pt: "Nome", _current: "Nome" },
            editHelp: { pt: "Ajuda", _current: "Ajuda" },
            placeholder: { pt: "Digite aqui", _current: "Digite aqui" },
        });
    });

    it("should preserve named props already normalized", () => {
        const result = toMetadataProps({
            name: {
                pt: "Nome",
                _current: "Name",
            },
        });

        expect(result).toEqual({
            name: {
                pt: "Nome",
                _current: "Name",
            },
        });
    });

    it("should transform string valueOptions into objects", () => {
        const result = toMetadataProps({
            valueOptions: ["A", "B"],
        });

        expect(result).toEqual({
            valueOptions: [
                {
                    identifier: "A",
                    value: "a",
                },
                {
                    identifier: "B",
                    value: "b",
                },
            ],
        });
    });

    it("should preserve valueOptions objects", () => {
        const result = toMetadataProps({
            valueOptions: [
                {
                    identifier: "x",
                    value: "X",
                },
            ],
        });

        expect(result).toEqual({
            valueOptions: [
                {
                    identifier: "x",
                    value: "X",
                },
            ],
        });
    });

    it("should merge transformed shortcuts with explicit props", () => {
        const result = toMetadataProps({
            behavior: "displayed",
            breakLine: true,
            name: "CPF",
        });

        expect(result).toEqual({
            hidden: false,
            required: false,
            readOnly: true,
            breakLine: true,
            name: {
                pt: "CPF",
                _current: "CPF",
            },
        });
    });

    it("should keep empty valueOptions", () => {
        const result = toMetadataProps({
            valueOptions: [],
        });

        expect(result).toEqual({
            valueOptions: [],
        });
    });

    it("should ignore undefined multiplicity bounds", () => {
        const result = toMetadataProps({
            multiplicity: [null, 5],
        });

        expect(result).toEqual({
            minMultiplicity: undefined,
            maxMultiplicity: 5,
        });
    });

    // [Deprecado]
    // it("should preserve mask object", () => {
    //   const result = toMetadataProps({
    //     mask: { _id: "money" },
    //   });
    // 
    //  expect(result).toEqual({
    //     mask: { _id: "money" },
    //   });
    // });

    it("should preserve unrelated metadata props", () => {
        const result = toMetadataProps({
            size: "md",
            hidden: true,
        });

        expect(result).toEqual({
            size: "md",
            hidden: true,
        });
    });
});
