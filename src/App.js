import React, { Component } from "react";
import ArtworkComponent from "./components/ArtworkComponent";
import ToolbarComponent from "./components/ToolbarComponent";
import TimelineComponent from "./components/TimelineComponent";
import "./App.css";

import worker from "./model/wfc.worker.js";
import WebWorker from "./model/WebWorker";
import Artwork from "./model/Artwork.js";

class App extends Component {
  state = {
    isCreating: false,
    currentIndex: null,
    allArtworks: []
  };

  wfcWorker = null;

  shouldReloadScene = true; // defines if scene should be completely reloaded

  currentArtwork() {
    return this.state.allArtworks[this.state.currentIndex];
  }

  constructor() {
    super();

    this.handleMessage = this.handleMessage.bind(this);
    this.startWFC = this.startWFC.bind(this);
    this.cancelWFC = this.cancelWFC.bind(this);
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
        if (this.state.currentIndex !== null) {
          this.shouldReloadScene = false;
          var allArtworks = this.state.allArtworks;
          allArtworks[this.state.currentIndex].update(m.tiles);
          this.setState({ allArtworks: allArtworks });
        }
        break;
      case "finished":
        this.currentArtwork().conclude();
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
          cancelWFC={this.cancelWFC}
        />
        <div id="right-container">
          <TimelineComponent
            className="Timeline"
            allArtworks={this.state.allArtworks}
            currentIndex={this.state.currentIndex}
            onClick={this.switchToArtwork}
          />
          <ArtworkComponent
            className="Artwork"
            artwork={
              this.state.currentIndex !== null ? this.currentArtwork() : null
            }
            reload={this.shouldReloadScene}
          />
        </div>
      </div>
    );
  }

  startWFC(artwork) {
    this.shouldReloadScene = true;

    this.state.allArtworks.push(artwork);
    this.setState({
      currentIndex: this.state.allArtworks.length - 1,
      isCreating: true
    });

    this.wfcWorker.postMessage(message.start(artwork));
  }

  cancelWFC() {
    this.state.allArtworks.pop();
    this.setState({ currentIndex: null, isCreating: false });

    this.wfcWorker.postMessage(message.cancel());
  }

  switchToArtwork(n) {
    this.shouldReloadScene = true;

    console.log("Switch to", n);
    this.setState({
      currentIndex: n,
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
  }),
  cancel: () => ({ type: "cancel" })
};

export default App;
