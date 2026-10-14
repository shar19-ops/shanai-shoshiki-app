// 作図依頼書（共用・住戸）
FORM_DEFS['39'] = {
  code: '般-39', title: '作図依頼書',
  meta: [
    { label: '区分', key: 'kubun', type: 'checks', options: ['共用', '住戸'], w: 34 },
    { label: '発行日', key: 'date', type: 'date' },
  ],
  stamps: [{ boxes: ['工事本部長\nRE部長', '支店長', '工事長\n工事部長', '依頼者'] }],
  blocks: [
    { type: 'notes', items: [
      '【注意事項】　1　期限ごとに1枚ずつ『作図依頼書』を作成。　2　CAD部で『作図依頼書』を受領後、作図を開始予定。',
      '3　CAD部へ作図依頼をした際は CAD部まで必ず連絡。　　回送順 →→ 同時にCADにメール送信',
    ] },
    { type: 'grid', rows: [
      [{ label: '工　番', key: 'koban', span: 9 }, { label: '件　名', key: 'subject', span: 15 }],
      [{ label: '担当者', key: 'person', span: 8 }, { label: 'TEL', key: 'tel', type: 'tel', span: 7, lw: 2 }, { label: '完成希望日', key: 'kibo', type: 'date', span: 9 }],
      [{ label: '施　主', key: 'seshu', span: 12 }, { label: '建築会社', key: 'kensetsu', span: 12 }],
    ] },
    { type: 'grid', rows: [
      [{ label: '依頼種別', span: 7, lw: 7 }, { label: '図面種別', span: 12, lw: 12 }, { label: '枚数', span: 5, lw: 5 }],
      [{ key: 'irai', type: 'radio', options: ['新規', '修正'], span: 7 }, { key: 'zumen', type: 'checks', options: ['総合図', '施工図', '竣工図'], span: 12 }, { key: 'maisu', type: 'number', unit: '枚', span: 5 }],
    ] },
    { type: 'free', label: '工事部依頼内容　［使用データ、作成方法、要望事項］', key: 'naiyo', lines: 12, grow: true },
    { type: 'free', label: '打合せ欄', key: 'uchiawase', lines: 9 },
  ],
};
