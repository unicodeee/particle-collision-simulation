// import {Circle} from "./particles/Circle.ts";
import * as THREE from "three";
import {VerletObject} from "./particles/VerletObj.ts";
import {CircleEdge} from "./particles/CircleEdge.ts";

export class VerletSolver {
    gravity = new THREE.Vector2(0, 5000);
    touching = new Set<VerletObject>();
    position = new THREE.Vector2(0, 0);
    centerSection: any;
    // edges: any[];

    edges: CircleEdge[] = [];
    constructor(private circles: VerletObject[], centerSection: any) {
        // init edges
        this.centerSection = centerSection;
        this.edges = [];
        circles.map(circle => new Promise<void>(resolve => {
            circle.element.addEventListener('load', () => {
                // @ts-ignore
                const circleLeftEdge = circle.positionCurrent.x - circle.radius;
                // @ts-ignore
                const circleRightEdge = circle.positionCurrent.x + circle.radius;

                this.edges.push({ position: circleLeftEdge, isLeft: true, object: circle } as CircleEdge);
                this.edges.push({ position: circleRightEdge, isLeft: false, object: circle } as CircleEdge);


                resolve();
            });
        }));
        this.edges.sort((a, b) => a.position - b.position);
    }



    update(lastTime: number, centerSectionRect: DOMRect) {
        const currentTime = performance.now(); // TO DO: move to update
        const dt = (currentTime - lastTime) / 1000; // Convert milliseconds to seconds

        const sub_steps = 8;
        const sub_dt = dt / sub_steps;

        for (let i: number = 0; i < sub_steps; i++) {
            this.applyGravity();
            this.applyConstrains();
            this.updateEdges();
            this.solveColl(this.edges);
            this.updatePositions(sub_dt);
        }

        lastTime = currentTime;
        return { lastTime };
    }

    updateEdges(){
        this.edges.map(edge => {
            const circle =  edge.object;
            if (edge.isLeft) {
                // @ts-ignore
                edge.position = circle.positionCurrent.x - circle.radius;
            }
            else {
                // @ts-ignore
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

    applyConstrains(){ // circle

        const centerSectionRect = this.centerSection.getBoundingClientRect();

        // const radius = Math.min(centerSectionRect.width, centerSectionRect.height)/2;
        // this.position = new THREE.Vector2(radius, radius);
        //
        // this.circles.forEach(c =>{
        //
        //     const to_obj = c.positionCurrent.clone().sub(this.position);
        //     const dist = to_obj.length();
        //     // @ts-ignore
        //     if (dist > radius + c.radius && !(dist > radius - c.radius)) {
        //         const n = to_obj.clone().normalize();
        //         // @ts-ignore
        //         c.positionCurrent = this.position.clone().add(n.clone().multiplyScalar(radius - (to_obj.length() - c.radius)));
        //         c.resetAcceleration()
        //     }
        //     else { // @ts-ignore
        //         if (dist > radius - c.radius) {
        //                         const n = to_obj.clone().normalize();
        //
        //                         // obj.positionOld = position.clone().add(n.clone().multiplyScalar(radius - 10));
        //                         // @ts-ignore
        //             c.positionCurrent = this.position.clone().add(n.clone().multiplyScalar(radius - c.radius));
        //                     }
        //     }
        // })


        this.circles.forEach(c => {
            const to_obj = c.positionCurrent.clone().sub(this.position);
            const h = centerSectionRect.height;
            const w = centerSectionRect.width;
            if (to_obj.x <= 0){c.positionCurrent.x = - to_obj.x;}
            if (to_obj.x >= w){c.positionCurrent.x = w - (to_obj.x - w);}
            if (to_obj.y <= 0){c.positionCurrent.y = - to_obj.y;}
            if (to_obj.y >= h){c.positionCurrent.y = h - (to_obj.y - h);}
        })
    }



    collide(c1: VerletObject, c2: VerletObject){


        // @ts-ignore
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

    onOverlapX(object1: VerletObject, object2: VerletObject) {
        // just check for y
        // @ts-ignore
        const c1Top = object1.positionCurrent.y - object1.radius;
        // @ts-ignore
        const c1Bott = object1.positionCurrent.y + object1.radius;
        // @ts-ignore
        const c2Top = object2.positionCurrent.y - object2.radius;
        // @ts-ignore
        const c2Bott = object2.positionCurrent.y + object2.radius;
        if (c1Top < c2Bott && c1Bott > c2Top) {
            this.collide(object1, object2);
        }
    }

    solveColl(edges: CircleEdge[] ){

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

    flux(fluxCenter: THREE.Vector2){
        const fluxStrength = 0.05; // Adjust the strength of the flux vector as needed

        // Loop through the circles and check if they are within the affected area
        this.circles.forEach(circle =>{
            // circle.accelerate(new THREE.Vector2(0, 0.09));

            const circleCenterX = circle.positionCurrent.x;
            const circleCenterY = circle.positionCurrent.y;
            const distance = fluxCenter.distanceTo(circle.positionCurrent);

            // If the circle is within the affected area, apply a flux vector outwards
            if (distance <= 200) { // Adjust the affected area as needed
                const fluxX = (circleCenterX - fluxCenter.x) / distance * fluxStrength;
                const fluxY = (circleCenterY - fluxCenter.y) / distance * fluxStrength;
                // const outwardFlux = circle.positionCurrent.clone().sub(fluxCenter).multiplyScalar( 1 / (distance * fluxStrength));
                circle.acceleration.add(new THREE.Vector2(fluxX, fluxY));
            }
        })
        this.updatePositions(5);
    }
}
