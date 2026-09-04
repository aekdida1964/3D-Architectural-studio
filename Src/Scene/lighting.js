import * as THREE from 'three';

export class Lighting {
  constructor(scene) {
    this.scene = scene;
    
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.dirLight.position.set(20, 40, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 100;
    
    const d = 25;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;

    this.scene.add(this.dirLight);
  }

  setTimeOfDay(type) {
    switch(type) {
      case 'day':
        this.scene.background.setHex(0x87ceeb);
        if (this.scene.fog) this.scene.fog.color.setHex(0x87ceeb);
        this.dirLight.position.set(20, 40, 20);
        this.dirLight.intensity = 1.2;
        this.dirLight.color.setHex(0xffffff);
        this.hemiLight.intensity = 0.6;
        break;
      case 'sunset':
        this.scene.background.setHex(0xfd5e53);
        if (this.scene.fog) this.scene.fog.color.setHex(0xfd5e53);
        this.dirLight.position.set(40, 10, 10);
        this.dirLight.intensity = 0.8;
        this.dirLight.color.setHex(0xffaa55);
        this.hemiLight.intensity = 0.4;
        break;
      case 'night':
        this.scene.background.setHex(0x0B1D3A);
        if (this.scene.fog) this.scene.fog.color.setHex(0x0B1D3A);
        this.dirLight.position.set(0, 30, -10);
        this.dirLight.intensity = 0.2;
        this.dirLight.color.setHex(0x88bbff);
        this.hemiLight.intensity = 0.1;
        break;
    }
  }
}