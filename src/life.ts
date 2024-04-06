// Get the canvas context
const m: CanvasRenderingContext2D = (document.getElementById("life") as HTMLCanvasElement).getContext("2d")!;

let borderY: number = 500;
let borderX: number = 500;

const borderBuffer: number = 100;

// Your TypeScript code
const create = (number: number, color: number[], size: number): { x: number, y: number, color: { r: number, g: number, b: number }, size: number, vx: number, vy: number }[] => {
    const group: { x: number, y: number, color: { r: number, g: number, b: number }, size: number, vx: number, vy: number }[] = [];
    for (let i = 0; i < number; i++) {
        group.push({
            x: Math.random() * 500,
            y: Math.random() * 500,
            color: {
                r: color[0],
                g: color[1],
                b: color[2],
            },
            size: size,
            vx: 0,
            vy: 0,
        });
    }
    return group;
};

// Function to draw particles
function draw(particle: { x: number, y: number, color: { r: number, g: number, b: number }, size: number }) {
    let x = particle.x,
        y = particle.y,
        color = particle.color,
        size = particle.size;

    // x, y, color, size;

    //   m.fillStyle = color;

    m.fillStyle = `rgb(
    ${Math.floor(color.r)},
    ${Math.floor(color.g)},
    ${Math.floor(color.b)})`;

    m.beginPath();
    m.arc(x, y, size, 0, 2 * Math.PI);
    m.fill();
}

const updatePosition = (p1: { x: number, y: number, color: { r: number, g: number, b: number }, size: number, vx: number, vy: number }) => {
    draw(p1);
};

const calculateNewPos = (p1: { x: number, y: number, color: { r: number, g: number, b: number }, size: number, vx: number, vy: number }, p2: { x: number, y: number }, g: number) => {
    let dx = p1.x - p2.x;
    let dy = p1.y - p2.y;

    let distance = Math.sqrt(dx ** 2 + dy ** 2);
    let F = -(g * 1) / distance;
    let fx = F * dx;
    let fy = F * dy;

    const capVelocity = 10;
    if (p1.vx <= capVelocity || p1.vy <= capVelocity) {
        p1.vx += fx;
        p1.vy += fy;
    }

    const colorStrength = 5;

    if (p1.x <= 0 || p1.x >= borderX) {
        p1.vx = -p1.vx;
        updateColor(p1, [
            (p1.color.r += colorStrength),
            (p1.color.g -= colorStrength),
            (p1.color.b += colorStrength),
        ]);
    }
    if (p1.y <= 0 || p1.y >= borderY) {
        p1.vy = -p1.vy;
        updateColor(p1, [
            (p1.color.r -= colorStrength),
            (p1.color.g += colorStrength),
            (p1.color.b -= colorStrength),
        ]);
    }

    // update color:

    //   console.log(p1.vx, p1.vy);

    p1.x += p1.vx;
    p1.y += p1.vy;
};

const updateColor = (particle: { color: { r: number, g: number, b: number } }, color: number[]) => {
    particle.color = {
        r: color[0],
        g: color[1],
        b: color[2],
    };
};

const rule = (particles1: { x: number, y: number, color: { r: number, g: number, b: number }, size: number, vx: number, vy: number }[], particles2: { x: number, y: number }[], g: number) => {
    for (let i = 0; i < particles1.length; i++) {
        for (let j = 0; j < particles2.length; j++) {
            calculateNewPos(particles1[i], particles2[j], g);
            updatePosition(particles1[i]);
            //   updatePosition(particles2[j]);
        }

        // calculateNewPos
    }
};

const yellowParticles = create(50, [1, 150, 150], 2);
const redParticles = create(4, [255, 140, 12], 4);
const greenParticles = create(4, [255, 165, 0], 8);

const update = () => {
    m.clearRect(0, 0, borderX, borderY);
    //   rule(staticParticles[0], staticParticles[1], 0.5);
    //   rule(staticParticles[1], staticParticles[0], 0.2);

    rule(yellowParticles, redParticles, 0.01);
    rule(redParticles, yellowParticles, 0.01);

    // rule(greenParticles, yellowParticles, 0.001);

    //   rule(staticParticles[1], staticParticles[0], 0.2);

    requestAnimationFrame(update);
};

// Start the animation loop
requestAnimationFrame(update);
