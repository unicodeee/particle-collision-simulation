

export class Vec2{
    x : number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // Addition
    add(other: Vec2): Vec2 {
        return new Vec2(this.x + other.x, this.y + other.y);
    }

    // Subtraction
    subtract(other: Vec2): Vec2 {
        return new Vec2(this.x - other.x, this.y - other.y);
    }

    // Scalar multiplication
    multiplyScalar(scalar: number): Vec2 {
        return new Vec2(this.x * scalar, this.y * scalar);
    }

    // Dot product
    dot(other: Vec2): number {
        return this.x * other.x + this.y * other.y;
    }

    // Cross product
    cross(other: Vec2): number {
        return this.x * other.y - this.y * other.x;
    }

    // Magnitude (length) of the vector
    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // Normalization (unit vector)
    normalize(): Vec2 {
        const magnitude = this.magnitude();
        if (magnitude === 0) {
            return new Vec2(0, 0);
        }
        return this.multiplyScalar(1 / magnitude);
    }

    // Angle between two vectors (in radians)
    angleTo(other: Vec2): number {
        const dotProduct = this.dot(other);
        const magnitudeProduct = this.magnitude() * other.magnitude();
        return Math.acos(dotProduct / magnitudeProduct);
    }

    // Rotate the vector by a given angle (in radians)
    rotate(angle: number): Vec2 {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vec2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }
}