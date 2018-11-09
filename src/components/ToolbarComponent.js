import React, { Component } from "react";
import StaticSceneComponent from "./StaticSceneComponent";

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
          <input className="TextField" />

          <h3>Size factor</h3>
          <input className="TextField" />

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
    this.props.wfcWorker.postMessage(message.start(3, this.props.srcMatrix));
  }
}

// ####################################################
// Messages: APP -> WORKER

var message = {
  start: (N, src) => ({
    type: "start",
    body: { _N: N, src: src }
  })
};

export default ToolbarComponent;
