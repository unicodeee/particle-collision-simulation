export class Circle {
    element: HTMLImageElement;
    x: number;
    y: number;
    speedX: number;
    speedY: number;
    centerSectionRect: DOMRect;

    constructor(centerSectionRect: DOMRect) {
        this.element = document.createElement('img');
        this.element.src = '/public/circle.png';
        this.element.alt = 'Circle';
        this.element.className = 'circle';

        this.centerSectionRect = centerSectionRect;
        this.x = Math.random() * (centerSectionRect.width - 100); // Random initial x-coordinate within centerSection width
        this.y = Math.random() * (centerSectionRect.height - 100); // Random initial y-coordinate within centerSection height

        this.speedX = Math.random() * 2 - 1; // Random speed in x-direction
        this.speedY = Math.random() * 2 - 1; // Random speed in y-direction

        this.element.style.position = 'absolute';
        this.updatePosition(); // Update initial position
    }

    updatePosition() {
        this.element.style.left = this.x + this.centerSectionRect.left + 'px'; // Adjust left position to include centerSection's offset
        this.element.style.top = this.y + this.centerSectionRect.top + 'px'; // Adjust top position to include centerSection's offset
    }

    move() {
        this.x += this.speedX;
        this.y += this.speedY;

        // If circle hits the boundary, reverse its direction
        if (this.x < 0 || this.x > this.centerSectionRect.width - 100) {
            this.speedX = -this.speedX;
        }
        if (this.y < 0 || this.y > this.centerSectionRect.height - 100) {
            this.speedY = -this.speedY;
        }

        this.updatePosition(); // Update circle's position
    }
}
