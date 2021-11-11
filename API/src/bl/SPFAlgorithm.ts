import { DirectedGraph } from 'typescript-graph'
import { SimplePlace } from '../models/location.model';
import { cluster } from 'd3';
import { Location } from "../models/placeInterfaces.model";

export type Distances = { [srcId: string]: { [destId: string]: number; }; };

export type LocationCluster = {
    day: number;
    locations: LocationNode[];
    distances: Distances;
}

export type LocationNode = {
    id: string;
    name: string;
    location: Location;
    workingHours: {
        opening: number;
        closing: number;
    }
    stayDuration: number;
}

export function locationClusterConstructor(clusters: {[cluster: number]: SimplePlace[]}, distances: Distances): LocationCluster[] {
    const result: LocationCluster[] = Object.entries(clusters).map((cluster) => {
        const day: number = +cluster["0"];
        const simplePlaces: SimplePlace[] = cluster["1"];

        const locationNodes: LocationNode[] = simplePlaces.map(simplePlace => {
            const { id, name, location, days, visitDuration } = simplePlace;
            const workingHours = {
                opening: days[day].openHour, 
                closing: days[day].closeHour,
            }

            const locationNode: LocationNode = {
                id,
                name,
                location,
                workingHours,
                stayDuration: visitDuration,
            };

            return locationNode;
        });

        const locationCluster: LocationCluster = {
            day,
            locations: locationNodes,
            distances,
        }

        return locationCluster;
    });

    return result;
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
            const prevDistanceTime = distances[currNode.name][prev.name];
            const currDistanceTime = distances[currNode.name][curr.name];
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
            currentTime = opening >= currentTime + distances[currNode.name][nodeToVisit.name] ? opening + stayDuration : currentTime + distances[currNode.name][nodeToVisit.name] + stayDuration;
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


