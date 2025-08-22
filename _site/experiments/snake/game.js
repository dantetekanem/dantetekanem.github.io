import * as THREE from "three";
import { Snake } from "./snake.js";
import { Apple } from "./item.js";
import { Wall } from "./wall.js";

export class Game {
  constructor() {
    this.container = document.getElementById("gameCanvas");
    this.is3D = false;
    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.lastTime = 0;

    this.APPLE_PERCENTAGE = 0.01;
    this.WALL_PERCENTAGE = 0.005;

    this.updateGridDimensions();
    this.calculateMaxObjects();

    const centerX = (this.gridWidth * 20) / 2;
    const centerY = (this.gridHeight * 20) / 2;
    this.snake = new Snake(centerX, centerY);
    this.apples = [];
    this.walls = [];
    this.lastAppleSpawn = 0;
    this.lastWallSpawn = 0;
    this.appleSpawnInterval = Math.random() * 3000 + 1000;
    this.wallSpawnInterval = Math.random() * 5000 + 3000;

    this.scene = null;
    this.camera = null;
    this.orthoCamera = null;
    this.perspCamera = null;
    this.activeCamera = null;
    this.renderer = null;
    this.light = null;
    this.snakeMeshes = [];
    this.appleMeshes = [];
    this.wallMeshes = [];

    this.setupEventListeners();
    this.setup3D();
    this.spawnApples();
    this.spawnWalls();
    this.startRenderLoop();
  }

  updateGridDimensions() {
    const cellSize = 20;
    this.gridWidth = Math.floor(window.innerWidth / cellSize);
    this.gridHeight = Math.floor(window.innerHeight / cellSize);
    const snakeSize = this.snake ? this.snake.size : 20;
    this.gameWidth = this.gridWidth * snakeSize;
    this.gameHeight = this.gridHeight * snakeSize;
  }

  calculateMaxObjects() {
    const totalBlocks = this.gridWidth * this.gridHeight;
    this.maxApples = Math.max(
      1,
      Math.floor(totalBlocks * this.APPLE_PERCENTAGE)
    );
    this.maxWalls = Math.max(1, Math.floor(totalBlocks * this.WALL_PERCENTAGE));
  }

