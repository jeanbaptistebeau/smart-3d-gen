class VoxelDrawer {
  width;
  height;
  depth;

  matrix;

  constructor(w, h, d) {
    this.width = w;
    this.height = h;
    this.depth = d;

    this.matrix = Array(w);
    for (let x = 0; x < w; x++) {
      this.matrix[x] = Array(h);
      for (let y = 0; y < h; y++) {
        this.matrix[x][y] = Array(d);
        for (let z = 0; z < d; z++) {
          this.matrix[x][y][z] = -1;
        }
      }
    }
  }

  draw(x1, x2, y1, y2, z1, z2, value) {
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        for (let z = z1; z <= z2; z++) {
          this.matrix[x][y][z] = value;
        }
      }
    }
  }

  drawSingle(x, y, z, value) {
    this.matrix[x][y][z] = value;
  }
}

export default VoxelDrawer;
