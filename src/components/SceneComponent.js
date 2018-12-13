import React, { Component } from "react";
import * as THREE from "three";
import { sceneHelper } from "../3d/SceneHelper.js";

const OrbitControls = require("three-orbit-controls")(THREE);

class SceneComponent extends Component {
  sceneBuilted = false;
  meshes = [];
  drawUndefined = true;

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
    console.log("Mount");
    this.renderScene = this.renderScene.bind(this);

    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    // window.addEventListener( 'resize', this.onWindowResize, false );

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setClearColor("#F8F9FF");
    console.log(width, height);
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);

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
    console.log("Build");
    const { palette, output } = this.props.artwork;
    const { sizeFactor, N } = palette;

    // Scene
    this.scene = new THREE.Scene();

    // SceneHelper
    sceneHelper.init(sizeFactor * N, sizeFactor * N, sizeFactor * N);

    // Camera - Update
    const cPos = sceneHelper.cameraPosition;
    this.camera.position.set(cPos.x, cPos.y, cPos.z);
    this.camera.lookAt(sceneHelper.center);

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
    this.scene.add(sceneHelper.wireframe());

    // Ground
    const ground = sceneHelper.ground();
    this.scene.add(ground);

    // Meshes
    this.meshes = Array(sizeFactor);
    for (var x = 0; x < sizeFactor; x++) {
      this.meshes[x] = Array(sizeFactor);
      for (var y = 0; y < sizeFactor; y++) {
        this.meshes[x][y] = Array(sizeFactor);
        for (var z = 0; z < sizeFactor; z++) {
          this.meshes[x][y][z] = [];
        }
      }
    }

    this.sceneBuilted = true;
  }

  componentDidUpdate() {
    if (this.props.artwork !== null && !this.sceneBuilted) {
      this.buildScene();
    }

    this.updateScene();
    this.renderScene();
  }

  updateScene() {
    const { positionsToDraw, palette, output } = this.props.artwork;

    // Remove old voxels
    // this.voxelsInScene.forEach(function(item, index, array) {
    //   this.scene.remove(item);
    // }, this);
    // this.voxelsInScene = [];

    // Updates boxes
    for (var i = 0; i < positionsToDraw.length; i++) {
      const { x, y, z } = positionsToDraw[i];

      // Remove previous meshes at the box position
      const previousMeshes = this.meshes[x][y][z];
      this.scene.remove(...previousMeshes);

      // Add new meshes
      const box = output[x][y][z];
      const newMeshes = this.boxMeshes(box, palette.N);
      this.meshes[x][y][z] = newMeshes;
      if (newMeshes.length > 0) this.scene.add(...newMeshes);
    }
  }

  boxMeshes(box, N) {
    var origin = {
      x: box.position.x * N,
      y: box.position.y * N,
      z: box.position.z * N
    };

    if (box.voxels === null) {
      if (this.drawUndefined) {
        return [sceneHelper.undefinedMesh(origin, N, box.uncertainty)];
      } else {
        return [];
      }
    } else {
      return sceneHelper.voxelMeshes(box.voxels, origin);
    }
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  componentWillUnmount() {
    this.mount.removeChild(this.renderer.domElement);
  }
}

export default SceneComponent;
