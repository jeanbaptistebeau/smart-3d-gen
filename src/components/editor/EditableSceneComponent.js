import React, { Component } from "react";
import * as THREE from "three";
import { sceneHelper } from "3d/SceneHelper.js";

const OrbitControls = require("three-orbit-controls")(THREE);

class EditableSceneComponent extends Component {
  state = { matrix: null };

  allMeshes = [];
  isShiftDown = false;
  onMouseDownPosition;

  /******************* LIFECYCLE METHODS *******************/

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

    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    // window.addEventListener( 'resize', this.onWindowResize, false );
    this.mount.addEventListener("mousemove", e => this.onMouseMove(e), false);
    this.mount.addEventListener("mousedown", e => this.onMouseDown(e), false);
    this.mount.addEventListener("mouseup", e => this.onMouseUp(e), false);
    document.addEventListener("keydown", e => this.onKeyDown(e), false);
    document.addEventListener("keyup", e => this.onKeyUp(e), false);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setClearColor("#1A1B25");
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

    // Build
    this.buildScene();

    // Render
    this.renderScene();
  }

  buildScene() {
    const { matrix } = this.props;

    // Scene
    this.scene = new THREE.Scene();

    // Size
    let size = { width: 20, height: 20, depth: 20 };
    if (matrix !== null && matrix !== undefined) {
      size.width = matrix.length;
      size.height = matrix[0].length;
      size.depth = matrix[0][0].length;
    }

    // SceneHelper
    sceneHelper.init(size.width, size.height, size.depth);

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

    var amb = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(amb);

    // Mouse and raycaster
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.onMouseDownPosition = new THREE.Vector2();

    // Grid helper
    var gridHelper = new THREE.GridHelper(20, 1);
    this.scene.add(gridHelper);

    // Wireframe
    // this.scene.add(sceneHelper.wireframe());

    // Brush
    this.brush = sceneHelper.brushMesh();
    this.scene.add(this.brush);

    // Ground
    const ground = sceneHelper.ground();
    this.scene.add(ground);
    this.allMeshes.push(ground);

    // Matrix
    let stateMatrix = Array(size.width);
    for (var x = 0; x < size.width; x++) {
      stateMatrix[x] = Array(size.height);
      for (var y = 0; y < size.height; y++) {
        stateMatrix[x][y] = Array(size.depth);
        for (var z = 0; z < size.depth; z++) {
          stateMatrix[x][y][z] = -1;
          if (matrix !== null && matrix !== undefined) {
            stateMatrix[x][y][z] = matrix[x][y][z];
          }
        }
      }
    }

    // Saves the copy of the matrix
    this.state.matrix = stateMatrix;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.matrix !== this.props.matrix) {
      this.buildScene();
    }

    this.renderScene();
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  componentWillUnmount() {
    this.mount.removeChild(this.renderer.domElement);
  }

  /******************* EVENT LISTENERS *******************/

  onMouseMove(event) {
    // Prevent default behavior
    event.preventDefault();

    // Get intersect
    const intersect = this.getIntersect(event);

    if (intersect) {
      const position = this.positionFromIntersect(intersect);
      this.moveBrush(position);
    }

    this.renderScene();
  }

  onMouseDown(event) {
    event.preventDefault();

    this.onMouseDownPosition.x = event.clientX;
    this.onMouseDownPosition.y = event.clientY;
  }

  onMouseUp(event) {
    event.preventDefault();

    this.onMouseDownPosition.x = event.clientX - this.onMouseDownPosition.x;
    this.onMouseDownPosition.y = event.clientY - this.onMouseDownPosition.y;

    // If mouse moved a lot, then don't add block
    if (this.onMouseDownPosition.length() > 5) {
      return;
    }

    // Get intersect
    const intersect = this.getIntersect(event);

    if (intersect) {
      const position = this.positionFromIntersect(intersect);
      this.addBlock(position);
    }

    this.renderScene();
  }

  onKeyUp(event) {
    switch (event.keyCode) {
      case 16:
        this.isShiftDown = false;
        break;
    }
  }

  onKeyDown(event) {
    switch (event.keyCode) {
      case 16:
        this.isShiftDown = true;
        break;
    }
  }

  onWindowResize() {
    // TODO
    // this.camera.aspect = window.innerWidth / window.innerHeight;
    // this.camera.updateProjectionMatrix();
    //
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /******************* HELPERS *******************/

  getIntersect(event) {
    // Set mouse position
    const rect = event.target.getBoundingClientRect();
    this.mouse.set(
      ((event.clientX - rect.left) / this.mount.clientWidth) * 2 - 1,
      -((event.clientY - rect.top) / this.mount.clientHeight) * 2 + 1
    );

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);
    var intersects = this.raycaster.intersectObjects(this.allMeshes);

    // Get pointed objects
    if (intersects.length > 0) {
      return intersects[0];
    } else {
      return null;
    }
  }

  positionFromIntersect(intersect) {
    // Direction of intersection
    let direction = intersect.face.normal.clone();
    direction.divideScalar(direction.length() * 2);

    // Position
    let position = intersect.point.clone();
    position.add(direction);

    return position;
  }

  // These methods assume that UNIT in SceneHelper is 1 (size of each voxel)

  hashPositionFrom(scenePosition) {
    return {
      x: Math.floor(scenePosition.x),
      y: Math.floor(scenePosition.y),
      z: Math.floor(scenePosition.z)
    };
  }

  moveBrush(position) {
    const hashPos = this.hashPositionFrom(position);

    sceneHelper.moveVoxelToPosition(
      this.brush,
      hashPos.x,
      hashPos.y,
      hashPos.z
    );
  }

  addBlock(position) {
    const hashPos = this.hashPositionFrom(position);

    const color = parseInt(this.props.brushColor.replace("#", "0x"));

    let voxel = sceneHelper.voxelMesh(
      hashPos.x,
      hashPos.y,
      hashPos.z,
      this.props.brushColor
    );

    voxel.hashPos = hashPos;

    this.scene.add(voxel);
    this.allMeshes.push(voxel);
    this.state.matrix[hashPos.x][hashPos.y][hashPos.z] = this.props.brushColor;
  }

  removeBlock(block) {
    this.scene.remove(block);

    var index = this.allMeshes.indexOf(block);
    if (index > -1) {
      this.allMeshes.splice(index, 1);
    }

    this.state.matrix[block.hashPos.x][block.hashPos.y][block.hashPos.z] = -1;
  }
}

export default EditableSceneComponent;
