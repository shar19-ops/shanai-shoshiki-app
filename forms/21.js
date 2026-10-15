// 積算依頼物件　確認事項
(function () {
  const CK = ['〇', 'レ'];
  const ARI = ['有', '無（入手予定日を備考に記入）'];
  // 項目, 確認事項, 確認欄, 備考 の1行
  const row = (label, key, val, note) => [
    { label, key, span: 15, lw: 6, ...val },
    { key: key + 'Ck', type: 'select', options: CK, align: 'center', span: 2 },
    note || { key: key + 'Note', span: 7 },
  ];
  const zumen = (label, key) => row(label, key, { type: 'select', options: ARI }, { key: key + 'Date', type: 'date', style: 'md', span: 7 });

  FORM_DEFS['21'] = {
    code: '般-21', title: '積算依頼物件　確認事項',
    selfStamp: '営業担当', // 本人欄（デート印を押す欄）
    meta: [{ label: '作成日', key: 'date', type: 'date' }],
    stamps: [{ boxes: ['見積部確認', '営業担当'] }],
    blocks: [
      { type: 'grid', rows: [
        [{ label: '件　名', key: 'subject', span: 14 }, { label: 'ゼネコン', key: 'gc', span: 10 }],
      ] },
      { type: 'grid', dense: true, rowH: 6.5, lalign: 'left', rows: [
        [{ label: '項　目', span: 6 }, { label: '確認事項', span: 9 }, { label: '確認', span: 2 }, { label: '備考', span: 7 }],
        row('1. 官庁・民間識別', 'kanmin', { type: 'select', options: ['官庁', '公団', '民間'] }),
        row('2. 建物構造', 'kozo', { suggest: ['RC', 'SRC', 'S造', 'その他'] }),
        row('　 床', 'yuka', { suggest: ['RC', 'PC', 'ハーフPC', 'オムニア', 'ボイドスラブ'] }),
        row('　 　スラブ厚', 'slab', { type: 'number', unit: '㎜' }, { text: '※スラブ厚確認必要', span: 7, note: true }),
        row('　 　デッキスラブ', 'deck', { type: 'select', options: ['有', '無'] }, { text: '※有の場合は図面必要', span: 7, note: true }),
        row('　 壁', 'kabe', { suggest: ['RC', 'ALC', 'PC', '在来'] }),
        row('　 梁', 'hari', { suggest: ['RC', 'PC（工場）', 'PC（現場）'] }),
        row('3. 二重天井', 'tenjo', { type: 'select', options: ['有', '無', '一部有（水回り）', '天井伏図添付'] }, { text: '※共同住宅の天伏図は必要', span: 7, note: true }),
        row('4. 工事区分　項目', 'kubun', { type: 'select', options: ['有', '無', '図面記載通り'] }),
        row('5. 指定メーカーリスト', 'maker', { type: 'select', options: ['有', '無', '図面記載通り'] }),
        zumen('6. 矩計図', 'kanabakari'),
        zumen('7. 天井伏図', 'tenjofuse'),
        zumen('8. 仕上図', 'shiage'),
        zumen('9. ① 工程表', 'kotei'),
        zumen('　 ② 工期設定チェックリスト', 'kokiCheck'),
        row('　 ③ 休工日', 'kyuko', { suggest: ['4週8閉所', '4週8休', 'その他'] }),
        zumen('10. 防火区画図', 'bouka'),
        row('11. 資材揚重費（パレット共）', 'yoju', { type: 'select', options: ['要', '不要'] }, { text: '（揚重センターの設置の確認）', span: 7, note: true }),
        row('12. 建築タワークレーン', 'crane', { type: 'select', options: ['有', '無'] }, { label: '揚重能力', key: 'craneT', unit: 't', lw: 3, span: 7 }),
        row('13. 事務所スペース', 'jimusho', { type: 'select', options: ['有', '無'] }, { label: '無の場合', key: 'jimushoBasho', type: 'select', options: ['場内', '場外'], lw: 3, span: 7 }),
        row('14. 事務所電気代', 'denki', { type: 'select', options: ['要', '不要'] }),
      ] },
      { type: 'notes', items: ['確認欄：〇・レ を選択。図面類が「無」の場合は、いつもらえるかを備考に記入。'] },
      { type: 'free', label: 'その他確認事項記入欄', key: 'other', lines: 7, grow: true },
    ],
  };
})();
