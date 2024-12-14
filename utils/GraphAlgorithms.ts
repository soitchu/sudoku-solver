import { Graph } from "./Graph.ts";

/**
 * This function finds the strong components of a graph
 * Implementation is copied from HW6
 *
 * @param g The graph to find the strong components of
 * @returns A map from vertex to the strong component number
 */
export function strongComponents(g: Graph): Map<number, number> {
  const n = g.vertices();
  const adjacentNodesArrayReverse: number[][] = new Array(n);

  for (let i = 0; i < g.vertices(); i++) {
    adjacentNodesArrayReverse[i] = g.inArray(i);
  }

  let visited: boolean[] = new Array(n).fill(false);
  const linearizationSet: Set<number> = new Set();

  for (let source = 0; source < n; source++) {
    const iterI: number[] = new Array(n).fill(0);
    const stack: number[] = [];

    stack.push(source);

    while (stack.length > 0) {
      const vertex = stack[stack.length - 1];
      visited[vertex] = true;

      const adjacentNodes = adjacentNodesArrayReverse[vertex];
      const adjSize = adjacentNodes.length;
      let i = iterI[vertex];

      for (; i < adjSize; i++) {
        const v = adjacentNodes[i];
        if (!visited[v]) {
          stack.push(v);
          break;
        }
      }

      iterI[vertex] = i + 1;

      if (i === adjSize) {
        linearizationSet.add(vertex);
        stack.pop();
      }
    }
  }

  // Clear the array. JS is weird
  adjacentNodesArrayReverse.length = 0;

  const adjacentNodesArray: number[][] = new Array(n);

  for (let i = 0; i < g.vertices(); i++) {
    adjacentNodesArray[i] = g.outArray(i);
  }

  const linearization = Array.from(linearizationSet);

  // Reset visited array so we can perform DFS again
  for (let i = 0; i < n; i++) {
    visited[i] = false;
  }

  let componentNum = 0;
  const componentMap: Map<number, number> = new Map();
  const iterI: number[] = new Array(n).fill(0);

  for (let dfsPass = 0; dfsPass < n; dfsPass++) {
    const source = linearization[n - dfsPass - 1];

    if (visited[source]) {
      continue;
    }

    componentNum++;

    for(let i = 0; i < n; i++) {
      iterI[i] = 0;
    }
    
    const stack: number[] = [];

    stack.push(source);

    while (stack.length > 0) {
      const vertex = stack[stack.length - 1];
      visited[vertex] = true;

      const adjacentNodes = adjacentNodesArray[vertex];
      const adjSize = adjacentNodes.length;
      let i = iterI[vertex];

      for (; i < adjSize; i++) {
        const v = adjacentNodes[i];
        if (!visited[v]) {
          stack.push(v);
          break;
        }
      }

      iterI[vertex] = i + 1;

      if (i === adjSize) {
        componentMap.set(vertex, componentNum);
        visited[vertex] = true;
        stack.pop();
      }
    }
  }

  return componentMap;
}

export function maximumMatching(g: Graph) {
  return new MaximumMatching(g).maximumMatching();
}

/**
 * Maximum Matching using Hopcroft-Karp algorithm
 * This is a specific implementation for the sudoku solver
 * Given a Graph g with n vertices, tthe first n/2 vertices are
 * bipartite with the second n/2 vertices. It matches the
 * first n/2 vertices with the second n/2 vertices
 */
export class MaximumMatching {
  private g: Graph;
  private n: number;
  private match: Map<number, number>;
  private dist: number[];
  private NIL: number;
  private U: number[];
  private V: number[];

  constructor(g: Graph) {
    this.g = g;
    this.n = g.vertices();
    this.NIL = this.n;
    this.match = new Map();
    this.dist = new Array(this.n + 1);
    this.U = [];
    this.V = [];

    // This is specific to how maximal matching is called in the context of the sudoku solver
    // The first half of the vertices are bipartite with the second half
    const midPoint = Math.floor(this.n / 2);

    for (let i = 0; i < midPoint; i++) {
      this.U.push(i);
    }

    for (let i = midPoint; i < this.n; i++) {
      this.V.push(i);
    }

    for (let i = 0; i <= this.n; i++) {
      this.match.set(i, this.NIL);
    }
  }

  private bfs(): boolean {
    const queue: number[] = [];

    for (const u of this.U) {
      if (this.match.get(u) === this.NIL) {
        this.dist[u] = 0;
        queue.push(u);
      } else {
        this.dist[u] = Infinity;
      }
    }

    this.dist[this.NIL] = Infinity;

    while (queue.length > 0) {
      const u = queue.shift()!;
      if (this.dist[u] < this.dist[this.NIL]) {
        const neighbors = this.g.outArray(u);
        for (const v of neighbors) {
          if (this.match.has(v) && this.dist[this.match.get(v)!] === Infinity) {
            this.dist[this.match.get(v)!] = this.dist[u] + 1;
            queue.push(this.match.get(v)!);
          }
        }
      }
    }

    return this.dist[this.NIL] !== Infinity;
  }

  private dfs(u: number): boolean {
    if (u !== this.NIL) {
      const neighbors = this.g.outArray(u);
      for (const v of neighbors) {
        if (
          this.match.has(v) &&
          this.dist[this.match.get(v)!] === this.dist[u] + 1
        ) {
          if (this.dfs(this.match.get(v)!)) {
            this.match.set(u, v);
            this.match.set(v, u);
            return true;
          }
        }
      }
      this.dist[u] = Infinity;
      return false;
    }
    return true;
  }

  public maximumMatching(): Map<number, number> {
    while (this.bfs()) {
      for (const u of this.U) {
        if (this.match.get(u) === this.NIL) {
          this.dfs(u);
        }
      }
    }
    const n = this.g.vertices();

    for (const [key, value] of this.match) {
      if (value === this.NIL || key >= n / 2) {
        this.match.delete(key);
      }
    }

    return this.match;
  }
}
