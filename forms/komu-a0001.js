// 本-工務-A0001 図面管理台帳（品質記録様式。元Excel：本-工務-A0001 図面管理台帳.xlsx、A4縦1ページ＝15件）
// 台帳なので、入力内容をJSONファイルに保存・読み込みできる（fileIO、ユーザー指定）。件数が増えたらページを足す（1ページ15件）
// 元の様式に押印欄はない
(function () {
  const PER_PAGE = 15;
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  const k = (n, f) => `d${n}.${f}`; // n：通し番号（1〜）

  // 1ページ分の表。1件は2段（図面番号／図面名称、発行日／配布日、回収日／廃棄日）
  const ledger = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const date = (key) => field({ key, type: 'date', jp: true, style: 'short' }); // 画面でも「26/11/5」の形（クリックでカレンダー）
    const tb = h('tbody', null,
      h('tr', null, h('th', null, '図　面　番　号'), h('th', { rowspan: 2 }, '発行部署'), h('th', null, '発行日'),
        h('th', { rowspan: 2 }, '版'), h('th', { rowspan: 2 }, '配付先'), h('th', null, '回収日'), h('th', { rowspan: 2 }, '備　考')),
      h('tr', null, h('th', null, '図　面　名　称'), h('th', null, '配布日'), h('th', null, '廃棄日')));
    for (let i = 1; i <= PER_PAGE; i++) {
      const n = (page - 1) * PER_PAGE + i;
      const ta = (f) => h('td', { rowspan: 2, class: 'k1-ta' }, field({ key: k(n, f), type: 'textarea', plain: true, lines: 1 }));
      tb.append(
        h('tr', { class: 'k1-top' }, h('td', { class: 'k1-sub' }, field({ key: k(n, 'no') })), ta('dept'),
          h('td', { class: 'k1-sub' }, date(k(n, 'issue'))), h('td', { rowspan: 2 }, field({ key: k(n, 'ver'), align: 'center' })),
          ta('to'), h('td', { class: 'k1-sub' }, date(k(n, 'back'))), ta('note')),
        h('tr', null, h('td', null, field({ key: k(n, 'name') })), h('td', null, date(k(n, 'dist'))), h('td', null, date(k(n, 'dispose')))));
    }
    const table = h('table', { class: 'grid k1' },
      h('colgroup', null, ...[null, 24, 21, 10, 28, 21, 26].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
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

  const head = { type: 'grid', lw: 3, rowH: 7, rows: [
    [{ label: '工　番', key: 'koban', maxlength: 12, span: 9 }, { label: '件　名', key: 'subject', span: 15 }],
  ] };

  FORM_DEFS['komu-a0001'] = {
    code: '本-工務-A0001', title: '図面管理台帳',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    fileIO: true,
    fileKeys: ['koban'], fileNameStyle: 'title', // 保存のファイル名は「図面管理台帳_工番.json」（修正指示書）
    meta: [],
    stamps: [], // 元の様式に押印欄なし
    // ページ数は入力で変わる（pageCount）。工番・件名はどのページにも出す（同じ項目なので表示がそろう）
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => ({
      subtitle: pageCount(v) > 1 ? `（${i + 1}/${pageCount(v)}）` : '',
      blocks: [head, ledger(i + 1)],
    })),
  };
})();
