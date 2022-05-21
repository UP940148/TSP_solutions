/* eslint-disable no-labels */
/*
Node Structure:
{
  x: ?,
  y: ?
}

Edge Structure:
{
  a: ?,
  b: ?
}

Fragment Structure:
[node1, node2, node3, ..., nodeN]
*/

let RESULTS;
let NODES = [];
let EDGES = [];
let FRAGS = [];
let TOUR = [];
let DISTMAT = [];
let WEIGHTS = [];

// Create non-euclidean graph

function initRandWeightMatrix(n = 50) {
  const matrix = [];
  for (let i = 0; i < n; i++) {
    matrix.push([]);
    for (let j = 0; j < n; j++) {
      matrix[i].push(undefined);
    }
  }
  // Create a random weight matrix (weights between 1 and 500)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // For every edge, create random weight (How do I make the matrix symmetrical?)
      if (i === j) {
        matrix[i][j] = Infinity;
      } else {
        const weight = Math.random() * 999 + 1;
        matrix[i][j] = weight;
        matrix[j][i] = weight;
      }
    }
  }
  DISTMAT = matrix;
}

function getEdges() {
  EDGES = [];
  NODES = [];
  for (let i = 0; i < DISTMAT.length; i++) {
    NODES.push(i);
    for (let j = i + 1; j < DISTMAT.length; j++) {
      EDGES.push({ a: i, b: j });
    }
  }
  EDGES.sort(edgeSort);
}

// Brute force


// Modified from https://stackoverflow.com/questions/9960908/permutations-in-javascript
function permutator(inputArr) {
  WEIGHTS = [];
  const results = [];

  function permute(arr, memo) {
    memo = memo || [];
    let cur;

    for (let i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        const wt = getFragWeight([0].concat(memo.concat(cur)));
        WEIGHTS.push(wt);
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }

    return results;
  }

  return permute(inputArr.splice(1));
}

// Sort edges in ascending weight order.
function edgeSort(a, b) {
  const aLength = DISTMAT[a.a][a.b];
  const bLength = DISTMAT[b.a][b.b];
  return aLength - bLength;
}

// Sort fragments in descending length order.
function fragSort(a, b) {
  return b.length - a.length;
}

async function multiFrag() {
  FRAGS = [];
  while (EDGES.length > 0) {
    // Get next shortest edge
    const edge = EDGES.shift();
    // if (EDGES.length % 10000 === 0) {
    //   console.log(EDGES.length);
    // }

    if (FRAGS.length === 0) {
      FRAGS.push([edge.a, edge.b]);
    }

    // Check if either node appears in any fragment
    if (anyFragContains(edge)) {
      continue;
    }

    // Add edge to existing fragment or create new
    if (!addEdge(edge)) {
      continue;
    }

    // Sort frags in descending order by length
    await FRAGS.sort(fragSort);
    // Check if longest frag is full tour
    if (FRAGS[0].length === NODES.length) {
      return FRAGS[0];
    }

    // Check if fragments can be connected
    for (let i = FRAGS.length - 1; i >= 0; i--) {
      for (let j = i - 1; j >= 0; j--) {
        const [a, b] = joinFragments(FRAGS[i], FRAGS[j]);
        if (a) {
          [FRAGS[i], FRAGS[j]] = [a, b];
        }
      }
    }
    // Remove any empty fragments
    FRAGS = FRAGS.filter(frag => frag.length > 0);
  }
}

function anyFragContains(edge) {
  for (const fragment of FRAGS) {
    const end = fragment.length - 1;
    // Check if first node appears in fragment
    let position = fragment.indexOf(edge.a, 1);
    if (position < end && position !== -1) {
      return true;
    }
    // Check if second node appears in fragment
    position = fragment.indexOf(edge.b, 1);
    if (position < end && position !== -1) {
      return true;
    }
  }
  // If not found in any fragment, return false
  return false;
}

function addEdge(edge) {
  //
  for (const fragment of FRAGS) {
    const end = fragment.length - 1;
    // Check if any fragment ends with either node
    const startA = fragment[0] === edge.a;
    const startB = fragment[0] === edge.b;
    const endA = fragment[end] === edge.a;
    const endB = fragment[end] === edge.b;

    // If adding edge would form a loop, return false
    if ((startA && endB) || (startB && endA)) {
      return false;
    }

    if (startA) {
      // If 'a' matches start of fragment, unshift 'b' onto fragment
      fragment.unshift(edge.b);
      return true;
    } else if (startB) {
      // If 'b' matches start of fragment, unshift 'a' onto fragment
      fragment.unshift(edge.a);
      return true;
    } else if (endA) {
      // If 'a' matches end of fragment, push 'b' onto fragment
      fragment.push(edge.b);
      return true;
    } else if (endB) {
      // If 'b' matches end of fragment, push 'a' onto fragment
      fragment.push(edge.a);
      return true;
    }
  }

  // If can't join any fragment, create new fragment
  FRAGS.push([edge.a, edge.b]);
  return true;
}

function joinFragments(a, b) {
  //
  const aEnd = a.length - 1;
  const bEnd = b.length - 1;
  const startAstartB = a[0] === b[0];
  const startAendB = a[0] === b[bEnd];
  const endAstartB = a[aEnd] === b[0];
  const endAendB = a[aEnd] === b[bEnd];

  if (startAstartB) {
    // If starts match, reverse B and concat A on end
    b.reverse();
    b.pop();
    a = b.concat(a);
    b = [];
    return [a, b];
  } else if (startAendB) {
    // If startA matches endB, concat A on end of B
    b.pop();
    a = b.concat(a);
    b = [];
    return [a, b];
  } else if (endAstartB) {
    // If endA matches startB, concat B on end of A
    a.pop();
    a = a.concat(b);
    b = [];
    return [a, b];
  } else if (endAendB) {
    // If ends match, reverse B and concat to end of A
    b.reverse();
    a.pop();
    a = a.concat(b);
    b = [];
    return [a, b];
  }

  // If no matches, return false
  return [false, false];
}

