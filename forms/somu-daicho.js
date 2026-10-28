// 本-総務-A0001 文書番号台帳・A0002 文書台帳・A0003 外部文書台帳の共通定義（品質記録様式。元Word：本-総務-A0001〜A0003….doc、A4横1ページ＝16件）
// forms/somu-a0001.js などが FORM_NEEDS でこのファイルを読み込む。3つの台帳は列だけが違う
// 台帳なので、入力内容をJSONファイルに保存・読み込みできる（fileIO）。件数が増えたらページを足す（1ページ16件）
// 元の様式に押印欄はない（A0001 の記入者・承認は行ごとの欄のまま）。元の右上の「1/000」はページ番号（表題の横に出す）
(function () {
  const PER_PAGE = 16;
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  const k = (n, f) => `d${n}.${f}`; // n：通し番号（1〜）

  // 列：[見出し, キー, 幅mm（null は残り）, 種類]
  const DOC_COLS = (no, name, by) => [
    [no, 'no', 30, ''], [name, 'name', null, ''], [by, 'by', 26, ''], ['発行日', 'issue', 19, 'date'], ['版', 'ver', 10, 'c'],
    ['配付日', 'dist', 19, 'date'], ['配付先', 'to', 40, ''], ['回収日', 'back', 19, 'date'], ['廃棄日', 'dispose', 19, 'date'], ['備　考', 'note', 34, ''],
  ];
  const DEFS = {
    'somu-a0001': { code: '本-総務-A0001', title: '文書番号台帳', seitei: '99/01/04',
      cols: [['文書番号', 'no', 32, ''], ['文　書　名', 'name', null, ''], ['発行部署', 'dept', 60, ''], ['発行日', 'issue', 19, 'date'], ['廃止日', 'abolish', 19, 'date'],
        ['備　考', 'note', 46, ''], ['記入者', 'writer', 15, 'c'], ['承　認', 'approve', 15, 'c']] },
    'somu-a0002': { code: '本-総務-A0002', title: '文書台帳', seitei: '99/01/04', cols: DOC_COLS('文書番号', '文　書　名', '発行部署') },
    'somu-a0003': { code: '本-総務-A0003', title: '外部文書台帳', seitei: '99/01/04', cols: DOC_COLS('外部文書番号', '外部文書名', '発行者') },
  };

  // 1ページ分の表
  const ledger = (cols, page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const cell = ([, key, , type], n) => {
      if (type === 'date') return field({ key: k(n, key), type: 'date', jp: true, style: 'short' }); // 画面でも「26/11/5」の形（クリックでカレンダー）
      return field({ key: k(n, key), align: type === 'c' ? 'center' : undefined });
    };
    const tb = h('tbody', null, h('tr', null, ...cols.map(([label]) => h('th', null, label))));
    for (let i = 1; i <= PER_PAGE; i++) {
      const n = (page - 1) * PER_PAGE + i;
      tb.append(h('tr', null, ...cols.map((c) => h('td', null, cell(c, n)))));
    }
    const table = h('table', { class: 'grid s1' }, h('colgroup', null, ...cols.map(([, , w]) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
    if (page !== pageCount(values)) return table;
    // 最後のページの下に、ページの追加・削除（印刷しない）
    const lastHasData = () => Object.keys(values).some((key) => {
      const m = /^d(\d+)\./.exec(key);
      return m && Number(m[1]) > (page - 1) * PER_PAGE && String(values[key] ?? '') !== '';
    });
    return h('div', null, table, h('div', { class: 'k1-pages no-print' },
      h('button', { type: 'button', onclick: () => { setVal('pageCount', String(page + 1)); rebuild(); } }, `＋ ページを追加（${PER_PAGE}件）`),
      page > 1 ? h('button', { type: 'button', onclick: () => {
        if (lastHasData() && !confirm(`${page}ページ目には入力があります。消してページを減らしますか？`)) return;
        for (let i = 1; i <= PER_PAGE; i++) Object.keys(values).filter((key) => key.startsWith(`d${(page - 1) * PER_PAGE + i}.`)).forEach((key) => delete values[key]);
        setVal('pageCount', String(page - 1)); rebuild();
      } }, '最後のページを削除') : null,
      h('span', { class: 'k1-hint' }, '件数が増えたらページを足してください。「ファイルに保存」で台帳をファイルに残せます。')));
  } });

  Object.entries(DEFS).forEach(([id, d]) => {
    FORM_DEFS[id] = {
      code: d.code, title: d.title,
      seitei: d.seitei, kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
      orientation: 'landscape',
      fileIO: true,
      meta: [],
      stamps: [], // 元の様式に押印欄なし
      pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => ({
        subtitle: `（${i + 1}/${pageCount(v)}）`,
        blocks: [ledger(d.cols, i + 1)],
      })),
    };
  });
})();
