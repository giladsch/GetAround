import { SimplePlace } from "../models/location.model";
import * as _ from "lodash";
import kmeans, { KMeans } from "kmeans-ts";
import { Location } from "../router/placesController";


export class TripPlanningBL {
    public clusterLocations(placePool: Array<SimplePlace>, numberOfDays: number): {[cluster: number]: Array<SimplePlace>} {          
            const locations: Array<Location> = placePool.map(place => place.location);
            const outputClusters: KMeans = kmeans(locations, numberOfDays);
            let clusters: {[cluster: number]: Array<SimplePlace>};
            outputClusters.indexes.forEach((value, index) => {                
                clusters[value].push(placePool[index]);
            });

        return clusters;
    }
    
    private getTravelDurationMatrix(travelDurationMap: Record<string, Record<string, number>>): Array<Array<number>> {
        let matrix: Array<Array<number>> = [];
        const locationArr: Array<string> = Object.keys(travelDurationMap);
        locationArr.map((sourceLocation: string) => {
            const travelDurationsFromSource: Record<string, number> = travelDurationMap[sourceLocation];
            Object.keys(travelDurationsFromSource).map((destinationLocation: string) => {
                const sourceLocationIndex: number = locationArr.indexOf(sourceLocation);
                const destinationLocationIndex: number =  locationArr.indexOf(destinationLocation);
                matrix[sourceLocationIndex][destinationLocationIndex] = travelDurationMap[sourceLocation][destinationLocation];
            });
        });

        return matrix;
    }
}