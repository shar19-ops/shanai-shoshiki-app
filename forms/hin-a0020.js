// 本-品質-A0020 検査指摘事項・確認書（品質記録様式。元Excel：本ー品質ーA0020 検査指摘事項・確認書.xlsx、A4縦2ページ）
// 1ページ目：保管・承認などの4つの押印欄はヘッダーの右上、検査者の発行印は上の表の右（ユーザー指定）。工番・件名・検査種別・検査者・被検査者、指摘事項の表、注意書き・回送順
// 2ページ目以降：指摘事項の表の続き。最後のページの最後の行に書いたら自動でページを足す（ユーザー指定）。ボタンでも足し引きできる
// 指摘事項・処置は長文を折り返し、文字の大きさはそのままで行の高さを伸ばす。伸びた分そのページの行は減り、あふれた行は次のページへ（ユーザー指定）
// No は自動で通し番号。手直期限・再検査合格日は日付を選ぶ（空欄なら「/」で手書き）。作業所長にデート印
(function () {
  const FIRST = 22, NEXT = 32; // 1ページ目と2ページ目以降の行数（どの行も1行分の高さのとき）
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  // 指摘事項・処置が長くて行が高くなると、そのページに入る行は減る（あふれた行は次のページへ）。counts：ページごとの行数（画面で測って決める）
  let counts = {};
  const cnt = (page) => counts[page] ?? (page === 1 ? FIRST : NEXT);
  const rowsOf = (page) => {
    let from = 1;
    for (let q = 1; q < page; q++) from += cnt(q);
    return [from, from + cnt(page) - 1];
  };
  const hasData = (values, n) => Object.keys(values).some((key) => key.startsWith(`r${n}.`) && String(values[key] ?? '') !== '');
  // 行の高さを測って、ページごとの行数を決め直す（変わったときだけ作り直す）
  const relayout = (values, setVal, rebuild) => {
    const trs = [...document.querySelectorAll('table.h20 tr[data-n]')];
    if (!trs.length) return;
    const hs = {};
    trs.forEach((tr) => { hs[tr.dataset.n] = tr.getBoundingClientRect().height; });
    const base = Math.min(...Object.values(hs)); // 1行分の高さ
    const pages = pageCount(values);
    const next = {};
    let n = 1;
    for (let p = 1; p <= pages; p++) {
      const budget = (p === 1 ? FIRST : NEXT) * base + 1;
      let used = 0, k = 0;
      while (k === 0 || used + (hs[n] ?? base) <= budget) { used += hs[n] ?? base; n++; k++; }
      next[p] = k;
    }
    // 書いた行が最後のページからあふれた、または最後の行に書いたらページを足す
    const last = n - 1, maxData = Math.max(0, ...Object.keys(values).map((key) => (/^r(\d+)\./.exec(key) || [])[1]).filter((x) => x && hasData(values, x)).map(Number));
    const addPage = maxData >= last;
    const same = Object.keys(next).every((p) => cnt(Number(p)) === next[p]);
    if (same && !addPage) return;
    counts = next;
    // 作り直すと入力中の欄が消えるので、同じ行・同じ列の欄にカーソルを戻す
    const act = document.activeElement, tr = act && act.closest && act.closest('table.h20 tr[data-n]');
    const pos = tr ? { n: tr.dataset.n, col: [...tr.children].indexOf(act.closest('td')) } : null;
    if (addPage) setVal('pageCount', String(pages + 1));
    rebuild();
    if (pos) {
      const td = document.querySelector(`table.h20 tr[data-n="${pos.n}"]`)?.children[pos.col];
      const el = td && td.querySelector('textarea, input');
      if (el) el.focus();
    }
  };

  const list = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const date = (key) => field({ key, type: 'date', jp: true, style: 'm/d' });
    const [from, to] = rowsOf(page);
    // 指摘事項・処置：長い文は欄の中で折り返し、文字の大きさはそのままで行の高さを伸ばす（ユーザー指定）
    const grow = (ta) => { ta.style.height = '0'; ta.style.height = ta.scrollHeight + 'px'; };
    const wrap = (key) => {
      const ta = field({ key, type: 'textarea', plain: true, lines: 1 });
      ta.classList.add('h20-wrap');
      ta.addEventListener('input', () => grow(ta));
      requestAnimationFrame(() => grow(ta));
      return ta;
    };
    const tb = h('tbody', null, h('tr', null, ...['No', '指　摘　事　項', '処　　置', '手直\n期限', '再検査\n合格日'].map((t) => h('th', null, ...t.split('\n').flatMap((s, i) => (i ? [h('br'), s] : [s]))))));
    for (let n = from; n <= to; n++) {
      tb.append(h('tr', { 'data-n': n }, h('td', { class: 'h11-no' }, String(n)),
        h('td', null, wrap(`r${n}.shiteki`)), h('td', null, wrap(`r${n}.shochi`)),
        h('td', null, date(`r${n}.kigen`)), h('td', null, date(`r${n}.gokaku`))));
    }
    // 入力を終えて欄を離れたら、行の高さを測ってページの行数を決め直す（最後の行に書いたらページを足す）
    const onchange = () => setTimeout(() => relayout(values, setVal, rebuild));
    const table = h('table', { class: 'grid h20', onchange }, h('colgroup', null, ...[9, null, null, 18, 18].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
    if (page !== pageCount(values)) return table;
    // 開いたとき（ファイルを開いたときも）は、行の高さが決まってから測る
    requestAnimationFrame(() => requestAnimationFrame(() => relayout(values, setVal, rebuild)));
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
      } }, '最後のページを削除') : null,
      h('span', { class: 'k1-hint' }, '最後の行に書くと、次のページが自動で増えます。')));
  } });

  // 検査者の発行印は元の様式どおり上の表の右（ユーザー指定）
  const head = { type: 'grid', cols: 5, colWidths: ['20mm', '40mm', '14mm', null, '20mm'], rowH: 6.5, rows: [
    [{ label: '工　番', key: 'koban', maxlength: 12, lw: 1, span: 2 }, { label: '件　名', key: 'subject', lw: 1, span: 2 },
      { stamps: [{ boxes: ['検査者\n発　行'], dates: true, stampKey: 'h.' }], span: 1, rs: 4 }],
    [{ label: '検査種別', key: 'shubetsu', type: 'radio', lw: 1, span: 4,
      options: ['1．工程内検査', '2．現場巡回検査', '3．中間検査', '4．最終検査', '5．安全･衛生現場巡回検査', '6．その他'] }],
    [{ label: '検 査 者', key: 'kensa', lw: 1, span: 4 }],
    [{ label: '被検査者', key: 'hikensa', lw: 1, span: 4 }],
  ] };

  // 注意書き（左）と回送順（右）
  const foot = { type: 'row', gap: 6, align: 'flex-start', items: [
    { type: 'custom', render: ({ h }) => h('ul', { class: 'notes h20-notes' },
      h('li', null, '1.　検査者は、手直期限日を記入すること。'),
      h('li', null, '2.　作業所長は、再検査を実施し、合格した日を', h('br'), '　　再検査合格日欄に記入すること。')) },
    { type: 'custom', render: ({ h }) => h('table', { class: 'h20-route' }, h('tbody', null, ...[
      ['①工程内検査：', '作業所長→工事長→安全品質保証部長'],
      ['②現場巡回検査：', '作業所長→工事長→検査者→安全品質保証部長'],
      ['③中間検査：', '作業所長→工事長→検査者→安全品質保証部長'],
      ['④最終検査：', '作業所長→工事長→検査者→安全品質保証部長'],
      ['⑤安全･衛生巡回検査：', '作業所長→工事長→検査者→安全品質保証部長'],
    ].map(([a, b]) => h('tr', null, h('td', null, a), h('td', null, b))))) },
  ] };

  FORM_DEFS['hin-a0020'] = {
    code: '本-品質-A0020', title: '検査指摘事項・確認書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    fileIO: true, // 検査者・作業所長・品質保証部の間で書き足していくのでファイルに保存
    fileKeys: ['koban', 'subject'], // ファイル名は「本-品質-A0020_工番_件名_日付.json」
    selfStamp: '作業所長',
    sheetClass: 'h18', // 検査種別は3つずつ2段（本-品質-A0018 と同じ）
    meta: [],
    // 保管・承認などの押印欄は1ページ目のヘッダーの右上（2ページ目以降は出さない）。検査者の発行印は上の表の中
    stamps: [{ boxes:['安全品質|保証部長\n保　管', '検査者|（合否判定者）\n承　認', '工事長|工事部長', '作業所長'], dates: true }],
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => ({
      subtitle: pageCount(v) > 1 ? `（${i + 1}/${pageCount(v)}）` : '',
      ...(i ? { stamps: [] } : {}),
      blocks: i === 0 ? [head, list(1), foot] : [list(i + 1)],
    })),
  };
})();
