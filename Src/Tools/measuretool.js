import * as THREE from 'three';

export class MeasureTool {
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.enabled = false;
    this.points = [];
    this.line = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.clickHandler = this.onClick.bind(this);
  }

  enable() {
    this.enabled = true;
    this.points = [];
    this.clearLine();
    this.domElement.addEventListener('click', this.clickHandler);
  }

  disable() {
    this.enabled = false;
    this.domElement.removeEventListener('click', this.clickHandler);
    this.clearLine();
  }

  clearLine() {
    if (this.line) {
      this.scene.remove(this.line);
      this.line.geometry.dispose();
      this.line.material.dispose();
      this.line = null;
    }
  }

  onClick(event) {
    if (!this.enabled) return;

    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      this.points.push(hitPoint);

      if (this.points.length === 2) {
        this.drawLine(this.points[0], this.points[1]);
        const distance = this.points[0].distanceTo(this.points[1]);
        
        const event = new CustomEvent('measure-complete', { detail: { distance: distance.toFixed(2) } });
        window.dispatchEvent(event);

        this.points = [];
      }
    }
  }

  drawLine(p1, p2) {
    this.clearLine();
    const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const material = new THREE.LineBasicMaterial({ color: 0x10B981, linewidth: 3, depthTest: false });
    this.line = new THREE.Line(geometry, material);
    this.line.renderOrder = 999;
    this.scene.add(this.line);
  }
}