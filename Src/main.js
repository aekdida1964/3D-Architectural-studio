import * as THREE from 'three';
import { SceneManager } from './scene/SceneManager.js';
import { Lighting } from './scene/Lighting.js';
import { DemoHouse } from './scene/DemoHouse.js';
import { CameraManager } from './camera/CameraManager.js';
import { FirstPersonControls } from './camera/FirstPersonControls.js';
import { CinematicManager } from './camera/CinematicManager.js';
import { ModelLoader } from './models/ModelLoader.js';
import { TimelineManager } from './animation/TimelineManager.js';
import { CanvasRecorder } from './recording/CanvasRecorder.js';
import { MP4Converter } from './recording/MP4Converter.js';
import { MeasureTool } from './tools/MeasureTool.js';
import { UIManager } from './ui/UIManager.js';

class Application {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.ui = new UIManager();
    this.sceneManager = new SceneManager(this.canvas);
    this.lighting = new Lighting(this.sceneManager.scene);
    this.cameraManager = new CameraManager(this.canvas);
    
    this.demoHouse = new DemoHouse(this.sceneManager.scene);
    this.modelLoader = new ModelLoader(this.sceneManager.scene);

    this.fpsControls = new FirstPersonControls(
      this.cameraManager.camera, 
      this.canvas, 
      this.demoHouse.colliders
    );

    this.cinematicManager = new CinematicManager(this.cameraManager.camera);
    this.timelineManager = new TimelineManager(10);
    this.recorder = new CanvasRecorder(this.canvas);
    this.measureTool = new MeasureTool(this.sceneManager.scene, this.cameraManager.camera, this.canvas);

    this.clock = new THREE.Clock();
    this.isRecording = false;

