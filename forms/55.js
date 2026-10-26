// Y-ORDER新規現場申請書（元のExcelなし。新規に作成した帳票）
// 資材発注アプリ Y-ORDER に新しい現場を登録してもらうための申請書
FORM_DEFS['55'] = {
  code: '般-55', title: 'Y-ORDER新規現場申請書',
  selfStamp: '起票者', // 押印欄の右端（起票者）にデート印
  meta: [{ label: '申請日', key: 'date', type: 'date' }],
  stamps: [{ boxes: ['承認', '確認', '確認', '起票者'] }],
  blocks: [
    { type: 'para', text: '下記のとおり、Y-ORDER への新規現場の登録を申請します。' },
    // 見出しは全行4列。工番・件名／担当者・連絡先は10列目で区切ってそろえる（工番は12桁まで入る幅）
    { type: 'grid', lw: 4, rowH: 12, rows: [
      [{ label: '工　番', key: 'koban', span: 10, maxlength: 12 }, { label: '件　名', key: 'subject', span: 14 }],
      [{ label: '現場住所', key: 'siteAddr' }],
      [{ label: '事務所住所', key: 'officeAddr' }],
      [{ label: '担当者', key: 'tanto', span: 10 }, { label: '連絡先', key: 'tel', type: 'tel', span: 14 }],
      [{ label: '工　期', key: 'kFrom', key2: 'kTo', type: 'daterange' }], // 「〜」の両側に罫線なし
    ] },
    { type: 'spacer' },
  ],
};
