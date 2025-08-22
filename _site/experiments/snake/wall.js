import * as THREE from "three";
import { Block } from "./block.js";

export class Wall extends Block {
  constructor(x, y) {
    super(x, y, 20);
  }

  create3DMesh() {
    const geometry = new THREE.BoxGeometry(
      this.size,
      this.size * 1.5,
      this.size
    );
    const material = new THREE.MeshPhongMaterial({
      color: 0x654321,
      shininess: 50,
      specular: 0x333333,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(this.x, this.size * 0.75, this.y);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    return this.mesh;
  }

  update3DPosition() {
    if (this.mesh) {
      this.mesh.position.set(this.x, this.size * 0.75, this.y);
    }
  }
}
