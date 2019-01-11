import VoxelDrawer from "./VoxelDrawer.js";

export var Models = {
  basicBuilding: function() {
    var drawer = new VoxelDrawer(18, 18, 18);

    drawer.draw(6, 11, 0, 5, 6, 11, 0x700548);
    drawer.draw(6, 11, 6, 9, 6, 11, 0x362023);
    drawer.draw(6, 11, 10, 10, 6, 11, 0xaaaaaa);
    drawer.draw(7, 10, 10, 10, 7, 10, -1);

    return drawer.matrix;
  },

  hairlineTower: function() {
    var drawer = new VoxelDrawer(18, 18, 18);

    drawer.draw(6, 6, 0, 1, 6, 6, 0x3498db);
    drawer.draw(6, 6, 2, 5, 6, 6, 0x95a5a6);
    drawer.draw(6, 6, 6, 6, 6, 6, 0x2c3e50);

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
  }
};
