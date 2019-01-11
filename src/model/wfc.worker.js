export default () => {
  // var width, height, depth;
  var N;
  var sizeFactor;
  var groundMagnetism;
  var patterns, relations, negativePatterns, negativeRelations;

  var shouldContinue = true;

  const UP = 0;
  const RIGHT = 1;
  const DOWN = 2;
  const LEFT = 3;
  const FRONT = 4;
  const BACK = 5;

  const TIMER_MS = 100;

  /// Message handler
  onmessage = function(message) {
    switch (message.data.type) {
      case "start":
        start(message.data.body);
        break;
      case "cancel":
        shouldContinue = false;
        break;
      default:
        break;
    }
  };

  /// Start function
  function start({ _N, _sizeFactor, _groundMagnetism, positives, negatives }) {
    N = _N;
    sizeFactor = _sizeFactor;
    groundMagnetism = _groundMagnetism;
    shouldContinue = true;

    patterns = {}; // contains ALL patterns
    relations = {}; // contains only positives patterns
    negativeRelations = {}; // contains only negatives patterns
    negativePatterns = {}; // contains only negatives patterns

    let patternCounter = 0;

    console.log("Initializing with", positives.length, "sources...");

    // width = N * sizeFactor;
    // height = N * sizeFactor;
    // depth = N * sizeFactor;

    let matrices = [];

    // FOR EACH POSITIVE SOURCE
    for (let i = 0; i < positives.length; i++) {
      const src = positives[i].matrix;
      const allowYRotation = positives[i].allowYRotation;

      matrices.push({ src: src, positive: true });

      // Add rotations
      if (allowYRotation) {
        const allRotations = getYRotations(src);
        for (let j = 0; j < allRotations.length; j++) {
          matrices.push({ src: allRotations[j], positive: true });
        }
      }
    }

    // FOR EACH NEGATIVE SOURCE
    for (let i = 0; i < negatives.length; i++) {
      const src = negatives[i].matrix;
      const allowYRotation = negatives[i].allowYRotation;

      matrices.push({ src: src, positive: false });

      // Add rotations
      if (allowYRotation) {
        const allRotations = getYRotations(src);
        for (let j = 0; j < allRotations.length; j++) {
          matrices.push({ src: allRotations[j], positive: false });
        }
      }
    }

    // FOR EACH MATRIX
    for (let i = 0; i < matrices.length; i++) {
      const src = matrices[i].src;
      const positive = matrices[i].positive;

      // Creates patterns from source
      let { srcPatterns, counterEnd } = createPatterns(src, patternCounter);
      patternCounter = counterEnd;

      if (shouldContinue === false) {
        return;
      }

      // Creates relations from patterns
      let srcRelations = createRelations(srcPatterns);

      if (shouldContinue === false) {
        return;
      }

      // Merge local identical patterns (in same source)
      srcPatterns = mergePatternsAndRelations(
        srcPatterns,
        new Set([srcRelations])
      );

      // Process depending on positive or negative
      Object.assign(patterns, srcPatterns);
      if (positive) {
        Object.assign(relations, srcRelations);
      } else {
        Object.assign(negativePatterns, srcPatterns);
        Object.assign(negativeRelations, srcRelations);
      }

      if (shouldContinue === false) {
        return;
      }

      console.log(
        Object.keys(srcPatterns).length,
        positive ? "local" : "negative",
        " patterns."
      );
    }

    // Merge global arrays (between different sources)
    patterns = mergePatternsAndRelations(
      patterns,
      new Set([relations, negativeRelations])
    );

    console.log(Object.keys(patterns).length, "patterns in total.");

    console.log(patterns);
    console.log(relations);
    console.log(negativeRelations);
    console.log(negativePatterns);

    // Creates output array representing tiles with states
    var tiles = createOutputArray();

    console.log("Starting WFC...");

    // WFC Algorithm
    waveFunctionCollapse(tiles);
  }

  /// Main loop
  function waveFunctionCollapse(tiles, last_rendering_time) {
    // const time_start = +new Date();

    if (shouldContinue === false) {
      return;
    }

    var minEntropyTile = selectTile(tiles, Object.keys(patterns).length);

    if (shouldContinue === false) {
      return;
    }

    // All tiles collapsed
    if (minEntropyTile === null) {
      console.log(tiles);
      this.postMessage(message.finished());
      return;
    }

    // Prepare tiles to render
    var tilesToRender = new Set();

    // Backup state of selected tile
    let backupState = copyState(minEntropyTile.state);

    // Collapse and store the id
    let idCollapsed = collapse(minEntropyTile);

    if (shouldContinue === false) {
      return;
    }

    // Propagate and store the result (contradiction or not)
    let result = propagate(minEntropyTile, tiles, tilesToRender);

    if (shouldContinue === false) {
      return;
    }

    // If contradiction in propagation
    if (result === null) {
      console.log("Contradiction at ", minEntropyTile.position);

      // Restore backup
      minEntropyTile.state = backupState;

      // Forbid this collapsing
      minEntropyTile.state[idCollapsed] = false;

      // Cancel rendering
      tilesToRender = new Set();

      // If tile is collapsed after forbiding this collapsing, propagate
      if (tileCollapsed(minEntropyTile)) {
        console.log("Forbiding this assignment caused collapsing.");
        let secondResult = propagate(minEntropyTile, tiles, tilesToRender);
        if (secondResult === null) {
          // Forbid this collapsing
          let id = remainingPatternID(minEntropyTile);
          minEntropyTile.state[id] = false;

          // Render this tile only
          tilesToRender = new Set([minEntropyTile]);

          console.log(
            "Fatal error. The current state of tiles doesn't have solution. Would need to cancel the last collapsing."
          );
        }
      }
    }

    if (shouldContinue === false) {
      return;
    }

    // If nothing to render, go straight to next step
    if (tilesToRender.size === 0) {
      waveFunctionCollapse(tiles, last_rendering_time);
    } else {
      const time_now = +new Date();
      const since_last_render = time_now - last_rendering_time;

      if (since_last_render > TIMER_MS) {
        updateUITiles(tilesToRender);
        const rendering_time = +new Date();
        waveFunctionCollapse(tiles, rendering_time);
      } else {
        setTimeout(function() {
          updateUITiles(tilesToRender);
          const rendering_time = +new Date();
          waveFunctionCollapse(tiles, rendering_time);
        }, TIMER_MS - since_last_render);
      }
    }

    // // Compute time difference
    // const time_end = +new Date();
    // const time_diff = time_end - time_start;
    //
    // if (time_diff > TIMER_MS) {
    //   waveFunctionCollapse(tiles);
    // } else {
    //   setTimeout(function() {
    //     waveFunctionCollapse(tiles);
    //   }, TIMER_MS - time_diff);
    // }
  }

  // ####################################################
  // WFC Algorithm

  /// Selects tile with minimal entropy (that has the least possible patterns)
  function selectTile(tiles, nbPatterns) {
    var minEntropy = nbPatterns + 1;
    var minEntropyTiles = [];

    for (let x = 0; x < tiles.length; x++) {
      for (let y = 0; y < tiles[x].length; y++) {
        for (let z = 0; z < tiles[x][y].length; z++) {
          const tile = tiles[x][y][z];
          const allowedPatterns = Object.values(tile.state).filter(Boolean)
            .length;
          let entropy = allowedPatterns;

          if (groundMagnetism) entropy += tile.position.y / tiles[x].length;

          if (allowedPatterns > 1) {
            if (entropy === minEntropy) {
              minEntropyTiles.push(tile);
            } else if (entropy < minEntropy) {
              minEntropy = entropy;
              minEntropyTiles = [tile];
            }
          }
        }
      }
    }

    if (minEntropyTiles.length === 0) return null;
    return minEntropyTiles[Math.floor(Math.random() * minEntropyTiles.length)];
  }

  /// Assigns a state to this tile (random for now)
  function collapse(tile) {
    const randomIndex = Math.floor(
      Math.random() * Object.values(tile.state).filter(Boolean).length
    );

    let idCollapsed;

    var counter = -1;
    for (let id in tile.state) {
      if (tile.state[id]) {
        counter++;
        tile.state[id] = counter === randomIndex;
        if (counter === randomIndex) idCollapsed = id;
      }
    }

    return idCollapsed;
  }

  /// Propagates changes in a tile to neighbours
  function propagate(changedTile, tiles, tilesToRender) {
    // Save that tile needs to be re-rendered
    tilesToRender.add(changedTile);

    // Get pattern of changed tile
    const patternID = remainingPatternID(changedTile);
    if (patternID === undefined || patternID === null) return;

    const pos = changedTile.position;

    let backupStates = [];

    // For each direction
    for (let dir = 0; dir < 6; dir++) {
      const nextTile = neighbour(pos, tiles, dir);
      if (nextTile === undefined) continue;

      // This prevents propagation loops
      if (tilesToRender.has(nextTile)) continue;

      // If neighbour already in contradiction, ignore it
      if (tileContradiction(nextTile)) continue;

      // Store if the tile was collapsed before propagation step
      const tileWasAlreadyCollapsed = tileCollapsed(nextTile);

      const allowedPatternIDs = relations[patternID][dir];
      if (allowedPatternIDs.length === 0) continue; // limit case next to border

      // Backup states
      backupStates.push({ tile: nextTile, state: copyState(nextTile.state) });

      // Update state of neighbour
      for (let id in nextTile.state) {
        if (!allowedPatternIDs.includes(id)) nextTile.state[id] = false;

        // Negative relations
        if (patternID in negativeRelations) {
          const forbiddenPatternIDs = negativeRelations[patternID][dir];
          if (forbiddenPatternIDs.includes(id)) nextTile.state[id] = false;
        }
      }

      // If tile is in contradiction state, restore backups and step back
      if (tileContradiction(nextTile)) {
        restoreBackups(backupStates);
        return null;
      }

      // If tile was already collapsed, we don't propagate more in this direction
      if (tileWasAlreadyCollapsed) continue;

      // If neighbour got collapsed now, propagate to other neighbours
      if (tileCollapsed(nextTile)) {
        let result = propagate(nextTile, tiles, tilesToRender);

        // If contradiction later on, restore backups and step back
        if (result === null) {
          restoreBackups(backupStates);
          return null;
        } else {
          backupStates = backupStates.concat(result);
        }
      } else {
        tilesToRender.add(nextTile);
      }
    }

    return backupStates;
  }

  /// Restores states backups if reached a constradiction
  function restoreBackups(backups) {
    for (let i = 0; i < backups.length; i++) {
      const { tile, state } = backups[i];
      tile.state = state;
    }
  }

  /// Gets the neighbour tile in the given direction
  function neighbour(pos, tiles, direction) {
    switch (direction) {
      case FRONT:
        if (pos.z + 1 >= sizeFactor) return undefined;
        return tiles[pos.x][pos.y][pos.z + 1];
      case BACK:
        if (pos.z - 1 < 0) return undefined;
        return tiles[pos.x][pos.y][pos.z - 1];
      case UP:
        if (pos.y + 1 >= sizeFactor) return undefined;
        return tiles[pos.x][pos.y + 1][pos.z];
      case DOWN:
        if (pos.y - 1 < 0) return undefined;
        return tiles[pos.x][pos.y - 1][pos.z];
      case RIGHT:
        if (pos.x + 1 >= sizeFactor) return undefined;
        return tiles[pos.x + 1][pos.y][pos.z];
      case LEFT:
        if (pos.x - 1 < 0) return undefined;
        return tiles[pos.x - 1][pos.y][pos.z];
      default:
        return undefined;
    }
  }

  // ####################################################
  // WFC Initialization

  /// Creates all the N-patterns from the source
  function createPatterns(src, counterStart) {
    var _patterns = {};
    var counter = counterStart;

    // Initialize all patterns
    for (let x = 0; x <= src.length - N; x++) {
      for (let y = 0; y <= src[x].length - N; y++) {
        for (let z = 0; z <= src[x][y].length - N; z++) {
          _patterns[counter] = {
            offset: { x: x, y: y, z: z },
            grid: emptyGrid()
          };

          counter++;
        }
      }
    }

    // Set values of patterns
    for (let x = 0; x < src.length; x++) {
      for (let y = 0; y < src[x].length; y++) {
        for (let z = 0; z < src[x][y].length; z++) {
          for (let id in _patterns) {
            const offset = _patterns[id].offset;
            setPatternValue(
              _patterns[id],
              src[x][y][z],
              x - offset.x,
              y - offset.y,
              z - offset.z
            );
          }
        }
      }
    }

    return { srcPatterns: _patterns, counterEnd: counter };
  }

  // Creates an empty pattern
  function emptyGrid() {
    var p = new Array(N);

    for (let x = 0; x < N; x++) {
      p[x] = new Array(N);
      for (let y = 0; y < N; y++) {
        p[x][y] = new Array(N);
        for (let z = 0; z < N; z++) {
          p[x][y][z] = -1;
        }
      }
    }

    return p;
  }

  /// Rotates the source along the Y axis
  function getYRotations(src) {
    const size = src.length;

    let rotation90 = new Array(size);
    let rotation180 = new Array(size);
    let rotation270 = new Array(size);

    for (let x = 0; x < size; x++) {
      rotation90[x] = new Array(size);
      rotation180[x] = new Array(size);
      rotation270[x] = new Array(size);

      for (let y = 0; y < size; y++) {
        rotation90[x][y] = new Array(size);
        rotation180[x][y] = new Array(size);
        rotation270[x][y] = new Array(size);

        for (let z = 0; z < size; z++) {
          rotation90[x][y][z] = src[size - z - 1][y][x];
          rotation180[x][y][z] = src[size - x - 1][y][size - z - 1];
          rotation270[x][y][z] = src[z][y][size - x - 1];
        }
      }
    }

    return [rotation90, rotation180, rotation270];
  }

  /// Sets a specific value in a pattern
  function setPatternValue(pattern, value, x, y, z) {
    if (x >= 0 && y >= 0 && z >= 0 && x < N && y < N && z < N) {
      pattern.grid[x][y][z] = value;
    }
  }

  /// Creates the relations between the patterns
  function createRelations(_patterns) {
    var _relations = {};

    // Initialize with empty arrays
    for (let id in _patterns) {
      _relations[id] = Array(6);
      for (let dir = 0; dir < _relations[id].length; dir++) {
        _relations[id][dir] = [];
      }
    }

    for (let id1 in _patterns) {
      const pattern1 = _patterns[id1];
      const o1 = pattern1.offset;

      for (let id2 in _patterns) {
        const pattern2 = _patterns[id2];
        const o2 = pattern2.offset;

        // FRONT
        if (o2.x === o1.x && o2.y === o1.y && o2.z === o1.z + N)
          _relations[id1][FRONT].push(id2);

        // BACK
        if (o2.x === o1.x && o2.y === o1.y && o2.z === o1.z - N)
          _relations[id1][BACK].push(id2);

        // UP
        if (o2.x === o1.x && o2.y === o1.y + N && o2.z === o1.z)
          _relations[id1][UP].push(id2);

        // DOWN
        if (o2.x === o1.x && o2.y === o1.y - N && o2.z === o1.z)
          _relations[id1][DOWN].push(id2);

        // RIGHT
        if (o2.x === o1.x + N && o2.y === o1.y && o2.z === o1.z)
          _relations[id1][RIGHT].push(id2);

        // LEFT
        if (o2.x === o1.x - N && o2.y === o1.y && o2.z === o1.z)
          _relations[id1][LEFT].push(id2);
      }
    }

    return _relations;
  }

  /// Merges identical patterns, i.e with the exact same grid
  function mergePatternsAndRelations(_patterns, _relationsSet) {
    var newPatterns = {};
    var identicalPatterns = {};

    for (let id in _patterns) {
      const pattern = _patterns[id];
      const grid = pattern.grid || pattern;

      // Search if pattern already exists
      var alreadyExists = false;
      for (let newID in newPatterns) {
        if (gridsEqual(grid, newPatterns[newID])) {
          alreadyExists = true;
          identicalPatterns[id] = newID;
          break;
        }
      }

      // If not, add it to the list
      if (!alreadyExists) newPatterns[id] = grid;
    }

    for (let _relations of _relationsSet) {
      // Merge rows in relations table
      for (let oldID in identicalPatterns) {
        const newID = identicalPatterns[oldID];

        // If old id is not in array, nothing to do
        if (!(oldID in _relations)) continue;

        // Add row if doesn't exists
        if (!(newID in _relations)) {
          _relations[newID] = new Array(6);
          for (let dir = 0; dir < 6; dir++) _relations[newID][dir] = [];
        }

        for (let dir = 0; dir < 6; dir++) {
          _relations[newID][dir] = _relations[newID][dir].concat(
            _relations[oldID][dir]
          );
        }

        delete _relations[oldID];
      }

      // Update references in relations table
      for (let rowID in _relations) {
        for (let dir = 0; dir < 6; dir++) {
          const ids = _relations[rowID][dir];

          // Update references
          for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            if (id in identicalPatterns) ids[i] = identicalPatterns[id];
          }

          // Remove duplicates
          _relations[rowID][dir] = Array.from(new Set(ids));
        }
      }
    }

    // Update patterns
    return newPatterns;
  }

  /// Creates the output array containing patterns and states
  function createOutputArray() {
    var output = Array(sizeFactor);

    // Identify ground patterns
    let groundPatterns = new Set();
    if (groundMagnetism) {
      for (let id in relations) {
        if (relations[id][DOWN].length === 0) groundPatterns.add(id);
      }
    }

    console.log(groundPatterns.size, "Ground patterns");

    for (let x = 0; x < sizeFactor; x++) {
      output[x] = Array(sizeFactor);
      for (let y = 0; y < sizeFactor; y++) {
        output[x][y] = Array(sizeFactor);
        for (let z = 0; z < sizeFactor; z++) {
          let state = stateArray();

          // Forbid ground patterns above the ground
          if (y > 0) {
            for (let id of groundPatterns) state[id] = false;
          }

          output[x][y][z] = {
            position: { x: x, y: y, z: z },
            state: state
          };
        }
      }
    }

    return output;
  }

  /// Creates state array from patterns
  function stateArray() {
    var state = {};
    for (let id in patterns) {
      if (!(id in negativePatterns)) state[id] = true;
    }

    return state;
  }

  /// Copy a state
  function copyState(state) {
    var copy = {};
    for (let id in state) {
      copy[id] = state[id];
    }

    return copy;
  }

  /// Checks if two grids of same size are equal
  function gridsEqual(grid1, grid2) {
    for (let x = 0; x < grid1.length; x++) {
      for (let y = 0; y < grid1[x].length; y++) {
        for (let z = 0; z < grid1[x][y].length; z++) {
          if (grid1[x][y][z] !== grid2[x][y][z]) return false;
        }
      }
    }

    return true;
  }

  // ####################################################
  // Messages: APP -> WORKER

  /// Updates scene by sending messages to main/UI thread
  function updateUITiles(tiles) {
    var finalTiles = [];

    for (let tile of tiles) {
      var position = tile.position;
      var voxels = null;
      var uncertainty = null;

      // Find pattern that should be last allowed in this tile
      var patternID = remainingPatternID(tile);

      if (patternID === undefined) {
        // Uncertain
        uncertainty =
          Object.values(tile.state).filter(Boolean).length /
          Object.values(tile.state).length;
      } else if (patternID === null) {
        // Contradiction
        uncertainty = 0;
      } else {
        voxels = [];
        const pattern = patterns[patternID];

        // Get voxels
        for (let x = 0; x < pattern.length; x++) {
          for (let y = 0; y < pattern[x].length; y++) {
            for (let z = 0; z < pattern[x][y].length; z++) {
              voxels.push({
                x: x,
                y: y,
                z: z,
                value: pattern[x][y][z]
              });
            }
          }
        }
      }

      // Add element to final array
      finalTiles.push({
        position: position,
        voxels: voxels,
        uncertainty: uncertainty
      });
    }

    this.postMessage(message.set(finalTiles));
  }

  /// Returns the last possible pattern for a tile
  /// or undefined if the tile still has several patterns
  function remainingPatternID(tile) {
    var patternFound = null;

    for (let id in tile.state) {
      // if pattern available
      if (tile.state[id]) {
        // if no pattern found previously
        if (patternFound === null) {
          patternFound = id;
        } else {
          // there are several patterns
          return undefined;
        }
      }
    }

    // there was one or zero pattern left
    return patternFound;
  }

  /// Determines if the tile is collapsed
  function tileCollapsed(tile) {
    const remainingID = remainingPatternID(tile);
    return remainingID !== null && remainingID !== undefined;
  }

  /// Determines if the tile is in a contradiction state
  function tileContradiction(tile) {
    return remainingPatternID(tile) === null;
  }

  /// Direction opposites
  // function opposite(dir) {
  //   if (dir === 4 || dir === 5) return 9 - dir;
  //   return (dir + 2) % 4;
  // }

  /// Message creator
  var message = {
    set: tilesToRender => ({
      type: "set",
      body: { tiles: tilesToRender }
    }),

    finished: () => ({
      type: "finished",
      body: {}
    })
  };
};
