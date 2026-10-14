// 推薦業者依頼書
FORM_DEFS['32'] = {
  code: '般-32', title: '推薦業者依頼書',
  selfStamp: '発行', // 本人欄（デート印を押す欄）
  meta: [{ label: '作成日', key: 'date', type: 'date' }],
  stamps: [
    { boxes: ['購買部保管'], width: 18 },
    { boxes: ['本店長', '確認', '確認', '確認', '発行'] },
  ],
  stampClass: 'small',
  blocks: [
    { type: 'grid', rows: [
      [{ label: '工　番', key: 'koban', span: 10 }, { label: '件　名', key: 'subject', span: 14, lw: 3 }],
      [{ label: '受注先', key: 'client', span: 12 }, { label: '事業所', key: 'office', type: 'select', options: LISTS.offices, span: 12, lw: 3 }],
      [{ span: 12 }, { label: '発行者', key: 'issuer', span: 10, lw: 3 }, { text: '印', span: 2, align: 'center' }],
    ] },
    {
      type: 'table', key: 'items', rows: 15, rowH: 9,
      columns: [
        { label: 'No.', key: 'no', w: 6, rowNo: true },
        { label: '品　名', key: 'name', w: 26 },
        { label: 'メーカー', key: 'maker', w: 22 },
        { label: '代理店', key: 'agent', w: 22 },
        { label: '推薦依頼者', key: 'requester', w: 24 },
      ],
    },
    { type: 'grid', rows: [
      [{ label: '本店長・指示事項', key: 'shiji', type: 'radio', options: ['A．最優先', 'B．金額が合えば', 'C．一応見積をとること'], lw: 6, h: 10 }],
      [{ label: '指示内容', key: 'shijiNote', type: 'textarea', lines: 2, lw: 6 }],
    ] },
    { type: 'spacer' },
  ],
};
