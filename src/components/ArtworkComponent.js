import React, { Component } from "react";
import SceneComponent from "./SceneComponent";

class ArtworkComponent extends Component {
  render() {
    const { artwork } = this.props;

    let scene = (
      <div className="placeholderText">
        <p>Press Start to start generation.</p>
      </div>
    );
    let description = null;

    if (artwork !== null) {
      scene = (
        <SceneComponent
          className="Scene"
          artwork={artwork}
          reload={this.props.reload}
        />
      );
      description = artwork.descriptionParagraph();
    }

    return (
      <div className={this.props.className}>
        {description}
        {scene}
      </div>
    );
  }
}

export default ArtworkComponent;

//style={{ display: this.props.artwork !== null ? "block" : "none" }}
