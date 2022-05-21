
main();

let graphData;

async function main() {
  const response = await fetch('../graphs/complete_symmetric_non-euclidean.json');
  graphData = await response.json();
}

function checkLength(graph, tour) {
  if (tour.length !== graph.length) {
    return false;
  }

  let total = 0;
  for (let i = 0; i < tour.length; i++) {
    const curr = tour[i];
    const next = (i == tour.length - 1) ? tour[0] : tour[i + 1];
    total += graph[curr][next];
  }

  console.log(total);
}
