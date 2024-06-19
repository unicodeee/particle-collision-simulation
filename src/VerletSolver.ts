import * as THREE from "three";
import {VerletObject} from "./particles/VerletObj.ts";
import {CircleEdge} from "./particles/CircleEdge.ts";
import {Stick} from "./particles/Stick.ts";

export class VerletSolver {
    gravity = new THREE.Vector2(0, 5000);
    touching = new Set<VerletObject>();
    position = new THREE.Vector2(0, 0);
    centerSection;
    containerState =  'circle';
    // edges: any[];

    sticks: Stick[] = [];
    edges: CircleEdge[] = [];
    circles: VerletObject[] = [];
    constructor(centerSection: any) {
        // init edges
        this.centerSection = centerSection;
        this.buildEdges();
        this.edges.sort((a, b) => a.position - b.position);
    }


    buildEdges(){
        this.circles.map(circle => new Promise<void>(resolve => {
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


    update(lastTime: number) {
        const currentTime = performance.now(); // TO DO: move to update
        const dt = (currentTime - lastTime) / 1000; // Convert milliseconds to seconds

        const sub_steps = 10;
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

    addCircle(){
        const centerSectionRect = this.centerSection.getBoundingClientRect();
        const h = centerSectionRect.height*2;
        const w = centerSectionRect.width*2;

        // this.circles.push(new VerletObject(new THREE.Vector2(0, 0)));
        const newCircle = new VerletObject(new THREE.Vector2(w, h));
        this.circles.push(newCircle);
        this.centerSection.appendChild(this.circles[this.circles.length - 1].element);
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

    applyConstrains(){
        const centerSectionRect = this.centerSection.getBoundingClientRect();
        // CIRCLE
        if (this.containerState == 'circle'){
            const radius = Math.min(centerSectionRect.width, centerSectionRect.height)/2;
            this.position = new THREE.Vector2(radius, radius);

            this.circles.forEach(c =>{

                const to_obj = c.positionCurrent.clone().sub(this.position);
                const dist = to_obj.length();
                // @ts-ignore
                if (dist > radius + c.radius && !(dist > radius - c.radius)) {
                    const n = to_obj.clone().normalize();
                    // @ts-ignore
                    c.positionCurrent = this.position.clone().add(n.clone().multiplyScalar(radius - (to_obj.length() - c.radius)));
                    c.resetAcceleration()
                }
                else { // @ts-ignore
                    if (dist > radius - c.radius) {
                                    const n = to_obj.clone().normalize();

                                    // obj.positionOld = position.clone().add(n.clone().multiplyScalar(radius - 10));
                                    // @ts-ignore
                        c.positionCurrent = this.position.clone().add(n.clone().multiplyScalar(radius - c.radius));
                                }
                }
            })
        }

        // SQUARE
        else if (this.containerState == 'square'){
            this.circles.forEach(c => {
                const h = centerSectionRect.height;
                const w = centerSectionRect.width;
                // @ts-ignore
                c.positionCurrent.clamp(new THREE.Vector2(0 + c.radius, 0 + c.radius), new THREE.Vector2(w - c.radius, h - c.radius));
            });
        }

        // CLOTH
        else if (this.containerState == 'cloth'){

            // hold object position still
            this.circles[0].positionOld = (new THREE.Vector2(0, 0));
            this.circles[0].positionCurrent.set(0, 0);
            this.circles[0].resetAcceleration();

            // hold object position still
            this.circles[this.circles.length - 1].positionOld = (new THREE.Vector2(0, 0));
            this.circles[this.circles.length - 1].positionCurrent.set(100, 0);
            this.circles[this.circles.length - 1].resetAcceleration();

            this.sticks.forEach((s) => {
                const dist = s.p1.positionCurrent.distanceTo(s.p2.positionCurrent);
                const D = s.length;  // Use the stick's intended length
                if (dist != D) {
                    // Calculate the difference vector between the two points
                    let v_diff = s.p2.positionCurrent.clone().sub(s.p1.positionCurrent);

                    // Calculate the correction vector
                    let correction = v_diff.multiplyScalar((dist - D) / dist);

                    // Apply half of the correction to each point
                    s.p1.positionCurrent.add(correction.clone().multiplyScalar(0.5));
                    s.p2.positionCurrent.sub(correction.multiplyScalar(0.5));
                }
            });



            this.circles.forEach(c => {
                const h = centerSectionRect.height;
                const w = centerSectionRect.width;
                // @ts-ignore
                c.positionCurrent.clamp(new THREE.Vector2(0 + c.radius, 0 + c.radius), new THREE.Vector2(w - c.radius, h - c.radius));
            });
        }



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

    initCloth(){

        // hold object position still
        this.circles[0].positionOld = (new THREE.Vector2(0, 0));
        this.circles[0].positionCurrent.set(0, 0);
        this.circles[0].resetAcceleration();

        for (let i: number = 1; i < this.circles.length; i++) {
            const prevVector = this.circles[i - 1].positionCurrent.clone();
            // @ts-ignore
            prevVector.setX(this.circles[i - 1].positionCurrent.x + this.circles[i - 1].radius);
            this.circles[i].positionCurrent.copy(new THREE.Vector2(prevVector.x, prevVector.y));

        }
    }
    
    initSticks() {

        // @ts-ignore
        const spacing = this.circles[0].radius * 2;

        for (let n = 0; n < this.circles.length - 1; n ++) {
            let stick = new Stick(this.circles[n], this.circles[n + 1], spacing);
            this.sticks.push(stick);
        }
        
    }
}
