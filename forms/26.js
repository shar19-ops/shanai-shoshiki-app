// 工期・施工部署・工事担当者変更届
FORM_DEFS['26'] = {
  code: '般-26', title: '工期・施工部署・工事担当者変更届',
  selfStamp: '発行', // 本人欄（デート印を押す欄）
  meta: [{ label: '作成日', key: 'date', type: 'date' }],
  bottomStamps: ['登録済検印'], // 下部（フッターの上）に置く押印欄
  stamps: [
    { boxes: ['本店長', '承認\n工事本部長\nRE部長\n支店長', '確認', '発行'] },
  ],
  blocks: [
    { type: 'grid', rows: [
      [{ label: '事業所', key: 'office', type: 'select', options: LISTS.officeCodes, span: 10 }, { span: 14 }],
      [{ label: '工　番', key: 'koban', span: 10 }, { label: '件　名', key: 'subject', span: 14, lw: 3 }],
      [{ label: '得意先', key: 'client', span: 14 }, { label: '契約金額', key: 'amount', type: 'money', unit: '円', span: 10, lw: 3 }],
      [{ label: '工　期', span: 4, rs: 2 }, { label: '変更前', key: 'kBefFrom', type: 'date', lw: 3, span: 10 }, { label: '〜', key: 'kBefTo', type: 'date', lw: 1, span: 10 }],
      [{ label: '変更後', key: 'kAftFrom', type: 'date', lw: 3, span: 10 }, { label: '〜', key: 'kAftTo', type: 'date', lw: 1, span: 10 }],
      [{ label: '工事担当者', span: 4, rs: 2 }, { label: '変更前', span: 3 }, { label: 'コード', key: 'tBefCd', lw: 2, span: 6 }, { label: '氏名', key: 'tBefName', lw: 2, span: 11 }],
      [{ label: '変更後', span: 3 }, { label: 'コード', key: 'tAftCd', lw: 2, span: 6 }, { label: '氏名', key: 'tAftName', lw: 2, span: 11 }],
      [{ label: '部　署', span: 4, rs: 2 }, { label: '変更前', key: 'bBef', lw: 3, span: 20 }],
      [{ label: '変更後', key: 'bAft', lw: 3, span: 20 }],
    ] },
    { type: 'free', label: '変更理由', key: 'reason', lines: 14, grow: true },
    { type: 'grid', rows: [
      [{ label: '備考\n注意事項', span: 4, h: 14 }, { text: '命令書の工期・部署・工事担当者が変更となった場合は速やかに本書類を提出すること。\nまた、契約金額及び実行予算金額の変更の場合は、赤黒の工事命令書を発行すること。', span: 20, note: true }],
    ] },
  ],
};
