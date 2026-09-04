import * as THREE from 'three';

export class DemoHouse {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.colliders = [];
    this.build();
  }

  build() {
    // Wall Material
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe0dacf, roughness: 0.6 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccee, transparent: true, opacity: 0.4, roughness: 0.1 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.7 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });

    // Main House Structure (Ground Floor)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(10, 3, 0.2), wallMat);
    backWall.position.set(0, 1.5, -5);
    this.addStructure(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 10), wallMat);
    leftWall.position.set(-5, 1.5, 0);
    this.addStructure(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 10), wallMat);
    rightWall.position.set(5, 1.5, 0);
    this.addStructure(rightWall);

    // Front Wall with Doorway and Windows
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3, 0.2), wallMat);
    frontWallLeft.position.set(-3.25, 1.5, 5);
    this.addStructure(frontWallLeft);

    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3, 0.2), wallMat);
    frontWallRight.position.set(2.75, 1.5, 5);
    this.addStructure(frontWallRight);

    const frontWallTop = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 0.2), wallMat);
    frontWallTop.position.set(-0.5, 2.6, 5);
    this.addStructure(frontWallTop);

    // Architectural Door
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 0.1), doorMat);
    door.position.set(-0.5, 1.1, 5);
    this.group.add(door);

    // Windows with Glass Panels
    const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 0.05), glassMat);
    windowGlass.position.set(2.5, 1.5, 5);
    this.group.add(windowGlass);

    const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.6, 0.1), frameMat);
    windowFrame.position.set(2.5, 1.5, 5);
    this.group.add(windowFrame);

    // Roof Structure
    const roof = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.3, 10.8), roofMat);
    roof.position.set(0, 3.15, 0);
    this.addStructure(roof);

    // Garden & Architectural Landscape
    this.buildGarden();

    this.scene.add(this.group);
  }

  addStructure(mesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.group.add(mesh);
    this.colliders.push(mesh);
  }

  buildGarden() {
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e00 });
    const leavesGeo = new THREE.ConeGeometry(1.2, 3, 8);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x1e4d2b, roughness: 0.8 });

    const treePositions = [
      { x: -7, z: -3 }, { x: 7, z: -4 }, { x: -8, z: 4 }, { x: 8, z: 6 }
    ];

    treePositions.forEach(pos => {
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(pos.x, 1, pos.z);
      trunk.castShadow = true;

      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.set(pos.x, 3, pos.z);
      leaves.castShadow = true;

      this.group.add(trunk);
      this.group.add(leaves);
      this.colliders.push(trunk);
    });
  }

  destroy() {
    this.scene.remove(this.group);
  }
}