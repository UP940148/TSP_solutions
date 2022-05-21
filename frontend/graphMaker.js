let DISTMAT;

document.getElementById('createMatrix').addEventListener('click', () => {
  initRandWeightMatrix(document.getElementById('matrixSize').value);
  displayDistMat();
  document.getElementById('outputText').textContent = generateJSON();
})

function initRandWeightMatrix(n = 20) {
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
        matrix[i][j] = Number(weight.toFixed(2));
        matrix[j][i] = Number(weight.toFixed(2));
      }
    }
  }
  DISTMAT = matrix;
}

function displayDistMat() {
  const container = document.getElementById('matrix');
  while (container.firstChild) {
    container.removeChild(container.lastChild);
  }
  for (let i = 0; i < DISTMAT.length; i++) {
    for (let j = 0; j < DISTMAT.length; j++) {
      const newBox = document.createElement('input');
      newBox.disabled = true;
      newBox.classList.add('matrix-value');
      newBox.value = DISTMAT[i][j].toFixed(0);
      if (DISTMAT[i][j] == Infinity) {
        newBox.value = 'INF';
      }
      newBox.title = DISTMAT[i][j];
      container.appendChild(newBox);
    }
    container.appendChild(document.createElement('br'));
  }
}

function traverseInOrder() {
  let total = 0;
  for (let i = 0; i < DISTMAT.length; i++) {
    const j = (i === DISTMAT.length - 1) ? 0 : i + 1;
    total += DISTMAT[i][j];
  }
  return total.toFixed(2);
}

function generateJSON() {
  return `,
{
  "data": ${JSON.stringify(DISTMAT)},
  "shortest": ${traverseInOrder()},
  "algorithm": "inOrder"
}`;
}
