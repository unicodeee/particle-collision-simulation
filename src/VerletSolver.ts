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
        this.cloth_col = 20;
        this.cloth_row = Math.ceil(this.circles.length / this.cloth_col);

        const spacing = 20; // distance between particles
        const startX = 0;
        const startY = 0;

        this.circles.forEach((c, i) => {
            c.radius = 10;

            const col = i % this.cloth_col;
            const row = Math.floor(i / this.cloth_col);

            c.positionCurrent = new THREE.Vector2(
                startX + col * spacing,
                startY + row * spacing
            );
        });
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
        const radius = 8 + Math.floor(5);
        const newCircle = new VerletObject(new THREE.Vector2(x, y), radius);
        this.circles.push(newCircle);


        // if click add circle when is cloth mode
        this.set_cloth_properties();
        this.initClothPointPosition();
        this.initSticks();

    }

    applyGravity() {
        this.circles.forEach(circle => {
            circle.accelerate(this.gravity);
        });
    }

    applyConstrains() {
        const centerSectionRect = this.centerSection.getBoundingClientRect();

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
            // Hold the top-left corner
            const topLeftCircle = this.circles[0];
            const R = topLeftCircle.radius ? topLeftCircle.radius : 0;
            topLeftCircle.positionOld.set(0 + R, 0 + R);
            topLeftCircle.positionCurrent.set(0 + R, 0 + R);
            topLeftCircle.resetAcceleration();

            // Hold the top-right corner
            const topRightCircle = this.circles[this.cloth_col - 1];
            topRightCircle.positionOld.set(centerSectionRect.width - R, 0 + R);
            topRightCircle.positionCurrent.set(centerSectionRect.width - R, 0 + R);
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
                    c.positionCurrent.clamp(new THREE.Vector2(R - w, c.radius), new THREE.Vector2(w + w - R, h + h - R));
                }
            });
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

    initSticks() {
        this.sticks = [];
        const firstCircle = this.circles[0];
        // Assume spacing is determined by the radius, adjust as needed
        // @ts-ignore

        // (this.circles[this.cloth_col - 1].positionCurrent.x - this.circles[0].positionCurrent.x ) / (this.cloth_col - 1)
        const spacing = firstCircle ? firstCircle.radius * 3 : 0;

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

        // console.log(this.sticks);
    }
}