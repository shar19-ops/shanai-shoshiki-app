FORM_DEFS['04'] = {
  code: '購-01', hokan: '非管理', title: '物品購入要求書',
  selfStamp: '要求者', // 本人欄（デート印を押す欄）
  meta: [
    { label: '作成日', key: 'date', type: 'date' },
    { label: '事業所名', key: 'office', type: 'select', options: LISTS.offices, default: '本店', w: 32 },
  ],
  // 承認ルートと関係ない欄は表の下（bottomStamps）
  bottomStamps: [{ label: '処理', boxes: ['発注', '納入'] }],
  stamps: [
    { boxes: ['承認', '確認', '確認', '要求者'] },
  ],
  blocks: [
    // 入力画面だけの注意書き（印刷には出ない。2026-11-25 ユーザー指定）
    { type: 'custom', render: ({ h }) => h('div', { class: 'no-print scr-note' }, '通勤用定期券購入依頼は「', h('a', { href: 'form.html?id=53', target: '_blank', title: '共-01 通勤用定期券購入申請書を新しいタブで開きます' }, '共-01　通勤用定期券購入申請書'), '」で申請してください。') },
    {
      type: 'table', key: 'items', rows: 15,
      columns: [
        { label: '品　名', key: 'name', w: 30 },
        { label: 'サイズ\n(書類番号)', key: 'size', w: 15 },
        { label: '数量', key: 'qty', w: 8, type: 'number' },
        { label: '単価', key: 'price', w: 12, type: 'money' },
        { label: '金　額', key: 'amount', w: 14, type: 'calc', calc: (n) => n('qty') * n('price') },
        { label: '備　考', key: 'note', w: 21 },
      ],
      foot: [[{ label: '合　計', span: 4 }, { sum: 'amount' }, { label: '', lbl: false }]],
    },
    { type: 'free', label: '購入理由・用途', key: 'reason', lines: 4 },
  ],
};
