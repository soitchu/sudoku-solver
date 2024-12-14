import { Sudoku } from "./utils/Sudoku.ts";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} from "node:worker_threads";
import os from "node:os";
import { getSudokuGrid } from "./utils/helper.ts";
import { program } from "commander";

// TODO: Node.js doesn't support exporting types yet, so we need to define the Strategy type here
type Strategy = "backtracking" | "constraint" | "hybrid";

if (isMainThread) {
  program
    .version("0.0.1")
    .name("sudoku-solver")
    .description(
      "A Sudoku solver using backtracking and constraint programming"
    )
    .requiredOption(
      "--dataset <dataset-name>",
      "The dataset to use for the Sudoku grids. One of: kaggle-9m, kaggle-3m, nyt, projectEuler"
    )
    .option(
      "--threads <threads>",
      "The number of threads to use for solving the Sudoku grids. Defaults to the number of cores available",
      os.cpus().length.toString()
    )
    .option(
      "--limit <limit>",
      "The number of Sudoku grids to solve. Defaults to 10,000",
      "10000"
    )
    .option(
      "--strategy <strategy>",
      "The strategy to use for solving the Sudoku grids. One of: backtracking, constraint, hybrid. Defaults to hybrid",
      "hybrid"
    )
    .helpOption("-h, --help", "Display help for command")

    .parse();

  const options = program.opts();
  const strategies = ["backtracking", "constraint", "hybrid"];
  const datasetNames = ["kaggle-9m", "kaggle-3m", "nyt", "projectEuler"];
  const dataset = options.dataset;
  const strategy = options.strategy as Strategy;
  const limit = parseInt(options.limit);
  const threads = Math.min(limit, parseInt(options.threads));

  if (!datasetNames.includes(dataset)) {
    console.log(
      `Invalid dataset. Please provide one of the following options: \n- ${datasetNames.join(
        "\n- "
      )}`
    );
    process.exit(1);
  }

  if (!strategies.includes(options.strategy)) {
    console.log(
      `Invalid strategy. Please provide one of the following options: \n- ${strategies.join(
        "\n- "
      )}`
    );
    process.exit(1);
  }

  const { generator: sudokuGenerator, total: totalGrids } = await getSudokuGrid(
    dataset as "kaggle-9m" | "kaggle-3m" | "nyt" | "projectEuler",
    parseInt(options.limit)
  );
  const timeTakenArray: [number, number][] = Array(totalGrids);
  const __filename = fileURLToPath(import.meta.url);
  const started = Date.now();

  let total = 0;
  let solved = 0;
  let totalTimeTaken = 0;
  let sudokuGridCount = -1;

  let hasFinished = 0;
  const workers: Worker[] = [];

  /**
   *
   * @param workerId The worker ID to send the message to
   * @param sudokuGrid The sudoku grid to send to the worker
   * @param currentSudokuCount The current sudoku count, used to get the index in the timeTakenArray
   */
  function sendToWorker(
    workerId: number,
    sudokuGrid: number[][],
    currentSudokuCount: number
  ) {
    workers[workerId].postMessage([sudokuGrid, currentSudokuCount, strategy]);
  }

  /**
   * This function gets the next sudoku grid from the Kaggle dataset
   *
   * @returns The next sudoku grid from the Kaggle dataset
   */
  async function getNextSudokuGrid() {
    const gridGen = await sudokuGenerator.next();

    if (gridGen.done) {
      return null;
    }

    sudokuGridCount++;
    return gridGen.value;
  }

  for (let i = 0; i < threads; i++) {
    const worker = new Worker(__filename, { workerData: i });

    worker.on(
      "message",
      async (message: {
        wasSolved: boolean;
        timeTakenMS: number;
        sudokuCount: number;
        workerData: number;
        missingValues: number;
      }) => {
        // The worker has finished solving the sudoku
        const { workerData, timeTakenMS, sudokuCount, missingValues } = message;

        // Update the stats
        if (message.wasSolved) {
          timeTakenArray[sudokuCount] = [timeTakenMS, missingValues];
          totalTimeTaken += timeTakenMS;
          solved++;
        } else {
          timeTakenArray[sudokuCount] = [-timeTakenMS, missingValues];
        }

        total++;

        // Log the progress
        if (total % 100 === 0) {
          console.log(
            `Solved ${solved} out of ${total} in ${
              Date.now() - started
            }ms. Average time taken to solve a Sudoku: ${
              totalTimeTaken / solved
            }ms`
          );
        }

        // Get the next sudoku grid
        const nextSudokuGrid = await getNextSudokuGrid();

        if (nextSudokuGrid) {
          // Send the next sudoku grid to the current worker
          sendToWorker(workerData, nextSudokuGrid, sudokuGridCount);
        } else {
          // No more sudoku grids left
          hasFinished++;

          // If all workers have finished, write the time taken array to disk
          if (hasFinished === threads) {
            console.log(
              `Solved ${solved} out of ${total} in ${Date.now() - started}ms`
            );
            writeFileSync(
              `./output/${dataset}-${limit}-${strategy}.json`,
              JSON.stringify(timeTakenArray)
            );
            console.log("Completed");
            process.exit(0);
          }
        }
      }
    );
    workers.push(worker);
  }

  // This is done to avoid a bug where the workers don't
  // receive the first message in deno
  for (let i = 0; i < threads; i++) {
    workers[i].postMessage([undefined, undefined, undefined]);
  }

  // Start the workers
  for (let i = 0; i < threads; i++) {
    const sudokuGrid = await getNextSudokuGrid();

    if (sudokuGrid) {
      sendToWorker(i, sudokuGrid, sudokuGridCount);
    }
  }
} else {
  parentPort!.on(
    "message",
    ([sudokuGrid, sudokuCount, strategy]: [number[][], number, Strategy]) => {
      if (sudokuGrid === undefined) return;

      const start = performance.now();
      const sudoku = new Sudoku(sudokuGrid, 3);
      const missingValues = sudoku.missingValues;

      sudoku.solve(strategy);
      const timeTakenMS = performance.now() - start;

      let wasSolved = false;

      if (sudoku.hasBeenCorrectlySolved()) {
        wasSolved = true;
      }

      parentPort!.postMessage({
        wasSolved,
        timeTakenMS,
        sudokuCount,
        workerData,
        missingValues
      });
    }
  );
}
