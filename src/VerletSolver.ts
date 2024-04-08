// import {Circle} from "./particles/Circle.ts";
import * as THREE from "three";
import {VerletObject} from "./particles/VerletObj.ts";

export class VerletSolver {
    gravity = new THREE.Vector2(0, 2);
    constructor(private circles: VerletObject[], private centerSectionRect: DOMRect) {}
    applyGravity(){

        this.circles.forEach(circle =>{

            console.log("this.gravity", this.gravity);
            circle.acceleration = this.gravity;
        })
    }

    update(frameCount:number, lastTime: number, centerSection) {

        const currentTime = performance.now(); // TO DO: move to update
        const dt = (currentTime - lastTime) / 1000; // Convert milliseconds to seconds
        // lastTime = currentTime; // Update lastTime

        this.applyGravity();
        this.applyConstrains(centerSection);
        this.updatePositions(dt);
    }

    updatePositions(dt: number) {
        this.circles.forEach(circle =>{
            circle.updatePosition(dt)
        })
    }

    applyConstrains(centerSection){ // circle


        const HEIGHT = centerSection.getBoundingClientRect().height; 
        const WIDTH = centerSection.getBoundingClientRect().width;

        const big_radius  = Math.min(HEIGHT, WIDTH)/2;
        const v_center_big_circle = new THREE.Vector2(big_radius, big_radius);
        


        this.circles.forEach(circle =>{
            // circle.updatePosition(dt)
            const small_circle_radius = circle.radius;

            const v_center_big_circle_to_center_small_circle = circle.positionCurrent.sub(v_center_big_circle);
            const dist = v_center_big_circle_to_center_small_circle.length()


            if (dist + small_circle_radius > big_radius){
                const v_n = v_center_big_circle_to_center_small_circle.multiplyScalar(1/dist);

                // const v_n = v_center_big_circle_to_center_small_circle.normalize();
                circle.positionCurrent = v_center_big_circle.add(v_n.multiplyScalar((big_radius - small_circle_radius)));

                console.log("Acce", circle.acceleration);
            }

        })




    }


}
