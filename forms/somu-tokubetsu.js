// 本-総務-A0035・A0036 特別条項適用申請書（年間／月間）の共通定義（品質記録様式。元Word：本-総務-A0035・A0036 特別条項適用申請書….doc、A4縦1ページ）
// forms/somu-a0035.js・somu-a0036.js が FORM_NEEDS でこのファイルを読み込む。月間だけ「年間回数」の行がある
// 元の様式に押印欄はない（総務部長の確認欄・従業員代表の承認欄に署名）。承認する／却下するはクリックで選ぶ
// 「Excelに出力」＝アプリの印刷と同じ並びの .xlsx（ユーザー指定）。Excel の作成は ExcelJS（押したときだけ cdnjs から読み込む。本-設計-A0010 と同じ）
(function () {
  const TEXT = {
    1: { title: '特別条項適用申請書（年間）', code: '本-総務-A0035', over: '年間360時間', limit: '1年720時間以内' },
    2: { title: '特別条項適用申請書（月間）', code: '本-総務-A0036', over: '月間45時間', limit: '1か月 100時間未満 かつ 複数月 平均80時間以内' },
  };
  const SEITEI = '24/04/01', KAITEI = '26/11/17';
  const ROUTE = ['申請者（部長/工事長） → 本部長/支店長 → 総務部人事課 → 総務部長 → 総務部人事課', '→ 従業員代表 → 総務部人事課（保管）'];
  const METHOD = [
    '１．申請者は入力事項を記載のうえ、原本もしくはPDFにて総務部人事課へ提出してください。',
    '２．総務部長確認 → 従業員代表承認をもって、本申請書を承認とします。',
    '３．承認されたら、総務部人事課より申請者にPDFにて連絡します。',
  ];
  const leadOf = (t) => [`部下の法定外労働時間が${t.over}を超過しますので、時間外・休日労働に関する協定に基づき、`, '下記のとおり特別条項の適用を申請します。'];

  // ---------- Excel に出力 ----------
  const loadExcelJS = () => (window.ExcelJS ? Promise.resolve(window.ExcelJS) : new Promise((ok, ng) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
    s.onload = () => ok(window.ExcelJS);
    s.onerror = () => ng(new Error('ExcelJS を読み込めませんでした（インターネットにつながっているか確認してください）'));
    document.head.append(s);
  }));
  const jpDate = (iso) => (/^\d{4}-\d{2}-\d{2}$/.test(iso || '') ? `${iso.slice(0, 4)}年 ${Number(iso.slice(5, 7))}月 ${Number(iso.slice(8, 10))}日` : '　　年　　月　　日');

  async function exportExcel(values, kind) {
    const t = TEXT[kind];
    const ExcelJS = await loadExcelJS();
    const wb = new ExcelJS.Workbook();
    // 本文の幅は 186mm（アプリの A4 と同じ）を 24 列に分ける。余白もアプリに合わせて左右 12mm
    const inch = (mm) => mm / 25.4;
    const ws = wb.addWorksheet('申請書', { views: [{ showGridLines: false }], pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 1,
      horizontalCentered: true, margins: { left: inch(12), right: inch(12), top: inch(10), bottom: inch(8), header: 0, footer: 0 } } });
    // 列幅 4.05 で表は 203mm。「1ページに合わせる」で紙の幅（186mm）に縮小されるので、行の高さと文字も同じ比率 K で大きくしておく（印刷するとアプリと同じ寸法になる）
    const K = 203.2 / 186;
    ws.columns = Array.from({ length: 24 }, () => ({ width: 4.05 }));
    const FONT = 'BIZ UDPゴシック';
    const thin = { style: 'thin', color: { argb: 'FF000000' } };
    const box = { top: thin, left: thin, bottom: thin, right: thin };
    const label = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF0F3' } };
    let r = 0, total = 0;
    const row = (mm) => { r++; total += mm; ws.getRow(r).height = mm * 2.835 * K; return r; };
    // c1〜c2 列（r1〜r2 行）を結合して文字を入れる
    const put = (r1, c1, c2, value, o = {}) => {
      const r2 = o.r2 || r1;
      const style = { font: { name: FONT, size: (o.size || 10) * K, bold: !!o.bold, color: o.color ? { argb: o.color } : undefined },
        alignment: { vertical: o.v || 'middle', horizontal: o.h || 'left', wrapText: o.wrap !== false, indent: o.indent || 0 } };
      if (o.border) style.border = o.border;
      if (o.fill) style.fill = o.fill;
      for (let y = r1; y <= r2; y++) for (let x = c1; x <= c2; x++) Object.assign(ws.getCell(y, x), { style });
      if (r2 > r1 || c2 > c1) ws.mergeCells(r1, c1, r2, c2);
      ws.getCell(r1, c1).value = value;
      return ws.getCell(r1, c1);
    };
    const lab = (r1, c1, c2, value, o = {}) => put(r1, c1, c2, value, { h: 'center', fill: label, border: box, ...o });
    const val = (r1, c1, c2, value, o = {}) => put(r1, c1, c2, value, { border: box, indent: 1, ...o });

    // 表題（番号は上に小さく、表題の下に二重線）
    put(row(4), 1, 24, t.code, { size: 8, color: 'FF555555' });
    put(row(11), 1, 15, [...t.title].join(' '), { size: 18, bold: true, wrap: false, border: { bottom: { style: 'double', color: { argb: 'FF000000' } } } });
    row(6);
    // 申請日・申請者（右に寄せる）
    let a = row(8);
    lab(a, 11, 13, '申請日'); val(a, 14, 24, jpDate(values.date), { h: 'right' });
    a = row(8); const b = row(8);
    lab(a, 11, 13, '申請者', { r2: b }); lab(a, 14, 15, '部署'); val(a, 16, 24, values.dept || '');
    lab(b, 14, 15, '氏名'); val(b, 16, 24, values.name || '');
    row(4);
    // 本文
    leadOf(t).forEach((s) => put(row(6.5), 1, 24, s, { size: 10.5, wrap: false, indent: 1 }));
    row(5);
    put(row(6), 1, 24, '記', { h: 'center', size: 10.5 });
    row(4.5);
    // 1〜4 の表（元の様式の番号どおり）
    let no = 1;
    a = row(8); const a2 = row(8);
    lab(a, 1, 1, String(no++), { r2: a2 }); lab(a, 2, 5, '対象労働者', { r2: a2 }); lab(a, 6, 7, '部署'); val(a, 8, 24, values.tDept || '');
    lab(a2, 6, 7, '氏名'); val(a2, 8, 24, values.tName || '');
    a = row(8); lab(a, 1, 1, String(no++)); lab(a, 2, 5, '特別延長時間'); val(a, 6, 24, t.limit);
    if (kind === 2) { a = row(8); lab(a, 1, 1, String(no++)); lab(a, 2, 5, '年間回数'); val(a, 6, 24, `${values.kaisu || '　　'} 回目　　※最大6回まで`); }
    // 申請理由：文字の量に合わせて行を高くする（1行＝約 40 文字）
    const reason = String(values.riyu || '');
    const lines = reason.split('\n').reduce((n, s) => n + Math.max(1, Math.ceil(s.length / 40)), 0);
    a = row(Math.max(23.5, lines * 5.2 + 3));
    lab(a, 1, 1, String(no++)); lab(a, 2, 5, '申請理由'); val(a, 6, 24, reason, { v: 'top' });
    row(3);
    put(row(4), 1, 24, '・'.repeat(62), { size: 8, wrap: false, h: 'center' });
    row(3);
    put(row(6), 1, 24, '［回付ルート］', { size: 9.5 });
    ROUTE.forEach((s) => put(row(5.5), 1, 24, s, { size: 9.5, wrap: false, indent: 1 }));
    row(4);
    // 総務部長の確認欄・従業員代表の承認欄
    a = row(17);
    lab(a, 1, 5, '総務部長\n確認欄'); val(a, 6, 12, jpDate(values.kDate), { h: 'right' }); val(a, 13, 24, `署名：${values.kSign || ''}`);
    a = row(11); const a3 = row(11);
    const res = values.sResult;
    lab(a, 1, 5, '従業員代表\n承認欄', { r2: a3 }); val(a, 6, 12, jpDate(values.sDate), { h: 'right', r2: a3 });
    put(a, 13, 24, `${res === '承認する' ? '■' : '□'} 承認する　　${res === '却下する' ? '■' : '□'} 却下する`, { h: 'center', border: { top: thin, left: thin, right: thin } });
    put(a3, 13, 24, `署名：${values.sSign || ''}`, { indent: 1, border: { bottom: thin, left: thin, right: thin } });
    row(3.5);
    put(row(6), 1, 24, '［申請方法］', { size: 9.5 });
    METHOD.forEach((s) => put(row(5.5), 1, 24, s, { size: 9.5, wrap: false, indent: 1 }));
    // フッター（アプリと同じ：ページの下端に、左にロゴと YUDENSHA、右に番号・名称・制定・改訂）。A4 の本文の高さ 279mm から余りを空ける
    const FOOT = 12;
    row(Math.max(2, 275 - total - FOOT));
    const line = { top: { style: 'thin', color: { argb: 'FF9A9A9A' } } };
    a = row(FOOT);
    put(a, 1, 2, '', { border: line });
    put(a, 3, 8, 'YUDENSHA', { border: line, wrap: false, bold: true, size: 12, color: 'FF1F3F8F' });
    ws.getCell(a, 3).font = { name: 'Arial Black', size: 12 * K, color: { argb: 'FF1F3F8F' } };
    put(a, 9, 24, `${t.code}　${t.title}　　${SEITEI}制定　　${KAITEI}最終改訂`, { border: line, wrap: false, h: 'right', size: 7.5, color: 'FF666666', v: 'bottom' });
    const logo = await fetch('assets/logo-mark.jpg').then((x) => x.arrayBuffer());
    const img = wb.addImage({ buffer: logo, extension: 'jpeg' });
    ws.addImage(img, { tl: { col: 0, row: a - 1 + 0.2 }, ext: { width: 143 * 0.38 * K, height: 66 * 0.38 * K } }); // 高さ約 6.6mm（アプリは 6.5mm）
    ws.pageSetup.printArea = `A1:X${r}`;

    const buf = await wb.xlsx.writeBuffer();
    const d = new Date(), p2 = (x) => String(x).padStart(2, '0');
    const x = document.createElement('a');
    x.href = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    x.download = `${t.title}_${p2(d.getFullYear() % 100)}${p2(d.getMonth() + 1)}${p2(d.getDate())}.xlsx`;
    document.body.append(x); x.click(); x.remove();
    setTimeout(() => URL.revokeObjectURL(x.href), 1000);
  }

  // 表題の下：Excel に出力（印刷しない）
  const excelBar = (kind) => ({ type: 'custom', render: ({ h, values }) => h('div', { class: 'k1-pages no-print s35-bar' },
    h('button', { type: 'button', onclick: () => exportExcel(values, kind).catch((e) => alert(e.message || String(e))) }, 'Excelに出力'),
    h('span', { class: 'k1-hint' }, '入力した内容を、この帳票と同じ並びのExcelファイルに書き出します。')) });

  // 総務部長の確認欄・従業員代表の承認欄
  const approval = { type: 'custom', render: ({ h, field }) => h('table', { class: 'grid s35' },
    h('colgroup', null, ...['38.75mm', '54.25mm', null].map((w) => h('col', { style: w ? `width:${w}` : null }))),
    h('tbody', null,
      h('tr', null, h('th', null, '総務部長', h('br'), '確認欄'), h('td', null, field({ key: 'kDate', type: 'date', jp: true })),
        h('td', { class: 's35-sign' }, h('div', { class: 's35-line' }, h('span', null, '署名：'), h('div', null, field({ key: 'kSign' }))))),
      h('tr', { class: 's35-tall' }, h('th', null, '従業員代表', h('br'), '承認欄'), h('td', null, field({ key: 'sDate', type: 'date', jp: true })),
        h('td', { class: 's35-sign' }, h('div', { class: 's35-res' }, field({ key: 'sResult', type: 'radio', options: ['承認する', '却下する'], nowrap: true, align: 'center' })),
          h('div', { class: 's35-line' }, h('span', null, '署名：'), h('div', null, field({ key: 'sSign' }))))))) };

  const make = (id, kind) => {
    const t = TEXT[kind];
    FORM_DEFS[id] = {
      code: t.code, title: t.title,
      seitei: SEITEI, kaitei: KAITEI, // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
      meta: [],
      stamps: [], // 元の様式に押印欄なし（確認欄・承認欄に署名）
      // 申請理由は文字の量に合わせて欄を伸ばす（長文が切れて印刷されないように。最初の高さより低くはしない）
      setup: ({ inputs }) => {
        const ta = inputs.riyu;
        if (!ta) return;
        const min = ShoshikiApp.layoutH(ta);
        const grow = () => { ta.style.height = '0'; ta.style.height = `${Math.max(min, ta.scrollHeight)}px`; };
        ta.addEventListener('input', grow);
        grow();
      },
      blocks: [
        excelBar(kind),
        // 申請日・申請者（元の様式と同じく右に寄せる）
        { type: 'row', gap: 0, items: [{ type: 'spacer', w: 41.67 }, { type: 'grid', cols: 3, colWidths: ['23.25mm', '15.5mm', null], rowH: 8, rows: [
          [{ label: '申請日', key: 'date', type: 'date', jp: true, lw: 1, span: 3 }],
          [{ label: '申請者', span: 1, rs: 2 }, { label: '部署', key: 'dept', lw: 1, span: 2 }],
          [{ label: '氏名', key: 'name', lw: 1, span: 2 }],
        ] }] },
        { type: 'para', text: leadOf(t).join('\n'), style: 'padding:0 3mm' },
        { type: 'para', text: '記', style: 'text-align:center' },
        { type: 'grid', cols: 4, colWidths: ['7.75mm', '31mm', '15.5mm', null], rowH: 8, rows: [
          [{ label: '1', span: 1, rs: 2 }, { label: '対象労働者', span: 1, rs: 2 }, { label: '部署', key: 'tDept', lw: 1, span: 2 }],
          [{ label: '氏名', key: 'tName', lw: 1, span: 2 }],
          [{ label: '2', span: 1 }, { label: '特別延長時間', span: 1 }, { text: t.limit, span: 2 }],
          ...(kind === 2 ? [[{ label: '3', span: 1 }, { label: '年間回数', span: 1 },
            { key: 'kaisuW', type: 'inline', span: 2, parts: [{ key: 'kaisu', type: 'select', options: ['1', '2', '3', '4', '5', '6'], align: 'center', w: 18 }, '回目　　※最大6回まで'] }]] : []),
          [{ label: String(kind === 2 ? 4 : 3), span: 1 }, { label: '申請理由', span: 1 }, { key: 'riyu', type: 'textarea', plain: true, lineToggle: false, lines: 4, span: 2 }],
        ] },
        { type: 'para', text: '・'.repeat(62), style: 'font-size:8pt;text-align:center;white-space:nowrap;overflow:hidden;line-height:1.2' },
        { type: 'para', text: `［回付ルート］\n　${ROUTE[0]}\n　${ROUTE[1]}`, style: 'font-size:9.5pt;line-height:1.5' },
        approval,
        { type: 'para', text: `［申請方法］\n${METHOD.map((s) => `　${s}`).join('\n')}`, style: 'font-size:9.5pt;line-height:1.5' },
      ],
    };
  };
  make('somu-a0035', 1);
  make('somu-a0036', 2);
})();
