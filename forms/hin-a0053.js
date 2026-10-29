// 本-品質-A0053 施工検討会報告書（品質記録様式。元Excel：本ー品質ーA0053施工検討会報告書.xlsx、A4縦2ページ）
// ISOの要求事項【8.1】はヘッダーの番号の後ろ。1ページ目：回送先の押印欄（ヘッダーの右上に4つずつ4段）とその横にヘッダーの情報・出席者、検討事項と実施計画、本店長指示
// 検討事項・実施計画は 本-品質-A0020 と同じく、長文を折り返して行の高さを伸ばす（文字の大きさは変えない）。あふれた行は次のページへ（ユーザー指定）
// 受電・キュービクル搬入などの予定日（■予定日は…・1〜7）は最後のページの表の下。項目が少なく1枚に収まれば1ページ（元は2ページ固定。ユーザー指定）
//   最後の行に書いたら、または行が伸びて入りきらなくなったらページを自動で足す。ページの追加・削除のボタンもある
// 本-品質-A0052 施工検討会開催通知書のヘッダーの情報（工番・件名・事業所・部署・作業所長・開催日・開催場所）を取り込める（チェック表のご指示）
//   このPCのブラウザに残っている A0052 の内容、または A0052 の保存ファイル（JSON）から
(function () {
  // 検討事項の行数（どの行も1行分の高さのとき）。1ページ目・2ページ目以降。予定日の欄（TAIL 行分）がそのページに入るときはその分減る
  const FIRST = 15, NEXT = 31, TAIL = 9;
  const FIXED = { 2: '施工検討書（本－工務－A0032）（添付資料 参照）', 4: 'その他の施工検討事項' }; // 1ページ目の決まった行（元の様式の太字）
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  let counts = {}; // ページごとの行数（画面で行の高さを測って決める）
  const cap = (p, pages) => (p === 1 ? FIRST : NEXT) - (p === pages ? TAIL : 0);
  const rowsOf = (p, pages) => {
    let from = 1;
    for (let q = 1; q < p; q++) from += counts[q] ?? cap(q, pages);
    return [from, from + (counts[p] ?? cap(p, pages)) - 1];
  };
  const hasData = (values, n) => ['kento', 'keikaku', 'no'].some((k) => String(values[`r${n}.${k}`] ?? '') !== '');
  // 行の高さを測ってページごとの行数を決め直す（本-品質-A0020 と同じ考え方）。変わったときだけ作り直す
  //   edited：入力して欄を離れたとき（最後の行に書いたらページを足す）。開いたときは、入りきらない行があるときだけ足す
  const relayout = (values, setVal, rebuild, edited) => {
    const trs = [...document.querySelectorAll('table.h53 tr[data-n]')];
    if (!trs.length) return;
    const hs = {};
    trs.forEach((tr) => { hs[tr.dataset.n] = tr.getBoundingClientRect().height; });
    const base = Math.min(...Object.values(hs));
    const pages = pageCount(values);
    const next = {};
    let n = 1;
    for (let p = 1; p <= pages; p++) {
      const budget = cap(p, pages) * base + 1;
      let used = 0, k = 0;
      while (k === 0 || used + (hs[n] ?? base) <= budget) { used += hs[n] ?? base; n++; k++; }
      next[p] = k;
    }
    const last = n - 1;
    const maxData = Math.max(0, ...Object.keys(values).map((key) => Number((/^r(\d+)\./.exec(key) || [])[1] || 0)).filter((x) => x && hasData(values, x)));
    const addPage = maxData > last || (edited && maxData === last && maxData > 4); // 決まった行（2・4行目）だけのときは足さない
    const same = Object.keys(next).length === Object.keys(counts).length && Object.keys(next).every((p) => counts[p] === next[p]);
    if (same && !addPage) return;
    counts = next;
    const act = document.activeElement, tr = act && act.closest && act.closest('table.h53 tr[data-n]');
    const pos = tr ? { n: tr.dataset.n, col: [...tr.children].indexOf(act.closest('td')) } : null;
    if (addPage) { setVal('pageCount', String(pages + 1)); counts = {}; }
    rebuild();
    if (pos) {
      const td = document.querySelector(`table.h53 tr[data-n="${pos.n}"]`)?.children[pos.col];
      const el = td && td.querySelector('textarea, input');
      if (el) el.focus();
    }
  };
  const IMPORT = ['koban', 'subject', 'jigyo', 'busho', 'shocho', 'kaisaibi', 'basho'];
  const PLAN = ['受電 予定日', 'キュービクル搬入 予定日※', '発電機搬入 予定日※', 'その他重量物搬入　予定日※', '幹線延線　予定日※', '送電 予定日※', '停電工事 予定日※'];

  // A0052 から取り込む（印刷しない）
  const importer = { type: 'custom', render: ({ h, values, setVal, rebuild }) => {
    const apply = (v) => {
      const got = IMPORT.filter((k) => v[k]);
      if (!got.length) { alert('施工検討会開催通知書（本-品質-A0052）に、取り込める内容がありません。'); return; }
      if (IMPORT.some((k) => values[k] && v[k] && values[k] !== v[k]) && !confirm('入力済みの項目を、施工検討会開催通知書の内容で置き換えます。よろしいですか？')) return;
      got.forEach((k) => setVal(k, v[k]));
      rebuild();
    };
    const fromFile = () => {
      const inp = h('input', { type: 'file', accept: '.json,application/json', style: 'display:none' });
      inp.addEventListener('change', async () => {
        const f = inp.files[0];
        inp.remove();
        if (!f) return;
        let data;
        try { data = JSON.parse(await f.text()); } catch (e) { alert('JSONファイルとして読み込めませんでした。'); return; }
        if (!data || data.form !== 'hin-a0052' || typeof data.values !== 'object') { alert('施工検討会開催通知書（本-品質-A0052）のファイルではありません。'); return; }
        apply(data.values);
      });
      document.body.append(inp);
      inp.click();
    };
    const run = () => {
      let local = null;
      try { local = JSON.parse(localStorage.getItem('shoshiki:hin-a0052') || 'null'); } catch (e) { /* なし */ }
      if (local && IMPORT.some((k) => local[k]) && confirm(`このPCに入力中の施工検討会開催通知書から取り込みますか？\n（工番：${local.koban || '－'}　件名：${local.subject || '－'}）\n\n「キャンセル」で保存ファイルを選びます。`)) { apply(local); return; }
      fromFile();
    };
    return h('div', { class: 'k1-pages no-print', style: 'margin:0' },
      h('button', { type: 'button', onclick: run }, '施工検討会開催通知書（A0052）から取り込む'),
      h('span', { class: 'k1-hint' }, '工番・件名・事業所・部署・作業所長・開催日・開催場所を取り込みます。'));
  } };

  // 検討事項と実施計画の表（page ページ目）。最後のページは表の下に予定日の欄
  const list = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const pages = pageCount(values);
    const [from, to] = rowsOf(page, pages);
    const tail = page === pages;
    // 長い文は欄の中で折り返し、文字の大きさはそのままで行の高さを伸ばす
    const grow = (ta) => { ta.style.height = '0'; ta.style.height = ta.scrollHeight + 'px'; };
    const wrap = (key) => {
      const ta = field({ key, type: 'textarea', plain: true, lines: 1 });
      ta.classList.add('h53-wrap');
      ta.addEventListener('input', () => grow(ta));
      requestAnimationFrame(() => grow(ta));
      return ta;
    };
    const tb = h('tbody', null, h('tr', null, h('th', null, 'No'), h('th', null, '検　討　事　項'), h('th', null, '実　施　計　画')));
    for (let n = from; n <= to; n++) {
      tb.append(h('tr', { 'data-n': n }, h('td', null, field({ key: `r${n}.no`, align: 'center' })),
        FIXED[n] ? h('td', { class: 'h53-fixed' }, FIXED[n]) : h('td', null, wrap(`r${n}.kento`)),
        h('td', null, wrap(`r${n}.keikaku`))));
    }
    if (tail) {
      tb.append(h('tr', null, h('td'), h('td', { class: 'h53-fixed', colspan: 2 }, '■予定日は実施計画に記載の事（4は搬入対象を記載する）')));
      tb.append(h('tr', null, h('td'), h('td', { class: 'h53-note', colspan: 2 }, '※計画書は、実施予定日の2箇月前に安全品質保証部に提出の事')));
      PLAN.forEach((t, i) => tb.append(h('tr', null, h('td', { class: 'h53-no' }, String(i + 1)), h('td', { class: 'h53-plan' }, t), h('td', null, field({ key: `plan${i + 1}` })))));
    }
    // 入力を終えて欄を離れたら、行の高さを測ってページの行数を決め直す
    const onchange = () => setTimeout(() => relayout(values, setVal, rebuild, true));
    const table = h('table', { class: 'grid h53', onchange }, h('colgroup', null, ...[9, 85, null].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
    if (!tail) return table;
    requestAnimationFrame(() => requestAnimationFrame(() => relayout(values, setVal, rebuild)));
    // 最後のページの下に、ページの追加・削除（印刷しない）
    const lastHasData = () => { for (let n = from; n <= to; n++) if (hasData(values, n)) return true; return false; };
    return h('div', null, table, h('div', { class: 'k1-pages no-print' },
      h('button', { type: 'button', onclick: () => { counts = {}; setVal('pageCount', String(pages + 1)); rebuild(); } }, '＋ ページを追加'),
      pages > 1 ? h('button', { type: 'button', onclick: () => {
        if (lastHasData() && !confirm(`${pages}ページ目には入力があります。消してページを減らしますか？`)) return;
        Object.keys(values).filter((key) => { const m = /^r(\d+)\./.exec(key); return m && Number(m[1]) >= from; }).forEach((key) => delete values[key]);
        counts = {}; setVal('pageCount', String(pages - 1)); rebuild();
      } }, '最後のページを削除') : null,
      h('span', { class: 'k1-hint' }, '検討事項が多いときは、最後の行に書くと次のページが自動で増えます。')));
  } });

  FORM_DEFS['hin-a0053'] = {
    code: '本-品質-A0053', title: '施工検討会報告書',
    iso: '【8.1】運用の計画及び管理', // 元の様式の右上の表示。ヘッダーの番号の後ろに（ユーザー指定）
    seitei: '02/04/01', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    fileIO: true, // 回送して押印してもらうのでファイルに保存
    fileKeys: ['koban', 'subject'], // ファイル名は「本-品質-A0053_工番_件名_日付.json」
    sheetClass: 'h53',
    meta: [],
    // 回送先の押印欄は1ページ目のヘッダーの右上（ユーザー指定）。16個を4つずつ4段、枠の幅はほかの帳票と同じ（20mm）
    stampClass: 'stack h53s',
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => (i ? { subtitle: `（${i + 1}/${pageCount(v)}）`, stamps: [], blocks: [list(i + 1)] } : {
        subtitle: pageCount(v) > 1 ? `（1/${pageCount(v)}）` : '',
        stamps: [
          { boxes: ['社　長', '本店長', '工事本部長|RE部長', '工事管理課長'], dates: true },
          { boxes: ['営業部', '設計見積部', '設計部', '購買部'], dates: true },
          { boxes: ['品質技術部', '安全品質部', '安全部', '検査安全部'], dates: true },
          { boxes: ['ＩＳＯ部', '安全品質|保証部長\n保　管', '支店長', '工事長|工事部長\n発　行'], dates: true },
        ],
        // ヘッダーの情報は押印欄の横（表題の下）に置く（ユーザー指定）
        headBlocks: [
          // 並びはユーザー指定：開催日・開催場所（横並び）／事業所／工番／件名／部署・作業所長（横並び）／出席者
          { type: 'grid', cols: 4, colWidths: ['15mm', null, '17mm', null], rowH: 5.6, rows: [
            [{ label: '開催日', key: 'kaisaibi', type: 'date', jp: true, lw: 1, span: 2 }, { label: '開催場所', key: 'basho', lw: 1, span: 2 }],
            [{ label: '事業所', key: 'jigyo', lw: 1, span: 4 }],
            [{ label: '工　番', key: 'koban', maxlength: 12, lw: 1, span: 4 }],
            [{ label: '件　名', key: 'subject', lw: 1, span: 4 }],
            [{ label: '部　署', key: 'busho', lw: 1, span: 2 }, { label: '作業所長', key: 'shocho', lw: 1, span: 2 }],
            // 押印欄が4段で高いので、出席者も押印欄の横に置く
            [{ label: '出席者', key: 'shusseki', type: 'textarea', lines: 6, lw: 1, span: 4 }],
          ] },
        ],
        blocks: [
          importer,
          list(1),
          { type: 'grid', rows: [[{ label: '本店長\n指示', key: 'shiji', type: 'textarea', lines: 2, lw: 2, span: 24 }]] },
          { type: 'notes', items: ['不要回送先は、斜線（／）で抹消すること。'] },
        ] })),
  };
})();
