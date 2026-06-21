import { describe, expect, it } from "vitest";
import { toApply } from "../src/models/slim/slim-apply";

// ===========================================================================
// 1. Entrada como string (MetadataPropTerm único)
// ===========================================================================

describe("toApply — entrada como string (MetadataPropTerm)", () => {
    it("'omitted' expande para { behavior: 'omitted' }", () => {
        const result = toApply("omitted");
        // O comportamento 'omitted' leva hidden:true, required:false, readOnly:false
        expect(result).toMatchObject({
            hidden: true,
            required: false,
            readOnly: false,
        });
    });

    it("'displayed' expande para comportamento displayed", () => {
        const result = toApply("displayed");
        expect(result).toMatchObject({
            hidden: false,
            required: false,
            readOnly: true,
        });
    });

    it("'mandatory' expande para comportamento mandatory", () => {
        const result = toApply("mandatory");
        expect(result).toMatchObject({
            hidden: false,
            required: true,
            readOnly: false,
        });
    });

    it("'editable' expande para comportamento editable", () => {
        const result = toApply("editable");
        expect(result).toMatchObject({
            hidden: false,
            required: false,
            readOnly: false,
        });
    });

    it("'readOnly' expande para { readOnly: true }", () => {
        const result = toApply("readOnly");
        expect(result).toMatchObject({ readOnly: true });
    });

    it("'required' expande para { required: true }", () => {
        const result = toApply("required");
        expect(result).toMatchObject({ required: true });
    });

    it("'hidden' expande para { hidden: true }", () => {
        const result = toApply("hidden");
        expect(result).toMatchObject({ hidden: true });
    });

    it("'breakLine' expande para { breakLine: true }", () => {
        const result = toApply("breakLine");
        expect(result).toMatchObject({ breakLine: true });
    });
});

// ===========================================================================
// 2. Entrada como array de strings (MetadataPropTerm[])
// ===========================================================================

describe("toApply — entrada como array de strings (MetadataPropTerm[])", () => {
    it("['hidden'] retorna { hidden: true }", () => {
        const result = toApply(["hidden"]);
        expect(result).toMatchObject({ hidden: true });
    });

    it("['required', 'readOnly'] mescla ambas as props", () => {
        const result = toApply(["required", "readOnly"]);
        expect(result).toMatchObject({ required: true, readOnly: true });
    });

    it("['hidden', 'breakLine'] mescla ambas as props", () => {
        const result = toApply(["hidden", "breakLine"]);
        expect(result).toMatchObject({ hidden: true, breakLine: true });
    });

    it("['omitted', 'breakLine'] mescla comportamento + breakLine", () => {
        const result = toApply(["omitted", "breakLine"]);
        expect(result).toMatchObject({
            hidden: true,
            required: false,
            readOnly: false,
            breakLine: true,
        });
    });

    it("['mandatory', 'breakLine'] mescla comportamento + breakLine", () => {
        const result = toApply(["mandatory", "breakLine"]);
        expect(result).toMatchObject({
            hidden: false,
            required: true,
            readOnly: false,
            breakLine: true,
        });
    });

    it("array vazio retorna objeto vazio (ou sem props extras)", () => {
        const result = toApply([] as any);
        // Nenhuma prop deve estar definida de forma inesperada
        expect(result).toEqual({});
    });

    it("termos duplicados no array não causam erro e o resultado é idempotente", () => {
        const result = toApply(["hidden", "hidden"]);
        expect(result).toMatchObject({ hidden: true });
    });
});

// ===========================================================================
// 3. Entrada como objeto SlimApplyObject
// ===========================================================================

