// 受注報告登録メモ（簡易版）
// 本来の受注登録メモアプリ（juchu-touroku-webapp、別アプリとして継続）は社内共有フォルダの得意先・担当者マスタを読み込む。
// ここでは BOX の同じマスタ（customers.json / staff.json）を「マスタ」ボタンで読み込み、コード・名称の一部から候補を選べる。
// 読み込まなくても、コード・名称は手入力できる。検印の流れ・添付書類・CSV出力は持たない（紙で回送）。
// 項目・選択肢・計算は受注登録メモアプリの form-fields.js に合わせる。
(function () {
  const C = CODES;
  const it = (no, label, key, o = {}) => ({ label: `${no}. ${label}`, key, span: 12, req: true, ...o });

  // ---------- 得意先・担当者マスタ（2026-11-23 ユーザー指定） ----------
  // BOX の app_data フォルダ（受注登録メモアプリと同じ customers.json / staff.json。各 [{ code, name }]）を読む。
  // 社員は BOX でビューアー（読み取り専用）。実データはリポジトリに入れない。
  // 選んだフォルダと読み込んだ内容は、このブラウザの IndexedDB に覚える（次からは選ばなくても候補が出る）。
  // フォルダを読める（権限が残っている）ときは、開くたびに読み直して最新にする。データはどこにも送らない。
  const Master = (() => {
    const ST = 'kv';
    let dbp = null;
    const db = () => dbp || (dbp = new Promise((res, rej) => {
      const r = indexedDB.open('yformat-master', 1);
      r.onupgradeneeded = () => r.result.createObjectStore(ST);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
    const idb = async (mode, fn) => {
      const d = await db();
      return new Promise((res, rej) => {
        const tx = d.transaction(ST, mode);
        const req = fn(tx.objectStore(ST));
        tx.oncomplete = () => res(req.result);
        tx.onerror = () => rej(tx.error);
      });
    };
    const get = (k) => idb('readonly', (s) => s.get(k));
    const put = (k, v) => idb('readwrite', (s) => s.put(v, k));
    // 検索用：全角・半角、ひらがな・カタカナ、大文字・小文字、空白の違いを無視
    const norm = (t) => String(t ?? '').normalize('NFKC').toLowerCase()
      .replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60)).replace(/\s+/g, '');
    const index = (list) => (Array.isArray(list) ? list : [])
      .filter((x) => x && x.code != null && x.name != null)
      .map((x) => ({ code: String(x.code).trim(), name: String(x.name).trim(), c: norm(x.code), n: norm(x.name) }));
    const state = { customers: null, staff: null, at: '', dir: '', handle: null };
    const listeners = [];
    const emit = () => listeners.forEach((f) => f());
    const FILES = { customers: 'customers.json', staff: 'staff.json' };
    const parse = (text, name) => {
      let d;
      try { d = JSON.parse(String(text).replace(/^﻿/, '')); } catch (e) { throw new Error(`${name} を読めませんでした（JSONの形式ではありません）`); }
      if (!Array.isArray(d) || !d.length) throw new Error(`${name} にデータがありません`);
      return d;
    };
    async function apply(c, s, dir) {
      const at = new Date().toISOString();
      state.customers = index(c); state.staff = index(s); state.at = at; state.dir = dir || '';
      try { await put('data', { customers: c, staff: s, at, dir: state.dir }); } catch (e) { /* 覚えられなくても今回は使える */ }
      emit();
    }
    async function readDir(hd) {
      const read = async (name) => parse(await (await (await hd.getFileHandle(name)).getFile()).text(), name);
      return [await read(FILES.customers), await read(FILES.staff)];
    }
    const NOT_FOUND = 'このフォルダに customers.json と staff.json が見つかりません。\nBOX の「app_data」フォルダを選んでください。';
    // フォルダを選ぶ（Edge・Chrome）。使えないブラウザは2つのファイルを選ぶ
    async function pick() {
      if (window.showDirectoryPicker) {
        let hd;
        try { hd = await window.showDirectoryPicker({ id: 'yformat-master', mode: 'read' }); } catch (e) { return false; }
        let cs;
        try { cs = await readDir(hd); } catch (e) { alert(e && e.name === 'NotFoundError' ? NOT_FOUND : String(e.message || e)); return false; }
        state.handle = hd;
        try { await put('dir', hd); } catch (e) { /* noop */ }
        await apply(cs[0], cs[1], hd.name);
        return true;
      }
      return new Promise((resolve) => {
        const inp = document.createElement('input');
        inp.type = 'file'; inp.multiple = true; inp.accept = '.json,application/json'; inp.style.display = 'none';
        inp.addEventListener('change', async () => {
          const files = [...inp.files];
          inp.remove();
          const f = (name) => files.find((x) => x.name.toLowerCase() === name);
          if (!f(FILES.customers) || !f(FILES.staff)) { alert('customers.json と staff.json の2つを選んでください（BOX の「app_data」フォルダ）。'); resolve(false); return; }
          try { await apply(parse(await f(FILES.customers).text(), FILES.customers), parse(await f(FILES.staff).text(), FILES.staff), ''); resolve(true); }
          catch (e) { alert(String(e.message || e)); resolve(false); }
        });
        document.body.append(inp); inp.click();
      });
    }
    // 前に選んだフォルダから読み直す（権限が切れていれば、ここで確認が出る）
    async function update() {
      const hd = state.handle;
      if (!hd) return pick();
      try { if (await hd.requestPermission({ mode: 'read' }) !== 'granted') return false; } catch (e) { return pick(); }
      try { const cs = await readDir(hd); await apply(cs[0], cs[1], hd.name); return true; }
      catch (e) { alert(e && e.name === 'NotFoundError' ? NOT_FOUND : `読み込めませんでした：${e.message || e}`); return false; }
    }
    let inited = null;
    function init() {
      return inited || (inited = (async () => {
        try {
          const d = await get('data');
          if (d) { state.customers = index(d.customers); state.staff = index(d.staff); state.at = d.at || ''; state.dir = d.dir || ''; emit(); }
          const hd = await get('dir');
          if (hd) {
            state.handle = hd;
            if (await hd.queryPermission({ mode: 'read' }) === 'granted') {
              const cs = await readDir(hd);
              await apply(cs[0], cs[1], hd.name);
            }
          }
        } catch (e) { console.warn('マスタ：前回の内容を使います', e); }
      })());
    }
    // 候補：コードが一致 → コードの先頭が一致 → 名称の先頭が一致 → 一部が一致 の順
    function search(kind, q, limit = 20) {
      const list = state[kind];
      const nq = norm(q);
      if (!list || !nq) return { items: [], total: 0 };
      const hit = [];
      for (const x of list) {
        let r;
        if (x.c === nq) r = 0;
        else if (x.c.startsWith(nq)) r = 1;
        else if (x.n.startsWith(nq)) r = 2;
        else if (x.c.includes(nq) || x.n.includes(nq)) r = 3;
        else continue;
        hit.push([r, x]);
      }
      hit.sort((a, b) => a[0] - b[0]);
      return { items: hit.slice(0, limit).map((a) => a[1]), total: hit.length };
    }
    const byCode = (kind, code) => {
      const c = norm(code);
      return c && state[kind] ? state[kind].find((x) => x.c === c) || null : null;
    };
    return { state, init, pick, update, search, byCode, onChange: (f) => listeners.push(f) };
  })();

  // マスタから選べる欄：コードと名称のどちらに入力しても候補が出る。選ぶと両方に入る
  const MASTER_FIELDS = [['keiyaku', 'customers'], ['seshu', 'customers'], ['sekkei', 'customers'], ['kenchiku', 'customers'],
    ['eigyo', 'staff'], ['koji', 'staff']];
  const fmtAt = (iso) => {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  const el = (tag, attrs, ...kids) => {
    const e = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => { if (k === 'onclick') e.addEventListener('click', v); else if (v != null) e.setAttribute(k, v); });
    kids.forEach((k) => { if (k != null) e.append(k); });
    return e;
  };
  // 候補の一覧（画面に1つだけ。印刷には出ない）
  let pop = null;
  const popState = { input: null, items: [], idx: -1, choose: null };
  function hidePop() { if (pop) pop.hidden = true; popState.input = null; }
  function placePop() {
    if (!pop || pop.hidden || !popState.input) return;
    const r = popState.input.getBoundingClientRect();
    pop.style.left = Math.max(4, Math.min(r.left, window.innerWidth - pop.offsetWidth - 4)) + 'px';
    pop.style.top = (r.bottom + 2) + 'px';
  }
  function showPop(input, res, choose) {
    if (!pop) {
      pop = el('div', { class: 'mst-pop no-print', hidden: '' });
      pop.addEventListener('mousedown', (e) => {
        e.preventDefault(); // 入力欄からフォーカスを外さない
        const row = e.target.closest('.mst-row');
        if (row && popState.choose) popState.choose(popState.items[Number(row.dataset.i)]);
      });
      document.body.append(pop);
      window.addEventListener('scroll', placePop, true);
      window.addEventListener('resize', placePop);
    }
    if (!res.items.length) { hidePop(); return; }
    Object.assign(popState, { input, items: res.items, idx: -1, choose });
    pop.replaceChildren(...res.items.map((m, i) => el('div', { class: 'mst-row', 'data-i': i }, el('span', { class: 'mst-cd' }, m.code), el('span', { class: 'mst-nm' }, m.name))));
    if (res.total > res.items.length) pop.append(el('div', { class: 'mst-more' }, `ほか ${(res.total - res.items.length).toLocaleString()} 件（続けて入力すると絞り込めます）`));
    pop.style.minWidth = Math.max(input.getBoundingClientRect().width, 320) + 'px';
    pop.hidden = false;
    placePop();
  }
  function movePop(d) {
    const rows = pop.querySelectorAll('.mst-row');
    const n = rows.length;
    popState.idx = popState.idx < 0 && d < 0 ? n - 1 : (popState.idx + d + n) % n;
    rows.forEach((r, i) => r.classList.toggle('on', i === popState.idx));
    if (popState.idx >= 0) rows[popState.idx].scrollIntoView({ block: 'nearest' });
  }

  function bindMaster({ inputs, setVal }) {
    Master.init();
    // ツールバーの「マスタ」ボタン（作り直し（ファイルを開く）でも1つだけ）
    let btn = document.querySelector('.toolbar .tb-master');
    if (!btn) {
      const tb = document.querySelector('.toolbar');
      if (!tb) return;
      btn = el('button', { type: 'button', class: 'tb-master' });
      btn.addEventListener('click', (e) => { e.stopPropagation(); togglePanel(btn); });
      tb.insertBefore(btn, tb.querySelector('.tb-attach') || tb.querySelector('button.primary'));
      const label = () => {
        const s = Master.state;
        const ok = s.customers && s.customers.length;
        btn.textContent = ok ? 'マスタ ✓' : 'マスタ（未読込）';
        btn.classList.toggle('warn', !ok);
        btn.title = ok ? `得意先 ${s.customers.length.toLocaleString()}件・担当者 ${s.staff.length.toLocaleString()}件（${fmtAt(s.at)} 読込）` : '得意先・担当者マスタを BOX から読み込む';
      };
      Master.onChange(label);
      label();
    }
    MASTER_FIELDS.forEach(([key, kind]) => {
      const cd = inputs[key + 'Cd'], nm = inputs[key + 'Name'];
      if (!cd || !nm) return;
      const choose = (m) => {
        if (!m) return;
        cd.value = m.code; nm.value = m.name;
        setVal(key + 'Cd', m.code); setVal(key + 'Name', m.name);
        hidePop();
      };
      [cd, nm].forEach((inp) => {
        const run = () => { if (Master.state[kind]) showPop(inp, Master.search(kind, inp.value), choose); };
        inp.setAttribute('autocomplete', 'off');
        inp.addEventListener('input', run); // 変換中（ひらがな）でもカタカナの名称に当たる
        inp.addEventListener('compositionend', run);
        inp.addEventListener('focus', () => { if (inp.value) run(); });
        inp.addEventListener('keydown', (e) => {
          if (!pop || pop.hidden || popState.input !== inp || e.isComposing) return;
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); movePop(e.key === 'ArrowDown' ? 1 : -1); }
          else if (e.key === 'Enter') { const m = popState.items[popState.idx >= 0 ? popState.idx : 0]; if (m) { e.preventDefault(); choose(m); } }
          else if (e.key === 'Escape') { e.preventDefault(); hidePop(); }
        });
        inp.addEventListener('blur', () => setTimeout(() => { if (popState.input === inp) hidePop(); }, 120));
      });
      // コードだけ手で入れたときは、名称が空なら名称を入れる
      cd.addEventListener('change', () => {
        const m = Master.byCode(kind, cd.value);
        if (m && !nm.value) { nm.value = m.name; setVal(key + 'Name', m.name); }
      });
    });
  }

  // 「マスタ」ボタンの小さな画面：読み込みの状態と「最新に更新」「フォルダを選ぶ」
  let panel = null;
  function togglePanel(btn) {
    if (panel && !panel.hidden) { panel.hidden = true; return; }
    if (!panel) {
      panel = el('div', { class: 'mst-panel no-print', hidden: '' });
      panel.addEventListener('click', (e) => e.stopPropagation());
      document.addEventListener('click', (e) => { if (e.isTrusted) panel.hidden = true; }); // ファイル選択（inp.click()）では閉じない
      document.body.append(panel);
      Master.onChange(() => { if (!panel.hidden) drawPanel(); });
    }
    drawPanel();
    panel.hidden = false;
    const r = btn.getBoundingClientRect();
    panel.style.top = (r.bottom + 6) + 'px';
    panel.style.left = Math.max(8, Math.min(r.left, window.innerWidth - panel.offsetWidth - 8)) + 'px';
  }
  function drawPanel() {
    const s = Master.state;
    const ok = s.customers && s.customers.length;
    const busy = (b, fn) => async () => { b.disabled = true; try { await fn(); } finally { b.disabled = false; } };
    const upd = el('button', { type: 'button', class: 'primary' }, '最新に更新');
    upd.addEventListener('click', busy(upd, Master.update));
    const pk = el('button', { type: 'button' }, ok ? 'フォルダを選び直す' : 'フォルダを選ぶ');
    pk.addEventListener('click', busy(pk, Master.pick));
    panel.replaceChildren(
      el('div', { class: 'mst-h' }, '得意先・担当者マスタ'),
      ok
        ? el('div', { class: 'mst-st' }, `得意先 ${s.customers.length.toLocaleString()}件・担当者 ${s.staff.length.toLocaleString()}件`, el('br'),
          `${fmtAt(s.at)} に${s.dir ? `「${s.dir}」から` : ''}読み込み`)
        : el('div', { class: 'mst-st warn' }, 'まだ読み込んでいません。', el('br'), 'BOX の「app_data」フォルダを選んでください。'),
      el('div', { class: 'mst-btns' }, ok && s.handle ? upd : null, pk),
      el('div', { class: 'mst-note' },
        '読み込むと、02 契約先・15〜17・30 営業担当者・32 工事担当者で、コードか名称の一部を入力すると候補が出ます（↑↓で選んで Enter）。',
        el('br'), '読み込んだマスタは、このパソコンのブラウザに保存されます（外部には送りません）。'));
  }

  // 得意先・担当者：コードと名称（マスタを読み込めば候補から選べる。手入力もできる）
  // 縦の罫線をそろえるため、見出しは全行4列、区切りは4列ごと（4・8・12・16・20列目）に置く
  //   2つ並べる行：見出し4＋入力8｜見出し4＋入力8　　3つ並べる行：(見出し4＋入力4)×3
  //   コード欄：見出し4＋コード4＋名称（残り）
  const code = (no, label, key, o = {}) => [
    { label: `${no}. ${label}`, key: key + 'Cd', placeholder: 'コード', span: 8, req: o.req !== false },
    { key: key + 'Name', placeholder: o.name || '名称', span: o.span || 16 },
  ];
  const sel = (no, label, key, options, o = {}) => it(no, label, key, { type: 'select', options, span: 8, ...o });
  const three = (label, key, o = {}) => ({ label, key, type: 'number', span: 8, ...o });
  // 部署コード（31. 受注担当部署・33. 施工担当部署）と前のコードの置き換え。営-06 と共通なので app.js の LISTS に（2026-11-27）
  const busho = LISTS.bushoCodes;
  const bushoOld = LISTS.bushoCodesOld;
  // 38. 小工事実行予算の列（見出し, keyの末尾）
  const COLS = [['材料費\n（F50）', 'Zai'], ['外注費\n（Z50）', 'Gai'], ['工料\n（K50）', 'Kou'], ['経費\n（O00）', 'Kei2']];
  const pct = (a, b) => (a ? Math.floor(((a - b) / a) * 1000) / 10 : null); // 粗利率（小数点第2位切捨て）

  // 03.物件略称(漢字)の入力から04.物件略称(ｶﾀｶﾅ)を自動入力（受注登録メモアプリの bindFuriganaAutoFill を移植）
  // IMEで変換確定前のかな（compositionupdate）を捕まえて全角カタカナにし、04へ追記する。英数字はそのまま追記。
  // 03の末尾を消すと対応する分を04からも消す。04を手で直した後は、04には触れない。
  const isKana = (t) => /^[぀-ゟ゠-ヿー]*$/.test(t || '');
  const isAlnum = (t) => /^[A-Za-z0-9Ａ-Ｚａ-ｚ０-９]+$/.test(t || '');
  const toKatakana = (t) => String(t ?? '').replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
  function bindKana({ inputs, setVal }) {
    const kanji = inputs.nameKanji, kana = inputs.nameKana;
    if (!kanji || !kana) return;
    let composing = '';
    let auto = kana.value || '';
    let segments = []; // { kanjiLen, kana }
    let tracked = kanji.value.length;
    const intact = () => kana.value === auto;
    const apply = () => { kana.value = auto; setVal('nameKana', auto); };
    const push = (len, k) => { segments.push({ kanjiLen: len, kana: k }); tracked += len; auto += k; apply(); };
    const trim = (newLen) => {
      if (!intact()) { tracked = newLen; segments = []; return; }
      while (segments.length && tracked > newLen) {
        const seg = segments.pop();
        tracked -= seg.kanjiLen;
        auto = auto.slice(0, auto.length - seg.kana.length);
      }
      tracked = Math.min(tracked, newLen);
      apply();
    };
    kanji.addEventListener('compositionstart', () => { composing = ''; });
    kanji.addEventListener('compositionupdate', (e) => { if (isKana(e.data)) composing = e.data; });
    kanji.addEventListener('compositionend', () => {
      if (!composing || !intact()) return;
      const added = kanji.value.length - tracked;
      if (added > 0) push(added, toKatakana(composing));
    });
    kanji.addEventListener('input', (e) => {
      const newLen = kanji.value.length;
      if (newLen === 0) {
        segments = []; tracked = 0;
        if (intact()) { auto = ''; apply(); }
        return;
      }
      if (e.isComposing) return; // 変換中はcompositionendで処理
      if (newLen < tracked) { trim(newLen); return; }
      // 英数字の追記だけ04へ反映。貼り付け・途中への挿入などは追跡をやめる
      if (!e.data || !isAlnum(e.data) || newLen !== tracked + e.data.length || !intact()) { tracked = newLen; segments = []; return; }
      push(e.data.length, e.data);
    });
  }

  // 06.施工地区：都道府県・市区町村の候補（forms/data/prefectures.js）から選べるように。
  // 候補を選ぶと、07.工事場所の先頭に名称を入れる（受注登録メモアプリの applyPrefixLink を移植）。
  // 前に入れた名称（placePrefix）だけを差し替え、その後ろに入力した番地などは残す。
  function bindChiku({ inputs, values, setVal }) {
    const chiku = inputs.chiku, place = inputs.place;
    if (!chiku || !place) return;
    const s = document.createElement('script');
    s.src = 'forms/data/prefectures.js';
    s.onload = () => {
      const dl = document.createElement('datalist');
      dl.id = 'dl_chiku';
      window.PREFECTURES.forEach((p) => { const o = document.createElement('option'); o.value = p; dl.append(o); });
      document.body.append(dl);
      chiku.setAttribute('list', 'dl_chiku');
    };
    document.head.append(s);
    let last = '';
    const apply = () => {
      if (chiku.value === last || !window.PREFECTURES || window.PREFECTURES.indexOf(chiku.value) < 0) return; // 候補から選んだ時だけ
      last = chiku.value;
      const name = chiku.value.replace(/^\d+\s/, '');
      const old = values.placePrefix || '';
      const cur = place.value || '';
      const rest = cur === old ? '' : old && cur.startsWith(old) ? cur.slice(old.length) : cur;
      place.value = name + rest;
      setVal('place', place.value);
      setVal('placePrefix', name);
    };
    chiku.addEventListener('input', apply); // 候補を選ぶとすぐ反映
    chiku.addEventListener('change', apply);
    last = chiku.value;
  }

  FORM_DEFS['22'] = {
    code: '工-04', hokan: '工事管理部', title: '受注報告登録メモ',
    selfStamp: '発行者',
    meta: [{ label: '発行日', key: 'date', type: 'date' }],
    stamps: [{ boxes: ['確認', '確認', '発行者'] }],
    bottomStamps: ['登録済検印'],
    // 付属帳票（ツールバーのボタンで開く。事業所・工番・物件略称を転記。2026-11-18 ユーザー指定）
    attach: [
      { id: '49', code: '工-13', title: '工事実行金額計算書', fill: { office: 'jigyosho', koban: 'koban', subject: 'nameKanji', keiyaku: 'keiyakuName', keiyakuGaku: 'keiyakuGaku', suitei: 'suiteiGaku', eigyo: 'eigyoName', koji: 'kojiName', kFrom: 'kFrom', kTo: 'kTo', place: 'place' },
        labels: { office: '事業所', koban: '工番', subject: '件名', keiyaku: '契約先', keiyakuGaku: '契約金額', suitei: '推定金額', eigyo: '営業担当', koji: '工事担当', kFrom: '工期', place: '工事場所' } },
      { id: '56', code: '工-14', title: '工事経費計算書', fill: { office: 'jigyosho', koban: 'koban', subject: 'nameKanji' }, labels: { office: '事業所', koban: '工番', subject: '件名' } },
    ],
    setup: (ctx) => { bindKana(ctx); bindChiku(ctx); bindMaster(ctx); },
    blocks: [
      { type: 'grid', dense: true, lalign: 'left', lw: 4, rows: [
        [{ label: '注文区分', key: 'kubun', type: 'select', options: ['1：新規', '2：増額', '3：減額', '4：赤伝/黒伝', '5：工事取消'], span: 12, req: true },
          { label: '施工事業所', key: 'jigyosho', type: 'select', options: LISTS.officeCodes, span: 12, req: true }],
        [{ label: '工事番号', key: 'koban', placeholder: '例：26-0000（新規の時は記入しない）', maxlength: 12, span: 12 },
          { label: '見積番号', key: 'mitsuNo', placeholder: '000-00-00000-00', span: 12 }],
        '■ 基本情報',
        [it('01', '受注計上年月', 'keijoYm', { type: 'ym', span: 8 }), { label: '02. 契約先', key: 'keiyakuCd', placeholder: 'コード', span: 8, req: true }, { key: 'keiyakuName', placeholder: '名称', span: 8 }],
        [it('03', '物件略称(漢字)', 'nameKanji', { span: 24, maxlength: 30, placeholder: '30文字以内' })],
        [it('04', '物件略称(ｶﾀｶﾅ)', 'nameKana', { span: 24, maxlength: 30, placeholder: '03の入力から自動で入ります（変換が不完全な場合は修正してください）' })],
        [it('05', '工期', 'kFrom', { key2: 'kTo', type: 'daterange', span: 24 })],
        [it('06', '施工地区', 'chiku', { span: 16, placeholder: '都道府県・市区町村名の一部を入力 → 候補から選択' }),
          { text: '候補から選ぶと、07の先頭に名称が入ります', note: true, span: 8 }],
        [it('07', '工事場所(漢字)', 'place', { span: 24, maxlength: 30, placeholder: '30文字以内（06で候補を選ぶと先頭に名称が入ります。続きに番地などを入力）' })],
        [sel('08', '推定・確定識別', 'suitei', ['1：確定', '2：推定'], { span: 12 }), sel('09', '注文書類識別', 'chumon', ['1：注文書（契約書含む）', '2：承諾書'], { span: 12 })],
        '■ 金額',
        [it('10', '契約金額', 'keiyakuGaku', { type: 'money', unit: '円' }), it('11', '決定実行金額', 'kettei', { type: 'money', unit: '円', req: false })],
        [it('12', '最終見積金額', 'saishu', { type: 'money', unit: '円' }), it('13', '推定実行金額', 'suiteiGaku', { type: 'money', unit: '円' })],
        [{ label: '　　粗利率', key: 'arari', type: 'calc', unit: '％', dec: 1, calc: (n) => pct(n('keiyakuGaku'), n('suiteiGaku')), span: 12 },
          it('14', '消費税相当額', 'tax', { type: 'calc', unit: '円', labelField: { key: 'taxRate', type: 'number', default: '10', unit2: '％' },
            calc: (n) => Math.floor(n('keiyakuGaku') * n('taxRate') / 100) })],
        '■ 関係者',
        [...code('15', '施主', 'seshu')],
        [...code('16', '設計事務所', 'sekkei', { req: false })],
        [...code('17', '建築会社', 'kenchiku', { req: false })],
        '■ 識別区分',
        [sel('18', '受注識別', 'juchuS', ['1：本工事', '2：追加工事']), sel('19', '納品識別', 'nohin', ['0：通常', '1：納品']), sel('20', '官庁・民間', 'kanmin', C.kanmin)],
        [sel('21', '元請・下請', 'motouke', C.motouke), sel('22', '施主直接契約', 'choku', C.chokusetsu), sel('23', 'JV工事識別', 'jv', C.jv)],
        [sel('24', '計画外識別', 'keikakugai', ['0：通常', '1：計画外']), sel('25', '社内JV識別', 'shanaiJv', ['0：通常', '1：社内JV']), sel('26', '施工方式識別', 'hoshiki', ['0：通常', '1：D式'])],
        [sel('27', '工番採番識別', 'saiban', ['1：営業（通常工番）', '2：工事（通常工番）', '3：RE(7000～)', '4：サービス(8000～)'], { span: 16 }), sel('28', '設備工事識別', 'setsubi', C.setsubi)],
        '■ 建物情報',
        [it('29', '建物用途', 'youto', { type: 'select', options: C.youto }), { label: 'その他', key: 'youtoEtc', span: 12, placeholder: '「99：その他」の場合' }],
        [three('　　住戸戸数', 'ko', { unit: '戸' }), three('室数', 'shitsu', { unit: '室' }), three('病床数', 'byosho', { unit: '床' })],
        '■ 担当者・部署',
        [...code('30', '営業担当者', 'eigyo', { span: 4, name: '氏名' }), it('31', '受注担当部署', 'juchuBu', { type: 'select', options: busho, migrate: bushoOld })],
        [...code('32', '工事担当者', 'koji', { span: 4, name: '氏名' }), it('33', '施工担当部署', 'sekoBu', { type: 'select', options: busho, migrate: bushoOld })],
        [it('34', '支払条件', 'shiharai', { type: 'select', options: ['0：通常（出来高払）', '1：特殊'] }), { span: 12 }],
        [three('　　出来高締', 'dekidaka', { unit: '日' }), three('請求締', 'seikyu', { unit: '日' }), three('支払日', 'shiharaiBi', { unit: '日' })],
        [three('　　前渡金', 'maetoki', { unit: '％' }), three('中間払', 'chukan', { unit: '回' }), three('竣工後', 'shunko', { unit: '％' })],
        [three('　　現金', 'genkin', { unit: '％', req: true }),
          three('手形', 'tegata', { type: 'calc', unit: '％', calc: (n, v) => (v.genkin === '' || v.genkin == null ? null : 100 - n('genkin')), showZero: true }),
          { label: 'サイト', key: 'site', type: 'select', options: ['15', '30', '45', '60'], unit: '日', span: 8 }],
        '■ その他',
        [sel('35', '契約方式識別', 'keiyakuHoshiki', ['0：通常', '1：コストオン工事', '2：CM'], { span: 12 }), sel('36', '予算変更', 'yosan', ['1：有り', '2：無し'], { span: 12, req: false })],
        [it('37', '特記事項', 'tokki', { span: 24, maxlength: 30, placeholder: '30文字以内', req: false })],
        // 38. 小工事実行予算：見出し・各金額・合計とも4列（百万の位まで入る）。合計は行ごとに自動計算
        [{ label: '38. 小工事実行予算', span: 4 }, ...[...COLS.map((c) => c[0]), '合　計'].map((l) => ({ label: l, span: 4, lalign: 'center' }))],
        ...[['z', '　　積算金額'], ['j', '　　実行金額']].map(([r, l]) => [{ label: l, span: 4 },
          ...COLS.map((c) => ({ key: r + c[1], type: 'money', span: 4 })),
          { key: r + 'Kei', type: 'calc', span: 4, calc: (n) => COLS.reduce((t, c) => t + n(r + c[1]), 0) }]),
      ] },
      { type: 'notes', items: [
        '(注1) 得意先はコードと名称、担当者はコードと氏名を記入（「マスタ」を読み込むと候補から選べます）。色付きの欄は必須記入項目。',
        '(注2) 36. 予算変更は、注文区分 1：新規・5：取消の時は記入しない。38. 小工事実行予算は契約金額500万円以下の時に記入。',
        '(注3) 添付書類（見積書・注文書／承諾書、500万円超は実行予算書・工事経費計算書）は紙で添付すること。',
      ] },
    ],
  };
})();
