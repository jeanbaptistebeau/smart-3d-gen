import React, { Component } from "react";
import SceneComponent from "./components/SceneComponent";
import ToolbarComponent from "./components/ToolbarComponent";
import "./App.css";

import { VoxelMatrix } from "./model/matrix.js";
import worker from "./model/wfc.worker.js";
import WebWorker from "./model/WebWorker";

class App extends Component {
  state = {
    width: null,
    height: null,
    depth: null,
    boxSize: null,

    boxesToUpdate: []
  };

  constructor() {
    super();

    this.handleMessage = this.handleMessage.bind(this);

    const srcSize = 6;
    const brown = 0x88665d;
    const green = 0xc2b97f;

    var src = Array(srcSize);
    for (var x = 0; x <= srcSize; x++) {
      src[x] = Array(srcSize);
      for (var y = 0; y <= srcSize; y++) {
        src[x][y] = Array(srcSize);
        for (var z = 0; z <= srcSize; z++) {
          src[x][y][z] = -1;
        }
      }
    }

    src[1][0][1] = brown;
    src[2][0][1] = brown;
    src[2][0][2] = brown;
    src[3][0][2] = brown;

    src[1][0][2] = brown;
    src[1][1][2] = brown;
    src[1][2][2] = green;

    src[4][0][2] = brown;
    src[4][1][2] = brown;
    src[4][2][2] = brown;
    src[4][3][2] = brown;
    src[4][4][2] = green;

    // Start worker
    const wfcWorker = new WebWorker(worker);
    wfcWorker.onmessage = this.handleMessage;
    wfcWorker.postMessage(message.start(2, src, srcSize));
  }

  // Handles messages received from web worker
  handleMessage(message) {
    const m = message.data.body;

    switch (message.data.type) {
      case "init":
        this.setState({
          width: m.width,
          height: m.height,
          depth: m.depth,
          boxSize: m.boxSize,

          boxesToUpdate: this.initialBoxes(
            m.width,
            m.height,
            m.depth,
            m.boxSize
          )
        });
        break;
      case "set":
        this.setState({ boxesToUpdate: [m.box] });
        break;
      default:
        break;
    }
  }

  // Renders the whole page
  render() {
    return (
      <div className="App">
        <SceneComponent className="Scene" {...this.state} />
        <ToolbarComponent className="Toolbar" />
      </div>
    );
  }

  initialBoxes(w, h, d, size) {
    var boxes = [];

    for (var x = 0; x < w; x++) {
      for (var y = 0; y < h; y++) {
        for (var z = 0; z < d; z++) {
          boxes.push({
            position: { x: x, y: y, z: z },
            voxels: null,
            uncertainty: 1
          });
        }
      }
    }

    return boxes;
  }
}

// ####################################################
// Messages: APP -> WORKER

var message = {
  start: (N, src, srcSize) => ({
    type: "start",
    body: { N: N, src: src, srcSize: srcSize }
  })
};

export default App;
