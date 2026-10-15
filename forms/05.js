// 届書（元は部長・課長・副長用／一般社員用の2種だったが内容は同じため1本に統合）
(function () {
  const days = (v) => {
    if (!v.from) return '';
    if (!v.to) return 1;
    const d = (new Date(v.to + 'T00:00') - new Date(v.from + 'T00:00')) / 86400000;
    return d >= 0 ? d + 1 : '';
  };
  const person = [
    { label: '社員コード', key: 'empCode', span: 8, lw: 4 },
    { label: '所　属', key: 'dept', span: 16, lw: 3 },
  ];
  FORM_DEFS['05'] = {
    code: '般-05', title: '届　書',
    selfStamp: '印', // 本人欄は氏名横の「印」欄（stampCell）
    meta: [{ label: '提出日', key: 'date', type: 'date' }],
    bottomStamps: ['登録済検印'], // 下部（フッターの上）に置く押印欄
    stamps: [
      { boxes: ['承認', '確認', '確認', '確認'] },
    ],
    blocks: [
      { type: 'para', text: '下記のとおり、お届け致します。' },
      { type: 'grid', rows: [
        [{ label: '該当する項目に\nチェックを入れる', key: 'kinds', type: 'checks', lw: 5, h: 16,
          options: ['休み', '直行', '直帰', '外出', '休暇（年次）', '休暇（特別）', '休暇（振替）', '遅刻', '早退', '出張', '徹夜'] }],
        // 日付・時刻とも「〜」の両側に縦罫線を入れない（daterange）
        [{ label: '日　時', span: 5, rs: 2 },
          { key: 'from', key2: 'to', type: 'daterange', dow: true, span: 15 },
          { key: 'days', type: 'calc', span: 4, unit: '日間', calc: (n, v) => days(v), showZero: true }],
        [{ key: 'tFrom', key2: 'tTo', type: 'daterange', kind: 'time', span: 15 }, { span: 4 }],
        // 工番は1つの欄で自由入力（リストなし）
        [{ label: '行先／連絡先', span: 5, rs: 2 }, { label: '工番', key: 'koban', lw: 2, span: 10 }, { span: 9 }],
        [{ key: 'dest', span: 19, placeholder: '行先・連絡先' }],
        [{ label: '用件／理由', key: 'reason', lw: 5, type: 'textarea', plain: true, h: 22 }],
      ] },
      { type: 'grid', rows: [
        person,
        [{ label: '氏　名', key: 'name', span: 21, lw: 4 }, { stampCell: true, span: 3 }],
      ] },
      { type: 'notes', items: ['（注）この届書は、必ず事前（または事後速やかに）提出すること。'] },
      { type: 'spacer' },
    ],
  };
})();
