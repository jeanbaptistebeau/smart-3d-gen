import { Models } from "../3d/Models.js";

class Palette {
  // Parameters
  N;
  sizeFactor;
  allowYRotation;

  // Positives examples
  positives; // array of Sources

  // Negatives examples
  negatives; // array of Sources

  constructor(arg) {
    // Default constructor
    if (arg === undefined || arg === null) {
      this.N = 3;
      this.sizeFactor = 10;
      this.allowYRotation = false;
      this.positives = [];
      this.negatives = [];
      return;
    }

    // Input parameters
    this.N = arg.N;
    this.sizeFactor = arg.sizeFactor;
    this.allowYRotation = arg.allowYRotation;

    // Positives (copy)
    this.positives = arg.positives.map(src => src.clone());

    // Negatives (copy)
    this.negatives = arg.negatives.map(src => src.clone());
  }
}

export default Palette;
