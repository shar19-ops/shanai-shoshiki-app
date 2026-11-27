/*
 * 月安全衛生目標（本-安全-A0001 安全･衛生検査指導報告書。2026-11-27 ユーザー指定：運用 B）
 *   安全品質保証部が毎月更新する目標を、BOX の Excel から読み、検査日の月の目標を帳票に自動で入れる。
 *   置き場所：得意先・担当者マスタと同じ app_data フォルダの中の「安全衛生目標」フォルダ ＞ 安全衛生目標.xlsx
 *             （app_data の直下に 安全衛生目標.xlsx を置いても読む）
 *   Excel の形：1行目は見出し（年月・番号・安全衛生目標）。2行目から1行に1項目。年月は月の最初の行だけでよい（空欄は上の行と同じ月）。
 *   フォルダは得意先・担当者マスタ（assets/master.js の YMaster.Master）と共通。どちらかで選べば、もう一方でも選び直し不要。
 *   読み込んだ内容は、このブラウザの IndexedDB（yformat-master の anzenGoals）に覚える。データはどこにも送らない。
 *   一度保存した報告書の目標は書き換えない（開いたときは空欄のときだけ入れる。検査日を変えたときだけ、その月の目標に入れ替える）。
 *
 * 帳票の setup から：YGoals.bind(ctx, { rows: 8 })
 *   入力欄：goalMonth（月）・goalNo1〜（番号）・goal1〜（目標）。どの月の目標を入れたかは goalYm（2026-12 など）に覚える。
 */
