// スパイダープラス閲覧・編集依頼書
(function () {
  const MONTHS = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];
  FORM_DEFS['43'] = {
    code: '般-43', title: 'スパイダープラス閲覧・編集依頼書',
    meta: [{ label: '依頼日', key: 'date', type: 'date' }],
    // 承認ルートと関係ない欄は表の下（bottomStamps）
    bottomStamps: ['追加者'],
    blocks: [
      { type: 'grid', dense: true, lw: 4, rows: [
        [{ label: '工事番号', key: 'koban', span: 12 }, { label: '依頼内容', key: 'irai', type: 'select', options: ['新規', '追加', '消去', '再閲覧'], span: 12 }],
        [{ label: '現場名', key: 'site', h: 9 }],
        [{ label: '現場住所', key: 'addr', h: 9 }],
        [{ label: '所属組織', key: 'org', type: 'select', options: ['第一工事本部', '第二工事本部', 'RE部', '横浜支店', '東関東支店', '北関東支店', '大阪支店', '名古屋支店', '仙台支店'], span: 12 }, { span: 12 }],
        [{ label: '現場担当者', key: 'tanto', span: 12 }, { label: '現場管理者', key: 'kanri', span: 12 }],
        [{ label: '現場メンバー', key: 'members', type: 'textarea', plain: true, lines: 2, placeholder: '例：雄電 太郎・雄電 花子・〇〇 〇〇（外注）' }],
        [{ label: '工　期', key: 'kFrom', key2: 'kTo', type: 'daterange', span: 24 }], // 「〜」の両側に罫線なし
        [{ label: '現場表示期間', key: 'hFrom', key2: 'hTo', type: 'daterange', span: 24 }],
      ] },
      {
        type: 'table', key: 'm', rows: 14, rowH: 6.2, title: 'メンバー',
        columns: [
          { label: 'No', key: 'no', w: 6, rowNo: true },
          { label: 'ログインID', key: 'id', w: 26 },
          { label: '名前', key: 'name', w: 24 },
          { label: 'メールアドレス', key: 'mail', w: 44 },
        ],
      },
      { type: 'grid', dense: true, rows: [
        [{ label: 'パートナー機能\n使用時期と人数\n（今期分）', span: 6, rs: 4 }, ...MONTHS.slice(0, 6).map((m) => ({ label: m, span: 3, lw: 3 }))],
        MONTHS.slice(0, 6).map((m, i) => ({ key: 'p' + i, type: 'number', unit: '人', span: 3 })),
        MONTHS.slice(6).map((m) => ({ label: m, span: 3, lw: 3 })),
        MONTHS.slice(6).map((m, i) => ({ key: 'p' + (i + 6), type: 'number', unit: '人', span: 3 })),
      ] },
      { type: 'notes', items: [
        '※ SPIDER PLUS のID管理は、本店分は工事管理部、支店分は情報システム部で行っています。',
        '※ 本依頼書を工事管理部へメールで提出してください。現場フォルダーを作成し、メンバーのIDの紐づけを行います。',
      ] },
      { type: 'spacer' },
    ],
  };
})();
