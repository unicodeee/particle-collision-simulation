
import * as THREE from 'three';

export class VerletObject {
    positionCurrent: THREE.Vector2;
    positionOld: THREE.Vector2;
    acceleration: THREE.Vector2;
    radius: number | undefined;

    element: HTMLImageElement;

    constructor(position: THREE.Vector2) {


        this.positionOld = position.clone();
        this.positionCurrent = position.clone();
        this.acceleration = new THREE.Vector2(0, 0);

        this.element = document.createElement('img');
        this.element.src = '/circle.png';
        this.element.alt = 'Circle';
        this.element.className = 'circle';

        this.radius = 20; // default
        // this.radius = this.element.getBoundingClientRect().width;

        // Listen for the 'load' event to ensure the image has been fully loaded
        this.element.addEventListener('load', () => {
            this.radius = this.element.offsetWidth / 2; // Calculate the radius after the image has loaded
        });
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