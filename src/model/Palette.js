import { Models } from "../3d/Models.js";
import Source from "./Source";

class Palette {
  // Parameters
  N;
  sizeFactor;
  allowedContradiction;
  groundMagnetism;

  // Positives examples
  positives; // array of Sources

  // Negatives examples
  negatives; // array of Sources

  constructor(arg) {
    // Default constructor
    if (arg === undefined || arg === null) {
      this.N = 3;
      this.sizeFactor = 10;
      this.allowedContradiction = 0.5;
      this.groundMagnetism = false;
      this.positives = [
        new Source({ matrix: Models.basicBuilding(), allowYRotation: false })
      ];
      this.negatives = [];
      return;
    }

    // Input parameters
    this.N = arg.N;
    this.sizeFactor = arg.sizeFactor;
    this.allowedContradiction = arg.allowedContradiction;
    this.groundMagnetism = arg.groundMagnetism;

    // Positives (copy)
    this.positives = arg.positives.map(src => src.clone());

    // Negatives (copy)
    this.negatives = arg.negatives.map(src => src.clone());
  }
}

export default Palette;
