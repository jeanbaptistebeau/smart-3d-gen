import React, { Component } from "react";

class TimelineComponent extends Component {
  constructor() {
    super();
  }

  render() {
    return <div className={this.props.className}>{this.versionButtons()}</div>;
  }

  versionButtons() {
    const { allArtworks } = this.props;
    var versionButtons = [];

    for (let i = 0; i < allArtworks.length; i++) {
      const artwork = allArtworks[i];

      var button = (
        <button
          className="versionButton"
          key={i}
          onClick={() => {
            this.props.onClick(i);
          }}
        >
          Version {i}
        </button>
      );

      versionButtons.push(button);
    }

    return versionButtons;
  }
}

export default TimelineComponent;