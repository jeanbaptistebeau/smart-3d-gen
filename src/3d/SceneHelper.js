import * as THREE from "three";

const UNIT = 1;

export var scene = {
  width: null,
  heigth: null,
  depth: null,

  cameraPosition: null,
  lightPosition: null,
  center: null,

  init: function(w, h, d) {
    this.width = w * UNIT;
    this.height = h * UNIT;
    this.depth = d * UNIT;

    this.center = new THREE.Vector3(
      this.width / 2,
      this.height / 4,
      this.depth / 2
    );

    this.cameraPosition = new THREE.Vector3(
      this.width * 2,
      this.height * 1.5,
      this.depth * 1.8
    );

    this.lightPosition = new THREE.Vector3(
      this.width * 1.5,
      this.height * 1.5,
      this.depth * 1.5
    );
  },

  // Set object reference to corner
  moveToCorner: function(object, w, h, d) {
    const length = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2) + Math.pow(d, 2));
    const vector = new THREE.Vector3(w / length, h / length, d / length);
    object.translateOnAxis(vector, length / 2);
  },

  // Creates a set of voxel meshes
  voxelMeshes: function(voxels, origin) {
    var voxelMeshes = [];

    for (var i = 0; i < voxels.length; i++) {
      const v = voxels[i];
      if (v.value !== -1) {
        voxelMeshes.push(
          this.voxelMesh(
            origin.x + v.x,
            origin.y + v.y,
            origin.z + v.z,
            v.value
          )
        );
      }
    }

    return voxelMeshes;
  },

  // Creates a voxel mesh at the given coordinates
  voxelMesh: function(x, y, z, color) {
    const geometry = new THREE.BoxGeometry(UNIT, UNIT, UNIT);
    const material = new THREE.MeshLambertMaterial({ color: color });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(x * UNIT, y * UNIT, z * UNIT);
    this.moveToCorner(cube, UNIT, UNIT, UNIT);
    return cube;
  },

  // Creates an undefined mesh at the given coordinates
  undefinedMesh: function(origin, size, uncertainty) {
    const realSize = size * 0.5 * UNIT;
    const geometry = new THREE.BoxGeometry(realSize, realSize, realSize);

    const color = uncertainty === 1 ? 0x000000 : 0xff9505;

    var material = new THREE.MeshLambertMaterial({ color: color });
    material.transparent = true;
    material.opacity = 0.2 + (1 - uncertainty) * 0.6;

    const cube = new THREE.Mesh(geometry, material);

    const offset = size * 0.25 * UNIT;
    cube.position.set(
      origin.x * UNIT + offset,
      origin.y * UNIT + offset,
      origin.z * UNIT + offset
    );
    this.moveToCorner(cube, realSize, realSize, realSize);
    return cube;
  },

  // Creates wireframes for the world
  wireframe: function() {
    const w = this.width,
      h = this.height,
      d = this.depth;
    const world = new THREE.BoxGeometry(w, h, d);
    const worldBorders = new THREE.EdgesGeometry(world);
    const mat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 4 });
    const wireframe = new THREE.LineSegments(worldBorders, mat);
    wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd

    this.moveToCorner(wireframe, w, h, d);
    return wireframe;
  },

  // Creates ground for the world
  ground: function() {
    const geometry = new THREE.BoxGeometry(this.width, UNIT, this.depth);
    const material = new THREE.MeshLambertMaterial({ color: "#ECEBE4" });
    const ground = new THREE.Mesh(geometry, material);
    ground.position.set(0, -UNIT, 0);
    this.moveToCorner(ground, this.width, UNIT, this.depth);

    return ground;
  }
};
