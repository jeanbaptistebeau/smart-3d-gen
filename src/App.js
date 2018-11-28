import React, { Component } from "react";
import SceneComponent from "./components/SceneComponent";
import ToolbarComponent from "./components/ToolbarComponent";
import TimelineComponent from "./components/TimelineComponent";
import "./App.css";

import worker from "./model/wfc.worker.js";
import WebWorker from "./model/WebWorker";
import Artwork from "./model/Artwork.js";

class App extends Component {
  state = {
    isCreating: false,
    currentArtwork: null,
    allArtworks: []
  };

  wfcWorker = null;

  shouldReloadScene = true; // defines if scene should be completely reloaded

  constructor() {
    super();

    this.handleMessage = this.handleMessage.bind(this);
    this.startWFC = this.startWFC.bind(this);
    this.switchToArtwork = this.switchToArtwork.bind(this);

    // Setup worker
    this.wfcWorker = new WebWorker(worker);
    this.wfcWorker.onmessage = this.handleMessage;
  }

  // Handles messages received from web worker
  handleMessage(message) {
    const m = message.data.body;

    switch (message.data.type) {
      case "set":
        this.shouldReloadScene = false;
        var artwork = this.state.currentArtwork;
        artwork.update(m.tiles);
        this.setState({ currentArtwork: artwork });
        break;
      case "finished":
        this.state.currentArtwork.conclude();
        this.setState({ isCreating: false });
        break;
      default:
        break;
    }
  }

  // Renders the whole page
  render() {
    return (
      <div className="App">
        <ToolbarComponent
          className="Toolbar"
          isCreating={this.state.isCreating}
          startWFC={this.startWFC}
        />
        <div id="right-container">
          <TimelineComponent
            className="Timeline"
            allArtworks={this.state.allArtworks}
            onClick={this.switchToArtwork}
          />
          <SceneComponent
            className="Scene"
            artwork={this.state.currentArtwork}
            reload={this.shouldReloadScene}
          />
        </div>
      </div>
    );
  }

  startWFC(artwork) {
    this.shouldReloadScene = true;

    this.state.allArtworks.push(artwork);
    this.setState({ currentArtwork: artwork, isCreating: true });

    this.wfcWorker.postMessage(message.start(artwork));
  }

  switchToArtwork(n) {
    this.shouldReloadScene = true;

    console.log("Switch to", n);
    this.setState({
      currentArtwork: this.state.allArtworks[n],
      creating: false
    });
  }
}

// ####################################################
// Messages: APP -> WORKER

var message = {
  start: artwork => ({
    type: "start",
    body: {
      _N: artwork.N,
      _sizeFactor: artwork.sizeFactor,
      allowYRotation: artwork.allowYRotation,
      src: artwork.sourceScene
    }
  })
};

export default App;
