import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { C, FONT_UI } from '../theme.js';

const LAYOUTS = ['1LDK', '2LDK', '3LDK', '4LDK', '5LDK'];
const SAMPLE_ADDRESSES = [
  '東京都世田谷区代田',
  '神奈川県横浜市都筑区',
  '埼玉県さいたま市緑区',
  '千葉県柏市豊四季',
];

const inputStyle = {
  background: C.cardAlt,
  border: `1px solid ${C.borderSoft}`,
  borderRadius: 8,
  color: C.text,
  fontFamily: FONT_UI,
  fontSize: 12,
  padding: '6px 8px',
};

export function AddressSearchForm({ onSearch, loading }) {
  const [address, setAddress] = useState('');
  const [age, setAge] = useState(15);
  const [layout, setLayout] = useState('3LDK');
  const [landArea, setLandArea] = useState(120);
  const [buildingArea, setBuildingArea] = useState(95);

  function submit(e) {
    e?.preventDefault();
    if (!address.trim() || loading) return;
    onSearch({ address: address.trim(), age: Number(age), layout, landArea: Number(landArea), buildingArea: Number(buildingArea) });
  }

  return (
    <form onSubmit={submit} style={{ margin: '0 18px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px' }}>
        <MapPin size={16} color={C.brass} style={{ flexShrink: 0 }} />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="住所を入力(例: 東京都世田谷区代田)"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: C.text, fontSize: 14, fontFamily: FONT_UI }}
        />
        <button
          type="submit"
          disabled={loading}
          aria-label="検索"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: C.brassSoft, border: `1px solid ${C.brassDim}`, borderRadius: 8,
            width: 32, height: 32, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.5 : 1,
          }}
        >
          <Search size={15} color={C.brass} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        {SAMPLE_ADDRESSES.map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => setAddress(s)}
            style={{ fontSize: 11, color: C.textFaint, background: 'transparent', border: `1px solid ${C.borderSoft}`, borderRadius: 999, padding: '4px 10px', cursor: 'pointer', fontFamily: FONT_UI }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, margin: '12px 0 0', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, padding: '6px 12px', borderRadius: 999, background: C.brassSoft, color: C.brass, border: `1px solid ${C.brassDim}` }}>戸建て</span>

        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.textMuted }}>
          築
          <input type="number" min={0} max={80} value={age} onChange={(e) => setAge(e.target.value)} style={{ ...inputStyle, width: 44 }} />
          年
        </label>

        <select value={layout} onChange={(e) => setLayout(e.target.value)} style={{ ...inputStyle }}>
          {LAYOUTS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.textMuted }}>
          土地
          <input type="number" min={10} max={2000} value={landArea} onChange={(e) => setLandArea(e.target.value)} style={{ ...inputStyle, width: 56 }} />
          ㎡
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.textMuted }}>
          建物
          <input type="number" min={10} max={1000} value={buildingArea} onChange={(e) => setBuildingArea(e.target.value)} style={{ ...inputStyle, width: 56 }} />
          ㎡
        </label>
      </div>
    </form>
  );
}
