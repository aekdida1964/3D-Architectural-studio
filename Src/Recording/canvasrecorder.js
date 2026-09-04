export class CanvasRecorder {
  constructor(canvas) {
    this.canvas = canvas;
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }

  getSupportedMimeType() {
    const types = [
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=h264',
      'video/webm'
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }

  start(fps = 30) {
    this.recordedChunks = [];
    const stream = this.canvas.captureStream(fps);
    const mimeType = this.getSupportedMimeType();

    if (!mimeType) {
      throw new Error('التسجيل غير مدعوم على هذا المتصفح');
    }

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      videoBitsPerSecond: 5000000 // 5 Mbps
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.start(100);
  }

  stop() {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder.mimeType;
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        resolve({ blob, mimeType });
      };
      this.mediaRecorder.stop();
    });
  }
}