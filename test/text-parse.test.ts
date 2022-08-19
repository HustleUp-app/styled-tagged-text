import { createLexer } from "../src/lexer/lexer";
import { parseV2 } from "../src/parser/parser-v2";
const toAst = (input: string) => parseV2(createLexer(input).tokenize(), { parseUnspecifiedTags: true });

describe("Inline styled text parse test", () => {
	test("Nested Tags", () => {
		const input = "Normal [b]Bold[/b] [i][b]Bold Italic[/b] Italic[/i]";
		const ast = toAst(input);
		const output = [
			"Normal ",
			{ tag: "b", content: "Bold" },
			" ",
			{ tag: "i", content: [{ tag: "b", content: "Bold Italic" }, " Italic"] },
		];
		expect(ast).toEqual(output);
	});

	test("Begin with unclosed Tag", () => {
		const input = "[b]Normal Bold";
		const ast = toAst(input);
		const output = ["[b]Normal Bold"];
		expect(ast).toEqual(output);
	});

	test("Ending with unclosed Tag", () => {
		const input = "Normal Bold[b]";
		const ast = toAst(input);
		const output = ["Normal Bold[b]"];
		expect(ast).toEqual(output);
	});

	test("unclosed Tag", () => {
		const input = "Normal [b]Bold";
		const ast = toAst(input);
		const output = ["Normal [b]Bold"];
		expect(ast).toEqual(output);
	});

	test("Not opened Tag", () => {
		const input = "Foo[/b], [emph]Emphasize[/emph][/bar]";
		const ast = toAst(input);
		const output = ["Foo[/b], ", { tag: "emph", content: "Emphasize" }, "[/bar]"];
		expect(ast).toEqual(output);
	});

	test("Begin with closing Tag", () => {
		const input = "[/b]Normal Bold";
		const ast = toAst(input);
		const output = ["[/b]Normal Bold"];
		expect(ast).toEqual(output);
	});

	test("Ending with single closing Tag", () => {
		const input = "Normal Bold[/b]";
		const ast = toAst(input);
		const output = ["Normal Bold[/b]"];
		expect(ast).toEqual(output);
	});

	test("single closing Tag", () => {
		const input = "Normal [/b]Bold";
		const ast = toAst(input);
		const output = ["Normal [/b]Bold"];
		expect(ast).toEqual(output);
	});

	test("Starting with multiple tags", () => {
		const input = "[c][b]Foo [a]Bar[/a][/b][/c]";
		const ast = toAst(input);
		const output = [{ tag: "c", content: { tag: "b", content: ["Foo ", { tag: "a", content: "Bar" }] } }];
		expect(ast).toEqual(output);
	});

	test("Complex nested tag", () => {
		const input = "[b]Foo [a]Bar[/a] [c][a]Baz[/a][/c][/b]";
		const ast = toAst(input);
		const output = [
			{
				tag: "b",
				content: ["Foo ", { tag: "a", content: "Bar" }, " ", { tag: "c", content: { tag: "a", content: "Baz" } }],
			},
		];
		expect(ast).toEqual(output);
	});
});
