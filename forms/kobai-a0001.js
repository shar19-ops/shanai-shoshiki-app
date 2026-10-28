// 本-購買-A0001 購買業者台帳（品質記録様式。元Excel：本-購買-A0001 購買業者台帳.xls、A3横1ページ＝27社）→ 20社
// 台帳なので、入力内容をJSONファイルに保存・読み込みできる（fileIO、ユーザー指定）。業者が増えたらページを足す（1ページ20社。12桁の工番が入る幅と書きやすい行の高さにするため、元の27社から減らした）
// 1社は2段：工事番号（上段）と評価点（下段）。評価点計・サンプル数・年度評価点・総合評価は自動（元のExcelの式のまま）
// 元は工事の欄が33列 → 12桁の工番が入る幅にするため20列に減らした
// 押印欄は管理本部長（元は購買本部長、ユーザー指定）・購買部長（元の日付欄はなし）
(function () {
  const PER_PAGE = 20;
  const COLS = 20; // 工事の欄（工事番号／評価点）の列数
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  const k = (n, f) => `d${n}.${f}`; // n：通し番号（1〜）

  // 評価点の合計と数（入力のある欄だけ）
  const scores = (v, n) => Array.from({ length: COLS }, (_, j) => String(v[k(n, `p${j + 1}`)] ?? '').trim())
    .filter((s) => s !== '' && !isNaN(Number(s))).map(Number);
  const sum = (v, n) => scores(v, n).reduce((a, b) => a + b, 0);
  // 総合評価：年度評価点（平均）が 70.5以上 A、60.5以上 B、40.5以上 C、それより下 D（元のExcelの式。表示は四捨五入で 71以上 A …）
  const rank = (v, n) => {
    const s = scores(v, n);
    if (!s.length || !sum(v, n)) return '';
    const avg = sum(v, n) / s.length;
    return avg >= 70.5 ? 'A' : avg >= 60.5 ? 'B' : avg >= 40.5 ? 'C' : 'D';
  };

  // 1ページ分の表
  const ledger = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const calc = (key, fn, cls) => h('td', { class: 'b1-auto' + (cls ? ' ' + cls : '') }, field({ key, type: 'calc', align: 'center', calc: (_, v) => fn(v) }));
    const tb = h('tbody', null,
      h('tr', null, h('th', { rowspan: 2 }, 'No'), h('th', { rowspan: 2 }, '業者', h('br'), 'コード'), h('th', { rowspan: 2 }, '社　　名'),
        h('th', { rowspan: 2 }, '総合', h('br'), '評価'), h('th', { rowspan: 2 }, '年度', h('br'), '評価点'), h('th', null, '評価点計'),
        h('th', { colspan: COLS }, '上　段　：　工　事　番　号')),
      h('tr', null, h('th', null, 'サンプル数'), h('th', { colspan: COLS }, '下　段　：　評　　価　　点')));
    for (let i = 1; i <= PER_PAGE; i++) {
      const n = (page - 1) * PER_PAGE + i;
      tb.append(
        h('tr', { class: 'b1-top' },
          h('td', { rowspan: 2, class: 'b1-no' }, String(n)),
          h('td', { rowspan: 2 }, field({ key: k(n, 'code'), align: 'center' })),
          h('td', { rowspan: 2 }, field({ key: k(n, 'name') })),
          h('td', { rowspan: 2, class: 'b1-auto b1-rank' }, field({ key: k(n, 'rank'), type: 'calc', align: 'center', calc: (_, v) => rank(v, n) })),
          h('td', { rowspan: 2, class: 'b1-auto' }, field({ key: k(n, 'avg'), type: 'calc', align: 'center',
            calc: (_, v) => (scores(v, n).length && sum(v, n) ? Math.round(sum(v, n) / scores(v, n).length) : null) })),
          calc(k(n, 'sum'), (v) => sum(v, n) || null, 'b1-sub'),
          ...Array.from({ length: COLS }, (_, j) => h('td', { class: 'b1-sub b1-koban' }, field({ key: k(n, `k${j + 1}`), maxlength: 12, align: 'center' })))),
        h('tr', null,
          calc(k(n, 'cnt'), (v) => scores(v, n).length || null),
          ...Array.from({ length: COLS }, (_, j) => h('td', null, field({ key: k(n, `p${j + 1}`), type: 'number', align: 'center' })))));
    }
    const table = h('table', { class: 'grid b1' },
      h('colgroup', null, ...[7, 16, 40, 10, 11, 15, ...Array(COLS).fill(null)].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
    if (page !== pageCount(values)) return table;
    // 最後のページの下に、ページの追加・削除（印刷しない）
    const lastHasData = () => Object.keys(values).some((key) => {
      const m = /^d(\d+)\.(code|name|k\d+|p\d+)$/.exec(key);
      return m && Number(m[1]) > (page - 1) * PER_PAGE && String(values[key] ?? '') !== '';
    });
    return h('div', null, table, h('div', { class: 'k1-pages no-print' },
      h('button', { type: 'button', onclick: () => { setVal('pageCount', String(page + 1)); rebuild(); } }, `＋ ページを追加（${PER_PAGE}社）`),
      page > 1 ? h('button', { type: 'button', onclick: () => {
        if (lastHasData() && !confirm(`${page}ページ目には入力があります。消してページを減らしますか？`)) return;
        for (let i = 1; i <= PER_PAGE; i++) Object.keys(values).filter((key) => key.startsWith(`d${(page - 1) * PER_PAGE + i}.`)).forEach((key) => delete values[key]);
        setVal('pageCount', String(page - 1)); rebuild();
      } }, '最後のページを削除') : null,
      h('span', { class: 'k1-hint' }, '業者が増えたらページを足してください。「ファイルに保存」で台帳をファイルに残せます。')));
  } });

  const notes = { type: 'notes', items: [
    '総合評価の決定は、年度評価点より右の通りとする。（ A：71 以上、B：61 ～ 70、C：41 ～ 60、D：40 以下 ）　A・B・C は合格、D は不合格とする。　灰色の欄は自動で計算します。',
  ] };

  FORM_DEFS['kobai-a0001'] = {
    code: '本-購買-A0001', title: '購買業者台帳',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    paper: 'A3', orientation: 'landscape',
    fileIO: true,
    // 元は表題の左下に「設備（　　）」
    meta: [{ label: '設　備', key: 'setsubi' }],
    stamps: [{ boxes: ['管理本部長', '購買部長'] }], // 元は購買本部長 → 管理本部長（ユーザー指定）
    // ページ数は入力で変わる（pageCount）。設備はどのページにも出す
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => ({
      subtitle: pageCount(v) > 1 ? `（${i + 1}/${pageCount(v)}）` : '',
      blocks: [ledger(i + 1), notes],
    })),
  };
})();
