import { test, expect } from "bun:test";
import { getSudokuGrid, getEmptyNxNGrid } from "../utils/helper.ts";
import { Sudoku } from "../utils/Sudoku.ts";

const twoByTwoGrid = [
  [0, 0, 3, 0],
  [3, 4, 0, 1],
  [4, 3, 1, 2],
  [2, 1, 4, 3],
];

const gridObj = new Sudoku(twoByTwoGrid, 2);

test("getRow", () => {
  expect(gridObj.getRow(0)).toEqual([0, 0, 3, 0]);
  expect(gridObj.getRow(1)).toEqual([3, 4, 0, 1]);
  expect(gridObj.getRow(2)).toEqual([4, 3, 1, 2]);
  expect(gridObj.getRow(3)).toEqual([2, 1, 4, 3]);
});

test("getColumn", () => {
  expect(gridObj.getColumn(0)).toEqual([0, 3, 4, 2]);
  expect(gridObj.getColumn(1)).toEqual([0, 4, 3, 1]);
  expect(gridObj.getColumn(2)).toEqual([3, 0, 1, 4]);
  expect(gridObj.getColumn(3)).toEqual([0, 1, 2, 3]);
});

test("CanSolveMissingValueFromRow", () => {
  const sudokuGrid = [
    [0, 0, 0, 0],
    [3, 4, 0, 1],
    [4, 3, 1, 2],
    [0, 0, 0, 0],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);

  sudoku.solve();

  expect(sudoku.getRow(1)).toEqual([3, 4, 2, 1]);
});

test("CanSolveMissingValueFromColumn", () => {
  const sudokuGrid = [
    [0, 0, 0, 0],
    [3, 4, 2, 1],
    [4, 3, 1, 2],
    [0, 0, 0, 3],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);

  sudoku.solve();

  expect(sudoku.getColumn(3)).toEqual([4, 1, 2, 3]);
});

test("hasBeenCorrectlySolved", () => {
  const sudokuGrid = [
    [1, 2, 4, 3],
    [3, 4, 2, 1],
    [4, 3, 1, 2],
    [2, 1, 3, 4],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);
  expect(sudoku.hasBeenCorrectlySolved()).toBe(true);
});

test("hasBeenSolved", () => {
  const sudokuGrid = [
    [1, 2, 4, 3],
    [3, 4, 2, 1],
    [4, 3, 1, 2],
    [2, 1, 3, 4],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);
  expect(sudoku.hasNoMissingValues()).toBe(true);
});

test("hasBeenCorrectlySolved - Negative test", () => {
  const sudokuGrid = [
    [2, 2, 4, 3],
    [3, 4, 2, 1],
    [4, 3, 1, 2],
    [2, 1, 3, 4],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);
  expect(sudoku.hasBeenCorrectlySolved()).toBe(false);
});

test("GetBlockByRowAndColumn", () => {
  const sudokuGrid = [
    [0, 2, 0, 3],
    [3, 4, 0, 1],
    [4, 3, 1, 2],
    [0, 0, 0, 0],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);

  expect(sudoku.getBlockByRowColumn(0, 0)).toEqual([0, 2, 3, 4]);
  expect(sudoku.getBlockByRowColumn(0, 1)).toEqual([0, 2, 3, 4]);
  expect(sudoku.getBlockByRowColumn(1, 0)).toEqual([0, 2, 3, 4]);
  expect(sudoku.getBlockByRowColumn(1, 1)).toEqual([0, 2, 3, 4]);

  expect(sudoku.getBlockByRowColumn(0, 2)).toEqual([0, 3, 0, 1]);
  expect(sudoku.getBlockByRowColumn(0, 3)).toEqual([0, 3, 0, 1]);
  expect(sudoku.getBlockByRowColumn(1, 2)).toEqual([0, 3, 0, 1]);
  expect(sudoku.getBlockByRowColumn(1, 3)).toEqual([0, 3, 0, 1]);

  expect(sudoku.getBlockByRowColumn(2, 0)).toEqual([4, 3, 0, 0]);
  expect(sudoku.getBlockByRowColumn(2, 1)).toEqual([4, 3, 0, 0]);
  expect(sudoku.getBlockByRowColumn(3, 0)).toEqual([4, 3, 0, 0]);
  expect(sudoku.getBlockByRowColumn(3, 1)).toEqual([4, 3, 0, 0]);

  expect(sudoku.getBlockByRowColumn(2, 2)).toEqual([1, 2, 0, 0]);
  expect(sudoku.getBlockByRowColumn(2, 3)).toEqual([1, 2, 0, 0]);
  expect(sudoku.getBlockByRowColumn(3, 2)).toEqual([1, 2, 0, 0]);
  expect(sudoku.getBlockByRowColumn(3, 3)).toEqual([1, 2, 0, 0]);
});

