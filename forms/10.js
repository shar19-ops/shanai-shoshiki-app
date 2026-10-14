// 作業月報 — 締めは20日（21日〜翌月20日）。左表 21〜5日、右表 6〜20日。
(function () {
  const LEFT = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5];
  const RIGHT = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const DOW = '日月火水木金土';

  // 対象月（例 2026-10 → 2026/9/21〜2026/10/20）の曜日
  const dowOf = (v, day) => {
    if (!v.month) return '';
    const [y, m] = v.month.split('-').map(Number);
    const d = new Date(y, day >= 21 ? m - 2 : m - 1, day); // 21日以降は前月
    return d.getDate() === day ? DOW[d.getDay()] : '';
  };

  const table = (key, days, foot) => ({
    type: 'table', key, rows: days.length, rowH: 9.2, foot,
    columns: [
      { label: '日', key: 'd', w: 8, head: (r) => String(days[r - 1]) },
      { label: '曜日', key: 'dow', w: 7, align: 'center', rowCalc: (r, v) => dowOf(v, days[r - 1]) },
      { label: '作業概要', key: 'work', w: 37 },
      { label: '作業時間', key: 'time', w: 18, align: 'center', placeholder: '8:00〜17:00' },
      { label: '出面', key: 'de', w: 10, type: 'number', group: '人工数' },
      { label: '残業', key: 'ot', w: 10, type: 'number', group: '人工数' },
      { label: '計', key: 'sum', w: 10, type: 'calc', dec: 2, group: '人工数', calc: (n) => n('de') + n('ot') },
    ],
  });
  const total = (k) => (n) => {
    let s = 0;
    LEFT.forEach((_, i) => { s += n(`L.${i + 1}.${k}`); });
    RIGHT.forEach((_, i) => { s += n(`R.${i + 1}.${k}`); });
    return s;
  };

  FORM_DEFS['10'] = {
    code: '般-10', title: '作業月報',
    meta: [
      { label: '対象月', key: 'month', type: 'ym' },
      { label: '提出日', key: 'date', type: 'date' },
    ],
    blocks: [
      { type: 'grid', rows: [
        [{ label: '会社名', key: 'company', span: 12 }, { label: '担当者名', key: 'person', span: 9 }, { text: '印', span: 3, align: 'center' }],
        [{ label: '工　番', key: 'koban', span: 8 }, { label: '件　名', key: 'subject', span: 10, lw: 3 }, { label: '当社担当', key: 'tanto', span: 6, lw: 3 }],
      ] },
      { type: 'row', gap: 2, items: [
        table('L', LEFT),
        table('R', RIGHT, [[
          { label: '合計（左右）', span: 4 },
          { key: 'tDe', type: 'calc', dec: 2, calc: total('de') },
          { key: 'tOt', type: 'calc', dec: 2, calc: total('ot') },
          { key: 'tSum', type: 'calc', dec: 2, calc: total('sum') },
        ]]),
      ] },
      { type: 'notes', items: ['※ 押印後必ず写しを保存すること。', '※ 対象月を選ぶと曜日が自動で入ります（21日〜翌月20日）。'] },
    ],
  };
})();
