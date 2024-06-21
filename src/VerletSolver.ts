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


    cloth_row: number;
    cloth_col: number;

    constructor(centerSection: any) {
        // init edges
        this.centerSection = centerSection;
        this.buildEdges();
        this.edges.sort((a, b) => a.position - b.position);
        this.set_cloth_properties();
    }

    set_cloth_properties() {
        // this.cloth_col = Math.floor(this.circles.length / 3);
        this.cloth_col = 10;
        this.cloth_row = Math.floor(this.circles.length / this.cloth_col);
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
            if (this.containerState !== 'cloth') {
                this.solveColl(this.edges);
            }
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
        else if (this.containerState === 'cloth') {
            // Hold the top-left corner
            const topLeftCircle = this.circles[0];
            topLeftCircle.positionOld.set(0 + topLeftCircle.radius, 0 + topLeftCircle.radius);
            topLeftCircle.positionCurrent.set(0 + topLeftCircle.radius, 0 + topLeftCircle.radius);
            topLeftCircle.resetAcceleration();

            // Hold the top-right corner
            const topRightCircle = this.circles[this.cloth_col - 1];
            topRightCircle.positionOld.set(centerSectionRect.width - topLeftCircle.radius, 0 + topLeftCircle.radius);
            topRightCircle.positionCurrent.set(centerSectionRect.width - topLeftCircle.radius, 0 + topLeftCircle.radius);
            topRightCircle.resetAcceleration();

            this.sticks.forEach(s => {
                const dist = s.p1.positionCurrent.distanceTo(s.p2.positionCurrent);
                const D = s.length; // Use the stick's intended length

                if (dist !== D) {
                    const v_diff = s.p2.positionCurrent.clone().sub(s.p1.positionCurrent);
                    const correction = v_diff.multiplyScalar((dist - D) / dist);

                    // Apply half of the correction to each point, but skip fixed points
                    if (s.p1 !== topLeftCircle && s.p1 !== topRightCircle) {
                        s.p1.positionCurrent.add(correction.clone().multiplyScalar(0.5));
                    }
                    if (s.p2 !== topLeftCircle && s.p2 !== topRightCircle) {
                        s.p2.positionCurrent.sub(correction.multiplyScalar(0.5));
                    }
                }
            });

            this.circles.forEach(c => {
                if (c !== topLeftCircle && c !== topRightCircle) {
                    const h = centerSectionRect.height;
                    const w = centerSectionRect.width;
                    c.positionCurrent.clamp(new THREE.Vector2(c.radius - w, c.radius), new THREE.Vector2(w + w - c.radius, h + h - c.radius));
                }
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

    initClothPointPosition() {
        for (let row = 0; row < this.cloth_row; row++) {
            for (let col = 0; col < this.cloth_col; col++) {
                const currentIndex = row * this.cloth_col + col;
                if (currentIndex >= this.circles.length) continue; // Skip if index exceeds circles length

                const currentCircle = this.circles[currentIndex];
                // @ts-ignore
                const x = col * currentCircle.radius * 2;
                // @ts-ignore
                const y = row * currentCircle.radius * 2;
                currentCircle.positionCurrent.set(x, y);
            }
        }
    }


// 0               0 1 2 3           col=4
// 1               0 0 0 0
// 2               0 0 0 0    i * col    (i + 1) * (col)
// 3               0 0
// row=4
    initSticks() {
        this.sticks = [];
        const firstCircle = this.circles[0];
        // Assume spacing is determined by the radius, adjust as needed
        // @ts-ignore

        // (this.circles[this.cloth_col - 1].positionCurrent.x - this.circles[0].positionCurrent.x ) / (this.cloth_col - 1)
        const spacing = firstCircle ? firstCircle.radius * 5 : 0;

        if (spacing) {
            for (let row = 0; row < this.cloth_row; row++) {
                for (let col = 0; col < this.cloth_col; col++) {
                    const currentIndex = row * this.cloth_col + col;

                    // Ensure the current index is within bounds
                    if (currentIndex >= this.circles.length) continue;

                    const rightIndex = currentIndex + 1;
                    const belowIndex = currentIndex + this.cloth_col;

                    // Horizontal stick (to the right)
                    if (col < this.cloth_col - 1 && rightIndex < this.circles.length) {
                        this.sticks.push(new Stick(this.circles[currentIndex], this.circles[rightIndex], spacing));
                    }

                    // Vertical stick (to the bottom)
                    if (row < this.cloth_row - 1 && belowIndex < this.circles.length) {
                        this.sticks.push(new Stick(this.circles[currentIndex], this.circles[belowIndex], spacing));
                    }
                }
            }
        }

        console.log(this.sticks);
    }
}
