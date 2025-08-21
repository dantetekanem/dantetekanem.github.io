class AStarController {
    constructor() {
        this.canvas = document.getElementById('pathfindingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.astar = new AStar(50, 40);
        this.storage = new StorageManager();
        this.isDrawing = false;
        this.lastDrawPos = null;
        this.isDraggingStart = false;
        this.isDraggingTarget = false;
        this.dragStartPos = null;
        
        this.init();
    }

    init() {
        this.loadSavedPreferences();
        this.loadSavedMaze();
        this.setupEventListeners();
        this.setupCanvas();
        this.render();
    }

    loadSavedPreferences() {
        const preferences = this.storage.loadPreferences();
        
        const heuristicSelect = document.getElementById('heuristicSelect');
        const weightSlider = document.getElementById('weightSlider');
        const speedSlider = document.getElementById('speedSlider');
        
        heuristicSelect.value = preferences.heuristic;
        weightSlider.value = preferences.weight;
        speedSlider.value = preferences.speed;
        
        this.astar.setHeuristic(preferences.heuristic);
        this.astar.setHeuristicWeight(preferences.weight);
        this.astar.setAnimationSpeed(preferences.speed);
        
        document.getElementById('weightValue').textContent = preferences.weight.toFixed(1);
        document.getElementById('speedValue').textContent = `${preferences.speed}ms`;
        document.getElementById('currentHeuristic').textContent = Heuristics.getHeuristicName(preferences.heuristic);
    }

    loadSavedMaze() {
        const mazeState = this.storage.loadMazeState();
        if (mazeState.lastSaved) {
            this.astar.setMazeState(mazeState);
            this.render();
        }
    }

    autoSaveMaze() {
        const mazeState = this.astar.getMazeState();
        this.storage.saveMazeState(mazeState);
    }

    setupEventListeners() {
        const heuristicSelect = document.getElementById('heuristicSelect');
        const weightSlider = document.getElementById('weightSlider');
        const speedSlider = document.getElementById('speedSlider');
        const generateMazeBtn = document.getElementById('generateMaze');
        const pathfindingToggleBtn = document.getElementById('pathfindingToggle');
        const clearPathBtn = document.getElementById('clearPath');
        const clearAllBtn = document.getElementById('clearAll');

        heuristicSelect.addEventListener('change', (e) => {
            this.astar.setHeuristic(e.target.value);
            this.storage.savePreference('heuristic', e.target.value);
            document.getElementById('currentHeuristic').textContent = Heuristics.getHeuristicName(e.target.value);
        });

        weightSlider.addEventListener('input', (e) => {
            const weight = parseFloat(e.target.value);
            this.astar.setHeuristicWeight(weight);
            this.storage.savePreference('weight', weight);
            document.getElementById('weightValue').textContent = weight.toFixed(1);
        });

        speedSlider.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            this.astar.setAnimationSpeed(speed);
            this.storage.savePreference('speed', speed);
            document.getElementById('speedValue').textContent = `${speed}ms`;
        });

        generateMazeBtn.addEventListener('click', () => {
            this.astar.generateRandomMaze();
            this.render();
            this.autoSaveMaze();
        });

        pathfindingToggleBtn.addEventListener('click', async () => {
            if (this.astar.isRunning) {
                this.stopPathfinding();
            } else {
                await this.startPathfinding();
            }
        });

        clearPathBtn.addEventListener('click', () => {
            this.astar.clearPath();
            this.render();
            this.updateStatistics();
            this.autoSaveMaze();
        });

        clearAllBtn.addEventListener('click', () => {
            this.astar.clearAll();
            this.render();
            this.updateStatistics();
            this.autoSaveMaze();
        });

        const clearPreferencesBtn = document.getElementById('clearPreferences');
        if (clearPreferencesBtn) {
            clearPreferencesBtn.addEventListener('click', () => {
                this.storage.clearAll();
                this.loadSavedPreferences();
                this.loadSavedMaze();
                this.render();
                this.updateStatistics();
            });
        }

        this.setupCanvasEvents();
    }

    setupCanvasEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.handleMouseDown(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });

        this.canvas.addEventListener('mouseup', () => {
            this.handleMouseUp();
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.handleMouseUp();
        });
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / 16);
        const y = Math.floor((e.clientY - rect.top) / 16);
        
        if (x >= 0 && x < 50 && y >= 0 && y < 40) {
            if (x === this.astar.getStart().x && y === this.astar.getStart().y) {
                this.isDraggingStart = true;
                this.dragStartPos = { x, y };
                return;
            }
            
            if (x === this.astar.getTarget().x && y === this.astar.getTarget().y) {
                this.isDraggingTarget = true;
                this.dragStartPos = { x, y };
                return;
            }
            
            this.isDrawing = true;
            this.lastDrawPos = { x, y };
            this.astar.toggleWall(x, y);
            this.render();
            this.autoSaveMaze();
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / 16);
        const y = Math.floor((e.clientY - rect.top) / 16);
        
        if (x >= 0 && x < 50 && y >= 0 && y < 40) {
            if (this.isDraggingStart) {
                if (this.astar.moveStartTo(x, y)) {
                    this.render();
                    this.autoSaveMaze();
                }
                return;
            }
            
            if (this.isDraggingTarget) {
                if (this.astar.moveTargetTo(x, y)) {
                    this.render();
                    this.autoSaveMaze();
                }
                return;
            }
            
            if (this.isDrawing) {
                if (!this.lastDrawPos || (x !== this.lastDrawPos.x || y !== this.lastDrawPos.y)) {
                    this.astar.toggleWall(x, y);
                    this.lastDrawPos = { x, y };
                    this.render();
                }
            }
        }
    }

    handleMouseUp() {
        this.isDrawing = false;
        this.isDraggingStart = false;
        this.isDraggingTarget = false;
        this.lastDrawPos = null;
        this.dragStartPos = null;
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 640;
        this.ctx.imageSmoothingEnabled = false;
    }

    async startPathfinding() {
        this.updateButtonStates(true);
        
        const result = await this.astar.findPath((elapsedTime) => {
            this.render();
            this.updateStatistics();
            this.updateExecutionTime(elapsedTime);
        });
        
        this.updateButtonStates(false);
        
        if (result.success) {
            this.updateStatistics();
            this.render();
        }
        
        document.getElementById('executionTime').textContent = `${result.executionTime}ms`;
    }

    updateExecutionTime(elapsedTime) {
        const executionTimeElement = document.getElementById('executionTime');
        executionTimeElement.textContent = `${elapsedTime}ms`;
        
        executionTimeElement.classList.remove('time-update-animation');
        void executionTimeElement.offsetWidth;
        executionTimeElement.classList.add('time-update-animation');
    }

    updateButtonStates(isRunning) {
        const pathfindingToggleBtn = document.getElementById('pathfindingToggle');
        const timeStatus = document.getElementById('timeStatus');
        
        if (isRunning) {
            pathfindingToggleBtn.textContent = '⏹️ Stop Generation';
            pathfindingToggleBtn.className = 'w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg';
            timeStatus.classList.remove('hidden');
        } else {
            pathfindingToggleBtn.textContent = '🚀 Generate Path';
            pathfindingToggleBtn.className = 'w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg';
            timeStatus.classList.add('hidden');
        }
    }

    stopPathfinding() {
        this.astar.stopPathfinding();
        this.updateButtonStates(false);
    }

    updateStatistics() {
        const pathLength = this.astar.getPath().length;
        const nodesExplored = this.astar.getExploredNodes().length;
        const currentHeuristic = Heuristics.getHeuristicName(this.astar.currentHeuristic);
        
        document.getElementById('pathLength').textContent = pathLength;
        document.getElementById('nodesExplored').textContent = nodesExplored;
        document.getElementById('currentHeuristic').textContent = currentHeuristic;
        
        if (pathLength === 0) {
            document.getElementById('executionTime').textContent = '0ms';
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const grid = this.astar.getGrid();
        const start = this.astar.getStart();
        const target = this.astar.getTarget();
        const path = this.astar.getPath();
        const exploredNodes = this.astar.getExploredNodes();
        const frontierNodes = this.astar.getFrontierNodes();
        
        for (let y = 0; y < 40; y++) {
            for (let x = 0; x < 50; x++) {
                const cell = grid[y][x];
                const pixelX = x * 16;
                const pixelY = y * 16;
                
                let color = '#ffffff';
                
                if (x === start.x && y === start.y) {
                    color = '#10b981';
                } else if (x === target.x && y === target.y) {
                    color = '#ef4444';
                } else if (cell.isWall) {
                    color = '#1f2937';
                } else if (cell.isPath) {
                    color = '#3b82f6';
                } else if (cell.isExplored) {
                    color = '#fbbf24';
                } else if (cell.isFrontier) {
                    color = '#a78bfa';
                }
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(pixelX, pixelY, 16, 16);
                
                if (cell.isWall) {
                    this.ctx.strokeStyle = '#374151';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(pixelX, pixelY, 16, 16);
                }
            }
        }
        
        this.renderPath(path);
    }

    renderPath(path) {
        if (path.length < 2) return;
        
        this.ctx.strokeStyle = '#1d4ed8';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(
            path[0].x * 16 + 8,
            path[0].y * 16 + 8
        );
        
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(
                path[i].x * 16 + 8,
                path[i].y * 16 + 8
            );
        }
        
        this.ctx.stroke();
    }

    destroy() {
        this.astar.stopPathfinding();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AStarController();
});
