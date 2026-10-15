FORM_DEFS['52'] = {
  code: '般-52', title: '代行支払い承諾書',
  meta: [{ label: '日付', key: 'date', type: 'date' }],
  blocks: [
    { type: 'row', align: 'flex-end', items: [
      { type: 'addressee', lines: ['株式会社　雄電社　御中'] },
      { type: 'grid', w: 55, lw: 5, rows: [
        [{ label: 'コードNo.', key: 'code' }],
        [{ label: '住　所', key: 'addr' }],
        [{ label: '氏　名', key: 'name', span: 20 }, { text: '印', span: 4, align: 'center' }],
      ] },
    ] },
    { type: 'grid', rows: [
      [{ label: '工　番', key: 'koban', span: 9 }, { label: '件　名', key: 'subject', span: 15 }],
    ] },
    {
      type: 'table', key: 'items', rows: 11,
      columns: [
        { label: '業者コード', key: 'vcode', w: 13, align: 'center' },
        { label: '代行支払先', key: 'payee', w: 20 },
        { label: '摘　要', key: 'desc', w: 25 },
        { label: '数量', key: 'qty', w: 7, type: 'number' },
        { label: '単位', key: 'unit', w: 7, align: 'center' },
        { label: '単価', key: 'price', w: 12, type: 'money' },
        { label: '金額', key: 'amount', w: 16, type: 'calc', calc: (n) => n('qty') * n('price') },
      ],
      foot: [[{ label: '合　計', span: 6 }, { sum: 'amount' }]],
    },
    { type: 'notes', items: ['※ 税込み金額で記入　（摘要の記入例：常用応援工事　〇月〇日～〇月〇日 × 〇人（計〇人））'] },
    { type: 'para', text: '貴社と請負契約した上記工事について、当月のお支払金額の内から上記金額を貴社より直接支払いいただくことを承諾いたします。', style: 'margin-top:2mm' },
    { type: 'spacer' },
  ],
};
