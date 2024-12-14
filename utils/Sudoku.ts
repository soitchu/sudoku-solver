import { Graph } from "./Graph.ts";
import { strongComponents } from "./GraphAlgorithms.ts";
import { maximumMatching } from "./GraphAlgorithms.ts";

type Strategy = "backtracking" | "constraint" | "hybrid";

export class Sudoku {
  readonly SIZE: number;
  readonly GRID_SIZE: number;

  grid: number[][];
  missingValues: number = 0;
  possibleValues: Record<number, Record<number, Set<number>>> = {};
  toVisit: Set<number> = new Set();
  rowBlockg: Graph;
  rowBlockg2: Graph;
  blockg: Graph;
  blockg2: Graph;
  visitedCells: Set<number> = new Set();
  spotOffset: [number, number][] = [];

  constructor(grid: number[][], size: number) {
    this.grid = grid;
    this.SIZE = size;
    this.GRID_SIZE = this.SIZE ** 2;

    this.rowBlockg = new Graph(this.SIZE * 2);
    this.rowBlockg2 = new Graph(this.SIZE * 2);
    this.blockg = new Graph(2 * this.GRID_SIZE);
    this.blockg2 = new Graph(2 * this.GRID_SIZE);

    // Spot layout:
    // 0 1 2
    // 3 4 5
    // 6 7 8
    // For 9x9 sudoku it would be
    // const spotOffset = [
    //   [0, 0], [0, 1], [0, 2],
    //   [1, 0], [1, 1], [1, 2],
    //   [2, 0], [2, 1], [2, 2],
    // ];
    for (let i = 0; i < this.SIZE; i++) {
      for (let j = 0; j < this.SIZE; j++) {
        this.spotOffset.push([i, j]);
      }
    }

    this.ini();
  }

  /**
   * Initializes appropriate data structures
   * that are used to solve the sudoku
   */
  ini() {
    this.calculateSearchSpace();

    for (let i = 0; i < this.GRID_SIZE; i++) {
      for (let j = 0; j < this.GRID_SIZE; j++) {
        if (this.grid[i][j] === 0) {
          this.missingValues++;
        } else {
          this.visitedCells.add(i * this.GRID_SIZE + j);
        }

        if (this.possibleValues[i][j].size === 1) {
          this.toVisit.add(i * this.GRID_SIZE + j);
        }
      }
    }
  }

  /**
   * Gets the values in the row
   *
   * @param row Row number
   * @returns The values in the row
   */
  getRow(row: number): number[] {
    return this.grid[row];
  }

  /**
   * Gets the values in the column
   *
   * @param column Column number
   * @returns The values in the column
   */
  getColumn(column: number): number[] {
    return this.grid.map((row) => row[column]);
  }

  /**
   * Prints the sudoku
   */
  print(): void {
    let output = "";

    for (let i = 0; i < this.GRID_SIZE; i++) {
      if (i % this.SIZE === 0) {
        output += " ---------------------------\n";
      }
      for (let j = 0; j < this.GRID_SIZE; j++) {
        if (j % this.SIZE === 0) {
          output += " | ";
        }
        output += this.grid[i][j].toString().padStart(2, " ") + " ";

        if (j === this.GRID_SIZE - 1) {
          output += "|";
        }
      }

      if (i === this.GRID_SIZE - 1) {
        output += "\n ---------------------------";
      }
      output += "\n";
    }

    console.log(output);
  }

  /**
   * Checks if the sudoku has no missing values
   * @returns true if the sudoku has no missing values, false otherwise
   */
  hasNoMissingValues(): boolean {
    return this.missingValues === 0;
  }

  /**
   * Visits the cells that have only one possible value
   * and sets the value of the cell to the only possible value
   */
  visit(): void {
    for (const elem of this.toVisit) {
      this.toVisit.delete(elem);
      const row = Math.floor(elem / this.GRID_SIZE);
      const column = elem % this.GRID_SIZE;
      if (
        this.grid[row][column] === 0 &&
        this.possibleValues[row][column].size === 1
      ) {
        this.setElement(
          row,
          column,
          this.possibleValues[row][column].values().next().value
        );
      }
    }
  }

