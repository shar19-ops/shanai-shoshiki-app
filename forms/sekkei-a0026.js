// 本-設計-A0026 設計協力会社評価表（品質記録様式。元Excel：本-設計-A0026 設計協力会社評価表.xlsx、A4縦1ページ）
// 購買A0002・A0003 と同じく、評価項目ごとに点数をクリックで選ぶ（元は該当点に☑）。得点（100点満点）は自動（元の式＝☑の点数の合計）
// 押印欄は右上の作成者（元は作成者の右の「印」）、クリックでデート印（日付は作成日）
(function () {
  const LEVELS = ['良い', '・', '普通', '・', '悪い'];
  // 評価項目：[区分, 名称, 5段階の点数（良い→悪い）, [良い・普通・悪いの評価基準]]
  const ITEMS = [
    ['図面', '図面の品質', [20, 15, 10, 5, 1], ['技術、能力共に優秀で、品質目標の結果・内容に目を見張るものであった。', '適切な品質であり、品質目標の結果・内容に問題なかった。', '適切な品質が確保できず、品質目標の結果・内容に問題があった。']],
    ['図面', '図面の出来栄え', [20, 15, 10, 5, 1], ['作図能力を最大限に発揮し、優れた出来栄えであった。', '不良箇所もなく、出来栄えも良かった。', '手直しが多く、出来栄えも悪かった。']],
    ['図面', '工程の遵守度', [20, 15, 10, 5, 1], ['工程に余裕があり、チェックの時間も十分にとれた。', '工程通りで、遅速の調整も必要なかった。', '遅速があり、納期にも問題があった。']],
    ['会社', '高度な技術力', [10, 7, 5, 3, 1], ['高度な知識により、指示、指導の必要はなかった。', '指示、指導による技術力を使用した。', '適切な方法を使用せず、理解できなかった。']],
    ['会社', '仕事に対する態度', [5, 4, 3, 2, 1], ['チェック対策も万全で、十分に自信を持っていた。', '指示に対して自主的に行動し、問題はなかった。', 'やる気が認められず、問題も多かった。']],
    ['会社', '変更への対応', [10, 7, 5, 3, 1], ['常に積極的に対応し、大変協力的であった。', '変更に対して、前向きで協力的であった。', '非協力的であった。']],
    ['会社', '会社に対する協力度', [10, 7, 5, 3, 1], ['常にコスト意識を持ち、立場を良くわきまえていた。', '協力的で問題はなかった。', '自己都合が前面に出て問題があった。']],
    ['会社', '機動力を有する', [5, 4, 3, 2, 1], ['持てる力をフルに使い、実施していた。', '作業は順調に行われていた。', '機動力が不十分で、支障をきたしていた。']],
  ];
  const total = (v) => ITEMS.reduce((a, _, i) => a + (Number(v[`s${i + 1}`]) || 0), 0);
  const filled = (v) => ITEMS.filter((_, i) => v[`s${i + 1}`]).length;

  const table = { type: 'custom', render: ({ h, field, values, setVal }) => {
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
    const vlines = (s) => [...s].flatMap((ch, x) => (x ? [h('br'), ch] : [ch]));
    const tb = h('tbody', null,
      h('tr', null, h('th', { colspan: 2, rowspan: 2 }, '評　価　項　目'), h('th', { colspan: 2 }, '評価点'), h('th', { rowspan: 2 }, '評　　価　　基　　準')),
      h('tr', null, h('th', { colspan: 2, class: 's26-sub' }, '該当点をクリック')));
    ITEMS.forEach(([cat, name, pts, desc], i) => {
      const first = i === 0 || ITEMS[i - 1][0] !== cat;
      const span = ITEMS.filter((it) => it[0] === cat).length * LEVELS.length;
      LEVELS.forEach((lv, r) => tb.append(h('tr', { class: r === 0 ? (first ? 'b3-grp' : 'b3-item') : null },
        first && r === 0 ? h('td', { class: 'b3-cat', rowspan: span }, ...vlines(cat)) : null,
        r === 0 ? h('td', { class: 'b3-name', rowspan: LEVELS.length }, name) : null,
        h('td', { class: 's26-lv' }, lv),
        h('td', { class: 'b3-p' }, pick(i, pts[r])),
        h('td', { class: 'b3-desc' }, r % 2 === 0 ? desc[r / 2] : ''))));
    });
    tb.append(h('tr', { class: 'b3-grp' },
      h('th', { class: 's26-full' }, '満点', h('br'), '（100点）'),
      h('th', null, '得　点'),
      h('td', { colspan: 2, class: 'b3-auto s26-total' }, field({ key: 'total', type: 'calc', align: 'center', calc: (_, v) => (filled(v) ? total(v) : null), showZero: true })),
      h('td', { class: 's26-memo' }, h('div', { class: 's26-memo-h' }, '寸　評'), field({ key: 'sunpyo', type: 'textarea', plain: true, lines: 3 }))));
    return h('div', null, h('table', { class: 'grid b3 s26' },
      h('colgroup', null, ...[10, 30, 11, 11, null].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb),
      h('div', { class: 'b3-left no-print' }, field({ key: 'left', type: 'calc', align: 'left', calc: (_, v) => {
        const n = ITEMS.length - filled(v);
        return n && n < ITEMS.length ? `あと ${n} 項目に点数を付けると、すべての項目の得点になります` : '';
      } })));
  } };

  FORM_DEFS['sekkei-a0026'] = {
    code: '本-設計-A0026', title: '設計協力会社評価表',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    selfStamp: '作成者', stampDate: 'sakusei', // デート印の日付は作成日
    stamps: [{ boxes: ['作成者'] }],
    meta: [],
    blocks: [
      { type: 'grid', lw: 3, rowH: 7, rows: [
        [{ label: '会社名', key: 'company', span: 14 }, { label: '作成日', key: 'sakusei', type: 'date', jp: true, span: 10 }],
        [{ label: '件　名', key: 'subject', span: 14 }, { label: '作成者', key: 'author', span: 10 }],
        [{ label: '設計番号', key: 'sekkeiNo', span: 24 }],
      ] },
      table,
    ],
  };
})();