test("setElement - should update the value of the cell", () => {
  const sudokuGrid = [
    [0, 2, 0, 3],
    [3, 4, 0, 1],
    [4, 3, 1, 2],
    [0, 0, 0, 0],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);
  sudoku.setElement(0, 0, 1);
  sudoku.setElement(0, 2, 4);
  expect(sudoku.grid[0][0]).toBe(1);
  expect(sudoku.grid[0][2]).toBe(4);
});

test("setElement - should update the search space (Row)", () => {
  const sudokuGrid = [
    [0, 2, 0, 0],
    [0, 0, 0, 1],
    [4, 3, 1, 2],
    [0, 0, 0, 0],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);

  expect([...sudoku.possibleValues[0][0]]).toEqual([1, 3]);
  sudoku.setElement(0, 3, 3);

  expect([...sudoku.possibleValues[0][0]]).toEqual([1]);
  expect([...sudoku.possibleValues[0][3]]).toEqual([3]);
});

test("setElement - should update the search space (Column)", () => {
  const sudokuGrid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);

  expect([...sudoku.possibleValues[1][0]]).toEqual([1, 2, 3, 4]);
  // Fill (3, 0) with 1
  // so the grid would look like:
  // 0 0 0 0
  // 0 0 0 0
  // 0 0 0 0
  // 1 0 0 0
  sudoku.setElement(3, 0, 1);

  expect([...sudoku.possibleValues[0][0]]).toEqual([2, 3, 4]);
  expect([...sudoku.possibleValues[1][0]]).toEqual([2, 3, 4]);
  expect([...sudoku.possibleValues[3][0]]).toEqual([1]);
});

test("setElement - should update the search space (Block)", () => {
  const sudokuGrid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);

  expect([...sudoku.possibleValues[1][0]]).toEqual([1, 2, 3, 4]);
  // Fill (3, 0) with 1
  // so the grid would look like:
  // 0 0 0 0
  // 0 0 0 0
  // 0 0 0 0
  // 1 0 0 0
  sudoku.setElement(3, 0, 1);

  expect([...sudoku.possibleValues[2][1]]).toEqual([2, 3, 4]);
  expect([...sudoku.possibleValues[3][1]]).toEqual([2, 3, 4]);
  expect([...sudoku.possibleValues[2][0]]).toEqual([2, 3, 4]);
  expect([...sudoku.possibleValues[3][0]]).toEqual([1]);
});

test("getBlockByRowColumn", () => {
  const sudokuGrid = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);

  expect(sudoku.getBlockByRowColumn(0, 0)).toEqual([1, 2, 5, 6]);
  expect(sudoku.getBlockByRowColumn(0, 1)).toEqual([1, 2, 5, 6]);
  expect(sudoku.getBlockByRowColumn(1, 0)).toEqual([1, 2, 5, 6]);
  expect(sudoku.getBlockByRowColumn(1, 1)).toEqual([1, 2, 5, 6]);

  expect(sudoku.getBlockByRowColumn(0, 2)).toEqual([3, 4, 7, 8]);
  expect(sudoku.getBlockByRowColumn(0, 3)).toEqual([3, 4, 7, 8]);
  expect(sudoku.getBlockByRowColumn(1, 2)).toEqual([3, 4, 7, 8]);
  expect(sudoku.getBlockByRowColumn(1, 3)).toEqual([3, 4, 7, 8]);

  expect(sudoku.getBlockByRowColumn(2, 0)).toEqual([9, 10, 13, 14]);
  expect(sudoku.getBlockByRowColumn(2, 1)).toEqual([9, 10, 13, 14]);
  expect(sudoku.getBlockByRowColumn(3, 0)).toEqual([9, 10, 13, 14]);
  expect(sudoku.getBlockByRowColumn(3, 1)).toEqual([9, 10, 13, 14]);

  expect(sudoku.getBlockByRowColumn(2, 2)).toEqual([11, 12, 15, 16]);
  expect(sudoku.getBlockByRowColumn(2, 3)).toEqual([11, 12, 15, 16]);
  expect(sudoku.getBlockByRowColumn(3, 2)).toEqual([11, 12, 15, 16]);
  expect(sudoku.getBlockByRowColumn(3, 3)).toEqual([11, 12, 15, 16]);
});

