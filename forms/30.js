// 業態調査依頼書
FORM_DEFS['30'] = {
  code: '般-30', title: '業態調査依頼書',
  selfStamp: '発行', // 本人欄（デート印を押す欄）
  meta: [{ label: '作成日', key: 'date', type: 'date' }],
  // 総務部の押印欄は帳票の下（bottomStamps）
  bottomStamps: [{ label: '総務部', boxes: ['確認', '確認'] }],
  stamps: [
    { boxes: ['承認', '確認', '確認', '確認', '発行'] },
  ],
  blocks: [
    { type: 'grid', lw: 5, rows: [
      [{ label: '工　番', key: 'koban', span: 10 }, { label: '件　名', key: 'subject', span: 14, lw: 3 }],
      [{ label: '超特急・普通', key: 'speed', type: 'radio', options: ['超特急', '普通'], span: 12 }, { span: 12 }],
      [{ label: '調査会社名', key: 'company', h: 10 }],
      [{ label: '代表者名', key: 'rep', h: 10 }],
      [{ label: '本社住所', key: 'addr', h: 10 }],
      [{ label: 'TEL番号', key: 'tel', type: 'tel', h: 10, span: 14 }, { span: 10 }],
      [{ label: '摘　要', key: 'tekiyo', h: 10 }],
      [{ label: '受注予定・\n発注予定', key: 'yotei', type: 'radio', options: ['受注予定', '発注予定'], span: 12, h: 10 }, { span: 12 }],
      [{ label: '金　額', key: 'amount', type: 'money', unit: '円', h: 10, span: 14 }, { span: 10 }],
      [{ label: '理　由', key: 'reason', type: 'textarea', lines: 6 }],
      [{ label: '備考\n注意事項', key: 'biko', type: 'textarea', lines: 5 }],
    ] },
    { type: 'spacer' },
  ],
};
