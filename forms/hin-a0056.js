// 本-品質-A0056 NET検討会報告書（品質記録様式。元Excel：本ー品質ーA0056 NET検討会報告書.xlsx、A4縦2ページ）
// 本-品質-A0053・A0055 と同じ作り：押印欄はヘッダーの右上（6つを3つずつ2段。元の様式の空欄の1つも残す）、工事長／工事部長（発行）はクリックでデート印。
//   その横（表題の下）に工番・件名・開催日・開催場所・事業所・部署・作業所長・発注者・契約先・契約金額・粗利率・出席者
// No・問題点・処置結果・印の表は、長文を折り返して行の高さを伸ばし、あふれた行は次のページへ。最後の行に書いたら、または入りきらなくなったらページを自動で足す。
//   ページの追加・削除のボタンもある（議題によりページ数が増減＝チェック表のご指示。元は2ページ固定。少なければ1枚）
//   処置結果の左の細い欄は元の様式どおり見出しなし（書き込める）。印の欄はクリックで三文判風の認印（小さめ）
// 本店長指示と「※安全品質保証部 保管」は1ページ目の表の下。ISOの要求事項【7.1】【8.1】はヘッダーの番号の後ろ
(function () {
  // 問題点の表の行数（どの行も1行分の高さのとき）。1ページ目（本店長指示の上）・2ページ目以降
  const FIRST = 19, NEXT = 32;
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  let counts = {};
  const cap = (p) => (p === 1 ? FIRST : NEXT);
  const rowsOf = (p) => {
    let from = 1;
    for (let q = 1; q < p; q++) from += counts[q] ?? cap(q);
    return [from, from + (counts[p] ?? cap(p)) - 1];
  };
  const hasData = (values, n) => ['no', 'mondai', 'kubun', 'kekka', 'in'].some((k) => String(values[`r${n}.${k}`] ?? '') !== '');
  // 行の高さを測ってページごとの行数を決め直す（本-品質-A0053 と同じ）。edited：入力して欄を離れたとき
  const relayout = (values, setVal, rebuild, edited) => {
    const trs = [...document.querySelectorAll('table.h56 tr[data-n]')];
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
    const act = document.activeElement, tr = act && act.closest && act.closest('table.h56 tr[data-n]');
    const pos = tr ? { n: tr.dataset.n, col: [...tr.children].indexOf(act.closest('td')) } : null;
    if (addPage) { setVal('pageCount', String(pages + 1)); counts = {}; }
    rebuild();
    if (pos) {
      const td = document.querySelector(`table.h56 tr[data-n="${pos.n}"]`)?.children[pos.col];
      const el = td && td.querySelector('textarea, input');
      if (el) el.focus();
    }
  };

  // No・問題点・処置結果・印の表（page ページ目）
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
    const tb = h('tbody', null, h('tr', null, h('th', null, 'No'), h('th', null, '問　題　点'), h('th', { colspan: 2 }, '処　置　結　果'), h('th', null, '印')));
    for (let n = from; n <= to; n++) {
      tb.append(h('tr', { 'data-n': n }, h('td', null, field({ key: `r${n}.no`, align: 'center' })),
        h('td', null, wrap(`r${n}.mondai`)), h('td', null, field({ key: `r${n}.kubun`, align: 'center' })),
        h('td', null, wrap(`r${n}.kekka`)), h('td', { class: 'h56-in' }, field({ key: `r${n}.in`, type: 'inkan' }))));
    }
    const onchange = () => setTimeout(() => relayout(values, setVal, rebuild, true));
    const table = h('table', { class: 'grid h53 h56', onchange }, h('colgroup', null, ...[9, 84, 9, null, 9].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
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
      h('span', { class: 'k1-hint' }, '議題が多いときは、最後の行に書くと次のページが自動で増えます。印の欄はクリックで押印。')));
  } });

  FORM_DEFS['hin-a0056'] = {
    code: '本-品質-A0056', title: 'NET検討会報告書',
    iso: '【7.1】資源　【8.1】運用の計画及び管理', // 元の様式の右上の表示。ヘッダーの番号の後ろに（ユーザー指定）
    seitei: '06/03/30', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    fileIO: true, // 回送して押印してもらうのでファイルに保存
    fileKeys: ['koban', 'subject'], // ファイル名は「本-品質-A0056_工番_件名_日付.json」
    sheetClass: 'h53',
    selfStamp: '工事長|工事部長', // 発行の工事長／工事部長はクリックでデート印（A0053・A0055 と同じ）
    meta: [],
    stampClass: 'stack h53s',
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => (i ? { subtitle: `（${i + 1}/${pageCount(v)}）`, stamps: [], blocks: [list(i + 1)] } : {
      subtitle: pageCount(v) > 1 ? `（1/${pageCount(v)}）` : '',
      stamps: [
        { boxes: ['社　長', '本店長', '工事本部長|ＲＥ部長'], dates: true },
        { boxes: ['支店長', '工事長|工事部長\n発　行', ''], dates: true },
      ],
      // ヘッダーの情報は押印欄の横（表題の下）
      headBlocks: [
        { type: 'grid', cols: 4, colWidths: ['17mm', null, '17mm', null], rowH: 5.6, rows: [
          [{ label: '開催日', key: 'kaisaibi', type: 'date', jp: true, lw: 1, span: 2 }, { label: '開催場所', key: 'basho', lw: 1, span: 2 }],
          [{ label: '事業所', key: 'jigyo', lw: 1, span: 2 }, { label: '部　署', key: 'busho', lw: 1, span: 2 }],
          [{ label: '工　番', key: 'koban', maxlength: 12, lw: 1, span: 2 }, { label: '作業所長', key: 'shocho', lw: 1, span: 2 }],
          [{ label: '件　名', key: 'subject', lw: 1, span: 4 }],
          [{ label: '発 注 者\n（施主）', key: 'hatchu', lw: 1, span: 2 }, { label: '契 約 先\n（元請）', key: 'keiyaku', lw: 1, span: 2 }],
          [{ label: '契約金額', key: 'kingaku', type: 'money', unit: '千円', lw: 1, span: 2 }, { label: '粗利率', key: 'arari', type: 'number', unit: '％', dec: 1, lw: 1, span: 2 }],
          [{ label: '出席者', key: 'shusseki', type: 'textarea', lines: 2, lw: 1, span: 4 }],
        ] },
      ],
      blocks: [
        list(1),
        { type: 'grid', rows: [[{ label: '本店長\n指示', key: 'shiji', type: 'textarea', lines: 3, lw: 2, span: 24 }]] },
        { type: 'para', text: '※安全品質保証部 保管', style: 'font-weight:bold;margin:0' },
      ] })),
  };
})();