    this.initEvents();
    this.animate();
  }

  initEvents() {
    // Demo Model Loading Event
    document.getElementById('btn-demo').addEventListener('click', () => {
      if (!this.demoHouse) {
        this.demoHouse = new DemoHouse(this.sceneManager.scene);
        this.fpsControls.colliders = this.demoHouse.colliders;
      }
    });

    // Custom File Import Event
    document.getElementById('model-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.ui.showLoader('جاري تحميل النموذج...');
        if (this.demoHouse) {
          this.demoHouse.destroy();
          this.demoHouse = null;
        }
        this.modelLoader.loadFromFile(
          file,
          (progress) => this.ui.showLoader(`جاري التحميل... ${Math.round(progress)}%`),
          (model) => {
            this.ui.hideLoader();
            this.fpsControls.colliders = [model];
          },
          (errorMsg) => {
            this.ui.hideLoader();
            alert(errorMsg);
          }
        );
      }
    });

    // Camera Mode Selectors
    document.getElementById('mode-orbit').addEventListener('click', (e) => this.switchMode('orbit', e.target));
    document.getElementById('mode-fps').addEventListener('click', (e) => this.switchMode('fps', e.target));
    document.getElementById('mode-top').addEventListener('click', (e) => this.switchMode('top', e.target));
    document.getElementById('mode-front').addEventListener('click', (e) => this.switchMode('front', e.target));

    // Lighting Controls
    document.getElementById('time-day').addEventListener('click', () => this.lighting.setTimeOfDay('day'));
    document.getElementById('time-sunset').addEventListener('click', () => this.lighting.setTimeOfDay('sunset'));
    document.getElementById('time-night').addEventListener('click', () => this.lighting.setTimeOfDay('night'));

    // Measure Tool Event
    document.getElementById('btn-measure').addEventListener('click', (e) => {
      if (this.measureTool.enabled) {
        this.measureTool.disable();
        e.target.classList.remove('btn-primary');
      } else {
        this.measureTool.enable();
        e.target.classList.add('btn-primary');
      }
    });

    window.addEventListener('measure-complete', (e) => {
      this.ui.updateMeasureResult(e.detail.distance);
    });

    // Cinematic Camera Presets
    document.getElementById('preset-select').addEventListener('change', (e) => {
      const preset = e.target.value;
      if (preset) {
        this.cinematicManager.applyPreset(preset);
        this.renderKeyframeMarkers();
      }
    });

    // Timeline Animations
    document.getElementById('btn-play').addEventListener('click', () => this.timelineManager.play());
    document.getElementById('btn-stop').addEventListener('click', () => {
      this.timelineManager.stop();
      this.cameraManager.setMode('orbit');
    });

    const timelineSlider = document.getElementById('timeline-slider');
    timelineSlider.addEventListener('input', (e) => {
      const time = parseFloat(e.target.value);
      this.timelineManager.setTime(time);
    });

    this.timelineManager.onUpdateCallback = (time) => {
      timelineSlider.value = time;
      document.getElementById('timeline-time').innerText = 
        `00:${Math.floor(time).toString().padStart(2, '0')} / 00:10`;
      
      if (this.cinematicManager.keyframes.length >= 2) {
        this.cinematicManager.updateAtTime(time);
      }
    };

    document.getElementById('btn-add-keyframe').addEventListener('click', () => {
      const target = this.cameraManager.orbitControls.target;
      this.cinematicManager.addKeyframe(this.timelineManager.currentTime, this.cameraManager.camera.position, target);
      this.renderKeyframeMarkers();
    });

    // Video Recording Trigger
    document.getElementById('btn-record').addEventListener('click', () => this.startVideoExport());

    // Fullscreen toggle
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
  }

  switchMode(mode, targetBtn) {
    document.querySelectorAll('.btn-mode').forEach(b => b.classList.remove('active'));
    targetBtn.classList.add('active');

    this.measureTool.disable();
    const joystick = document.getElementById('joystick-container');

    if (mode === 'fps') {
      this.cameraManager.setMode('fps');
      this.fpsControls.enable();
      joystick.classList.remove('hidden');
    } else {
      this.fpsControls.disable();
      this.cameraManager.setMode(mode);
      joystick.classList.add('hidden');
    }
  }

  renderKeyframeMarkers() {
    const container = document.getElementById('keyframe-markers');
    container.innerHTML = '';
    this.cinematicManager.keyframes.forEach(kf => {
      const marker = document.createElement('div');
      marker.className = 'keyframe-marker';
      marker.style.left = `${(kf.time / this.timelineManager.duration) * 100}%`;
      container.appendChild(marker);
    });
  }

  async startVideoExport() {
    if (this.cinematicManager.keyframes.length < 2) {
      alert('يرجى اختيار نمط سينمائي أو إضافة لقطتين (Keyframes) على الأقل للبدء بالتسجيل.');
      return;
    }

    const fps = parseInt(document.getElementById('export-fps').value);
    this.ui.showLoader('جاري بدء التسجيل...');
    
    this.timelineManager.stop();
    this.timelineManager.play();
    this.recorder.start(fps);
    this.isRecording = true;

    const checkEnd = setInterval(async () => {
      if (!this.timelineManager.isPlaying) {
        clearInterval(checkEnd);
        this.ui.showLoader('جاري معالجة واستخراج الفيديو...');
        
        const { blob } = await this.recorder.stop();
        const finalMp4Blob = await MP4Converter.convertToMP4(blob, (msg) => this.ui.showLoader(msg));
        
        this.ui.hideLoader();
        this.isRecording = false;

        // Auto Download Link
        const url = URL.createObjectURL(finalMp4Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `architectural-walkthrough.${finalMp4Blob.type.includes('mp4') ? 'mp4' : 'webm'}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, 200);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    this.timelineManager.update(delta);
    this.cameraManager.update();
    this.fpsControls.update(delta);

    this.sceneManager.render(this.cameraManager.camera);
  }
}

// Instantiate application once DOM is completely rendered
window.addEventListener('DOMContentLoaded', () => {
  new Application();
});