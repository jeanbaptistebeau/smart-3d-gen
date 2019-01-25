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
              min="0"
              max="100"
              className="slider"
              id="allowedContradictionSlider"
              disabled={this.props.currentState !== "new"}
              value={this.state.palette.allowedContradiction * 100}
              onChange={event => {
                this.state.palette.allowedContradiction =
                  event.target.value / 100;
                this.forceUpdate();
              }}
            />
          </div>

          <div className="Checkbox">
            <input
              type="checkbox"
              id="groundMagnetismCheckbox"
              disabled={this.props.currentState !== "new"}
              checked={this.state.palette.groundMagnetism}
              onChange={event => {
                this.state.palette.groundMagnetism = event.target.checked;
                this.forceUpdate();
              }}
            />
            <h3>Ground Magnetism</h3>
          </div>

          <div>
            <div className="ListHeader">
              <h3>Positives</h3>
              <button
                className="AddButton"
                onClick={() =>
                  this.props.openEditor(
                    null,
                    this.editorCallBack(null, this.state.palette.positives)
                  )
                }
              >
                <i className="fas fa-plus-circle" />
              </button>
            </div>

            {this.displayMatrices(this.state.palette.positives)}
          </div>

          <div>
            <div className="ListHeader">
              <h3>Negatives</h3>
              <button
                className="AddButton"
                onClick={() =>
                  this.props.openEditor(
                    null,
                    this.editorCallBack(null, this.state.palette.negatives)
                  )
                }
              >
                <i className="fas fa-plus-circle" />
              </button>
            </div>

            {this.displayMatrices(this.state.palette.negatives)}
          </div>
        </div>
      </div>
    );
  }

  /// Displays an array of matrices
  displayMatrices(list) {
    return list.map((src, index) => (
      <div key={index}>
        <div
          className="Snapshot"
          style={{ backgroundImage: `url(${src.snapshot})` }}
        >
          <button
            className="DeleteButton"
            onClick={() => {
              list.splice(index, 1);
              this.forceUpdate();
            }}
          >
            <i className="fas fa-trash-alt" />
          </button>
          <button
            className="EditButton"
            onClick={() => {
              this.props.openEditor(
                src.matrix,
                this.editorCallBack(index, list)
              );
            }}
          >
            <i className="fas fa-pencil-alt" />
          </button>
        </div>
        <div className="Checkbox">
          <input
            type="checkbox"
            id="allowYRotationCheckbox"
            disabled={this.props.currentState !== "new"}
            checked={src.allowYRotation}
            onChange={event => {
              src.allowYRotation = event.target.checked;
              this.forceUpdate();
            }}
          />
          <h3>Allow y rotation</h3>
        </div>
      </div>
    ));
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

  // Creates callback function depending on the situation
  editorCallBack(index, arrayRef) {
    // Add new
    if (index === null) {
      return src => {
        arrayRef.push(src);
        this.forceUpdate();
      };
    } else {
      return src => {
        arrayRef[index] = src;
        this.forceUpdate();
      };
    }
  }
}

export default ToolbarComponent;
