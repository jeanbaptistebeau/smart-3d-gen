import React, { Component } from "react";
import StaticSceneComponent from "./StaticSceneComponent";

class ToolbarComponent extends Component {
  render() {
    return (
      <div className={this.props.className}>
        <h1>Toolbar</h1>
        <StaticSceneComponent
          className="SourceScene"
          size={this.props.srcSize}
          matrix={this.props.srcMatrix}
        />
      </div>
    );
  }
}

export default ToolbarComponent;
