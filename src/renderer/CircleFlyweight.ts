// Flyweight factory: caches pre-rendered circle canvases keyed by radius+color


export class CircleFlyweight {
    private static cache = new Map<string, HTMLCanvasElement>();

    static getSprite(radius: number, color = 'rgba(255, 255, 255, 1)'): HTMLCanvasElement {
        // const key = `${radius}@white`;

        const key = `${radius}@${color}`;
        const existing = this.cache.get(key);
        if (existing) return existing;

        const dpr = window.devicePixelRatio || 1;
        const size = Math.max(1, Math.ceil(radius * 2));

        const canvas = document.createElement('canvas');
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;

        const ctx = canvas.getContext('2d')!;
        ctx.scale(dpr, dpr);

        // Flat white fill
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        this.cache.set(key, canvas);
        return canvas;
    }
}
