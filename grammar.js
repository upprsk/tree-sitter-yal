/**
 * @file Low level systems programming language.
 * @author Lucas Ross
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC_CALL = 10;
const PREC_UNARY = 9;
const PREC_CAST = 8;
const PREC_MUL = 7;
const PREC_ADD = 6;
const PREC_SHIFT = 5;
const PREC_COMP = 4;
const PREC_BIT = 3;
const PREC_LOGIC = 2;
const PREC_ASSIGN = 1;

module.exports = grammar({
  name: "yal",

  extras: ($) => [$.comment, /\s/],

  conflicts: ($) => [
    [$.func_ret_item, $._expr],
    [$.closed_expr_pack, $._expr],
  ],

  rules: {
    source_file: ($) => seq($.module_decl, repeat($._top_level_decl)),

    module_decl: ($) => seq("module", field("name", $.id), ";"),
    _top_level_decl: ($) =>
      choice($.func_decl, $._top_var_decl, $._top_def_decl, $.import, $.part),

    // decls

    func_decl: ($) =>
      seq(
        repeat($.top_decl_attr),
        "func",
        field("name", $.func_id_pack),
        optional($.func_gargs),
        $.func_args,
        field("ret", optional($.func_ret)),
        choice($.block, ";"),
      ),

    top_decl_attr: ($) =>
      seq(
        $.decorator,
        optional(
          seq(
            "(",
            sepBy(",", choice($._expr, seq(field("key", $.id), "=", $._expr))),
            ")",
          ),
        ),
      ),
    func_gargs: ($) => seq("[", sepBy(",", $.func_gargs_item), "]"),
    func_gargs_item: ($) =>
      seq(
        field("name", $.id),
        field("constraint", optional(seq(":", $._expr))),
      ),
    func_args: ($) =>
      seq("(", sepByWithLast(",", $.func_args_item, "..."), ")"),
    func_args_item: ($) =>
      seq(field("name", $.id), optional(seq(":", field("type", $._expr)))),
    func_ret: ($) =>
      choice(seq("(", sepBy1(",", $.func_ret_item), ")"), $._expr),
    func_ret_item: ($) => choice(seq($.id, ":", $._expr), $._expr),

    import: ($) =>
      seq("import", $.string, optional(seq("as", field("alias", $.id))), ";"),
    part: ($) => seq("part", $.string, ";"),

    _top_var_decl: ($) => seq(repeat($.top_decl_attr), $.var_decl),
    _top_def_decl: ($) => seq(repeat($.top_decl_attr), $.def_decl),

    func_id_pack: ($) => sepBy1(".", $.id),
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
    return_stmt: ($) =>
      seq(
        "return",
        optional(choice($._expr, $.open_expr_pack, $.closed_expr_pack)),
        ";",
      ),
    if_stmt: ($) =>
      seq(
        "if",
        optional($.var_decl),
        field("cond", $._expr),
        $.block,
        optional(seq("else", choice($.block, $.if_stmt))),
      ),
    while_stmt: ($) =>
      seq("while", seq(optional($.var_decl), field("cond", $._expr), $.block)),
    defer_stmt: ($) => seq("defer", $._stmt),

    assign: ($) =>
      prec.left(
        PREC_ASSIGN,
        seq(
          $._expr,
          choice(
            "=",
            "+=",
            "-=",
            "*=",
            "/=",
            "%=",
            "<<=",
            ">>=",
            "&=",
            "^=",
            "|=",
          ),
          $._expr,
          ";",
        ),
      ),

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
    mptr: ($) =>
      prec.left(PREC_UNARY, seq("[", "*", "]", optional("const"), $._expr)),
    sptr: ($) =>
      prec.left(PREC_UNARY, seq("[", "]", optional("const"), $._expr)),

    // expressions

    _expr: ($) =>
      choice(
        seq("(", $._expr, ")"),
        $.call,
        $.field,
        $.unary,
        $.cast,
        $.mul,
        $.add,
        $.shift,
        $.comp,
        $.logic,
        $.ptr,
        $.mptr,
        $.sptr,
        $.struct,
        $.id,
        $.int,
        $.hex,
        $.float,
        $.lit,
        $.lit_kw,
        $.arr,
        $.string,
        $.character,
      ),

    call: ($) =>
      prec.left(PREC_CALL, seq(field("callee", $._expr), $.call_args)),
    call_args: ($) => seq("(", sepBy(",", $._expr), ")"),

    field: ($) => prec.left(PREC_CALL, seq($._expr, ".", field("name", $.id))),

    unary: ($) => seq(choice("&", "!", "~", "-", "+"), $._expr),

    cast: ($) =>
      prec.left(PREC_CAST, seq($._expr, "as", field("type", $._expr))),

    mul: ($) =>
      prec.left(PREC_MUL, seq($._expr, choice("*", "/", "%"), $._expr)),
    add: ($) => prec.left(PREC_ADD, seq($._expr, choice("+", "-"), $._expr)),

    shift: ($) =>
      prec.left(PREC_SHIFT, seq($._expr, choice("<<", ">>"), $._expr)),

    comp: ($) =>
      prec.left(
        PREC_COMP,
        seq($._expr, choice("==", "!=", "<", ">", "<=", ">="), $._expr),
      ),
    bit: ($) =>
      prec.left(PREC_BIT, seq($._expr, choice("&", "^", "|"), $._expr)),

    logic: ($) =>
      prec.left(PREC_LOGIC, seq($._expr, choice("or", "and"), $._expr)),

    open_expr_pack: ($) => sepBy1NoTrailing(",", $._expr),
    closed_expr_pack: ($) => seq("(", sepBy1(",", $._expr), ")"),

    // literals

    lit: ($) => seq(".{", sepBy(",", $.lit_item), "}"),
    lit_item: ($) =>
      choice(
        seq(field("key", $.lit_kw), "=", field("value", $._expr)),
        $._expr,
      ),
    lit_kw: ($) => seq(".", $.id),

    arr: ($) =>
      prec.left(
        PREC_UNARY,
        seq(
          "[",
          field("count", choice("_", $._expr)),
          "]",
          optional("const"),
          field("type", $._expr),
          optional($.arr_init),
        ),
      ),
    arr_init: ($) => seq("{", sepBy(",", $._expr), "}"),

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
    decorator: (_) => /@[a-zA-Z_][a-zA-Z_0-9]*/,
    int: (_) => /[0-9][0-9_]*/,
    hex: (_) => /[0-9]x[0-9a-fA-F_]*/,
    float: (_) => /[0-9][0-9_]*\.[0-9]+/,

    comment: (_) => token(seq("//", /[^\r\n]*/)),
  },
});

/**
 * Creates a rule to match one or more of the rules separated by the separator,
 * but does not allow a trailing separator.
 *
 * @param {RuleOrLiteral} sep - The separator to use.
 * @param {RuleOrLiteral} rule
 *
 * @returns {SeqRule}
 */
function sepBy1NoTrailing(sep, rule) {
  return seq(rule, repeat1(seq(sep, rule)));
}

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

/**
 * @param {RuleOrLiteral} sep - The separator to use
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} last - The optional element that can only appear at the end.
 */
function sepByWithLast1(sep, rule, last) {
  return seq(rule, repeat(seq(sep, rule)), optional(seq(sep, optional(last))));
}

/**
 * @param {RuleOrLiteral} sep - The separator to use
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} last - The optional element that can only appear at the end.
 */
function sepByWithLast(sep, rule, last) {
  return optional(sepByWithLast1(sep, rule, last));
}
