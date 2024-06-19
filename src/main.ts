import { VerletSolver } from './VerletSolver';
import * as THREE from 'three';

window.addEventListener('DOMContentLoaded', () => {
    const centerSection = document.getElementById('center-section')!;

    const verletSolver = new VerletSolver(centerSection);
    let numCircles = 15;
    let lastTime = performance.now();
    let animationId: number | null = null;

    function moveCircles() {
        if (numCircles > 0) {
            verletSolver.addCircle();
            verletSolver.buildEdges();
            numCircles -= 1;
        }
        ({ lastTime } = verletSolver.update(lastTime));
        animationId = requestAnimationFrame(moveCircles);
    }

    function pauseAnimation() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    function resumeAnimation() {
        if (animationId === null) {
            lastTime = performance.now();
            moveCircles();
        }
    }

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page is hidden, pause animation
            pauseAnimation();
        } else {
            // Page is visible again, resume animation
            resumeAnimation();
        }
    });

    // Start animation when the page is loaded
    moveCircles();
    // Event listeners for shape buttons...

    centerSection.addEventListener('mousemove', (event) => {
        const clickX = event.clientX - centerSection.offsetLeft;
        const clickY = event.clientY - centerSection.offsetTop;

        const fluxCenter = new THREE.Vector2(clickX, clickY);
        verletSolver.flux(fluxCenter);

    });


    const squareButton = document.getElementById('square-container')!;
    squareButton.addEventListener('click', () => {
        centerSection.style.borderRadius = '0%'; // Set border radius to 0
        verletSolver.containerState = "square";
    });

    const circleButton = document.getElementById('circle-container')!;
    circleButton.addEventListener('click', () => {
        centerSection.style.borderRadius = '50%'; // Set border radius to 0
        verletSolver.containerState = "circle"
    });

    const clothButton = document.getElementById('cloth-container')!;
    clothButton.addEventListener('click', () => {
        centerSection.style.borderRadius = '0%'; // Set border radius to 0
        //
        verletSolver.initCloth();
        verletSolver.initSticks();
        verletSolver.containerState = "cloth";
    });

    // Add event listener for the button click to add more circles
    const addCirclesButton = document.getElementById('addCirclesButton')!;
    addCirclesButton.addEventListener('click', () => {
        const numCirclesInput = document.getElementById('numCirclesInput')! as HTMLInputElement;
        const numToAdd = parseInt(numCirclesInput.value, 10); // Get the value from the input box
        if (!isNaN(numToAdd) && numToAdd > 0) {
            numCircles += numToAdd; // Increase the number of circles to add
        }
    });

    document.getElementById('github')!.addEventListener('click', function() {
        window.open("https://github.com/unicodeee/particle-collision-simulation", "_blank");
    });
});

