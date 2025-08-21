class AStar {
    constructor(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.grid = [];
        this.start = { x: 0, y: 0 };
        this.target = { x: gridWidth - 1, y: gridHeight - 1 };
        this.path = [];
        this.exploredNodes = [];
        this.frontierNodes = [];
        this.isRunning = false;
        this.animationSpeed = 10;
        this.heuristicWeight = 1.0;
        this.currentHeuristic = 'manhattan';
        
        this.initializeGrid();
        this.setRandomStartTarget();
    }

    initializeGrid() {
        this.grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = {
                    x: x,
                    y: y,
                    isWall: false,
                    g: Infinity,
                    h: 0,
                    f: Infinity,
                    parent: null,
                    isExplored: false,
                    isFrontier: false,
                    isPath: false
                };
            }
        }
    }

    setRandomStartTarget() {
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            this.start = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
            
            this.target = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
            
            attempts++;
        } while (this.getDistance(this.start, this.target) < 15 && attempts < maxAttempts);
        
        this.grid[this.start.y][this.start.x].isWall = false;
        this.grid[this.target.y][this.target.x].isWall = false;
    }

    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    setHeuristic(heuristicName) {
        this.currentHeuristic = heuristicName;
    }

    setHeuristicWeight(weight) {
        this.heuristicWeight = weight;
    }

    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
    }

    toggleWall(x, y) {
        if ((x === this.start.x && y === this.start.y) || 
            (x === this.target.x && y === this.target.y)) {
            return;
        }
        this.grid[y][x].isWall = !this.grid[y][x].isWall;
    }

    canMoveStartTo(x, y) {
        return !this.grid[y][x].isWall && 
               (x !== this.target.x || y !== this.target.y);
    }

    canMoveTargetTo(x, y) {
        return !this.grid[y][x].isWall && 
               (x !== this.start.x || y !== this.start.y);
    }

    moveStartTo(x, y) {
        if (this.canMoveStartTo(x, y)) {
            this.start = { x, y };
            return true;
        }
        return false;
    }

    moveTargetTo(x, y) {
        if (this.canMoveTargetTo(x, y)) {
            this.target = { x, y };
            return true;
        }
        return false;
    }

    clearPath() {
        this.path = [];
        this.exploredNodes = [];
        this.frontierNodes = [];
        
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x].g = Infinity;
                this.grid[y][x].h = 0;
                this.grid[y][x].f = Infinity;
                this.grid[y][x].parent = null;
                this.grid[y][x].isExplored = false;
                this.grid[y][x].isFrontier = false;
                this.grid[y][x].isPath = false;
            }
        }
    }

    clearAll() {
        this.clearPath();
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x].isWall = false;
            }
        }
    }

    generateRandomMaze() {
        this.clearAll();
        this.setRandomStartTarget();
        
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if ((x === this.start.x && y === this.start.y) || 
                    (x === this.target.x && y === this.target.y)) {
                    continue;
                }
                
                if (Math.random() < 0.3) {
                    this.grid[y][x].isWall = true;
                }
            }
        }
    }

    getNeighbors(node) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
        ];
        
        for (const dir of directions) {
            const newX = node.x + dir.x;
            const newY = node.y + dir.y;
            
            if (newX >= 0 && newX < this.gridWidth && 
                newY >= 0 && newY < this.gridHeight && 
                !this.grid[newY][newX].isWall) {
                
                neighbors.push(this.grid[newY][newX]);
            }
        }
        
        return neighbors;
    }

    calculateHeuristic(node) {
        const heuristic = Heuristics.getHeuristic(this.currentHeuristic);
        return heuristic(node, this.target) * this.heuristicWeight;
    }

    async findPath(onProgress) {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.clearPath();
        
        const startTime = performance.now();
        const openSet = [];
        const closedSet = new Set();
        
        this.grid[this.start.y][this.start.x].g = 0;
        this.grid[this.start.y][this.start.x].h = this.calculateHeuristic(this.grid[this.start.y][this.start.x]);
        this.grid[this.start.y][this.start.x].f = this.grid[this.start.y][this.start.x].h;
        
        openSet.push(this.grid[this.start.y][this.start.x]);
        
        while (openSet.length > 0 && this.isRunning) {
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            
            if (current.x === this.target.x && current.y === this.target.y) {
                this.reconstructPath(current);
                const endTime = performance.now();
                this.isRunning = false;
                return {
                    success: true,
                    pathLength: this.path.length,
                    nodesExplored: this.exploredNodes.length,
                    executionTime: Math.round(endTime - startTime)
                };
            }
            
            closedSet.add(current);
            current.isExplored = true;
            this.exploredNodes.push(current);
            
            if (onProgress) {
                const currentTime = performance.now();
                const elapsedTime = Math.round(currentTime - startTime);
                await this.delay(this.animationSpeed);
                onProgress(elapsedTime);
            }
            
            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor)) continue;
                
                const tentativeG = current.g + 1;
                
                if (tentativeG < neighbor.g) {
                    neighbor.parent = current;
                    neighbor.g = tentativeG;
                    neighbor.h = this.calculateHeuristic(neighbor);
                    neighbor.f = neighbor.g + neighbor.h;
                    
                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                        neighbor.isFrontier = true;
                        this.frontierNodes.push(neighbor);
                    }
                }
            }
        }
        
        const endTime = performance.now();
        this.isRunning = false;
        return { 
            success: false, 
            pathLength: 0, 
            nodesExplored: this.exploredNodes.length, 
            executionTime: Math.round(endTime - startTime) 
        };
    }

    reconstructPath(endNode) {
        this.path = [];
        let current = endNode;
        
        while (current) {
            this.path.unshift(current);
            current.isPath = true;
            current = current.parent;
        }
    }

    stopPathfinding() {
        this.isRunning = false;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getGrid() {
        return this.grid;
    }

    getStart() {
        return this.start;
    }

    getTarget() {
        return this.target;
    }

    getPath() {
        return this.path;
    }

    getExploredNodes() {
        return this.exploredNodes;
    }

    getFrontierNodes() {
        return this.frontierNodes;
    }

    getMazeState() {
        const walls = [];
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x].isWall) {
                    walls.push({ x, y });
                }
            }
        }
        
        return {
            start: { ...this.start },
            target: { ...this.target },
            walls: walls
        };
    }

    setMazeState(mazeState) {
        this.clearAll();
        
        if (mazeState.start) {
            this.start = { ...mazeState.start };
        }
        
        if (mazeState.target) {
            this.target = { ...mazeState.target };
        }
        
        if (mazeState.walls) {
            for (const wall of mazeState.walls) {
                if (wall.x >= 0 && wall.x < this.gridWidth && 
                    wall.y >= 0 && wall.y < this.gridHeight) {
                    this.grid[wall.y][wall.x].isWall = true;
                }
            }
        }
    }
}
