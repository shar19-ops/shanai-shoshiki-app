/* 社内書式アプリ 共通レンダラー
 * forms/<id>.js が FORM_DEFS に定義を登録し、ここで統一レイアウトに描画する。
 * 入力値はブラウザ(localStorage)に自動保存。サーバーへの送信は一切しない。
 */
(function () {
  'use strict';

  const APP_VERSION = 'v2026.10.15';
  const STORE_PREFIX = 'shoshiki:';
  window.FORM_DEFS = window.FORM_DEFS || {};
  // 複数の帳票で使う選択肢（元Excelの入力規則から）
  window.LISTS = {
    offices: ['本店', '東関東支店', '横浜支店', '大阪支店', '名古屋支店', '仙台支店', '北関東支店'],
    // 事業所コード（般-15 の一覧より）
    officeCodes: [['010', '010 本店'], ['020', '020 東関東支店'], ['030', '030 横浜支店'], ['040', '040 大阪支店'], ['050', '050 名古屋支店'], ['060', '060 仙台支店'], ['090', '090 北関東支店']],
    depts: ['営業部', '工事部', 'RE部', '経理部', '見積部', '設計部', 'CAD部', '情報S部', '安全品質保証部', '購買部', '総務部'],
  };

  // ---------- 小物 ----------
  const h = (tag, attrs, ...kids) => {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  };
  const toNum = (s) => {
    if (s == null) return NaN;
    const t = String(s).replace(/[,，\s¥￥円]/g, '').replace(/[０-９．－]/g, (c) => '0123456789.-'['０１２３４５６７８９．－'.indexOf(c)]);
    return t === '' ? NaN : Number(t);
  };
  const fmtNum = (n, dec) => (isNaN(n) ? '' : n.toLocaleString('ja-JP', { maximumFractionDigits: dec == null ? 2 : dec }));
  const fmtDate = (iso, style) => {
    // 未入力なら手書き用の枠を残す
    if (!iso) return { ym: '　　　年　　月', md: '　　月　　日' }[style] || '　　　年　　月　　日';
    const [y, m, d] = iso.split('-').map(Number);
    if (style === 'ym') return `${y}年 ${m}月`;
    if (style === 'md') return `${m}月 ${d}日`;
    return `${y}年 ${m}月 ${d}日`;
  };

  // ---------- 状態 ----------
  let def, values = {}, storeKey, saveTimer;
  const inputs = {};   // key -> element(s)
  const calcs = [];    // 再計算関数

  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(storeKey, JSON.stringify(values));
        setSaved('下書き保存済み');
      } catch (e) { setSaved('保存できません'); }
    }, 300);
  }
  function setSaved(msg) {
    const el = document.querySelector('.saved');
    if (el) el.textContent = msg;
  }
  function setVal(key, v) {
    values[key] = v;
    // 同じ項目が複数ページにある場合（No. など）は表示を揃える
    document.querySelectorAll(`[data-key="${CSS.escape(key)}"]`).forEach((el) => {
      if (el !== document.activeElement && typeof v === 'string' && el.value !== v) el.value = v;
    });
    recalc();
    save();
  }
  function recalc() { calcs.forEach((f) => f()); }

  // ---------- 入力部品 ----------
  // f: {key, type, options, placeholder, unit, align, lines, ...}
  function field(f) {
    const key = f.key;
    const v = values[key] ?? f.default ?? '';
    if (values[key] == null && f.default != null) values[key] = f.default;
    const type = f.type || 'text';
    let el;

    if (type === 'static') return h('div', { class: 'cell-wrap' }, f.text || '');

    if (type === 'date' || type === 'ym' || type === 'time') {
      const show = (x) => (type === 'time' ? (x ? x.replace(/^0?(\d+):(\d+)$/, '$1時$2分') : '　時　分') : fmtDate(x, type === 'ym' ? 'ym' : f.style));
      const pv = h('span', { class: 'pv' }, show(v));
      el = h('input', {
        class: 'inp', type: type === 'ym' ? 'month' : type, value: v, step: type === 'time' ? 900 : null,
        oninput: (e) => { setVal(key, e.target.value); pv.textContent = show(e.target.value); },
      });
      inputs[key] = el;
      return h('div', { class: 'date-wrap' }, el, pv);
    }

    if (type === 'image') return imageField(f);

    // 期間（日付〜日付、kind: 'time' なら時刻〜時刻）を1つの欄に。間に縦罫線を入れない
    // dow: true なら日付の後ろに曜日（例：（木））を自動表示
    if (type === 'daterange') {
      const kind = f.kind || 'date';
      const part = (k) => {
        const parts = [field({ key: k, type: kind })];
        if (f.dow) {
          const w = h('span', { class: 'range-dow' });
          calcs.push(() => { const iso = values[k]; w.textContent = iso ? '（' + '日月火水木金土'[new Date(iso + 'T00:00').getDay()] + '）' : '（　）'; });
          parts.push(w);
        }
        return parts;
      };
      return h('div', { class: 'range-wrap' }, ...part(key), h('span', { class: 'range-sep' }, '〜'), ...part(f.key2));
    }

    if (type === 'checks' || type === 'radio') {
      const multi = type === 'checks';
      const cur = new Set(multi ? (Array.isArray(v) ? v : []) : [v]);
      const name = 'r_' + key;
      const wrap = h('div', { class: 'checks', style: f.vertical ? 'flex-direction:column;align-items:flex-start' : '' },
        f.options.map((o) => {
          const cb = h('input', {
            type: multi ? 'checkbox' : 'radio', name, value: o, checked: cur.has(o),
            onchange: () => {
              if (multi) setVal(key, [...wrap.querySelectorAll('input:checked')].map((x) => x.value));
              else setVal(key, cb.checked ? o : '');
            },
            onclick: (e) => { // ラジオも再クリックで解除できるように
              if (!multi && values[key] === o && cb.dataset.was === '1') { cb.checked = false; setVal(key, ''); }
              cb.dataset.was = cb.checked ? '1' : '0';
            },
          });
          cb.dataset.was = cur.has(o) ? '1' : '0';
          return h('label', null, cb, h('span', { class: 'box' }), o);
        }));
      inputs[key] = wrap;
      return wrap;
    }

    if (type === 'select') {
      // options は 'A' または ['値', '表示名']。codeOnly なら選んだ後は値（コード）だけを表示し、一覧を開いたときだけ表示名を出す
      const opts = f.options.map((o) => (Array.isArray(o) ? o : [o, o]));
      const labels = (full) => [...el.options].slice(1).forEach((op, i) => { op.textContent = full ? opts[i][1] : opts[i][0]; });
      el = h('select', {
        class: 'inp' + (f.align === 'center' ? ' center' : ''),
        onchange: (e) => { setVal(key, e.target.value); if (f.codeOnly) labels(false); },
        onmousedown: f.codeOnly ? () => labels(true) : null,
        onkeydown: f.codeOnly ? () => labels(true) : null,
        onblur: f.codeOnly ? () => labels(false) : null,
      }, h('option', { value: '' }, ''), opts.map(([ov, ol]) => h('option', { value: ov, selected: ov === v }, f.codeOnly ? ov : ol)));
      if (f.codeOnly) window.addEventListener('beforeprint', () => labels(false)); // 印刷は必ずコードだけ
    } else if (type === 'textarea') {
      const lines = f.lines || 4;
      el = h('textarea', {
        class: 'inp' + (f.plain ? ' plain' : ''), rows: lines,
        style: f.plain ? '' : `height:calc(${lines} * 7mm + 2mm)`,
        placeholder: f.placeholder || '',
        oninput: (e) => setVal(key, e.target.value),
      });
      el.value = v;
    } else if (type === 'calc') {
      el = h('input', { class: 'inp calc' + (f.align === 'left' ? '' : ' num'), readonly: true, tabindex: -1 });
      if (f.align === 'center') el.classList.add('center');
      calcs.push(() => {
        const n = f.calc(getNum, values);
        if (typeof n === 'string') el.value = n;
        else el.value = n == null || isNaN(n) || (n === 0 && !f.showZero) ? '' : fmtNum(n, f.dec ?? 0);
        values[key] = el.value;
      });
    } else {
      const isNum = type === 'number' || type === 'money';
      el = h('input', {
        class: 'inp' + (isNum ? ' num' : '') + (f.align === 'center' ? ' center' : ''),
        type: 'text', value: v, placeholder: f.placeholder || '',
        inputmode: isNum ? 'decimal' : (type === 'tel' || type === 'zip' ? 'tel' : null),
        maxlength: f.maxlength || null,
        list: f.suggest ? 'dl_' + key : null,
        oninput: (e) => setVal(key, e.target.value),
        onblur: isNum ? (e) => {
          const n = toNum(e.target.value);
          if (!isNaN(n)) { e.target.value = fmtNum(n, f.dec ?? (type === 'money' ? 0 : 2)); setVal(key, e.target.value); }
        } : null,
      });
    }
    inputs[key] = el;
    el.dataset.key = key;
    const parts = [el];
    if (f.suggest) parts.push(h('datalist', { id: 'dl_' + key }, f.suggest.map((o) => h('option', { value: o }))));
    if (f.prefix || f.unit) {
      return h('div', { class: 'cell-wrap' },
        f.prefix ? h('span', { class: 'unit' }, f.prefix) : null, ...parts,
        f.unit ? h('span', { class: 'unit' }, f.unit) : null);
    }
    return parts.length > 1 ? h('div', { style: 'height:100%' }, ...parts) : el;
  }
  const getNum = (key) => { const n = toNum(values[key]); return isNaN(n) ? 0 : n; };

  // 画像欄（案内図など）：ファイル選択 or 貼り付け。縮小してJPEGで保存する。
  function imageField(f) {
    const key = f.key;
    const img = h('img', { class: 'img-view', alt: '' });
    const hint = h('div', { class: 'img-hint no-print' },
      'クリックで画像を選択、または Ctrl+V で貼り付け（地図のスクリーンショット等）');
    const file = h('input', { type: 'file', accept: 'image/*', style: 'display:none', onchange: (e) => e.target.files[0] && load(e.target.files[0]) });
    const del = h('button', { class: 'img-del no-print', onclick: (e) => { e.stopPropagation(); setVal(key, ''); show(); } }, '画像を削除');
    const box = h('div', { class: 'img-field', tabindex: 0, onclick: () => file.click(),
      onpaste: (e) => {
        const it = [...(e.clipboardData?.items || [])].find((x) => x.type.startsWith('image/'));
        if (it) { e.preventDefault(); load(it.getAsFile()); }
      } }, img, hint, del, file);
    function show() {
      const v = values[key];
      img.src = v || ''; img.style.display = v ? '' : 'none';
      hint.style.display = v ? 'none' : ''; del.style.display = v ? '' : 'none';
    }
    function load(blob) {
      const url = URL.createObjectURL(blob);
      const im = new Image();
      im.onload = () => {
        const max = 1600, s = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        setVal(key, c.toDataURL('image/jpeg', 0.85)); show();
      };
      im.src = url;
    }
    show();
    return box;
  }

  // ---------- 本人欄のデート印 ----------
  // 苗字・役職・色の設定は全帳票共通で1つだけ持つ。押すのは def.selfStamp の欄だけ（承認欄などは手押し）。
  const STAMP_KEY = STORE_PREFIX + '_stamp';
  const TITLES = ['', '副長', '課長', '工事長', '支店長', '部長', '本部長', '取締役', '常務', '本店長'];
  // 伝票アプリと同じ：課長以下は黒、工事長以上は朱
  const TITLE_COLOR = { '': 'black', '副長': 'black', '課長': 'black' };
  const STAMP_DEFAULT = { enabled: true, sei: '', title: '', color: 'black', office: '' };
  let stampCfg = { ...STAMP_DEFAULT };
  try { stampCfg = { ...STAMP_DEFAULT, ...JSON.parse(localStorage.getItem(STAMP_KEY) || '{}') }; } catch (e) { /* 既定値のまま */ }

  function saveStampCfg() {
    try { localStorage.setItem(STAMP_KEY, JSON.stringify(stampCfg)); } catch (e) { /* noop */ }
    renderSelfStamps();
  }
  // 日付は帳票の作成日・発行日（def.stampDate、既定 'date'）。未入力なら今日。
  function stampDate() {
    const iso = values[def.stampDate || 'date'];
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) { const [y, m, d] = iso.split('-').map(Number); return { year: y, month: m, day: d }; }
    return new Date();
  }
  function stampSvg() {
    const c = stampCfg;
    if (!c.enabled || !c.sei) return '';
    // 役職なし：苗字を上下に分割／役職あり：上に苗字・下に役職／支店長：上に事業所名（「支店」を除く）
    const names = c.title === '支店長' ? { nameTop: (values.office || c.office || '').replace(/支店$/, ''), nameBottom: '支店長' }
      : c.title ? { nameTop: c.sei, nameBottom: c.title } : { name: c.sei };
    return DateStamp.svg({ ...names, date: stampDate(), color: c.color });
  }
  function renderSelfStamps() {
    const svg = stampSvg();
    document.querySelectorAll('.self-stamp').forEach((el) => {
      el.innerHTML = svg || (el.dataset.empty === '印' ? '<span class="stamp-mark">印</span>' : '<span class="self-hint no-print">クリックで<br>押印設定</span>');
    });
  }

  function openStampDialog() {
    const prev = h('div', { class: 'sd-prev' });
    const upd = () => { prev.innerHTML = stampSvg() || '<span class="sd-empty">苗字を入れると<br>表示されます</span>'; };
    const set = (k, v) => { stampCfg[k] = v; saveStampCfg(); upd(); };
    const colors = ['black', 'red'].map((c) => h('input', { type: 'radio', name: 'sd_color', value: c, checked: stampCfg.color === c, onchange: () => set('color', c) }));
    const officeRow = h('label', { style: stampCfg.title === '支店長' ? '' : 'display:none' }, '事業所',
      h('select', { onchange: (e) => set('office', e.target.value) },
        LISTS.offices.filter((o) => o !== '本店').map((o) => h('option', { value: o, selected: o === stampCfg.office }, o))));
    const dlg = h('dialog', { class: 'stamp-dialog' }, h('form', { method: 'dialog' },
      h('h3', null, '押印設定（本人欄のデート印）'),
      h('p', { class: 'sd-note' }, '全帳票共通の設定です（このPCのブラウザにだけ保存）。日付は帳票の作成日・発行日、未入力なら今日の日付になります。承認・確認欄には押されません。'),
      h('div', { class: 'sd-body' },
        h('div', { class: 'sd-fields' },
          h('label', null, h('input', { type: 'checkbox', checked: stampCfg.enabled, onchange: (e) => set('enabled', e.target.checked) }), 'デート印を表示する'),
          h('label', null, '苗字', h('input', { type: 'text', value: stampCfg.sei, maxlength: 4, placeholder: '例：佐藤', oninput: (e) => set('sei', e.target.value.trim()) })),
          h('label', null, '役職', h('select', { onchange: (e) => {
            const t = e.target.value;
            stampCfg.color = TITLE_COLOR[t] || 'red';
            colors.forEach((r) => { r.checked = r.value === stampCfg.color; });
            if (t === '支店長' && !stampCfg.office) stampCfg.office = LISTS.offices[1];
            officeRow.style.display = t === '支店長' ? '' : 'none';
            set('title', t);
          } }, TITLES.map((t) => h('option', { value: t, selected: t === stampCfg.title }, t || '（なし）')))),
          officeRow,
          h('div', { class: 'sd-colors' }, '色', h('label', null, colors[0], '黒'), h('label', null, colors[1], '朱（赤）'))),
        prev),
      h('div', { class: 'sd-btns' }, h('button', { value: 'close', class: 'primary' }, '閉じる'))));
    dlg.addEventListener('close', () => dlg.remove());
    document.body.append(dlg);
    dlg.showModal();
    upd();
  }

  // ---------- ヘッダー ----------
  function stampsEl(groups, cls) {
    if (!groups || !groups.length) return null;
    // 文字列配列だけなら1グループ扱い
    if (typeof groups[0] === 'string') groups = [{ boxes: groups }];
    // 枠の大きさは全帳票共通。'承認\n工事本部長\nRE部長' のように2行目以降があれば、
    // 1行目を見出し、残り（兼務の役職名）を押印部に薄く印字する。
    return h('div', { class: 'stamps' + (cls ? ' ' + cls : '') },
      groups.map((g) => h('div', { class: 'stamp-group' },
        g.label ? h('div', { class: 'sg-label' }, g.label) : null,
        g.boxes.map((b) => {
          const [head, ...roles] = String(b).split('\n');
          const self = def && def.selfStamp === head;
          return h('div', { class: 'stamp-box' },
            h('div', { class: 'sb-label' + (head.length >= 6 ? ' tight' : '') }, head),
            h('div', self ? { class: 'sb-area self-stamp', title: 'クリックで押印設定', onclick: openStampDialog } : { class: 'sb-area' },
              roles.length ? h('div', { class: 'sb-roles' }, roles.flatMap((r, i) => (i ? [h('br'), r] : [r]))) : null));
        }))));
  }

  // タイトルが押印欄とぶつかるときは、1行に収まるまで文字を縮める
  function fitTitles() {
    // 押印欄が2段に折り返したときは、いちばん広い段の幅まで縮めてタイトル側に場所を譲る
    document.querySelectorAll('.f-header .stamps').forEach((st) => {
      st.style.width = '';
      const rows = {};
      st.querySelectorAll(':scope > .stamp-group').forEach((g) => {
        const r = g.getBoundingClientRect(), k = Math.round(r.top);
        rows[k] = rows[k] || { l: r.left, r: r.right };
        rows[k].l = Math.min(rows[k].l, r.left); rows[k].r = Math.max(rows[k].r, r.right);
      });
      const widths = Object.values(rows).map((x) => x.r - x.l);
      if (widths.length > 1) st.style.width = Math.ceil(Math.max(...widths)) + 'px';
    });
    document.querySelectorAll('.f-title').forEach((el) => {
      const box = el.parentElement;
      let pt = 20;
      el.style.fontSize = ''; el.style.letterSpacing = '';
      while (el.scrollWidth > box.clientWidth && pt > 11) {
        pt -= 0.5;
        el.style.fontSize = pt + 'pt';
        el.style.letterSpacing = pt < 16 ? '.04em' : '.15em';
      }
    });
  }

  function headerEl(d) {
    return h('div', { class: 'f-header' },
      h('div', { class: 'f-head-left' },
        h('div', { class: 'f-code' }, d.code),
        h('div', { class: 'f-title' }, d.title, d.subtitle ? h('span', { class: 'f-sub' }, d.subtitle) : null),
        d.meta ? h('div', { class: 'f-meta' }, d.meta.map((m) => h('div', { class: 'm-item' },
          h('span', { class: 'm-label' }, m.label),
          h('span', { class: 'm-val', style: m.w ? `min-width:${m.w}mm` : '' }, field(m))))) : null,
        // headBlocks：タイトルの下（押印欄の左側の空き）に置く項目。下端を押印欄の下端にそろえる
        d.headBlocks ? h('div', { class: 'head-blocks' }, d.headBlocks.map(renderBlock)) : null),
      stampsEl(d.stamps, d.stampClass));
  }

  // ---------- ブロック ----------
  // grid: 24分割の表。rows: [[item, item...], ...]
  //   item: {label, key, type, span(列数・ラベル込み), lw(ラベル列数), rs(行結合), h(高さmm), text}
  function gridBlock(b) {
    const cols = b.cols || 24;
    const tbl = h('table', { class: 'grid' + (b.dense ? ' dense' : '') },
      h('colgroup', null, Array.from({ length: cols }, () => h('col'))));
    const tb = h('tbody');
    b.rows.forEach((row) => {
      // 見出し行：'■ 物件情報' のような文字列だけの行
      if (typeof row === 'string') { tb.append(h('tr', null, h('td', { class: 'lbl sec', colspan: cols }, row))); return; }
      const tr = h('tr', { class: row.thin ? 'thin' : null });
      const items = Array.isArray(row) ? row : row.items;
      items.forEach((it) => {
        const rs = it.rs || null;
        // 行の高さ：項目ごとの h、なければ表全体の rowH（行間をそろえたいとき）
        const style = it.h ? `height:${it.h}mm` : b.rowH ? `height:${b.rowH}mm` : '';
        if (it.label != null && it.label !== false) {
          // key も text も無い項目はラベル単独（span 全体がラベル）
          const labelOnly = !it.key && it.text == null;
          const lw = labelOnly ? (it.span || cols) : (it.lw ?? b.lw ?? 4);
          tr.append(h('td', { class: 'lbl' + ((it.lalign || b.lalign) === 'left' ? ' left' : '') + (it.req ? ' req' : ''), colspan: lw, rowspan: rs, style }, ...String(it.label).split('\n').flatMap((s, i) => i ? [h('br'), s] : [s])));
          const rest = (it.span || cols) - lw;
          if (rest > 0) tr.append(valueCell(it, rest, rs, style));
        } else {
          tr.append(valueCell(it, it.span || cols, rs, style));
        }
      });
      tb.append(tr);
    });
    tbl.append(tb);
    return wrapTitle(b, tbl);
  }
  function valueCell(it, span, rs, style) {
    if (it.stampCell) {
      return h('td', { class: 'stamp-cell', colspan: span, rowspan: rs, style },
        h('div', { class: 'self-stamp', 'data-empty': '印', title: 'クリックで押印設定', onclick: openStampDialog }));
    }
    if (it.text != null && !it.key) return h('td', { class: it.note ? 'note' : 'txt', colspan: span, rowspan: rs, style: style + (it.align ? `;text-align:${it.align}` : '') }, it.text);
    if (!it.key) return h('td', { colspan: span, rowspan: rs, style });
    return h('td', { colspan: span, rowspan: rs, style }, field(it));
  }

  // table: 明細表。columns: [{label, key, w, type, calc, align}], rows: 行数
  //   foot: [{label, span, key(合計対象の列key) | text}]
  function tableBlock(b) {
    const cols = b.columns;
    const tbl = h('table', { class: 'grid' },
      h('colgroup', null, cols.map((c) => h('col', { style: c.w ? `width:${c.w}%` : '' }))));
    const lbl = (s) => String(s).split('\n').flatMap((x, i) => (i ? [h('br'), x] : [x]));
    const hh = 'height:' + (b.headH || 8) + 'mm';
    if (cols.some((c) => c.group)) {
      // 2段見出し：group が同じ連続列をまとめる
      const r1 = h('tr'), r2 = h('tr');
      for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        if (!c.group) { r1.append(h('th', { rowspan: 2, style: hh }, ...lbl(c.label))); continue; }
        let n = 1;
        while (cols[i + n] && cols[i + n].group === c.group) n++;
        r1.append(h('th', { colspan: n, style: 'height:6mm' }, c.group));
        for (let k = 0; k < n; k++) r2.append(h('th', { style: 'height:6mm' }, ...lbl(cols[i + k].label)));
        i += n - 1;
      }
      tbl.append(h('thead', null, r1, r2));
    } else {
      tbl.append(h('thead', null, h('tr', null, cols.map((c) => h('th', { style: hh }, ...lbl(c.label))))));
    }
    const tb = h('tbody');
    for (let r = 1; r <= b.rows; r++) {
      tb.append(h('tr', null, cols.map((c) => {
        const key = `${b.key}.${r}.${c.key}`;
        if (c.rowNo) return h('td', { class: 'txt', style: 'text-align:center' + (b.rowH ? `;height:${b.rowH}mm` : '') }, String(r + (b.rowNoStart || 1) - 1));
        // head(r) が文字列なら固定表示、null なら入力欄（予備行など）
        const headText = c.head ? c.head(r) : null;
        if (headText != null) return h('td', { class: 'txt', style: `text-align:${c.align || 'center'}` + (b.rowH ? `;height:${b.rowH}mm` : '') }, headText);
        const f = { ...c, key };
        if (c.calc) f.calc = (n) => c.calc((k) => n(`${b.key}.${r}.${k}`));
        if (c.rowCalc) { f.type = 'calc'; f.calc = (n, v) => c.rowCalc(r, v); }
        return h('td', { style: b.rowH ? `height:${b.rowH}mm` : '' }, field(f));
      })));
    }
    tbl.append(tb);
    if (b.foot) {
      const tf = h('tfoot');
      b.foot.forEach((row) => {
        tf.append(h('tr', null, row.map((c) => {
          if (c.sum) {
            const key = `${b.key}.sum.${c.sum}`;
            const f = { key, type: 'calc', calc: (n) => { let s = 0; for (let r = 1; r <= b.rows; r++) s += n(`${b.key}.${r}.${c.sum}`); return s; } };
            return h('td', { colspan: c.span || 1 }, field(f));
          }
          if (c.key) return h('td', { colspan: c.span || 1 }, field(c));
          return h('td', { class: c.lbl === false ? 'txt' : 'lbl', colspan: c.span || 1 }, c.label || '');
        })));
      });
      tbl.append(tf);
    }
    return wrapTitle(b, tbl);
  }

  function freeBlock(b) {
    return wrapTitle(b, h('div', { class: 'free', style: b.grow ? 'flex:1' : '' },
      b.label ? h('div', { class: 'free-label' }, b.label) : null,
      field({ key: b.key, type: 'textarea', lines: b.lines || 6, placeholder: b.placeholder })));
  }

  function wrapTitle(b, el) {
    if (!b.title) return b.grow ? h('div', { style: 'flex:1;display:flex;flex-direction:column' }, el) : el;
    return h('div', { style: b.grow ? 'flex:1;display:flex;flex-direction:column' : '' }, h('div', { class: 'blk-title' }, b.title), el);
  }

  const BLOCKS = {
    grid: gridBlock,
    table: tableBlock,
    free: freeBlock,
    image: (b) => h('div', { class: 'free', style: b.grow ? 'flex:1' : `height:${b.h || 80}mm` },
      b.label ? h('div', { class: 'free-label' }, b.label) : null, imageField({ key: b.key })),
    para: (b) => h('p', { class: 'para', style: b.style || '' }, b.text),
    notes: (b) => h('ul', { class: 'notes' }, b.items.map((t) => h('li', null, t))),
    addressee: (b) => h('div', { class: 'addressee', style: b.style || '' }, b.lines.map((l) => h('div', null, l))),
    spacer: () => h('div', { class: 'spacer' }),
    stamps: (b) => h('div', { class: 'inline-stamps', style: b.align === 'right' ? 'justify-content:flex-end' : '' },
      h('div', null, b.title ? h('div', { class: 'is-title' }, b.title) : null, stampsEl(b.groups))),
    row: (b) => h('div', { style: `display:flex;gap:${b.gap ?? 4}mm;align-items:${b.align || 'stretch'}` },
      b.items.map((x) => h('div', { style: x.w ? `width:${x.w}%;flex-shrink:0` : 'flex:1' }, renderBlock(x)))),
    custom: (b) => b.render({ h, field, values, setVal }),
  };
  function renderBlock(b) {
    const fn = BLOCKS[b.type];
    if (!fn) throw new Error('unknown block ' + b.type);
    return fn(b);
  }

  // ---------- 用紙 ----------
  function sheetEl(d, page) {
    const paper = page.paper || d.paper || 'A4';
    const orient = page.orientation || d.orientation || 'portrait';
    const pd = { ...d, ...page };
    let blocks = page.blocks, bottom = null;
    // 登録済検印など下部に置く押印欄（最後のページのみ）。
    // 末尾が注意書き（後ろは余白だけ）なら、その横に並べて縦の段を増やさない。
    if (pd.bottomStamps && page === (d.pages || [page]).slice(-1)[0]) {
      let i = blocks.length - 1;
      while (i >= 0 && blocks[i].type === 'spacer') i--;
      const notes = i >= 0 && blocks[i].type === 'notes' ? blocks[i] : null;
      if (notes) blocks = [...blocks.slice(0, i), ...blocks.slice(i + 1)];
      bottom = h('div', { class: 'bottom-stamps' }, notes ? renderBlock(notes) : null, stampsEl(pd.bottomStamps));
    }
    return h('div', { class: `sheet ${paper} ${orient}` },
      headerEl(pd),
      h('div', { class: 'sheet-body' }, blocks.map(renderBlock)),
      bottom,
      h('div', { class: 'f-footer' },
        h('div', { class: 'brand' },
          h('img', { class: 'mark', src: 'assets/logo-mark.jpg', alt: '' }),
          // ロゴタイプはホームページと同じローマ字表記（書体は近いもの：Montserrat ExtraBold）
          h('span', { class: 'word', title: '株式会社 雄電社' }, 'YUDENSHA')),
        h('div', { class: 'f-ver' }, `${pd.code}　${pd.title}`)));
  }

  // ---------- 起動 ----------
  function boot() {
    const id = new URLSearchParams(location.search).get('id');
    def = window.FORM_DEFS[id];
    const root = document.getElementById('app');
    if (!def) { root.textContent = '帳票が見つかりません: ' + id; return; }
    document.title = `${def.code} ${def.title}`;
    storeKey = STORE_PREFIX + id;
    try { values = JSON.parse(localStorage.getItem(storeKey) || '{}') || {}; } catch (e) { values = {}; }

    const paper = def.paper || 'A4', orient = def.orientation || 'portrait';
    const st = document.createElement('style');
    st.textContent = `@page { size: ${paper} ${orient}; margin: 0; }`;
    document.head.append(st);

    root.append(h('div', { class: 'toolbar' },
      h('div', { class: 'tb-title' }, h('a', { href: './' }, '一覧 ＞ '), `${def.code}　${def.title}`),
      h('span', { class: 'saved' }),
      h('button', { onclick: () => {
        if (!confirm('入力内容をすべて消去します。よろしいですか？')) return;
        try { localStorage.removeItem(storeKey); } catch (e) { /* noop */ }
        location.reload();
      } }, 'クリア'),
      def.selfStamp ? h('button', { onclick: openStampDialog }, '押印設定') : null,
      h('button', { class: 'primary', onclick: () => window.print() }, '印刷')));
    const pages = def.pages || [{ blocks: def.blocks }];
    pages.forEach((p) => root.append(sheetEl(def, p)));
    if (def.selfStamp) calcs.push(renderSelfStamps); // 日付の入力に追従
    recalc();
    fitTitles();
    if (document.fonts) document.fonts.ready.then(fitTitles);
  }

  window.ShoshikiApp = { boot, version: APP_VERSION, toNum, fmtNum };
})();
