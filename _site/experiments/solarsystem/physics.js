class CelestialBody {
    constructor(name, mass, radius, distance, color, initialAngle = 0) {
        this.name = name;
        this.mass = mass;
        this.radius = radius;
        this.distance = distance;
        this.color = color;

        this.trail = [];
        this.maxTrailLength = 2000;
        
        this.x = Math.cos(initialAngle) * distance;
        this.y = Math.sin(initialAngle) * distance;
        
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        
        this.updatePosition();
    }
    
    updatePosition() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }
    
    update(deltaTime) {
        this.vx += this.ax * deltaTime;
        this.vy += this.ay * deltaTime;
        
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        this.ax = 0;
        this.ay = 0;
        
        this.updatePosition();
    }
    
    applyForce(fx, fy) {
        const effectiveMass = this.getEffectiveMass();
        if (effectiveMass !== 0) {
            this.ax += fx / effectiveMass;
            this.ay += fy / effectiveMass;
        }
    }
    
    getEffectiveMass() {
        const multiplier = this.solarSystem.planetMultipliers[this.name] || 1;
        return this.mass * multiplier;
    }
}

class SolarSystem {
    constructor() {
        this.bodies = [];
        this.physicsStepsPerFrame = 25;
        
        this.gravityConstant = 1.0;
        this.sunMass = 1000;
        this.earthDays = 0;
        this.auInPixels = 100;
        this.planetMultipliers = {};
        
        this.initializeBodies();
        this.setInitialVelocities();
    }
    
    initializeBodies() {
        const sun = new CelestialBody(
            'Sun',
            1000,
            50,
            0,
            '#FDB813',
            0
        );
        sun.solarSystem = this;
        
        const mercury = new CelestialBody(
            'Mercury',
            0.00000017,
            15,
            0.39 * this.auInPixels,
            '#8C7853',
            0
        );
        mercury.solarSystem = this;
        
        const venus = new CelestialBody(
            'Venus',
            0.0000024,
            18,
            0.72 * this.auInPixels,
            '#FFC649',
            Math.PI / 4
        );
        venus.solarSystem = this;
        
        const earth = new CelestialBody(
            'Earth',
            0.000003,
            20,
            1.0 * this.auInPixels,
            '#6B93D6',
            Math.PI / 2
        );
        earth.solarSystem = this;
        
        const mars = new CelestialBody(
            'Mars',
            0.00000032,
            16,
            1.52 * this.auInPixels,
            '#CD5C5C',
            Math.PI
        );
        mars.solarSystem = this;
        
        const jupiter = new CelestialBody(
            'Jupiter',
            0.00095,
            35,
            5.2 * this.auInPixels,
            '#D8CA9D',
            Math.PI * 1.2
        );
        jupiter.solarSystem = this;
        
        const saturn = new CelestialBody(
            'Saturn',
            0.00029,
            30,
            9.5 * this.auInPixels,
            '#FAD5A5',
            Math.PI * 1.8
        );
        saturn.solarSystem = this;
        
        const uranus = new CelestialBody(
            'Uranus',
            0.000044,
            25,
            19.2 * this.auInPixels,
            '#4FD0E3',
            Math.PI * 0.3
        );
        uranus.solarSystem = this;
        
        const neptune = new CelestialBody(
            'Neptune',
            0.000051,
            25,
            30.1 * this.auInPixels,
            '#4B70DD',
            Math.PI * 1.7
        );
        neptune.solarSystem = this;
        
        this.bodies = [sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];
        
        this.planetMultipliers = {
            'Sun': 1,
            'Mercury': 1,
            'Venus': 1,
            'Earth': 1,
            'Mars': 1,
            'Jupiter': 1,
            'Saturn': 1,
            'Uranus': 1,
            'Neptune': 1
        };
    }
    
    setInitialVelocities() {
        for (let body of this.bodies) {
            if (body.name !== 'Sun') {
                const distance = Math.sqrt(body.x * body.x + body.y * body.y);
                if (distance > 0) {
                    const sun = this.bodies.find(b => b.name === 'Sun');
                    const sunMass = sun ? sun.getEffectiveMass() : this.sunMass;
                    const orbitalSpeed = Math.sqrt(this.gravityConstant * sunMass / distance);
                    const angle = Math.atan2(body.y, body.x);
                    body.vx = -Math.sin(angle) * orbitalSpeed;
                    body.vy = Math.cos(angle) * orbitalSpeed;
                }
            }
        }
    }
    
    update(deltaTime) {
        for (let step = 0; step < this.physicsStepsPerFrame; step++) {
            this.calculateGravity();
            
            for (let body of this.bodies) {
                body.update(deltaTime);
            }
        }
        
        this.updateEarthDays(deltaTime * this.physicsStepsPerFrame);
    }
    
    updateEarthDays(timeSpan) {
        const earth = this.bodies.find(b => b.name === 'Earth');
        if (earth) {
            const earthDistance = Math.sqrt(earth.x * earth.x + earth.y * earth.y);
            const sun = this.bodies.find(b => b.name === 'Sun');
            const sunMass = sun ? sun.getEffectiveMass() : this.sunMass;
            const earthOrbitalSpeed = Math.sqrt(this.gravityConstant * sunMass / earthDistance);
            const earthCircumference = 2 * Math.PI * earthDistance;
            const earthOrbitalTime = earthCircumference / earthOrbitalSpeed;
            
            const daysPerSimulationSecond = 365.25 / earthOrbitalTime;
            this.earthDays += timeSpan * daysPerSimulationSecond;
        }
    }
    
    getEarthDays() {
        return Math.floor(this.earthDays);
    }
    
    getEarthSeason() {
        const earth = this.bodies.find(b => b.name === 'Earth');
        if (earth) {
            const angle = Math.atan2(earth.y, earth.x);
            const degrees = (angle * 180 / Math.PI + 360) % 360;
            
            if (degrees >= 0 && degrees < 90) return 'Spring';
            if (degrees >= 90 && degrees < 180) return 'Summer';
            if (degrees >= 180 && degrees < 270) return 'Autumn';
            return 'Winter';
        }
        return 'Unknown';
    }
    

    
    calculateGravity() {
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const body1 = this.bodies[i];
                const body2 = this.bodies[j];
                
                const dx = body2.x - body1.x;
                const dy = body2.y - body1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    const force = this.gravityConstant * body1.getEffectiveMass() * body2.getEffectiveMass() / (distance * distance);
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;
                    

                    
                    body1.applyForce(fx, fy);
                    body2.applyForce(-fx, -fy);
                }
            }
        }
    }
    
    setBodyMassMultiplier(bodyName, multiplier) {
        this.planetMultipliers[bodyName] = multiplier;
    }
    
    getBodies() {
        return this.bodies;
    }
    
    getBodyByName(name) {
        return this.bodies.find(b => b.name === name);
    }
}
