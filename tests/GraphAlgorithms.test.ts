import { describe, it, expect } from "bun:test";
import { maximumMatching, strongComponents } from "../utils/GraphAlgorithms.ts";
import { Graph } from "../utils/Graph.ts";

// Copied from HW6
describe("GraphUtils strongComponents", () => {
  it("adjMatrixOneVertexSCC", () => {
    const g = new Graph(1);
    const cs = strongComponents(g);
    expect(cs.size).toBe(1);
    expect(cs.get(0)).toBe(1);
  });

  it("adjMatrixTwoVertexSCC", () => {
    const g = new Graph(2);
    g.addEdge(0, 1);
    const cs = strongComponents(g);
    expect(cs.size).toBe(2);
    expect(cs.get(0)).not.toBe(cs.get(1));
    expect([1, 2]).toContain(cs.get(0));
    expect([1, 2]).toContain(cs.get(1));
  });

  it("adjMatrixTwoVertexCycleSCC", () => {
    const g = new Graph(2);
    g.addEdge(0, 1);
    g.addEdge(1, 0);
    const cs = strongComponents(g);
    expect(cs.size).toBe(2);
    expect(cs.get(0)).toBe(1);
    expect(cs.get(1)).toBe(1);
  });

  it("adjMatrixThreeDisconnectedVerticesSCC", () => {
    const g = new Graph(3);
    const cs = strongComponents(g);
    expect(cs.size).toBe(3);
    expect(new Set([cs.get(0), cs.get(1), cs.get(2)])).toHaveLength(3);
  });

  it("adjMatrixThreeVertexThreeSCCs", () => {
    const g = new Graph(3);
    g.addEdge(0, 1);
    g.addEdge(0, 2);
    g.addEdge(2, 1);
    const cs = strongComponents(g);
    expect(cs.size).toBe(3);
    expect(new Set([cs.get(0), cs.get(1), cs.get(2)])).toHaveLength(3);
  });

  it("adjMatrixThreeVertexTwoSCCs", () => {
    const g = new Graph(3);
    g.addEdge(0, 1);
    g.addEdge(0, 2);
    g.addEdge(2, 1);
    g.addEdge(1, 2);
    const cs = strongComponents(g);
    expect(cs.size).toBe(3);
    expect(cs.get(1)).toBe(cs.get(2)!);
    expect(cs.get(0)).not.toBe(cs.get(1));
  });

  it("adjMatrixThreeVertexOneSCC", () => {
    const g = new Graph(3);
    g.addEdge(0, 1);
    g.addEdge(1, 0);
    g.addEdge(0, 2);
    g.addEdge(2, 1);
    const cs = strongComponents(g);
    expect(cs.size).toBe(3);
    expect(cs.get(0)).toBe(cs.get(1)!);
    expect(cs.get(1)).toBe(cs.get(2)!);
  });

  it("adjMatrixFourVertexTwoDisconnectedSCCs", () => {
    const g = new Graph(4);
    g.addEdge(0, 3);
    g.addEdge(3, 0);
    g.addEdge(2, 1);
    g.addEdge(1, 2);
    const cs = strongComponents(g);
    expect(cs.size).toBe(4);
    expect(cs.get(0)).toBe(cs.get(3)!);
    expect(cs.get(1)).toBe(cs.get(2)!);
    expect(cs.get(0)).not.toBe(cs.get(1));
  });

  it("adjMatrixFromQuizSCC", () => {
    const g = new Graph(8);
    g.addEdge(0, 4);
    g.addEdge(0, 1);
    g.addEdge(1, 3);
    g.addEdge(1, 5);
    g.addEdge(2, 0);
    g.addEdge(2, 3);
    g.addEdge(2, 7);
    g.addEdge(3, 1);
    g.addEdge(4, 0);
    g.addEdge(4, 5);
    g.addEdge(6, 2);
    g.addEdge(7, 3);
    g.addEdge(7, 6);
    const cs = strongComponents(g);
    expect(cs.size).toBe(8);
    expect(cs.get(2)).toBe(cs.get(6)!);
    expect(cs.get(6)).toBe(cs.get(7)!);
    expect(cs.get(1)).toBe(cs.get(3)!);
    expect(cs.get(0)).toBe(cs.get(4)!);
    expect(new Set([cs.get(2), cs.get(1), cs.get(0), cs.get(5)])).toHaveLength(
      4
    );
  });

  it("adjMatrixFromClassSCC", () => {
    const g = new Graph(12);
    g.addEdge(0, 1);
    g.addEdge(1, 2);
    g.addEdge(1, 3);
    g.addEdge(1, 4);
    g.addEdge(2, 5);
    g.addEdge(4, 1);
    g.addEdge(4, 5);
    g.addEdge(4, 6);
    g.addEdge(5, 2);
    g.addEdge(5, 7);
    g.addEdge(6, 7);
    g.addEdge(6, 9);
    g.addEdge(7, 10);
    g.addEdge(8, 6);
    g.addEdge(9, 8);
    g.addEdge(10, 11);
    g.addEdge(11, 9);
    const cs = strongComponents(g);
    expect(cs.size).toBe(12);
    expect(cs.get(1)).toBe(cs.get(4)!);
    expect(cs.get(2)).toBe(cs.get(5)!);
    expect(cs.get(6)).toBe(cs.get(7)!);
    expect(cs.get(7)).toBe(cs.get(8)!);
    expect(cs.get(8)).toBe(cs.get(9)!);
    expect(cs.get(9)).toBe(cs.get(10)!);
    expect(cs.get(10)).toBe(cs.get(11)!);
    expect(new Set([cs.get(1), cs.get(2), cs.get(6), cs.get(3)])).toHaveLength(
      4
    );
  });
});


