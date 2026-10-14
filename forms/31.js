// 与信限度額設定申告書（色付きの欄＝申請部署で記入）
(function () {
  const M = { type: 'number', unit: '百万円' };
  FORM_DEFS['31'] = {
    code: '般-31', title: '与信限度額設定申告書',
    meta: [{ label: '作成日', key: 'date', type: 'date' }],
    stamps: [
      { boxes: ['社長', '本店長', '管理本部長', '経理部'] },
      { boxes: ['確認', '確認', '確認', '発行'] },
    ],
    stampClass: 'small',
    blocks: [
      { type: 'grid', dense: true, rows: [
        [{ label: '会社コード', key: 'code', span: 12, req: true }, { span: 12 }],
        [{ label: '取引先\n概況', span: 2, rs: 9, req: true }, { label: '商号', span: 2, rs: 2 }, { label: 'ｶﾅ', key: 'kana', lw: 2, span: 10 }, { label: '創業', key: 'sogyo', placeholder: '年月', lw: 2, span: 4 }, { label: '設立', key: 'setsuritsu', placeholder: '年月', lw: 2, span: 4 }],
        [{ key: 'shogo', span: 12 }, { span: 8 }],
        [{ label: '所在地', span: 2, rs: 4 }, { label: '本店', key: 'honten', lw: 2, span: 10, rs: 2 }, { label: '決算月', key: 'kessan', unit: '月', lw: 2, span: 4 }, { label: '従業員', key: 'jugyoin', unit: '名', lw: 2, span: 3 }, { label: '主力銀行', key: 'bank', lw: 2, span: 3 }],
        [{ label: '資本金', key: 'shihon', ...M, lw: 2, span: 5 }, { label: '売上高', key: 'uriage', ...M, lw: 2, span: 5 }],
        [{ label: '取引する店', key: 'mise', lw: 2, span: 10, rs: 2 }, { label: '売上高の期', key: 'uriageKi', type: 'ym', unit: '期', lw: 3, span: 10 }],
        [{ label: '自己資金', key: 'jiko', ...M, lw: 2, span: 5 }, { label: '当期利益', key: 'rieki', ...M, lw: 2, span: 5 }],
        [{ label: '代表者', key: 'daihyo', lw: 2, span: 12 }, { label: '長・短借入金・割手', key: 'kariire', ...M, lw: 4, span: 8 }],
        [{ label: '最近1年間に発生した経営上の重要事項', span: 22, lw: 22 }],
        [{ key: 'juyo', type: 'textarea', lines: 2, span: 22 }],
        [{ label: '取引する動機・経緯', key: 'doki', type: 'textarea', lines: 3, span: 14, lw: 4, req: true }, { label: '回収条件', key: 'kaishu', type: 'textarea', lines: 3, span: 10, lw: 3, req: true }],
        [{ label: '取引先、同業者、\n仕入先の風評・意見', key: 'fuhyo', type: 'textarea', lines: 2, lw: 4, req: true }],
        [{ label: '申請\n限度額', span: 2, rs: 2, req: true }, { label: '既設限度額', key: 'kisetsu', ...M, lw: 3, span: 7 }, { label: '今回申請限度額', key: 'shinsei', ...M, lw: 4, span: 8 }, { label: '現在の債権残', key: 'saiken', ...M, lw: 3, span: 7 }],
        [{ label: '現在限度額残高', key: 'zandaka', ...M, lw: 3, span: 9 }, { label: '限度額算定の根拠', key: 'konkyo', lw: 4, span: 13 }],
        [{ label: '本部長意見', key: 'honbucho', type: 'textarea', lines: 3, lw: 4, req: true }],
        '■ 以下 経理部・社長記入欄',
        [{ label: '経理部査定', span: 4, rs: 2 }, { label: '賛成・反対', key: 'sansei', type: 'radio', options: ['賛成', '反対'], lw: 3, span: 9 }, { label: '限度額の有効期限', key: 'yukoKigen', type: 'ym', unit: '迄', lw: 4, span: 11 }],
        [{ label: '査定・条件・意見', key: 'satei', type: 'textarea', lines: 2, lw: 3, span: 20 }],
        [{ label: '社長決裁', span: 4 }, { label: '決裁日', key: 'kessaiD', type: 'date', lw: 2, span: 7 }, { label: '金額', key: 'kessaiGaku', ...M, lw: 2, span: 5 }, { label: '条件・意見', key: 'kessaiJoken', lw: 3, span: 8 }],
      ] },
      { type: 'notes', items: ['注）色付きの欄（取引先概況〜本部長意見）を申請部署で記入のこと。会社の業容が分かるもの（会社案内・信用調査・有価証券報告書）を添付すること。'] },
      { type: 'spacer' },
    ],
  };
})();
