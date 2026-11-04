// 本-設計-A0021 設計変更連絡書（品質記録様式。元Excel：本-設計-A0021 設計変更連絡書.xlsx、A4縦1ページ）
// 設計担当者が作成、課長・部長が確認・承認（ユーザー指定）：ファイルに保存して BOX の設計部フォルダに置き、Box Drive から開いて上書きする
// 本-品質-A0056 と同じ作り：No・内容・発言者の表は長文を折り返して行の高さを伸ばし、あふれた行は次のページへ。最後の行に書いたら、
//   または入りきらなくなったらページを自動で足す（ページの追加・削除のボタンもある。少なければ1枚）
// 押印欄は承認・確認・作成（元は表の右下）→ 右上、作成にデート印（日付は作成日）
(function () {
  // 内容の表の行数（どの行も1行分の高さのとき）。1ページ目・2ページ目以降
  const FIRST = 24, NEXT = 34;
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  let counts = {};
  const cap = (p) => (p === 1 ? FIRST : NEXT);
  const rowsOf = (p) => {
    let from = 1;
    for (let q = 1; q < p; q++) from += counts[q] ?? cap(q);
    return [from, from + (counts[p] ?? cap(p)) - 1];
  };
  const hasData = (values, n) => ['no', 'naiyo', 'who'].some((k) => String(values[`r${n}.${k}`] ?? '') !== '');
  // 行の高さを測ってページごとの行数を決め直す（本-品質-A0053・A0056 と同じ）。edited：入力して欄を離れたとき
  const relayout = (values, setVal, rebuild, edited) => {
    const trs = [...document.querySelectorAll('table.s21 tr[data-n]')];
    if (!trs.length) return;
    const hs = {};
    trs.forEach((tr) => { hs[tr.dataset.n] = tr.getBoundingClientRect().height; });
    const base = Math.min(...Object.values(hs));
    const pages = pageCount(values);
    const next = {};
    let n = 1;
    for (let p = 1; p <= pages; p++) {
      const budget = cap(p) * base + 1;
      let used = 0, k = 0;
      while (k === 0 || used + (hs[n] ?? base) <= budget) { used += hs[n] ?? base; n++; k++; }
      next[p] = k;
    }
    const last = n - 1;
    const maxData = Math.max(0, ...Object.keys(values).map((key) => Number((/^r(\d+)\./.exec(key) || [])[1] || 0)).filter((x) => x && hasData(values, x)));
    const addPage = maxData > last || (edited && maxData > 0 && maxData === last);
    const same = Object.keys(next).length === Object.keys(counts).length && Object.keys(next).every((p) => counts[p] === next[p]);
    if (same && !addPage) return;
    counts = next;
    const act = document.activeElement, tr = act && act.closest && act.closest('table.s21 tr[data-n]');
    const pos = tr ? { n: tr.dataset.n, col: [...tr.children].indexOf(act.closest('td')) } : null;
    if (addPage) { setVal('pageCount', String(pages + 1)); counts = {}; }
    rebuild();
    if (pos) {
      const td = document.querySelector(`table.s21 tr[data-n="${pos.n}"]`)?.children[pos.col];
      const el = td && td.querySelector('textarea, input');
      if (el) el.focus();
    }
  };

  // No・内容・発言者の表（page ページ目）
  const list = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const pages = pageCount(values);
    const [from, to] = rowsOf(page);
    const wrap = (key) => {
      const ta = field({ key, type: 'textarea', plain: true, lines: 1 });
      ta.classList.add('h53-wrap');
      const grow = () => { ta.style.height = '0'; ta.style.height = ta.scrollHeight + 'px'; };
      ta.addEventListener('input', grow);
      requestAnimationFrame(grow);
      return ta;
    };
    const tb = h('tbody', null, h('tr', null, h('th', null, 'No'), h('th', null, '内　　　　容'), h('th', null, '発言者')));
    for (let n = from; n <= to; n++) {
      tb.append(h('tr', { 'data-n': n }, h('td', null, field({ key: `r${n}.no`, align: 'center' })),
        h('td', null, wrap(`r${n}.naiyo`)), h('td', null, wrap(`r${n}.who`))));
    }
    const onchange = () => setTimeout(() => relayout(values, setVal, rebuild, true));
    const table = h('table', { class: 'grid h53 s21', onchange }, h('colgroup', null, ...[11, null, 28].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
    if (page !== pages) return table;
    requestAnimationFrame(() => requestAnimationFrame(() => relayout(values, setVal, rebuild)));
    const lastHasData = () => { for (let n = from; n <= to; n++) if (hasData(values, n)) return true; return false; };
    return h('div', null, table, h('div', { class: 'k1-pages no-print' },
      h('button', { type: 'button', onclick: () => { counts = {}; setVal('pageCount', String(pages + 1)); rebuild(); } }, '＋ ページを追加'),
      pages > 1 ? h('button', { type: 'button', onclick: () => {
        if (lastHasData() && !confirm(`${pages}ページ目には入力があります。消してページを減らしますか？`)) return;
        Object.keys(values).filter((key) => { const m = /^r(\d+)\./.exec(key); return m && Number(m[1]) >= from; }).forEach((key) => delete values[key]);
        counts = {}; setVal('pageCount', String(pages - 1)); rebuild();
      } }, '最後のページを削除') : null,
      h('span', { class: 'k1-hint' }, '内容が多いときは、最後の行に書くと次のページが自動で増えます。「ファイルに保存」したファイルを BOX の設計部フォルダに置くと共有できます。')));
  } });

  const head = { type: 'grid', lw: 3, rowH: 7, rows: [
    [{ label: '件　名', key: 'subject', span: 15 }, { label: '作成日', key: 'sakusei', type: 'date', jp: true, span: 9 }],
    [{ label: '打合せ日', key: 'uchiawase', type: 'date', jp: true, span: 10 },
      { label: '時　間', key: 'jikanW', type: 'inline', span: 14, parts: [{ key: 'tFrom', type: 'time' }, '～', { key: 'tTo', type: 'time' }] }],
    [{ label: '打合場所', key: 'basho', span: 24 }],
    [{ label: '出席者', key: 'shusseki', type: 'textarea', lines: 3, span: 24 }],
  ] };

  FORM_DEFS['sekkei-a0021'] = {
    code: '本-設計-A0021', title: '設計変更連絡書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    selfStamp: '作　成', stampDate: 'sakusei', // 作成にデート印（日付は作成日）
    meta: [],
    stamps: [{ boxes: ['承　認', '確　認', '作　成'] }], // 元は表の右下
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => (i
      ? { subtitle: `（${i + 1}/${pageCount(v)}）`, stamps: [], blocks: [list(i + 1)] }
      : { subtitle: pageCount(v) > 1 ? `（1/${pageCount(v)}）` : '', blocks: [head, list(1)] })),
  };
})();
