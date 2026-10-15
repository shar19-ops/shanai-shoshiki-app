// 届書（元は部長・課長・副長用／一般社員用の2種だったが内容は同じため1本に統合）
(function () {
  const DOW = '日月火水木金土';
  const dow = (iso) => (iso ? '（' + DOW[new Date(iso + 'T00:00').getDay()] + '）' : '');
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
        [{ label: '日　時', span: 5, rs: 2 },
          { key: 'from', type: 'date', span: 6 }, { key: 'fromDow', type: 'calc', span: 2, align: 'center', calc: (n, v) => dow(v.from) },
          { text: '〜', span: 1, align: 'center' },
          { key: 'to', type: 'date', span: 6 }, { key: 'toDow', type: 'calc', span: 2, align: 'center', calc: (n, v) => dow(v.to) },
          { key: 'days', type: 'calc', span: 2, unit: '日間', calc: (n, v) => days(v), showZero: true }],
        [{ key: 'tFrom', type: 'time', span: 6 }, { text: '〜', span: 3, align: 'center' }, { key: 'tTo', type: 'time', span: 6 }, { span: 4 }],
        [{ label: '行先／連絡先', span: 5, rs: 2 },
          { label: '工番', lw: 2, key: 'kbOffice', type: 'select', span: 5, options: ['010', '020', '030', '040', '050', '060', '080', '090'], align: 'center' },
          { key: 'kbYear', type: 'select', span: 3, options: ['18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'], align: 'center' },
          { key: 'kbSeq', span: 4, align: 'center', placeholder: '連番' },
          { key: 'kbBranch', type: 'select', span: 3, options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], align: 'center' },
          { span: 4 }],
        [{ key: 'dest', span: 19, placeholder: '行先・連絡先' }],
        [{ label: '用件／理由', key: 'reason', lw: 5, type: 'textarea', plain: true, h: 22 }],
      ] },
      { type: 'grid', rows: [
        person,
        [{ label: '役　職', key: 'post', type: 'select', options: ['部長', '課長', '副長'], span: 8, lw: 4 }, { label: '氏　名', key: 'name', span: 13, lw: 3 }, { stampCell: true, span: 3 }],
      ] },
      { type: 'notes', items: ['（注）この届書は、必ず事前（または事後速やかに）提出すること。'] },
      { type: 'spacer' },
    ],
  };
})();
