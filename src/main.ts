import {VerletSolver} from './VerletSolver';
import {VerletObject} from "./particles/VerletObj.ts";
import * as THREE from 'three';

window.addEventListener('DOMContentLoaded', () => {
    const centerSection = document.getElementById('center-section')!;
    const centerSectionRect = centerSection.getBoundingClientRect();

    const circles: VerletObject[] = [];
    const numCircles = 300;

    circles.push(new VerletObject(centerSectionRect, new THREE.Vector2(0.5*centerSectionRect.width, 0.2*centerSectionRect.height)));
    centerSection.appendChild(circles[circles.length - 1].element);

    // for (let i = 0; i < numCircles; i++) {
    //     circles.push(new VerletObject(centerSectionRect, new THREE.Vector2(0.2*centerSectionRect.width, 0.5*centerSectionRect.height)));
    //     centerSection.appendChild(circles[circles.length - 1].element);
    // }

    for (let i = 0; i < numCircles; i++) {
        // Generate random positions within the centerSectionRect
        let randomX = centerSectionRect.x + Math.random() * centerSectionRect.width;
        let randomY = centerSectionRect.y + Math.random() * centerSectionRect.height;

        circles.push(new VerletObject(centerSectionRect, new THREE.Vector2(randomX, randomY)));
        centerSection.appendChild(circles[circles.length - 1].element);
    }




    const verletSolver = new VerletSolver(circles, centerSectionRect);
    let lastTime = performance.now();
    let frameCount = 0;

    const edges: any[] = []; // Initialize edges array


    const fpsDisplay = document.getElementById('fps-display')!;

    async function moveCircles() {
        // ({ frameCount, lastTime } = showFPS(fpsDisplay, frameCount, lastTime));
        ({ lastTime } = verletSolver.update(frameCount, lastTime, centerSectionRect, edges));
        requestAnimationFrame(moveCircles);
    }

    moveCircles();
});
