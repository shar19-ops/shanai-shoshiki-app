FORM_DEFS['06'] = {
  code: '般-06', title: '業務連絡書',
  meta: [
    { label: '発行日', key: 'issued', type: 'date' },
    { label: '回答日', key: 'answered', type: 'date' },
  ],
  stamps: [
    { label: '回送先', boxes: ['承認', '確認', '責任者'] },
    { label: '発行', boxes: ['確認', '確認', '発行'] },
  ],
  blocks: [
    { type: 'grid', rows: [
      [{ label: '宛　先', key: 'to', span: 12 }, { label: '発行者', key: 'from', span: 12 }],
      [{ label: '事　項', key: 'subject' }],
    ] },
    { type: 'free', label: '内　容', key: 'body', lines: 18, grow: true },
    { type: 'free', label: '回　答', key: 'answer', lines: 6 },
  ],
};
