FORM_DEFS['20'] = {
  code: '般-20', title: '稟議書', subtitle: '（小）',
  meta: [{ label: '作成日', key: 'date', type: 'date' }],
  stamps: [{ boxes: ['承認', '役員', '部・店長', '課長', '作成'] }],
  blocks: [
    { type: 'grid', rows: [
      [{ label: '得意先', key: 'client' }],
      [{ label: '工　番', key: 'koban', span: 10 }, { label: '件　名', key: 'subject', span: 14 }],
      [{ label: '金　額', key: 'amount', type: 'money', unit: '円', span: 12 }, { label: '支払先', key: 'payee', span: 12 }],
    ] },
    { type: 'free', label: '内　容', key: 'body', lines: 10 },
  ],
};
