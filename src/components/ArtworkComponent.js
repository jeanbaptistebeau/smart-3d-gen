import React, { Component } from "react";
import SceneComponent from "./SceneComponent";

import * as THREE from "three";
import { exportOBJ } from "../3d/OBJExporter";

class ArtworkComponent extends Component {
  allScenes = {};

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
            ref={sc => {
              if (sc !== null) this.allScenes[index] = sc.scene;
            }}
            key={index}
            style={{ display: index === currentIndex ? "block" : "none" }}
          />
        ))}
        <button
          className="ExportButton"
          onClick={() => {
            const scene = this.allScenes[this.props.currentIndex];
            if (scene !== undefined && scene != null) {
              exportOBJ(scene);
            }
          }}
        >
          <i className="fas fa-share-square" />
        </button>
      </div>
    );
  }
}

export default ArtworkComponent;

//style={{ display: this.props.artwork !== null ? "block" : "none" }}
