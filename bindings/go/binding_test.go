package tree_sitter_yal_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_yal "github.com/upprsk/yalc/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_yal.Language())
	if language == nil {
		t.Errorf("Error loading Yal grammar")
	}
}
