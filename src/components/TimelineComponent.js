import React, { Component } from "react";

class TimelineComponent extends Component {
  render() {
    return <div className={this.props.className}>{this.versionButtons()}</div>;
  }

  versionButtons() {
    const { allArtworks } = this.props;
    var versionButtons = [];

    for (let i = 0; i < allArtworks.length; i++) {
      // const artwork = allArtworks[i];

      var button = (
        <button
          className="versionButton"
          key={i}
          isselected={i === this.props.currentIndex ? "true" : "false"}
          onClick={() => {
            this.props.onClick(i);
          }}
        >
          Version {i + 1}
        </button>
      );

      versionButtons.push(button);
    }

    return versionButtons;
  }
}

export default TimelineComponent;
