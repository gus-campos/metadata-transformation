import { describe, it, expect } from "vitest";
import { accessPathInObject } from "../src/utils/path-access";
import { InstanceObject } from "../src/models/pure/common";

// ---------------------------------------------------------------------------
// Helpers / fixtures
// ---------------------------------------------------------------------------

const flat: InstanceObject = {
    name: "Pedro",
    age: 30,
    active: true,
    score: null as null,
};

const nested: InstanceObject = {
    data: {
        person: {
            name: {
                firstName: "Pedro",
                lastName: "Souza",
            },
            age: 25,
        },
    },
};

const withArray: InstanceObject = {
    tags: ["alpha", "beta"],
    items: [
        { id: "1", label: "A" },
        { id: "2", label: "B" },
        { id: "3", label: "C" },
    ],
};

const deepWithArray: InstanceObject = {
    team: {
        members: [
            { name: "Alice", role: "dev" },
            { name: "Bob", role: "design" },
        ],
    },
};

const arrayWithNestedArrays: InstanceObject = {
    groups: [
        { members: [{ name: "Alice" }, { name: "Bob" }] },
        { members: [{ name: "Charlie" }, { name: "Dave" }] },
    ],
};

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

describe("accessPathInObject", () => {
    // -------------------------------------------------------------------------
    // Caminho simples (sem aninhamento)
    // -------------------------------------------------------------------------

    describe("caminho simples (um nível)", () => {
        it("retorna um valor string no nível raiz", () => {
            expect(accessPathInObject(flat, "name")).toBe("Pedro");
        });

        it("retorna um valor numérico no nível raiz", () => {
            expect(accessPathInObject(flat, "age")).toBe(30);
        });

        it("retorna um valor booleano no nível raiz", () => {
            expect(accessPathInObject(flat, "active")).toBe(true);
        });

        it("retorna null quando o valor da chave é null", () => {
            expect(accessPathInObject(flat, "score")).toBeNull();
        });

        it("retorna undefined para chave inexistente", () => {
            expect(accessPathInObject(flat, "email")).toBeUndefined();
        });
    });

    // -------------------------------------------------------------------------
    // Caminho aninhado (múltiplos níveis)
    // -------------------------------------------------------------------------

    describe("caminho aninhado (múltiplos níveis)", () => {
        it("acessa dois níveis de profundidade", () => {
            expect(accessPathInObject(nested, "data.person")).toEqual({
                name: { firstName: "Pedro", lastName: "Souza" },
                age: 25,
            });
        });

        it("acessa quatro níveis de profundidade", () => {
            expect(
                accessPathInObject(nested, "data.person.name.firstName"),
            ).toBe("Pedro");
        });

        it("acessa outro valor em caminho de quatro níveis", () => {
            expect(
                accessPathInObject(nested, "data.person.name.lastName"),
            ).toBe("Souza");
        });

        it("retorna undefined quando parte do caminho não existe", () => {
            expect(
                accessPathInObject(nested, "data.person.address.street"),
            ).toBeUndefined();
        });

        it("retorna undefined quando o caminho cruza um valor primitivo", () => {
            // "age" é número; não é possível seguir o caminho depois dele
            expect(
                accessPathInObject(nested, "data.person.age.something"),
            ).toBeUndefined();
        });
    });

    // -------------------------------------------------------------------------
    // Objetos com arrays diretos como valor
    // -------------------------------------------------------------------------

    describe("acesso quando a chave retorna um array de primitivos", () => {
        it("retorna o array inteiro de primitivos", () => {
            expect(accessPathInObject(withArray, "tags")).toEqual([
                "alpha",
                "beta",
            ]);
        });
    });

    describe("acesso quando a chave aponta para um array de objetos", () => {
        it("retorna o array de objetos", () => {
            expect(accessPathInObject(withArray, "items")).toEqual([
                { id: "1", label: "A" },
                { id: "2", label: "B" },
                { id: "3", label: "C" },
            ]);
        });

        it("mapeia uma chave em todos os elementos do array", () => {
            // "items" é um array de objetos; acessar "items.id" deve coletar
            // o valor de "id" em cada elemento.
            expect(accessPathInObject(withArray, "items.id")).toEqual([
                "1",
                "2",
                "3",
            ]);
        });

        it("mapeia outra chave em todos os elementos do array", () => {
            expect(accessPathInObject(withArray, "items.label")).toEqual([
                "A",
                "B",
                "C",
            ]);
        });

        it("retorna apenas os elementos que possuem a chave (filtra undefined)", () => {
            const obj: InstanceObject = {
                items: [
                    { id: "1", label: "A" },
                    { id: "2" }, // sem "label"
                    { id: "3", label: "C" },
                ],
            };
            expect(accessPathInObject(obj, "items.label")).toEqual(["A", "C"]);
        });
    });

    // -------------------------------------------------------------------------
    // Array aninhado em caminho profundo
    // -------------------------------------------------------------------------

    describe("array em caminho aninhado", () => {
        it("acessa array em dois níveis e mapeia chave dentro do array", () => {
            expect(
                accessPathInObject(deepWithArray, "team.members.name"),
            ).toEqual(["Alice", "Bob"]);
        });

        it("acessa array em dois níveis e mapeia outra chave", () => {
            expect(
                accessPathInObject(deepWithArray, "team.members.role"),
            ).toEqual(["dev", "design"]);
        });
    });

    // -------------------------------------------------------------------------
    // Array de arrays (flatten)
    // -------------------------------------------------------------------------

    describe("flatten de array de objetos que contêm arrays", () => {
        it("achata os resultados quando cada elemento contém um sub-array de objetos", () => {
            // "groups" → array de objetos; cada objeto tem "members" → array de objetos
            // O resultado final deve ser o flatten dos membros de todos os grupos
            const result = accessPathInObject(
                arrayWithNestedArrays,
                "groups.members",
            );
            expect(result).toEqual([
                { name: "Alice" },
                { name: "Bob" },
                { name: "Charlie" },
                { name: "Dave" },
            ]);
        });

        it("achata e mapeia chave primitiva em array aninhado de objetos", () => {
            const result = accessPathInObject(
                arrayWithNestedArrays,
                "groups.members.name",
            );
            expect(result).toEqual(["Alice", "Bob", "Charlie", "Dave"]);
        });
    });

    // -------------------------------------------------------------------------
    // Casos extremos (edge cases)
    // -------------------------------------------------------------------------

    describe("edge cases", () => {
        it("retorna undefined para string de caminho vazia", () => {
            // path.split(".") => [""] → firstKey = "" → falsy → retorna undefined
            expect(accessPathInObject(flat, "")).toBeUndefined();
        });

        it("retorna o objeto raiz quando o path tem um único segmento que corresponde a um sub-objeto", () => {
            const obj = { meta: { version: 1 } };
            expect(accessPathInObject(obj, "meta")).toEqual({ version: 1 });
        });

        it("retorna undefined em objeto vazio", () => {
            expect(accessPathInObject({}, "any.path")).toBeUndefined();
        });

        it("lida com valores de array vazio", () => {
            const obj = { items: [] as never[] };
            expect(accessPathInObject(obj, "items.id")).toEqual([]);
        });

        it("retorna undefined quando caminho cruza array de primitivos", () => {
            // "tags" é string[], não InstanceObject[]; não é possível seguir
            // o caminho além dele para uma chave adicional.
            // A função retorna undefined (isPlainObject falha para string).
            const result = accessPathInObject(withArray, "tags.length");
            expect(result).toBeUndefined();
        });

        it("não confunde chave com ponto literal no nome", () => {
            // Chaves com ponto no nome não são suportadas pelo split(".")
            // — este teste documenta o comportamento atual (não encontra).
            const obj = { "a.b": "value" } as Record<string, string>;
            expect(accessPathInObject(obj, "a.b")).toBeUndefined();
        });
    });
});
