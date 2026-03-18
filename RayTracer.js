class Vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    scale(scalar) {
        return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    dot(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    normalised() {
        const length = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
        return new Vec3(this.x / length, this.y / length, this.z / length);
    }

    subtract(other) {
        return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    add(other) {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }
}

class Ray {
    constructor(origin, direction)
    {
        this.origin = origin;
        this.direction = direction;
    }

    pointAt(t)
    {
        return new Vec3(
            this.origin.x + t * this.direction.x,
            this.origin.y + t * this.direction.y,
            this.origin.z + t * this.direction.z
        );
    }
}

class Sphere {
    constructor(center, radius, color) 
    {
        this.center = center;
        this.radius = radius;
        this.color = color;
    }

    rayIntersects(ray)
    {
        const oc = ray.origin.subtract(this.center);
        const a = ray.direction.dot(ray.direction);
        const b = 2.0 * oc.dot(ray.direction);
        const c = oc.dot(oc) - this.radius * this.radius;
        const discriminant = b * b - 4.0 * a * c;

        if (discriminant > 0) {
            const t1 = (-b - Math.sqrt(discriminant)) / (2.0 * a);
            const t2 = (-b + Math.sqrt(discriminant)) / (2.0 * a);
            return Math.min(t1, t2);
        }
        return -1;
    }
}

const spheres = [
    new Sphere(new Vec3(0, 0, -1), 0.3, new Vec3(1, 0, 0)), //Red One
    new Sphere(new Vec3(0, 0.2, -0.8), 0.15, new Vec3(0, 0, 1)), //Blue One
    new Sphere(new Vec3(0, -100.5, -5), 100, new Vec3(0, 1, 0)) //Green One lol
];

const lightDirection = new Vec3(-1.1, -2.3, -1.5).normalised();
const negLightDirection = new Vec3(-lightDirection.x, -lightDirection.y, -lightDirection.z);

function backgroundColour(ray) {
    const dir = ray.direction.normalised();
    const phi = Math.atan2(dir.x, dir.z);
    const theta = Math.acos(dir.y);
    const u = (phi + Math.PI) / (2 * Math.PI);
    const v = theta / Math.PI;
    const skyColor = new Vec3(0.5, 0.9, 1.4);
    const groundColor = new Vec3(0.3, 0.3, 0.5);
    return skyColor.scale(1 - v).add(groundColor.scale(v));
}

function diffuseLighting(normal) {
    return Math.max(normal.dot(negLightDirection), 0);
}


function rayColor(ray) 
{
    let castResult = traceRay(ray);

    if (castResult.t < 0) return backgroundColour(ray);

    let albedo = spheres[castResult.sphereIndex].color;
    let diffuse = diffuseLighting(castResult.normal);
    let color = albedo.scale(diffuse);

    return color;

    }

function traceRay(ray) {
    let t = Infinity;
    let closestSphereIndex = -1;

    for (let i = 0; i < spheres.length; i++) {
        let current_t = spheres[i].rayIntersects(ray);

        if (current_t > 0 && current_t < t) {
            t = current_t;
            closestSphereIndex = i;
        }
    }

    if (closestSphereIndex < 0) {
        return { t: -1 };
    }

    const hitPoint = ray.pointAt(t);
    const normal = hitPoint
        .subtract(spheres[closestSphereIndex].center)
        .normalised();

    return {
        t: t,
        sphereIndex: closestSphereIndex,
        normal: normal
    };
}
function render() {
    const canvas = document.getElementById('RayTracer');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const viewportWidth = 2;
    const viewportHeight = 2;
    const focalLength = 1;
    const origin = new Vec3(0, 0, 0);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const u = (x / width) * viewportWidth - viewportWidth / 2;
            const v = (y / height) * viewportHeight - viewportHeight / 2;
            const direction = new Vec3(u, -v, -focalLength).normalised();
            const ray = new Ray(origin, direction);
            const color = rayColor(ray);
            const r = Math.min(1, Math.max(0, color.x)) * 255;
            const g = Math.min(1, Math.max(0, color.y)) * 255;
            const b = Math.min(1, Math.max(0, color.z)) * 255;
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

window.onload = render;
