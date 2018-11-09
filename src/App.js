import React, { Component } from "react";
import SceneComponent from "./components/SceneComponent";
import ToolbarComponent from "./components/ToolbarComponent";
import "./App.css";

import worker from "./model/wfc.worker.js";
import WebWorker from "./model/WebWorker";

class App extends Component {
  state = {
    size: null,
    boxSize: null,

    boxesToUpdate: [],

    srcMatrix: null,
    wfcWorker: null
  };

  constructor() {
    super();

    this.handleMessage = this.handleMessage.bind(this);

    const brown = 0x88665d;
    const green = 0xc2b97f;

    const srcSize = 18;

    var src = Array(srcSize);
    for (let x = 0; x < srcSize; x++) {
      src[x] = Array(srcSize);
      for (let y = 0; y < srcSize; y++) {
        src[x][y] = Array(srcSize);
        for (let z = 0; z < srcSize; z++) {
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

    for (let x = 6; x < 12; x++) {
      for (let y = 0; y < 6; y++) {
        for (let z = 6; z < 12; z++) {
          src[x][y][z] = 0x700548;
        }
      }
    }

    for (let x = 6; x < 12; x++) {
      for (let y = 6; y < 10; y++) {
        for (let z = 6; z < 12; z++) {
          src[x][y][z] = 0x362023;
        }
      }
    }

    for (let x = 6; x < 12; x++) {
      for (let z = 6; z < 12; z++) {
        src[x][10][z] = 0xaaaaaa;
      }
    }

    for (let x = 7; x < 11; x++) {
      for (let z = 7; z < 11; z++) {
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

    // Setup worker
    this.state.wfcWorker = new WebWorker(worker);
    this.state.wfcWorker.onmessage = this.handleMessage;
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
        <ToolbarComponent className="Toolbar" {...this.state} />
        <SceneComponent className="Scene" {...this.state} />
      </div>
    );
  }

  initialBoxes(w, h, d, size) {
    var boxes = [];

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        for (let z = 0; z < d; z++) {
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

export default App;
