// import {Circle} from './particles/Circle.ts';
import {showFPS} from './FPS.ts';

// window.addEventListener('DOMContentLoaded', () => {
//     const centerSection = document.getElementById('center-section')!;
//     const centerSectionRect = centerSection.getBoundingClientRect(); // Get dimensions of centerSection
//     // const leftSection = document.getElementById('left-section')!;
//     //
//     // centerSectionRect.
//
//
//     console.log("centerSectionRect: ", centerSectionRect )
//     let lastTime = performance.now();
//     let frameCount = 0;
//
//
//     const fpsDisplay = document.getElementById('fps-display')!;
//
//
//     const circles: Circle[] = [];
//
//     function generateRandomCircles() {
//         const numCircles = Math.floor(Math.random() * 100) + 1; // Generate random number of circles (1 to 10)
//
//         for (let i = 0; i < numCircles; i++) {
//             circles.push(new Circle(centerSectionRect));
//             centerSection.appendChild(circles[circles.length - 1].element);
//         }
//     }
//
//     function moveCircles() {
//         ({ frameCount, lastTime } = showFPS(fpsDisplay, frameCount, lastTime));
//
//
//
//
//         for (const circle of circles) {
//
//             // TO DO: check if screen has been resized than do this, if not don't need to do this:
//             const centerSection = document.getElementById('center-section')!;
//             circle.centerSectionRect = centerSection.getBoundingClientRect();
//
//             circle.move(); // Move each circle
//         }
//
//         verletSolver.update();
//
//         requestAnimationFrame(moveCircles); // Request next animation frame
//     }
//     generateRandomCircles(); // Generate initial circles
//     const verletSolver = new VerletSolver(circles, centerSectionRect);
//
//     moveCircles(); // Start moving circles
// });





import { VerletSolver } from './VerletSolver';
import {VerletObject} from "./particles/VerletObj.ts";
import * as THREE from 'three';

window.addEventListener('DOMContentLoaded', () => {
    const centerSection = document.getElementById('center-section')!;
    const centerSectionRect = centerSection.getBoundingClientRect();

    const circles: VerletObject[] = [];
    const numCircles = 1;

    const HEIGHT = centerSection.getBoundingClientRect().height;
    const WIDTH = centerSection.getBoundingClientRect().width;

    const big_radius  = Math.min(HEIGHT, WIDTH)/2;
    const v_center_big_circle = new THREE.Vector2(big_radius, big_radius);


    const static_cir = new VerletObject(centerSectionRect, v_center_big_circle);
    static_cir.draw();

    for (let i = 0; i < numCircles; i++) {
        circles.push(new VerletObject(centerSectionRect, new THREE.Vector2(HEIGHT/2, WIDTH/2)));
        centerSection.appendChild(circles[circles.length - 1].element);
    }

    const verletSolver = new VerletSolver(circles, centerSectionRect);
    let lastTime = performance.now();
    let frameCount = 0;

    const fpsDisplay = document.getElementById('fps-display')!;

    function moveCircles() {
        ({ frameCount, lastTime } = showFPS(fpsDisplay, frameCount, lastTime));

        verletSolver.update(frameCount, lastTime, centerSection);
        console.log("circles", circles);
        requestAnimationFrame(moveCircles);
    }

    moveCircles();
});
