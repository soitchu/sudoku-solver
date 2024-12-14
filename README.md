## Report
The report can be found [here](./project-writeup.pdf).

## Primary source
Sudoku as a Constraint Problem: [https://ai.dmi.unibas.ch/_files/teaching/fs13/ki/material/ki10-sudoku-inference.pdf](https://ai.dmi.unibas.ch/_files/teaching/fs13/ki/material/ki10-sudoku-inference.pdf)

## Download datasets
Make sure you have `curl` and `unzip` installed. Then all you'd need to do is run `kaggle.sh` to download the datasets.

## Running the performance tests
Make sure you have Node.js >= 22.6.0 installed. After downloading the datasets, you can run the performance tests with the following command:

```bash
    # Install dependencies
    npm install

    # Easy dataset
    node --experimental-strip-types index.ts --dataset kaggle-9m --limit 510000 --strategy constraint
    node --experimental-strip-types index.ts --dataset kaggle-9m --limit 510000 --strategy backtracking
    node --experimental-strip-types index.ts --dataset kaggle-9m --limit 510000 --strategy hybrid

    # Hard dataset
    node --experimental-strip-types index.ts --dataset kaggle-3m --limit 510000 --strategy constraint
    node --experimental-strip-types index.ts --dataset kaggle-3m --limit 510000 --strategy backtracking
    node --experimental-strip-types index.ts --dataset kaggle-3m --limit 510000 --strategy hybrid
```

It can take tens of minutes to run these commands (mainly due to the backtracking strategy). After it's done, 6 files will be generated in the `output` directory. These JSON files include an array of a tuple. The first element of the tuple is the time taken in milliseconds to solve the Sudoku. If it's negative, then it means it couldn't be solved. The second element is how many missing values were there in the Sudoku grid.

NOTE: Refer to "Running the CLI" section if you encounter any issues running the commands above.

## Evaluating the results
Running 

```bash
    node --experimental-strip-types evaluate.ts
```

will parse the output files and print the average time taken to solve the Sudoku grids per strategy, dataset, and missing values.

## Using the CLI
The CLI has the following arguments:
- `--dataset`: The dataset to use for the Sudoku grids. One of: kaggle-9m, kaggle-3m, nyt, projectEuler
- `--threads`: The number of threads to use for solving the Sudoku grids. Defaults to the number of cores available
- `--limit`: The number of Sudoku grids to solve. Defaults to 10,000
- `--strategy`: The strategy to use for solving the Sudoku grids. One of: backtracking, constraint, hybrid. Defaults to hybrid

## Running the CLI
You can run the CLI with any of the JavaScript engines: `node`, `deno`, or `bun`. However, `node` is recommended due to its superior performance in this case.

The following commands solve 10,000 Sudoku grids from the Kaggle 9 million dataset using 8 threads and the hybrid strategy:

<details>
<summary>Node.js</summary>
Make sure you have Node.js >= 22.6.0 installed.

```bash
node --experimental-strip-types index.ts --dataset kaggle-9m --threads 8 --limit 10000 --strategy hybrid
```
</details>

<details>
<summary>Deno</summary>

Any version of Deno should work.

```bash
deno -A index.ts --dataset kaggle-9m --threads 8 --limit 10000 --strategy hybrid
```

Note: `-A` is required to allow Deno to access the file system and other permissions. Using this flag is probably not the best idea, but it's fine for our use case.

</details>

<details>
<summary>Bun</summary>

Any version of Bun should work.

```bash
bun index.ts --dataset kaggle-9m --threads 8 --limit 10000 --strategy hybrid
```
</details>