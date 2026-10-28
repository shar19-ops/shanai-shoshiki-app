// 本-購買-A0003 新規協力会社評価表（品質記録様式。元Word：本‐購買‐A0003新規協力会社評価表.doc、A4縦1ページ）
// 区分（物品納品・材料労務・労務）を選ぶと、その列だけ点数（3・2・1）をクリックで選べる（選んだ点数に〇）
// 得点計・評価点（得点計÷基準点×100 を四捨五入）・評価（A〜D）は自動（ユーザー指定）。評価は全項目に点数を付けると出る
// 基準点は使う項目の満点の合計（材料労務・労務 24 は元と同じ。物品納品は元が 9 だが、使う項目は4つ＝12点満点。12 が正しいとユーザー確認済み）
// 押印欄は購買部長（元のまま）
(function () {
  const KUBUN = ['物品納品', '材料労務', '労務'];
  // 評価項目：[区分, 名称, 使う区分（KUBUN の順）, [3点・2点・1点の評価基準]]
  const ITEMS = [
    ['業態', '顧客からの推薦', [1, 1, 1], ['顧客の強力な推薦がある。', '顧客より金額が合えば使ってもらいたい要望あり。', '推薦無し。']],
    ['業態', '業態調査報告書', [1, 1, 1], ['評価はA又はBである。', '評価はCである。', '評価はDである。']],
    ['業態', '工事経歴（納入実績）', [1, 1, 1], ['大規模工事の実績がある。', '中規模工事の実績がある。', '小規模工事の実績しかない。']],
    ['組織', '建設業許可', [0, 1, 1], ['該当する業種の建設業許可がある。', '建設業許可はあるが、該当する業種ではない。', '建設業許可は無い。']],
    ['組織', '社員の人数', [1, 1, 1], ['11名以上である。', '２名以上、10名以下である。', '１名である。']],
    ['品質', '法定資格保有者', [0, 1, 1], ['必要とする全ての法定有資格者がいる。', '全てではないが、法定有資格者がいる。', '法定有資格者はいない。']],
    ['品質', '品質保証体制', [0, 1, 1], ['品質保証部署があり、積極的に活動している。', '品質保証部署はある。又は、上司が積極的に活動している。', '品質保証部署は無い。']],
    ['品質', '安全管理体制', [0, 1, 1], ['安全管理部署があり、積極的に活動している。', '安全管理部署はある。又は、上司が積極的に活動している。', '安全管理部署は無い。']],
  ];
  const PTS = [3, 2, 1];
  const RANKS = [['A', 71], ['B', 61], ['C', 41], ['D', 0]]; // 評価の判定基準（評価点 71以上 A、61〜70 B、41〜60 C、40以下 D）

  const kubunIdx = (v) => KUBUN.indexOf(v.kubun);
  const usedItems = (c) => ITEMS.map((it, i) => (it[2][c] ? i : -1)).filter((i) => i >= 0);
  const base = (c) => usedItems(c).length * PTS[0];
  const total = (v, c) => usedItems(c).reduce((a, i) => a + (Number(v[`s${i + 1}`]) || 0), 0);
  const allFilled = (v, c) => c >= 0 && usedItems(c).every((i) => v[`s${i + 1}`]);
  const rate = (v, c) => Math.round(total(v, c) / base(c) * 100);
  const rank = (v, c) => (allFilled(v, c) ? RANKS.find(([, min]) => rate(v, c) >= min)[0] : '');

  const table = { type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const c = kubunIdx(values);
    // 区分を選ぶ（選び直すと表を作り直す）
    const kubunRow = h('div', { class: 'b3-kubun' }, h('span', { class: 'b3-kubun-lbl' }, '区　分'),
      ...KUBUN.map((k, j) => h('button', { type: 'button', class: 'b3-pick' + (j === c ? ' on' : ''),
        onclick: () => { setVal('kubun', j === c ? '' : k); rebuild(); } }, k)),
      c < 0 ? h('span', { class: 'b3-hint no-print' }, '← 区分を選ぶと、その列の点数を選べます') : null);

    // 点数のボタン（同じ項目の中で1つだけ。もう一度押すと外す）
    const pick = (i, p) => {
      const key = `s${i + 1}`;
      const b = h('button', { type: 'button', class: 'b3-pt' + (String(values[key] ?? '') === String(p) ? ' on' : ''), 'data-key': key, 'data-p': String(p) }, String(p));
      b.addEventListener('click', () => {
        const next = String(values[key] ?? '') === String(p) ? '' : String(p);
        setVal(key, next);
        document.querySelectorAll(`.b3-pt[data-key="${key}"]`).forEach((x) => x.classList.toggle('on', x.dataset.p === next));
      });
      return b;
    };

    const tb = h('tbody', null,
      h('tr', null, h('th', null, '区分'), h('th', null, '評　価　項　目'),
        ...KUBUN.map((k, j) => h('th', { class: 'b3-col' + (c >= 0 && j !== c ? ' off' : '') }, ...[...k].flatMap((ch, x) => (x ? [h('br'), ch] : [ch])))),
        h('th', null, '評　　価　　基　　準')));
    ITEMS.forEach(([cat, name, use, desc], i) => {
      const first = i === 0 || ITEMS[i - 1][0] !== cat;
      const span = ITEMS.filter((it) => it[0] === cat).length * PTS.length;
      PTS.forEach((p, r) => tb.append(h('tr', { class: r === 0 ? (first ? 'b3-grp' : 'b3-item') : null },
        first && r === 0 ? h('td', { class: 'b3-cat', rowspan: span }, ...[...cat].flatMap((ch, x) => (x ? [h('br'), ch] : [ch]))) : null,
        r === 0 ? h('td', { class: 'b3-name', rowspan: PTS.length }, name) : null,
        ...KUBUN.map((_, j) => (!use[j]
          ? (r === 0 ? h('td', { class: 'b3-na', rowspan: PTS.length }, '―') : null)
          : h('td', { class: 'b3-p' + (c >= 0 && j !== c ? ' off' : '') }, j === c ? pick(i, p) : String(p)))),
        h('td', { class: 'b3-desc' }, desc[r]))));
    });
    // 得点計・基準点・評価点・評価（自動）
    const sumCell = (j) => h('td', { class: 'b3-auto' + (c >= 0 && j !== c ? ' off' : '') }, j === c
      ? field({ key: 'total', type: 'calc', align: 'center', calc: (_, v) => (kubunIdx(v) >= 0 && usedItems(kubunIdx(v)).some((x) => v[`s${x + 1}`]) ? total(v, kubunIdx(v)) : null), showZero: true })
      : '');
    const letters = RANKS.map(([r]) => h('span', { class: 'b3-rank', 'data-r': r }, String.fromCharCode(r.charCodeAt(0) + 0xFEE0)));
    tb.append(
      h('tr', { class: 'b3-grp' }, h('th', { colspan: 2 }, '得　点　計'), ...KUBUN.map((_, j) => sumCell(j)),
        h('td', { class: 'b3-rate', rowspan: 2 }, '評価点＝得点計／基準点×100＝',
          h('span', { class: 'b3-rate-v' }, field({ key: 'rate', type: 'calc', align: 'center',
            calc: (_, v) => (allFilled(v, kubunIdx(v)) ? rate(v, kubunIdx(v)) : null), showZero: true })),
          h('span', { class: 'b3-small' }, '（小数点以下四捨五入）'),
          h('div', { class: 'b3-left no-print' }, field({ key: 'left', type: 'calc', align: 'left', calc: (_, v) => {
            const cc = kubunIdx(v);
            if (cc < 0) return '';
            const n = usedItems(cc).filter((x) => !v[`s${x + 1}`]).length;
            return n ? `あと ${n} 項目に点数を付けると、評価点と評価が出ます` : '';
          } })))),
      h('tr', null, h('th', { colspan: 2 }, '基　準　点'), ...KUBUN.map((_, j) => h('td', { class: 'b3-base' + (c >= 0 && j !== c ? ' off' : '') }, String(base(j))))),
      h('tr', { class: 'b3-grp' }, h('th', { colspan: 2, class: 'b3-eval-h' }, '評　価'),
        h('td', { colspan: 3, class: 'b3-eval' }, ...letters.flatMap((l, x) => (x ? [h('span', { class: 'b3-dot' }, '・'), l] : [l])),
          h('span', { style: 'display:none' }, field({ key: 'rank', type: 'calc', align: 'center', calc: (_, v) => {
            const r = rank(v, kubunIdx(v));
            letters.forEach((l) => l.classList.toggle('on', l.dataset.r === r));
            return r;
          } }))),
        h('td', { class: 'b3-criteria' }, h('b', null, '評価の判定基準'),
          h('div', null, 'Ａ：評価点 71 以上　　Ｂ：評価点 61 ～ 70'), h('div', null, 'Ｃ：評価点 41 ～ 60　　Ｄ：評価点 40 以下'))));
    return h('div', null, kubunRow, h('table', { class: 'grid b3' },
      h('colgroup', null, ...[11, 34, 12, 12, 12, null].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb));
  } };

  FORM_DEFS['kobai-a0003'] = {
    code: '本-購買-A0003', title: '新規協力会社評価表',
    seitei: '99/01/06', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    stamps: [{ boxes: ['購買部長'] }],
    meta: [],
    blocks: [
      { type: 'grid', lw: 3, rowH: 7, rows: [
        [{ label: '会社名', key: 'company', span: 13 }, { label: 'コード', key: 'code', align: 'center', span: 11 }],
        [{ label: '工　種', key: 'koshu', span: 13 }, { label: '評価日', key: 'hyokabi', type: 'date', span: 11 }],
      ] },
      table,
      { type: 'free', label: '特記事項', key: 'tokki', lines: 3 },
    ],
  };
})();
