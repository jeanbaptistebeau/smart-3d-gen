class Source {
  // Arguments
  matrix;
  snapshot;
  allowYRotation;

  constructor(arg) {
    // Input parameters
    this.matrix = arg.matrix;
    this.snapshot = arg.snapshot;
    this.allowYRotation = arg.allowYRotation;
  }

  clone() {
    let arg = { snapshot: this.snapshot, allowYRotation: this.allowYRotation };

    // Matrix
    arg.matrix = Array(this.matrix.length);
    for (let x = 0; x < this.matrix.length; x++) {
      arg.matrix[x] = Array(this.matrix[x].length);
      for (let y = 0; y < this.matrix[x].length; y++) {
        arg.matrix[x][y] = Array(this.matrix[x][y].length);
        for (let z = 0; z < this.matrix[x][y].length; z++) {
          arg.matrix[x][y][z] = this.matrix[x][y][z];
        }
      }
    }

    return new Source(arg);
  }
}

export default Source;
