import React, { Component } from "react";
import * as THREE from "three";
import { scene } from "../3d/SceneHelper.js";

const OrbitControls = require("three-orbit-controls")(THREE);

class StaticSceneComponent extends Component {
  sceneBuilted = false;

  render() {
    return (
      <div
        className={this.props.className}
        ref={mount => {
          this.mount = mount;
        }}
      />
    );
  }

  componentDidMount() {
    this.renderScene = this.renderScene.bind(this);

    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setClearColor("#FFF");
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  }

  buildScene() {
    const { size, matrix } = this.props;

    // Scene
    this.scene = new THREE.Scene();
    scene.init(size.width, size.height, size.depth);

    // Camera
    const cPos = scene.cameraPosition;
    this.camera.position.set(cPos.x, cPos.y, cPos.z);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener("change", this.renderScene);
    this.controls.target = scene.center;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;

    // Light
    const light = new THREE.SpotLight(0xfffae8, 0.5);
    const lPos = scene.lightPosition;
    light.position.set(lPos.x, lPos.y, lPos.z);
    this.scene.add(light);

    var amb = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(amb);

    // Wireframe
    this.scene.add(scene.wireframe());

    // Ground
    const ground = scene.ground();
    this.scene.add(ground);

    // Voxels
    for (var x = 0; x < size.width; x++) {
      for (var y = 0; y < size.height; y++) {
        for (var z = 0; z < size.depth; z++) {
          this.addVoxelMesh(x, y, z, matrix[x][y][z]);
        }
      }
    }

    this.sceneBuilted = true;
  }

  componentDidUpdate() {
    if (this.props.size !== null && !this.sceneBuilted) {
      this.buildScene();
    }

    this.renderScene();
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  addVoxelMesh(x, y, z, value) {
    // If value is -1, don't draw it (represents air)
    if (value === -1) return;

    const voxel = scene.voxelMesh(x, y, z, value);

    // Add the mesh to the scene
    this.scene.add(voxel);
  }

  componentWillUnmount() {
    this.mount.removeChild(this.renderer.domElement);
  }
}

export default StaticSceneComponent;
