import { DirectedGraph } from 'typescript-graph'

type Distances = { [srcId: string] : { [destId: string] : number; }; };

type LocationCluster = {
    locations: LocationNode[];
    distances: Distances;
}

type LocationNode = {
    id: string;
    workingHours: {
        opening: number;
        closing: number;
    }
    stayDuration: number;
}

type Path = {

}

function buildGraph(cluster: LocationCluster): DirectedGraph<LocationNode> {
    const { locations, distances } = cluster;
    const graph = new DirectedGraph<LocationNode>((n: LocationNode) => n.id);

    const locationNodeIds = locations.map(locationNode => 
        graph.insert(locationNode));

    locationNodeIds.forEach(srcNodeId => 
        locationNodeIds
        .filter(destNodeId => destNodeId != srcNodeId)
        .map(destNodeId => graph.addEdge(srcNodeId, destNodeId)));

    return graph;
}

function getOptimalPath(cluster: LocationCluster) {
    const { locations, distances } = cluster;
    const graph = buildGraph(cluster);

    const startNode: LocationNode = locations.reduce(function(prev, curr) {
        return prev.workingHours.opening < curr.workingHours.opening ? prev : curr;
    });
    const restLocations: LocationNode[] = locations.filter(location => location.id != startNode.id);
    const startTime: number = startNode.workingHours.opening + startNode.stayDuration;
    const optimalPath: string[] = evalOptimalPath(startNode,distances,restLocations, [], startTime);
}

function evalOptimalPath(node:LocationNode,distances: Distances, restLocations:LocationNode[], optimalPath:string[], currentTime: number): string[] | undefined {
    const nodeToVisit = restLocations.reduce(function(prev, curr) {
        const prevDistanceTime = distances[node.id][prev.id];
        const currDistanceTime = distances[node.id][curr.id];
        return getVisitWeight(prev, currentTime, prevDistanceTime) < getVisitWeight(curr, currentTime, currDistanceTime) ? prev : curr;
    });

    return path;
}

function getVisitWeight(destNode: LocationNode, currentTime: number, distanceTime: number): number | undefined {
    const arrivalTime = currentTime + distanceTime;
    const waitTime = destNode.workingHours.opening - arrivalTime;
    const weight = distanceTime + waitTime;
    const exitTime = 
    if()
}

