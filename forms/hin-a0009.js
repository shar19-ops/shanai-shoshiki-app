// 本-品質-A0009 計測機器管理台帳（品質記録様式。元Excel：本ー品質ーA0009 計測機器管理台帳.xlsx、A4縦1ページ＝13台）
// 工務A0001 図面管理台帳と同じく、台帳なのでファイルに保存し、機器が増えたらページを足す（1ページ13台、元と同じ）
// 1台は4段：機器仕様（形式型番・定格・製作所・製造番号）。製造・購入年月日は2段ずつ。校正期間は元の様式と同じく「1年」が最初から入り、書き換えられる
// 元の様式に押印欄はない（記入者は名前を書く欄）
(function () {
  const PER_PAGE = 13;
  const SPEC = [['kata', '形式型番'], ['teikaku', '定格'], ['maker', '製作所'], ['seizoNo', '製造番号']];
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  const k = (n, f) => `d${n}.${f}`; // n：通し番号（1〜）

  const ledger = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const ta = (n, f) => h('td', { rowspan: 4, class: 'k1-ta' }, field({ key: k(n, f), type: 'textarea', plain: true, lines: 1 }));
    const date = (key) => h('td', { rowspan: 2 }, field({ key, type: 'date', jp: true, style: 'short' }));
    const tb = h('tbody', null, h('tr', null, h('th', null, '管理番号'), h('th', null, '機器名称'), h('th', { colspan: 4 }, '機　器　仕　様'),
      h('th', null, '校正', h('br'), '期間'), h('th', null, '備　考'), h('th', null, '記入者')));
    for (let i = 1; i <= PER_PAGE; i++) {
      const n = (page - 1) * PER_PAGE + i;
      SPEC.forEach(([f, label], r) => tb.append(h('tr', { class: r === 0 ? 'k1-top' : null },
        r === 0 ? h('td', { rowspan: 4 }, field({ key: k(n, 'kanri'), align: 'center' })) : null,
        r === 0 ? ta(n, 'name') : null,
        h('td', { class: 'h09-lbl' }, label),
        h('td', null, field({ key: k(n, f) })),
        r % 2 === 0 ? h('td', { rowspan: 2, class: 'h09-lbl' }, r === 0 ? '製　造' : '購　入', h('br'), '年月日') : null,
        r % 2 === 0 ? date(k(n, r === 0 ? 'seizo' : 'konyu')) : null,
        r === 0 ? h('td', { rowspan: 4 }, field({ key: k(n, 'kosei'), align: 'center', default: '1年' })) : null,
        r === 0 ? ta(n, 'biko') : null,
        r === 0 ? ta(n, 'kinyu') : null)));
    }
    const table = h('table', { class: 'grid k1 h09' },
      h('colgroup', null, ...[21, 36, 15, null, 12, 21, 11, 22, 13].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
    if (page !== pageCount(values)) return table;
    // 最後のページの下に、ページの追加・削除（印刷しない）。校正期間の初期値「1年」は入力に数えない
    const lastHasData = () => Object.keys(values).some((key) => {
      const m = /^d(\d+)\.(.+)$/.exec(key);
      return m && Number(m[1]) > (page - 1) * PER_PAGE && String(values[key] ?? '') !== '' && !(m[2] === 'kosei' && values[key] === '1年');
    });
    return h('div', null, table, h('div', { class: 'k1-pages no-print' },
      h('button', { type: 'button', onclick: () => { setVal('pageCount', String(page + 1)); rebuild(); } }, `＋ ページを追加（${PER_PAGE}台）`),
      page > 1 ? h('button', { type: 'button', onclick: () => {
        if (lastHasData() && !confirm(`${page}ページ目には入力があります。消してページを減らしますか？`)) return;
        for (let i = 1; i <= PER_PAGE; i++) Object.keys(values).filter((key) => key.startsWith(`d${(page - 1) * PER_PAGE + i}.`)).forEach((key) => delete values[key]);
        setVal('pageCount', String(page - 1)); rebuild();
      } }, '最後のページを削除') : null,
      h('span', { class: 'k1-hint' }, '機器が増えたらページを足してください。「ファイルに保存」で台帳をファイルに残せます。')));
  } });

  FORM_DEFS['hin-a0009'] = {
    code: '本-品質-A0009', title: '計測機器管理台帳',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    meta: [],
    stamps: [], // 元の様式に押印欄なし
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => ({
      subtitle: pageCount(v) > 1 ? `（${i + 1}/${pageCount(v)}）` : '',
      blocks: [ledger(i + 1)],
    })),
  };
})();
