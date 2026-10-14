FORM_DEFS['33'] = {
  code: '般-33', title: '住所（住居表示）変更届',
  meta: [{ label: '届出日', key: 'date', type: 'date' }],
  stamps: [
    { label: '総務部', boxes: ['', '', ''] },
    { boxes: ['社長'] },
  ],
  blocks: [
    { type: 'row', align: 'flex-end', items: [
      // 社長名は入力式（公開版に個人名を載せないため）
      { type: 'custom', render: ({ h, field }) => h('div', { class: 'addressee' },
        h('div', null, '株式会社　雄電社'),
        h('div', { class: 'addr-name' }, h('span', null, '社長'), h('span', { class: 'addr-inp' }, field({ key: 'president', placeholder: '氏名' })), h('span', null, '殿'))) },
      { type: 'grid', w: 50, rows: [
        [{ label: '所　属', key: 'dept' }],
        [{ label: '氏　名', key: 'name', span: 20 }, { text: '印', span: 4, align: 'center' }],
      ] },
    ] },
    { type: 'para', text: '下記のとおり、お届けします。', style: 'margin-top:4mm' },
    { type: 'grid', rows: [
      [{ label: '旧住所', key: 'oldAddr', h: 12 }],
      [{ label: '新住所', span: 4, rs: 2 }, { key: 'newZip', prefix: '〒', placeholder: '000-0000', span: 8 }, { span: 12 }],
      [{ key: 'newAddr', span: 20, h: 12 }],
      [{ label: '電話番号', key: 'tel', type: 'tel', span: 12 }, { span: 12 }],
      [{ label: '通勤区間 1', key: 'r1from', unit: '駅', span: 9 }, { label: '〜', lw: 1, key: 'r1to', unit: '駅', span: 7 }, { label: '経由', lw: 2, key: 'r1via', span: 8 }],
      [{ label: '通勤区間 2', key: 'r2from', unit: '駅', span: 9 }, { label: '〜', lw: 1, key: 'r2to', unit: '駅', span: 7 }, { label: '経由', lw: 2, key: 'r2via', span: 8 }],
    ] },
    { type: 'notes', items: ['（注）届出は、変更後5日以内。'] },
    { type: 'spacer' },
    { type: 'free', label: '総務部記入欄', key: 'soumu', lines: 3 },
  ],
};
