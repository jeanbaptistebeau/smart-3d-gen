import React, { Component } from "react";
import StaticSceneComponent from "./StaticSceneComponent";

import { Models } from "../3d/Models.js";
import Artwork from "../model/Artwork.js";

const N_default = 3;
const sizeFactor_default = 10;

class ToolbarComponent extends Component {
  constructor() {
    super();

    this.start = this.start.bind(this);
    this.source = Models.basicBuilding();
  }

  render() {
    return (
      <div className={this.props.className}>
        <h1>Smart 3d Generator</h1>
        <div
          className="ControlsPanel"
          style={{ opacity: this.props.isCreating ? 0.2 : 1 }}
        >
          <h3>N</h3>
          <input
            id="field_N"
            className="TextField"
            placeholder="3"
            disabled={this.props.isCreating}
          />

          <h3>Size factor</h3>
          <input
            id="field_size_factor"
            className="TextField"
            placeholder="10"
            disabled={this.props.isCreating}
          />

          <h3>Allowed Contradictions</h3>
          <input
            type="range"
            min="1"
            max="100"
            defaultValue="50"
            className="slider"
            id="allowedContradictionSlider"
            disabled={this.props.isCreating}
          />

          <div className="Checkbox">
            <input
              type="checkbox"
              id="allowYRotationCheckbox"
              disabled={this.props.isCreating}
            />
            <h3>Allow y rotation</h3>
          </div>
        </div>

        <button
          className="BigButton"
          onClick={this.start}
          inversed={this.props.isCreating ? "true" : "false"}
        >
          {this.props.isCreating ? "CANCEL" : "START"}
        </button>

        <StaticSceneComponent className="SourceScene" matrix={this.source} />
      </div>
    );
  }

  /// Start button was pressed
  start() {
    var N = document.getElementById("field_N").value;
    N = this.valueOrDefault(N, N_default);

    var sizeFactor = document.getElementById("field_size_factor").value;
    sizeFactor = this.valueOrDefault(sizeFactor, sizeFactor_default);

    var allowYRotation = document.getElementById("allowYRotationCheckbox")
      .checked;

    var artwork = new Artwork(N, sizeFactor, allowYRotation, this.source);
    this.props.startWFC(artwork);
  }

  valueOrDefault(value, value_default) {
    return isNaN(value) || value === "" ? value_default : value;
  }
}

export default ToolbarComponent;
