export interface Location {
    _id: string;
    location: GeolocationCoordinates;
    openingHour: number;
    closingHour: number;
    visitDuration: number;
}