(function () {
  const M = () => window.YMaster && window.YMaster.Master;
  const SUB = '安全衛生目標', FILE = '安全衛生目標.xlsx', SHEET = '安全衛生目標';
  const PLACE = 'BOX の「全社共有フォルダ ＞ 999_Y-Formatデータ ＞ app_data ＞ 安全衛生目標」フォルダの「安全衛生目標.xlsx」';

  // ---------- Excel（.xlsx）を読む：zip を開いて、シートのセルの文字を取り出すだけの小さな読み取り ----------
  async function unzip(buf) {
    const dv = new DataView(buf), u8 = new Uint8Array(buf);
    let eocd = -1;
    for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('Excel のファイル（.xlsx）ではありません');
    const n = dv.getUint16(eocd + 10, true);
    let p = dv.getUint32(eocd + 16, true);
    const files = {};
    const dec = new TextDecoder();
    for (let k = 0; k < n; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
      const nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
      const name = dec.decode(u8.subarray(p + 46, p + 46 + nl));
      files[name] = { method, csize, off };
      p += 46 + nl + el + cl;
    }
    return async (name) => {
      const f = files[name];
      if (!f) return null;
      const start = f.off + 30 + dv.getUint16(f.off + 26, true) + dv.getUint16(f.off + 28, true);
      const data = u8.subarray(start, start + f.csize);
      if (f.method === 0) return dec.decode(data);
      if (f.method !== 8) throw new Error('この Excel のファイルは読めませんでした（圧縮の形式）');
      return new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
    };
  }
  const xml = (t) => new DOMParser().parseFromString(t, 'application/xml');
  const tags = (node, name) => [...node.getElementsByTagNameNS('*', name)];
  // 「安全衛生目標」という名前のシート（無ければ最初のシート）の各行を [[A, B, C, ...], ...] で返す
  async function readXlsx(buf) {
    const get = await unzip(buf);
    const wb = xml(await get('xl/workbook.xml') || '');
    const sheets = tags(wb, 'sheet');
    if (!sheets.length) throw new Error('Excel のシートが見つかりません');
    const sh = sheets.find((s) => s.getAttribute('name') === SHEET) || sheets[0];
    const rid = sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') || sh.getAttribute('r:id');
    const rels = xml(await get('xl/_rels/workbook.xml.rels') || '');
    let target = (tags(rels, 'Relationship').find((r) => r.getAttribute('Id') === rid) || { getAttribute: () => '' }).getAttribute('Target') || 'worksheets/sheet1.xml';
    target = target.startsWith('/') ? target.slice(1) : 'xl/' + target.replace(/^\.\//, '');
    const ss = await get('xl/sharedStrings.xml');
    const strs = ss ? tags(xml(ss), 'si').map((si) => tags(si, 't').map((t) => t.textContent).join('')) : [];
    const ws = xml(await get(target) || '');
    const col = (ref) => { let c = 0; for (const ch of String(ref).replace(/\d+$/, '')) c = c * 26 + ch.charCodeAt(0) - 64; return c - 1; };
    return tags(ws, 'row').map((r) => {
      const out = [];
      tags(r, 'c').forEach((c) => {
        const t = c.getAttribute('t'), v = tags(c, 'v')[0];
        let val;
        if (t === 's') val = strs[Number(v && v.textContent)] ?? '';
        else if (t === 'inlineStr') val = tags(c, 't').map((x) => x.textContent).join('');
        else if (t === 'str') val = v ? v.textContent : '';
        else val = v ? Number(v.textContent) : '';
        out[col(c.getAttribute('r'))] = val;
      });
      return out;
    });
  }
  // 年月：Excel の日付（数値）・「2026/12」「2026年12月」「令和8年12月」「R8.12」→ '2026-12'
  function ym(v) {
    if (typeof v === 'number' && v > 20000) { const d = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`; }
    const s = String(v ?? '').normalize('NFKC').trim();
    let m = s.match(/^(\d{4})\D+(\d{1,2})/);
    if (!m) { const r = s.match(/^(?:令和|R)\s*(\d{1,2}|元)\D+(\d{1,2})/i); if (r) m = [0, 2018 + (r[1] === '元' ? 1 : Number(r[1])), r[2]]; }
    if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) return '';
    return `${m[1]}-${String(Number(m[2])).padStart(2, '0')}`;
  }
  // 行 → { '2026-12': [[番号, 目標], ...], ... }
  function toGoals(rows) {
    const goals = {};
    let cur = '';
    rows.forEach((r) => {
      const a = r[0], no = r[1] ?? '', text = String(r[2] ?? '').trim();
      if (a !== '' && a != null) cur = ym(a); // 見出しの行（「年月」）は月にならない → その下の行の年月で始まる
      if (!cur || !text) return;
      (goals[cur] = goals[cur] || []).push([String(no).trim(), text]);
    });
    if (!Object.keys(goals).length) throw new Error(`${FILE} に目標がありません（1行目は見出し、A列＝年月・B列＝番号・C列＝安全衛生目標）`);
    return goals;
  }

  // ---------- 読み込みと保存 ----------
  const state = { goals: null, at: '', err: '' };
  const listeners = [];
  const emit = () => listeners.forEach((f) => { try { f(); } catch (e) { /* noop */ } });
  async function fileHandle(hd) {
    try { return await (await hd.getDirectoryHandle(SUB)).getFileHandle(FILE); }
    catch (e) { return hd.getFileHandle(FILE); } // app_data の直下に置いたとき
  }
  async function readFrom(hd) {
    const m = M();
    try {
      const goals = await m.within((async () => toGoals(await readXlsx(await (await (await fileHandle(hd)).getFile()).arrayBuffer())))(), m.T.read, `${FILE} の読み取り`);
      state.goals = goals; state.at = new Date().toISOString(); state.err = '';
      try { await m.kv.put('anzenGoals', { goals, at: state.at }); } catch (e) { /* 覚えられなくても今回は使える */ }
      emit();
      return true;
    } catch (e) {
      state.err = e && e.name === 'NotFoundError' ? `${FILE} が見つかりません。${PLACE}を確認してください。` : String((e && e.message) || e);
      emit();
      return false;
    }
  }
  let inited = null;
  function init() {
    return inited || (inited = (async () => {
      const m = M();
      try { const d = await m.kv.get('anzenGoals'); if (d && d.goals) { state.goals = d.goals; state.at = d.at || ''; emit(); } } catch (e) { /* noop */ }
      await m.init(); // 前に選んだフォルダの確認（得意先・担当者マスタと共通。時間切れ付き）
      const hd = m.state.handle;
      if (hd && !m.state.lost) {
        try { if (await m.within(hd.queryPermission({ mode: 'read' }), m.T.query, 'フォルダの確認') === 'granted') await readFrom(hd); }
        catch (e) { console.warn('安全衛生目標：前回の内容を使います', e); }
      }
      emit();
    })());
  }
  async function update() { const m = M(); if (await m.update() && m.state.handle) return readFrom(m.state.handle); return false; }
  async function pick() { const m = M(); if (await m.pick() && m.state.handle) return readFrom(m.state.handle); return false; }

  // ---------- 帳票へ入れる ----------
  const pad = (n) => String(n).padStart(2, '0');
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
  const fmtYm = (k) => k ? `${k.slice(0, 4)}年${Number(k.slice(5))}月` : '';
  // 検査日の月（空欄なら今月）。その月が無ければ、それより前でいちばん新しい月
  function entryFor(k) {
    const g = state.goals;
    if (!g) return null;
    if (g[k]) return { ym: k, list: g[k] };
    const prev = Object.keys(g).filter((x) => x <= k).sort().pop();
    return prev ? { ym: prev, list: g[prev], instead: k } : null;
  }
  let ctx = null, rows = 8;
  const target = () => { const d = String((ctx && ctx.values.date) || ''); return /^\d{4}-\d{2}/.test(d) ? d.slice(0, 7) : today(); };
  const cur = () => Array.from({ length: rows }, (_, i) => [String(ctx.values[`goalNo${i + 1}`] ?? ''), String(ctx.values[`goal${i + 1}`] ?? '')]);
  const isEmpty = () => cur().every(([n, t]) => !n.trim() && !t.trim());
  const same = (list) => cur().every(([n, t], i) => n === String((list[i] || [])[0] ?? '') && t === String((list[i] || [])[1] ?? ''));
  function apply(e) {
    const { setVal, inputs } = ctx;
    setVal('goalYm', e.ym);
    setVal('goalMonth', String(Number(e.ym.slice(5))));
    for (let i = 1; i <= rows; i++) {
      const [no, text] = e.list[i - 1] || ['', ''];
      setVal(`goalNo${i}`, no); setVal(`goal${i}`, text);
    }
    ['goalMonth', ...Array.from({ length: rows }, (_, i) => [`goalNo${i + 1}`, `goal${i + 1}`]).flat()]
      .forEach((k) => { const x = inputs[k]; if (x) x.dispatchEvent(new Event('blur')); }); // 入りきらないときは文字を小さく
    if (e.list.length > rows) console.warn(`安全衛生目標：${fmtYm(e.ym)} は ${e.list.length} 項目（帳票は ${rows} 行）`);
  }
  // 開いたとき・読み込んだとき：空欄なら入れる。検査日を変えたとき（byDate）：入れた目標のままなら入れ替え、手で直していれば確認
  function auto(byDate) {
    if (!ctx) return;
    const e = entryFor(target());
    if (!e) return;
    if (ctx.values.goalYm === e.ym && same(e.list)) return;
    if (isEmpty()) { apply(e); return; }
    if (!byDate) return; // 保存した報告書の目標は、開いただけでは書き換えない
    const prev = ctx.values.goalYm && state.goals[ctx.values.goalYm];
    if (prev && same(prev)) { apply(e); return; }
    if (confirm(`月安全衛生目標を ${fmtYm(e.ym)} の目標に入れ替えますか？\n（今の目標の欄は手で直されています）`)) apply(e);
  }
  function fillNow() {
    const e = entryFor(target());
    if (!e) { alert(state.goals ? `${fmtYm(target())} までの目標が ${FILE} にありません。` : '安全衛生目標をまだ読み込んでいません。'); return; }
    if (!isEmpty() && !same(e.list) && !confirm(`今の目標の欄を ${fmtYm(e.ym)} の目標で置き換えます。よろしいですか？`)) return;
    apply(e);
  }

  // ---------- ツールバーのボタンと小さな画面 ----------
  const el = (tag, attrs, ...kids) => {
    const e = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => { if (v != null) e.setAttribute(k, v); });
    kids.forEach((k) => { if (k != null) e.append(k); });
    return e;
  };
  const fmtAt = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  let panel = null;
  function drawPanel() {
    const m = M(), s = state, ok = !!s.goals;
    const busy = (b, fn) => async () => { b.disabled = true; try { await fn(); } finally { b.disabled = false; } };
    const months = ok ? Object.keys(s.goals).sort() : [];
    const e = ok ? entryFor(target()) : null;
    const upd = el('button', { type: 'button', class: 'primary' }, '最新に更新');
    upd.addEventListener('click', busy(upd, update));
    const pk = el('button', { type: 'button', class: !ok || m.state.lost ? 'primary' : null }, ok ? 'フォルダを選び直す' : 'フォルダを選ぶ');
    pk.addEventListener('click', busy(pk, pick));
    const fill = el('button', { type: 'button' }, '検査日の月の目標を入れる');
    fill.addEventListener('click', fillNow);
    panel.replaceChildren(...[
      el('div', { class: 'mst-h' }, '月安全衛生目標'),
      ok
        ? el('div', { class: 'mst-st' }, `${fmtYm(months[0])}〜${fmtYm(months[months.length - 1])}（${months.length}か月分）`, el('br'), `${fmtAt(s.at)} に読み込み`)
        : el('div', { class: 'mst-st warn' }, 'まだ読み込んでいません。', el('br'), `${PLACE}を読みます。「フォルダを選ぶ」で BOX の app_data フォルダを選んでください（BOX Drive が必要です）。`),
      e && e.instead ? el('div', { class: 'mst-st warn' }, `${fmtYm(e.instead)} の目標はまだ登録されていません（${fmtYm(e.ym)} の目標を使います）。`) : null,
      s.err ? el('div', { class: 'mst-st warn' }, s.err) : null,
      m.state.lost ? el('div', { class: 'mst-st warn' }, m.state.lost, el('br'), '「フォルダを選び直す」から app_data フォルダを選んでください。') : null,
      el('div', { class: 'mst-btns' }, ok && m.state.handle && !m.state.lost ? upd : null, pk),
      ok ? el('div', { class: 'mst-btns' }, fill) : null,
      el('div', { class: 'mst-note' },
        '検査日の月の目標が、自動で「月安全衛生目標」の欄に入ります（その月が無いときは前の月）。入った文字は手で直せます。',
        el('br'), '保存した報告書の目標は、あとで目標が更新されても変わりません。',
        el('br'), 'フォルダは得意先・担当者マスタと同じ app_data です。'),
    ].filter(Boolean));
  }
  function togglePanel(btn) {
    if (panel && !panel.hidden) { panel.hidden = true; return; }
    if (!panel) {
      panel = el('div', { class: 'mst-panel no-print', hidden: '' });
      panel.addEventListener('click', (e) => e.stopPropagation());
      document.addEventListener('click', (e) => { if (e.isTrusted) panel.hidden = true; });
      document.body.append(panel);
      listeners.push(() => { if (!panel.hidden) drawPanel(); });
      M().onChange(() => { if (!panel.hidden) drawPanel(); });
    }
    drawPanel();
    panel.hidden = false;
    const r = btn.getBoundingClientRect();
    panel.style.top = (r.bottom + 6) + 'px';
    panel.style.left = Math.max(8, Math.min(r.left, window.innerWidth - panel.offsetWidth - 8)) + 'px';
  }

  // 帳票の setup から呼ぶ（作り直し（ファイルを開く）のたびに呼ばれる）
  function bind(c, opt) {
    if (!M()) return;
    ctx = c; rows = (opt && opt.rows) || rows;
    let btn = document.querySelector('.toolbar .tb-master');
    if (!btn) {
      const tb = document.querySelector('.toolbar');
      if (!tb) return;
      btn = el('button', { type: 'button', class: 'tb-master' });
      btn.addEventListener('click', (e) => { e.stopPropagation(); togglePanel(btn); });
      tb.insertBefore(btn, tb.querySelector('.tb-attach') || tb.querySelector('button.primary'));
      const label = () => {
        const lost = M().state.lost;
        btn.textContent = lost ? '安全衛生目標（要選び直し）' : state.goals ? '安全衛生目標 ✓' : '安全衛生目標（未読込）';
        btn.classList.toggle('warn', !state.goals || !!lost || !!state.err);
        btn.title = lost || state.err || (state.goals ? `${fmtAt(state.at)} 読込` : '月安全衛生目標を BOX から読み込む');
      };
      listeners.push(label); M().onChange(label);
      listeners.push(() => auto(false)); // 読み込めたら、空欄の報告書に入れる
      label();
    }
    const d = c.inputs.date;
    if (d && !d.dataset.goals) { d.dataset.goals = '1'; d.addEventListener('change', () => setTimeout(() => auto(true))); } // 検査日を変えたとき（setup が同じ欄で2回呼ばれても1つだけ）
    init().then(() => auto(false));
    auto(false);
  }

  window.YGoals = { bind, state, _test: { readXlsx, toGoals, ym } };
})();
