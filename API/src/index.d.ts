export type LocationNode = {
    id: string;
    workingHours: {
        opening: number;
        closing: number;
    }
    stayDuration: number;
}