function getFragWeight(frag) {
  let total = 0;
  for (let curr = 0; curr < frag.length; curr++) {
    let next = curr + 1;
    if (next === frag.length) {
      next = 0;
    }
    const nodeA = frag[curr];
    const nodeB = frag[next];
    const weight = DISTMAT[nodeA][nodeB];
    total += weight;
  }
  return total;
}

function nearestNeighbour() {
  // Start is arbitrary, begin at 0
  TOUR = [0];

  // Loop until full tour created
  while (TOUR.length !== NODES.length) {
    const tail = TOUR[0];
    const next = getClosest(tail, TOUR);
    TOUR.unshift(next);
  }

  FRAGS = [TOUR];
}

function doubleEndedNN() {
  TOUR = [0];
  let front = true;
  while (TOUR.length !== NODES.length) {
    if (front) {
      const next = getClosest(TOUR[0], TOUR);
      TOUR.unshift(next);
      front = false;
      continue;
    }
    const tail = TOUR[TOUR.length - 1];
    const next = getClosest(tail, TOUR);
    TOUR.push(next);
    front = true;
  }

  FRAGS = [TOUR];
}

function getClosest(n, exclude) {
  let closest;
  let bestDist = Infinity;
  for (let i = 0; i < NODES.length; i++) {
    if (exclude.includes(i)) {
      continue;
    }
    const thisDist = DISTMAT[NODES[n]][NODES[i]];
    if (thisDist < bestDist) {
      bestDist = thisDist;
      closest = i;
    }
  }
  return closest;
}

/* IMPROVEMENT ALGORITHMS */
function neighbourImprove() {
  // Get best weight
  let best = getFragWeight(TOUR);
  let swapped = true;
  while (swapped) {
    swapped = false;
    // Loop through every consecutive pair of nodes. Check if swapping would make tour shorter
    for (let curr = 0; curr < TOUR.length; curr++) {
      let next = curr + 1;
      // If next value is out of index, next value is start node
      if (next === TOUR.length) {
        next = 0;
      }
      // Make copy of current tour
      const temp = [...TOUR];

      [temp[curr], temp[next]] = [temp[next], temp[curr]];

      const weight = getFragWeight(temp);
      if (weight < best) {
        best = weight;
        TOUR = temp;
        swapped = true;
      }
    }
  }
}


document.getElementById('runAlgs').addEventListener('click', async () => {
  let alg1, alg2;
  switch (document.querySelector('input[name="alg1"]:checked').value) {
    case 'mfAlg':
      alg1 = multiFrag;
      break;

    case 'nnAlg':
      alg1 = nearestNeighbour;
      break;

    case 'dennAlg':
      alg1 = doubleEndedNN;
      break;
  }
  switch (document.querySelector('input[name="alg2"]:checked').value) {
    case 'neighbourSwap':
      alg2 = neighbourImprove;
      break;
  }
  await runProgressive(alg1, alg2);
});

async function runProgressive(alg1, alg2) {
  document.getElementById('progressSection').style.display = 'block';
  const iters = document.getElementById('iters').value;
  const results = [];
  const low = 4;
  const high = 100;

  let n = low;
  while (n <= high) {
    await updateProgress(n);
    await pause(1);
    let totalInit = 0;
    let totalEnd = 0;

    let i = 0;
    while (i < iters) {
      initRandWeightMatrix(n);
      getEdges();
      await alg1();
      TOUR = FRAGS[0];
      const initWeight = getFragWeight(TOUR);
      totalInit += initWeight;
      await alg2();
      const endWeight = getFragWeight(TOUR);
      totalEnd += endWeight;
      i++;
    }
    const improv = ((totalInit - totalEnd) / totalInit) * 100;
    results.push([n, improv]);
    n++;
  }

  document.getElementById('progressSection').style.display = 'none';

  displayResults(results);
  RESULTS = results;
}

function updateProgress(n) {
  document.getElementById('progVal').textContent = n;
  document.getElementById('progBar').value = n;
}

// https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function displayResults(results) {
  const mainContainer = document.getElementById('resultSection');
  mainContainer.innerHTML = '';

  for (let i = 0; i < results.length; i++) {
    // Create result container
    const thisContainer = document.createElement('div');
    thisContainer.classList.add('result');
    mainContainer.appendChild(thisContainer);
    const nodeNum = document.createElement('p');
    nodeNum.classList.add('n-value');
    nodeNum.textContent = results[i][0];
    thisContainer.appendChild(nodeNum);
    const improvPercent = document.createElement('p');
    improvPercent.textContent = `${results[i][1].toFixed(2)}%`;
    thisContainer.appendChild(improvPercent);
  }
  document.getElementById('exportResults').style.display = 'block';
}

function exportResults() {
  let data = 'data:text/csv;charset=utf-8,';
  RESULTS.forEach(row => {
    const strRow = row.join(',');
    data += strRow + '\r\n';
  });
  const encodedURI = encodeURI(data);
  const link = document.createElement('a');
  link.download = 'data_Eng-Sci.csv';
  link.href = encodedURI;
  link.click();
}

document.getElementById('exportResults').addEventListener('click', exportResults);
