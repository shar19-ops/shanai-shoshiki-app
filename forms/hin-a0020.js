// 本-品質-A0020 検査指摘事項・確認書（品質記録様式。元Excel：本ー品質ーA0020 検査指摘事項・確認書.xlsx、A4縦2ページ）
// 1ページ目：工番・件名・検査種別・検査者・被検査者（右に検査者の発行印）、指摘事項の表、下に注意書き・回送順と押印欄（元の様式どおり）
// 2ページ目以降：指摘事項の表の続き。元は2ページ固定だが、指摘の数に合わせてページを足し引きする（チェック表のご指示）
// No は自動で通し番号。手直期限・再検査合格日は日付を選ぶ（空欄なら「/　/」で手書き）。作業所長にデート印
(function () {
  const FIRST = 22, NEXT = 32; // 1ページ目と2ページ目以降の行数
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  const rowsOf = (page) => (page === 1 ? [1, FIRST] : [FIRST + (page - 2) * NEXT + 1, FIRST + (page - 1) * NEXT]);

  const list = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const date = (key) => field({ key, type: 'date', jp: true, style: 'm/d' });
    const [from, to] = rowsOf(page);
    const tb = h('tbody', null, h('tr', null, ...['No', '指　摘　事　項', '処　　置', '手直\n期限', '再検査\n合格日'].map((t) => h('th', null, ...t.split('\n').flatMap((s, i) => (i ? [h('br'), s] : [s]))))));
    for (let n = from; n <= to; n++) {
      tb.append(h('tr', null, h('td', { class: 'h11-no' }, String(n)),
        h('td', null, field({ key: `r${n}.shiteki` })), h('td', null, field({ key: `r${n}.shochi` })),
        h('td', null, date(`r${n}.kigen`)), h('td', null, date(`r${n}.gokaku`))));
    }
    const table = h('table', { class: 'grid h20' }, h('colgroup', null, ...[9, null, null, 18, 18].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
    if (page !== pageCount(values)) return table;
    // 最後のページの下に、ページの追加・削除（印刷しない）
    const lastHasData = () => Object.keys(values).some((key) => {
      const m = /^r(\d+)\./.exec(key);
      return m && Number(m[1]) >= from && String(values[key] ?? '') !== '';
    });
    return h('div', null, table, h('div', { class: 'k1-pages no-print' },
      h('button', { type: 'button', onclick: () => { setVal('pageCount', String(page + 1)); rebuild(); } }, `＋ ページを追加（${NEXT}行）`),
      page > 1 ? h('button', { type: 'button', onclick: () => {
        if (lastHasData() && !confirm(`${page}ページ目には入力があります。消してページを減らしますか？`)) return;
        Object.keys(values).filter((key) => { const m = /^r(\d+)\./.exec(key); return m && Number(m[1]) >= from; }).forEach((key) => delete values[key]);
        setVal('pageCount', String(page - 1)); rebuild();
      } }, '最後のページを削除') : null));
  } });

  const head = { type: 'grid', cols: 5, colWidths: ['20mm', '40mm', '14mm', null, '20mm'], rowH: 6.5, rows: [
    [{ label: '工　番', key: 'koban', maxlength: 12, lw: 1, span: 2 }, { label: '件　名', key: 'subject', lw: 1, span: 2 },
      { stamps: [{ boxes: ['検査者'], dates: true, stampKey: 'h.' }], span: 1, rs: 4 }],
    [{ label: '検査種別', key: 'shubetsu', type: 'radio', lw: 1, span: 4,
      options: ['1．工程内検査', '2．現場巡回検査', '3．中間検査', '4．最終検査', '5．安全･衛生現場巡回検査', '6．その他'] }],
    [{ label: '検 査 者', key: 'kensa', lw: 1, span: 4 }],
    [{ label: '被検査者', key: 'hikensa', lw: 1, span: 4 }],
  ] };

  // 注意書きと回送順（左）、押印欄（右）
  const foot = { type: 'row', gap: 4, align: 'flex-start', items: [
    { type: 'custom', render: ({ h }) => h('div', { class: 'h20-foot' },
      h('ul', { class: 'notes' },
        h('li', null, '1.　検査者は、手直期限日を記入すること。'),
        h('li', null, '2.　作業所長は、再検査を実施し、合格した日を', h('br'), '　　再検査合格日欄に記入すること。')),
      h('table', { class: 'h20-route' }, h('tbody', null, ...[
        ['①工程内検査：', '作業所長→工事長→安全品質保証部長'],
        ['②現場巡回検査：', '作業所長→工事長→検査者→安全品質保証部長'],
        ['③中間検査：', '作業所長→工事長→検査者→安全品質保証部長'],
        ['④最終検査：', '作業所長→工事長→検査者→安全品質保証部長'],
        ['⑤安全･衛生巡回検査：', '作業所長→工事長→検査者→安全品質保証部長'],
      ].map(([a, b]) => h('tr', null, h('td', null, a), h('td', null, b)))))) },
    { w: 46, type: 'stamps', align: 'right', groups: [{ boxes: ['安全品質|保証部長\n保　管', '検査者|（合否判定者）\n承　認', '工事長|工事部長', '作業所長'], dates: true }] },
  ] };

  FORM_DEFS['hin-a0020'] = {
    code: '本-品質-A0020', title: '検査指摘事項・確認書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    fileIO: true, // 検査者・作業所長・品質保証部の間で書き足していくのでファイルに保存
    fileKeys: ['koban', 'subject'], // ファイル名は「本-品質-A0020_工番_件名_日付.json」
    selfStamp: '作業所長',
    sheetClass: 'h18', // 検査種別は3つずつ2段（本-品質-A0018 と同じ）
    meta: [],
    stamps: [], // 押印欄は元の様式どおり（発行印は右上の表の中、承認・保管は表の下）
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => ({
      subtitle: pageCount(v) > 1 ? `（${i + 1}/${pageCount(v)}）` : '',
      blocks: i === 0 ? [head, list(1), foot] : [list(i + 1)],
    })),
  };
})();
