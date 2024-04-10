import {VerletSolver} from './VerletSolver';
import {VerletObject} from "./particles/VerletObj.ts";
import * as THREE from 'three';

window.addEventListener('DOMContentLoaded', () => {
    const centerSection = document.getElementById('center-section')!;
    const centerSectionRect = centerSection.getBoundingClientRect();

    const circles: VerletObject[] = [];
    const numCircles = 1;

    for (let i = 0; i < numCircles; i++) {
        circles.push(new VerletObject(centerSectionRect, new THREE.Vector2(0.2*centerSectionRect.width, 0.5*centerSectionRect.height)));
        centerSection.appendChild(circles[circles.length - 1].element);
        circles.forEach(c => {
            c.draw();
        })
    }



    const verletSolver = new VerletSolver(circles, centerSectionRect);
    let lastTime = performance.now();
    let frameCount = 0;

    const fpsDisplay = document.getElementById('fps-display')!;

    async function moveCircles() {
        // ({ frameCount, lastTime } = showFPS(fpsDisplay, frameCount, lastTime));
        ({ lastTime } = verletSolver.update(frameCount, lastTime, centerSectionRect));
        requestAnimationFrame(moveCircles);
    }

    moveCircles();
});