  /**
   * Solves the sudoku using the given strategy
   *
   * Contraint: Uses constraint programming to solve the sudoku
   * Backtracking: Uses backtracking to solve the sudoku
   * Hybrid: Uses both constraint programming and backtracking to solve the sudoku
   *
   * @param strategy The strategy to use to solve the sudoku
   */
  solve(strategy: Strategy = "hybrid"): void {
    if (strategy === "constraint" || strategy === "hybrid") {
      const timeout = 2;
      let timeoutCounter = 0;
      let lastMissingValues = -1;

      while (timeoutCounter < timeout && !this.hasNoMissingValues()) {
        if (lastMissingValues === this.missingValues) {
          timeoutCounter++;
        } else {
          timeoutCounter = 0;
        }

        lastMissingValues = this.missingValues;

        // Spare: O(n^3), Dense: O(n^4)
        for (let i = 0; i < this.GRID_SIZE; i++) {
          // Spare: O(n^2), Dense: O(n^3)
          this.rowBlockInteration(i);
        }

        for (let i = 0; i < this.GRID_SIZE; i++) {
          this.rowBlockInteration(-1, i);
        }

        for (let i = 1; i <= this.GRID_SIZE; i++) {
          this.rowColInteraction(i);
        }

        for (let i = 0; i < this.GRID_SIZE; i += this.SIZE) {
          for (let j = 0; j < this.GRID_SIZE; j += this.SIZE) {
            this.blockInteraction(i, j);
          }
        }

        for (let row = 0; row < this.GRID_SIZE; row += this.SIZE) {
          for (let i = 1; i <= this.GRID_SIZE; i++) {
            this.rowsBlocksInteractions(i, -1, row);
          }
        }

        for (let row = 0; row < this.GRID_SIZE; row += this.SIZE) {
          for (let i = 1; i <= this.GRID_SIZE; i++) {
            this.rowsBlocksInteractions(i, row);
          }
        }

        this.visit();
      }
    }

    if (strategy === "backtracking" || strategy === "hybrid") {
      this.bruteForceSolve();
    }
  }

  /**
   * Sets the value of the element at the given row and column,
   * updates the possible values for the row, column and block
   * and updates the grid
   *
   * @param rowNum Row number
   * @param columnNum Column number
   * @param value The value that needs to be set
   */
  setElement(rowNum: number, columnNum: number, value: number): void {
    const gridSize = this.GRID_SIZE;

    this.grid[rowNum][columnNum] = value;
    this.possibleValues[rowNum][columnNum] = new Set([value]);
    this.missingValues--;

    for (let k = 0; k < gridSize; k++) {
      if (k !== columnNum && this.possibleValues[rowNum][k].delete(value)) {
        if (this.possibleValues[rowNum][k].size === 0) {
          throw new Error("Invalid state (2)");
        }

        this.toVisit.add(rowNum * this.GRID_SIZE + k);
      }

      if (k !== rowNum && this.possibleValues[k][columnNum].delete(value)) {
        if (this.possibleValues[k][columnNum].size === 0) {
          throw new Error("Invalid state (1)");
        }

        this.toVisit.add(k * this.GRID_SIZE + columnNum);
      }
    }

    const startRow = Math.floor(rowNum / this.SIZE) * this.SIZE;
    const startColumn = Math.floor(columnNum / this.SIZE) * this.SIZE;

    for (let i = startRow; i < startRow + this.SIZE; i++) {
      for (let j = startColumn; j < startColumn + this.SIZE; j++) {
        if (
          i !== rowNum &&
          j !== columnNum &&
          this.possibleValues[i][j].delete(value)
        ) {
          if (this.possibleValues[i][j].size === 0) {
            throw new Error("Invalid state (0)");
          }

          this.toVisit.add(i * this.GRID_SIZE + j);
        }
      }
    }
  }

  /**
   * Gets all the values in the block that the row and column belong to
   *
   * @param row Row number
   * @param column Column number
   * @returns All the values in the block that the row and column
   */
  getBlockByRowColumn(row: number, column: number): number[] {
    const block: number[] = [];

    const startRow = Math.floor(row / this.SIZE) * this.SIZE;
    const startColumn = Math.floor(column / this.SIZE) * this.SIZE;

    for (let i = startRow; i < startRow + this.SIZE; i++) {
      for (let j = startColumn; j < startColumn + this.SIZE; j++) {
        block.push(this.grid[i][j]);
      }
    }

    return block;
  }

