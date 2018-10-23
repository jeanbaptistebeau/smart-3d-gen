export default () => {
  var width, height, depth;
  var N, sizeFactor;

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
  function start({ N, src, srcSize }) {
    this.N = N;
    this.sizeFactor = 5;

    this.width = N * this.sizeFactor;
    this.height = N * this.sizeFactor;
    this.depth = N * this.sizeFactor;

    // OUT: Initialize matrix
    this.postMessage(
      message.init(this.sizeFactor, this.sizeFactor, this.sizeFactor, N)
    );

    // Creates patterns from source
    const patterns = createPatterns(N, src, srcSize);

    // Creates output array representing tiles with states
    var tiles = createOutputArray(this.sizeFactor, patterns);

    // WFC Algorithm
    waveFunctionCollapse(tiles, patterns);
  }

  /// Main loop
  function waveFunctionCollapse(tiles, patterns) {
    var minEntropyTile = selectTile(tiles, patterns.length);

    // All tiles collapsed
    if (minEntropyTile === null) return;

    collapse(minEntropyTile);

    propagate(minEntropyTile, tiles);

    updateUITile(minEntropyTile, patterns);

    setTimeout(function() {
      waveFunctionCollapse(tiles, patterns);
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
          const entropy = tile.state.filter(Boolean).length;

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
      Math.random() * tile.state.filter(Boolean).length
    );

    var counter = -1;
    for (var i = 0; i < tile.state.length; i++) {
      if (tile.state[i]) {
        counter++;
        tile.state[i] = counter === randomIndex;
      }
    }
  }

  /// Propagates changes in a tile to neighbours
  function propagate(changedTile, tiles) {
    // TODO: Propagate
  }

  // ####################################################
  // WFC Initialization

  /// Creates all the N-patterns from the source
  function createPatterns(N, src, srcSize) {
    var patterns = [];
    var counter = 0;

    // Initialize all patterns
    for (var x = 0; x <= srcSize - N; x++) {
      for (var y = 0; y <= srcSize - N; y++) {
        for (var z = 0; z <= srcSize - N; z++) {
          patterns.push({
            id: counter,
            offset: { x: x, y: y, z: z },
            grid: emptyPattern(N)
          });

          counter++;
        }
      }
    }

    // Set values of patterns
    for (var x = 0; x < srcSize; x++) {
      for (var y = 0; y < srcSize; y++) {
        for (var z = 0; z < srcSize; z++) {
          patterns.forEach(function(item, index, array) {
            const offset = item.offset;
            setPatternValue(
              item,
              src[x][y][z],
              N,
              x - offset.x,
              y - offset.y,
              z - offset.z
            );
          });
        }
      }
    }

    return patterns;
  }

  // Creates an empty pattern
  function emptyPattern(N) {
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
  function setPatternValue(pattern, value, N, x, y, z) {
    if (x >= 0 && y >= 0 && z >= 0 && x < N && y < N && z < N) {
      pattern.grid[x][y][z] = value;
    }
  }

  /// Creates the output array containing patterns and states
  function createOutputArray(sizeFactor, patterns) {
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
    return Array(patterns.length).fill(true);
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
  function updateUITile(tile, patterns) {
    var position = tile.position;
    var voxels = null;
    var uncertainty = null;

    // Find pattern that should be last allowed in this tile
    var pattern = remainingPattern(tile, patterns);

    if (pattern === undefined) {
      uncertainty = tile.state.filter(Boolean).length / tile.state.length;
    } else {
      voxels = [];

      // Get voxels
      for (var x = 0; x < pattern.grid.length; x++) {
        for (var y = 0; y < pattern.grid[x].length; y++) {
          for (var z = 0; z < pattern.grid[x][y].length; z++) {
            voxels.push({
              x: x,
              y: y,
              z: z,
              value: pattern.grid[x][y][z]
            });
          }
        }
      }
    }

    // Post changes
    this.postMessage(message.set(position, voxels, uncertainty));
  }

  /// Returns the last possible pattern for a tile
  /// or undefined if the tile still has several patterns
  function remainingPattern(tile, patterns) {
    var patternFound = null;

    for (var p = 0; p < tile.state.length; p++) {
      // if pattern available
      if (tile.state[p]) {
        // if no pattern found previously
        if (patternFound === null) {
          patternFound = patterns[p];
        } else {
          // there are several patterns
          return undefined;
        }
      }
    }

    // there was only one pattern left
    return patternFound;
  }

  /// Message creator
  var message = {
    init: (w, h, d, boxSize) => ({
      type: "init",
      body: { width: w, height: h, depth: d, boxSize: boxSize }
    }),

    set: (position, voxels, uncertainty) => ({
      type: "set",
      body: {
        box: { position: position, voxels: voxels, uncertainty: uncertainty }
      }
    })
  };
};
