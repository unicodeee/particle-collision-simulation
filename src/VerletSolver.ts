// import {Circle} from "./particles/Circle.ts";
import * as THREE from "three";
import {VerletObject} from "./particles/VerletObj.ts";
import {CircleEdge} from "./particles/CircleEdge.ts";

export class VerletSolver {
    gravity = new THREE.Vector2(0, 10000);
    touching = new Set<VerletObject>();
    // edges: any[];

    edges: CircleEdge[] = [];
    constructor(private circles: VerletObject[], private centerSectionRect: DOMRect) {
        // init edges
        this.edges = [];
        circles.map(circle => new Promise<void>(resolve => {
            circle.element.addEventListener('load', () => {
                const circleLeftEdge = circle.positionCurrent.x - circle.radius;
                const circleRightEdge = circle.positionCurrent.x + circle.radius;

                this.edges.push({ position: circleLeftEdge, isLeft: true, object: circle } as CircleEdge);
                this.edges.push({ position: circleRightEdge, isLeft: false, object: circle } as CircleEdge);


                resolve();
            });
        }));
        this.edges.sort((a, b) => a.position - b.position);
    }



    update(frameCount:number, lastTime: number, centerSectionRect: DOMRect) {

        const currentTime = performance.now(); // TO DO: move to update
        const dt = (currentTime - lastTime) / 1000; // Convert milliseconds to seconds
        this.applyGravity();

        // sub stepping 8 times
        this.updateEdges();
        this.solveColl(this.edges);
        this.applyConstrains(centerSectionRect);

        this.updateEdges();
        this.solveColl(this.edges);
        this.applyConstrains(centerSectionRect);

        this.updateEdges();
        this.solveColl(this.edges);
        this.applyConstrains(centerSectionRect);

        this.updateEdges();
        this.solveColl(this.edges);
        this.applyConstrains(centerSectionRect);


        this.updatePositions(dt);


        lastTime = currentTime;
        return { lastTime };
    }

    updateEdges(){
        this.edges.map(edge => {
            const circle =  edge.object;
            if (edge.isLeft) {
                edge.position = circle.positionCurrent.x - circle.radius;
            }
            else {
                edge.position = circle.positionCurrent.x + circle.radius;
            }
        })
        this.edges.sort((a, b) => a.position - b.position);
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

        this.circles.forEach(c =>{

            const to_obj = c.positionCurrent.clone().sub(position);
            const dist = to_obj.length();
            if (dist > radius - c.radius) {
                const n = to_obj.clone().normalize();

                // obj.positionOld = position.clone().add(n.clone().multiplyScalar(radius - 10));
                c.positionCurrent = position.clone().add(n.clone().multiplyScalar(radius - c.radius));
            }
        })
    }

    // solveCollitions(objContainer: VerletObject[]){
    //
    //     const count = this.circles.length;
    //
    //     for (let i = 0; i < count; i++) {
    //         let c1 = this.circles[i];
    //         for (let j = i + 1; j < count; j++) {
    //
    //             let c2 = this.circles[j];
    //             const max_dist = c1.radius + c2.radius;
    //
    //             const collision_axis = c1.positionCurrent.clone().sub(c2.positionCurrent);
    //             const dist = collision_axis.length();
    //             if (dist < max_dist) {
    //                 const n  = collision_axis.normalize();
    //                 const delta = max_dist - dist;
    //
    //                 n.multiplyScalar(0.5 * delta );
    //                 c1.positionCurrent.add(n);
    //                 c2.positionCurrent.sub(n);
    //
    //             }
    //
    //
    //         }
    //     }
    // }


    collide(c1: VerletObject, c2: VerletObject){


        const max_dist = c1.radius + c2.radius;

        const collision_axis = c1.positionCurrent.clone().sub(c2.positionCurrent);
        const dist = collision_axis.length();
        if (dist < max_dist) {
            const n  = collision_axis.clone().normalize();
            const delta = max_dist - dist;

            n.multiplyScalar(0.5 * delta );
            c1.positionCurrent.add(n);
            c2.positionCurrent.sub(n);

        }
    }

    onOverlapX = function(object1, object2) {
        // just check for y
        const c1Top = object1.positionCurrent.y - object1.radius;
        const c1Bott = object1.positionCurrent.y + object1.radius;
        const c2Top = object2.positionCurrent.y - object2.radius;
        const c2Bott = object2.positionCurrent.y + object2.radius;
        console.log("c1Top < c2Bott && c1Bott > c2Top", c1Top < c2Bott && c1Bott > c2Top);
        if (c1Top < c2Bott && c1Bott > c2Top) {
            this.collide(object1, object2);
        }
    }

    solveColl(edges){

        for (const edge of edges) {
                if (edge.isLeft) {
                        this.touching.forEach( c => {
                            this.onOverlapX(c, edge.object);
                        })
                    // Entering an object
                    this.touching.add(edge.object);
                } else {
                    // Exiting an object
                    this.touching.delete(edge.object);
                }
            // }
        }
    }




}
