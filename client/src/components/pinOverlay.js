// google.maps.OverlayView を使い、DOMノードをそのまま地図上のピンとして配置する
// (標準Markerはピル型バッジのようなカスタムデザインに対応できないため)
export function makePinOverlayClass(mapsNS) {
  return class PinOverlay extends mapsNS.OverlayView {
    constructor(position, element) {
      super();
      this.position = new mapsNS.LatLng(position.lat, position.lng);
      this.element = element;
      this.element.style.position = 'absolute';
      this.element.style.transform = 'translate(-50%, -50%)';
    }

    onAdd() {
      this.getPanes().overlayMouseTarget.appendChild(this.element);
    }

    draw() {
      const proj = this.getProjection();
      if (!proj) return;
      const point = proj.fromLatLngToDivPixel(this.position);
      if (!point) return;
      this.element.style.left = `${point.x}px`;
      this.element.style.top = `${point.y}px`;
    }

    onRemove() {
      this.element.parentNode?.removeChild(this.element);
    }
  };
}
