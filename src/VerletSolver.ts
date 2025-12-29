import * as THREE from "three";
import { VerletObject } from "./particles/VerletObj.ts";
import { CircleEdge } from "./particles/CircleEdge.ts";
import { Stick } from "./particles/Stick.ts";
import { CanvasRenderer } from "./renderer/CanvasRenderer.ts";

export class VerletSolver {
    gravity = new THREE.Vector2(0, 5000);
    centerSection: HTMLElement;
    containerState = 'circle';

    sticks: Stick[] = [];
    edges: CircleEdge[] = [];
    circles: VerletObject[] = [];

    cloth_row!: number;
    cloth_col!: number;

    renderer: CanvasRenderer;

    constructor(centerSection: any, renderer: CanvasRenderer) {
        this.centerSection = centerSection;
        this.renderer = renderer;
        this.set_cloth_properties();
    }

    set_cloth_properties() {
        this.cloth_col = 10;
        this.cloth_row = Math.floor(this.circles.length / Math.max(1, this.cloth_col));
    }

    // basic helpers
    getBounds() {
        const rect = this.centerSection.getBoundingClientRect();
        return { w: rect.width, h: rect.height };
    }

    // buildEdges is kept for compatibility if other code uses it; here we (re)compute edges from circles
    buildEdges() {
        this.edges = [];
        this.circles.forEach(circle => {
            const left = circle.positionCurrent.x - circle.radius;
            const right = circle.positionCurrent.x + circle.radius;
            this.edges.push({ position: left, isLeft: true, object: circle } as CircleEdge);
            this.edges.push({ position: right, isLeft: false, object: circle } as CircleEdge);
        });
        this.edges.sort((a, b) => a.position - b.position);
    }

    update(lastTime: number) {
        const currentTime = performance.now();
        const dt = (currentTime - lastTime) / 1000;
        const sub_steps = 6;
        const sub_dt = dt / Math.max(1, sub_steps);

        for (let i = 0; i < sub_steps; i++) {
            this.applyGravity();
            this.applyConstrains(); // solve circle go out boundary (round, square, cloth sim)
            // choose collision method: sweep/prune would be better, but for simplicity use pairwise here
            // if (this.containerState !== 'cloth') {
            //
            // }
            this.solveCollisions();// solve circles collide
            this.updatePositions(sub_dt);
        }

        // render to canvas (single draw pass)
        this.renderer.render(this.circles);

        lastTime = currentTime;
        return { lastTime };
    }

    addCircle() {
        const rect = this.centerSection.getBoundingClientRect();
        const w = Math.max(1, rect.width);
        const h = Math.max(1, rect.height);

        // start near the top-left, randomized
        const x = Math.random() * w;
        const y = Math.random() * h;
        const radius = 8 + Math.floor(Math.random() * 18);
        const newCircle = new VerletObject(new THREE.Vector2(x, y), radius);
        this.circles.push(newCircle);
    }

    applyGravity() {
        this.circles.forEach(circle => {
            circle.accelerate(this.gravity);
        });
    }

    applyConstrains() {


        if (this.containerState === 'circle') {

            // Clamp vector length (radial clamp)
            function clampVector2Radial(v: THREE.Vector2, maxRadius: number) {
                if (v.lengthSq() > maxRadius * maxRadius) {
                    v.setLength(maxRadius);
                }
                return v;
            }

            const rect = this.centerSection.getBoundingClientRect();
            const radius = rect.width * 0.5;

            // center of the circle in local coordinates
            const center = new THREE.Vector2(radius, radius);

            this.circles.forEach(c => {

                // offset from center
                const offset = c.positionCurrent.clone().sub(center);

                // clamp offset inside the circle
                clampVector2Radial(offset, radius - c.radius);

                // recompute position
                c.positionCurrent.copy(center).add(offset);
            });
        }



        else if (this.containerState === 'square') {
            // keep particles within container bounds (reflective)
            const rect = this.centerSection.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            this.circles.forEach(c => {
                // simple bounds; adjust positionCurrent if outside


                const minBoundary = new THREE.Vector2(c.radius, c.radius);
                const maxBoundary = new THREE.Vector2(w - c.radius, h - c.radius);
                c.positionCurrent.clamp(minBoundary, maxBoundary);
            });

        }

        else if (this.containerState === 'cloth') {

        }

    }

    solveCollisions() {
        // basic O(n^2) pairwise circle separation (simple)
        const n = this.circles.length;
        for (let i = 0; i < n; i++) {
            const a = this.circles[i];
            for (let j = i + 1; j < n; j++) {
                const b = this.circles[j];
                const dx = b.positionCurrent.x - a.positionCurrent.x;
                const dy = b.positionCurrent.y - a.positionCurrent.y;
                const dist2 = dx * dx + dy * dy;
                const minDist = a.radius + b.radius;
                const minDist2 = minDist * minDist;
                if (dist2 > 0 && dist2 < minDist2) {
                    const dist = Math.sqrt(dist2);
                    const overlap = (minDist - dist) / 2;
                    const nx = dx / (dist || 1);
                    const ny = dy / (dist || 1);
                    // move each particle away along normal
                    a.positionCurrent.x -= nx * overlap;
                    a.positionCurrent.y -= ny * overlap;
                    b.positionCurrent.x += nx * overlap;
                    b.positionCurrent.y += ny * overlap;
                } else if (dist2 === 0) {
                    // coincident centers; jitter them
                    const jitter = 0.5;
                    a.positionCurrent.x += (Math.random() - 0.5) * jitter;
                    a.positionCurrent.y += (Math.random() - 0.5) * jitter;
                    b.positionCurrent.x += (Math.random() - 0.5) * jitter;
                    b.positionCurrent.y += (Math.random() - 0.5) * jitter;
                }
            }
        }
    }

    updatePositions(dt: number) {
        this.circles.forEach(c => c.updatePosition(dt));
    }

    // Flux: apply a short-lived repulsive acceleration from a point
    flux(pos: THREE.Vector2) {

        const strength = 200000000;
        this.circles.forEach(c => {
            const dx = c.positionCurrent.x - pos.x;
            const dy = c.positionCurrent.y - pos.y;
            const d2 = dx * dx + dy * dy;
            const falloff = Math.max(1, d2);
            const force = strength / falloff;
            const dir = new THREE.Vector2(dx, dy).normalize();

            // console.log(dir.multiplyScalar(force))
            c.accelerate(dir.multiplyScalar(force));
        });
    }

    // Cloth-related stubs (left minimal — you can reuse and port your existing cloth setup here)
    initClothPointPosition() {
        // Implement cloth initialization using VerletObject instances if you need cloth mode
    }

    initSticks() {
        // create Stick instances and push to this.sticks
    }
}