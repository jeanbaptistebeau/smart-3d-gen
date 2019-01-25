export default () => {
  // var width, height, depth;
  var N;
  var sizeFactor;
  var allowedContradiction;
  var groundMagnetism;
  var occurences;
  var patterns, relations, negativePatterns, negativeRelations;

  var last_rendering_time = null;

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
      default:
        break;
    }
  };

  /// Start function
  function start(arg) {
    N = arg.N;
    sizeFactor = arg.sizeFactor;
    allowedContradiction = arg.allowedContradiction;
    groundMagnetism = arg.groundMagnetism;

    occurences = {}; // associate each pattern with an occurence number
    patterns = {}; // contains ALL patterns
    relations = {}; // contains only positives patterns
    negativeRelations = {}; // contains only negatives patterns
    negativePatterns = {}; // contains only negatives patterns

    let patternCounter = 0;

    last_rendering_time = +new Date();

    console.log("Initializing with", arg.positives.length, "sources...");

    // width = N * sizeFactor;
    // height = N * sizeFactor;
    // depth = N * sizeFactor;

    let matrices = [];

    // FOR EACH POSITIVE SOURCE
    for (let i = 0; i < arg.positives.length; i++) {
      const src = arg.positives[i].matrix;
      const allowYRotation = arg.positives[i].allowYRotation;

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
    for (let i = 0; i < arg.negatives.length; i++) {
      const src = arg.negatives[i].matrix;
      const allowYRotation = arg.negatives[i].allowYRotation;

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
      let { patternMatrix, counterEnd, localOccurences } = createPatterns(
        src,
        patternCounter
      );
      patternCounter = counterEnd;

      console.log("Created Patterns");

      // Creates relations from patterns
      let srcRelations = createRelations(patternMatrix);

      console.log("Created Relations");

      // Merge air and convert pattern matrix to pattern array
      let srcPatterns = mergeAir(patternMatrix, srcRelations, localOccurences);

      console.log("Merged Air");

      // Merge local identical patterns (in same source)
      srcPatterns = mergePatternsAndRelations(
        srcPatterns,
        new Set([srcRelations]),
        localOccurences
      );

      console.log("Merged Patterns and Relations");

      // Process depending on positive or negative
      Object.assign(patterns, srcPatterns);
      if (positive) {
        Object.assign(relations, srcRelations);
        Object.assign(occurences, localOccurences);
      } else {
        Object.assign(negativePatterns, srcPatterns);
        Object.assign(negativeRelations, srcRelations);
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
      new Set([relations, negativeRelations]),
      occurences
    );

    console.log(Object.keys(patterns).length, "patterns in total.");

    console.log(patterns);
    console.log(occurences);
    console.log(relations);
    console.log(negativeRelations);
    console.log(negativePatterns);

    // Creates output array representing tiles with states
    var tiles = createOutputArray();

    // console.log("Starting WFC...");

    // WFC Algorithm
    waveFunctionCollapse(tiles, 0, +new Date());
  }

  /// Main loop
  function waveFunctionCollapse(tiles, iteration, last_rendering_time) {
    // const time_start = +new Date();

    // console.log("Copying...");

    // Copy the WHOLE matrix
    let backupTiles = copyTiles(tiles);

    // console.log("Selecting...");

    var minEntropyTile = selectTile(tiles, Object.keys(patterns).length);

    // All tiles collapsed
    if (minEntropyTile === null) {
      console.log("Success.");
      this.postMessage(message.finished());
      return;
    }

    // Prepare tiles to render
    var tilesToRender = new Set();

    // console.log("Collapsing...");

    // Collapse and store the id
    let idCollapsed = collapse(minEntropyTile);

    // console.log("Collapsed", minEntropyTile.position, "in", idCollapsed);

    // console.log("Propagating...");

    // Propagate and store the result (contradiction or not)
    let result = propagate(minEntropyTile, tiles, tilesToRender, null);

    // If contradiction in propagation
    if (result === false) {
      console.log("Contradiction at", minEntropyTile.position);

      // Restore backup
      tiles = backupTiles;

      // Forbid this collapsing
      const pos = minEntropyTile.position;
      minEntropyTile = tiles[pos.x][pos.y][pos.z];
      minEntropyTile.state[idCollapsed] = false;

      // Cancel rendering
      tilesToRender = new Set();

      // If tile is collapsed after forbiding this collapsing, propagate
      if (tileCollapsed(minEntropyTile)) {
        let secondResult = propagate(
          minEntropyTile,
          tiles,
          tilesToRender,
          null
        );

        // Here we have a problem
        if (secondResult === false) {
          // console.log("Fatal error at iteration", iteration);

          // let acceptContradiction = Math.random() < allowedContradiction;

          // if (acceptContradiction) {
          // Forbid this collapsing
          let id = remainingPatternID(minEntropyTile);
          minEntropyTile.state[id] = false;

          // Render this tile only
          tilesToRender = new Set([minEntropyTile]);
          // } else {
          //   return false;
          // }
        }
      }
    } else {
      backupTiles = null;
    }

    // RECURSIVE CALL
    // let success = waveFunctionCollapse(tiles, iteration + 1);
    // console.log(iteration, success);

    // console.log("Done");

    // CALL NEXT STEP
    if (tilesToRender.size === 0) {
      waveFunctionCollapse(tiles, iteration + 1, last_rendering_time);
    } else {
      const time_now = +new Date();
      const since_last_render = time_now - last_rendering_time;

      if (since_last_render > TIMER_MS) {
        updateUITiles(tilesToRender);
        const rendering_time = +new Date();
        waveFunctionCollapse(tiles, iteration + 1, rendering_time);
      } else {
        setTimeout(function() {
          updateUITiles(tilesToRender);
          const rendering_time = +new Date();
          waveFunctionCollapse(tiles, iteration + 1, rendering_time);
        }, TIMER_MS - since_last_render);
      }
    }

    // if (success === false) {
    // // Create a new copy of the original tiles
    // let newTiles = copyTiles(tiles);
    //
    // // Forbid this collapsing
    // const pos = minEntropyTile.position;
    // const newSelectedTile = newTiles[pos.x][pos.y][pos.z];
    // newSelectedTile.state[idCollapsed] = false;
    //
    // // If tile got collapsed
    // if (tileCollapsed(newSelectedTile)) {
    //   // Propagate
    //   let secondResult = propagate(
    //     newSelectedTile,
    //     newTiles,
    //     new Set(),
    //     null
    //   );
    //   if (secondResult === false) return false;
    // }
    //
    // // Render everything
    // tilesToRender = new Set();
    // for (let x = 0; x < newTiles.length; x++) {
    //   for (let y = 0; y < newTiles[x].length; y++) {
    //     for (let z = 0; z < newTiles[x][y].length; z++) {
    //       tilesToRender.add(newTiles[x][y][z]);
    //     }
    //   }
    // }
    // updateUITiles(tilesToRender);
    //
    // // SECOND RECURSIVE CALL
    // // If there's an error this time, then problem is deeper, call parent
    // let success = waveFunctionCollapse(newTiles, iteration + 1);
    // // console.log(iteration, success);
    // if (success === false) return false;
    // }

    // If nothing to render, go straight to next step
    // if (tilesToRender.size === 0) {
    //   waveFunctionCollapse(tiles, last_rendering_time);
    // } else {
    //   const time_now = +new Date();
    //   const since_last_render = time_now - last_rendering_time;
    //
    //   if (since_last_render > TIMER_MS) {
    //     updateUITiles(tilesToRender);
    //     const rendering_time = +new Date();
    //     waveFunctionCollapse(tiles, rendering_time);
    //   } else {
    //     setTimeout(function() {
    //       updateUITiles(tilesToRender);
    //       const rendering_time = +new Date();
    //       waveFunctionCollapse(tiles, rendering_time);
    //     }, TIMER_MS - since_last_render);
    //   }
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
    // Create array with patterns and coefficients
    let patternsCoefficients = [];
    let sum = 0;
    for (let id in tile.state) {
      if (tile.state[id]) {
        patternsCoefficients.push({ id: id, coeff: occurences[id] });
        sum += occurences[id];
      }
    }

    let idCollapsed;

    // With a given probability, ignore distribution
    let randomProba = 0.05;
    if (Math.random() < randomProba) {
      const randomIndex = Math.floor(
        Math.random() * patternsCoefficients.length
      );
      idCollapsed = patternsCoefficients[randomIndex].id;
    } else {
      // Get random number
      const r = Math.random() * sum;

      // Get corresponding id
      idCollapsed = patternsCoefficients[0].id;
      let current = 0;
      for (let i = 0; i < patternsCoefficients.length; i++) {
        current += patternsCoefficients[i].coeff;

        if (r < current) {
          idCollapsed = patternsCoefficients[i].id;
          break;
        }
      }
    }

    // Update tile state
    for (let id in tile.state) {
      tile.state[id] = id === idCollapsed;
    }

    // should never be called
    return idCollapsed;
  }

  /// Propagates changes in a tile to neighbours
  function propagate(changedTile, tiles, tilesToRender, forbiddenDirection) {
    // Save that tile needs to be re-rendered
    tilesToRender.add(changedTile);

    // console.log(
    //   changedTile.position,
    //   Object.values(changedTile.state).filter(Boolean).length
    // );

    // Get patterns of changed tile
    let patternIDs = remainingPatternIDs(changedTile);
    if (patternIDs.size === 0) return;

    const pos = changedTile.position;

    // For each direction
    for (let dir = 0; dir < 6; dir++) {
      const nextTile = neighbour(pos, tiles, dir);
      if (dir === forbiddenDirection) continue;
      if (nextTile === undefined) continue;

      // This prevents propagation loops (NOT NEEDED ANYMORE)
      // if (tilesToRender.has(nextTile)) continue;

      // If neighbour already in contradiction, ignore it
      if (tileContradiction(nextTile)) continue;

      // Check that there are some allowed pattern
      // If not, then it's a pattern on the border and there's nothing to propagate
      let numberOfAllowedPatterns = 0;
      for (let possibleID of patternIDs)
        numberOfAllowedPatterns += relations[possibleID][dir].length;
      if (numberOfAllowedPatterns === 0) continue;

      // UPDATE NEIGHBOUR

      const entropyBefore = Object.values(nextTile.state).filter(Boolean)
        .length;

      // 1. Get allowed patterns id in neighbour
      let allowedIDs = new Set();
      for (let id in nextTile.state) {
        if (nextTile.state[id]) allowedIDs.add(parseInt(id));
      }

      // 2. Get all allowed ids considering relations, and remove them from list above
      for (let possibleID of patternIDs) {
        const allowedNeighbourIDs = new Set(relations[possibleID][dir]);
        for (let id of allowedNeighbourIDs) allowedIDs.delete(id);
      }

      // 3. Remaining ids in the list should be set to false
      for (let remainingID of allowedIDs) nextTile.state[remainingID] = false;

      // Negative relations
      if (patternIDs.size === 1) {
        const id = parseInt(patternIDs.values().next().value);
        if (negativeRelations[id] != undefined) {
          const forbiddenIDs = new Set(negativeRelations[id][dir]);
          for (let forbiddenID of forbiddenIDs) {
            // Check that non equal: to avoid cancelling air next to air
            if (forbiddenID !== id) nextTile.state[forbiddenID] = false;
          }
        }
      }

      const entropyAfter = Object.values(nextTile.state).filter(Boolean).length;

      // If no changes, stop here
      if (entropyBefore === entropyAfter) continue;

      // If tile is in contradiction state, step back
      if (tileContradiction(nextTile)) return false;

      // PROPAGATE TO OTHER NEIGHBOURS
      let result = propagate(nextTile, tiles, tilesToRender, opposite(dir));

      // If contradiction later on, step back
      if (result === false) return false;
    }

    return true;
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
    var counter = counterStart;

    var _occurences = {};

    // Initialize all patterns (start with a negative offset)
    var patternMatrix = new Array(src.length + N - 1);
    for (let x = -N + 1; x < src.length; x++) {
      let newX = x + N - 1;
      patternMatrix[newX] = new Array(src[0].length + N - 1);
      for (let y = -N + 1; y < src[0].length; y++) {
        let newY = y + N - 1;
        patternMatrix[newX][newY] = new Array(src[0][0].length + N - 1);
        for (let z = -N + 1; z < src[0][0].length; z++) {
          let newZ = z + N - 1;

          // Create new pattern
          patternMatrix[newX][newY][newZ] = {
            id: counter,
            isAir: true,
            grid: emptyGrid()
          };

          // Add to occurences
          _occurences[counter] = 1;

          counter++;

          // Set value in relevant patterns
          if (x >= 0 && y >= 0 && z >= 0) {
            const value = src[x][y][z];
            for (let dX = 0; dX < N; dX++) {
              if (x - dX < 0) continue;
              for (let dY = 0; dY < N; dY++) {
                if (y - dY < 0) continue;
                for (let dZ = 0; dZ < N; dZ++) {
                  if (z - dZ < 0) continue;
                  const offsetPattern = patternMatrix[x - dX][y - dY][z - dZ];
                  offsetPattern.grid[dX][dY][dZ] = value;
                  if (value !== -1) offsetPattern.isAir = false;
                }
              }
            }
          }

          //
        }
      }
    }

    return {
      patternMatrix: patternMatrix,
      counterEnd: counter,
      localOccurences: _occurences
    };
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

  /// Creates the relations between the patterns
  function createRelations(patternMatrix) {
    var _relations = {};

    // Loop in 3d pattern matrix
    for (let x = 0; x < patternMatrix.length; x++) {
      for (let y = 0; y < patternMatrix[x].length; y++) {
        for (let z = 0; z < patternMatrix[x][y].length; z++) {
          const id = patternMatrix[x][y][z].id;

          // Initialize relation row
          _relations[id] = Array(6);
          for (let dir = 0; dir < _relations[id].length; dir++) {
            _relations[id][dir] = [];
          }

          // BACK (& FRONT)
          if (z - N >= 0) {
            let id_back = patternMatrix[x][y][z - N].id;
            _relations[id][BACK].push(id_back);
            _relations[id_back][FRONT].push(id);
          }

          // DOWN (& UP)
          if (y - N >= 0) {
            let id_down = patternMatrix[x][y - N][z].id;
            _relations[id][DOWN].push(id_down);
            _relations[id_down][UP].push(id);
          }

          // LEFT (& RIGHT)
          if (x - N >= 0) {
            let id_left = patternMatrix[x - N][y][z].id;
            _relations[id][LEFT].push(id_left);
            _relations[id_left][RIGHT].push(id);
          }
        }
      }
    }

    return _relations;
  }

  function mergeAir(patternMatrix, _relations, _occurences) {
    let _patterns = {};
    let firstAirId = null;
    let otherAirIds = [];

    for (let x = 0; x < patternMatrix.length; x++) {
      for (let y = 0; y < patternMatrix[x].length; y++) {
        for (let z = 0; z < patternMatrix[x][y].length; z++) {
          const pattern = patternMatrix[x][y][z];

          if (pattern.isAir) {
            if (firstAirId === null) {
              firstAirId = pattern.id;
              _patterns[pattern.id] = pattern.grid;
            } else {
              // Merge air
              for (let dir = 0; dir < 6; dir++) {
                if (_relations[pattern.id][dir].length > 0)
                  _relations[firstAirId][dir].push(
                    _relations[pattern.id][dir][0]
                  );
              }
              delete _relations[pattern.id];

              // Merge occurences
              _occurences[firstAirId] += _occurences[pattern.id];
              delete _occurences[pattern.id];

              otherAirIds.push(pattern.id);
            }
          } else {
            _patterns[pattern.id] = pattern.grid;
          }
        }
      }
    }

    // Clean references in relations table
    for (let rowID in _relations) {
      for (let dir = 0; dir < 6; dir++) {
        const ids = _relations[rowID][dir];

        // Update references
        for (let i = 0; i < ids.length; i++)
          if (otherAirIds.includes(ids[i])) ids[i] = firstAirId;

        // Remove duplicates
        _relations[rowID][dir] = Array.from(new Set(ids));
      }
    }

    return _patterns;
  }

  /// Merges identical patterns, i.e with the exact same grid
  function mergePatternsAndRelations(_patterns, _relationsSet, _occurences) {
    var newPatterns = {};
    var identicalPatterns = {};

    for (let id in _patterns) {
      const grid = _patterns[id];

      // Search if pattern already exists
      var alreadyExists = false;
      for (let newID in newPatterns) {
        if (gridsEqual(grid, newPatterns[newID])) {
          alreadyExists = true;
          identicalPatterns[id] = parseInt(newID);
          break;
        }
      }

      // If not, add it to the list
      if (!alreadyExists) newPatterns[id] = grid;
    }

    // Merge occurrences
    for (let oldID in identicalPatterns) {
      const newID = identicalPatterns[oldID];

      if (!(oldID in _occurences)) continue;
      if (!(newID in _occurences)) _occurences[newID] = 0;

      _occurences[newID] += _occurences[oldID];
      delete _occurences[oldID];
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

        // Merge rows
        for (let dir = 0; dir < 6; dir++) {
          for (let i = 0; i < _relations[oldID][dir].length; i++) {
            _relations[newID][dir].push(_relations[oldID][dir][i]);
          }
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
        if (relations[id][DOWN].length === 0) groundPatterns.add(parseInt(id));
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

  /// Copy the whole tiles array
  function copyTiles(tiles) {
    let newTiles = new Array(tiles.length);
    for (let x = 0; x < tiles.length; x++) {
      newTiles[x] = new Array(tiles[x].length);
      for (let y = 0; y < tiles[x].length; y++) {
        newTiles[x][y] = new Array(tiles[x][y].length);
        for (let z = 0; z < tiles[x][y].length; z++) {
          const old = tiles[x][y][z];
          newTiles[x][y][z] = {
            position: {
              x: old.position.x,
              y: old.position.y,
              z: old.position.z
            },
            state: copyState(old.state)
          };
        }
      }
    }

    return newTiles;
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
    // Create output matrix
    let finalTiles = new Array(sizeFactor);
    for (let x = 0; x < sizeFactor; x++) {
      finalTiles[x] = new Array(sizeFactor);
      for (let y = 0; y < sizeFactor; y++) {
        finalTiles[x][y] = new Array(sizeFactor);
        for (let z = 0; z < sizeFactor; z++) {
          finalTiles[x][y][z] = null;
        }
      }
    }

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
      finalTiles[position.x][position.y][position.z] = {
        position: position,
        voxels: voxels,
        uncertainty: uncertainty
      };
    }

    bufferRendering(finalTiles);
  }

  /// Sends render message if possible
  var tilesInBuffer = null;
  function bufferRendering(tiles) {
    // Merge tiles with buffer
    if (tilesInBuffer === null) {
      tilesInBuffer = tiles;
    } else {
      for (let x = 0; x < tilesInBuffer.length; x++) {
        for (let y = 0; y < tilesInBuffer[x].length; y++) {
          for (let z = 0; z < tilesInBuffer[x][y].length; z++) {
            const tile = tiles[x][y][z];
            if (tile !== null) tilesInBuffer[x][y][z] = tile;
          }
        }
      }
    }

    const time_now = +new Date();
    if (time_now - last_rendering_time >= TIMER_MS) {
      let oneDimensionalOutput = [];
      for (let x = 0; x < tilesInBuffer.length; x++) {
        for (let y = 0; y < tilesInBuffer[x].length; y++) {
          for (let z = 0; z < tilesInBuffer[x][y].length; z++) {
            const tile = tilesInBuffer[x][y][z];
            if (tile !== null) oneDimensionalOutput.push(tile);
          }
        }
      }

      this.postMessage(message.set(oneDimensionalOutput));
      tilesInBuffer = null;
      last_rendering_time = time_now;
    }
  }

  /// Returns the last possible pattern for a tile
  /// or undefined if the tile still has several patterns
  function remainingPatternID(tile) {
    let ids = remainingPatternIDs(tile);

    if (ids.size === 0) return null;
    if (ids.size > 1) return undefined;
    return ids.values().next().value;
  }

  function remainingPatternIDs(tile) {
    let ids = new Set();

    for (let id in tile.state) {
      if (tile.state[id]) ids.add(id);
    }

    return ids;
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
  function opposite(dir) {
    if (dir === 4 || dir === 5) return 9 - dir;
    return (dir + 2) % 4;
  }

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
