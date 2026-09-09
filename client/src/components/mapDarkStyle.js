// 「鑑定書のような信頼感」のデザインコンセプトに合わせた、墨色×真鍮色のダークマップスタイル
export const MAP_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#12160F' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0B0F0C' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9A9C8F' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: 'rgba(216,180,99,0.25)' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#171C15' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#20261C' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#5C5F52' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2B3324' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0B0F0C' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#5C5F52' }] },
];
