import {VerletObject} from "./VerletObj.ts";

export interface CircleEdge {
    position: number;
    isLeft: boolean;
    object: VerletObject;
}