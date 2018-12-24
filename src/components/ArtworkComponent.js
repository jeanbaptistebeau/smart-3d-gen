import React, { Component } from "react";
import SceneComponent from "./SceneComponent";

import * as THREE from "three";
import "../3d/OBJExporter";

class ArtworkComponent extends Component {
  allScenes = {};

  constructor() {
    super();

    this.download = this.download.bind(this);
  }

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
            console.log(scene);
            var exporter = new THREE.OBJExporter();
            var result = exporter.parse(scene);

            this.download(result, "scene.obj");
          }}
        >
          <i className="fas fa-share-square" />
        </button>
      </div>
    );
  }

  download(data, filename) {
    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + data);
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}

export default ArtworkComponent;

//style={{ display: this.props.artwork !== null ? "block" : "none" }}
