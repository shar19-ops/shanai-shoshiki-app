// 外注品発注承認書（A4横）
FORM_DEFS['47'] = {
  code: '般-47', title: '外注品発注承認書', orientation: 'landscape',
  meta: [
    { label: '発行日', key: 'date', type: 'date' },
    { label: '事業所名', key: 'office', type: 'select', options: LISTS.offices, w: 32 },
  ],
  stamps: [{ boxes: ['支店長', '工事長/部長', '課長', '作成'] }],
  blocks: [
    { type: 'grid', rows: [
      [{ label: '事業所コード', key: 'officeCd', type: 'select', options: LISTS.officeCodes, span: 6, lw: 3 }, { label: '工　番', key: 'koban', span: 5, lw: 2 }, { label: '件　名', key: 'subject', span: 13, lw: 2 }],
      [{ label: '工期（納期）', key: 'kFrom', type: 'date', span: 12, lw: 3 }, { label: '〜', key: 'kTo', type: 'date', span: 12, lw: 1 }],
    ] },
    {
      type: 'table', key: 'r', rows: 14, rowH: 7.2,
      columns: [
        { label: '区分', key: 'kubun', w: 5, align: 'center' },
        { label: '業者\nコード', key: 'vcode', w: 7, align: 'center' },
        { label: '発注先業者', key: 'vendor', w: 15 },
        { label: '処理日付', key: 'shori', w: 8, align: 'center', placeholder: '月/日' },
        { label: '発注先見積金額', key: 'mitsu', w: 11, type: 'money' },
        { label: '実行金額', key: 'jikko', w: 11, type: 'money' },
        { label: '電気工事額', key: 'denki', w: 11, type: 'money' },
        { label: '消費税', key: 'tax', w: 10, type: 'calc', calc: (n) => n('denki') * 0.1 },
        { label: '手形・現金', key: 'pay', w: 7, type: 'select', options: ['手形', '現金'], align: 'center' },
        { label: '予算残額', key: 'zan', w: 11, type: 'calc', calc: (n) => n('jikko') - n('denki') },
      ],
      foot: [[{ label: '合　計', span: 4 }, { sum: 'mitsu' }, { sum: 'jikko' }, { sum: 'denki' }, { sum: 'tax' }, { label: '', lbl: false }, { sum: 'zan' }]],
    },
    { type: 'notes', items: ['※消費税＝電気工事額×10％、予算残額＝実行金額－電気工事額 を自動計算します。'] },
  ],
};
