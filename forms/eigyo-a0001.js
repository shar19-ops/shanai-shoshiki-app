// 本-営業-A0001 契約内容確認書（設計・積算）（品質記録様式。元Excel：本-営業-A0001契約内容確認書.xlsx、A4縦1ページ）
// 押印欄は右上（元は右下に承認者・作成者）、右端の作成者にデート印。表題の「（設計・積算）」は、元は該当する方に〇 → 表題の下で選ぶ
(function () {
  FORM_DEFS['eigyo-a0001'] = {
    code: '本-営業-A0001', title: '契約内容確認書',
    seitei: '99/01/06', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '作成者',
    meta: [{ label: '区　分', key: 'kubun', type: 'radio', options: ['設計', '積算'], nowrap: true, cls: 'noline lg' }],
    stamps: [{ boxes: ['承認者', '作成者'] }],
    blocks: [
      { type: 'grid', lw: 4, rowH: 8, rows: [
        [{ label: '物件コード', key: 'bukken', span: 14 }, { label: '発行回数', key: 'kaisu', type: 'number', unit: '回', align: 'center', lw: 4, span: 10 }],
        [{ label: '件　名', key: 'subject', span: 24 }],
        [{ label: '発行部署', key: 'dept', span: 14 }, { label: '作成者', key: 'author', lw: 4, span: 10 }],
        [{ label: '確認日', key: 'date', type: 'date', span: 14 }, { label: '打　合', key: 'uchiawase', lw: 4, span: 10 }],
        [{ label: '', span: 4 }, { label: '会　社　名', span: 8 }, { label: '部　署', span: 6 }, { label: '氏　名', span: 6 }],
        [{ label: '顧客確認者', span: 4 }, { key: 'cCompany', span: 8 }, { key: 'cDept', span: 6 }, { key: 'cName', span: 6 }],
        [{ label: '添付書類名', key: 'tenpu', type: 'textarea', plain: true, h: 22, span: 24 }],
      ] },
      { type: 'free', label: '確認事項記入欄', key: 'kakunin', lines: 16, grow: true },
      { type: 'notes', items: [
        '1. 保管部署　① 設計依頼の場合 → 設計見積部　② 設計依頼以外の場合 → 営業本部、支店',
        '2. 承認者　　① 設計依頼の場合 → 社内設計：営業本部長、社外設計：本店長　② 設計依頼以外の場合 → 営業本部長、支店長',
        '※ この確認書には以下の事項のみ記入すること。①顧客からの要求事項　②顧客の了解を得られた事項',
      ] },
    ],
  };
})();
