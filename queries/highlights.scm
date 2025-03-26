; ---------------------------------------------------------
; Identifiers
; ---------------------------------------------------------

((id) @variable.builtin
  (#eq? @variable.builtin "_"))

(var_decl name: (id_pack (id) @variable))

(func_args_item name: (id) @variable.parameter)
(struct_field name: (id) @variable.member)
(field name: (id) @variable.member)

(def_decl name: (id_pack (id) @constant))

((module_decl name: (id) @module.builtin)
  (#eq? @module.builtin "main"))
(module_decl name: (id) @module)
(import alias: (id) @module)

[
  "import"
] @keyword.import

((id) @constant.builtin
  (#any-of? @constant.builtin "nil"))
  
(func_attr (decorator) @attribute.builtin)
(func_attr key: (id) @property)

; ---------------------------------------------------------
; Literals
; ---------------------------------------------------------

(string) @string
(escape_sequence) @string.escape

((id) @boolean
  (#any-of? @boolean "true" "false"))
(int) @number
(float) @number.float

; ---------------------------------------------------------
; Types
; ---------------------------------------------------------

(func_gargs_item
  name: (id) @type.definition)

((id) @type.builtin
  (#any-of? @type.builtin "i32"))

[
  "..."
] @type.builtin

; ---------------------------------------------------------
; Functions
; ---------------------------------------------------------

(func_decl
  name: (func_id) @function)

(call callee: (id) @function.call)

[
  "=" "==" "!="
  "+"
  "*"
  "/"
  "?"
  "!"
  "~"
  "<" ">" "<=" ">="
  "<<" ">>"
] @operator

; ---------------------------------------------------------
; Keywords
; ---------------------------------------------------------

[
  "var"
  "def"
  "defer"
  "as"
] @keyword

[
  "func"
] @keyword.function

[
  "struct"
] @keyword.type

[
  "module"
] @keyword.import

[
  "const"
] @keyword.modifier

[
  "while"
] @keyword.repeat

[
  "return"
] @keyword.return

[
  "if"
  "else"
] @keyword.conditional

; ---------------------------------------------------------
; Punctuation
; ---------------------------------------------------------

[
  ","
  ":"
  ";"
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

(comment) @comment
