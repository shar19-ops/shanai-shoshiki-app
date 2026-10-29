// 本-品質-A0055 工事反省会議事録（品質記録様式。元Excel：本ー品質ーＡ0055工事反省会議事録.xlsx、A4縦3ページ）
// 本-品質-A0053 施工検討会報告書に寄せる（ユーザー指定）
//   1ページ目：回送先の押印欄はヘッダーの右上に4つずつ4段（工事長はデート印、ほかはクリックで斜線＝回送不要）、その横にヘッダーの情報と出席者。
//             問題点・指示事項の表（原価問題点 A〜O区分・発注者／注文者からの評価・着工前／中間／竣工時・労務・工事担当者の評価・改善点・コメント）
//   2ページ目以降：検討項目（1〜7）と、No・問題点・原因及び再発防止策の表。長文は折り返して行の高さを伸ばし、あふれた行は次のページへ。
//             最後の行に書いたら、または入りきらなくなったらページを自動で足す。ページの追加・削除のボタンもある（ページ数は議事で増減＝チェック表のご指示）
// ISOの要求事項【9.1.3】【10.3】【10.2】はヘッダーの番号の後ろ
// 本-品質-A0054 工事反省会開催通知書の基本情報を取り込める（チェック表のご指示。このPCの入力中データ、または保存ファイルから）
(function () {
  const IMPORT = ['koban', 'subject', 'jigyo', 'busho', 'shocho', 'kaisaibi', 'tFrom', 'tTo', 'basho', 'hatchu', 'keiyaku', 'sekkeiJimusho', 'kenchiku'];
  // 問題点の表の行数（どの行も1行分の高さのとき）。2ページ目（検討項目の下）・3ページ目以降。最後のページは注記（TAIL 行分）がその分減る
  const SECOND = 30, NEXT = 38, TAIL = 3;
  const pageCount = (v) => Math.max(2, Number(v.pageCount) || 2); // 1ページ目＋問題点の表のページ（最低1枚）
  let counts = {}; // 問題点の表のページ（2ページ目から）ごとの行数
  const cap = (p, pages) => (p === 2 ? SECOND : NEXT) - (p === pages ? TAIL : 0);
  const rowsOf = (p, pages) => {
    let from = 1;
    for (let q = 2; q < p; q++) from += counts[q] ?? cap(q, pages);
    return [from, from + (counts[p] ?? cap(p, pages)) - 1];
  };
  const hasData = (values, n) => ['mondai', 'taisaku'].some((k) => String(values[`p${n}.${k}`] ?? '') !== '');
  // 行の高さを測ってページごとの行数を決め直す（本-品質-A0053 と同じ）。edited：入力して欄を離れたとき
  const relayout = (values, setVal, rebuild, edited) => {
    const trs = [...document.querySelectorAll('table.h55l tr[data-n]')];
    if (!trs.length) return;
    const hs = {};
    trs.forEach((tr) => { hs[tr.dataset.n] = tr.getBoundingClientRect().height; });
    const base = Math.min(...Object.values(hs));
    const pages = pageCount(values);
    const next = {};
    let n = 1;
    for (let p = 2; p <= pages; p++) {
      const budget = cap(p, pages) * base + 1;
      let used = 0, k = 0;
      while (k === 0 || used + (hs[n] ?? base) <= budget) { used += hs[n] ?? base; n++; k++; }
      next[p] = k;
    }
    const last = n - 1;
    const maxData = Math.max(0, ...Object.keys(values).map((key) => Number((/^p(\d+)\./.exec(key) || [])[1] || 0)).filter((x) => x && hasData(values, x)));
    const addPage = maxData > last || (edited && maxData > 0 && maxData === last);
    const same = Object.keys(next).length === Object.keys(counts).length && Object.keys(next).every((p) => counts[p] === next[p]);
    if (same && !addPage) return;
    counts = next;
    const act = document.activeElement, tr = act && act.closest && act.closest('table.h55l tr[data-n]');
    const pos = tr ? { n: tr.dataset.n, col: [...tr.children].indexOf(act.closest('td')) } : null;
    if (addPage) { setVal('pageCount', String(pages + 1)); counts = {}; }
    rebuild();
    if (pos) {
      const td = document.querySelector(`table.h55l tr[data-n="${pos.n}"]`)?.children[pos.col];
      const el = td && td.querySelector('textarea, input');
      if (el) el.focus();
    }
  };
  // 長い文は欄の中で折り返し、文字の大きさはそのままで行の高さを伸ばす
  const wrapper = (field) => (key) => {
    const ta = field({ key, type: 'textarea', plain: true, lines: 1 });
    ta.classList.add('h53-wrap');
    const grow = () => { ta.style.height = '0'; ta.style.height = ta.scrollHeight + 'px'; };
    ta.addEventListener('input', grow);
    requestAnimationFrame(grow);
    return ta;
  };

  // A0054 から取り込む（印刷しない）。本-品質-A0053 の取り込みと同じ
  const importer = { type: 'custom', render: ({ h, values, setVal, rebuild }) => {
    const apply = (v) => {
      const got = IMPORT.filter((k) => v[k]);
      if (!got.length) { alert('工事反省会開催通知書（本-品質-A0054）に、取り込める内容がありません。'); return; }
      if (IMPORT.some((k) => values[k] && v[k] && values[k] !== v[k]) && !confirm('入力済みの項目を、工事反省会開催通知書の内容で置き換えます。よろしいですか？')) return;
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
        if (!data || data.form !== 'hin-a0054' || typeof data.values !== 'object') { alert('工事反省会開催通知書（本-品質-A0054）のファイルではありません。'); return; }
        apply(data.values);
      });
      document.body.append(inp);
      inp.click();
    };
    const run = () => {
      let local = null;
      try { local = JSON.parse(localStorage.getItem('shoshiki:hin-a0054') || 'null'); } catch (e) { /* なし */ }
      if (local && IMPORT.some((k) => local[k]) && confirm(`このPCに入力中の工事反省会開催通知書から取り込みますか？\n（工番：${local.koban || '－'}　件名：${local.subject || '－'}）\n\n「キャンセル」で保存ファイルを選びます。`)) { apply(local); return; }
      fromFile();
    };
    return h('div', { class: 'k1-pages no-print', style: 'margin:0' },
      h('button', { type: 'button', onclick: run }, '工事反省会開催通知書（A0054）から取り込む'),
      h('span', { class: 'k1-hint' }, '工番・件名・事業所・部署・作業所長・開催日時・開催場所・発注者などを取り込みます。'));
  } };

  // 1ページ目：問題点・指示事項
  const PROB = [
    ['原価問題点', ['Ａ区分', 'Ｂ区分', 'Ｃ区分', 'Ｏ区分']],
    ['発注者からの評価、問題点（施主）'], ['注文者からの評価、問題点（元請）'],
    ['着工前問題点'], ['工事中間問題点'], ['竣工時問題点'], ['労務問題点'], ['工事担当者の評価'],
    ['改善点', ['工事担当者への指示', '工事部/他部署への指示']],
    ['工事担当者コメント'],
  ];
  const probTable = { type: 'custom', render: ({ h, field }) => {
    const wrap = wrapper(field);
    const tb = h('tbody', null, h('tr', null, h('th', { colspan: 2 }, '問　　題　　点'), h('th', null, '指　　示　　事　　項')));
    let i = 0;
    PROB.forEach(([cat, subs]) => {
      if (!subs) { i++; tb.append(h('tr', null, h('th', { colspan: 2, class: 'h55-cat' }, cat), h('td', null, wrap(`q${i}`)))); return; }
      subs.forEach((s, j) => {
        i++;
        tb.append(h('tr', null, j === 0 ? h('th', { rowspan: subs.length, class: 'h55-cat' }, cat) : null, h('th', { class: 'h55-sub' }, s), h('td', null, wrap(`q${i}`))));
      });
    });
    return h('table', { class: 'grid h55p' }, h('colgroup', null, ...[20, 38, null].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
  } };

  // 2ページ目の検討項目（決まった文言）
  const KENTO = [
    ['1 組織について', '(1)施工体制についてのクレームはなかったか'],
    ['2 品質について', '(1)重大な不適合はなかったか　(2)顧客からのクレームはなかったか'],
    ['3 コストについて', '(1)大幅な予算オーバーはなかったか　(2)追加･変更の請求･入金はできたか　(3)支払いは完了しているか'],
    ['4 工程について', '(1)大幅な工期遅延はなかったか　(2)顧客からのクレームはなかったか'],
    ['5 安全について', '(1)事故は発生しなかったか　(2)顧客からのクレームはなかったか'],
    ['6 環境について', '(1)建設副産物の発生抑制はできたか　(2)廃棄物処理は適正に行われたか　(3)顧客からのクレームはなかったか'],
    ['7 その他について', ''],
  ];
  const kento = { type: 'custom', render: ({ h }) => h('table', { class: 'grid h55k' },
    h('colgroup', null, h('col', { style: 'width:30mm' }), h('col')),
    h('tbody', null, h('tr', null, h('th', { colspan: 2 }, '検　討　項　目')), ...KENTO.map(([a, b]) => h('tr', null, h('td', { class: 'h55-k1' }, a), h('td', { class: 'h55-k2' }, b))))) };

  // 問題点・原因及び再発防止策の表（page ページ目、2ページ目から）。最後のページは注記
  const list = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const pages = pageCount(values);
    const [from, to] = rowsOf(page, pages);
    const tail = page === pages;
    const wrap = wrapper(field);
    const tb = h('tbody', null, h('tr', null, h('th', null, 'No'), h('th', null, '問　　題　　点'), h('th', null, '原　因　及　び　再　発　防　止　策')));
    for (let n = from; n <= to; n++) {
      tb.append(h('tr', { 'data-n': n }, h('td', { class: 'h53-no' }, String(n)), h('td', null, wrap(`p${n}.mondai`)), h('td', null, wrap(`p${n}.taisaku`))));
    }
    if (tail) {
      tb.append(h('tr', null, h('td'),
        h('td', { class: 'h55-note' }, '↑組織、品質、原価、工期、安全、環境等について、施工中に発生した問題点を記載する。'),
        h('td', { class: 'h55-note' }, '↑問題点が発生した原因を分析し、再発防止策の概要を記載する。再発防止策は、関係者のみに展開するもの、全社的に展開するものに分類する。問題発生部署の長は別紙文書（手順書、標準書、基準書等）を作成し、教育･訓練、周知を行う。')));
    }
    const onchange = () => setTimeout(() => relayout(values, setVal, rebuild, true));
    const table = h('table', { class: 'grid h53 h55l', onchange }, h('colgroup', null, ...[9, 66, null].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
    if (!tail) return table;
    requestAnimationFrame(() => requestAnimationFrame(() => relayout(values, setVal, rebuild)));
    const lastHasData = () => { for (let n = from; n <= to; n++) if (hasData(values, n)) return true; return false; };
    return h('div', null, table, h('div', { class: 'k1-pages no-print' },
      h('button', { type: 'button', onclick: () => { counts = {}; setVal('pageCount', String(pages + 1)); rebuild(); } }, '＋ ページを追加'),
      pages > 2 ? h('button', { type: 'button', onclick: () => {
        if (lastHasData() && !confirm(`${pages}ページ目には入力があります。消してページを減らしますか？`)) return;
        Object.keys(values).filter((key) => { const m = /^p(\d+)\./.exec(key); return m && Number(m[1]) >= from; }).forEach((key) => delete values[key]);
        counts = {}; setVal('pageCount', String(pages - 1)); rebuild();
      } }, '最後のページを削除') : null,
      h('span', { class: 'k1-hint' }, '問題点が多いときは、最後の行に書くと次のページが自動で増えます。')));
  } });

  FORM_DEFS['hin-a0055'] = {
    code: '本-品質-A0055', title: '工事反省会議事録',
    iso: '【9.1.3】分析及び評価　【10.3】継続的改善　【10.2】不適合及び是正処置', // 元の様式の右上の表示。ヘッダーの番号の後ろに（ユーザー指定）
    seitei: '03/04/01', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    fileIO: true, // 回送して押印してもらうのでファイルに保存
    fileKeys: ['koban', 'subject'], // ファイル名は「本-品質-A0055_工番_件名_日付.json」
    sheetClass: 'h53',
    selfStamp: '工事長|工事部長', // 発行の工事長／工事部長はクリックでデート印（A0053 と同じ）
    stampSlash: true, // それ以外の押印欄はクリックで斜線（回送不要の部署）
    meta: [],
    stampClass: 'stack h53s', // 押印欄は4つずつ4段（A0053 と同じ）
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => (i ? { subtitle: `（${i + 1}/${pageCount(v)}）`, stamps: [], blocks: i === 1 ? [kento, list(2)] : [list(i + 1)] } : {
      subtitle: `（1/${pageCount(v)}）`,
      stamps: [
        { boxes: ['社　長', '本店長', '工事本部長|RE部長', '工事管理課長'], dates: true },
        { boxes: ['営業部', '設計見積部', '設計部', '購買部'], dates: true },
        { boxes: ['品質技術部', '安全品質部', '安全部', '検査安全部'], dates: true },
        { boxes: ['ＩＳＯ部', '安全品質|保証部長\n保　管', '支店長', '工事長|工事部長\n発　行'], dates: true },
      ],
      // ヘッダーの情報は押印欄の横（A0053 と同じ並び＋開催時間）
      headBlocks: [
        { type: 'grid', cols: 4, colWidths: ['17mm', null, '17mm', null], rowH: 5.6, rows: [
          [{ label: '開催日', key: 'kaisaibi', type: 'date', jp: true, lw: 1, span: 2 }, { label: '開催場所', key: 'basho', lw: 1, span: 2 }],
          [{ label: '開催時間', key: 'tFrom', key2: 'tTo', type: 'daterange', kind: 'time', lw: 1, span: 4 }],
          [{ label: '事業所', key: 'jigyo', lw: 1, span: 4 }],
          [{ label: '工　番', key: 'koban', maxlength: 12, lw: 1, span: 4 }],
          [{ label: '件　名', key: 'subject', lw: 1, span: 4 }],
          [{ label: '部　署', key: 'busho', lw: 1, span: 2 }, { label: '作業所長', key: 'shocho', lw: 1, span: 2 }],
          [{ label: '出席者', key: 'shusseki', type: 'textarea', lines: 4, lw: 1, span: 4 }],
        ] },
      ],
      blocks: [
        importer,
        { type: 'col', fit: true, gap: 0, items: [
          { type: 'grid', rowH: 6.4, rows: [
            [{ label: '発 注 者\n（施　主）', key: 'hatchu', lw: 3, span: 12 }, { label: '契 約 先\n（元　請）', key: 'keiyaku', lw: 3, span: 12 }],
            [{ label: '設計事務所\n設計監理者', key: 'sekkeiJimusho', lw: 3, span: 12 }, { label: '建築会社', key: 'kenchiku', lw: 3, span: 12 }],
          ] },
          probTable,
        ] },
        { type: 'notes', items: ['1.　不要回送先は、斜線（／）で抹消する。', '2.　原価計算書、品質・安全・環境目標（工事長等による評価済の物）を添付する事。'] },
      ] })),
  };
})();