describe("toApply — entrada como SlimApplyObject (objeto)", () => {
    it("objeto com behavior 'omitted' expande corretamente", () => {
        const result = toApply({ behavior: "omitted" });
        expect(result).toMatchObject({
            hidden: true,
            required: false,
            readOnly: false,
        });
    });

    it("objeto com behavior 'mandatory' expande corretamente", () => {
        const result = toApply({ behavior: "mandatory" });
        expect(result).toMatchObject({
            hidden: false,
            required: true,
            readOnly: false,
        });
    });

    it("objeto sem behavior passa as props diretamente", () => {
        const result = toApply({ hidden: true, required: true });
        expect(result).toMatchObject({ hidden: true, required: true });
    });

    it("objeto com multiplicity numérico define min e max iguais", () => {
        const result = toApply({ multiplicity: 3 });
        expect(result).toMatchObject({
            minMultiplicity: 3,
            maxMultiplicity: 3,
        });
    });

    it("objeto com multiplicity como range [1, 5] define min e max separados", () => {
        const result = toApply({ multiplicity: [1, 5] });
        expect(result).toMatchObject({
            minMultiplicity: 1,
            maxMultiplicity: 5,
        });
    });

    it("objeto com multiplicity [null, 3] define apenas maxMultiplicity", () => {
        const result = toApply({ multiplicity: [null, 3] });
        expect(result).not.toHaveProperty("minMultiplicity");
        expect(result).toMatchObject({ maxMultiplicity: 3 });
    });

    it("objeto com multiplicity [2, null] define apenas minMultiplicity", () => {
        const result = toApply({ multiplicity: [2, null] });
        expect(result).toMatchObject({ minMultiplicity: 2 });
        expect(result).not.toHaveProperty("maxMultiplicity");
    });

    it("objeto com name como string expande para NameProp", () => {
        const result = toApply({ name: "Meu Campo" });
        expect(result).toMatchObject({
            name: { pt: "Meu Campo", _current: "Meu Campo" },
        });
    });

    it("objeto com name como NameProp é preservado", () => {
        const result = toApply({
            name: { pt: "Campo PT", _current: "Campo Atual" },
        });
        expect(result).toMatchObject({
            name: { pt: "Campo PT", _current: "Campo Atual" },
        });
    });

    it("objeto com placeholder como string expande para NameProp", () => {
        const result = toApply({ placeholder: "Digite aqui..." });
        expect(result).toMatchObject({
            placeholder: { pt: "Digite aqui...", _current: "Digite aqui..." },
        });
    });

    it("objeto com editHelp como string expande para NameProp", () => {
        const result = toApply({ editHelp: "Informe o valor" });
        expect(result).toMatchObject({
            editHelp: { pt: "Informe o valor", _current: "Informe o valor" },
        });
    });

    it("objeto com valueOptions como strings expande para Option[]", () => {
        const result = toApply({ valueOptions: ["Ativo", "Inativo"] });
        expect(result).toMatchObject({
            valueOptions: [
                { identifier: "Ativo", value: "ativo" },
                { identifier: "Inativo", value: "inativo" },
            ],
        });
    });

    it("objeto com valueOptions como Option[] é preservado", () => {
        const options = [
            { identifier: "opt1", value: "valor_1" },
            { identifier: "opt2", value: "valor_2" },
        ];
        const result = toApply({ valueOptions: options });
        expect(result).toMatchObject({ valueOptions: options });
    });

    it("objeto com valueOptions misto (strings e Options)", () => {
        const result = toApply({
            valueOptions: [
                "Opção A",
                { identifier: "opt_b", value: "opcao_b" },
            ],
        });
        expect(result).toMatchObject({
            valueOptions: [
                { identifier: "Opção A", value: "opção_a" },
                { identifier: "opt_b", value: "opcao_b" },
            ],
        });
    });

    it("objeto com size é passado diretamente", () => {
        const result = toApply({ size: "md" });
        expect(result).toMatchObject({ size: "md" });
    });

    it("objeto vazio retorna objeto de props vazio", () => {
        const result = toApply({});
        expect(result).toEqual({});
    });

    it("objeto com behavior + props adicionais (breakLine, readOnly)", () => {
        const result = toApply({ behavior: "editable", breakLine: true });
        expect(result).toMatchObject({
            hidden: false,
            required: false,
            readOnly: false,
            breakLine: true,
        });
    });

    it("objeto com behavior + multiplicity + name", () => {
        const result = toApply({
            behavior: "mandatory",
            multiplicity: [1, 3],
            name: "Campo Teste",
        });
        expect(result).toMatchObject({
            hidden: false,
            required: true,
            readOnly: false,
            minMultiplicity: 1,
            maxMultiplicity: 3,
            name: { pt: "Campo Teste", _current: "Campo Teste" },
        });
    });
});

// ===========================================================================
// 4. Casos de borda e prioridade de merging
// ===========================================================================

describe("toApply — casos de borda", () => {
    it("string 'omitted' não inclui props não relacionadas", () => {
        const result = toApply("omitted");
        expect(result).not.toHaveProperty("breakLine");
        expect(result).not.toHaveProperty("size");
        expect(result).not.toHaveProperty("multiplicity");
    });

    it("objeto sem multiplicity não inclui minMultiplicity nem maxMultiplicity", () => {
        const result = toApply({ hidden: true });
        expect(result).not.toHaveProperty("minMultiplicity");
        expect(result).not.toHaveProperty("maxMultiplicity");
    });

    it("objeto sem name não inclui a prop name", () => {
        const result = toApply({ required: true });
        expect(result).not.toHaveProperty("name");
    });

    it("valueOptions com string com espaços normaliza o value corretamente", () => {
        const result = toApply({ valueOptions: ["Valor Com Espaços"] });
        expect((result as any).valueOptions[0].value).toBe("valor_com_espaços");
    });

    it("valueOptions com string vazia", () => {
        const result = toApply({ valueOptions: [""] });
        expect((result as any).valueOptions[0]).toMatchObject({
            identifier: "",
            value: "",
        });
    });

    it("array com um único termo funciona igual à string direta", () => {
        const fromString = toApply("hidden");
        const fromArray = toApply(["hidden"]);
        expect(fromString).toEqual(fromArray);
    });

    it("objeto com query é passado diretamente", () => {
        const query = { status: "active" };
        const result = toApply({ query });
        expect(result).toMatchObject({ query });
    });
});
