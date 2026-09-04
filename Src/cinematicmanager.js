import * as THREE from 'three';

export class CinematicManager {
  constructor(camera) {
    this.camera = camera;
    this.keyframes = [];
  }

  addKeyframe(time, position, target) {
    this.keyframes.push({
      time: time,
      position: position.clone(),
      target: target.clone()
    });
    this.keyframes.sort((a, b) => a.time - b.time);
  }

  clear() {
    this.keyframes = [];
  }

  applyPreset(type) {
    this.clear();
    if (type === 'reveal') {
      this.addKeyframe(0, new THREE.Vector3(0, 15, 25), new THREE.Vector3(0, 0, 0));
      this.addKeyframe(5, new THREE.Vector3(12, 5, 12), new THREE.Vector3(0, 1.5, 0));
      this.addKeyframe(10, new THREE.Vector3(0, 2, 8), new THREE.Vector3(0, 1.5, 0));
    } else if (type === 'exterior') {
      this.addKeyframe(0, new THREE.Vector3(15, 6, 15), new THREE.Vector3(0, 1, 0));
      this.addKeyframe(5, new THREE.Vector3(-15, 6, 15), new THREE.Vector3(0, 1, 0));
      this.addKeyframe(10, new THREE.Vector3(-15, 6, -15), new THREE.Vector3(0, 1, 0));
    } else if (type === 'interior') {
      this.addKeyframe(0, new THREE.Vector3(0, 1.6, 8), new THREE.Vector3(0, 1.6, 0));
      this.addKeyframe(5, new THREE.Vector3(-0.5, 1.6, 4), new THREE.Vector3(-0.5, 1.6, -2));
      this.addKeyframe(10, new THREE.Vector3(2, 1.6, 1), new THREE.Vector3(3, 1.6, -2));
    }
  }

  updateAtTime(time) {
    if (this.keyframes.length < 2) return;

    if (time <= this.keyframes[0].time) {
      this.camera.position.copy(this.keyframes[0].position);
      this.camera.lookAt(this.keyframes[0].target);
      return;
    }

    if (time >= this.keyframes[this.keyframes.length - 1].time) {
      const last = this.keyframes[this.keyframes.length - 1];
      this.camera.position.copy(last.position);
      this.camera.lookAt(last.target);
      return;
    }

    // Find interpolation segment
    let i = 0;
    for (i = 0; i < this.keyframes.length - 1; i++) {
      if (time >= this.keyframes[i].time && time <= this.keyframes[i + 1].time) {
        break;
      }
    }

    const k1 = this.keyframes[i];
    const k2 = this.keyframes[i + 1];
    const alpha = (time - k1.time) / (k2.time - k1.time);

    // Smooth Interpolation
    this.camera.position.lerpVectors(k1.position, k2.position, alpha);
    const interpolatedTarget = new THREE.Vector3().lerpVectors(k1.target, k2.target, alpha);
    this.camera.lookAt(interpolatedTarget);
  }
}