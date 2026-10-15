FORM_DEFS['19'] = {
  code: '般-19', title: '稟議書', subtitle: '（大）',
  meta: [
    { label: '起案年月日', key: 'date', type: 'date' },
  ],
  stamps: [
    { label: '決裁', boxes: ['決裁者', '確認', '確認', '確認'] },
  ],
  blocks: [
    { type: 'grid', rows: [
      [{ label: '受付No', key: 'recvNo', span: 8 }, { label: '受付日', key: 'recvDate', type: 'date', span: 8 }, { label: '決裁No', key: 'no', span: 8, prefix: '第', unit: '号' }],
      [{ label: '決裁日', key: 'decided', type: 'date', span: 8 }, { label: '起案部署', key: 'dept', span: 8 }, { label: '起案者', key: 'author', span: 6 }, { text: '印', span: 2, align: 'center' }],
      [{ label: '添付書類', key: 'attach' }],
      [{ label: '件　名', key: 'subject', h: 10 }],
    ] },
    { type: 'free', label: '稟議理由', key: 'reason', lines: 17, grow: true },
    { type: 'free', label: '意見欄', key: 'opinion', lines: 6 },
  ],
};
