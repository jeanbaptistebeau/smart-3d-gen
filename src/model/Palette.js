import React from "react";
import { Models } from "../3d/Models.js";

class Palette {
  // Parameters
  N;
  sizeFactor;
  allowYRotation;

  // Positives examples
  positives; // array of 3d array of boxes

  // Negatives examples
  negatives; // array of 3d array of boxes

  constructor(arg) {
    // Default constructor
    if (arg === undefined || arg === null) {
      this.N = 3;
      this.sizeFactor = 10;
      this.allowYRotation = false;
      this.positives = [Models.basicBuilding(), Models.complexBuilding()];
      this.negatives = [];
      return;
    }

    // Input parameters
    this.N = arg.N;
    this.sizeFactor = arg.sizeFactor;
    this.allowYRotation = arg.allowYRotation;

    // Positives (copy)
    this.positives = arg.positives.map(matrix => this.copyMatrix(matrix));

    // Negatives (copy)
    this.negatives = arg.negatives.map(matrix => this.copyMatrix(matrix));
  }

  copyMatrix(matrix) {
    let copy = Array(matrix.length);

    for (let x = 0; x < matrix.length; x++) {
      copy[x] = Array(matrix[x].length);
      for (let y = 0; y < matrix[x].length; y++) {
        copy[x][y] = Array(matrix[x][y].length);
        for (let z = 0; z < matrix[x][y].length; z++) {
          copy[x][y][z] = matrix[x][y][z];
        }
      }
    }

    return copy;
  }
}

export default Palette;
