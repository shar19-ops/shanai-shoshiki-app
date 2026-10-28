// 本-総務-A0013 年度教育訓練計画（全社・部署別）（品質記録様式。元Word：本-総務-A0013 年度教育訓練計画（全社・部署別）.doc、A4横2ページ＝1ページ5項目）
// 押印欄は右上（元も右上）：計画時（承認・審査・作成）・上期報告（審査・作成）・下期報告（承認・審査・作成）。作成の欄が3つあるのでデート印は使わない
// スケジュールは4月〜3月の予定・実施の欄をクリックで■（並べると棒の形になる）。項目が増えたらページを足す（1ページ5項目）、年度ごとにJSONファイルに保存
// 総務部長総評は1ページ目の下（元の様式のまま）
(function () {
  const PER_PAGE = 5;
  const MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  const k = (n, f) => `i${n}.${f}`; // n：項目の通し番号（1〜）

  const items = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const tb = h('tbody', null,
      h('tr', null, h('th', { colspan: 2 }, '計　画　時'), h('th', { colspan: 13 }, ''), h('th', { colspan: 2 }, '報　告　時')),
      h('tr', null, h('th', { rowspan: 2, class: 's13-l' }, '教育訓練項目', h('br'), '対象者', h('br'), '日程（期間）'), h('th', { rowspan: 2 }, '教育訓練の目的及び内容'),
        h('th', { rowspan: 2, colspan: 13 }, 'スケジュール（予定・実施の月をクリックで■）'), h('th', { colspan: 2 }, '実施成果及び反省点')),
      h('tr', null, h('th', null, '上　期'), h('th', null, '下　期')));
    for (let i = 1; i <= PER_PAGE; i++) {
      const n = (page - 1) * PER_PAGE + i;
      const months = (kind) => MONTHS.map((m) => h('td', { class: 's13-m' }, field({ key: k(n, `${kind}${m}`), type: 'mark', mark: '■' })));
      tb.append(
        h('tr', { class: 's13-top' },
          h('td', { rowspan: 3, class: 's13-item' },
            h('div', { class: 's13-line' }, field({ key: k(n, 'koumoku'), placeholder: '教育訓練項目' })),
            h('div', { class: 's13-line' }, field({ key: k(n, 'taisho'), placeholder: '対象者' })),
            h('div', { class: 's13-line s13-period' }, field({ key: k(n, 'from'), type: 'date', jp: true, style: 'short' }), h('span', null, '～'),
              field({ key: k(n, 'to'), type: 'date', jp: true, style: 'short' }), h('span', null, '（'), field({ key: k(n, 'kikan'), align: 'center' }), h('span', null, '間）'))),
          h('td', { rowspan: 3, class: 's13-ta' }, field({ key: k(n, 'mokuteki'), type: 'textarea', plain: true, lines: 3 })),
          h('td', { class: 's13-k' }, '予定'), ...months('plan'),
          h('td', { rowspan: 3, class: 's13-ta' }, field({ key: k(n, 'kami'), type: 'textarea', plain: true, lines: 3 })),
          h('td', { rowspan: 3, class: 's13-ta' }, field({ key: k(n, 'shimo'), type: 'textarea', plain: true, lines: 3 }))),
        h('tr', { class: 's13-mrow' }, h('td', { class: 's13-k' }, ''), ...MONTHS.map((m) => h('td', { class: 's13-mn' }, String(m)))),
        h('tr', null, h('td', { class: 's13-k' }, '実施'), ...months('done')));
    }
    const table = h('table', { class: 'grid s13' },
      h('colgroup', null, ...[52, 45, 10, ...Array(12).fill(6.6), 44, null].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
    if (page !== pageCount(values)) return table;
    // 最後のページの下に、ページの追加・削除（印刷しない）
    const lastHasData = () => Object.keys(values).some((key) => {
      const m = /^i(\d+)\./.exec(key);
      return m && Number(m[1]) > (page - 1) * PER_PAGE && String(values[key] ?? '') !== '';
    });
    return h('div', null, table, h('div', { class: 'k1-pages no-print' },
      h('button', { type: 'button', onclick: () => { setVal('pageCount', String(page + 1)); rebuild(); } }, `＋ ページを追加（${PER_PAGE}項目）`),
      page > 1 ? h('button', { type: 'button', onclick: () => {
        if (lastHasData() && !confirm(`${page}ページ目には入力があります。消してページを減らしますか？`)) return;
        for (let i = 1; i <= PER_PAGE; i++) Object.keys(values).filter((key) => key.startsWith(`i${(page - 1) * PER_PAGE + i}.`)).forEach((key) => delete values[key]);
        setVal('pageCount', String(page - 1)); rebuild();
      } }, '最後のページを削除') : null,
      h('span', { class: 'k1-hint' }, '項目が増えたらページを足してください。「ファイルに保存」で年度ごとに残せます。')));
  } });

  const head = { type: 'grid', lw: 6, rowH: 6.5, rows: [
    [{ label: '計画年度', key: 'nendo', type: 'number', unit: '年度', align: 'center', span: 24 }],
    [{ label: '作成部署', key: 'busho', span: 24 }],
  ] };

  FORM_DEFS['somu-a0013'] = {
    code: '本-総務-A0013', title: '年度教育訓練計画（全社・部署別）',
    seitei: '00/10/03', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    orientation: 'landscape',
    fileIO: true,
    meta: [],
    stamps: [{ label: '計画時', boxes: ['承認', '審査', '作成'] }, { label: '上期', boxes: ['審査', '作成'] }, { label: '下期', boxes: ['承認', '審査', '作成'] }],
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => ({
      subtitle: `（${i + 1}/${pageCount(v)}）`,
      headBlocks: [head],
      blocks: [items(i + 1), ...(i === 0 ? [{ type: 'free', label: '総務部長総評', key: 'sohyo', lines: 2 }] : [])],
    })),
  };
})();
