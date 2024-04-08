export class Circle {
    element: HTMLImageElement;
    x: number;
    y: number;
    speedX: number;
    speedY: number;
    centerSectionRect: DOMRect;

    constructor(centerSectionRect: DOMRect) {
        this.element = document.createElement('img');
        this.element.src = '/circle.png';
        this.element.alt = 'Circle';
        this.element.className = 'circle';

        this.centerSectionRect = centerSectionRect;
        this.x = centerSectionRect.left + Math.random() * (centerSectionRect.width - 100); // Random initial x-coordinate within centerSection width
        this.y = centerSectionRect.top + Math.random() * (centerSectionRect.bottom - 100); // Random initial y-coordinate within centerSection height

        this.speedX = 3* Math.random() * 2 - 1; // Random speed in x-direction
        this.speedY = 3*Math.random() * 2 - 1; // Random speed in y-direction

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

        // Calculate the boundaries considering the size of the circle
        const maxX = this.centerSectionRect.width - this.element.offsetWidth;
        const maxY = this.centerSectionRect.height - this.element.offsetHeight;

        // Check if the circle exceeds the boundaries and adjust its position accordingly
        if (this.x < 0 || this.x > maxX) {
            this.x = Math.min(Math.max(this.x, 0), maxX); // Ensure x stays within [0, maxX]
            this.speedX = -this.speedX; // Reverse direction
        }
        if (this.y < 0 || this.y > maxY) {
            this.y = Math.min(Math.max(this.y, 0), maxY); // Ensure y stays within [0, maxY]
            this.speedY = -this.speedY; // Reverse direction
        }

        this.updatePosition(); // Update circle's position
    }

}
