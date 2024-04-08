
import * as THREE from 'three';

export class VerletObject {
    positionCurrent: THREE.Vector2;
    positionOld: THREE.Vector2;
    acceleration: THREE.Vector2;
    radius: number;

    element: HTMLImageElement;
    centerSectionRect: DOMRect;

    constructor(centerSectionRect: DOMRect, position: THREE.Vector2) {
        this.centerSectionRect = centerSectionRect;


        this.positionOld = position;
        this.positionCurrent = position;
        this.acceleration = new THREE.Vector2(0, 100);

        this.element = document.createElement('img');
        this.element.src = '/circle.png';
        this.element.alt = 'Circle';
        this.element.className = 'circle';
        this.radius = this.element.getBoundingClientRect().width;
    }


    updatePosition(dt: number) {


        // Calculate velocity
        const velocity = this.positionCurrent.clone().sub(this.positionOld);

        // Perform Verlet integration
        const acceleration = this.acceleration.clone().multiplyScalar(dt * dt);
        this.positionOld.copy(this.positionCurrent);
        this.positionCurrent.add(velocity).add(acceleration);

        this.draw();
    }

    draw(){
        this.element.style.left = this.positionCurrent.x + 'px';
        this.element.style.top = this.positionCurrent.y + 'px';
    }
}