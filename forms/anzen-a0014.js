// 本-安全-A0014 運転月報（品質記録様式。元Excel：本-安全-A0014運転月報.xlsx、A4縦4ページ＝表紙・1〜15日・16〜31日・安全運転3訓）
// ユーザー指定：一覧に載せるが運転月報アプリとは切り離す（紙で書く・印刷する用の様式）。運転月報アプリの印刷はこの見た目に合わせる
// ここでは記入ページの2枚（1〜15日＋15日点検、16〜31日＋合計＋末日点検）を作る。表紙と安全運転3訓はユーザー指定で不要
(function () {
  const vt = (s) => s.split('').join('\n');
  // 走行距離 ＝ 翌日の出庫時メーター − その日の出庫時メーター（元Excelの G列の式と同じ。31日は空欄）
  const meter = (v, d) => {
    const k = d <= 15 ? `a.${d}.meter` : `b.${d - 15}.meter`;
    const s = String(v[k] ?? '').replace(/[,，\s]/g, '');
    return s === '' || isNaN(Number(s)) ? null : Number(s);
  };
  const distance = (v, d) => {
    if (d >= 31) return '';
    const m0 = meter(v, d), m1 = meter(v, d + 1);
    return m0 == null || m1 == null ? '' : m1 - m0;
  };
  const num = (s) => { const n = Number(String(s ?? '').replace(/[,，\s]/g, '')); return isNaN(n) ? 0 : n; };
  const totalDist = (v) => { let s = 0; for (let d = 1; d <= 31; d++) { const x = distance(v, d); if (x !== '') s += x; } return s; };
  const totalFuel = (v) => { let s = 0; for (let r = 1; r <= 15; r++) s += num(v[`a.${r}.fuel`]); for (let r = 1; r <= 16; r++) s += num(v[`b.${r}.fuel`]); return s; };

  const days = (key, start, rows) => ({
    type: 'table', key, rows, rowNoStart: start, rowH: 9, dense: true, headH: 12,
    columns: [
      { label: '日付', key: 'day', w: 6, rowNo: true },
      { label: '出庫時\nメーター指針\n(km)', key: 'meter', w: 13, type: 'number', dec: 0 },
      { label: '走行距離\n(km)', key: 'dist', w: 11, rowCalc: (r, v) => distance(v, r + start - 1) },
      { label: '行　先', key: 'dest', w: 30 },
      { label: '運転者', key: 'driver', w: 11 },
      { label: '運転前', key: 'alcB', w: 9, group: 'アルコール検知値(mg/ℓ)', align: 'center' },
      { label: '運転後', key: 'alcA', w: 9, group: 'アルコール検知値(mg/ℓ)', align: 'center' },
      { label: '給油\n(ℓ)', key: 'fuel', w: 11, type: 'number' },
    ],
  });

  // 日常点検（15日・末日）。結果は ○／×
  const ITEMS = [
    'ブレーキ（ききが十分か、ブレーキの液量が適正か、駐車ブレーキの引きしろが適正か）',
    'タイヤ（空気圧が適正か、亀裂損傷はないか、異常な摩耗はないか、溝の深さは十分あるか）',
    'バッテリー（液量は適正か）',
    'エンジン（冷却水・エンジンオイルの量は良いか、異音はないか、低速・加速の状態は良いか）',
    '灯火装置及び方向指示器（点灯・点滅具合は良いか、汚れ・損傷はないか）',
    'ウインド・ウォッシャー及びワイパー（噴射状態・払拭状態は良いか）',
  ];
  const checklist = (p, when) => ({ type: 'grid', cols: 25, colWidths: ['7mm', '6mm'], rowH: 5.5, dense: true, rows: [
    [{ label: vt(`点検指定日（${when}）`), span: 1, rs: ITEMS.length + 2 },
      { label: `日常点検項目（点検日${when}）`, span: 21 }, { label: '結　果', span: 3 }],
    ...ITEMS.map((t, i) => [
      { text: String(i + 1), align: 'center', span: 1 },
      { text: t, span: 20 },
      { key: `${p}${i + 1}`, type: 'select', options: ['○', '×'], align: 'center', span: 3 }]),
    [{ text: '点検結果は、異状なし〇、異常あり×、を記入し、×の場合は処置する又は自動車修理依頼書を発行する。', note: true, span: 24 }],
  ] });

  const info = { type: 'grid', lw: 3, rowH: 7, dense: true, rows: [
    [{ label: '事業所名', key: 'office', type: 'select', options: LISTS.offices, span: 7 },
      { label: '車両番号', key: 'carNo', span: 8 },
      { label: '車両管理者', key: 'kanri', lw: 4, span: 9 }],
  ] };
  // 2枚目の上：1枚目に入れた年月・車両番号・車両管理者をそのまま表示
  const ymText = (v) => (v.ym ? `${v.ym.slice(0, 4)}年 ${Number(v.ym.slice(5, 7))}月` : '');
  const info2 = { type: 'grid', lw: 3, rowH: 7, dense: true, rows: [
    [{ label: '年　月', key: 'ym2', type: 'calc', align: 'left', calc: (n, v) => ymText(v), span: 7 },
      { label: '車両番号', key: 'carNo2', type: 'calc', align: 'left', calc: (n, v) => v.carNo || '', span: 8 },
      { label: '車両管理者', key: 'kanri2', type: 'calc', align: 'left', calc: (n, v) => v.kanri || '', lw: 4, span: 9 }],
  ] };

  FORM_DEFS['anzen-a0014'] = {
    code: '本-安全-A0014', title: '運転月報',
    seitei: '07/08/06', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '発行者', // 押印欄の右端（発行者）にデート印
    meta: [{ label: '年　月', key: 'ym', type: 'ym' }],
    stamps: [{ boxes: ['安全運転|管理者', '副安全運転|管理者', '発行者'] }],
    pages: [
      { blocks: [info, days('a', 1, 15), checklist('mid', '15日')] },
      // 2枚目：押印欄は1枚目だけ。合計（走行距離・給油）と燃費は自動
      { stamps: [], meta: [], subtitle: '（2/2）', blocks: [info2, days('b', 16, 16),
        { type: 'grid', lw: 4, rowH: 7, dense: true, rows: [
          [{ label: '走行距離合計', key: 'sumDist', type: 'calc', unit: 'km', calc: (n, v) => totalDist(v), span: 8 },
            { label: '燃費≒走行距離\n合計/給油合計', key: 'nenpi', type: 'calc', unit: 'km/ℓ', dec: 1, calc: (n, v) => { const f = totalFuel(v); return f ? totalDist(v) / f : NaN; }, lw: 5, span: 9 },
            { label: '給油合計', key: 'sumFuel', type: 'calc', unit: 'ℓ', dec: 1, calc: (n, v) => totalFuel(v), lw: 3, span: 7 }],
        ] },
        checklist('end', '末日')] },
    ],
  };
})();
