// 本-設計-A0022 設計図面管理台帳（品質記録様式。元Excel：本-設計-A0022 設計図面管理台帳.xls、A4縦1ページ）
// 工務A0001 図面管理台帳と同じ作り（ユーザー指定）：台帳なので、件数が増えたらページを足す（1ページ18件）。ファイルに保存して設計部で共有（共有フォルダに置く）
// 1件は2段：設計番号・件名・顧客・提出日・図面番号は2段分、回収日（上段）／廃棄日（下段）。元の様式に押印欄はない
(function () {
  const PER_PAGE = 18;
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  const k = (n, f) => `d${n}.${f}`; // n：通し番号（1〜）

  const ledger = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const date = (key) => field({ key, type: 'date', jp: true, style: 'short' }); // 画面でも「26/11/5」の形（クリックでカレンダー）
    const ta = (n, f) => h('td', { rowspan: 2, class: 'k1-ta' }, field({ key: k(n, f), type: 'textarea', plain: true, lines: 1 }));
    const tb = h('tbody', null,
      h('tr', null, h('th', { rowspan: 2 }, '設計番号'), h('th', { rowspan: 2 }, '件　　　名'), h('th', { rowspan: 2 }, '顧　客'),
        h('th', { rowspan: 2 }, '提出日'), h('th', { rowspan: 2 }, '図面番号'), h('th', null, '回収日')),
      h('tr', null, h('th', null, '廃棄日')));
    for (let i = 1; i <= PER_PAGE; i++) {
      const n = (page - 1) * PER_PAGE + i;
      tb.append(
        h('tr', { class: 'k1-top' }, h('td', { rowspan: 2 }, field({ key: k(n, 'no'), align: 'center' })), ta(n, 'subject'), ta(n, 'client'),
          h('td', { rowspan: 2 }, date(k(n, 'teishutsu'))), ta(n, 'zuban'), h('td', { class: 'k1-sub' }, date(k(n, 'back')))),
        h('tr', null, h('td', null, date(k(n, 'dispose')))));
    }
    const table = h('table', { class: 'grid k1 s22' },
      h('colgroup', null, ...[24, null, 30, 21, 38, 21].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
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
      h('span', { class: 'k1-hint' }, '件数が増えたらページを足してください。「ファイルに保存」したファイルを共有フォルダに置くと、設計部で共有できます。')));
  } });

  FORM_DEFS['sekkei-a0022'] = {
    code: '本-設計-A0022', title: '設計図面管理台帳',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    meta: [],
    stamps: [], // 元の様式に押印欄なし
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => ({
      subtitle: pageCount(v) > 1 ? `（${i + 1}/${pageCount(v)}）` : '',
      blocks: [ledger(i + 1)],
    })),
  };
})();