  /**
   * Checks if the sudoku has been correctly solved
   *
   * @returns true if the sudoku has been correctly solved, false otherwise
   */
  hasBeenCorrectlySolved(): boolean {
    const gridSize = this.GRID_SIZE;

    for (let i = 0; i < gridSize; i++) {
      const rowValues = this.getRow(i);
      const columnValues = this.getColumn(i);

      if (
        new Set(rowValues).size !== gridSize ||
        new Set(columnValues).size !== gridSize
      ) {
        return false;
      }
    }

    for (let i = 0; i < gridSize; i += this.SIZE) {
      for (let j = 0; j < gridSize; j += this.SIZE) {
        const blockValues = this.getBlockByRowColumn(i, j);
        if (new Set(blockValues).size !== gridSize) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Calculates the possible values for each cell in the grid
   */
  calculateSearchSpace(): void {
    const possibleValueSet = new Set(
      Array(this.GRID_SIZE)
        .keys()
        .toArray()
        .map((x) => x + 1)
    );

    const gridSize = this.GRID_SIZE;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (this.grid[i][j] === 0) {
          const getRowValues = new Set(this.getRow(i));
          const getColumnValues = new Set(this.getColumn(j));

          const possibleValues = possibleValueSet.difference(
            getRowValues
              .union(getColumnValues)
              .union(new Set(this.getBlockByRowColumn(i, j)))
          );

          if (!this.possibleValues[i]) {
            this.possibleValues[i] = {};
          }

          this.possibleValues[i][j] = possibleValues;
        } else {
          if (!this.possibleValues[i]) {
            this.possibleValues[i] = {};
          }

          this.possibleValues[i][j] = new Set([this.grid[i][j]]);
        }
      }
    }
  }

  /**
   * Checks if the value can be placed in the given row and column
   *
   * @param row The row number
   * @param column The column number
   * @param value The value that needs to be checked
   * @returns true if the value can be placed in the given row and column, false otherwise
   */
  isLegalMove(row: number, column: number, value: number): boolean {
    if (this.grid[row][column] !== 0) {
      return false;
    }

    const gridRow = this.grid[row];
    for (const val of gridRow) {
      if (val === value) {
        return false;
      }
    }

    for (let i = 0; i < this.GRID_SIZE; i++) {
      if (this.grid[i][column] === value) {
        return false;
      }
    }

    const startRow = Math.floor(row / this.SIZE) * this.SIZE;
    const startColumn = Math.floor(column / this.SIZE) * this.SIZE;
    const endRow = startRow + this.SIZE;
    const endColumn = startColumn + this.SIZE;

    for (let i = startRow; i < endRow; i++) {
      for (let j = startColumn; j < endColumn; j++) {
        if (this.grid[i][j] === value) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Uses backtracking to solve the sudoku
   * @param i Where to start the backtracking from
   * @returns true if the sudoku has been solved, false otherwise.
   */
  bruteForceSolve(i: number = 0): boolean {
    const gridSize = this.GRID_SIZE;

    if (this.hasNoMissingValues()) {
      return true;
    }

    const row = Math.floor(i / gridSize);
    const col = i % gridSize;

    if (this.grid[row][col] === 0) {
      let wasAnyMoveMade = false;

      for (let k = 1; k <= gridSize; k++) {
        if (!this.isLegalMove(row, col, k)) {
          continue;
        }

        wasAnyMoveMade = true;
        this.grid[row][col] = k;
        this.missingValues--;

        const hasBeenSolved = this.bruteForceSolve(i + 1);
        if (hasBeenSolved) {
          return true;
        }

        this.grid[row][col] = 0;
        this.missingValues++;
      }

      if (!wasAnyMoveMade) {
        return false;
      }
    } else {
      return this.bruteForceSolve(i + 1);
    }

    return false;
  }

  /**
   * Gets the possible values for a given column
   *
   * @param column The column number for which the possible values need to be fetched
   * @returns A record containing the possible values for each cell in the column
   */
  getColumnPossibleValues(column: number): Record<number, Set<number>> {
    const possibleValues: Record<number, Set<number>> = {};

    for (let i = 0; i < this.GRID_SIZE; i++) {
      possibleValues[i] = this.possibleValues[i][column];
    }

    return possibleValues;
  }

  /**
   * Reduces the search space for a given value using row-column interaction
   * Refer to Section 5.1 of the paper for more details
   *
   * @param value The value that needs to be reduced from the search space
   */
  rowColInteraction(value: number) {
    // Mainly for X-Wing

    // The first this.GRID_SIZE are for rows
    // The rest are for columns
    const g = this.blockg;
    g.reset();

    for (let i = 0; i < this.GRID_SIZE; i++) {
      for (let j = 0; j < this.GRID_SIZE; j++) {
        if (this.possibleValues[j][i].has(value)) {
          g.addEdge(i, j + this.GRID_SIZE);
        }
      }
    }

    const g2 = this.reduceGraph(g, this.blockg2, this.GRID_SIZE, this.SIZE);

    for (let i = this.GRID_SIZE; i < g2.vertices(); i++) {
      for (const edge of g2.outArray(i)) {
        const set = this.possibleValues[i - this.GRID_SIZE][edge];

        set.delete(value);

        if (set.size === 1) {
          this.toVisit.add((i - this.GRID_SIZE) * this.GRID_SIZE + edge);
        }
      }
    }
  }

  /**
   * This method is used to reduce the search space of a block.
   * blockRow and blowCol are the row and column number of the block
   * that needs to be reduced. For example, for a 9x9 sudoku, if blockRow = 6
   * and blockCol = 3, then the block that needs to be reduced is the 2nd vertical
   * block that's 1st from the left.
   *
   * @param blockRow Row number of the block that needs to be reduced
   * @param blockCol Column number of the block that needs to be reduced
   */
  blockInteraction(blockRow: number, blockCol: number) {
    const g = this.blockg;
    g.reset();
    const self = this;

    function possibleValueToGraphValue(value: number) {
      return value - 1 + self.SIZE ** 2;
    }

    const rowPossibleValues: Record<number, Set<number>> = {};

    for (let i = 0; i < this.SIZE; i++) {
      for (let j = 0; j < this.SIZE; j++) {
        const possibleValues = this.possibleValues[blockRow + i][blockCol + j];

        for (const value of possibleValues) {
          if (!rowPossibleValues[i * this.SIZE + j]) {
            rowPossibleValues[i * this.SIZE + j] = new Set<number>();
          }

          rowPossibleValues[i * this.SIZE + j].add(value);
        }
      }
    }

    // Spot layout:
    // 0 1 2
    // 3 4 5
    // 6 7 8

    for (const spot in rowPossibleValues) {
      for (const value of rowPossibleValues[spot]) {
        const translatedValue = possibleValueToGraphValue(value);
        g.addEdge(Number(spot), translatedValue);
      }
    }

    const g2 = this.reduceGraph(g, this.blockg2, this.GRID_SIZE, this.SIZE);

    const spotOffset = this.spotOffset;

    for (let i = this.GRID_SIZE; i < g2.vertices(); i++) {
      for (const edge of g2.outArray(i)) {
        const spot = edge;
        const offset = spotOffset[spot];

        const set =
          this.possibleValues[blockRow + offset[0]][blockCol + offset[1]];
        const value = i - this.GRID_SIZE + 1;

        set.delete(value);

        if (set.size === 1) {
          this.toVisit.add(
            (blockRow + offset[0]) * this.GRID_SIZE + blockCol + offset[1]
          );
        }
      }
    }
  }

  /**
   * This method is used to reduce the search space for a given value using
   * rows-blocks interactions. Refer to Section 5.3 of the paper for more details
   *
   * @param value The value that needs to be reduced from the search space
   * @param rowStart Use -1 to indicate that the column number is used. Otherwise, the row number
   * @param columnStart Use -1 to indicate that the row number is used. Otherwise, the column number
   */
  rowsBlocksInteractions(value: number, rowStart = -1, columnStart = -1): void {
    // For a 9x9 sudoku,
    // 0 1 2 vertices are the rows
    // 3 4 5 vertices are the blocks
    const g = this.rowBlockg;
    g.reset();

    // Iterate over the rows
    for (let i = 0; i < this.SIZE; i++) {
      // Iterate over the blocks
      for (let j = 0; j < this.SIZE; j++) {
        for (let k = 0; k < this.SIZE; k++) {
          let cellPossibleValues: Set<number>;

          if (rowStart === -1) {
            // Traverse the columns
            cellPossibleValues =
              this.possibleValues[j * this.SIZE + k][columnStart + i];
          } else {
            // Traverse the rows
            cellPossibleValues =
              this.possibleValues[rowStart + i][j * this.SIZE + k];
          }

          if (cellPossibleValues.has(value)) {
            g.addEdge(i, this.SIZE + j);
            break;
          }
        }
      }
    }

    const g2 = this.reduceGraph(g, this.rowBlockg2, this.SIZE, this.SIZE);

    for (let i = this.SIZE; i < g2.vertices(); i++) {
      for (const edge of g2.outArray(i)) {
        for (let j = 0; j < this.SIZE; j++) {
          let rowNum = edge + rowStart;
          let colNum = (i - this.SIZE) * this.SIZE + j;

          if (rowStart === -1) {
            colNum = edge + columnStart;
            rowNum = (i - this.SIZE) * this.SIZE + j;
          }

          const set = this.possibleValues[rowNum][colNum];

          set.delete(value);

          if (set.size === 1) {
            this.toVisit.add(rowNum * this.GRID_SIZE + colNum);
          }
        }
      }
    }
  }

  /**
   * Uses maximal matching along with Berge's theorem to reduce the search space
   * More details on the specifics can be found here: https://opensourc.es/blog/sudoku/
   *
   * @param g The graph that needs to be reduced
   * @param g2 The graph that will be used to store the reduced graph
   * @param matchExpectedSize Used for validation purposes. Checks if the matching
   * size is as expected
   * @param startI The offset where the matched vertices start
   * @returns
   */
  reduceGraph(g: Graph, g2: Graph, matchExpectedSize: number, startI: number) {
    // Overall complexity for dense graph is O(n^2.5) + O(n * n^2) + O(n + n^2) = O(n^3)
    // Overall complexity for sparse graph is O(n^1.5) + O(n * n) + O(n + n) = O(n^2)

    // O(n^2.5)
    const match = maximumMatching(g);
    if (match.size != matchExpectedSize) {
      throw new Error("Invalid matching");
    }

    g2.reset();

    // O(n * n^2)
    for (let i = 0; i < g.vertices(); i++) {
      for (const edge of g.outArray(i)) {
        if (match.get(i) === edge) {
          g2.addEdge(i, edge);
          continue;
        }

        g2.addEdge(edge, i);
      }
    }

    // O(n + n^2)
    const scc = strongComponents(g2);

    for (let i = startI; i < g2.vertices(); i++) {
      for (const edge of g2.outArray(i)) {
        if (scc.get(i) === scc.get(edge)) {
          g2.removeEdge(i, edge);
        }
      }
    }

    return g2;
  }

  /**
   * Reduces the search space of a given row or column. Refer to Section 5.2 of the paper
   *
   * @param row -1 means column number is used. Otherwise, the row with given row number's search
   * space is reduced
   * @param column -1 means row number is used. Otherwise, the column with given column number's
   * search space is reduced
   */
  rowBlockInteration(row: number = -1, column: number = -1) {
    // The first this.GRID_SIZE vertices are the spots where values can be placed
    // The next this.GRID_SIZE vertices are the values that can be placed
    const g = this.blockg;
    g.reset();

    const rowPossibleValues =
      column === -1
        ? this.possibleValues[row]
        : this.getColumnPossibleValues(column);

    for (const spot in rowPossibleValues) {
      for (const value of rowPossibleValues[spot]) {
        g.addEdge(Number(spot), value - 1 + this.GRID_SIZE);
      }
    }

    const g2 = this.reduceGraph(g, this.blockg2, this.GRID_SIZE, this.SIZE);

    for (let i = this.GRID_SIZE; i < g2.vertices(); i++) {
      for (const edge of g2.outArray(i)) {
        let set: Set<number>;
        if (column === -1) {
          set = this.possibleValues[row][edge];
        } else {
          set = this.possibleValues[edge][column];
        }

        set.delete(i - this.GRID_SIZE + 1);

        if (set.size === 1) {
          if (column === -1) {
            this.toVisit.add(row * this.GRID_SIZE + edge);
          } else {
            this.toVisit.add(edge * this.GRID_SIZE + column);
          }
        }
      }
    }
  }
}
