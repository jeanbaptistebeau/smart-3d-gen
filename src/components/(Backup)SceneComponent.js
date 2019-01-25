import React, { Component } from "react";
import * as THREE from "three";
import { sceneHelper } from "../3d/SceneHelper.js";

const OrbitControls = require("three-orbit-controls")(THREE);

class SceneComponent extends Component {
  sceneBuilted = false;
  tiles;
  currentCamera = null;

  render() {
    return (
      <div
        className={this.props.className}
        ref={mount => {
          this.mount = mount;
        }}
        style={this.props.style}
      />
    );
  }

  componentDidMount() {
    this.renderScene = this.renderScene.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    window.addEventListener("resize", this.onWindowResize);

    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    // window.addEventListener( 'resize', this.onWindowResize, false );

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setClearColor("#F8F9FF");
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.currentCamera = this.camera;

    // Secondary Camera
    this.secondaryCamera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      0.1,
      1000
    );

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener("change", this.renderScene);
    this.controls.enablePan = false;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 100;
    this.controls.maxPolarAngle = Math.PI / 2;

    // Scene
    this.scene = new THREE.Scene();

    // Update
    this.componentDidUpdate();
  }

  buildScene() {
    const { palette } = this.props.artwork;
    const { sizeFactor, N } = palette;

    // Scene
    this.scene = new THREE.Scene();

    // SceneHelper
    sceneHelper.init(sizeFactor * N, sizeFactor * N, sizeFactor * N);

    // Camera - Update
    const cPos = sceneHelper.cameraPosition;
    this.camera.position.set(cPos.x, cPos.y, cPos.z);
    this.camera.lookAt(sceneHelper.center);
    this.secondaryCamera.lookAt(sceneHelper.center);

    // Secondary Camera - Update
    this.secondaryCamera.position.set(60, 45, 54);
    this.secondaryCamera.lookAt(sceneHelper.center);
    this.secondaryCamera.zoom = 9;
    this.secondaryCamera.updateProjectionMatrix();

    // Controls - Update
    this.controls.target = sceneHelper.center;

    // Light
    const light = new THREE.SpotLight(0xfffae8, 0.5);
    const lPos = sceneHelper.lightPosition;
    light.position.set(lPos.x, lPos.y, lPos.z);
    this.scene.add(light);

    // const lightHelper = new THREE.SpotLightHelper(light);
    // this.scene.add(lightHelper);

    var amb = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(amb);

    // Wireframe
    // this.scene.add(sceneHelper.wireframe());

    // Ground
    const ground = sceneHelper.ground();
    this.scene.add(ground);

    // Meshes
    this.tiles = Array(sizeFactor);
    for (var x = 0; x < sizeFactor; x++) {
      this.tiles[x] = Array(sizeFactor);
      for (var y = 0; y < sizeFactor; y++) {
        this.tiles[x][y] = Array(sizeFactor);
        for (var z = 0; z < sizeFactor; z++) {
          const specialMesh = sceneHelper.undefinedMesh(
            { x: x * N, y: y * N, z: z * N },
            N,
            1
          );
          this.scene.add(specialMesh);
          this.tiles[x][y][z] = {
            matrix: this.emptyVoxelMatrix(N),
            specialMesh: specialMesh,
            voxelsAreHidden: true
          };
        }
      }
    }

    this.sceneBuilted = true;
  }

  emptyVoxelMatrix(N) {
    let matrix = new Array(N);
    for (var x = 0; x < N; x++) {
      matrix[x] = Array(N);
      for (var y = 0; y < N; y++) {
        matrix[x][y] = Array(N);
        for (var z = 0; z < N; z++) {
          const voxel = sceneHelper.voxelMesh(x, y, z, null);
          voxel.material.opacity = 0;
          matrix[x][y][z] = voxel;
          this.scene.add(voxel);
        }
      }
    }
    return matrix;
  }

  componentDidUpdate() {
    if (this.props.artwork !== null && !this.sceneBuilted) {
      this.buildScene();
    }
    console.log("Update");

    // this.updateScene();
    this.renderScene();
  }

  updateScene() {
    const { positionsToDraw, palette, output } = this.props.artwork;

    // Updates boxes
    for (var i = 0; i < positionsToDraw.length; i++) {
      const { x, y, z } = positionsToDraw[i];

      const box = output[x][y][z];
      const tile = this.tiles[x][y][z];

      console.log("Box", box);

      // Undefined or Contradiction
      if (box.matrix === null) {
        // Make sure voxels are hidden, special mesh is visible
        if (!tile.voxelsAreHidden) this.hideVoxels(tile, true);

        if (box.uncertainty === 0) {
          // contradiction
          tile.specialMesh.material.color = 0xdf2029;
          tile.specialMesh.material.opacity = 0.8;
        } else {
          // undefined
          tile.specialMesh.material.color = 0x000;
          tile.specialMesh.material.opacity =
            0.05 + (1 - box.uncertainty) * 0.6;
        }
      } else {
        // Make sure voxels are visible, special mesh is hidden
        if (tile.voxelsAreHidden) this.hideVoxels(tile, false);

        // Update colors of voxels
        for (var x = 0; x < tile.matrix.length; x++) {
          for (var y = 0; y < tile.matrix[x].length; y++) {
            for (var z = 0; z < tile.matrix[x][y].length; z++) {
              const color = box.matrix[x][y][z];
              tile.matrix[x][y][z].material.color =
                color === -1 ? 0xfff : color;
            }
          }
        }
      }
    }
  }

  /* -------------------------- UPDATE -------------------------- */

  hideVoxels(tile, shouldHide) {
    // Update boolean
    tile.voxelsAreHidden = shouldHide;

    // Hide/Show voxels
    for (var x = 0; x < tile.matrix.length; x++) {
      for (var y = 0; y < tile.matrix[x].length; y++) {
        for (var z = 0; z < tile.matrix[x][y].length; z++) {
          tile.matrix[x][y][z].material.opacity = shouldHide ? 0 : 1;
        }
      }
    }

    // Show/Hide special mesh
    tile.specialMesh.material.opacity = shouldHide ? 1 : 0;
  }

  boxMeshes(box, N) {
    var origin = {
      x: box.position.x * N,
      y: box.position.y * N,
      z: box.position.z * N
    };

    if (box.voxels === null) {
      if (this.drawUndefined) {
        if (box.uncertainty === 0) {
          return [sceneHelper.contradictionMesh(origin, N)];
        } else {
          return [sceneHelper.undefinedMesh(origin, N, box.uncertainty)];
        }
      } else {
        return [];
      }
    } else {
      return sceneHelper.voxelMeshes(box.voxels, origin);
    }
  }

  /* -------------------------- OTHER -------------------------- */

  renderScene() {
    this.renderer.render(this.scene, this.currentCamera);
  }

  changeCamera() {
    if (this.currentCamera === this.camera) {
      this.currentCamera = this.secondaryCamera;
    } else {
      this.currentCamera = this.camera;
    }

    this.renderScene();
  }

  onWindowResize() {
    //TODO
    // console.log(window.innerWidth, window.innerHeight);
    // this.camera.aspect = window.innerWidth / window.innerHeight;
    // this.camera.updateProjectionMatrix();
    //
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  componentWillUnmount() {
    this.mount.removeChild(this.renderer.domElement);
  }
}

export default SceneComponent;
