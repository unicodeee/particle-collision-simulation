import { Circle } from './particles/Circle.ts';
import { showFPS } from './FPS.ts';

window.addEventListener('DOMContentLoaded', () => {
    const centerSection = document.getElementById('center-section')!;
    const centerSectionRect = centerSection.getBoundingClientRect(); // Get dimensions of centerSection
    // const leftSection = document.getElementById('left-section')!;
    //
    // centerSectionRect.


    console.log("centerSectionRect: ", centerSectionRect )
    let lastTime = performance.now();
    let frameCount = 0;


    const fpsDisplay = document.getElementById('fps-display')!;


    const circles: Circle[] = [];

    function generateRandomCircles() {
        const numCircles = Math.floor(Math.random() * 100) + 1; // Generate random number of circles (1 to 10)

        for (let i = 0; i < numCircles; i++) {
            circles.push(new Circle(centerSectionRect));
            centerSection.appendChild(circles[circles.length - 1].element);
        }
    }

    function moveCircles() {
        ({ frameCount, lastTime } = showFPS(fpsDisplay, frameCount, lastTime));
        for (const circle of circles) {

            const centerSection = document.getElementById('center-section')!;
            const centerSectionRect = centerSection.getBoundingClientRect();
            circle.centerSectionRect = centerSectionRect;
            circle.move(); // Move each circle
        }
        requestAnimationFrame(moveCircles); // Request next animation frame
    }
    generateRandomCircles(); // Generate initial circles
    moveCircles(); // Start moving circles
});