import {VerletSolver} from './VerletSolver';
import {VerletObject} from "./particles/VerletObj.ts";
import * as THREE from 'three';

window.addEventListener('DOMContentLoaded', () => {
    const centerSection = document.getElementById('center-section')!;
    const centerSectionRect = centerSection.getBoundingClientRect();


    centerSection.addEventListener('mousemove', (event) => {
        const clickX = event.clientX - centerSection.offsetLeft;
        const clickY = event.clientY - centerSection.offsetTop;

        const fluxCenter = new THREE.Vector2(clickX, clickY);
        verletSolver.flux(fluxCenter);

    });

    const circles: VerletObject[] = [];
    const numCircles = 300;

    for (let i = 0; i < numCircles; i++) {
        // Generate random positions within the centerSectionRect
        let randomX = centerSectionRect.x + Math.random() * centerSectionRect.width;
        let randomY = centerSectionRect.y + Math.random() * centerSectionRect.height;

        circles.push(new VerletObject(centerSectionRect, new THREE.Vector2(randomX, randomY)));
        centerSection.appendChild(circles[circles.length - 1].element);
    }




    const verletSolver = new VerletSolver(circles);
    let lastTime = performance.now();
    // let frameCount = 0;


    // const fpsDisplay = document.getElementById('fps-display')!;

    async function moveCircles() {
        // ({ frameCount, lastTime } = showFPS(fpsDisplay, frameCount, lastTime));
        ({ lastTime } = verletSolver.update(lastTime, centerSectionRect));



        requestAnimationFrame(moveCircles);
    }

    moveCircles();
});
