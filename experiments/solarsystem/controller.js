class SolarSystemController {
    constructor() {
        this.canvas = document.getElementById('solarCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.solarSystem = new SolarSystem();
        
        this.camera = {
            x: 0,
            y: 0,
            zoom: 0.5,
            targetZoom: 0.5,
            targetX: 0,
            targetY: 0
        };
        this.anchoredPlanet = null;
        this.scale = 5.0;
        
        this.anchorToPlanet(this.solarSystem.getBodyByName('Sun'));
        
        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.lastTime = 0;
        
        this.initializeCanvas();
        this.initializeControls();
        this.initializeEventListeners();
        this.createPlanetControls();
        
        this.animate();
    }
    
    initializeCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    
    initializeControls() {
        this.zoomSlider = document.getElementById('zoomSlider');
        this.zoomValue = document.getElementById('zoomValue');
        this.physicsStepsSlider = document.getElementById('physicsStepsSlider');
        this.physicsStepsValue = document.getElementById('physicsStepsValue');
        
        this.zoomSlider.addEventListener('input', (e) => {
            this.camera.targetZoom = parseFloat(e.target.value);
            this.updateZoomDisplay();
        });
        
        this.physicsStepsSlider.addEventListener('input', (e) => {
            const steps = parseInt(e.target.value);
            this.solarSystem.physicsStepsPerFrame = steps;
            this.updatePhysicsStepsDisplay();
        });
        
        this.zoomSlider.value = this.camera.targetZoom;
        this.updateZoomDisplay();
        this.updatePhysicsStepsDisplay();
    }
    
    createPlanetControls() {
        const container = document.getElementById('planetControls');
        if (!container) {
            console.error('Planet controls container not found!');
            return;
        }
        
        container.innerHTML = '';
        
        const bodies = this.solarSystem.getBodies();

        
        if (bodies.length === 0) {
            container.innerHTML = '<p class="text-gray-400">No celestial bodies found</p>';
            return;
        }
        
        bodies.forEach(body => {
            const control = document.createElement('div');
            control.className = 'planet-control';
            
            const isSun = body.name === 'Sun';
            const minVal = isSun ? "1" : "-100";
            const maxVal = isSun ? "10" : "100";
            const stepVal = isSun ? "0.01" : "0.1";
            
            control.innerHTML = `
                <div class="planet-name">
                    <div class="planet-color" style="background-color: ${body.color}"></div>
                    ${body.name}
                </div>
                <div class="flex items-center space-x-3">
                    <input type="range" 
                           class="mass-slider" 
                           min="${minVal}" 
                           max="${maxVal}" 
                           step="${stepVal}" 
                           value="1" 
                           data-planet="${body.name}">
                    <span class="mass-value">1x</span>
                </div>
            `;
            
            const slider = control.querySelector('.mass-slider');
            const valueDisplay = control.querySelector('.mass-value');
            
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.solarSystem.setBodyMassMultiplier(body.name, value);
                valueDisplay.textContent = value + 'x';
                
                if (value < 0) {
                    valueDisplay.style.color = '#ef4444';
                } else if (value > 1) {
                    valueDisplay.style.color = '#10b981';
                } else {
                    valueDisplay.style.color = '#f3f4f6';
                }
            });
            
            container.appendChild(control);
        });
    }
    
    initializeEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));

        const anchorSelect = document.getElementById('anchorSelect');
        const resetPositionBtn = document.getElementById('resetPositionBtn');
        
        anchorSelect.addEventListener('change', (e) => {
            const selectedPlanet = e.target.value;
            if (selectedPlanet === '') {
                this.anchoredPlanet = null;
                this.camera.targetX = this.camera.x;
                this.camera.targetY = this.camera.y;
            } else {
                const planet = this.solarSystem.bodies.find(b => b.name === selectedPlanet);
                if (planet) {
                    this.anchorToPlanet(planet);
                }
            }
        });
        
        const sunMassSlider = document.getElementById('sunMassSlider');
        const sunMassValue = document.getElementById('sunMassValue');
        const addStarBtn = document.getElementById('addStarBtn');
        
        sunMassSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.solarSystem.setBodyMassMultiplier('Sun', value);
            sunMassValue.textContent = value + 'x';
        });
        
        addStarBtn.addEventListener('click', () => {
            this.addNewStar();
        });
    }
    
    addNewStar() {
        const starName = `Star${this.solarSystem.bodies.length}`;
        const mass = 500 + Math.random() * 500;
        const x = (Math.random() - 0.5) * 1000;
        const y = (Math.random() - 0.5) * 1000;
        
        const newStar = new CelestialBody(starName, mass, 30, 0, '#FF6B6B', 0);
        newStar.solarSystem = this.solarSystem;
        newStar.x = x;
        newStar.y = y;
        newStar.vx = (Math.random() - 0.5) * 2;
        newStar.vy = (Math.random() - 0.5) * 2;
        
        this.solarSystem.bodies.push(newStar);
        this.solarSystem.planetMultipliers[starName] = 1;
        
        console.log(`Added new star: ${starName} at (${x.toFixed(1)}, ${y.toFixed(1)})`);
    }
    
    anchorToPlanet(planet) {
        this.anchoredPlanet = planet;
        this.camera.targetX = -planet.x * this.scale;
        this.camera.targetY = -planet.y * this.scale;

    }
    
    onMouseDown(e) {
        this.isDragging = true;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
        this.canvas.style.cursor = 'grabbing';
    }
    
    onMouseMove(e) {
        if (this.isDragging) {
            const dx = e.clientX - this.lastMousePos.x;
            const dy = e.clientY - this.lastMousePos.y;
            
            this.camera.x += dx / this.camera.zoom;
            this.camera.y += dy / this.camera.zoom;
            
            this.lastMousePos = { x: e.clientX, y: e.clientY };
        }
    }
    
    onMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }
    
    onWheel(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.camera.targetZoom *= zoomFactor;
        this.camera.targetZoom = Math.max(0.01, Math.min(20, this.camera.targetZoom));
        
        this.zoomSlider.value = this.camera.targetZoom;
        this.updateZoomDisplay();
    }
    

    
    resetCamera() {
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.targetX = 0;
        this.camera.targetY = 0;
        this.camera.targetZoom = 0.5;
        this.zoomSlider.value = 0.5;
        this.updateZoomDisplay();
    }
    
    updateZoomDisplay() {
        this.zoomValue.textContent = this.camera.targetZoom.toFixed(2) + 'x';
    }
    
    updatePhysicsStepsDisplay() {
        this.physicsStepsValue.textContent = this.solarSystem.physicsStepsPerFrame;
    }
    
    worldToScreen(worldX, worldY) {
        const scale = 5.0;
        const scaledX = worldX * scale;
        const scaledY = worldY * scale;
        
        const screenX = (scaledX + this.camera.x) * this.camera.zoom + this.canvas.width / 2;
        const screenY = (scaledY + this.camera.y) * this.camera.zoom + this.canvas.height / 2;
        return { x: screenX, y: screenY };
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderStars();
        this.renderBodies();
        this.renderEarthDays();
    }
    
    renderStars() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 2;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    renderBodies() {
        const bodies = this.solarSystem.getBodies();
        
        for (let body of bodies) {
            if (body.trail.length > 1) {
                this.renderTrail(body);
            }
        }
        
        for (let body of bodies) {
            this.renderBody(body);
        }
    }
    
    renderTrail(body) {
        if (body.trail.length < 2) return;
        
        this.ctx.strokeStyle = body.color + '40';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        
        for (let i = 0; i < body.trail.length; i++) {
            const point = body.trail[i];
            const screenPos = this.worldToScreen(point.x, point.y);
            if (i === 0) {
                this.ctx.moveTo(screenPos.x, screenPos.y);
            } else {
                this.ctx.lineTo(screenPos.x, screenPos.y);
            }
        }
        
        this.ctx.stroke();
    }
    
    renderBody(body) {
        const screenPos = this.worldToScreen(body.x, body.y);
        const radius = Math.max(3, body.radius * this.camera.zoom);
        
        this.ctx.fillStyle = body.massMultiplier < 0 ? '#ff4444' : body.color;
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        if (body.name === 'Sun') {
            this.ctx.shadowColor = body.color;
            this.ctx.shadowBlur = 20;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
        
        if (radius > 5 || this.camera.zoom > 0.3) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.font = `${Math.max(8, 10 * this.camera.zoom)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(body.name, screenPos.x, screenPos.y - radius - 8);
        }
    }
    
    renderEarthDays() {
        const earthDays = this.solarSystem.getEarthDays();
        const earthSeason = this.solarSystem.getEarthSeason();
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Earth Days: ${earthDays}`, this.canvas.width - 20, 30);
        this.ctx.fillText(`Season: ${earthSeason}`, this.canvas.width - 20, 55);
    }
    
    update(deltaTime) {
        this.solarSystem.update(deltaTime);
        
        if (this.anchoredPlanet) {
            this.camera.targetX = -this.anchoredPlanet.x * this.scale;
            this.camera.targetY = -this.anchoredPlanet.y * this.scale;
            
            this.camera.x += (this.camera.targetX - this.camera.x) * 0.1;
            this.camera.y += (this.camera.targetY - this.camera.y) * 0.1;
        }
        
        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.1;
    }
    
    animate(currentTime = 0) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.animate(time));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SolarSystemController();
});
