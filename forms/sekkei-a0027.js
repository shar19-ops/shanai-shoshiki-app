// 本-設計-A0027 議事録（品質記録様式。元Excel：本-設計-A0027 議事録.xls、A4縦2ページ）
// No・打合内容・発言者の表は本-設計-A0010・A0021 と同じ作り：長文を折り返して行の高さを伸ばし、あふれた行は次のページへ。最後の行に書いたら、
//   または入りきらなくなったらページを自動で足す（元の様式も「行数は変更してもよい」）
// 顧客にはExcelで出し、顧客が加筆・修正したExcelをアプリに戻す（ユーザー指定）：
//   「顧客用のExcelを書き出す」＝打合内容・発言者を自由に直せて行も足せるExcel（保護しない。追記用の空き行つき）
//   「Excelから取り込む」＝そのExcelの表を上から順に読み、議事録の表を置き換える（取り込む前に 変更・追加・削除 の件数を確認）
//   Excelの作成・読み込みは ExcelJS（押したときだけ cdnjs から読み込む。A0010 と同じ）
// 押印欄は作成者・検証（元は打合日時の行の右）→ 右上、作成者にデート印（日付は作成日）
(function () {
  const FIRST = 22, NEXT = 34; // 表の行数（どの行も1行分の高さのとき）。1ページ目・2ページ目以降
  const COLS = ['no', 'naiyo', 'who'];
  const EXTRA = 10; // 書き出すExcelの追記用の空き行
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  let counts = {};
  const cap = (p) => (p === 1 ? FIRST : NEXT);
  const rowsOf = (p) => {
    let from = 1;
    for (let q = 1; q < p; q++) from += counts[q] ?? cap(q);
    return [from, from + (counts[p] ?? cap(p)) - 1];
  };
  const hasData = (values, n) => COLS.some((k) => String(values[`r${n}.${k}`] ?? '') !== '');
  const dataRows = (values) => [...new Set(Object.keys(values).map((key) => Number((/^r(\d+)\./.exec(key) || [])[1] || 0)).filter((x) => x && hasData(values, x)))].sort((a, b) => a - b);
  // 行の高さを測ってページごとの行数を決め直す（本-設計-A0010・A0021 と同じ）。edited：入力して欄を離れたとき
  const relayout = (values, setVal, rebuild, edited) => {
    const trs = [...document.querySelectorAll('table.s27 tr[data-n]')];
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
    const maxData = Math.max(0, ...dataRows(values));
    const addPage = maxData > last || (edited && maxData > 0 && maxData === last);
    const same = Object.keys(next).length === Object.keys(counts).length && Object.keys(next).every((p) => counts[p] === next[p]);
    if (same && !addPage) return;
    counts = next;
    const act = document.activeElement, tr = act && act.closest && act.closest('table.s27 tr[data-n]');
    const pos = tr ? { n: tr.dataset.n, col: [...tr.children].indexOf(act.closest('td')) } : null;
    if (addPage) { setVal('pageCount', String(pages + 1)); counts = {}; }
    rebuild();
    if (pos) {
      const td = document.querySelector(`table.s27 tr[data-n="${pos.n}"]`)?.children[pos.col];
      const el = td && td.querySelector('textarea, input');
      if (el) el.focus();
    }
  };

  // ---------- Excel の書き出し・取り込み ----------
  const loadExcelJS = () => (window.ExcelJS ? Promise.resolve(window.ExcelJS) : new Promise((ok, ng) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
    s.onload = () => ok(window.ExcelJS);
    s.onerror = () => ng(new Error('ExcelJS を読み込めませんでした（インターネットにつながっているか確認してください）'));
    document.head.append(s);
  }));
  const jpDate = (iso) => (/^\d{4}-\d{2}-\d{2}$/.test(iso || '') ? `${iso.slice(0, 4)}年${Number(iso.slice(5, 7))}月${Number(iso.slice(8, 10))}日` : '');
  const cellText = (c) => {
    const v = c && c.value;
    if (v == null) return '';
    if (typeof v === 'object' && v.richText) return v.richText.map((t) => t.text).join('');
    if (typeof v === 'object' && 'result' in v) return String(v.result ?? '');
    return String(v);
  };

  async function exportExcel(values) {
    const ExcelJS = await loadExcelJS();
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('議事録', { pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } } });
    ws.columns = [{ width: 10 }, { width: 78 }, { width: 16 }];
    const thin = { style: 'thin' }, box = { top: thin, left: thin, bottom: thin, right: thin };
    const font = { name: 'Meiryo UI', size: 10 };
    const head = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF1F6' } };
    const input = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7D6' } };
    ws.mergeCells('A1:C1');
    Object.assign(ws.getCell('A1'), { value: '議　事　録', font: { ...font, size: 16, bold: true }, alignment: { horizontal: 'center' } });
    Object.assign(ws.getCell('C2'), { value: '本-設計-A0027', font: { ...font, size: 8, color: { argb: 'FF666666' } }, alignment: { horizontal: 'right' } });
    const t = (values.tFrom || values.tTo) ? `　${values.tFrom || ''} ～ ${values.tTo || ''}` : '';
    const info = [
      ['件名', values.subject || ''],
      ['作成日', jpDate(values.sakusei)],
      ['打合日時', jpDate(values.uchiawase) + t],
      ['打合場所', values.basho || ''],
      ['出席者', values.shusseki || ''],
    ];
    info.forEach((r, i) => {
      const row = ws.getRow(3 + i);
      row.values = r;
      ws.mergeCells(`B${3 + i}:C${3 + i}`);
      row.eachCell({ includeEmpty: true }, (c, col) => {
        c.font = font; c.border = box; c.alignment = { vertical: 'middle', wrapText: true, horizontal: col === 1 ? 'center' : 'left' };
        if (col === 1) c.fill = head;
      });
      row.height = i === 4 ? 36 : 20;
    });
    const HR = 9; // 表の見出しの行
    const hr = ws.getRow(HR);
    hr.values = ['No', '打　合　内　容', '発言者'];
    hr.eachCell((c) => { c.font = { ...font, bold: true }; c.fill = head; c.border = box; c.alignment = { horizontal: 'center', vertical: 'middle' }; });
    const rows = dataRows(values);
    [...rows, ...Array(EXTRA).fill(0)].forEach((n, i) => {
      const row = ws.getRow(HR + 1 + i);
      row.values = n ? [values[`r${n}.no`] || '', values[`r${n}.naiyo`] || '', values[`r${n}.who`] || ''] : ['', '', ''];
      [1, 2, 3].forEach((col) => {
        const c = row.getCell(col);
        c.font = font; c.border = box; c.fill = input; c.alignment = { vertical: 'top', wrapText: true, horizontal: col === 1 ? 'center' : 'left' };
      });
      // 高さは決めない（Excel が文字に合わせて自動で調整する。顧客が書き足した行も伸びる）
    });
    const note = ws.getRow(HR + 2 + rows.length + EXTRA);
    note.getCell(1).value = '※ 黄色の欄（No・打合内容・発言者）は加筆・修正していただけます。行が足りないときは空き行に続けてご記入ください。';
    note.getCell(1).font = { ...font, size: 9 };
    ws.views = [{ state: 'frozen', ySplit: HR }];
    const hs = wb.addWorksheet('_yformat', { state: 'veryHidden' });
    hs.addRow(['form', 'sekkei-a0027', 'exported', new Date().toISOString()]);
    const buf = await wb.xlsx.writeBuffer();
    const d = new Date(), p2 = (x) => String(x).padStart(2, '0');
    const name = `議事録${values.subject ? '_' + String(values.subject).replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 30) : ''}_${p2(d.getFullYear() % 100)}${p2(d.getMonth() + 1)}${p2(d.getDate())}.xlsx`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    a.download = name;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return rows.length;
  }

  async function importExcel(file, values, setVal, rebuild) {
    const ExcelJS = await loadExcelJS();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    const ws = wb.getWorksheet('議事録') || wb.worksheets.find((s) => s.state === 'visible');
    if (!ws) throw new Error('シートが見つかりません');
    // 「No」の見出しの行を探し、その下を上から順に読む（※ の注記の行で終わり。空き行は飛ばす）
    let start = 0;
    ws.eachRow((row, i) => { if (!start && cellText(row.getCell(1)).replace(/\s/g, '').toUpperCase() === 'NO' && /打/.test(cellText(row.getCell(2)))) start = i + 1; });
    if (!start) { alert('議事録の表（No・打合内容・発言者）が見つかりませんでした。このアプリで書き出したExcelか確認してください。'); return; }
    const got = [];
    for (let i = start; i <= ws.rowCount; i++) {
      const row = ws.getRow(i);
      const r = { no: cellText(row.getCell(1)).trim(), naiyo: cellText(row.getCell(2)).replace(/\s+$/, ''), who: cellText(row.getCell(3)).trim() };
      if (/^※/.test(r.no)) break;
      if (r.no || r.naiyo.trim() || r.who) got.push(r);
    }
    const cur = dataRows(values).map((n) => ({ no: String(values[`r${n}.no`] || ''), naiyo: String(values[`r${n}.naiyo`] || ''), who: String(values[`r${n}.who`] || '') }));
    let changed = 0;
    for (let i = 0; i < Math.min(cur.length, got.length); i++) if (COLS.some((k) => cur[i][k] !== got[i][k])) changed++;
    const added = Math.max(0, got.length - cur.length), removed = Math.max(0, cur.length - got.length);
    if (!changed && !added && !removed) { alert('議事録に変わったところはありませんでした。'); return; }
    if (!confirm(`Excelの内容で議事録の表を置き換えます。（変更 ${changed} 件・追加 ${added} 件・削除 ${removed} 件）よろしいですか？`)) return;
    Object.keys(values).filter((key) => /^r\d+\./.test(key)).forEach((key) => delete values[key]);
    got.forEach((r, i) => COLS.forEach((k) => setVal(`r${i + 1}.${k}`, r[k])));
    if (!got.length) setVal('r1.no', '');
    counts = {};
    rebuild();
  }

  // 表の上：Excel の書き出し・取り込み（印刷しない）
  const excelBar = { type: 'custom', render: ({ h, values, setVal, rebuild }) => {
    const msg = h('span', { class: 'k1-hint' }, '顧客にはExcelで出し、加筆・修正されたExcelを取り込めます。');
    const run = (fn) => fn().catch((e) => alert(e.message || String(e)));
    const pick = h('input', { type: 'file', accept: '.xlsx', style: 'display:none', onchange: () => {
      const f = pick.files[0]; pick.value = '';
      if (f) run(() => importExcel(f, values, setVal, rebuild));
    } });
    return h('div', { class: 'k1-pages no-print s10-bar' },
      h('button', { type: 'button', onclick: () => run(async () => {
        if (!dataRows(values).length) { alert('打合内容を入力してから書き出してください。'); return; }
        const n = await exportExcel(values);
        msg.textContent = `顧客用のExcelを書き出しました（${n} 件）。加筆・修正されたら「Excelから取り込む」で戻せます。`;
      }) }, '顧客用のExcelを書き出す'),
      h('button', { type: 'button', onclick: () => pick.click() }, 'Excelから取り込む'), pick, msg);
  } };

  // No・打合内容・発言者の表（page ページ目）
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
    const tb = h('tbody', null, h('tr', null, h('th', null, 'No'), h('th', null, '打　　合　　内　　容'), h('th', null, '発言者')));
    for (let n = from; n <= to; n++) {
      tb.append(h('tr', { 'data-n': n }, h('td', null, field({ key: `r${n}.no`, align: 'center' })),
        h('td', null, wrap(`r${n}.naiyo`)), h('td', null, wrap(`r${n}.who`))));
    }
    const onchange = () => setTimeout(() => relayout(values, setVal, rebuild, true));
    const table = h('table', { class: 'grid h53 s27', onchange }, h('colgroup', null, ...[11, null, 28].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
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
      h('span', { class: 'k1-hint' }, '内容が多いときは、最後の行に書くと次のページが自動で増えます。※ 行数は変更してもよいこととする。')));
  } });

  const head = { type: 'grid', lw: 3, rowH: 7, rows: [
    [{ label: '件　名', key: 'subject', span: 15 }, { label: '作成日', key: 'sakusei', type: 'date', jp: true, span: 9 }],
    [{ label: '打合日時', key: 'uchiawase', type: 'date', jp: true, span: 10 },
      { label: '時　間', key: 'jikanW', type: 'inline', span: 14, parts: [{ key: 'tFrom', type: 'time' }, '～', { key: 'tTo', type: 'time' }] }],
    [{ label: '打合場所', key: 'basho', span: 24 }],
    [{ label: '出席者', key: 'shusseki', type: 'textarea', lines: 3, span: 24 }],
  ] };

  FORM_DEFS['sekkei-a0027'] = {
    code: '本-設計-A0027', title: '議事録',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    selfStamp: '作成者', stampDate: 'sakusei', // 作成者にデート印（日付は作成日）
    meta: [],
    stamps: [{ boxes: ['作成者', '検　証'] }], // 元は打合日時の行の右
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => (i
      ? { subtitle: `（${i + 1}/${pageCount(v)}）`, stamps: [], blocks: [list(i + 1)] }
      : { subtitle: pageCount(v) > 1 ? `（1/${pageCount(v)}）` : '', blocks: [head, excelBar, list(1)] })),
  };
})();
