/**
 * @file Low level systems programming language.
 * @author Lucas Ross
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC_ASSIGN = 1;
const PREC_COMP = 2;
const PREC_ADD = 3;
const PREC_MUL = 4;
const PREC_UNARY = 5;
const PREC_CALL = 6;

module.exports = grammar({
  name: "yal",

  rules: {
    source_file: ($) => seq($.package_decl, repeat($._top_level_decl)),

    package_decl: ($) => seq("package", field("name", $.id)),
    _top_level_decl: ($) => choice($.func_decl, $.var_decl, $.def_decl),

    // decls

    func_decl: ($) =>
      seq(
        "func",
        field("name", $.func_id),
        optional($.func_gargs),
        $.func_args,
        field("ret", optional($._expr)),
        $.block,
      ),

    func_id: ($) => seq($.id, repeat(seq(".", $.id))),
    func_gargs: ($) => seq("[", sepBy(",", $.func_gargs_item), "]"),
    func_gargs_item: ($) =>
      seq(
        field("name", $.id),
        field("constraint", optional(seq(":", $._expr))),
      ),
    func_args: ($) => seq("(", sepBy(",", $.func_args_item), ")"),
    func_args_item: ($) =>
      seq(field("name", $.id), ":", field("type", $._expr)),

    var_decl: ($) =>
      seq(
        "var",
        field("name", $.id_pack),
        choice(
          seq(":", $.expr_pack, optional(seq("=", $.expr_pack)), ";"),
          seq("=", $.expr_pack, ";"),
        ),
      ),

    def_decl: ($) =>
      seq(
        "def",
        field("name", $.id_pack),
        seq(optional(seq(":", $._expr)), "=", $.expr_pack, ";"),
      ),

    id_pack: ($) => sepBy1(",", $.id),
    expr_pack: ($) => sepBy1(",", $._expr),

    // statements

    _stmt: ($) =>
      choice(
        $.block,
        $.expr_stmt,
        $.return_stmt,
        $.if_stmt,
        $.while_stmt,
        $.defer_stmt,
        $.var_decl,
        $.def_decl,
        $.assign,
      ),

    block: ($) => seq("{", repeat($._stmt), "}"),
    expr_stmt: ($) => seq($._expr, ";"),
    return_stmt: ($) => seq("return", optional($._expr), ";"),
    if_stmt: ($) =>
      seq(
        "if",
        field("cond", $._expr),
        $.block,
        optional(seq("else", choice($.block, $.if_stmt))),
      ),
    while_stmt: ($) =>
      seq(
        "while",
        choice(
          seq(field("cond", $._expr), $.block),
          seq($.var_decl, field("cond", $._expr), $.block),
        ),
      ),
    defer_stmt: ($) => seq("defer", $._stmt),
    assign: ($) => prec.left(PREC_ASSIGN, seq($._expr, "=", $._expr, ";")),

    // type expressions

    struct: ($) => seq("struct", $.struct_body),
    struct_body: ($) => seq("{", sepBy(",", $.struct_field), "}"),
    struct_field: ($) =>
      seq(
        field("name", $.id),
        ":",
        field("type", $._expr),
        field("init", optional(seq("=", $._expr))),
      ),

    ptr: ($) => prec.left(PREC_UNARY, seq(choice("*", "?"), $._expr)),

    // expressions

    _expr: ($) =>
      choice(
        $.comp,
        $.add,
        $.mul,
        $.field,
        $.call,
        $.struct,
        $.ptr,
        $.id,
        $.int,
        $.lit,
        $.string,
        $.character,
      ),

    lit: ($) => seq(".{", sepBy(",", $.lit_item), "}"),
    lit_item: ($) => choice(seq(".", $.id, "=", $._expr)),

    call: ($) =>
      prec.left(PREC_CALL, seq(field("callee", $._expr), $.call_args)),
    call_args: ($) => seq("(", sepBy(",", $._expr), ")"),

    field: ($) => prec.left(PREC_CALL, seq($._expr, ".", field("name", $.id))),
    comp: ($) =>
      prec.left(PREC_COMP, seq($._expr, choice("==", "!="), $._expr)),
    mul: ($) =>
      prec.left(PREC_MUL, seq($._expr, choice("*", "/", "%"), $._expr)),
    add: ($) => prec.left(PREC_ADD, seq($._expr, choice("+", "-"), $._expr)),

    // literals

    string: ($) => choice($._string_literal /*, $._raw_string_literal */),
    _string_literal: ($) =>
      seq('"', repeat(choice($.string_content, $.escape_sequence)), '"'),
    string_content: (_) => token.immediate(prec(1, /[^"\\]+/)),

    // _raw_string_literal: ($) =>
    //   seq("`", repeat(alias($._raw_string_content, $.string_content)), "`"),

    character: ($) => seq("'", choice(/[^'\\]/, $.escape_sequence), "'"),

    escape_sequence: (_) =>
      token.immediate(
        seq(
          "\\",
          choice(
            /[^xu0-7]/,
            /[0-7]{1,3}/,
            /x[0-9a-fA-F]{2}/,
            /u[0-9a-fA-F]{4}/,
            /u\{[0-9a-fA-F]+\}/,
            /U[0-9a-fA-F]{8}/,
          ),
        ),
      ),

    id: (_) => /[a-zA-Z_][a-zA-Z_0-9]*/,
    int: (_) => /[0-9][xob]?[0-9_]*/,
  },
});

/**
 * Creates a rule to match one or more of the rules separated by the separator.
 *
 * @param {RuleOrLiteral} sep - The separator to use.
 * @param {RuleOrLiteral} rule
 *
 * @returns {SeqRule}
 */
function sepBy1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)), optional(sep));
}

/**
 * Creates a rule to optionally match one or more of the rules separated by the separator.
 *
 * @param {RuleOrLiteral} sep - The separator to use.
 * @param {RuleOrLiteral} rule
 *
 * @returns {ChoiceRule}
 */
function sepBy(sep, rule) {
  return optional(sepBy1(sep, rule));
}
