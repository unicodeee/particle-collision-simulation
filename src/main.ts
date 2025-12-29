import { VerletSolver } from './VerletSolver';
import { CanvasRenderer } from './renderer/CanvasRenderer.ts';
import * as THREE from 'three';

window.addEventListener('DOMContentLoaded', () => {
    const centerSection = document.getElementById('center-section')!;

    // create single canvas renderer for entire simulation
    const renderer = new CanvasRenderer(centerSection);

    const verletSolver = new VerletSolver(centerSection, renderer);
    let numCircles = 40;
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
            pauseAnimation();
        } else {
            resumeAnimation();
        }
    });

    // Start animation when the page is loaded
    moveCircles();

    centerSection.addEventListener('mousemove', (event) => {
        const rect = centerSection.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        const fluxCenter = new THREE.Vector2(clickX, clickY);
        verletSolver.flux(fluxCenter);
    });

    const squareButton = document.getElementById('square-container')!;
    squareButton.addEventListener('click', () => {
        centerSection.style.borderRadius = '0%';
        verletSolver.containerState = "square";
    });

    const circleButton = document.getElementById('circle-container')!;
    circleButton.addEventListener('click', () => {
        centerSection.style.borderRadius = '50%';
        verletSolver.containerState = "circle";
    });

    const clothButton = document.getElementById('cloth-container')!;
    clothButton.addEventListener('click', () => {
        centerSection.style.borderRadius = '0%';
        verletSolver.containerState = "cloth";
        verletSolver.set_cloth_properties();
        verletSolver.initClothPointPosition();
        verletSolver.initSticks();
    });

    const addCirclesButton = document.getElementById('addCirclesButton')!;
    addCirclesButton.addEventListener('click', () => {
        const numCirclesInput = document.getElementById('numCirclesInput')! as HTMLInputElement;
        const numToAdd = parseInt(numCirclesInput.value, 10);
        if (!isNaN(numToAdd) && numToAdd > 0) {
            numCircles += numToAdd;
        }
        if (verletSolver.containerState === "cloth") {
            clothButton.click();
        }
    });

    document.getElementById('github')!.addEventListener('click', function() {
        window.open("https://github.com/unicodeee/particle-collision-simulation", "_blank");
    });
});