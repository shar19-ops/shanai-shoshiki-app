// 本-設計-A0024 設計作図依頼書（品質記録様式。元Excel：本-設計-A0024 設計作図依頼書.xlsx、A4縦1ページ）
// 協力会社あて（「様」）。外部へは出力したもの（印刷・PDF）を渡す（ユーザー確認済み）
// 購買データは該当する項目の ○ をクリックで ●（元の様式どおり「●印が該当するもの」）。空欄の項目は内容を書ける
// 押印欄は設計部長・設計担当責任者（元は会社名の下に「印」）→ 右上、設計担当責任者にデート印（日付は作成日）
(function () {
  // 購買データ：[No, 項目, 選択肢（文字列＝固定の項目、{ free } ＝内容を書く項目、{ named } ＝名称を書く欄）, 備考]
  const ROWS = [
    [1, '提出物', ['図面データ', '計算書']],
    [2, '用紙サイズ', ['Ａ１', 'Ａ２', 'Ａ３']],
    [3, '適用規格', ['建築基準法', '消防法', '電気設備技術基準', '内線規定', '建築設備設計基準'], '版数は\n設計図作図依頼時の\n最新版とする。'],
    [4, '仕様書', [{ named: '仕様書名' }]],
    [5, '参考図', [{ named: '件　　名' }]],
    [6, '図面構成', ['別紙図面リストによる', '右の通り']],
    [7, '支給品', ['建築ＣＡＤデータ', { free: true }]],
    [8, '付帯サービス', ['図面変更に対応すること', { free: true }]],
    [9, 'その他', ['設計計画書に基づくこと', { free: true }, { free: true }]],
  ];

  const table = { type: 'custom', render: ({ h, field, values, setVal }) => {
    // ○ ⇔ ● の切り替え
    const dot = (key) => {
      const b = h('button', { type: 'button', class: 's24-dot', title: 'クリックで ○ ⇔ ●' }, values[key] === '1' ? '●' : '○');
      b.addEventListener('click', () => { const on = values[key] !== '1'; setVal(key, on ? '1' : ''); b.textContent = on ? '●' : '○'; });
      return b;
    };
    const lines = (s) => String(s).split('\n').flatMap((x, i) => (i ? [h('br'), x] : [x]));
    const tb = h('tbody', null, h('tr', null, h('th', null, 'No'), h('th', null, '項　目'), h('th', { colspan: 2 }, '詳　　細'), h('th', null, '備　考')));
    ROWS.forEach(([no, label, opts, note]) => opts.forEach((o, i) => {
      const key = `b${no}.${i + 1}`;
      const body = typeof o === 'string' ? h('td', { class: 's24-txt' }, o)
        : o.named ? h('td', { class: 's24-txt' }, h('div', { class: 's24-named' }, h('span', null, `${o.named}（`), h('div', { class: 's24-named-in' }, field({ key: `${key}.t` })), h('span', null, '）')))
        : h('td', null, field({ key: `${key}.t` }));
      tb.append(h('tr', { class: i === 0 ? 's24-grp' : null },
        i === 0 ? h('td', { class: 's24-no', rowspan: opts.length }, String(no)) : null,
        i === 0 ? h('td', { class: 's24-lbl', rowspan: opts.length }, label) : null,
        h('td', { class: 's24-d' }, o.named ? '' : dot(key)), body,
        i === 0 ? h('td', { class: 's24-note', rowspan: opts.length }, ...(note ? lines(note) : [field({ key: `b${no}.note`, type: 'textarea', plain: true, lines: 1 })])) : null));
    }));
    return h('div', null, h('div', { class: 'blk-title' }, '１．購買データ（●印が該当するものとする）　　受入検査判断基準'),
      h('table', { class: 'grid s24' }, h('colgroup', null, ...[9, 24, 8, null, 40].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb));
  } };

  FORM_DEFS['sekkei-a0024'] = {
    code: '本-設計-A0024', title: '設計作図依頼書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    selfStamp: '設計担当責任者', stampDate: 'sakusei',
    meta: [{ label: '作成日', key: 'sakusei', type: 'date', jp: true }],
    stamps: [{ boxes: ['設計部長', '設計担当責任者'] }],
    blocks: [
      { type: 'grid', lw: 3, rowH: 8, rows: [
        [{ label: '宛　先', key: 'atesaki', unit: '様', span: 14 }, { text: '株式会社 雄電社 本店 設計部', span: 10, cls: 's24-co' }],
        [{ label: '件　名', key: 'subject', span: 24 }],
        [{ key: 'setsubiW', type: 'inline', span: 24, parts: [{ key: 'setsubi', placeholder: '（設備名）' }, '設備の設計図作図の依頼をします。'] }],
      ] },
      table,
      { type: 'grid', lw: 4, rowH: 9, title: '２．納品日　　　　　　　　　受入検査記録', rows: [
        [{ label: '納品日', key: 'nohin', type: 'date', jp: true, span: 10 }, { label: '受入検査\n記録', key: 'ukeire', span: 14 }],
      ] },
    ],
  };
})();
