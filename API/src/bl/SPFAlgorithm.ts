import { DirectedGraph } from 'typescript-graph'
import { SimplePlace } from '../models/location.model';

export type Distances = { [srcId: string]: { [destId: string]: number; }; };

export type LocationCluster = {
    locations: LocationNode[];
    distances: Distances;
}

export type LocationNode = {
    id: string;
    workingHours: {
        opening: number;
        closing: number;
    }
    stayDuration: number;
}

export function mapShitCodeToBetterOne(clusters: {[cluster: number]: SimplePlace[]}, distances: any) {

}

export class SPFAlgorithm {
    public buildGraph(cluster: LocationCluster): DirectedGraph<LocationNode> {
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

    public getOptimalPath(cluster: LocationCluster): LocationNode[] {
        const { locations, distances } = cluster;
        const graph = this.buildGraph(cluster);

        const startNode: LocationNode = locations.reduce(function (prev, curr) {
            return prev.workingHours.opening < curr.workingHours.opening ? prev : curr;
        });
        const restLocations: LocationNode[] = locations.filter(location => location.id != startNode.id);
        const startTime: number = startNode.workingHours.opening + startNode.stayDuration;
        const optimalPath: LocationNode[] = this.evalOptimalPath(startNode, distances, restLocations, [startNode], startTime);

        return optimalPath;
    }

    public evalOptimalPath(currNode: LocationNode, distances: Distances, unvisited: LocationNode[], visited: LocationNode[], currentTime: number): LocationNode[] | null {
        if (unvisited.length == 0)
            return visited;

        const nodeToVisit = unvisited.reduce(function (prev, curr) {
            const prevDistanceTime = distances[currNode.id][prev.id];
            const currDistanceTime = distances[currNode.id][curr.id];
            const prevWeight = this.getVisitWeight(prev, currentTime, prevDistanceTime);
            const currWeight = this.getVisitWeight(curr, currentTime, currDistanceTime);
            if (prevWeight != null && curr == null)
                return prev;
            if (prevWeight == null && curr != null)
                return curr;
            if (prevWeight == null && curr == null)
                return null;
            else {
                return prevWeight < currWeight ? prev : curr;
            }
        });

        if (nodeToVisit != null) {
            unvisited = unvisited.filter(node => node.id != nodeToVisit.id);
            visited.push(nodeToVisit);
            const { workingHours: { opening, closing }, stayDuration } = nodeToVisit;
            currentTime = opening >= currentTime + distances[currNode.id][nodeToVisit.id] ? opening + stayDuration : currentTime + distances[currNode.id][nodeToVisit.id] + stayDuration;
            //visited = evalOptimalPath(nodeToVisit, distances, unvisited, visited, currentTime); 
        } else {
            visited = visited.filter(node => node.id != currNode.id);//pop curr
            //unvisited.push(currNode);
            //visited = evalOptimalPath(nodeToVisit, distances, unvisited, visited, currentTime); 
        }

        visited = this.evalOptimalPath(nodeToVisit, distances, unvisited, visited, currentTime);
    }

    public getVisitWeight(destNode: LocationNode, currentTime: number, distanceTime: number): number | null {
        const { workingHours: { opening: destOpeningTime, closing: destClosingTime }, stayDuration } = destNode;
        const arrivalTime = currentTime + distanceTime;
        const waitTime = destOpeningTime - arrivalTime;
        const weight = distanceTime + waitTime;
        const startActivityTime = waitTime >= 0 ? destOpeningTime : arrivalTime;

        if (destClosingTime >= startActivityTime + stayDuration)
            return weight;
        else {
            return null;
        }
    }
}


