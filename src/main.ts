import {VerletSolver} from './VerletSolver';
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


    const squareButton = document.getElementById('square-container')!;
    squareButton.addEventListener('click', (event) => {
        centerSection.style.borderRadius = '0'; // Set border radius to 0
    });

    const circleButton = document.getElementById('circle-container')!;
    circleButton.addEventListener('click', (event) => {
        centerSection.style.borderRadius = '50%'; // Set border radius to 0
    });





    // const circles: VerletObject[] = [];
    let numCircles = 100;

    // for (let i = 0; i < numCircles; i++) {
    //     // Generate random positions within the centerSectionRect
    //     let randomX =   centerSectionRect.x + Math.random() * centerSectionRect.width;
    //     let randomY =   centerSectionRect.y + Math.random() * centerSectionRect.height;
    //
    //     circles.push(new VerletObject(centerSectionRect, new THREE.Vector2(randomX, randomY)));
    //     centerSection.appendChild(circles[circles.length - 1].element);
    // }




    const verletSolver = new VerletSolver( centerSection);
    let lastTime = performance.now();
    // let frameCount = 0;


    // const fpsDisplay = document.getElementById('fps-display')!;

    async function moveCircles() {
        // ({ frameCount, lastTime } = showFPS(fpsDisplay, frameCount, lastTime));
        if (numCircles > 0 ) {
            verletSolver.addCircle();
            verletSolver.buildEdges()
            numCircles -= 1
        }
        ({ lastTime } = verletSolver.update(lastTime, centerSectionRect));



        requestAnimationFrame(moveCircles);
    }

    moveCircles();
});



