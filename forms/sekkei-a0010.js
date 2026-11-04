// 本-設計-A0010 質疑書・回答書（品質記録様式。元Excel：本-設計-A0010 質疑書・回答書.xls、A4縦2ページ）
// 番号・質疑・回答・回答者の表は本-設計-A0021 と同じ作り：長文を折り返して行の高さを伸ばし、あふれた行は次のページへ。最後の行に書いたら、
//   または入りきらなくなったらページを自動で足す（ページの追加・削除のボタンもある。元の様式も「行数は変更してもよい」）
// 顧客にはExcelで出し、顧客が回答を記入したExcelをアプリに戻す（ユーザー指定）：
//   「顧客用のExcelを書き出す」＝回答・回答者の欄だけ入力できるExcel（シートの保護、パスワードなし）。隠しシートに行と番号の対応を入れる
//   「Excelから回答を取り込む」＝そのExcelの回答・回答者を、元の行に戻す（隠しシートがなければ番号で照合）
//   Excelの作成・読み込みは ExcelJS（押したときだけ cdnjs から読み込む）
// 押印欄は作成者・検証（元は打合せ日の行の右）→ 右上、作成者にデート印（日付は作成日）
(function () {
  const FIRST = 22, NEXT = 34; // 表の行数（どの行も1行分の高さのとき）。1ページ目・2ページ目以降
  const COLS = ['no', 'q', 'a', 'who'];
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
  // 行の高さを測ってページごとの行数を決め直す（本-設計-A0021 と同じ）。edited：入力して欄を離れたとき
  const relayout = (values, setVal, rebuild, edited) => {
    const trs = [...document.querySelectorAll('table.s10 tr[data-n]')];
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
    const act = document.activeElement, tr = act && act.closest && act.closest('table.s10 tr[data-n]');
    const pos = tr ? { n: tr.dataset.n, col: [...tr.children].indexOf(act.closest('td')) } : null;
    if (addPage) { setVal('pageCount', String(pages + 1)); counts = {}; }
    rebuild();
    if (pos) {
      const td = document.querySelector(`table.s10 tr[data-n="${pos.n}"]`)?.children[pos.col];
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
    const ws = wb.addWorksheet('質疑書・回答書', { pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } } });
    ws.columns = [{ width: 10 }, { width: 44 }, { width: 44 }, { width: 14 }];
    const thin = { style: 'thin' }, box = { top: thin, left: thin, bottom: thin, right: thin };
    const font = { name: 'Meiryo UI', size: 10 };
    const head = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF1F6' } };
    const input = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7D6' } };
    ws.mergeCells('A1:D1');
    Object.assign(ws.getCell('A1'), { value: '質疑書・回答書', font: { ...font, size: 16, bold: true }, alignment: { horizontal: 'center' } });
    Object.assign(ws.getCell('D2'), { value: '本-設計-A0010', font: { ...font, size: 8, color: { argb: 'FF666666' } }, alignment: { horizontal: 'right' } });
    const t = (values.tFrom || values.tTo) ? `${values.tFrom || ''} ～ ${values.tTo || ''}` : '';
    const info = [
      ['件名', values.subject || '', '作成日', jpDate(values.sakusei)],
      ['打合せ日', jpDate(values.uchiawase), '時間', t],
      ['打合場所', values.basho || '', '', ''],
      ['出席者', values.shusseki || '', '', ''],
    ];
    info.forEach((r, i) => {
      const row = ws.getRow(3 + i);
      row.values = r;
      if (!r[2]) ws.mergeCells(`B${3 + i}:D${3 + i}`);
      row.eachCell({ includeEmpty: true }, (c, col) => {
        const lbl = col === 1 || (col === 3 && r[2]);
        c.font = font; c.border = box; c.alignment = { vertical: 'middle', wrapText: true, horizontal: lbl ? 'center' : 'left' };
        if (lbl) c.fill = head;
      });
      row.height = i === 3 ? 36 : 20;
    });
    const hr = ws.getRow(8);
    hr.values = ['番号', '質　疑', '回　答', '回答者'];
    hr.eachCell((c) => { c.font = { ...font, bold: true }; c.fill = head; c.border = box; c.alignment = { horizontal: 'center', vertical: 'middle' }; });
    // 質疑のある行（番号・質疑・回答のどれかがある行）と、回答を書く空き行を少し
    const rows = dataRows(values);
    const map = [];
    rows.forEach((n, i) => {
      const r = 9 + i;
      const row = ws.getRow(r);
      row.values = [values[`r${n}.no`] || '', values[`r${n}.q`] || '', values[`r${n}.a`] || '', values[`r${n}.who`] || ''];
      row.eachCell({ includeEmpty: true }, (c, col) => {
        c.font = font; c.border = box; c.alignment = { vertical: 'top', wrapText: true, horizontal: col === 1 ? 'center' : 'left' };
        if (col >= 3) { c.fill = input; c.protection = { locked: false }; } // 回答・回答者だけ入力できる
      });
      const len = Math.max(String(values[`r${n}.q`] || '').length, String(values[`r${n}.a`] || '').length);
      row.height = Math.max(30, Math.ceil(len / 28) * 15 + 6);
      map.push([r, n]);
    });
    const note = ws.getRow(10 + rows.length);
    note.getCell(1).value = '※ 黄色の欄（回答・回答者）にご記入ください。';
    note.getCell(1).font = { ...font, size: 9 };
    ws.views = [{ state: 'frozen', ySplit: 8 }];
    await ws.protect('', { selectLockedCells: true, selectUnlockedCells: true, formatRows: true, formatColumns: true });
    // 隠しシート：取り込みのときに元の行へ戻すための対応表
    const hs = wb.addWorksheet('_yformat', { state: 'veryHidden' });
    hs.addRow(['form', 'sekkei-a0010', 'exported', new Date().toISOString()]);
    map.forEach(([r, n]) => hs.addRow(['row', r, n, values[`r${n}.no`] || '']));
    const buf = await wb.xlsx.writeBuffer();
    const d = new Date(), p2 = (x) => String(x).padStart(2, '0');
    const name = `質疑書・回答書${values.subject ? '_' + String(values.subject).replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 30) : ''}_${p2(d.getFullYear() % 100)}${p2(d.getMonth() + 1)}${p2(d.getDate())}.xlsx`;
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
    const ws = wb.getWorksheet('質疑書・回答書') || wb.worksheets.find((s) => s.state === 'visible');
    if (!ws) throw new Error('シートが見つかりません');
    const hs = wb.getWorksheet('_yformat');
    const pairs = []; // [Excelの行, アプリの行 n]
    if (hs && cellText(hs.getRow(1).getCell(2)) === 'sekkei-a0010') {
      hs.eachRow((row, i) => { if (i > 1 && cellText(row.getCell(1)) === 'row') pairs.push([Number(cellText(row.getCell(2))), Number(cellText(row.getCell(3)))]); });
    } else {
      // 隠しシートがない（別に作られたExcelなど）：「番号」の見出しの下を番号で照合
      let start = 0;
      ws.eachRow((row, i) => { if (!start && cellText(row.getCell(1)).replace(/\s/g, '') === '番号') start = i + 1; });
      const byNo = {};
      dataRows(values).forEach((n) => { const no = String(values[`r${n}.no`] || '').trim(); if (no) byNo[no] = n; });
      if (start) ws.eachRow((row, i) => { const no = cellText(row.getCell(1)).trim(); if (i >= start && byNo[no]) pairs.push([i, byNo[no]]); });
    }
    const changes = pairs.map(([r, n]) => {
      const row = ws.getRow(r);
      return { n, a: cellText(row.getCell(3)).trim(), who: cellText(row.getCell(4)).trim() };
    }).filter((c) => c.a !== String(values[`r${c.n}.a`] || '') || c.who !== String(values[`r${c.n}.who`] || ''));
    if (!pairs.length) { alert('取り込める回答が見つかりませんでした。このアプリで書き出したExcelか確認してください。'); return; }
    if (!changes.length) { alert('回答に変わったところはありませんでした。'); return; }
    const over = changes.filter((c) => values[`r${c.n}.a`] || values[`r${c.n}.who`]).length;
    if (!confirm(`${changes.length} 件の回答を取り込みます。${over ? `（うち ${over} 件はいまの回答を書き換えます）` : ''}よろしいですか？`)) return;
    changes.forEach((c) => { setVal(`r${c.n}.a`, c.a); setVal(`r${c.n}.who`, c.who); });
    counts = {};
    rebuild();
  }

  // 表の上：Excel の書き出し・取り込み（印刷しない）
  const excelBar = { type: 'custom', render: ({ h, values, setVal, rebuild }) => {
    const msg = h('span', { class: 'k1-hint' }, '顧客にはExcelで出し、回答が記入されたExcelを取り込めます。');
    const run = (fn) => fn().catch((e) => alert(e.message || String(e)));
    const pick = h('input', { type: 'file', accept: '.xlsx', style: 'display:none', onchange: () => {
      const f = pick.files[0]; pick.value = '';
      if (f) run(() => importExcel(f, values, setVal, rebuild));
    } });
    return h('div', { class: 'k1-pages no-print s10-bar' },
      h('button', { type: 'button', onclick: () => run(async () => {
        if (!dataRows(values).length) { alert('質疑を入力してから書き出してください。'); return; }
        const n = await exportExcel(values);
        msg.textContent = `顧客用のExcelを書き出しました（${n} 件）。回答が記入されたら「Excelから回答を取り込む」で戻せます。`;
      }) }, '顧客用のExcelを書き出す'),
      h('button', { type: 'button', onclick: () => pick.click() }, 'Excelから回答を取り込む'), pick, msg);
  } };

  // 番号・質疑・回答・回答者の表（page ページ目）
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
    const tb = h('tbody', null, h('tr', null, h('th', null, '番号'), h('th', null, '質　　疑'), h('th', null, '回　　答'), h('th', null, '回答者')));
    for (let n = from; n <= to; n++) {
      tb.append(h('tr', { 'data-n': n }, h('td', null, field({ key: `r${n}.no`, align: 'center' })),
        h('td', null, wrap(`r${n}.q`)), h('td', null, wrap(`r${n}.a`)), h('td', null, wrap(`r${n}.who`))));
    }
    const onchange = () => setTimeout(() => relayout(values, setVal, rebuild, true));
    const table = h('table', { class: 'grid h53 s10', onchange }, h('colgroup', null, ...[12, null, null, 24].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
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
      h('span', { class: 'k1-hint' }, '質疑が多いときは、最後の行に書くと次のページが自動で増えます。※ 行数は変更してもよいこととする。')));
  } });

  const head = { type: 'grid', lw: 3, rowH: 7, rows: [
    [{ label: '件　名', key: 'subject', span: 15 }, { label: '作成日', key: 'sakusei', type: 'date', jp: true, span: 9 }],
    [{ label: '打合せ日', key: 'uchiawase', type: 'date', jp: true, span: 10 },
      { label: '時　間', key: 'jikanW', type: 'inline', span: 14, parts: [{ key: 'tFrom', type: 'time' }, '～', { key: 'tTo', type: 'time' }] }],
    [{ label: '打合場所', key: 'basho', span: 24 }],
    [{ label: '出席者', key: 'shusseki', type: 'textarea', lines: 3, span: 24 }],
  ] };

  FORM_DEFS['sekkei-a0010'] = {
    code: '本-設計-A0010', title: '質疑書・回答書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    selfStamp: '作成者', stampDate: 'sakusei', // 作成者にデート印（日付は作成日）
    meta: [],
    stamps: [{ boxes: ['作成者', '検　証'] }], // 元は打合せ日の行の右
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => (i
      ? { subtitle: `（${i + 1}/${pageCount(v)}）`, stamps: [], blocks: [list(i + 1)] }
      : { subtitle: pageCount(v) > 1 ? `（1/${pageCount(v)}）` : '', blocks: [head, excelBar, list(1)] })),
  };
})();
