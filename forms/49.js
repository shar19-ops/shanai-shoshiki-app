// 工-13 工事実行金額計算書（実行予算書。A3縦。元Excel：★一般社内書類(2026.06.11)\工事実行金額計算書.xlsx（Ver.12、2018年1月23日改訂）。
//   以前は 般-49（対象外）だったが、2026-11-18 ユーザー指定で 工-13 として帳票化。工-04 受注報告登録メモの付属帳票）
// 区分（主要資材・一般資材他・労務・その他（2026-11-25 ユーザー指定で「副社長」から変更））ごとに 積算金額・推定実行・推定実行Ａ を入力、小計・合計は自動。
// 決定金額＝推定実行Ａの合計、粗利は（契約金額－推定金額／決定金額）÷契約金額（小数1位で切り捨て。元のExcelと同じ）。
// 現場経費の推定実行は「工事経費計算書にて入力」（元のExcelのコメント）→ ボタンで 工-14 の合計を取り込む
(function () {
  // 元のExcelの区分コード・名称（全角・空白は整える）。null は予備の行
  // 区分・名称・昇順は、どの行も最初から入っているものを消して手入力できる（2026-11-25 ユーザー指定）
  // 2026-11-25 ユーザー指定：A の I03 コンデンサー・D00 照明器具を削除して空欄に（空欄は下へ）
  const A = [['C01', '配分電盤', 310], ['C02', '各戸盤', 320], ['C03', '高圧開閉器', 325], ['C04', '既製盤', 326],
    ['I02', 'トップランナー変圧器', 338, '2014新基準'], ['D07', 'LED照明', 366],
    ['J00', '自動火災報知器', 370], ['N00', '車路管制', 410], ['P00', '放送', 420], ['P01', 'インターホン', 430], ['P07', 'ITV', 490],
    ['P12', '電気錠', 514], ['Q00', 'テレビ共同聴視', 520], ['R01', 'LAN', 531], ['R03', '電話整端費', 533], ['X01', '避雷針（外）', 580],
    ['Y00', '発電機', 600], null, null, null];
  // 前の並び（a6 I03・a7 D00・a8〜a19・a20 予備）で保存した下書き・JSON を、新しい並びに置き換える。
  //   消した行（I03・D00）に金額や備考があれば、区分・名称・昇順と一緒に下の空欄（a19・a20）へ移して残す
  function migrateA(values) {
    if (values._a49 === 2) return false;
    values._a49 = 2;
    const keys = Object.keys(values).filter((k) => /^a\d+\./.test(k));
    if (!keys.length) return true;
    const old = {};
    keys.forEach((k) => { old[k] = values[k]; delete values[k]; });
    const to = (o) => (o <= 5 ? o : o === 6 ? 19 : o === 7 ? 20 : o - 2); // 前の a20（予備）→ a18
    keys.forEach((k) => { const m = /^a(\d+)\.(.+)$/.exec(k); values[`a${to(+m[1])}.${m[2]}`] = old[k]; });
    [[6, ['I03', 'コンデンサー', '339']], [7, ['D00', '照明器具', '350']]].forEach(([o, it]) => {
      if (!['seki', 'sui', 'jA', 'note'].some((c) => old[`a${o}.${c}`])) return;
      const n = to(o);
      values[`a${n}.code`] = it[0]; values[`a${n}.name`] = it[1]; values[`a${n}.jun`] = it[2];
    });
    return true;
  }
  const KOSHO = '本工事は購買折衝';
  const B = [['A00', '電線', 10, KOSHO], ['A05', 'ブランチケーブル', 15, KOSHO], ['A06', 'Fユニット', 16, KOSHO], ['A07', 'プレハブケーブル', 17, KOSHO],
    ['A08', '弱電ケーブル', 18, KOSHO], ['B00', '電線管', 20], ['G00', '電線管用付属品', 30, 'ノーマル含'], ['H00', '位置ボックス', 40],
    ['H01', 'プルボックス', 41], ['F01', 'レースウェイ・モール', 50], ['F02', 'ケーブルラック', 60], ['F04', '架空地中線材料', 80],
    ['F05', 'ハンドホール', 90], ['F06', '変電設備用資材', 100], ['S00', '接地工事材料', 120], ['F20', '機器取付用木板', 130],
    ['F09', 'コンクリート材', 150], ['F10', '耐火処理材', 160], ['U00', '仮枠材', 170], ['F00', '配線材料', 180],
    ['M01', '取付金物・その他', 190], ['M02', 'ケーブル支持材', 192], ['E05', '配線器具（外注）', 195], ['E07', 'リモコンスイッチ', 197, KOSHO],
    null, null, ['M00', '消耗費', 900]];
  const C = [['T00', '塗装費', 800], ['U03', '天井切込費', 816], ['K01', 'ハツリ補修費', 840], ['K02', '掘削費', 850], ['K00', '撤去工費', 870],
    ['K16', '高所作業足場費', 889], ['K50', '工料', 910], ['K60', '雑工事費', 913], ['L00', '場内運搬費', 920], ['L01', '重量物運搬費', 921],
    ['K29', '外注費', 928, '外注社員・CADオペ'], ['K31', 'D式管理費', 929], null];
  const D = [['O07', '設計料', 714], ['O10', '斡旋料', 717], ['O31', '研究開発費（1）', 776, '営業・工事7％（推定実行は自動、契約500万円以上は空欄）'], ['O0x', '変更予備費（2）', 786, 'その他予備費'],
    ['O2X', 'VE予備費', 788], ['O92', '諸経費', 992], ['O96', '法定福利費', 997]];
  // 区分（行の key の頭文字・縦の見出し・行）
  const SECS = [['a', 'A\n主\n要\n資\n材', A], ['b', 'B\n一\n般\n資\n材\n他', B], ['c', 'C\n労\n務', C], ['d', 'D\nそ\nの\n他', D]];
  // B の小計の下（小計に含めない）：現場経費・予備・賦金。合計には入る
  const EXTRA = [['g', ['O00', '現場経費', 930]], ['x', null], ['f', ['O09', '賦金', 716]]];
  const COLS = ['seki', 'sui', 'jA']; // 積算金額・推定実行・推定実行Ａ
  const rowKeys = (p, list) => list.map((_, i) => `${p}${i + 1}`);
  const secSum = (n, p, list, col) => rowKeys(p, list).reduce((t, k) => t + n(`${k}.${col}`), 0);
  const total = (n, col) => SECS.reduce((t, [p, , list]) => t + secSum(n, p, list, col), 0) + EXTRA.reduce((t, [k]) => t + n(`${k}.${col}`), 0);
  const blankZero = (v) => (v === 0 ? '' : v);
  // 研究開発費（1）：契約金額×7％を1万円単位で切り上げ。契約金額が500万円以上のときは記入しない（空欄。2026-11-27 ユーザー指定）
  const KENKYU_MAX = 5000000;
  const kenkyu = (keiyaku) => (keiyaku > 0 && keiyaku < KENKYU_MAX ? Math.ceil(keiyaku * 7 / 1000000) * 10000 : null);
  // 粗利（％）：元のExcelと同じく小数1位で切り捨て
  const arari = (keiyaku, x) => (keiyaku && x ? Math.trunc((keiyaku - x) / keiyaku * 1000) / 10 : null);

  // 工-14 工事経費計算書の合計（このブラウザの下書き）を現場経費の推定実行へ
  function importKeihi(values, setVal, input) {
    let v = {};
    try { v = JSON.parse(localStorage.getItem('shoshiki:56') || '{}') || {}; } catch (e) { v = {}; }
    const num = (s) => { const x = Number(String(s ?? '').replace(/[,，\s円]/g, '')); return isNaN(x) ? 0 : x; };
    let sum = 0;
    for (let r = 1; r <= 60; r++) sum += num(v[`r.${r}.amount`]);
    if (!sum) { alert('工-14 工事経費計算書の入力が見つかりません。\n（このブラウザで工-14 を開いて実行金額を入力してから、もう一度押してください）'); return; }
    const kb = String(v.koban || '').trim(), mine = String(values.koban || '').trim();
    if (kb && mine && kb !== mine && !confirm(`工-14 の工番（${kb}）がこの帳票の工番（${mine}）と違います。取り込みますか？`)) return;
    const s = sum.toLocaleString('ja-JP');
    setVal('g.sui', s);
    input.value = s;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  let migrated = false;
  const table = { type: 'custom', render: ({ h, field, values, setVal }) => {
    migrated = migrateA(values) || migrated;
    const money = (key) => field({ key, type: 'money' });
    const sumCell = (key, calc) => h('td', { class: 'jk-sum' }, field({ key, type: 'calc', calc })); // key：sum.<区分>.<列>（計算結果も保存される）
    const nameCell = (txt) => h('td', { class: 'jk-name' }, h('span', null, txt));
    const itemRow = (key, it, grp) => {
      const tr = h('tr', null, grp || null);
      // 区分・名称・昇順：最初から入っている行も入力欄（default）。消して空欄にも、ほかの区分にも書き換えられる（2026-11-25 ユーザー指定）
      tr.append(h('td', null, field({ key: `${key}.code`, align: 'center', default: it ? it[0] : null })),
        h('td', null, field({ key: `${key}.name`, default: it ? it[1] : null })),
        h('td', null, field({ key: `${key}.jun`, align: 'center', default: it ? String(it[2]) : null })));
      COLS.forEach((c) => {
        // O31 研究開発費（1）の推定実行は自動：契約金額×7％、1万円単位で切り上げ（2026-11-18 ユーザー指定）
        const td = key === 'd3' && c === 'sui'
          ? h('td', { class: 'jk-auto', title: '契約金額×7％（1万円単位で切り上げ）。契約金額が500万円以上のときは記入しない' }, field({ key: `${key}.${c}`, type: 'calc', calc: (n) => kenkyu(n('keiyakuGaku')) }))
          : h('td', null, money(`${key}.${c}`));
        if (key === 'g' && c === 'sui') { // 現場経費の推定実行：工-14 の合計を取り込むボタン（画面だけ）
          td.classList.add('jk-keihi');
          const inp = td.querySelector('input');
          td.append(h('button', { type: 'button', class: 'jk-imp no-print', title: '工-14 工事経費計算書の合計（このブラウザの下書き）を入れます', onclick: () => importKeihi(values, setVal, inp) }, '工-14から'));
        }
        tr.append(td);
      });
      tr.append(h('td', null, field({ key: `${key}.note`, placeholder: it && it[3] ? it[3] : '', fit: true })));
      return tr;
    };
    const subRow = (p, label, calcOf) => h('tr', { class: 'jk-subrow' }, h('td', { class: 'jk-code' }), nameCell(label), h('td'),
      ...COLS.map((c) => sumCell(`sum.${p}.${c}`, (n) => blankZero(calcOf(n, c)))), h('td'));
    const tb = h('tbody');
    SECS.forEach(([p, label, list]) => {
      const n = list.length + 1 + (p === 'b' ? EXTRA.length : 0);
      const grp = h('th', { class: 'jk-grp', rowspan: n }, ...label.split('\n').flatMap((s, i) => (i ? [h('br'), s] : [s])));
      list.forEach((it, i) => tb.append(itemRow(`${p}${i + 1}`, it, i === 0 ? grp : null)));
      tb.append(subRow(p, '（小　計）', (n2, c) => secSum(n2, p, list, c)));
      if (p === 'b') EXTRA.forEach(([k, it]) => tb.append(itemRow(k, it)));
    });
    const totalRow = h('tr', { class: 'jk-total' }, h('th'), h('td', { class: 'jk-code' }), nameCell('（合　計）'), h('td'),
      ...COLS.map((c) => sumCell(`sum.total.${c}`, (n) => blankZero(total(n, c)))), h('td'));
    tb.append(totalRow);
    return h('table', { class: 'grid jk13' },
      h('colgroup', null, ...[5, 7, 17, 6, 15, 15, 15, 20].map((w) => h('col', { style: `width:${w}%` }))),
      h('thead', null, h('tr', null, h('th', { colspan: 2 }, '区分'), h('th', null, '区　分　名　称'), h('th', null, '昇順'),
        h('th', null, '積算金額（円）'), h('th', null, '推定実行（円）'), h('th', null, '推定実行Ａ（円）'), h('th', null, '備　　考'))),
      tb);
  } };

  FORM_DEFS['49'] = {
    code: '工-13', hokan: '工事管理部', title: '工事実行金額計算書', paper: 'A3',
    // 並びを置き換えたら保存し直す（次に開いたとき、もう一度置き換えないように）
    setup: ({ setVal }) => { if (migrated) { migrated = false; setVal('_a49', 2); } },
    selfStamp: '発行', // 本人欄（デート印を押す欄）
    stamps: [{ boxes: ['承認', '確認', '確認', '確認', '発行'] }],
    blocks: [
      { type: 'row', gap: 3, items: [
        { type: 'col', w: 36, items: [{ type: 'free', label: '実行説明', key: 'setsumei', lines: 4, grow: true }] },
        { type: 'col', items: [{ type: 'grid', dense: true, rows: [
          [{ label: '件　名', key: 'subject', type: 'textarea', plain: true, lines: 1, fit2: true, span: 15, lw: 3 }, { label: '事業所', key: 'office', type: 'select', options: LISTS.officeCodes, span: 9, lw: 3 }],
          [{ label: '契約先', key: 'keiyaku', span: 15, lw: 3, fit: true }, { label: '工　番', key: 'koban', maxlength: 12, fit: true, span: 9, lw: 3 }],
          [{ label: '契約金額', key: 'keiyakuGaku', type: 'money', unit: '円', span: 15, lw: 3 }, { label: '営業担当', key: 'eigyo', span: 9, lw: 3, fit: true }],
          [{ label: '推定金額', key: 'suitei', type: 'money', unit: '円', span: 9, lw: 3 },
            { label: '粗利', key: 'arari1', type: 'calc', unit: '％', dec: 1, showZero: true, span: 6, lw: 2, calc: (n) => arari(n('keiyakuGaku'), n('suitei')) },
            { label: '工事担当', key: 'koji', span: 9, lw: 3, fit: true }],
          [{ label: '決定金額', key: 'kettei', type: 'calc', unit: '円', span: 9, lw: 3, calc: (n) => blankZero(total(n, 'jA')) },
            { label: '粗利', key: 'arari2', type: 'calc', unit: '％', dec: 1, showZero: true, span: 6, lw: 2, calc: (n) => arari(n('keiyakuGaku'), total(n, 'jA')) },
            { label: '発行識別', key: 'hakko', span: 9, lw: 3 }],
          [{ label: '工　期', key: 'kFrom', key2: 'kTo', type: 'daterange', span: 24, lw: 3 }],
          [{ label: '工事場所', key: 'place', span: 24, lw: 3, fit: true }],
        ] }] },
      ] },
      table,
      { type: 'notes', items: ['※ 現場経費の推定実行は 工-14 工事経費計算書の合計（「工-14から」で取り込み）。研究開発費（1）の推定実行は契約金額×7％（1万円単位で切り上げ、自動。契約金額が500万円以上のときは記入しない）。決定金額は推定実行Ａの合計。　元の様式：Ver.12（2018年1月23日改訂）'] },
    ],
  };
})();
