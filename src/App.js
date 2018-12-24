import React, { Component } from "react";
import ArtworkComponent from "./components/ArtworkComponent";
import ToolbarComponent from "./components/ToolbarComponent";
import TimelineComponent from "./components/TimelineComponent";
import EditorComponent from "./components/editor/EditorComponent";
import "./App.css";

import worker from "./model/wfc.worker.js";
import WebWorker from "./model/WebWorker";
import Artwork from "./model/Artwork.js";
import Palette from "./model/Palette.js";

class App extends Component {
  state = {
    currentPalette: null,
    currentIndex: null,
    allArtworks: [],
    currentState: null
  };

  wfcWorker = null;

  currentArtwork() {
    return this.state.allArtworks[this.state.currentIndex];
  }

  constructor() {
    super();

    this.handleMessage = this.handleMessage.bind(this);
    this.startWFC = this.startWFC.bind(this);
    this.cancelWFC = this.cancelWFC.bind(this);
    this.create = this.create.bind(this);
    this.switchToArtwork = this.switchToArtwork.bind(this);
    this.openEditorWithMatrix = this.openEditorWithMatrix.bind(this);

    // Setup worker
    this.wfcWorker = new WebWorker(worker);
    this.wfcWorker.onmessage = this.handleMessage;

    // Setup state
    this.state.currentPalette = new Palette();
    this.state.currentIndex = null;
    this.state.currentState = "new";
  }

  // Handles messages received from web worker
  handleMessage(message) {
    const m = message.data.body;

    switch (message.data.type) {
      case "set":
        if (this.state.currentIndex !== null) {
          var allArtworks = this.state.allArtworks;
          allArtworks[this.state.currentIndex].update(m.tiles);
          this.setState({ allArtworks: allArtworks });
        }
        break;
      case "finished":
        this.finishedWFC();
        break;
      default:
        break;
    }
  }

  // Renders the whole page
  render() {
    return (
      <div className="App">
        <EditorComponent ref={ref => (this.editor = ref)} />

        <ToolbarComponent
          className="Toolbar"
          palette={this.state.currentPalette}
          currentState={this.state.currentState}
          startWFC={this.startWFC}
          cancelWFC={this.cancelWFC}
          create={this.create}
          openEditor={this.openEditorWithMatrix}
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
            currentIndex={this.state.currentIndex}
            allArtworks={this.state.allArtworks}
          />
        </div>
      </div>
    );
  }

  // Creates a new palette for preparing a future artwork
  create() {
    console.log("Create new palette");
    this.setState({
      currentPalette: new Palette(this.state.currentPalette),
      currentIndex: null,
      currentState: "new"
    });
  }

  // Starts WFC generation
  startWFC(palette) {
    console.log("Start generation with", palette);

    let artwork = new Artwork(palette);

    this.state.allArtworks.push(artwork);
    this.setState({
      currentPalette: palette,
      currentIndex: this.state.allArtworks.length - 1,
      currentState: "creating"
    });

    this.wfcWorker.postMessage(message.start(artwork));
  }

  // Cancels WFC generation
  cancelWFC() {
    this.state.allArtworks.pop();
    this.setState({ currentIndex: null, currentState: "new" });

    this.wfcWorker.postMessage(message.cancel());
  }

  // Finished WFC generation
  finishedWFC() {
    this.currentArtwork().conclude();
    this.setState({ currentState: "finished" });
  }

  // Switch to a different artwork to display
  switchToArtwork(n) {
    console.log("Switch to", n);
    this.setState({
      currentIndex: n,
      currentState: "finished"
    });
  }

  // Opens editor with given matrix (or none)
  openEditorWithMatrix(matrix, callBack) {
    this.editor.show(matrix, callBack);
  }
}

// ####################################################
// Messages: APP -> WORKER

var message = {
  start: artwork => ({
    type: "start",
    body: {
      _N: artwork.palette.N,
      _sizeFactor: artwork.palette.sizeFactor,
      allowYRotation: artwork.palette.allowYRotation,
      positives: artwork.palette.positives,
      negatives: artwork.palette.negatives
    }
  }),
  cancel: () => ({ type: "cancel" })
};

export default App;