test("calculatePossibleValues - empty grid", () => {
  const sudokuGrid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  // calculatePossibleValues is implicitly called in the constructor
  const sudoku = new Sudoku(sudokuGrid, 2);

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      expect([...sudoku.possibleValues[i][j]]).toEqual([1, 2, 3, 4]);
    }
  }
});

test("calculatePossibleValues - partially filled grid", () => {
  const sudokuGrid = [
    [1, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 3, 0],
    [0, 0, 0, 4],
  ];

  // calculatePossibleValues is implicitly called in the constructor
  const sudoku = new Sudoku(sudokuGrid, 2);

  expect([...sudoku.possibleValues[0][0]]).toEqual([1]);
  expect([...sudoku.possibleValues[0][1]]).toEqual([3, 4]);
  expect([...sudoku.possibleValues[0][2]]).toEqual([2, 4]);
  expect([...sudoku.possibleValues[0][3]]).toEqual([2, 3]);

  expect([...sudoku.possibleValues[1][0]]).toEqual([3, 4]);
  expect([...sudoku.possibleValues[1][1]]).toEqual([2]);
  expect([...sudoku.possibleValues[1][2]]).toEqual([1, 4]);
  expect([...sudoku.possibleValues[1][3]]).toEqual([1, 3]);

  expect([...sudoku.possibleValues[2][0]]).toEqual([2, 4]);
  expect([...sudoku.possibleValues[2][1]]).toEqual([1, 4]);
  expect([...sudoku.possibleValues[2][2]]).toEqual([3]);
  expect([...sudoku.possibleValues[2][3]]).toEqual([1, 2]);

  expect([...sudoku.possibleValues[3][0]]).toEqual([2, 3]);
  expect([...sudoku.possibleValues[3][1]]).toEqual([1, 3]);
  expect([...sudoku.possibleValues[3][2]]).toEqual([1, 2]);
  expect([...sudoku.possibleValues[3][3]]).toEqual([4]);
});

test("getColumnPossibleValues", () => {
  const sudokuGrid = [
    [1, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 3, 0],
    [0, 0, 0, 4],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);

  const columnPossibleValues = sudoku.getColumnPossibleValues(0);

  expect([...columnPossibleValues[0]]).toEqual([1]);
  expect([...columnPossibleValues[1]]).toEqual([3, 4]);
  expect([...columnPossibleValues[2]]).toEqual([2, 4]);
  expect([...columnPossibleValues[3]]).toEqual([2, 3]);

  const columnPossibleValues2 = sudoku.getColumnPossibleValues(1);

  expect([...columnPossibleValues2[0]]).toEqual([3, 4]);
  expect([...columnPossibleValues2[1]]).toEqual([2]);
  expect([...columnPossibleValues2[2]]).toEqual([1, 4]);
  expect([...columnPossibleValues2[3]]).toEqual([1, 3]);

  const columnPossibleValues3 = sudoku.getColumnPossibleValues(2);

  expect([...columnPossibleValues3[0]]).toEqual([2, 4]);
  expect([...columnPossibleValues3[1]]).toEqual([1, 4]);
  expect([...columnPossibleValues3[2]]).toEqual([3]);
  expect([...columnPossibleValues3[3]]).toEqual([1, 2]);

  const columnPossibleValues4 = sudoku.getColumnPossibleValues(3);

  expect([...columnPossibleValues4[0]]).toEqual([2, 3]);
  expect([...columnPossibleValues4[1]]).toEqual([1, 3]);
  expect([...columnPossibleValues4[2]]).toEqual([1, 2]);
  expect([...columnPossibleValues4[3]]).toEqual([4]);
});

test("calculatePossibleValues - filled grid", () => {
  const sudokuGrid = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [4, 3, 2, 1],
    [2, 1, 4, 3],
  ];

  // calculatePossibleValues is implicitly called in the constructor
  const sudoku = new Sudoku(sudokuGrid, 2);

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      expect([...sudoku.possibleValues[i][j]]).toEqual([sudokuGrid[i][j]]);
    }
  }
});

test("isLegalMove - already filled grid", () => {
  const sudokuGrid = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [4, 3, 2, 1],
    [2, 1, 4, 3],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 1; k <= 4; k++) {
        expect(sudoku.isLegalMove(i, j, k)).toBe(false);
      }
    }
  }
});

test("isLegalMove - empty grid", () => {
  const sudokuGrid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 1; k <= 4; k++) {
        expect(sudoku.isLegalMove(i, j, k)).toBe(true);
      }
    }
  }
});

