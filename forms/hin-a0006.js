// 本-品質-A0006 内部監査チェックリスト（品質記録様式。元Excel：本ー品質ーA0006 内部監査チェックリスト.xlsx、A4縦1ページ＝20行）
// No・質問事項・観察事項（指摘事項）・部署・対応者・評価の表は本-設計-A0021 と同じ作り：長文を折り返して行の高さを伸ばし、あふれた行は次のページへ。
//   最後の行に書いたら、または入りきらなくなったらページを自動で足す（ページの追加・削除のボタンもある）。No は通し番号。評価は A・B・C から選ぶ
// 同じ行の欄は高さをそろえる（画面で欄の色がまだらにならないように）。監査日・監査員はどのページにも出す。元の様式に押印欄はない
(function () {
  const PER_PAGE = 20; // どの行も1段分の高さのときの行数（元の様式と同じ）
  const COLS = ['q', 'obs', 'busho', 'who', 'hyoka'];
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  let counts = {};
  const rowsOf = (p) => {
    let from = 1;
    for (let q = 1; q < p; q++) from += counts[q] ?? PER_PAGE;
    return [from, from + (counts[p] ?? PER_PAGE) - 1];
  };
  const hasData = (values, n) => COLS.some((k) => String(values[`r${n}.${k}`] ?? '') !== '');
  // 行の高さを測ってページごとの行数を決め直す（本-設計-A0021 と同じ）。edited：入力して欄を離れたとき
  const relayout = (values, setVal, rebuild, edited) => {
    const trs = [...document.querySelectorAll('table.h06 tr[data-n]')];
    if (!trs.length) return;
    const hs = {};
    trs.forEach((tr) => { hs[tr.dataset.n] = ShoshikiApp.layoutH(tr); });
    const base = Math.min(...Object.values(hs));
    const pages = pageCount(values);
    const next = {};
    let n = 1;
    for (let p = 1; p <= pages; p++) {
      const budget = PER_PAGE * base + 1;
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
    const act = document.activeElement, tr = act && act.closest && act.closest('table.h06 tr[data-n]');
    const pos = tr ? { n: tr.dataset.n, col: [...tr.children].indexOf(act.closest('td')) } : null;
    if (addPage) { setVal('pageCount', String(pages + 1)); counts = {}; }
    rebuild();
    if (pos) {
      const td = document.querySelector(`table.h06 tr[data-n="${pos.n}"]`)?.children[pos.col];
      const el = td && td.querySelector('textarea, select');
      if (el) el.focus();
    }
  };

  // No・質問事項・観察事項・部署・対応者・評価の表（page ページ目）
  const list = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const pages = pageCount(values);
    const [from, to] = rowsOf(page);
    // 同じ行の記述欄を、いちばん長い欄の高さにそろえる
    const fit = (tr) => {
      const tas = [...tr.querySelectorAll('textarea')];
      tas.forEach((ta) => { ta.style.height = '0'; });
      const max = Math.max(...tas.map((ta) => ta.scrollHeight));
      tas.forEach((ta) => { ta.style.height = `${max}px`; });
    };
    const tb = h('tbody', null, h('tr', null, h('th', null, 'No'), h('th', null, '質　問　事　項'), h('th', null, '観察事項（指摘事項）'),
      h('th', null, '部　署'), h('th', null, '対応者'), h('th', null, '評価')));
    for (let n = from; n <= to; n++) {
      const wrap = (k) => {
        const ta = field({ key: `r${n}.${k}`, type: 'textarea', plain: true, lines: 1 });
        ta.classList.add('h53-wrap');
        return h('td', null, ta);
      };
      const tr = h('tr', { 'data-n': n }, h('td', { class: 'h06-no' }, String(n)), wrap('q'), wrap('obs'), wrap('busho'), wrap('who'),
        h('td', null, field({ key: `r${n}.hyoka`, type: 'select', options: ['A', 'B', 'C'], align: 'center' })));
      tr.addEventListener('input', () => fit(tr));
      requestAnimationFrame(() => fit(tr));
      tb.append(tr);
    }
    const onchange = () => setTimeout(() => relayout(values, setVal, rebuild, true));
    const table = h('table', { class: 'grid h53 h06', onchange }, h('colgroup', null, ...[9, 56, 56, 26, 26, null].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
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
      h('span', { class: 'k1-hint' }, '質問が多いときは、最後の行に書くと次のページが自動で増えます。')));
  } });

  const head = { type: 'grid', lw: 3, rowH: 7.8, rows: [
    [{ label: '監査日', key: 'kansabi', type: 'date', jp: true, span: 10 }, { label: '監査員', key: 'kansain', span: 14 }],
  ] };
  const note = { type: 'notes', items: ['※　評価　　A：重欠点、B：軽欠点、C：勧告'] };

  FORM_DEFS['hin-a0006'] = {
    code: '本-品質-A0006', title: '内部監査チェックリスト',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    meta: [],
    stamps: [], // 元の様式に押印欄なし
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => ({
      subtitle: pageCount(v) > 1 ? `（${i + 1}/${pageCount(v)}）` : '',
      blocks: [head, list(i + 1), note],
    })),
  };
})();