describe("GraphUtils maximumMatching", () => {
  it("With no edges", () => {
    const g = new Graph(10);
    const m = maximumMatching(g);
    expect(m.size).toBe(0);
  });

  it("With one edge", () => {
    const g = new Graph(2);
    g.addEdge(0, 1);
    const m = maximumMatching(g);
    expect(m.size).toBe(1);
    expect(m.get(0)).toBe(1);
  });

  it("With two edges", () => {
    const g = new Graph(2);
    g.addEdge(0, 1);
    g.addEdge(1, 0);
    const m = maximumMatching(g);
    expect(m.size).toBe(1);
    expect(m.get(0)).toBe(1);
  });

  it("Simple sudoku matching", () => {
    const g = new Graph(18);
    g.addEdge(0, 9);
    g.addEdge(1, 10);
    g.addEdge(2, 11);
    g.addEdge(3, 12);
    g.addEdge(4, 13);
    g.addEdge(5, 14);
    g.addEdge(6, 15);
    g.addEdge(7, 16);
    g.addEdge(8, 17);
    
    const m = maximumMatching(g);

    expect(m.size).toBe(9);
    expect(m.get(0)).toBe(9);
    expect(m.get(1)).toBe(10);
    expect(m.get(2)).toBe(11);
    expect(m.get(3)).toBe(12);
    expect(m.get(4)).toBe(13);
    expect(m.get(5)).toBe(14);
    expect(m.get(6)).toBe(15);
    expect(m.get(7)).toBe(16);
    expect(m.get(8)).toBe(17);
  });

  it("Sudoku matching with multiple choices", () => {
    const g = new Graph(18);
    g.addEdge(0, 9);
    g.addEdge(0, 15);
    g.addEdge(1, 10);
    g.addEdge(1, 16);
    g.addEdge(2, 11);
    g.addEdge(2, 17);
    g.addEdge(2, 12);
    g.addEdge(3, 12);
    g.addEdge(4, 13);
    g.addEdge(5, 14);
    g.addEdge(6, 15);
    g.addEdge(7, 16);
    g.addEdge(8, 17);
    
    const m = maximumMatching(g);

    expect(m.size).toBe(9);
    expect(m.get(0)).toBe(9);
    expect(m.get(1)).toBe(10);
    expect(m.get(2)).toBe(11);
    expect(m.get(3)).toBe(12);
    expect(m.get(4)).toBe(13);
    expect(m.get(5)).toBe(14);
    expect(m.get(6)).toBe(15);
    expect(m.get(7)).toBe(16);
    expect(m.get(8)).toBe(17);
  });

  it("Sudoku matching - 2", () => {
    // 1 d
    // 1 b
    // 2 c
    // 3 d
    // 4 c
    // 1 a
    // 2 a
    const g = new Graph(8);

    g.addEdge(0, 7);
    g.addEdge(0, 5);
    g.addEdge(1, 6);
    g.addEdge(2, 7);
    g.addEdge(3, 6);
    g.addEdge(4, 6);
    g.addEdge(1, 4);

    const m = maximumMatching(g);

    expect(m.size).toBe(4);

    expect(m.get(0)).toBe(5); // 1 -> b
    expect(m.get(1)).toBe(4); // 2 -> a
    expect(m.get(2)).toBe(7); // 3 -> d
    expect(m.get(3)).toBe(6); // 4 -> c
  });

});