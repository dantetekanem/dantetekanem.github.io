import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { Block } from "./block.js";

export class Snake extends Block {
  constructor(x, y) {
    super(x, y, 20);
    const head = new Block(x, y, 20);
    const tail = new Block(x - 20, y, 20);
    head.rotation = 0;
    tail.rotation = 0;
    this.body = [head, tail];
    this.direction = { x: 1, y: 0 };
    this.rotation = 0;
    this.targetRotation = 0;
    this.speed = 80;
    this.lastMove = 0;
    this.growing = false;
    this.rotationSpeed = 0.15;
    this.turnStep = Math.PI / 16;
    this.is3D = false;
  }

  update(deltaTime) {
    this.lastMove += deltaTime;

    if (this.lastMove >= this.speed) {
      this.move();
      this.lastMove = 0;
    }

    this.body.forEach((segment) => segment.update(deltaTime));
  }

  move() {
    const head = this.body[0];
    let newX, newY;

    if (this.is3D) {
      this.rotation +=
        (this.targetRotation - this.rotation) * this.rotationSpeed;
      newX = head.x + Math.cos(this.rotation) * this.size;
      newY = head.y + Math.sin(this.rotation) * this.size;
      this.updateDirectionFromRotation();
    } else {
      newX = head.x + this.direction.x * this.size;
      newY = head.y + this.direction.y * this.size;
      this.updateRotationFromDirection();
    }

    const newHead = new Block(newX, newY, this.size);
    newHead.rotation = this.rotation;

    this.body.unshift(newHead);

    if (!this.growing) {
      this.body.pop();
    } else {
      this.growing = false;
    }

    this.updateSegmentRotations();
  }

  turn(direction) {
    this.targetRotation += direction * this.turnStep;
  }

  turnFull(direction) {
    this.targetRotation += (direction * Math.PI) / 2;
    this.rotation = this.targetRotation;
    this.updateDirectionFromRotation();
  }

  updateSegmentRotations() {
    for (let i = 1; i < this.body.length; i++) {
      const current = this.body[i];
      const previous = this.body[i - 1];

      const dx = previous.x - current.x;
      const dy = previous.y - current.y;
      current.rotation = Math.atan2(dy, dx);
    }
  }

  updateDirectionFromRotation() {
    this.direction.x = Math.cos(this.rotation);
    this.direction.y = Math.sin(this.rotation);
  }

  updateRotationFromDirection() {
    this.rotation = Math.atan2(this.direction.y, this.direction.x);
    this.targetRotation = this.rotation;
  }

  setMode(is3D) {
    this.is3D = is3D;
    if (is3D) {
      this.updateRotationFromDirection();
    } else {
      this.updateDirectionFromRotation();
    }
  }

  changeDirection(newDirection) {
    let rotationChange = 0;

    if (newDirection.x === 1) rotationChange = 0;
    else if (newDirection.x === -1) rotationChange = Math.PI;
    else if (newDirection.y === -1) rotationChange = -Math.PI / 2;
    else if (newDirection.y === 1) rotationChange = Math.PI / 2;

    this.targetRotation = rotationChange;
  }

  grow() {
    this.growing = true;
  }

  checkCollision() {
    const head = this.body[0];

    for (let i = 1; i < this.body.length; i++) {
      if (head.collidesWith(this.body[i])) {
        return true;
      }
    }

    return false;
  }

  checkWallCollision(gridWidth, gridHeight) {
    const head = this.body[0];
    return (
      head.x < 0 ||
      head.x >= gridWidth * this.size ||
      head.y < 0 ||
      head.y >= gridHeight * this.size
    );
  }

  create3DMeshes() {
    this.meshes = [];
    this.body.forEach((segment, index) => {
      const geometry = new RoundedBoxGeometry(
        segment.size,
        segment.size,
        segment.size,
        3,
        2
      );
      const material = new THREE.MeshPhongMaterial({
        color: index === 0 ? 0x00d4aa : 0x00b894,
        shininess: 100,
        specular: index === 0 ? 0x00b894 : 0x009688,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(segment.x, segment.size / 2, segment.y);
      mesh.rotation.y = segment.rotation;

      if (index === 0) {
        const eyeGeometry = new THREE.SphereGeometry(2, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x2e7d32 });
        const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye.position.set(0, 0, segment.size / 2 + 1);
        mesh.add(eye);
      }

      this.meshes.push(mesh);
    });

    return this.meshes;
  }

  update3DPositions() {
    if (!this.meshes || this.meshes.length === 0) return;

    if (this.meshes.length !== this.body.length) {
      return;
    }

    this.body.forEach((segment, index) => {
      if (this.meshes[index] && segment) {
        const targetPos = new THREE.Vector3(
          segment.x,
          segment.size / 2,
          segment.y
        );
        this.meshes[index].position.lerp(targetPos, 0.45);

        const current = this.meshes[index].rotation.y;
        let diff =
          ((segment.rotation - current + Math.PI) % (Math.PI * 2)) - Math.PI;
        this.meshes[index].rotation.y = current + diff * 0.5;
      }
    });
  }

  reset(x, y) {
    const head = new Block(x, y, 20);
    const tail = new Block(x - 20, y, 20);
    head.rotation = 0;
    tail.rotation = 0;
    this.body = [head, tail];
    this.direction = { x: 1, y: 0 };
    this.rotation = 0;
    this.targetRotation = 0;
    this.lastMove = 0;
    this.growing = false;
  }
}
