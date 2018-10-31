import React, { Component } from "react";
import SceneComponent from "./components/SceneComponent";
import ToolbarComponent from "./components/ToolbarComponent";
import "./App.css";

import { VoxelMatrix } from "./model/matrix.js";
import worker from "./model/wfc.worker.js";
import WebWorker from "./model/WebWorker";

class App extends Component {
  state = {
    size: null,
    boxSize: null,

    boxesToUpdate: [],

    srcSize: null,
    srcMatrix: null
  };

  constructor() {
    super();

    this.handleMessage = this.handleMessage.bind(this);

    const srcSize = 20;
    const brown = 0x88665d;
    const green = 0xc2b97f;

    var src = Array(srcSize);
    for (var x = 0; x < srcSize; x++) {
      src[x] = Array(srcSize);
      for (var y = 0; y < srcSize; y++) {
        src[x][y] = Array(srcSize);
        for (var z = 0; z < srcSize; z++) {
          src[x][y][z] = -1;
        }
      }
    }

    // src[1][0][1] = brown;
    // src[2][0][1] = brown;
    // src[2][0][2] = brown;
    // src[3][0][2] = brown;
    //
    // src[1][0][2] = brown;
    // src[1][1][2] = brown;
    // src[1][2][2] = green;
    //
    // src[4][0][2] = brown;
    // src[4][1][2] = brown;
    // src[4][2][2] = brown;
    // src[4][3][2] = brown;
    // src[4][4][2] = green;

    // src[0][0][0] = 0x7272ab;
    // src[0][0][1] = 0x7272ab;
    // src[0][1][0] = 0x7272ab;
    // src[0][1][1] = 0x7272ab;
    // src[1][0][0] = 0x7272ab;
    // src[1][0][1] = 0x7272ab;
    // src[1][1][0] = 0x7272ab;
    // src[1][1][1] = 0x7272ab;
    //
    // src[2][0][0] = 0x362023;
    // src[2][0][1] = 0x362023;
    // src[2][1][0] = 0x362023;
    // src[2][1][1] = 0x362023;
    // src[3][0][0] = 0x362023;
    // src[3][0][1] = 0x362023;
    // src[3][1][0] = 0x362023;
    // src[3][1][1] = 0x362023;
    //
    // src[0][0][2] = 0x700548;
    // src[0][0][3] = 0x700548;
    // src[0][1][2] = 0x700548;
    // src[0][1][3] = 0x700548;
    // src[1][0][2] = 0x700548;
    // src[1][0][3] = 0x700548;
    // src[1][1][2] = 0x700548;
    // src[1][1][3] = 0x700548;

    for (var x = 6; x < 12; x++) {
      for (var y = 0; y < 6; y++) {
        for (var z = 6; z < 12; z++) {
          src[x][y][z] = 0x700548;
        }
      }
    }

    for (var x = 6; x < 12; x++) {
      for (var y = 6; y < 10; y++) {
        for (var z = 6; z < 12; z++) {
          src[x][y][z] = 0x362023;
        }
      }
    }

    for (var x = 6; x < 12; x++) {
      for (var z = 6; z < 12; z++) {
        src[x][10][z] = 0xaaaaaa;
      }
    }

    for (var x = 7; x < 11; x++) {
      for (var z = 7; z < 11; z++) {
        src[x][10][z] = -1;
      }
    }

    // src[0][0][0] = 0x700548;
    // src[0][0][5] = 0x700548;
    // src[0][5][0] = 0x700548;
    // src[0][5][5] = 0x700548;
    // src[5][0][0] = 0x700548;
    // src[5][0][5] = 0x700548;
    // src[5][5][0] = 0x700548;
    // src[5][5][5] = 0x700548;
    //
    // src[4][0][2] = brown;
    // src[4][1][2] = brown;
    // src[4][2][2] = brown;
    // src[4][3][2] = brown;
    // src[4][4][2] = green;

    this.state.srcMatrix = src;
    this.state.srcSize = {
      width: srcSize,
      height: srcSize,
      depth: srcSize
    };

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
          size: {
            width: m.width,
            height: m.height,
            depth: m.depth
          },
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
        this.setState({ boxesToUpdate: m.tiles });
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
        <ToolbarComponent className="Toolbar" {...this.state} />
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
    body: { _N: N, src: src, srcSize: srcSize }
  })
};

export default App;
