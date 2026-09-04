export class UIManager {
  constructor() {
    this.loader = document.getElementById('loader');
    this.loaderText = document.getElementById('loader-text');
    this.measureResult = document.getElementById('measure-result');
  }

  showLoader(text = 'جاري التحميل...') {
    this.loaderText.innerText = text;
    this.loader.classList.remove('hidden');
  }

  hideLoader() {
    this.loader.classList.add('hidden');
  }

  updateMeasureResult(distance) {
    this.measureResult.innerText = `المسافة: ${distance} متر`;
  }
}