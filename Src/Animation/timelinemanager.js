export class TimelineManager {
  constructor(duration = 10) {
    this.duration = duration;
    this.currentTime = 0;
    this.isPlaying = false;
    this.onUpdateCallback = null;
  }

  play() {
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  stop() {
    this.isPlaying = false;
    this.currentTime = 0;
    if (this.onUpdateCallback) this.onUpdateCallback(this.currentTime);
  }

  setTime(time) {
    this.currentTime = Math.max(0, Math.min(this.duration, time));
    if (this.onUpdateCallback) this.onUpdateCallback(this.currentTime);
  }

  update(delta) {
    if (!this.isPlaying) return;

    this.currentTime += delta;
    if (this.currentTime >= this.duration) {
      this.currentTime = this.duration;
      this.isPlaying = false;
    }

    if (this.onUpdateCallback) {
      this.onUpdateCallback(this.currentTime);
    }
  }
}