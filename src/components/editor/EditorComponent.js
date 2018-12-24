import React, { Component } from "react";
import EditableSceneComponent from "./EditableSceneComponent";

import styles from "./Editor.css";

class EditorComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { isVisible: false, brushColorIndex: 0 };
  }

  show(matrix, saveCallBack) {
    this.sceneComponent.buildScene(matrix);
    this.setState({
      isVisible: true,
      saveCallBack: saveCallBack
    });
  }

  hide(save) {
    if (save) {
      this.state.saveCallBack(this.sceneComponent.saveSource());
    }
    this.setState({ isVisible: false });
  }

  render() {
    const isVisible = { visible: this.state.isVisible ? "true" : "false" };

    const buttonSelected = index => ({
      isselected: index === this.state.brushColorIndex ? "true" : "false"
    });

    const colorCircles = COLORS.map((color, index) => (
      <button
        className={styles.colorButton}
        style={{ backgroundColor: color }}
        onClick={() => {
          this.setState({ brushColorIndex: index });
        }}
        {...buttonSelected(index)}
        key={index}
      />
    ));

    return (
      <div className="Editor">
        <div className={styles.overlay} {...isVisible} />
        <div className={styles.window} {...isVisible}>
          <div className={styles.navbar}>
            <button onClick={() => this.hide(false)} className={styles.buttons}>
              <i className="far fa-times-circle" />
            </button>
            <button onClick={() => this.hide(true)} className={styles.buttons}>
              <i className="far fa-check-circle" />
            </button>
          </div>
          <div className={styles.mainWindow}>
            <EditableSceneComponent
              className={styles.scene}
              ref={sc => {
                this.sceneComponent = sc;
              }}
              brushColor={COLORS[this.state.brushColorIndex]}
            />
            <div className={styles.colorPalette}>{colorCircles}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default EditorComponent;

const COLORS = [
  "#1abc9c",
  "#16a085",
  "#2ecc71",
  "#27ae60",
  "#3498db",
  "#2980b9",
  "#9b59b6",
  "#8e44ad",
  "#e74c3c",
  "#c0392b",
  "#e67e22",
  "#d35400",
  "#f1c40f",
  "#f39c12",
  "#ecf0f1",
  "#bdc3c7",
  "#95a5a6",
  "#7f8c8d",
  "#34495e",
  "#2c3e50"
];
