# Smart 3D Generator

A project by Jean-Baptiste Beau, in the Media & Design Lab of EPFL.

Developed in JavaScript, using ThreeJS and React.

The project aim to create an interface where users can interact with the WaveFunctionCollapse algorithm. The user can create multiple inputs, control the parameters, and visualize the output. In a creation process of trial-and-error, the user can adapt the input and the parameters at each step, until he is satisfied with the output.

## How to run

1. Install [Yarn](https://yarnpkg.com/en/).
2. In the main folder of the project, run `yarn start`

## wfc.worker.js

The algorithm part is running on a background thread, using JavaScript's Web Workers. This file contains all the code for the algorithm — it was not possible to split it due to incompatibility between Web Workers and React.
This thread communicates with the UI using messages. Once it gets a start message, containing all relevant information, the algorithm starts.

## UI Interface

The interface is made using React Components. There are four main components:

#### Toolbar

The toolbar component handles all the interaction related to the parameters and sources on the left panel.

#### Artwork

The artwork component contains the visualization logic on the remaining part of the screen. It contains multiple SceneComponent objects, one for each output/version.

#### Timeline

The timeline is above the Artwork component, it contains the versions buttons to navigate between the different creations.

### Editor

The editor appears when the user either add a new input or modify an existing one. It contains an interactive scene where the user can place and remove blocks, colors buttons to change the brush color, and buttons to change the size of the input.
