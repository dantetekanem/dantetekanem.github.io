import * as THREE from "three";
import { Block } from "./block.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export class Apple extends Block {
  constructor(x, y) {
    super(x, y, 20);
    this.pulse = 0;
    this.pulseSpeed = 0.002;
    this.rotationSpeed = 0.02;
    this.lifespan = Math.random() * 10000 + 5000;
    this.age = 0;
  }

  update(deltaTime) {
    this.pulse += this.pulseSpeed * deltaTime;
    this.rotation += this.rotationSpeed * deltaTime;
    this.age += deltaTime;
  }

  isExpired() {
    return this.age >= this.lifespan;
  }

  create3DMesh() {
    const geometry = new THREE.SphereGeometry(this.size / 2, 16, 16);
    this.material = new THREE.MeshPhongMaterial({
      color: 0xff4444,
      shininess: 100,
      specular: 0xcc0000,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(this.x, 0, this.y);

    const stemGeometry = new THREE.CylinderGeometry(1, 1, 8, 8);
    const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = this.size / 2 + 4;
    this.mesh.add(stem);

    const leafGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
    const leafMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.position.y = this.size / 2 + 10;
    this.mesh.add(leaf);

    return this.mesh;
  }

  update3DPosition() {
    if (this.mesh) {
      this.mesh.position.set(this.x, 0, this.y);
      this.mesh.rotation.y = this.rotation;
      const pulseScale = 1 + Math.sin(this.pulse) * 0.25;
      this.mesh.scale.setScalar(pulseScale);
    }
  }

  updateGlow(isNearSnake) {
    if (this.material) {
      if (isNearSnake) {
        this.material.emissive.setHex(0x004400);
        this.material.emissiveIntensity = 0.3;
      } else {
        this.material.emissive.setHex(0x000000);
        this.material.emissiveIntensity = 0;
      }
    }
  }

  respawn(gridWidth, gridHeight, snake, otherApples = []) {
    let newX, newY;
    let attempts = 0;

    do {
      newX = Math.floor(Math.random() * gridWidth) * this.size;
      newY = Math.floor(Math.random() * gridHeight) * this.size;
      attempts++;
    } while (
      (this.isOnSnake(newX, newY, snake) ||
        this.isOnApples(newX, newY, otherApples)) &&
      attempts < 100
    );

    this.setPosition(newX, newY);
    this.pulse = 0;
  }

  isOnSnake(x, y, snake) {
    const minDistance = this.size * 2.5;
    return snake.body.some(
      (segment) =>
        Math.abs(segment.x - x) < minDistance &&
        Math.abs(segment.y - y) < minDistance
    );
  }

  isOnApples(x, y, otherApples) {
    const minDistance = this.size * 3;
    return otherApples.some(
      (apple) =>
        Math.abs(apple.x - x) < minDistance &&
        Math.abs(apple.y - y) < minDistance
    );
  }

  collidesWithSnake(snake) {
    const hitboxSize = this.size * 1.35;
    const head = snake.body[0];
    return (
      Math.abs(this.x - head.x) < hitboxSize &&
      Math.abs(this.y - head.y) < hitboxSize
    );
  }
}
