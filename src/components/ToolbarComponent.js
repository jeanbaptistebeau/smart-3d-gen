import React, { Component } from "react";
import StaticSceneComponent from "./StaticSceneComponent";

import Artwork from "../model/Artwork.js";

const N_default = 3;
const sizeFactor_default = 10;

class ToolbarComponent extends Component {
  state = { palette: null };

  constructor() {
    super();

    this.start = this.start.bind(this);
    this.cancel = this.cancel.bind(this);
    this.create = this.create.bind(this);
  }

  componentDidMount() {
    console.log("Mount");
    this.setState({ palette: this.props.palette });
  }

  componentDidUpdate() {
    this.state.palette = this.props.palette;
  }

  render() {
    let buttonOnClick;
    let buttonText;

    switch (this.props.currentState) {
      case "new":
        buttonOnClick = this.start;
        buttonText = "START";
        break;
      case "finished":
        buttonOnClick = this.create;
        buttonText = "CREATE NEW";
        break;
      case "creating":
        buttonOnClick = this.cancel;
        buttonText = "CANCEL";
        break;
      default:
        break;
    }

    if (this.state.palette === null) {
      return null;
    }

    return (
      <div className={this.props.className}>
        <h1>wfc³</h1>
        <button
          className="BigButton"
          onClick={buttonOnClick}
          inversed={this.props.currentState === "creating" ? "true" : "false"}
        >
          {buttonText}
        </button>

        <div
          className="ControlsPanel"
          style={{ opacity: this.props.currentState === "new" ? 1 : 0.2 }}
        >
          <div>
            <h3>Pattern size (N)</h3>
            <input
              id="field_N"
              className="TextField"
              placeholder="Enter a number"
              disabled={this.props.currentState !== "new"}
              value={this.state.palette.N}
              onChange={event => {
                this.state.palette.N = event.target.value;
                this.forceUpdate();
              }}
            />
          </div>

          <div>
            <h3>Size factor</h3>
            <input
              id="field_size_factor"
              className="TextField"
              placeholder="Enter a number"
              disabled={this.props.currentState !== "new"}
              value={this.state.palette.sizeFactor}
              onChange={event => {
                this.state.palette.sizeFactor = event.target.value;
                this.forceUpdate();
              }}
            />
          </div>

          <div>
            <h3>Allowed Contradictions</h3>
            <input
              type="range"
              min="1"
              max="100"
              defaultValue="50"
              className="slider"
              id="allowedContradictionSlider"
              disabled={this.props.currentState !== "new"}
            />
          </div>

          <div className="Checkbox">
            <input
              type="checkbox"
              id="allowYRotationCheckbox"
              disabled={this.props.currentState !== "new"}
            />
            <h3>Allow y rotation</h3>
          </div>

          <div>
            <h3>Positives</h3>
            {this.state.palette.positives.map((matrix, index) => (
              <StaticSceneComponent
                className="StaticScene"
                key={index}
                matrix={matrix}
              />
            ))}
          </div>

          <div>
            <h3>Negatives</h3>
            {this.state.palette.negatives.map((matrix, index) => (
              <StaticSceneComponent
                className="StaticScene"
                key={index}
                matrix={matrix}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /// Start button was pressed
  start() {
    this.state.palette.N = this.intOrDefault(this.state.palette.N, N_default);

    this.state.palette.sizeFactor = this.intOrDefault(
      this.state.palette.sizeFactor,
      sizeFactor_default
    );

    // var allowYRotation = document.getElementById("allowYRotationCheckbox")
    //   .checked;

    this.forceUpdate();
    this.props.startWFC(this.state.palette);
  }

  /// Cancel button was pressed
  cancel() {
    this.props.cancelWFC();
  }

  /// Create button was pressed
  create() {
    this.props.create();
  }

  intOrDefault(value, value_default) {
    return isNaN(value) || value === "" ? value_default : parseInt(value);
  }
}

export default ToolbarComponent;
