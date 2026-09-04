import * as THREE from 'three';

export class FirstPersonControls {
  constructor(camera, domElement, colliders = []) {
    this.camera = camera;
    this.domElement = domElement;
    this.colliders = colliders;
    this.enabled = false;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.pitch = 0;
    this.yaw = 0;

    this.joystickVector = new THREE.Vector2(0, 0);

    this.initKeyboard();
    this.initTouch();
  }

  enable() {
    this.enabled = true;
    this.camera.position.set(0, 1.6, 12);
  }

  disable() {
    this.enabled = false;
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.moveForward = true; break;
        case 'KeyS': case 'ArrowDown': this.moveBackward = true; break;
        case 'KeyA': case 'ArrowLeft': this.moveLeft = true; break;
        case 'KeyD': case 'ArrowRight': this.moveRight = true; break;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!this.enabled) return;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.moveForward = false; break;
        case 'KeyS': case 'ArrowDown': this.moveBackward = false; break;
        case 'KeyA': case 'ArrowLeft': this.moveLeft = false; break;
        case 'KeyD': case 'ArrowRight': this.moveRight = false; break;
      }
    });
  }

  initTouch() {
    let touchStartX = 0;
    let touchStartY = 0;

    this.domElement.addEventListener('touchstart', (e) => {
      if (!this.enabled || e.touches.length > 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });

    this.domElement.addEventListener('touchmove', (e) => {
      if (!this.enabled || e.touches.length > 1) return;
      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;

      this.yaw -= deltaX * 0.003;
      this.pitch -= deltaY * 0.003;
      this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });
  }

  setJoystickInput(x, y) {
    this.joystickVector.set(x, y);
  }

  update(delta) {
    if (!this.enabled) return;

    // Apply rotation pitch and yaw
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.x = this.pitch;
    euler.y = this.yaw;
    this.camera.quaternion.setFromEuler(euler);

    // Calculate movement speeds
    const speed = 4.0;
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;

    const zMove = Number(this.moveForward) - Number(this.moveBackward) + this.joystickVector.y;
    const xMove = Number(this.moveRight) - Number(this.moveLeft) + this.joystickVector.x;

    this.direction.z = zMove;
    this.direction.x = xMove;
    this.direction.normalize();

    if (this.moveForward || this.moveBackward || this.joystickVector.y !== 0) {
      this.velocity.z -= this.direction.z * speed * 10.0 * delta;
    }
    if (this.moveLeft || this.moveRight || this.joystickVector.x !== 0) {
      this.velocity.x -= this.direction.x * speed * 10.0 * delta;
    }

    // Position updates with basic collision bounding checks
    const oldPos = this.camera.position.clone();
    this.camera.translateX(-this.velocity.x * delta);
    this.camera.translateZ(this.velocity.z * delta);
    this.camera.position.y = 1.6; // Keep height fixed on human level

    // Simple Axis-Aligned Box Collision Prevention
    const playerBox = new THREE.Box3().setFromCenterAndSize(this.camera.position, new THREE.Vector3(0.6, 1.8, 0.6));
    for (let i = 0; i < this.colliders.length; i++) {
      const wallBox = new THREE.Box3().setFromObject(this.colliders[i]);
      if (playerBox.intersectsBox(wallBox)) {
        this.camera.position.copy(oldPos); // Rollback step upon collision
        break;
      }
    }
  }
}