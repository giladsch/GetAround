import { Location } from "../models/placeInterfaces.model";

export interface SimplePlace {
    id: string;
    name: string;
    location: Location;
    days: { [id: number]: { openHour: number; closeHour: number } };
    visitDuration: number;
  }