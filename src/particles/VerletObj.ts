import * as THREE from 'three';

export class VerletObject {
    positionCurrent: THREE.Vector2;
    positionOld: THREE.Vector2;
    acceleration: THREE.Vector2;
    radius: number;

    // lightweight data-only particle — no DOM element here
    constructor(position: THREE.Vector2, radius = 20) {
        this.positionOld = position.clone();
        this.positionCurrent = position.clone();
        this.acceleration = new THREE.Vector2(0, 0);
        this.radius = radius;
    }

    updatePosition(dt: number) {
        const velocity = this.positionCurrent.clone().sub(this.positionOld);
        this.positionOld = this.positionCurrent.clone();
        this.positionCurrent = this.positionCurrent.clone().add(velocity).add(this.acceleration.clone().multiplyScalar(dt * dt));
        this.resetAcceleration();
    }

    accelerate(acc: THREE.Vector2) {
        this.acceleration.add(acc);
    }

    resetAcceleration() {
        this.acceleration = new THREE.Vector2(0, 0);
    }
}