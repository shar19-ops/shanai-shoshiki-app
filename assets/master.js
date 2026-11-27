/*
 * 得意先・担当者マスタ（共通部品。工-04・営-06・営-08 で使う）
 *   BOX の app_data フォルダ（受注登録メモアプリと同じ customers.json / staff.json。各 [{ code, name }]）を読む。
 *   社員は BOX でビューアー（読み取り専用）。実データはリポジトリに入れない。データはどこにも送らない。
 *   選んだフォルダと読み込んだ内容は、このブラウザの IndexedDB（yformat-master）に覚える。保存場所はアプリ全体で1つなので、
 *   どれか1つの帳票で読み込めば、ほかの帳票でも選び直さずに候補が出る。
 *   フォルダを読める（権限が残っている）ときは、開くたびに読み直して最新にする。
 *
 * BOX のフォルダが移動・名前変更されたり、BOX Drive が止まっていたりすると、前に選んだ場所の確認（queryPermission・
 * requestPermission・ファイルの読み取り）が返ってこないことがある（作図予定表・能力要件表で起きた）。
 * → どの処理にも時間切れ（within）を付け、返らなければ打ち切って、前の場所は忘れ、フォルダの選び直しを案内する。
 *   打ち切っても、前に読み込んだ内容（IndexedDB）で候補は出続ける。（2026-11-27）
 *
 * 帳票の setup から：YMaster.bind(ctx, [['keiyaku', 'customers'], ['eigyo', 'staff'], ...], '説明の文')
 *   キー k に対して、入力欄 kCd（コード）と kName（名称）のどちらに入力しても候補が出て、選ぶと両方に入る。
 */
