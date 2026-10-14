// 請求書作成依頼書
FORM_DEFS['29'] = {
  code: '般-29', title: '請求書作成依頼書',
  selfStamp: '依頼者', // 本人欄（デート印を押す欄）
  meta: [
    { label: '請求月', key: 'month', type: 'ym' },
    { label: '作成日', key: 'date', type: 'date' },
  ],
  stamps: [{ boxes: ['経理部長', '経理部', '工事本部長\nRE部長', '工事部長\n工事長', '工事課長', '依頼者'] }],
  stampClass: 'small',
  blocks: [
    { type: 'grid', lw: 6, rows: [
      [{ label: '工　番', key: 'koban', span: 12 }, { label: '件　名', key: 'subject', span: 12, lw: 4 }],
      [{ label: '請求締切日', key: 'shimekiri', type: 'date', span: 12 }, { label: '請求書記入日付', key: 'kinyu', type: 'date', span: 12 }],
      [{ label: '請求書用紙', key: 'yoshi', type: 'select', options: ['当社用紙', '指定用紙'], span: 12 }, { label: '郵送・持参', key: 'yuso', type: 'select', options: ['郵送', '持参'], span: 12 }],
      [{ label: '工事完了日', key: 'kanryo', type: 'date', span: 12 }, { label: '請求先', key: 'seikyusaki', span: 12 }],
      [{ label: '工事番号', key: 'kojiNo', span: 12 }, { label: '注文書番号', key: 'chumonNo', span: 12 }],
      [{ label: '契約金額', key: 'keiyaku', type: 'money', unit: '円', span: 12 }, { label: '消費税額', key: 'keiyakuTax', type: 'money', unit: '円', span: 12 }],
      [{ label: '累計出来高金額', key: 'ruikei', type: 'money', unit: '円', span: 12 }, { label: '消費税額', key: 'ruikeiTax', type: 'money', unit: '円', span: 12 }],
      [{ label: '前回迄出来高累計額', key: 'zenkai', type: 'money', unit: '円', span: 12 }, { label: '消費税額', key: 'zenkaiTax', type: 'money', unit: '円', span: 12 }],
      [{ label: '前回迄の領収額', key: 'ryoshu', type: 'money', unit: '円', span: 12 }, { label: '消費税額', key: 'ryoshuTax', type: 'money', unit: '円', span: 12 }],
      [{ label: '今回請求額', key: 'konkai', type: 'money', unit: '円', span: 12 }, { label: '今回請求消費税額', key: 'konkaiTax', type: 'money', unit: '円', span: 12 }],
    ] },
    { type: 'free', label: '備考（請求書郵送先）', key: 'biko', lines: 5 },
    { type: 'grid', rows: [
      [{ label: '注　意', span: 3 }, { text: [
        '1．請求明細または、出来高明細等を添付して請求する。得意先に対しては、その原稿をつけること。',
        '2．請求締切日の5日前までに経理部へ必着のこと。（土・日が入った場合7日前迄とする）',
        '3．上記記入欄のうち、得意先によって必要のない欄は記入しないでよい。',
        '4．郵送の時は、備考欄に住所・部署名・相手先を記入のこと。',
        '5．請求先・工事件名は正確に必ず記入すること。［(有)・(株) 等］',
        '6．請求書記入日付欄は記入してほしい希望年月日を記入のこと。（締切日または記載日等）',
        '＊印取帳回送にて承認とする',
      ].join('\n'), note: true, span: 21 }],
    ] },
    { type: 'spacer' },
  ],
};
