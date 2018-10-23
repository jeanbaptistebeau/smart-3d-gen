// THIS FILE IS NOT USED ANYMORE

// 3D Grid
export class VoxelMatrix {
  constructor(w, h, d) {
    this.width = w;
    this.height = h;
    this.depth = d;
    this.voxels = [];

    // Represents a box of adjacent voxels that are the same
    // Better for drawing efficiency
    this.voxelBoxes = [];
  }

  iterate(f) {
    var voxel;
    this.voxels.forEach(function(item, index, array) {
      f(item);
    });
  }

  set(voxels, boxes) {
    this.voxels = voxels;
    this.voxelBoxes = boxes;
  }
}
