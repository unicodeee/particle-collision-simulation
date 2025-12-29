import { VerletObject } from '../particles/VerletObj.ts';
import { CircleFlyweight } from './CircleFlyweight.ts';

export class CanvasRenderer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    container: HTMLElement;
    dpr: number;

    constructor(container: HTMLElement) {
        this.container = container;
        this.dpr = window.devicePixelRatio || 1;
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '0';
        this.canvas.style.top = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        // ensure container is positioned
        if (!container.style.position) {
            container.style.position = 'relative';
        }
        container.appendChild(this.canvas);
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error('2D context not supported');
        this.ctx = ctx;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));
        this.canvas.width = Math.floor(w * this.dpr);
        this.canvas.height = Math.floor(h * this.dpr);
        this.canvas.style.width = `${w}px`;
        this.canvas.style.height = `${h}px`;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    clear() {
        const rect = this.container.getBoundingClientRect();
        this.ctx.clearRect(0, 0, rect.width, rect.height);
    }

    render(circles: VerletObject[]) {
        this.clear();
        for (let i = 0; i < circles.length; i++) {
            const c = circles[i];
            const sprite = CircleFlyweight.getSprite(c.radius, 'rgba(200,100,100,0.95)');
            const drawX = c.positionCurrent.x - c.radius;
            const drawY = c.positionCurrent.y - c.radius;
            this.ctx.drawImage(sprite, drawX, drawY, c.radius * 2, c.radius * 2);
        }
    }
}