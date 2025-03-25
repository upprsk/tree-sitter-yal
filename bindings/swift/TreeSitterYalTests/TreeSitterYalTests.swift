import XCTest
import SwiftTreeSitter
import TreeSitterYal

final class TreeSitterYalTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_yal())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Yal grammar")
    }
}