test("isLegalMove - partially filled grid", () => {
  const sudokuGrid = [
    [1, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 3, 0],
    [0, 0, 0, 4],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);

  expect(sudoku.isLegalMove(0, 0, 1)).toBe(false);
  expect(sudoku.isLegalMove(0, 0, 2)).toBe(false);
  expect(sudoku.isLegalMove(0, 0, 3)).toBe(false);
  expect(sudoku.isLegalMove(0, 0, 4)).toBe(false);

  expect(sudoku.isLegalMove(0, 1, 1)).toBe(false);
  expect(sudoku.isLegalMove(0, 1, 2)).toBe(false);
  expect(sudoku.isLegalMove(0, 1, 3)).toBe(true);
  expect(sudoku.isLegalMove(0, 1, 4)).toBe(true);

  expect(sudoku.isLegalMove(0, 2, 1)).toBe(false);
  expect(sudoku.isLegalMove(0, 2, 2)).toBe(true);
  expect(sudoku.isLegalMove(0, 2, 3)).toBe(false);
  expect(sudoku.isLegalMove(0, 2, 4)).toBe(true);

  expect(sudoku.isLegalMove(0, 3, 1)).toBe(false);
  expect(sudoku.isLegalMove(0, 3, 2)).toBe(true);
  expect(sudoku.isLegalMove(0, 3, 3)).toBe(true);
  expect(sudoku.isLegalMove(0, 3, 4)).toBe(false);
});

test("bruteForceSolve - should be able to solve the grid", () => {
  const sudokuGrid = [
    [0, 0, 3, 0],
    [3, 4, 0, 1],
    [4, 3, 1, 2],
    [2, 1, 4, 3],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);
  sudoku.bruteForceSolve();
  expect(sudoku.hasBeenCorrectlySolved()).toBe(true);
});

test("bruteForceSolve - should be able empty grid - 2x2", () => {
  const sudokuGrid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const sudoku = new Sudoku(sudokuGrid, 2);
  sudoku.bruteForceSolve();
  expect(sudoku.hasBeenCorrectlySolved()).toBe(true);
});

test("bruteForceSolve - should be able empty grid - 3x3", () => {
  const sudokuGrid = getEmptyNxNGrid(3 ** 2);
  const sudoku = new Sudoku(sudokuGrid, 3);
  sudoku.bruteForceSolve();
  expect(sudoku.hasBeenCorrectlySolved()).toBe(true);
});

test("bruteForceSolve - should be able empty grid - 4x4", () => {
  const sudokuGrid = getEmptyNxNGrid(4 ** 2);
  const sudoku = new Sudoku(sudokuGrid, 4);
  sudoku.bruteForceSolve();
  expect(sudoku.hasBeenCorrectlySolved()).toBe(true);
});

test("rowsBlocksInteractions", () => {
  const sudokuGrid = [
    [3, 8, 0, 0, 0, 0, 9, 2, 0],
    [0, 0, 6, 4, 3, 9, 7, 8, 5],
    [0, 0, 9, 0, 2, 0, 3, 0, 0],
    [0, 6, 0, 0, 9, 0, 0, 0, 0],
    [8, 0, 0, 3, 0, 2, 0, 0, 9],
    [9, 0, 0, 0, 4, 0, 0, 7, 0],
    [0, 0, 1, 9, 7, 0, 5, 0, 8],
    [4, 9, 5, 2, 8, 6, 1, 3, 7],
    [0, 0, 8, 0, 0, 0, 0, 9, 2],
  ];

  const sudoku = new Sudoku(sudokuGrid, 3);
  sudoku.solve("constraint");

  expect(sudoku.hasBeenCorrectlySolved()).toBe(true);
});

test("CanSolveProjectEulerProblem", async () => {
  const { generator: sudokuGenerator } = await getSudokuGrid("projectEuler");
  for await (const grid of sudokuGenerator) {
    const sudoku = new Sudoku(grid, 3);
    sudoku.solve("constraint");
    expect(sudoku.hasBeenCorrectlySolved()).toBe(true);
  }
});

test("CanSolveNYTProblems", async () => {
  const { generator: sudokuGenerator } = await getSudokuGrid("nyt");
  for await (const grid of sudokuGenerator) {
    const sudoku = new Sudoku(grid, 3);
    sudoku.solve("constraint");
    expect(sudoku.hasBeenCorrectlySolved()).toBe(true);
  }
});
