import React, { Component } from "react";
import * as THREE from "three";
import "./SceneComponent.css";
import { scene } from "../3d/SceneHelper.js";

const OrbitControls = require("three-orbit-controls")(THREE);

class SceneComponent extends Component {
  sceneBuilted = false;
  meshes = [];

  render() {
    return (
      <div
        className="Scene"
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
    const { width, height, depth, boxSize } = this.props;

    // Scene
    this.scene = new THREE.Scene();
    scene.init(width * boxSize, height * boxSize, depth * boxSize);

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
    // light.target = ground;
    // light.shadow.mapSize.width = 1024;
    // light.shadow.mapSize.height = 1024;
    // light.angle = 0.8;
    // light.shadowBias = 0.001;
    const lPos = scene.lightPosition;
    light.position.set(lPos.x, lPos.y, lPos.z);
    this.scene.add(light);

    // const lightHelper = new THREE.SpotLightHelper(light);
    // this.scene.add(lightHelper);

    var amb = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(amb);

    // Wireframe
    this.scene.add(scene.wireframe());

    // Ground
    const ground = scene.ground();
    this.scene.add(ground);

    // Meshes
    this.meshes = Array(width);
    for (var x = 0; x < width; x++) {
      this.meshes[x] = Array(height);
      for (var y = 0; y < height; y++) {
        this.meshes[x][y] = Array(depth);
        for (var z = 0; z < depth; z++) {
          this.meshes[x][y][z] = [];
        }
      }
    }

    this.sceneBuilted = true;
  }

  componentDidUpdate() {
    if (this.props.width !== null && !this.sceneBuilted) {
      this.buildScene();
    }

    this.updateScene();
    this.renderScene();
  }

  updateScene() {
    const { boxesToUpdate } = this.props;

    // Remove old voxels
    // this.voxelsInScene.forEach(function(item, index, array) {
    //   this.scene.remove(item);
    // }, this);
    // this.voxelsInScene = [];

    // Updates boxes
    for (var i = 0; i < boxesToUpdate.length; i++) {
      const box = boxesToUpdate[i];
      const { x, y, z } = box.position;

      // Remove previous meshes at the box position
      const previousMeshes = this.meshes[x][y][z];
      this.scene.remove(...previousMeshes);

      // Add new meshes
      const newMeshes = this.boxMeshes(box);
      this.meshes[x][y][z] = newMeshes;
      if (newMeshes.length > 0) this.scene.add(...newMeshes);
    }
  }

  boxMeshes(box) {
    var origin = {
      x: box.position.x * this.props.boxSize,
      y: box.position.y * this.props.boxSize,
      z: box.position.z * this.props.boxSize
    };

    if (box.voxels === null) {
      return [scene.undefinedMesh(origin, this.props.boxSize, box.uncertainty)];
    } else {
      return scene.voxelMeshes(box.voxels, origin);
    }
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  // voxelMesh(v) {
  //   // If value is null, don't draw it (represents air)
  //   if (v.value === null) return;
  //
  //   const voxel = scene.voxel(v.x, v.y, v.z, v.value);
  //
  //   // Add the mesh to the scene
  //   this.scene.add(voxel);
  //   this.voxelsInScene.push(voxel);
  // }

  componentWillUnmount() {
    this.mount.removeChild(this.renderer.domElement);
  }
}

export default SceneComponent;
