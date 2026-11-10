// 作図依頼書（共用・住戸）
// 2026-11-10：事業所・CAD欄を追加、注意書きを修正（JSONファイルをBOXの【現場→CAD】に格納 → CAD部の作図予定表アプリが取り込む）
FORM_DEFS['39'] = {
  code: 'C-01', title: '作図依頼書',
  selfStamp: '依頼者', // 本人欄（デート印を押す欄）
  meta: [
    { label: '区分', key: 'kubun', type: 'checks', options: ['共用', '住戸'], w: 34 },
    { label: '発行日', key: 'date', type: 'date' },
  ],
  stamps: [{ boxes: ['承認\n工事本部長\nRE部長', '支店長', '確認\n工事長\n工事部長', '依頼者'] }],
  blocks: [
    { type: 'notes', items: [
      '【注意事項】　1　期限ごとに1枚ずつ『作図依頼書』を作成してください。　2　CAD部は『作図依頼書』を受け取ってから作図を開始します。',
      '3　作図を依頼した際は CAD部まで必ず連絡し、BOX内の「ＣＡＤ部\\【受渡しフォルダ】\\【現場→CAD】」に、ここで保存したJSONファイル（上の「ファイルに保存」）を格納すること。',
      '4　JSONファイルを格納したら、格納した旨を CAD部へメールで送ること（承認の回送と同時に）。',
    ] },
    { type: 'grid', rows: [
      [{ label: '事業所', key: 'officeCd', type: 'select', options: LISTS.officeCodes, span: 7, lw: 2 }, { label: '工　番', key: 'koban', span: 7, lw: 2 }, { label: '件　名', key: 'subject', span: 10, lw: 2 }],
      [{ label: '担当者', key: 'person', span: 8 }, { label: 'TEL', key: 'tel', type: 'tel', span: 7, lw: 2 }, { label: '完成希望日', key: 'kibo', type: 'date', span: 9 }],
      [{ label: '施　主', key: 'seshu', span: 12 }, { label: '建築会社', key: 'kensetsu', span: 12 }],
    ] },
    { type: 'grid', rows: [
      [{ label: '依頼種別', span: 6, lw: 6 }, { label: '図面種別', span: 10, lw: 10 }, { label: 'CAD', span: 4, lw: 4 }, { label: '枚数', span: 4, lw: 4 }],
      [{ key: 'irai', type: 'radio', options: ['新規', '修正'], span: 6 }, { key: 'zumen', type: 'checks', options: ['総合図', '施工図', '竣工図'], span: 10 },
        { key: 'cad', type: 'select', options: ['T-fas', 'Rebro', 'CADEWA', 'その他'], align: 'center', span: 4 }, { key: 'maisu', type: 'number', unit: '枚', span: 4 }],
    ] },
    { type: 'free', label: '工事部依頼内容　［使用データ、作成方法、要望事項］', key: 'naiyo', lines: 12, grow: true },
    { type: 'free', label: '打合せ欄', key: 'uchiawase', lines: 9 },
  ],
};
