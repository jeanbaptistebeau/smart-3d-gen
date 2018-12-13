import React from "react";
import Palette from "./Palette.js";

class Artwork {
  // Palette (inputs)
  palette;

  // Output
  output; // 3d array of boxes

  // Rendering
  positionsToDraw;

  constructor(_palette) {
    // Palette
    this.palette = new Palette(_palette);

    // Rendering
    this.positionsToDraw = [];

    // Output array & rendering
    this.output = Array(this.palette.sizeFactor);
    for (let x = 0; x < this.palette.sizeFactor; x++) {
      this.output[x] = Array(this.palette.sizeFactor);
      for (let y = 0; y < this.palette.sizeFactor; y++) {
        this.output[x][y] = Array(this.palette.sizeFactor);
        for (let z = 0; z < this.palette.sizeFactor; z++) {
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
