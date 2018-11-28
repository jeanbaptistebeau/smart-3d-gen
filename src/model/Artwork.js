class Artwork {
  // Inputs
  N;
  sizeFactor;
  allowYRotation;
  sourceScene;

  // Output
  output; // 3d array of boxes

  // Rendering
  positionsToDraw;

  constructor(_N, _sizeFactor, _allowYRotation, _sourceScene) {
    // Input parameters
    this.N = _N;
    this.sizeFactor = _sizeFactor;
    this.allowYRotation = _allowYRotation;
    this.sourceScene = _sourceScene;

    this.positionsToDraw = [];

    // Output array & rendering
    this.output = Array(this.sizeFactor);
    for (let x = 0; x < this.sizeFactor; x++) {
      this.output[x] = Array(this.sizeFactor);
      for (let y = 0; y < this.sizeFactor; y++) {
        this.output[x][y] = Array(this.sizeFactor);
        for (let z = 0; z < this.sizeFactor; z++) {
          this.positionsToDraw.push({ x: x, y: y, z: z });
          this.output[x][y][z] = {
            position: { x: x, y: y, z: z },
            voxels: null,
            uncertainty: 1
          };
        }
      }
    }
  }

  update(boxes) {
    this.positionsToDraw = [];

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      const { x, y, z } = box.position;

      this.output[x][y][z] = box;
      this.positionsToDraw.push(box.position);
    }
  }

  // When finished, set to draw everything
  conclude() {
    this.positionsToDraw = [];
    for (let x = 0; x < this.sizeFactor; x++) {
      for (let y = 0; y < this.sizeFactor; y++) {
        for (let z = 0; z < this.sizeFactor; z++) {
          this.positionsToDraw.push({ x: x, y: y, z: z });
        }
      }
    }
  }
}

export default Artwork;