(function () {
  // ---------- 時間切れ ----------
  const T = { idb: 4000, query: 4000, request: 10000, read: 8000 };
  function within(p, ms, what) {
    let t;
    return Promise.race([
      Promise.resolve(p).finally(() => clearTimeout(t)),
      new Promise((_, rej) => { t = setTimeout(() => { const e = new Error(`${what}が ${ms / 1000} 秒たっても終わりませんでした`); e.name = 'TimeoutError'; rej(e); }, ms); }),
    ]);
  }

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
    const get = (k) => within(idb('readonly', (s) => s.get(k)), T.idb, 'ブラウザの保存領域の読み取り');
    const put = (k, v) => within(idb('readwrite', (s) => s.put(v, k)), T.idb, 'ブラウザの保存領域への保存');
    const del = (k) => within(idb('readwrite', (s) => s.delete(k)), T.idb, 'ブラウザの保存領域の削除');
    // 検索用：全角・半角、ひらがな・カタカナ、大文字・小文字、空白の違いを無視
    const norm = (t) => String(t ?? '').normalize('NFKC').toLowerCase()
      .replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60)).replace(/\s+/g, '');
    const index = (list) => (Array.isArray(list) ? list : [])
      .filter((x) => x && x.code != null && x.name != null)
      .map((x) => ({ code: String(x.code).trim(), name: String(x.name).trim(), c: norm(x.code), n: norm(x.name) }));
    // lost：前に選んだフォルダが使えなくなった（移動・名前変更・BOX が止まっている など）。選び直しを案内する
    const state = { customers: null, staff: null, at: '', dir: '', handle: null, lost: '', checking: false };
    const listeners = [];
    const emit = () => listeners.forEach((f) => { try { f(); } catch (e) { /* noop */ } });
    const FILES = { customers: 'customers.json', staff: 'staff.json' };
    const parse = (text, name) => {
      let d;
      try { d = JSON.parse(String(text).replace(/^﻿/, '')); } catch (e) { throw new Error(`${name} を読めませんでした（JSONの形式ではありません）`); }
      if (!Array.isArray(d) || !d.length) throw new Error(`${name} にデータがありません`);
      return d;
    };
    async function apply(c, s, dir) {
      const at = new Date().toISOString();
      state.customers = index(c); state.staff = index(s); state.at = at; state.dir = dir || ''; state.lost = '';
      try { await put('data', { customers: c, staff: s, at, dir: state.dir }); } catch (e) { /* 覚えられなくても今回は使える */ }
      emit();
    }
    async function readDir(hd) {
      const read = async (name) => parse(await (await (await hd.getFileHandle(name)).getFile()).text(), name);
      return within(Promise.all([read(FILES.customers), read(FILES.staff)]), T.read, 'BOX のファイルの読み取り');
    }
    // 前に選んだフォルダを忘れる（次はすぐ選び直し）
    async function forget(why) {
      state.handle = null; state.lost = why || '前に選んだフォルダを読めませんでした';
      try { await del('dir'); } catch (e) { /* noop */ }
      emit();
    }
    // 置き場所：BOX の 全社共有フォルダ\999_Y-Formatデータ\app_data（2026-11-27 ユーザー指定で移動）
    const NOT_FOUND = 'このフォルダに customers.json と staff.json が見つかりません。\nBOX の「全社共有フォルダ ＞ 999_Y-Formatデータ ＞ app_data」フォルダを選んでください。';
    const LOST = '前に選んだフォルダを確認できませんでした（BOX のフォルダが移動・名前変更されたか、BOX Drive が止まっている可能性があります）。';
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
          if (!f(FILES.customers) || !f(FILES.staff)) { alert('customers.json と staff.json の2つを選んでください（BOX の「全社共有フォルダ ＞ 999_Y-Formatデータ ＞ app_data」フォルダ）。'); resolve(false); return; }
          try { await apply(parse(await f(FILES.customers).text(), FILES.customers), parse(await f(FILES.staff).text(), FILES.staff), ''); resolve(true); }
          catch (e) { alert(String(e.message || e)); resolve(false); }
        });
        document.body.append(inp); inp.click();
      });
    }
    // 前に選んだフォルダから読み直す（権限が切れていれば、ここで確認が出る）。返らなければ打ち切って選び直しへ
    async function update() {
      const hd = state.handle;
      if (!hd) return pick();
      let perm;
      try { perm = await within(hd.requestPermission({ mode: 'read' }), T.request, 'フォルダの使用の確認'); }
      catch (e) { await forget(LOST); alert(LOST + '\n「フォルダを選ぶ」から BOX の「全社共有フォルダ ＞ 999_Y-Formatデータ ＞ app_data」フォルダを選び直してください。'); return false; }
      if (perm !== 'granted') return false;
      try { const cs = await readDir(hd); await apply(cs[0], cs[1], hd.name); return true; }
      catch (e) {
        if (e && (e.name === 'TimeoutError' || e.name === 'NotFoundError' || e.name === 'NotAllowedError')) {
          await forget(LOST);
          alert((e.name === 'NotFoundError' ? NOT_FOUND : LOST) + '\n「フォルダを選ぶ」から選び直してください。');
        } else alert(`読み込めませんでした：${e.message || e}`);
        return false;
      }
    }
    let inited = null;
    function init() {
      return inited || (inited = (async () => {
        state.checking = true; emit();
        try {
          const d = await get('data');
          if (d) { state.customers = index(d.customers); state.staff = index(d.staff); state.at = d.at || ''; state.dir = d.dir || ''; emit(); }
          const hd = await get('dir');
          if (hd) {
            state.handle = hd;
            try {
              if (await within(hd.queryPermission({ mode: 'read' }), T.query, 'フォルダの確認') === 'granted') {
                const cs = await readDir(hd);
                await apply(cs[0], cs[1], hd.name);
              }
            } catch (e) { console.warn('マスタ：前に選んだフォルダが使えません', e); await forget(LOST); }
          }
        } catch (e) { console.warn('マスタ：前回の内容を使います', e); }
        state.checking = false; emit();
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
    // kv・within は安全衛生目標（assets/goals.js）も使う（同じ保存領域・同じフォルダ。2026-11-27）
    return { state, init, pick, update, search, byCode, onChange: (f) => listeners.push(f), T, kv: { get, put }, within };
  })();

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

  // 「マスタ」ボタンの小さな画面：読み込みの状態と「最新に更新」「フォルダを選ぶ」
  let panel = null, panelNote = '';
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
    const pk = el('button', { type: 'button', class: s.lost || !ok ? 'primary' : null }, ok ? 'フォルダを選び直す' : 'フォルダを選ぶ');
    pk.addEventListener('click', busy(pk, Master.pick));
    panel.replaceChildren(...[ // null（出さない段）は除く（replaceChildren は null を文字の「null」にする）
      el('div', { class: 'mst-h' }, '得意先・担当者マスタ'),
      ok
        ? el('div', { class: 'mst-st' }, `得意先 ${s.customers.length.toLocaleString()}件・担当者 ${s.staff.length.toLocaleString()}件`, el('br'),
          `${fmtAt(s.at)} に${s.dir ? `「${s.dir}」から` : ''}読み込み`)
        : el('div', { class: 'mst-st warn' }, 'まだ読み込んでいません。', el('br'), 'BOX の「全社共有フォルダ ＞ 999_Y-Formatデータ ＞ app_data」フォルダを選んでください（BOX Drive が必要です）。'),
      s.checking ? el('div', { class: 'mst-st' }, '前に選んだフォルダを確認しています…') : null,
      s.lost ? el('div', { class: 'mst-st warn' }, s.lost, el('br'), '「フォルダを選び直す」から BOX の「全社共有フォルダ ＞ 999_Y-Formatデータ ＞ app_data」フォルダを選んでください。', ok ? el('br') : null, ok ? '（それまでは前に読み込んだ内容で候補が出ます）' : null) : null,
      el('div', { class: 'mst-btns' }, ok && s.handle && !s.lost ? upd : null, pk),
      el('div', { class: 'mst-note' },
        panelNote || '読み込むと、得意先・担当者の欄で、コードか名称の一部を入力すると候補が出ます（↑↓で選んで Enter）。',
        el('br'), '読み込んだマスタは、このパソコンのブラウザに保存されます（外部には送りません）。ほかの帳票でも同じマスタを使います。',
        el('br'), el('a', { href: 'torisetsu-master.html', target: '_blank' }, '読み込み方の説明（使い方）')), // 2026-11-27 説明書
    ].filter(Boolean));
  }

  // 帳票の setup から呼ぶ。fields：[[キー, 'customers' | 'staff'], ...]、note：パネルの説明（どの欄で候補が出るか）
  function bind({ inputs, setVal }, fields, note) {
    if (note) panelNote = note;
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
        btn.textContent = s.lost ? 'マスタ（要選び直し）' : ok ? 'マスタ ✓' : 'マスタ（未読込）';
        btn.classList.toggle('warn', !ok || !!s.lost);
        btn.title = s.lost ? s.lost : ok ? `得意先 ${s.customers.length.toLocaleString()}件・担当者 ${s.staff.length.toLocaleString()}件（${fmtAt(s.at)} 読込）` : '得意先・担当者マスタを BOX から読み込む';
      };
      Master.onChange(label);
      label();
    }
    fields.forEach(([key, kind]) => {
      const cd = inputs[key + 'Cd'], nm = inputs[key + 'Name'];
      if (!cd || !nm) return;
      const choose = (m) => {
        if (!m) return;
        cd.value = m.code; nm.value = m.name;
        setVal(key + 'Cd', m.code); setVal(key + 'Name', m.name);
        [cd, nm].forEach((x) => x.dispatchEvent(new Event('blur'))); // 入りきらないときは文字を小さく
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
        if (m && !nm.value) { nm.value = m.name; setVal(key + 'Name', m.name); nm.dispatchEvent(new Event('blur')); }
      });
    });
  }

  window.YMaster = { bind, Master };
})();
