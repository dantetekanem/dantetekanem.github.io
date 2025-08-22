import * as THREE from "three";

export class Block {
  constructor(x, y, size = 20) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.rotation = 0;
    this.z = 0;
    this.mesh = null;
  }

  update(deltaTime) {}

  create3DMesh() {
    const geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00d4aa,
      shininess: 100,
      specular: 0x00b894,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(this.x, this.size / 2, this.y);
    return this.mesh;
  }

  update3DPosition() {
    if (this.mesh) {
      this.mesh.position.set(this.x, this.size / 2, this.y);
      this.mesh.rotation.y = this.rotation;
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setRotation(rotation) {
    this.rotation = rotation;
  }

  setZ(z) {
    this.z = z;
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + this.size,
      top: this.y,
      bottom: this.y + this.size,
    };
  }

  collidesWith(other) {
    const halfSize = this.size / 2;
    const otherHalfSize = other.size / 2;

    const thisLeft = this.x - halfSize;
    const thisRight = this.x + halfSize;
    const thisTop = this.y - halfSize;
    const thisBottom = this.y + halfSize;

    const otherLeft = other.x - otherHalfSize;
    const otherRight = other.x + otherHalfSize;
    const otherTop = other.y - otherHalfSize;
    const otherBottom = other.y + otherHalfSize;

    return (
      thisRight > otherLeft &&
      thisLeft < otherRight &&
      thisBottom > otherTop &&
      thisTop < otherBottom
    );
  }
}
