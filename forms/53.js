// 通勤用定期券購入申請書（元のExcelなし。新規に作成した帳票）
FORM_DEFS['53'] = {
  code: '般-53', title: '通勤用定期券購入申請書',
  selfStamp: '発行', // 本人欄（デート印を押す欄）
  meta: [{ label: '申請日', key: 'date', type: 'date' }],
  stamps: [{ boxes: ['承認', '確認', '確認', '発行'] }],
  blocks: [
    { type: 'para', text: '下記のとおり、通勤用定期券の購入を申請します。' },
    { type: 'grid', lw: 5, rowH: 13, rows: [
      [{ label: '社員CD', key: 'empCode', span: 9 }, { label: '氏　名', key: 'name', span: 15 }],
      [{ label: '利用区間1', key: 'route1', placeholder: '例：〇〇駅 〜 △△駅' }],
      [{ label: '利用区間2', key: 'route2', placeholder: '乗り換えなどで区間が2つある場合' }],
      [{ label: '経　由', key: 'via' }],
      [{ label: '期　間', key: 'months', type: 'select', options: ['1カ月', '3カ月', '6カ月'], span: 12 },
        { label: '開始日', key: 'start', type: 'date', span: 12 }],
      [{ label: '金　額', key: 'amount', type: 'money', unit: '円', span: 12 }, { span: 12 }],
      [{ label: '工　番', key: 'koban', span: 9 }, { label: '件　名', key: 'subject', span: 15 }],
    ] },
    { type: 'free', label: '備　考', key: 'note', lines: 10, grow: true },
  ],
};
