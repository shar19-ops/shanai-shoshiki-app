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
 * 安全衛生委員会の議事録（Word .docx）も読む（2026-11-27 ユーザー指定：A案・番号は36から）
 *   「安全衛生目標」フォルダに毎月の議事録を入れるだけでよい。「(1) 12月度安全衛生目標」の下の
 *   「イ. 感電災害事故の防止」「ロ．…」の見出しだけを、番号 36・37… で取り込む（その下の「・」の文や、
 *   「4. 労働災害の…」より後ろは読まない。労働災害の報告などは取り出さない）。
 *   年は議事録のファイル名（8年11月…）か本文の「令和8年」から決め、目標の月がそれより前なら翌年（12月の議事録 → 1月度）。
 *   同じ月が Excel と議事録の両方にあるときは Excel を優先（議事録が読めないときや手で直したいときの予備）。
 *
 * 帳票の setup から：YGoals.bind(ctx, { rows: 8 })
 *   入力欄：goalMonth（月）・goalNo1〜（番号）・goal1〜（目標）。どの月の目標を入れたかは goalYm（2026-12 など）に覚える。
 */
(function () {
  const M = () => window.YMaster && window.YMaster.Master;
  const SUB = '安全衛生目標', FILE = '安全衛生目標.xlsx', SHEET = '安全衛生目標';
  // iPad（フォルダを選べない）：議事録・Excel のファイルを選ぶ
  const IPAD_HOW = '「ファイルを選ぶ」→「ファイル」の画面で Box ＞ 全社共有フォルダ ＞ 999_Y-Formatデータ ＞ app_data ＞ 安全衛生目標 を開き、議事録（.docx）を選んで「開く」（右上の「選択」で何か月分でも選べます）。';
  const PLACE = 'BOX の「全社共有フォルダ ＞ 999_Y-Formatデータ ＞ app_data ＞ 安全衛生目標」フォルダ（安全衛生委員会の議事録・安全衛生目標.xlsx）';

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

  // ---------- 安全衛生委員会の議事録（.docx）を読む ----------
  const GOAL_NO = 36; // 番号は検査項目（〜35）の続き
  const IROHA = 'イロハニホヘトチリヌルヲワカヨタ';
  const reiwa = (s) => (s === '元' ? 1 : Number(s)) + 2018;
  // 議事録1つ → { ym: '2026-12', list: [['36', '感電災害事故の防止'], ...] }（目標が無ければ null）
  async function readDocx(buf, fileName) {
    const get = await unzip(buf);
    const doc = xml(await get('word/document.xml') || '');
    const paras = tags(doc, 'p').map((p) => tags(p, 't').map((t) => t.textContent).join('').normalize('NFKC').trim()).filter(Boolean);
    const h = paras.findIndex((t) => /\d{1,2}\s*月度\s*安全衛生目標/.test(t));
    if (h < 0) return null;
    const month = Number(paras[h].match(/(\d{1,2})\s*月度/)[1]);
    const list = [];
    for (let i = h + 1; i < paras.length; i++) {
      const t = paras[i];
      const m = t.match(new RegExp(`^([${IROHA}])\\s*[.．。、,]\\s*(.+)$`));
      if (m) { list.push([String(GOAL_NO + list.length), m[2].trim()]); continue; }
      if (/^(\d+\s*[.．]|[(（]\d+[)）])/.test(t)) break; // 次の見出し（4. 労働災害… や (2)）で終わり
    }
    if (!list.length || month < 1 || month > 12) return null;
    // 年：ファイル名の「8年11月」→ 議事録の年月。無ければ本文で最初の「令和8年9月」
    const nm = String(fileName).normalize('NFKC');
    let y, mm;
    const f = nm.match(/(?:令和|R)?\s*(\d{1,2}|元)\s*年\s*(\d{1,2})\s*月/i);
    if (f) { y = reiwa(f[1]); mm = Number(f[2]); }
    else {
      const b = paras.join('\n').match(/令和\s*(\d{1,2}|元)\s*年\s*(\d{1,2})\s*月/);
      if (!b) return null;
      y = reiwa(b[1]); mm = Number(b[2]);
    }
    if (month < mm) y += 1; // 12月の議事録の 1月度 は翌年
    return { ym: `${y}-${String(month).padStart(2, '0')}`, list };
  }

  // ---------- 読み込みと保存 ----------
  const state = { goals: null, src: {}, skipped: [], at: '', err: '' };
  const listeners = [];
  const emit = () => listeners.forEach((f) => { try { f(); } catch (e) { /* noop */ } });
  // 「安全衛生目標」フォルダの 安全衛生目標.xlsx と議事録（.docx）をすべて読む。フォルダが無ければ app_data 直下の Excel だけ
  async function collect(hd) {
    const goals = {}, src = {}, skipped = [];
    let sub = null;
    try { sub = await hd.getDirectoryHandle(SUB); } catch (e) { /* 直下の Excel を読む */ }
    const files = [];
    if (sub) {
      for await (const [name, h] of sub.entries()) {
        if (h.kind === 'file' && !name.startsWith('~$') && /\.docx$/i.test(name)) files.push(h);
      }
    }
    // 議事録：古い名前順に読み、同じ月が2つあれば後のほう（名前順で後）を使う
    files.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    for (const h of files) {
      try {
        const r = await readDocx(await (await h.getFile()).arrayBuffer(), h.name);
        if (r) { goals[r.ym] = r.list; src[r.ym] = h.name; } else skipped.push(h.name);
      } catch (e) { console.warn('安全衛生目標：議事録を読めませんでした', h.name, e); skipped.push(h.name); }
    }
    // Excel（あれば。同じ月は Excel を優先）
    let xh = null;
    try { xh = await (sub || hd).getFileHandle(FILE); } catch (e) { if (sub) { try { xh = await hd.getFileHandle(FILE); } catch (e2) { /* 無い */ } } }
    if (xh) {
      let g = {};
      try { g = toGoals(await readXlsx(await (await xh.getFile()).arrayBuffer())); }
      catch (e) { if (!Object.keys(goals).length) throw e; } // 予備の Excel が空でも、議事録が読めていればよい
      Object.entries(g).forEach(([k, v]) => { goals[k] = v; src[k] = FILE; });
    }
    if (!Object.keys(goals).length) {
      const e = new Error(sub ? `「${SUB}」フォルダに、目標の入った議事録（.docx）も ${FILE} もありません。` : '');
      e.name = sub ? 'Error' : 'NotFoundError';
      throw e;
    }
    return { goals, src, skipped };
  }
  async function readFrom(hd) {
    const m = M();
    try {
      const { goals, src, skipped } = await m.within(collect(hd), m.T.read * 2, '安全衛生目標の読み取り'); // 議事録が何か月分もあるので長めに
      state.goals = goals; state.src = src; state.skipped = skipped; state.at = new Date().toISOString(); state.err = '';
      try { await m.kv.put('anzenGoals', { goals, src, at: state.at }); } catch (e) { /* 覚えられなくても今回は使える */ }
      emit();
      return true;
    } catch (e) {
      state.err = e && e.name === 'NotFoundError' ? `「${SUB}」フォルダが見つかりません。${PLACE}を確認してください。` : String((e && e.message) || e);
      emit();
      return false;
    }
  }
  let inited = null;
  function init() {
    return inited || (inited = (async () => {
      const m = M();
      try { const d = await m.kv.get('anzenGoals'); if (d && d.goals) { state.goals = d.goals; state.src = d.src || {}; state.at = d.at || ''; emit(); } } catch (e) { /* noop */ }
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
  async function pick() {
    const m = M();
    if (!m.canDir) return pickFiles();
    if (await m.pick() && m.state.handle) return readFrom(m.state.handle);
    return false;
  }
  // iPad など（フォルダを選べない）：「ファイル」アプリの Box から議事録（.docx）・安全衛生目標.xlsx を選ぶ（複数可。2026-11-27）
  //   フォルダ全体を読めないので、前に読み込んだ月に足していく（今月の議事録1つだけ選んでも前の月は消えない）。同じ月は Excel を優先
  async function pickFiles() {
    const files = await M().chooseFiles('.docx,.xlsx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    if (!files) return false;
    const goals = { ...(state.goals || {}) }, src = { ...(state.src || {}) }, skipped = [];
    let n = 0;
    const docs = files.filter((f) => /\.docx$/i.test(f.name)).sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    const xlsx = files.filter((f) => /\.xlsx$/i.test(f.name));
    for (const f of docs) {
      try { const r = await readDocx(await f.arrayBuffer(), f.name); if (r) { goals[r.ym] = r.list; src[r.ym] = f.name; n++; } else skipped.push(f.name); }
      catch (e) { console.warn('安全衛生目標：議事録を読めませんでした', f.name, e); skipped.push(f.name); }
    }
    for (const f of xlsx) {
      try { Object.entries(toGoals(await readXlsx(await f.arrayBuffer()))).forEach(([k, v]) => { goals[k] = v; src[k] = FILE; n++; }); }
      catch (e) { skipped.push(f.name); }
    }
    if (!n) { alert(`目標を読み取れませんでした（${skipped.join('、') || '選んだファイル'}）。\n安全衛生委員会の議事録（.docx）か ${FILE} を選んでください。`); return false; }
    state.goals = goals; state.src = src; state.skipped = skipped; state.at = new Date().toISOString(); state.err = '';
    try { await M().kv.put('anzenGoals', { goals, src, at: state.at }); } catch (e) { /* 今回は使える */ }
    emit();
    return true;
  }

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
    const what = m.canDir ? 'フォルダ' : 'ファイル';
    const pk = el('button', { type: 'button', class: !ok || m.state.lost ? 'primary' : null }, ok && m.canDir ? 'フォルダを選び直す' : `${what}を選ぶ`);
    pk.addEventListener('click', busy(pk, pick));
    const fill = el('button', { type: 'button' }, '検査日の月の目標を入れる');
    fill.addEventListener('click', fillNow);
    panel.replaceChildren(...[
      el('div', { class: 'mst-h' }, '月安全衛生目標'),
      ok
        ? el('div', { class: 'mst-st' }, `${fmtYm(months[0])}〜${fmtYm(months[months.length - 1])}（${months.length}か月分）`, el('br'), `${fmtAt(s.at)} に読み込み`)
        : el('div', { class: 'mst-st warn' }, 'まだ読み込んでいません。', el('br'), m.canDir
          ? `${PLACE}を読みます。「フォルダを選ぶ」で BOX の app_data フォルダを選んでください（BOX Drive が必要です）。`
          : IPAD_HOW),
      ok && !m.canDir ? el('div', { class: 'mst-st' }, '新しい月の議事録が出たら「ファイルを選ぶ」でその議事録を選んでください（前の月の分は残ります。iPad は自動で読み直せません）。') : null,
      e ? el('div', { class: 'mst-st' }, `${fmtYm(e.ym)}の目標：${s.src[e.ym] === FILE ? FILE : s.src[e.ym] ? `議事録「${s.src[e.ym]}」` : ''}`) : null,
      s.skipped && s.skipped.length ? el('div', { class: 'mst-st warn' }, `目標を読み取れなかった議事録：${s.skipped.join('、')}`) : null,
      e && e.instead ? el('div', { class: 'mst-st warn' }, `${fmtYm(e.instead)} の目標はまだ登録されていません（${fmtYm(e.ym)} の目標を使います）。`) : null,
      s.err ? el('div', { class: 'mst-st warn' }, s.err) : null,
      m.state.lost ? el('div', { class: 'mst-st warn' }, m.state.lost, el('br'), '「フォルダを選び直す」から app_data フォルダを選んでください。') : null,
      el('div', { class: 'mst-btns' }, ok && m.state.handle && !m.state.lost ? upd : null, pk),
      ok ? el('div', { class: 'mst-btns' }, fill) : null,
      el('div', { class: 'mst-note' },
        '検査日の月の目標が、自動で「月安全衛生目標」の欄に入ります（その月が無いときは前の月）。入った文字は手で直せます。',
        el('br'), '保存した報告書の目標は、あとで目標が更新されても変わりません。',
        el('br'), m.canDir ? 'フォルダは得意先・担当者マスタと同じ app_data です。' : 'iPad では Box アプリが必要です（「ファイル」の画面に Box が出ないときは「ブラウズ」→「…」→「編集」で Box をオン）。'),
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

  window.YGoals = { bind, state, _test: { readXlsx, toGoals, ym, readDocx } };
})();
