// 本-設計-A0023 設計協力会社台帳（品質記録様式。元Excel：本-設計-A0023 設計協力会社台帳.xlsx、A3横1ページ＝15社）
// 購買A0001 購買業者台帳と同じ作り（ユーザー指定）：会社が増えたらページを足す（1ページ15社、元と同じ）。ファイルに保存して設計部で共有（共有フォルダに置く）
// 1社は2段：会社名（上段）／TEL（下段）、所在地（上段）／担当者（下段）、件名（設計物件コード、上段）／評価点（下段）
// 評価点計・サンプル数・年度評価点・総合評価は自動（元のExcelの式のまま：年度評価点＝評価点計÷サンプル数、総合評価は 70 を超えると A、60 を超えると B、40 を超えると C、それ以外 D）
// 元は物件の欄が30列 → 設計物件コードが入る幅にするため20列に減らした。最後のページに全社の計（元の「計」の行）
// 押印欄は承認・作成（元は表の右下）→ 右上
(function () {
  const PER_PAGE = 15;
  const COLS = 20; // 物件の欄（件名／評価点）の列数
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  const k = (n, f) => `d${n}.${f}`; // n：通し番号（1〜）

  // 評価点（入力のある欄だけ）
  const scores = (v, n) => Array.from({ length: COLS }, (_, j) => String(v[k(n, `p${j + 1}`)] ?? '').trim())
    .filter((s) => s !== '' && !isNaN(Number(s))).map(Number);
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const rankOf = (avg) => (avg > 70 ? 'A' : avg > 60 ? 'B' : avg > 40 ? 'C' : 'D');
  const all = (v) => Array.from({ length: pageCount(v) * PER_PAGE }, (_, i) => scores(v, i + 1)).flat();

  const ledger = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const auto = (key, fn, cls, rs) => h('td', { class: 'b1-auto' + (cls ? ' ' + cls : ''), rowspan: rs || null }, field({ key, type: 'calc', align: 'center', calc: (_, v) => fn(v) }));
    const tb = h('tbody', null,
      h('tr', null, h('th', { rowspan: 2 }, 'No'), h('th', null, '会　社　名'), h('th', null, '所　在　地'),
        h('th', { rowspan: 2 }, '総合', h('br'), '評価'), h('th', { rowspan: 2 }, '年度', h('br'), '評価点'), h('th', null, 'サンプル数'),
        h('th', { colspan: COLS }, '上　段　：　件　名（設計物件コード）')),
      h('tr', null, h('th', null, 'T　E　L'), h('th', null, '担　当　者'), h('th', null, '評価点計'), h('th', { colspan: COLS }, '下　段　：　評　　価　　点')));
    for (let i = 1; i <= PER_PAGE; i++) {
      const n = (page - 1) * PER_PAGE + i;
      tb.append(
        h('tr', { class: 'b1-top' },
          h('td', { rowspan: 2, class: 'b1-no' }, String(n)),
          h('td', { class: 'b1-sub' }, field({ key: k(n, 'name') })),
          h('td', { class: 'b1-sub' }, field({ key: k(n, 'addr') })),
          auto(k(n, 'rank'), (v) => (scores(v, n).length ? rankOf(sum(scores(v, n)) / scores(v, n).length) : ''), 'b1-rank', 2),
          auto(k(n, 'avg'), (v) => (scores(v, n).length ? Math.round(sum(scores(v, n)) / scores(v, n).length * 10) / 10 : null), '', 2),
          auto(k(n, 'cnt'), (v) => scores(v, n).length || null, 'b1-sub'),
          ...Array.from({ length: COLS }, (_, j) => h('td', { class: 'b1-sub b1-koban' }, field({ key: k(n, `k${j + 1}`), align: 'center' })))),
        h('tr', null,
          h('td', null, field({ key: k(n, 'tel'), type: 'tel' })),
          h('td', null, field({ key: k(n, 'tanto') })),
          auto(k(n, 'sum'), (v) => sum(scores(v, n)) || null),
          ...Array.from({ length: COLS }, (_, j) => h('td', null, field({ key: k(n, `p${j + 1}`), type: 'number', align: 'center' })))));
    }
    // 最後のページに全社の計（元の「計」の行）
    if (page === pageCount(values)) {
      tb.append(
        h('tr', { class: 'b1-top' }, h('th', { rowspan: 2, colspan: 3 }, '計（全社）'),
          auto('allRank', (v) => (all(v).length ? rankOf(sum(all(v)) / all(v).length) : ''), 'b1-rank', 2),
          auto('allAvg', (v) => (all(v).length ? Math.round(sum(all(v)) / all(v).length * 10) / 10 : null), '', 2),
          auto('allCnt', (v) => all(v).length || null, 'b1-sub'), h('td', { colspan: COLS, rowspan: 2 })),
        h('tr', null, auto('allSum', (v) => sum(all(v)) || null)));
    }
    const table = h('table', { class: 'grid b1 s23' },
      h('colgroup', null, ...[7, 42, 56, 10, 12, 15, ...Array(COLS).fill(null)].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
    if (page !== pageCount(values)) return table;
    // 最後のページの下に、ページの追加・削除（印刷しない）
    const lastHasData = () => Object.keys(values).some((key) => {
      const m = /^d(\d+)\.(name|addr|tel|tanto|k\d+|p\d+)$/.exec(key);
      return m && Number(m[1]) > (page - 1) * PER_PAGE && String(values[key] ?? '') !== '';
    });
    return h('div', null, table, h('div', { class: 'k1-pages no-print' },
      h('button', { type: 'button', onclick: () => { setVal('pageCount', String(page + 1)); rebuild(); } }, `＋ ページを追加（${PER_PAGE}社）`),
      page > 1 ? h('button', { type: 'button', onclick: () => {
        if (lastHasData() && !confirm(`${page}ページ目には入力があります。消してページを減らしますか？`)) return;
        for (let i = 1; i <= PER_PAGE; i++) Object.keys(values).filter((key) => key.startsWith(`d${(page - 1) * PER_PAGE + i}.`)).forEach((key) => delete values[key]);
        setVal('pageCount', String(page - 1)); rebuild();
      } }, '最後のページを削除') : null,
      h('span', { class: 'k1-hint' }, '会社が増えたらページを足してください。「ファイルに保存」したファイルを共有フォルダに置くと、設計部で共有できます。')));
  } });

  const notes = { type: 'notes', items: [
    '※　総合評価の決定は、年度評価点より右の通りとする。（ Ａ：71以上、Ｂ：61～70、Ｃ：41～60、Ｄ：40以下 ）　Ａ・Ｂ・Ｃは合格、Ｄは不合格とする。　灰色の欄は自動で計算します。',
  ] };

  FORM_DEFS['sekkei-a0023'] = {
    code: '本-設計-A0023', title: '設計協力会社台帳',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    paper: 'A3', orientation: 'landscape',
    // 元は表題の前に「　　年度」
    meta: [{ label: '年　度', key: 'nendo', w: 30 }],
    stamps: [{ boxes: ['承　認', '作　成'] }], // 元は表の右下
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => ({
      subtitle: pageCount(v) > 1 ? `（${i + 1}/${pageCount(v)}）` : '',
      blocks: [ledger(i + 1), notes],
    })),
  };
})();
