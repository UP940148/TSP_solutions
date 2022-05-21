# Graph dataset

## Algorithm codes

Every graph has a shortest found distance associated with it under `data[n].graphs[g].shortest`. At the same level as this shortest distance, there is a value `algorithm` which represents the algorithm/s used to get that shortest distance. This `algorithm` value will always be in the form `alg+opt`, where the codes for `alg` and `opt` can be found in the lists below. If no optimisation was used to get the shortest distance, just `alg` is sufficient.

```text
Pathing algorithms (alg):

inOrder     --> Visit all nodes in index order ([0,1,2,...,n-1,n])
multiFrag   --> Multiple-Fragment
nearestN    --> Nearest Neighbour
doubleENN   --> Double-Ended Nearest Neighbour

=====================================================================

Optimisations algorithms (opt):

3Opt        --> 3-opt
nodeSwap    --> Node swap
```
