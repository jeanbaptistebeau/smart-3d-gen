import React, { Component } from "react";
import StaticSceneComponent from "./StaticSceneComponent";

const N_default = 3;
const sizeFactor_default = 10;

class ToolbarComponent extends Component {
  constructor() {
    super();

    this.start = this.start.bind(this);
  }

  render() {
    return (
      <div className={this.props.className}>
        <h1>Smart 3d Generator</h1>
        <div className="ControlsPanel">
          <h3>N</h3>
          <input id="field_N" className="TextField" placeholder="3" />

          <h3>Size factor</h3>
          <input
            id="field_size_factor"
            className="TextField"
            placeholder="10"
          />

          <button className="BigButton" onClick={this.start}>
            START
          </button>
        </div>
        <StaticSceneComponent
          className="SourceScene"
          matrix={this.props.srcMatrix}
        />
      </div>
    );
  }

  /// Start button was pressed
  start() {
    var N = document.getElementById("field_N").value;
    N = this.valueOrDefault(N, N_default);

    var sizeFactor = document.getElementById("field_size_factor").value;
    sizeFactor = this.valueOrDefault(sizeFactor, sizeFactor_default);

    this.props.wfcWorker.postMessage(
      message.start(N, sizeFactor, this.props.srcMatrix)
    );
  }

  valueOrDefault(value, value_default) {
    return isNaN(value) || value === "" ? value_default : value;
  }
}

// ####################################################
// Messages: APP -> WORKER

var message = {
  start: (N, sizeFactor, src) => ({
    type: "start",
    body: { _N: N, _sizeFactor: sizeFactor, src: src }
  })
};

export default ToolbarComponent;