  setupEventListeners() {
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));

    document
      .getElementById("startBtn")
      .addEventListener("click", () => this.start());
    document.getElementById("stopBtn").addEventListener("click", () => {
      this.stop();
      this.reset();
    });
    document
      .getElementById("restartBtn")
      .addEventListener("click", () => this.hideGameOver());
  }

  setup3D() {
    try {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x1a1a1a);

      const aspect = window.innerWidth / window.innerHeight;
      const gameWidth = this.gridWidth * this.snake.size;
      const gameHeight = this.gridHeight * this.snake.size;

      const frustumHeight = gameHeight;
      const frustumWidth = frustumHeight * aspect;

      this.orthoCamera = new THREE.OrthographicCamera(
        -frustumWidth / 2,
        frustumWidth / 2,
        frustumHeight / 2,
        -frustumHeight / 2,
        0.1,
        2000
      );
      this.orthoCamera.position.set(gameWidth / 2, 800, gameHeight / 2);
      this.orthoCamera.lookAt(gameWidth / 2, 0, gameHeight / 2);

      this.perspCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 2000);
      const centerX = gameWidth / 2;
      const centerY = gameHeight / 2;
      this.perspCamera.position.set(centerX, 25, centerY - 30);
      this.perspCamera.lookAt(centerX, 0, centerY);

      this.activeCamera = this.orthoCamera;

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.container.appendChild(this.renderer.domElement);

      this.light = new THREE.DirectionalLight(0xffffff, 1);
      this.light.position.set(400, 800, 400);
      this.light.castShadow = true;
      this.light.shadow.mapSize.width = 2048;
      this.light.shadow.mapSize.height = 2048;
      this.scene.add(this.light);

      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      this.scene.add(ambientLight);

      this.createGround();
      this.createGrid();
      this.createBoundaries();
      this.create3DObjects();

      window.addEventListener("resize", () => this.onWindowResize());
    } catch (error) {
      console.warn("3D setup failed:", error);
    }
  }

  onWindowResize() {
    if (this.renderer) {
      this.updateGridDimensions();
      this.calculateMaxObjects();

      const aspect = window.innerWidth / window.innerHeight;
      if (this.perspCamera) {
        this.perspCamera.aspect = aspect;
        this.perspCamera.updateProjectionMatrix();
      }
      if (this.orthoCamera) {
        const gameWidth = this.gridWidth * this.snake.size;
        const gameHeight = this.gridHeight * this.snake.size;

        const frustumHeight = gameHeight;
        const frustumWidth = frustumHeight * aspect;

        this.orthoCamera.left = -frustumWidth / 2;
        this.orthoCamera.right = frustumWidth / 2;
        this.orthoCamera.top = frustumHeight / 2;
        this.orthoCamera.bottom = -frustumHeight / 2;
        this.orthoCamera.position.set(gameWidth / 2, 800, gameHeight / 2);
        this.orthoCamera.lookAt(gameWidth / 2, 0, gameHeight / 2);
        this.orthoCamera.updateProjectionMatrix();
      }
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  createGrid() {
    const gameWidth = this.gridWidth * this.snake.size;
    const gameHeight = this.gridHeight * this.snake.size;

    const gridHelper = new THREE.GridHelper(
      Math.max(gameWidth, gameHeight),
      Math.max(this.gridWidth, this.gridHeight),
      0x2a2a2a,
      0x1e1e1e
    );
    gridHelper.position.set(gameWidth / 2, 0, gameHeight / 2);
    gridHelper.material.opacity = 0.6;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  createGround() {
    const gameWidth = this.gridWidth * this.snake.size;
    const gameHeight = this.gridHeight * this.snake.size;
    const groundGeo = new THREE.PlaneGeometry(gameWidth, gameHeight);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 1,
      metalness: 0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(gameWidth / 2, -0.5, gameHeight / 2);
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createBoundaries() {
    const gameWidth = this.gridWidth * this.snake.size;
    const gameHeight = this.gridHeight * this.snake.size;

    const material = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 3,
    });

    const points = [];
    points.push(new THREE.Vector3(0, 2, 0));
    points.push(new THREE.Vector3(gameWidth, 2, 0));
    points.push(new THREE.Vector3(gameWidth, 2, gameHeight));
    points.push(new THREE.Vector3(0, 2, gameHeight));
    points.push(new THREE.Vector3(0, 2, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const boundary = new THREE.Line(geometry, material);
    this.scene.add(boundary);
  }

  spawnApples() {
    for (let i = this.apples.length; i < this.maxApples; i++) {
      const apple = new Apple(0, 0);
      apple.respawn(this.gridWidth, this.gridHeight, this.snake, this.apples);
      this.apples.push(apple);
      this.addApple3D(apple);
    }
  }

  removeExpiredApples() {
    for (let i = this.apples.length - 1; i >= 0; i--) {
      if (this.apples[i].isExpired()) {
        const expiredApple = this.apples[i];
        if (expiredApple.mesh3D) {
          this.scene.remove(expiredApple.mesh3D);
          const meshIndex = this.appleMeshes.indexOf(expiredApple.mesh3D);
          if (meshIndex > -1) {
            this.appleMeshes.splice(meshIndex, 1);
          }
        }
        this.apples.splice(i, 1);
      }
    }
  }

  randomlySpawnApples(deltaTime) {
    this.lastAppleSpawn += deltaTime;

    if (
      this.lastAppleSpawn >= this.appleSpawnInterval &&
      this.apples.length < this.maxApples
    ) {
      const apple = new Apple(0, 0);
      apple.respawn(this.gridWidth, this.gridHeight, this.snake, this.apples);
      this.apples.push(apple);
      this.addApple3D(apple);

      this.lastAppleSpawn = 0;
      this.appleSpawnInterval = Math.random() * 3000 + 1000;
    }
  }

  spawnWalls() {
    for (let i = this.walls.length; i < this.maxWalls; i++) {
      let wallX, wallY;
      let attempts = 0;

      do {
        wallX = Math.floor(Math.random() * this.gridWidth) * 20;
        wallY = Math.floor(Math.random() * this.gridHeight) * 20;
        attempts++;
      } while (this.isPositionOccupied(wallX, wallY) && attempts < 100);

      if (attempts < 100) {
        const wall = new Wall(wallX, wallY);
        this.walls.push(wall);
        this.addWall3D(wall);
      }
    }
  }

  isPositionOccupied(x, y) {
    const snakeTolerance = 20 * 2.5;
    const appleTolerance = 20 * 2;
    const wallTolerance = 20 * 1.5;

    for (const segment of this.snake.body) {
      if (
        Math.abs(segment.x - x) < snakeTolerance &&
        Math.abs(segment.y - y) < snakeTolerance
      ) {
        return true;
      }
    }

    for (const apple of this.apples) {
      if (
        Math.abs(apple.x - x) < appleTolerance &&
        Math.abs(apple.y - y) < appleTolerance
      ) {
        return true;
      }
    }

    for (const wall of this.walls) {
      if (
        Math.abs(wall.x - x) < wallTolerance &&
        Math.abs(wall.y - y) < wallTolerance
      ) {
        return true;
      }
    }

    return false;
  }

  create3DObjects() {
    this.snakeMeshes = this.snake.create3DMeshes();
    this.snakeMeshes.forEach((mesh) => this.scene.add(mesh));

    this.appleMeshes = [];
    this.apples.forEach((apple) => {
      const appleMesh = apple.create3DMesh();
      this.appleMeshes.push(appleMesh);
      this.scene.add(appleMesh);
    });

    this.wallMeshes = [];
    this.walls.forEach((wall) => {
      const wallMesh = wall.create3DMesh();
      this.wallMeshes.push(wallMesh);
      this.scene.add(wallMesh);
    });
  }

  handleKeyPress(e) {
    if (e.code === "Space") {
      e.preventDefault();
      if (!this.isRunning) {
        const gameOverScreen = document.getElementById("gameOverScreen");
        if (!gameOverScreen.classList.contains("hidden")) {
          this.hideGameOver();
        }
        this.start();
      } else {
        this.togglePause();
      }
      return;
    }

    if (e.code === "KeyF") {
      e.preventDefault();
      this.toggle3DMode();
      return;
    }

    if (!this.isRunning || this.isPaused) return;

    if (this.is3D) {
      if (e.code === "ArrowLeft") {
        this.snake.turnFull(-1);
      } else if (e.code === "ArrowRight") {
        this.snake.turnFull(1);
      }
    } else {
      const currentDir = this.snake.direction;
      let newDirection = null;

      if (e.code === "ArrowUp" && currentDir.y !== 1) {
        newDirection = { x: 0, y: -1 };
      } else if (e.code === "ArrowDown" && currentDir.y !== -1) {
        newDirection = { x: 0, y: 1 };
      } else if (e.code === "ArrowLeft" && currentDir.x !== 1) {
        newDirection = { x: -1, y: 0 };
      } else if (e.code === "ArrowRight" && currentDir.x !== -1) {
        newDirection = { x: 1, y: 0 };
      }

      if (newDirection) {
        this.snake.direction = newDirection;
      }
    }
  }

  toggle3DMode() {
    this.is3D = !this.is3D;
    this.snake.setMode(this.is3D);
    document.getElementById("mode").textContent = this.is3D ? "3D" : "2D";

    if (this.is3D) {
      this.activeCamera = this.perspCamera;
      const head = this.snake.body[0];

      const cameraHeight = 40;

      this.perspCamera.position.set(head.x, cameraHeight, head.y);

      const lookAtX = head.x + this.snake.direction.x * 50;
      const lookAtZ = head.y + this.snake.direction.y * 50;
      this.perspCamera.lookAt(lookAtX, 0, lookAtZ);
    } else {
      this.activeCamera = this.orthoCamera;
      const gameWidth = this.gridWidth * this.snake.size;
      const gameHeight = this.gridHeight * this.snake.size;

      this.orthoCamera.position.set(gameWidth / 2, 800, gameHeight / 2);
      this.orthoCamera.lookAt(gameWidth / 2, 0, gameHeight / 2);
    }
  }

  start() {
    this.isRunning = true;
    this.gameLoop();
  }

  stop() {
    this.isRunning = false;
  }

  reset() {
    this.score = 0;
    const centerX = (this.gridWidth * 20) / 2;
    const centerY = (this.gridHeight * 20) / 2;
    this.snake.reset(centerX, centerY);
    this.apples = [];
    this.walls = [];
    this.lastAppleSpawn = 0;
    this.lastWallSpawn = 0;
    this.appleSpawnInterval = Math.random() * 3000 + 1000;
    this.wallSpawnInterval = Math.random() * 5000 + 3000;
    this.spawnApples();
    this.spawnWalls();
    this.updateScore();
    this.recreate3DObjects();
  }

  recreate3DObjects() {
    this.snakeMeshes.forEach((mesh) => {
      if (mesh) this.scene.remove(mesh);
    });
    this.snakeMeshes = [];

    this.appleMeshes.forEach((mesh) => {
      if (mesh) this.scene.remove(mesh);
    });
    this.appleMeshes = [];

    this.wallMeshes.forEach((mesh) => {
      if (mesh) this.scene.remove(mesh);
    });
    this.wallMeshes = [];

    this.create3DObjects();
  }

  update(deltaTime) {
    if (!this.isRunning) return;

    try {
      this.snake.update(deltaTime);
      this.apples.forEach((apple) => {
        apple.update(deltaTime);
        const isNearSnake = apple.collidesWithSnake(this.snake);
        apple.updateGlow(isNearSnake);
      });

      this.removeExpiredApples();
      this.randomlySpawnApples(deltaTime);

      if (this.snake.meshes && this.snake.meshes.length > 0) {
        this.snake.update3DPositions();
      }

      this.apples.forEach((apple, index) => {
        if (this.appleMeshes[index]) {
          apple.update3DPosition();
        }
      });

      this.walls.forEach((wall, index) => {
        if (this.wallMeshes[index]) {
          wall.update3DPosition();
        }
      });

      this.checkCollisions();
      this.updateCamera();
    } catch (error) {
      console.warn("Update error:", error);
    }
  }

  checkCollisions() {
    const head = this.snake.body[0];

    for (let i = this.apples.length - 1; i >= 0; i--) {
      if (this.apples[i].collidesWithSnake(this.snake)) {
        this.snake.grow();
        const eatenApple = this.apples[i];

        this.createFloatingScore(eatenApple.x, eatenApple.y, 10);

        if (eatenApple.mesh3D) {
          this.scene.remove(eatenApple.mesh3D);
          const meshIndex = this.appleMeshes.indexOf(eatenApple.mesh3D);
          if (meshIndex > -1) {
            this.appleMeshes.splice(meshIndex, 1);
          }
        }
        this.apples.splice(i, 1);
        this.score += 10;
        this.updateScore();
        this.spawnApples();

        setTimeout(() => {
          this.updateSnake3D();
        }, 100);
        break;
      }
    }

    if (this.snake.checkCollision()) {
      this.gameOver();
      return;
    }

    for (const wall of this.walls) {
      if (head.collidesWith(wall)) {
        this.gameOver();
        return;
      }
    }

    const maxX = this.gridWidth * this.snake.size;
    const maxY = this.gridHeight * this.snake.size;
    if (head.x < 0 || head.x >= maxX || head.y < 0 || head.y >= maxY) {
      this.gameOver();
      return;
    }
  }

  addApple3D(apple) {
    const appleMesh = apple.create3DMesh();
    apple.mesh3D = appleMesh;
    this.appleMeshes.push(appleMesh);
    this.scene.add(appleMesh);
  }

  addWall3D(wall) {
    const wallMesh = wall.create3DMesh();
    wall.mesh3D = wallMesh;
    this.wallMeshes.push(wallMesh);
    this.scene.add(wallMesh);
  }

  updateApples3D() {
    this.appleMeshes.forEach((mesh) => {
      if (mesh) this.scene.remove(mesh);
    });
    this.appleMeshes = [];

    this.apples.forEach((apple) => {
      this.addApple3D(apple);
    });
  }

  updateWalls3D() {
    this.wallMeshes.forEach((mesh) => {
      if (mesh) this.scene.remove(mesh);
    });
    this.wallMeshes = [];

    this.walls.forEach((wall) => {
      this.addWall3D(wall);
    });
  }

  updateSnake3D() {
    this.snakeMeshes.forEach((mesh) => {
      if (mesh) this.scene.remove(mesh);
    });
    this.snakeMeshes = [];

    this.snakeMeshes = this.snake.create3DMeshes();
    this.snakeMeshes.forEach((mesh) => this.scene.add(mesh));
  }

  updateCamera() {
    if (this.is3D && this.snake.body.length > 0) {
      const head = this.snake.body[0];
      const cameraHeight = 100;
      const backOffset = 45;

      const cameraX = head.x - this.snake.direction.x * backOffset;
      const cameraZ = head.y - this.snake.direction.y * backOffset;

      this.perspCamera.position.set(cameraX, cameraHeight, cameraZ);

      const lookAtX = head.x + this.snake.direction.x * 80;
      const lookAtZ = head.y + this.snake.direction.y * 80;
      this.perspCamera.lookAt(lookAtX, 0, lookAtZ);
    }
  }

  render() {
    if (this.renderer && this.scene && this.activeCamera) {
      this.renderer.render(this.scene, this.activeCamera);
    }
  }

  cameraTransition(
    camera,
    targetPos,
    targetLookAt,
    startPosOverride,
    startLookOverride
  ) {
    const duration = 300;
    const steps = 30;
    let step = 0;
    const startPos = startPosOverride
      ? startPosOverride.clone()
      : camera.position.clone();
    const startLook = new THREE.Vector3();
    if (startLookOverride) {
      startLook.copy(startLookOverride.clone().sub(startPos).normalize());
    } else {
      camera.getWorldDirection(startLook);
    }
    const startLookPoint = startPos.clone().add(startLook);

    const tick = () => {
      step++;
      const t = step / steps;
      camera.position.lerpVectors(startPos, targetPos, t);
      const lookPoint = startLookPoint.clone().lerp(targetLookAt, t);
      camera.lookAt(lookPoint);
      if (step < steps) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  startRenderLoop() {
    const renderLoop = () => {
      this.render();
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }

  updateScore() {
    document.getElementById("score").textContent = this.score;
  }

  gameOver() {
    this.isRunning = false;
    document.getElementById("finalScore").textContent = this.score;
    document.getElementById("gameOverScreen").classList.remove("hidden");
  }

  hideGameOver() {
    document.getElementById("gameOverScreen").classList.add("hidden");
    this.reset();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pausedScreen = document.getElementById("pausedScreen");

    if (this.isPaused) {
      pausedScreen.classList.remove("hidden");
    } else {
      pausedScreen.classList.add("hidden");
    }
  }

  createFloatingScore(x, y, points) {
    const scoreElement = document.createElement("div");
    scoreElement.className = "floating-score";
    scoreElement.textContent = `+${points}`;

    const rect = this.container.getBoundingClientRect();
    const relativeX = (x / this.gameWidth) * rect.width;
    const relativeY = (y / this.gameHeight) * rect.height;

    scoreElement.style.left = `${rect.left + relativeX}px`;
    scoreElement.style.top = `${rect.top + relativeY}px`;

    document.body.appendChild(scoreElement);

    setTimeout(() => {
      if (scoreElement.parentNode) {
        scoreElement.parentNode.removeChild(scoreElement);
      }
    }, 2000);

    setTimeout(() => {
      this.animateScoreUpdate();
    }, 1000);
  }

  animateScoreUpdate() {
    const scoreElement = document.getElementById("score");
    scoreElement.classList.add("score-update");

    setTimeout(() => {
      scoreElement.classList.remove("score-update");
    }, 500);
  }

  gameLoop(currentTime = 0) {
    if (!this.isRunning) return;

    if (this.isPaused) {
      requestAnimationFrame((time) => this.gameLoop(time));
      return;
    }

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((time) => this.gameLoop(time));
  }
}
