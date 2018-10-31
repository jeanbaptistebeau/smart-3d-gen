export default () => {
  var width, height, depth;
  var N;
  var patterns, relations;

  const sizeFactor = 10;

  const UP = 0;
  const RIGHT = 1;
  const DOWN = 2;
  const LEFT = 3;
  const FRONT = 4;
  const BACK = 5;

  /// Message handler
  onmessage = function(message) {
    switch (message.data.type) {
      case "start":
        start(message.data.body);
        break;
      default:
        break;
    }
  };

  /// Start function
  function start({ _N, src, srcSize }) {
    N = _N;

    width = N * sizeFactor;
    height = N * sizeFactor;
    depth = N * sizeFactor;

    // OUT: Initialize matrix
    this.postMessage(message.init(sizeFactor, sizeFactor, sizeFactor, N));

    // Creates patterns from source
    patterns = createPatterns(src, srcSize);

    // Creates relations from patterns
    relations = createRelations();

    // Merge identical patterns
    mergePatternsAndRelations();

    console.log(patterns);
    console.log(relations);

    // Creates output array representing tiles with states
    var tiles = createOutputArray();

    // WFC Algorithm
    waveFunctionCollapse(tiles);
  }

  /// Main loop
  function waveFunctionCollapse(tiles) {
    var minEntropyTile = selectTile(tiles, Object.keys(patterns).length);

    // All tiles collapsed
    if (minEntropyTile === null) return;

    var tilesToRender = new Set();

    collapse(minEntropyTile);

    propagate(minEntropyTile, tiles, tilesToRender);

    // Update UI
    updateUITiles(tilesToRender);

    setTimeout(function() {
      waveFunctionCollapse(tiles);
    }, 100);
  }

  // ####################################################
  // WFC Algorithm

  /// Selects tile with minimal entropy (that has the least possible patterns)
  function selectTile(tiles, nbPatterns) {
    var minEntropy = nbPatterns + 1;
    var minEntropyTiles = [];

    for (var x = 0; x < tiles.length; x++) {
      for (var y = 0; y < tiles[x].length; y++) {
        for (var z = 0; z < tiles[x][y].length; z++) {
          const tile = tiles[x][y][z];
          const entropy = Object.values(tile.state).filter(Boolean).length;

          if (entropy > 1) {
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

    var counter = -1;
    for (let id in tile.state) {
      if (tile.state[id]) {
        counter++;
        tile.state[id] = counter === randomIndex;
      }
    }
  }

  /// Propagates changes in a tile to neighbours
  function propagate(changedTile, tiles, tilesToRender) {
    // Save that tile needs to be re-rendered
    tilesToRender.add(changedTile);

    // Get pattern of changed tile
    const patternID = remainingPatternID(changedTile);
    if (patternID === undefined || patternID === null) return;

    const pos = changedTile.position;

    // For each direction
    for (var dir = 0; dir < 6; dir++) {
      const nextTile = neighbour(pos, tiles, dir);
      if (nextTile === undefined) continue;

      const alreadyCollapsed = tileCollapsed(nextTile);
      if (alreadyCollapsed) continue;

      const allowedPatternIDs = relations[patternID][dir];
      if (allowedPatternIDs.length === 0) continue;

      // Update state of neighbour
      for (let id in nextTile.state) {
        if (!allowedPatternIDs.includes(id)) nextTile.state[id] = false;
      }

      // If neighbour collapsed just now, propagate to other neighbours
      if (!alreadyCollapsed && tileCollapsed(nextTile)) {
        propagate(nextTile, tiles, tilesToRender);
      } else {
        tilesToRender.add(nextTile);
      }
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
  function createPatterns(src, srcSize) {
    var patterns = {};
    var counter = 0;

    // Initialize all patterns
    for (var x = 0; x <= srcSize - N; x++) {
      for (var y = 0; y <= srcSize - N; y++) {
        for (var z = 0; z <= srcSize - N; z++) {
          patterns[counter] = {
            offset: { x: x, y: y, z: z },
            grid: emptyGrid()
          };

          counter++;
        }
      }
    }

    // Set values of patterns
    for (var x = 0; x < srcSize; x++) {
      for (var y = 0; y < srcSize; y++) {
        for (var z = 0; z < srcSize; z++) {
          for (let id in patterns) {
            const offset = patterns[id].offset;
            setPatternValue(
              patterns[id],
              src[x][y][z],
              x - offset.x,
              y - offset.y,
              z - offset.z
            );
          }
        }
      }
    }

    return patterns;
  }

  // Creates an empty pattern
  function emptyGrid() {
    var p = new Array(N);

    for (var x = 0; x < N; x++) {
      p[x] = new Array(N);
      for (var y = 0; y < N; y++) {
        p[x][y] = new Array(N);
        for (var z = 0; z < N; z++) {
          p[x][y][z] = -1;
        }
      }
    }

    return p;
  }

  /// Sets a specific value in a pattern
  function setPatternValue(pattern, value, x, y, z) {
    if (x >= 0 && y >= 0 && z >= 0 && x < N && y < N && z < N) {
      pattern.grid[x][y][z] = value;
    }
  }

  /// Creates the relations between the patterns
  function createRelations() {
    var relations = {};

    // Initialize with empty arrays
    for (let id in patterns) {
      relations[id] = Array(6);
      for (var dir = 0; dir < relations[id].length; dir++) {
        relations[id][dir] = [];
      }
    }

    for (let id1 in patterns) {
      const pattern1 = patterns[id1];
      const o1 = pattern1.offset;

      for (let id2 in patterns) {
        const pattern2 = patterns[id2];
        const o2 = pattern2.offset;

        // FRONT
        if (o2.x === o1.x && o2.y === o1.y && o2.z === o1.z + N)
          relations[id1][FRONT].push(id2);

        // BACK
        if (o2.x === o1.x && o2.y === o1.y && o2.z === o1.z - N)
          relations[id1][BACK].push(id2);

        // UP
        if (o2.x === o1.x && o2.y === o1.y + N && o2.z === o1.z)
          relations[id1][UP].push(id2);

        // DOWN
        if (o2.x === o1.x && o2.y === o1.y - N && o2.z === o1.z)
          relations[id1][DOWN].push(id2);

        // RIGHT
        if (o2.x === o1.x + N && o2.y === o1.y && o2.z === o1.z)
          relations[id1][RIGHT].push(id2);

        // LEFT
        if (o2.x === o1.x - N && o2.y === o1.y && o2.z === o1.z)
          relations[id1][LEFT].push(id2);
      }
    }

    return relations;
  }

  /// Merges identical patterns, i.e with the exact same grid
  function mergePatternsAndRelations() {
    var newPatterns = {};
    var identicalPatterns = {};

    for (let id in patterns) {
      const pattern = patterns[id];

      // Search if pattern already exists
      var alreadyExists = false;
      for (let newID in newPatterns) {
        if (gridsEqual(pattern.grid, newPatterns[newID])) {
          alreadyExists = true;
          identicalPatterns[id] = newID;
          break;
        }
      }

      // If not, add it to the list
      if (!alreadyExists) newPatterns[id] = pattern.grid;
    }

    // Merge rows in relations table
    for (let oldID in identicalPatterns) {
      const newID = identicalPatterns[oldID];

      for (var dir = 0; dir < 6; dir++) {
        relations[newID][dir] = relations[newID][dir].concat(
          relations[oldID][dir]
        );
      }

      delete relations[oldID];
    }

    // Update references in relations table
    for (let rowID in relations) {
      for (var dir = 0; dir < 6; dir++) {
        const ids = relations[rowID][dir];

        // Update references
        for (var i = 0; i < ids.length; i++) {
          const id = ids[i];
          if (id in identicalPatterns) ids[i] = identicalPatterns[id];
        }

        // Remove duplicates
        relations[rowID][dir] = Array.from(new Set(ids));
      }
    }

    // Update patterns
    patterns = newPatterns;
  }

  /// Creates the output array containing patterns and states
  function createOutputArray() {
    var output = Array(sizeFactor);

    for (var x = 0; x < sizeFactor; x++) {
      output[x] = Array(sizeFactor);
      for (var y = 0; y < sizeFactor; y++) {
        output[x][y] = Array(sizeFactor);
        for (var z = 0; z < sizeFactor; z++) {
          output[x][y][z] = {
            position: { x: x, y: y, z: z },
            state: stateArray(patterns)
          };
        }
      }
    }

    return output;
  }

  /// Creates state array from patterns
  function stateArray(patterns) {
    var state = {};
    for (let id in patterns) {
      state[id] = true;
    }

    return state;
  }

  /// Checks if two grids of same size are equal
  function gridsEqual(grid1, grid2) {
    for (var x = 0; x < grid1.length; x++) {
      for (var y = 0; y < grid1[x].length; y++) {
        for (var z = 0; z < grid1[x][y].length; z++) {
          if (grid1[x][y][z] != grid2[x][y][z]) return false;
        }
      }
    }

    return true;
  }

  // function randomVoxel() {
  //   const x = Math.floor(Math.random() * this.width);
  //   const y = Math.floor(Math.random() * this.height);
  //   const z = Math.floor(Math.random() * this.depth);
  //   return { x: x, y: y, z: z, value: 0xff3300 };
  // }

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
        uncertainty =
          Object.values(tile.state).filter(Boolean).length /
          Object.values(tile.state).length;
      } else if (patternID === null) {
        voxels = [];

        // Get voxels
        for (var x = 0; x < N; x++) {
          for (var y = 0; y < N; y++) {
            for (var z = 0; z < N; z++) {
              voxels.push({
                x: x,
                y: y,
                z: z,
                value: 0xff0000
              });
            }
          }
        }
      } else {
        voxels = [];
        const pattern = patterns[patternID];

        // Get voxels
        for (var x = 0; x < pattern.length; x++) {
          for (var y = 0; y < pattern[x].length; y++) {
            for (var z = 0; z < pattern[x][y].length; z++) {
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

    // there was only one pattern left
    return patternFound;
  }

  /// Determines if the tile is collapsed
  function tileCollapsed(tile) {
    const remainingID = remainingPatternID(tile);
    return remainingID !== null && remainingID !== undefined;
  }

  /// Message creator
  var message = {
    init: (w, h, d, boxSize) => ({
      type: "init",
      body: { width: w, height: h, depth: d, boxSize: boxSize }
    }),

    set: tilesToRender => ({
      type: "set",
      body: { tiles: tilesToRender }
    })
  };
};
