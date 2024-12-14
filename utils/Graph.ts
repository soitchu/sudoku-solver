/**
 * CPSC 450, Fall 2024
 *
 * NAME: Suyash Kushwaha
 * DATE: Fall 2024
 */

export class Graph {
  public vertexCount: number;
  public edgeCount: number;
  public matrix: boolean[];

  constructor(vertices: number) {
    if (vertices <= 0) {
      throw new Error("Invalid number of vertices.");
    }

    this.vertexCount = vertices;
    this.matrix = new Array(vertices * vertices);
    this.reset();
  }

  reset(): void {
    const matrixLength = this.matrix.length;
    for(let i = 0; i < matrixLength; i++) {
      this.matrix[i] = false;
    }
    this.edgeCount = 0;
  }

  addEdge(x: number, y: number): void {
    if (!this.hasVertex(x) || !this.hasVertex(y)) {
      return;
    }

    const flattenedIndex = y + x * this.vertexCount;

    if (this.matrix[flattenedIndex]) {
      return;
    }

    this.matrix[flattenedIndex] = true;
    this.edgeCount++;
  }

  removeEdge(x: number, y: number): void {
    if (!this.hasVertex(x) || !this.hasVertex(y)) {
      return;
    }

    const flattenedIndex = y + x * this.vertexCount;

    if (!this.matrix[flattenedIndex]) {
      return;
    }

    this.matrix[flattenedIndex] = false;
    this.edgeCount--;
  }

  out(x: number): Set<number> {
    const outEdges = new Set<number>();

    if (!this.hasVertex(x)) {
      return outEdges;
    }

    for (let y = 0; y < this.vertexCount; ++y) {
      if (this.matrix[y + x * this.vertexCount]) {
        outEdges.add(y);
      }
    }

    return outEdges;
  }

  outArray(x: number): number[] {
    const outEdges: number[] = [];

    if (!this.hasVertex(x)) {
      return outEdges;
    }

    for (let y = 0; y < this.vertexCount; ++y) {
      if (this.matrix[y + x * this.vertexCount]) {
        outEdges.push(y);
      }
    }

    return outEdges;

  }

  in(x: number): Set<number> {
    const inEdges = new Set<number>();

    if (!this.hasVertex(x)) {
      return inEdges;
    }

    for (let y = 0; y < this.vertexCount; ++y) {
      if (this.matrix[y * this.vertexCount + x]) {
        inEdges.add(y);
      }
    }

    return inEdges;
  }

  inArray(x: number): number[] {
    const inEdges: number[] = [];

    if (!this.hasVertex(x)) {
      return inEdges;
    }

    for (let y = 0; y < this.vertexCount; ++y) {
      if (this.matrix[y * this.vertexCount + x]) {
        inEdges.push(y);
      }
    }

    return inEdges;
  }

  adj(x: number): Set<number> {
    const adjEdges = new Set<number>();

    if (!this.hasVertex(x)) {
      return adjEdges;
    }

    for (let y = 0; y < this.vertexCount; ++y) {
      if (
        this.matrix[y + x * this.vertexCount] ||
        this.matrix[y * this.vertexCount + x]
      ) {
        adjEdges.add(y);
      }
    }

    return adjEdges;
  }

  adjArray(x: number): number[] {
    const adjEdges: number[] = [];

    if (!this.hasVertex(x)) {
      return adjEdges;
    }

    for (let y = 0; y < this.vertexCount; ++y) {
      if (
        this.matrix[y + x * this.vertexCount] ||
        this.matrix[y * this.vertexCount + x]
      ) {
        adjEdges.push(y);
      }
    }

    return adjEdges;

  }

  hasEdge(x: number, y: number): boolean {
    if (!this.hasVertex(x) || !this.hasVertex(y)) {
      return false;
    }

    const flattenedIndex = y + x * this.vertexCount;
    return this.matrix[flattenedIndex];
  }

  hasVertex(x: number): boolean {
    return x >= 0 && x < this.vertexCount;
  }

  vertices(): number {
    return this.vertexCount;
  }

  edges(): number {
    return this.edgeCount;
  }
}
