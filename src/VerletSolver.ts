// import {Circle} from "./particles/Circle.ts";
import * as THREE from "three";
import {VerletObject} from "./particles/VerletObj.ts";

export class VerletSolver {
    gravity = new THREE.Vector2(0, 10000);
    constructor(private circles: VerletObject[], private centerSectionRect: DOMRect) {}

    update(frameCount:number, lastTime: number, centerSectionRect: DOMRect) {

        const currentTime = performance.now(); // TO DO: move to update
        const dt = (currentTime - lastTime) / 1000; // Convert milliseconds to seconds
        this.applyGravity();

        // sub stepping 8 times
        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);
        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);
        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);
        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);
        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);
        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);
        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);
        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);

        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);
        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);
        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);
        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);
        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);
        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);
        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);
        this.applyConstrains(centerSectionRect);
        this.solveCollitions(this.circles);

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

                // obj.positionOld = position.clone().add(n.clone().multiplyScalar(radius - 10));
                obj.positionCurrent = position.clone().add(n.clone().multiplyScalar(radius - 10));
            }
        })
    }

    solveCollitions(objContainer: VerletObject[]){


        const small_circle_radius = 10;
        const max_dist = small_circle_radius*2;

        const count = this.circles.length;

        for (let i = 0; i < count; i++) {
            let c1 = this.circles[i];
            for (let j = i + 1; j < count; j++) {

                let c2 = this.circles[j];

                const collision_axis = c1.positionCurrent.clone().sub(c2.positionCurrent);
                const dist = collision_axis.length();
                if (dist < max_dist) {
                    const n  = collision_axis.normalize();
                    const delta = max_dist - dist;

                    n.multiplyScalar(0.5 * delta );
                    c1.positionCurrent.add(n);
                    c2.positionCurrent.sub(n);

                }


            }





        }
    }




}
