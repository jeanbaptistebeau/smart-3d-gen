import VoxelDrawer from "./VoxelDrawer.js";

export var Models = {
  basicBuilding: function() {
    var drawer = new VoxelDrawer(18, 18, 18);

    // Main
    drawer.draw(5, 12, 0, 12, 5, 12, 0x34495e);

    // Roof
    drawer.draw(5, 12, 13, 13, 5, 12, 0xbdc3c7);
    drawer.draw(6, 11, 13, 13, 6, 11, -1);

    // Pillars
    drawer.draw(5, 5, 0, 13, 5, 5, 0xbdc3c7);
    drawer.draw(12, 12, 0, 13, 5, 5, 0xbdc3c7);
    drawer.draw(5, 5, 0, 13, 12, 12, 0xbdc3c7);
    drawer.draw(12, 12, 0, 13, 12, 12, 0xbdc3c7);

    return drawer.matrix;
  },

  cube: function(color) {
    var drawer = new VoxelDrawer(18, 18, 18);

    // Main
    drawer.draw(5, 12, 5, 12, 5, 12, color);

    // Sides
    drawer.draw(5, 5, 5, 12, 5, 5, 0xbdc3c7);
    drawer.draw(12, 12, 5, 12, 5, 5, 0xbdc3c7);
    drawer.draw(5, 5, 5, 12, 12, 12, 0xbdc3c7);
    drawer.draw(12, 12, 5, 12, 12, 12, 0xbdc3c7);

    // Top
    drawer.draw(5, 12, 12, 12, 5, 5, 0xbdc3c7);
    drawer.draw(5, 12, 12, 12, 12, 12, 0xbdc3c7);
    drawer.draw(5, 5, 12, 12, 5, 12, 0xbdc3c7);
    drawer.draw(12, 12, 12, 12, 5, 12, 0xbdc3c7);

    // Bottom
    drawer.draw(5, 12, 5, 5, 5, 5, 0xbdc3c7);
    drawer.draw(5, 12, 5, 5, 12, 12, 0xbdc3c7);
    drawer.draw(5, 5, 5, 5, 5, 12, 0xbdc3c7);
    drawer.draw(12, 12, 5, 5, 5, 12, 0xbdc3c7);

    return drawer.matrix;
  },

  hairlineTower: function() {
    var drawer = new VoxelDrawer(18, 18, 18);

    drawer.draw(6, 6, 0, 1, 6, 6, 0x3498db);
    drawer.draw(6, 6, 2, 5, 6, 6, 0x95a5a6);
    drawer.draw(6, 6, 6, 6, 6, 6, 0x2c3e50);

    return drawer.matrix;
  },

  table: function() {
    var drawer = new VoxelDrawer(18, 18, 18);

    // Top
    drawer.draw(5, 12, 7, 7, 5, 12, 0xbdc3c7);
    drawer.draw(6, 11, 7, 7, 6, 11, 0x9b59b6);
    // drawer.draw(5, 12, 8, 8, 5, 12, 0xecf0f1);
    // drawer.draw(5, 12, 9, 9, 5, 12, 0xecf0f1);

    // Feet
    drawer.draw(5, 5, 0, 7, 5, 5, 0xbdc3c7);
    drawer.draw(5, 5, 0, 7, 12, 12, 0xbdc3c7);
    drawer.draw(12, 12, 0, 7, 5, 5, 0xbdc3c7);
    drawer.draw(12, 12, 0, 7, 12, 12, 0xbdc3c7);

    return drawer.matrix;
  },

  pyramid: function() {
    var drawer = new VoxelDrawer(18, 18, 18);

    // Layers
    drawer.draw(2, 15, 0, 0, 2, 15, 0xc0392b);
    drawer.draw(3, 14, 1, 1, 3, 14, 0xc0392b);
    drawer.draw(4, 13, 2, 2, 4, 13, 0xc0392b);
    drawer.draw(5, 12, 3, 3, 5, 12, 0xc0392b);
    drawer.draw(6, 11, 4, 4, 6, 11, 0xc0392b);
    drawer.draw(7, 10, 5, 5, 7, 10, 0xc0392b);
    drawer.draw(8, 9, 6, 6, 8, 9, 0xc0392b);

    return drawer.matrix;
  },

  ground: function() {
    var drawer = new VoxelDrawer(18, 18, 18);

    drawer.draw(0, 17, 0, 1, 0, 17, 0x34495e);

    return drawer.matrix;
  },

  complexBuilding: function() {
    var drawer = new VoxelDrawer(31, 31, 31);

    const white = 0xfdfdfe;
    const green = 0x80b27e;
    const brown = 0x7b6162;
    const cyan = 0x81e1fb;
    const gray = 0x9c9c9c;

    // Main building
    drawer.draw(7, 21, 6, 6, 7, 21, white);
    drawer.draw(8, 20, 0, 16, 8, 20, green);

    // Arches
    drawer.draw(9, 9, 0, 2, 21, 21, white);
    drawer.draw(13, 13, 0, 2, 21, 21, white);
    drawer.draw(15, 15, 0, 2, 21, 21, white);
    drawer.draw(19, 19, 0, 2, 21, 21, white);
    drawer.drawSingle(10, 3, 21, white);
    drawer.drawSingle(11, 4, 21, white);
    drawer.drawSingle(12, 3, 21, white);
    drawer.drawSingle(16, 3, 21, white);
    drawer.drawSingle(17, 4, 21, white);
    drawer.drawSingle(18, 3, 21, white);

    // Arches background
    drawer.draw(10, 12, 0, 3, 20, 20, brown);
    drawer.draw(16, 18, 0, 3, 20, 20, brown);

    // Balconies
    drawer.draw(8, 11, 8, 8, 21, 21, white);
    drawer.draw(17, 20, 8, 8, 21, 21, white);
    drawer.draw(8, 11, 12, 12, 21, 21, white);
    drawer.draw(17, 20, 12, 12, 21, 21, white);

    // Windows
    drawer.draw(9, 10, 9, 11, 20, 20, cyan);
    drawer.draw(13, 13, 9, 11, 20, 20, cyan);
    drawer.draw(15, 15, 9, 11, 20, 20, cyan);
    drawer.draw(18, 19, 9, 11, 20, 20, cyan);
    drawer.draw(9, 10, 13, 15, 20, 20, cyan);
    drawer.draw(13, 13, 13, 15, 20, 20, cyan);
    drawer.draw(15, 15, 13, 15, 20, 20, cyan);
    drawer.draw(18, 19, 13, 15, 20, 20, cyan);

    // Roof
    drawer.draw(7, 21, 17, 18, 7, 21, white);
    drawer.draw(8, 20, 17, 17, 8, 20, gray);
    drawer.draw(8, 20, 18, 18, 8, 20, -1);

    return drawer.matrix;
  },

  leCorbusier: function() {
    var drawer = new VoxelDrawer(45, 45, 45);

    const color = 0xecf0f1;

    const floor_height = 14;
    const floor1 = 4;
    const floor2 = floor1 + floor_height;
    const floor3 = floor2 + floor_height;

    // Floors
    drawer.draw(3, 22, floor1 - 1, floor1, 0, 28, color);
    drawer.draw(3, 22, floor2 - 1, floor2, 0, 28, color);
    drawer.draw(3, 22, floor3 - 1, floor3, 0, 28, color);

    // Floors extensions
    drawer.draw(3, 9, floor1 - 1, floor1, 29, 36, color);
    drawer.draw(3, 5, floor1 - 1, floor1, 32, 36, -1);
    drawer.draw(3, 9, floor2 - 1, floor2, 29, 36, color);
    drawer.draw(3, 5, floor2 - 1, floor2, 32, 36, -1);
    drawer.draw(3, 9, floor3 - 1, floor3, 29, 36, color);
    drawer.draw(3, 5, floor3 - 1, floor3, 32, 36, -1);

    // Stairs
    const half_height = floor_height / 2;
    for (let i = 0; i < half_height; i++) {
      let x = 10 + i;

      drawer.draw(x, x, floor1 + 1 + i, floor1 + 1 + i, 33, 36, color);
      drawer.draw(x, x, floor2 - 1 - i, floor2 - 1 - i, 29, 32, color);
      drawer.draw(x, x, floor2 + 1 + i, floor2 + 1 + i, 33, 36, color);
      drawer.draw(x, x, floor3 - 1 - i, floor3 - 1 - i, 29, 32, color);
    }

    // Stairs platform
    let x = 10 + half_height;
    let y1 = floor1 + half_height;
    let y2 = floor2 + half_height;
    drawer.draw(x, x + 2, y1, y1, 29, 36, color);
    drawer.draw(x, x + 2, y2, y2, 29, 36, color);

    // Pillars
    drawer.draw(5, 5, floor1, floor3, 1, 1, color);
    drawer.draw(17, 17, floor1, floor3, 1, 1, color);
    drawer.draw(5, 5, floor1, floor3, 14, 14, color);
    drawer.draw(17, 17, floor1, floor3, 14, 14, color);
    drawer.draw(5, 5, floor1, floor3, 27, 27, color);
    drawer.draw(17, 17, floor1, floor3, 27, 27, color);

    // Bases
    drawer.draw(4, 6, 0, 2, 0, 2, color);
    drawer.draw(16, 18, 0, 2, 0, 2, color);
    drawer.draw(4, 6, 0, 2, 13, 15, color);
    drawer.draw(16, 18, 0, 2, 13, 15, color);
    drawer.draw(4, 6, 0, 2, 26, 28, color);
    drawer.draw(16, 18, 0, 2, 26, 28, color);

    return drawer.matrix;
  }
};
