import React, { Component } from "react";
import SceneComponent from "./SceneComponent";

class ArtworkComponent extends Component {
  render() {
    const { allArtworks, currentIndex } = this.props;

    return (
      <div className={this.props.className}>
        <div className="placeholderText">
          <p>Press Start to start generation.</p>
        </div>
        {allArtworks.map((artwork, index) => (
          <SceneComponent
            className="Scene"
            artwork={artwork}
            key={index}
            style={{ display: index === currentIndex ? "block" : "none" }}
          />
        ))}
      </div>
    );
  }
}

export default ArtworkComponent;

//style={{ display: this.props.artwork !== null ? "block" : "none" }}
