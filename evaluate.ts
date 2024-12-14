import fs from "node:fs";
import { createHistogram } from "node:perf_hooks";

const timeFileNames = fs.readdirSync("./output");

for (const timeFileName of timeFileNames) {
  console.log("=========", timeFileName, "=========");
  const timeTaken = JSON.parse(
    fs.readFileSync("./output/" + timeFileName, "utf-8")
  );

  const histogram = createHistogram();
  // Remove the first 10,000 elements to account for the warmup
  timeTaken.splice(0, 10000);

  const timeTakenMap: Map<number, number[]> = new Map();
  const unsolvedMap: Map<number, number> = new Map();

  let solved = 0;
  for (const [time, missingValues] of timeTaken) {
    if (time < 0) {
      if (!unsolvedMap.has(missingValues)) {
        unsolvedMap.set(missingValues, 0);
      }

      unsolvedMap.set(missingValues, unsolvedMap.get(missingValues)! + 1);
      continue;
    }

    solved++;

    // Convert to microseconds
    const timeMicroseconds = Math.floor(time * 1000);

    if (!timeTakenMap.has(missingValues)) {
      timeTakenMap.set(missingValues, []);
    }

    timeTakenMap.get(missingValues)!.push(timeMicroseconds);
  }

  const missingValues = Array.from(timeTakenMap.keys()).sort((a, b) => a - b);

  const output: Record<number, [number, number]> = {};
  for (const missingValue of missingValues) {
    const times = timeTakenMap.get(missingValue)!;
    histogram.reset();

    for (const time of times) {
      histogram.record(time);
    }

    const solved = times.length;
    const unsolved = unsolvedMap.get(missingValue) || 0;

    output[missingValue] = [
      histogram.mean,
      (solved / (solved + unsolved)) * 100,
    ];

    console.log("Missing values:", missingValue, "Average time:", histogram.mean.toFixed(2) + "µs", "Percentage solved:", (solved / (solved + unsolved)) * 100);
  }

  for (let i = 50; i <= 60; i += 2) {
    let aggregateMean = 0;
    let aggregatePercentageSolved = 0;
    let total = 0;

    for(let j = 0; j < 2; j++) {
      if(!output[i + j]) {
        continue;
      }

      const [mean, percentageSolved] = output[i + j];
      aggregateMean += mean;
      aggregatePercentageSolved += percentageSolved;
      total++;
    }

    const mean = aggregateMean / total;
    const percentageSolved = aggregatePercentageSolved / total;

    console.log(`${i} - ${i + 1}: ${mean.toFixed(2)} ${percentageSolved.toFixed(2)}`);
  }
}
