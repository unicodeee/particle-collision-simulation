// import {Circle} from "./particles/Circle.ts";
import * as THREE from "three";
import {VerletObject} from "./particles/VerletObj.ts";

export class VerletSolver {
    gravity = new THREE.Vector2(0, 500);
    constructor(private circles: VerletObject[], private centerSectionRect: DOMRect) {}

    update(frameCount:number, lastTime: number, centerSectionRect: DOMRect) {

        const currentTime = performance.now(); // TO DO: move to update
        const dt = (currentTime - lastTime) / 1000; // Convert milliseconds to seconds
        this.applyGravity();
        this.applyConstrains(centerSectionRect);
        this.updatePositions(dt);

        lastTime = currentTime;
        return { lastTime };
    }

    applyGravity(){
        this.circles.forEach(circle =>{
            circle.accelerate(this.gravity);
        })
    }

    updatePositions(dt: number) {
        this.circles.forEach(circle =>{
            circle.updatePosition(dt)
        })
    }

    applyConstrains(centerSection){ // circle

        const radius = Math.min(centerSection.width, centerSection.height)/2;
        const position = new THREE.Vector2(radius, radius);

        this.circles.forEach(obj =>{

            const to_obj = obj.positionCurrent.clone().sub(position);
            const dist = to_obj.length();
            if (dist > radius - 10) {
                const n = to_obj.clone().normalize();

                obj.positionOld = position.clone().add(n.clone().multiplyScalar(radius - 10));
                obj.positionCurrent = position.clone().add(n.clone().multiplyScalar(radius - 10));
            }
        })




    }


}
