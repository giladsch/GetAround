import { Location } from "../models/placeInterfaces.model";

export interface SimplePlace {
    id: string;
    location: Location;
    days: { [id: number]: { openHour: string; closeHour: string } };
    visitDuration: number;
    name: string;
  }