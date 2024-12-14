import { readFileSync, createReadStream, readdirSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";

const nytFiles = (await readdir("./data/nyt/")).filter((x) => x.endsWith(".sdk"));

export function getEmptyNxNGrid(n: number) {
  const sudokuGrid: number[][] = [];
  for(let i = 0; i < n; i++) {
    const row: number[] = [];
    for(let j = 0; j < n; j++) {
      row.push(0);
    }
    sudokuGrid.push(row);
  }

  return sudokuGrid;
}

export async function* getNYTSudokuGrid(limit: number): AsyncGenerator<number[][]> {
  // https://raw.githubusercontent.com/Abbe98/nyt-sudoku-scraper/refs/heads/master/sudoku/nyt-hard-2023-05-13.sdk
  // This is how the file looks like:

  // #SNew York Times
  // #B13-05-2023
  // 3.....84.
  // 657...3..
  // ....3....
  // .7...6..1
  // .4...5...
  // ...124..5
  // .26..8..9
  // .........
  // ...49..2.

  let count = 0;

  for (const fileName of nytFiles) {
    if (count++ >= limit) {
      break;
    }
    const text = await readFile(
      path.join(`./data/nyt/${fileName}`),
      "utf-8"
    );

    const lines = text.split("\n").slice(2);
    const grid: number[][] = [];

    for (const line of lines) {
      grid.push(line.split("").map((c) => (c === "." ? 0 : parseInt(c))));
    }

    yield grid;
  }
}

export async function* getProjectEulerSudokuGrid(limit: number): AsyncGenerator<number[][]> {
  // Format:
  // Grid 01
  // 003020600
  // 900305001
  // 001806400
  // 008102900
  // 700000008
  // 006708200
  // 002609500
  // 800203009
  // 005010300
  // Grid 02
  // 200080300
  // 060070084
  // 030500209
  // 000105408
  // 000000000
  // 402706000
  // 301007040
  // 720040060
  // 004010003...

  const file = await readFile("./data/project_euler_sudoku.txt", "utf-8");
  const lines = file.split("\n");
  let count = 0;

  for (let i = 0; i < lines.length; i += 10) {
    if (count++ >= limit) {
      break;
    }
    const grid: number[][] = [];

    for (let j = 1; j <= 9; j++) {
      grid.push(lines[i + j].split("").map((c) => parseInt(c)));
    }

    yield grid;
  }
}

export async function* getKaggle3MSudokuGrid(limit: number): AsyncGenerator<number[][]> {
  const fileStream = createReadStream("./data/sudoku-3m.csv");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let hasSkippedFirstLine = false;
  let count = 0;

  for await (const line of rl) {
    if (!hasSkippedFirstLine) {
      hasSkippedFirstLine = true;
      continue;
    }

    if(count++ >= limit) {
      break;
    }

    const [_, grid] = line.split(",");
    // grid looks something like: ......1.88......3....7..2.42...6....9.....4...865.3.......5......162.7...23..1...
    const gridArray: number[][] = [];

    for (let i = 0; i < 9; i++) {
      const row: number[] = [];
      for (let j = 0; j < 9; j++) {
        const c = grid[i * 9 + j];

        if (c === ".") {
          row.push(0);
        } else {
          row.push(parseInt(grid[i * 9 + j]));
        }
      }
      gridArray.push(row);
    }

    yield gridArray;
  }
}

export async function* getKaggle9MSudokuGrid(limit: number): AsyncGenerator<number[][]> {
  const fileStream = createReadStream("./data/sudoku-9m.csv");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let hasSkippedFirstLine = false;
  let count = 0;

  for await (const line of rl) {
    if (!hasSkippedFirstLine) {
      hasSkippedFirstLine = true;
      continue;
    }

    if(count++ >= limit) {
      break;
    }

    const [grid] = line.split(",");
    // grid looks something like: 070000043040009610800634900094052000358460020000800530080070091902100005007040802
    const gridArray: number[][] = [];

    for (let i = 0; i < 9; i++) {
      const row: number[] = [];
      for (let j = 0; j < 9; j++) {
        const c = grid[i * 9 + j];

        row.push(parseInt(grid[i * 9 + j]));
      }
      gridArray.push(row);
    }

    yield gridArray;
  }
}

export async function getSudokuGrid(
  type: "nyt" | "projectEuler" | "kaggle-3m" | "kaggle-9m",
  limit: number = Infinity
) {
  switch (type) {
    case "nyt":
      return {
        generator: getNYTSudokuGrid(limit),
        total: Math.min(limit, nytFiles.length),
      }
    case "projectEuler":
      return {
        generator: getProjectEulerSudokuGrid(limit),
        total: Math.min(limit, 50),
      }
    case "kaggle-3m":
      return {
        generator: getKaggle3MSudokuGrid(limit),
        total: Math.min(limit, 3_000_000),
      }
    case "kaggle-9m":
      return {
        generator: getKaggle9MSudokuGrid(limit),
        total: Math.min(limit, 9_000_000),
      }
  }
}
