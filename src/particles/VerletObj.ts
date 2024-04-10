
import * as THREE from 'three';

export class VerletObject {
    positionCurrent: THREE.Vector2;
    positionOld: THREE.Vector2;
    acceleration: THREE.Vector2;
    radius: number | undefined;

    element: HTMLImageElement;
    centerSectionRect: DOMRect;

    constructor(centerSectionRect: DOMRect, position: THREE.Vector2) {
        this.centerSectionRect = centerSectionRect;


        this.positionOld = position.clone();
        this.positionCurrent = position.clone();
        this.acceleration = new THREE.Vector2(0, 0);

        this.element = document.createElement('img');
        this.element.src = '/circle.png';
        this.element.alt = 'Circle';
        this.element.className = 'circle';
        this.radius = this.element.getBoundingClientRect().width;

    }



    updatePosition(dt: number) {
        let velocity = this.positionCurrent.clone().sub(this.positionOld);

        this.positionOld = (this.positionCurrent.clone());
        this.positionCurrent = (this.positionCurrent.clone().add(velocity).add(this.acceleration.clone().multiplyScalar(dt * dt)));
        this.resetAcceleration();
        this.draw();
    }

    draw(){
        this.element.style.left = this.positionCurrent.x + 'px';
        this.element.style.top = this.positionCurrent.y + 'px';
    }

    accelerate(acc: THREE.Vector2){
        this.acceleration.add(acc);
    }

    resetAcceleration(){
        this.acceleration = new THREE.Vector2(0, 0);
    }
}