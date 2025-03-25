; ---------------------------------------------------------
; Identifiers
; ---------------------------------------------------------

(var_decl name: (id_pack (id) @variable))
(func_args_item name: (id) @variable.parameter)
(struct_field name: (id) @variable.member)
(field name: (id) @variable.member)

(package_decl name: (id) @module)

((id) @constant.builtin
  (#any-eq? @constant.builtin "nil"))

; ---------------------------------------------------------
; Literals
; ---------------------------------------------------------

(string_content) @string
(escape_sequence) @string.escape

(int) @number

; ---------------------------------------------------------
; Types
; ---------------------------------------------------------

(func_gargs_item
  name: (id) @type.definition)

((id) @type.builtin
  (#any-eq? @type.builtin "i32"))

; ---------------------------------------------------------
; Functions
; ---------------------------------------------------------

(func_decl
  name: (func_id) @function)

(call callee: (id) @function.call)

[
  "="
  "+"
  "*"
  "/"
  "?"
] @operator

; ---------------------------------------------------------
; Keywords
; ---------------------------------------------------------

[
  "var"
  "def"
  "defer"
] @keyword

[
  "func"
] @keyword.function

[
  "struct"
] @keyword.type

[
  "package"
] @keyword.import

[
  "while"
] @keyword.repeat

[
  "return"
] @keyword.return

[
  "if"
] @keyword.conditional

; ---------------------------------------------------------
; Punctuation
; ---------------------------------------------------------

[
  ","
  ":"
] @punctuation.delimiter

[
  "[" "]"
  "{" "}"
  "(" ")"
  ".{"
] @punctuation.bracket

; ---------------------------------------------------------
; Comments
; ---------------------------------------------------------


