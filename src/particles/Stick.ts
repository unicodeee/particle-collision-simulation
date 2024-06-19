
import * as THREE from 'three';
import {VerletObject} from "./VerletObj.ts";

export class Stick {
    acceleration: THREE.Vector2;
    radius: number | undefined;

    p1 : VerletObject;
    p2 : VerletObject;
    length: number;

    constructor( p1: VerletObject, p2: VerletObject, length: number) {


        this.acceleration = new THREE.Vector2(0, 0);
        this.p1  = p1;
        this.p2  = p2;
        this.length = length;
    }



    updatePosition(dt: number) {
        this.resetAcceleration();
        this.draw();
    }

    draw(){
    }

    accelerate(acc: THREE.Vector2){
        this.acceleration.add(acc);
    }

    resetAcceleration(){
        this.acceleration = new THREE.Vector2(0, 0);
    }
}