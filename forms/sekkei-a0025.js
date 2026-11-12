// 本-設計-A0025 図面リスト（品質記録様式。元Excel：本-設計-A0025 図面リスト.xls、A4縦1ページ）
// 2026-11-12 ユーザー指定でアプリ化。本-設計-A0024 設計作図依頼書の「別紙図面リスト」にあたる
// 元の様式の注記「行数及び行高さは変更してもよい」→ 図面が増えたらページを足す（1ページ29行。設計図面管理台帳 A0022 と同じ作り）
// 右上の No.（○／○）はページ番号を自動。確認申請図の欄はクリックで ○。元の様式に押印欄はない
(function () {
  const PER_PAGE = 29; // 元の様式と同じ行数
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  const k = (n, f) => `d${n}.${f}`; // n：通し番号（1〜）

  // 件名・サイズ・作成日（各ページに同じ内容を出す。入力は1ページ目）、右上に No.
  const head = (page) => ({ type: 'custom', render: ({ h, field, values }) => {
    const pages = pageCount(values);
    const no = h('div', { class: 's25-no' }, `No.　${page}　／　${pages}`);
    // 2ページ目以降は1ページ目の内容を文字で出す（日付は「2026年 11月 12日」の形）
    const jp = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '')); return m ? `${m[1]}年 ${Number(m[2])}月 ${Number(m[3])}日` : String(s || ''); };
    const cell = (key, extra) => (page === 1 ? field({ key, ...extra }) : h('div', { class: 's25-copy' + (extra && extra.align === 'center' ? ' c' : '') }, extra && extra.type === 'date' ? jp(values[key]) : String(values[key] || '')));
    return h('div', null, no, h('table', { class: 'grid s25-head' },
      h('colgroup', null, ...[14, null, 14, 34, 16, 42].map((w) => h('col', { style: w ? `width:${w}mm` : null }))),
      h('tbody', null, h('tr', null,
        h('th', null, '件名'), h('td', null, cell('subject')),
        h('th', null, 'サイズ'), h('td', null, cell('size', { align: 'center' })),
        h('th', null, '作成日'), h('td', null, cell('sakusei', { type: 'date', jp: true }))))));
  } });

  const list = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const tb = h('tbody', null, h('tr', null, h('th', null, '番号'), h('th', null, '図　面　名　称'), h('th', null, '縮尺'),
      h('th', { class: 's25-kaku' }, '確認', h('br'), '申請図'), h('th', null, '作図担当'), h('th', null, '備考')));
    for (let i = 1; i <= PER_PAGE; i++) {
      const n = (page - 1) * PER_PAGE + i;
      tb.append(h('tr', null, h('td', null, field({ key: k(n, 'no'), align: 'center' })), h('td', null, field({ key: k(n, 'name') })),
        h('td', null, field({ key: k(n, 'scale'), align: 'center' })), h('td', { class: 's25-mark' }, field({ key: k(n, 'kakunin'), type: 'mark' })),
        h('td', null, field({ key: k(n, 'tanto'), align: 'center' })), h('td', null, field({ key: k(n, 'biko') }))));
    }
    const table = h('table', { class: 'grid s25' },
      h('colgroup', null, ...[16, null, 17, 13, 20, 28].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
    const note = h('div', { class: 's25-note' }, '注記：行数及び行高さは変更してもよいこととする。');
    if (page !== pageCount(values)) return h('div', null, table, note);
    // 最後のページの下に、ページの追加・削除（印刷しない）
    const lastHasData = () => Object.keys(values).some((key) => {
      const m = /^d(\d+)\./.exec(key);
      return m && Number(m[1]) > (page - 1) * PER_PAGE && String(values[key] ?? '') !== '';
    });
    return h('div', null, table, note, h('div', { class: 'k1-pages no-print' },
      h('button', { type: 'button', onclick: () => { setVal('pageCount', String(page + 1)); rebuild(); } }, `＋ ページを追加（${PER_PAGE}行）`),
      page > 1 ? h('button', { type: 'button', onclick: () => {
        if (lastHasData() && !confirm(`${page}ページ目には入力があります。消してページを減らしますか？`)) return;
        for (let i = 1; i <= PER_PAGE; i++) Object.keys(values).filter((key) => key.startsWith(`d${(page - 1) * PER_PAGE + i}.`)).forEach((key) => delete values[key]);
        setVal('pageCount', String(page - 1)); rebuild();
      } }, '最後のページを削除') : null,
      h('span', { class: 'k1-hint' }, '図面が増えたらページを足してください（件名・サイズ・作成日は各ページに同じ内容が出ます）。')));
  } });

  FORM_DEFS['sekkei-a0025'] = {
    code: '本-設計-A0025', title: '図面リスト',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    meta: [],
    stamps: [], // 元の様式に押印欄なし
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => ({ blocks: [head(i + 1), list(i + 1)] })),
  };
})();
