// 通勤用定期券購入申請書（元のExcelなし。新規に作成した帳票）
// 項目・値は「通勤用定期券購入台帳_v3.xlsm」の入力シートに合わせる（将来、台帳へ転記できるように）
//   発行日=date／社員ＣＤ=empCode／氏名=name／利用区間1=route1（乗車駅）／利用区間2=route2（降車駅）／経由=via
//   期間(ヵ月)=months（1・3・6の数値）／開始日=start／終了日=end（自動）／金額=amount／工番=koban／件名=subject／備考=note
(function () {
  // 終了日＝台帳と同じ EDATE(開始日, 期間) − 1日（月末はその月の末日にそろえる）
  const endDate = (v) => {
    const m = Number(v.months);
    if (!v.start || !m) return '';
    const [y, mo, d] = v.start.split('-').map(Number);
    const last = new Date(y, mo - 1 + m + 1, 0).getDate();
    const e = new Date(y, mo - 1 + m, Math.min(d, last) - 1);
    return `${e.getFullYear()}年 ${e.getMonth() + 1}月 ${e.getDate()}日`;
  };
  FORM_DEFS['53'] = {
    code: '般-53', title: '通勤用定期券購入申請書',
    selfStamp: '申請者', // 本人欄（デート印を押す欄）
    meta: [{ label: '申請日', key: 'date', type: 'date' }],
    stamps: [{ boxes: ['承認', '確認', '確認', '申請者'] }],
    bottomStamps: ['入力検印'], // 台帳への入力済みの確認（承認ルート外なので表の下）
    blocks: [
      { type: 'para', text: '下記のとおり、通勤用定期券の購入を申請します。' },
      // 見出しの幅（4列）と左右の区切り（10列目）を全行でそろえて、縦の罫線を通す
      { type: 'grid', lw: 4, rowH: 12, rows: [
        [{ label: '社員CD', key: 'empCode', span: 10, maxlength: 7, inputmode: 'numeric', placeholder: '7桁の数字' },
          { label: '氏　名', key: 'name', span: 14 }],
        [{ label: '利用区間1\n（乗車駅）', key: 'route1', span: 10 }, { label: '利用区間2\n（降車駅）', key: 'route2', span: 14 }],
        [{ label: '経　由', key: 'via' }],
        [{ label: '期　間', key: 'months', type: 'select', options: [['1', '1カ月'], ['3', '3カ月'], ['6', '6カ月']], span: 10 },
          { label: '金　額', key: 'amount', type: 'money', unit: '円', span: 14 }],
        [{ label: '開始日', key: 'start', type: 'date', span: 10 },
          { label: '終了日', key: 'end', type: 'calc', calc: (n, v) => endDate(v), span: 14 }],
        [{ label: '工　番', key: 'koban', span: 10, maxlength: 12 }, { label: '件　名', key: 'subject', span: 14 }],
      ] },
      { type: 'free', label: '備　考', key: 'note', lines: 6 },
      { type: 'notes', items: ['※ 終了日は、期間と開始日から自動で表示されます。'] },
      { type: 'spacer' },
    ],
  };
})();
