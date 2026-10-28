// 本-営業-A0003 顧客要求事項見直し書（品質記録様式。元Excel：本-営業-A0003顧客要求事項見直し書.xlsx、A4縦1ページ）
// 押印欄は右上（元は右下に確認・作成者）、右端の作成者にデート印
// 情報をつぎ足しながら使う帳票なので、入力内容をJSONファイルに保存・読み込みできる（fileIO、ユーザー指定）
(function () {
  const FIXED = { 1: '施工能力確認書', 2: '枝番' }; // 確認書類の決まった行（元の様式のまま）

  FORM_DEFS['eigyo-a0003'] = {
    code: '本-営業-A0003', title: '顧客要求事項見直し書',
    seitei: '02/01/29', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '作成者',
    fileIO: true,
    meta: [],
    stamps: [{ boxes: ['確　認', '作成者'] }],
    blocks: [
      { type: 'grid', lw: 4, rowH: 7.5, rows: [
        [{ label: '物件コード', key: 'bukken', span: 24 }],
        [{ label: '件　名', key: 'subject', span: 24 }],
        [{ label: '発行部署', key: 'dept', span: 14 }, { label: '作成者', key: 'author', lw: 4, span: 10 }],
        [{ label: '確認日', key: 'date', type: 'date', span: 24 }],
        [{ label: '', span: 4 }, { label: '会　社　名', span: 7 }, { label: '部　署', span: 6 }, { label: '氏　名', span: 7 }],
        [{ label: '顧客確認者', span: 4 }, { key: 'cCompany', span: 7 }, { key: 'cDept', span: 6 }, { key: 'cName', span: 7 }],
        [{ label: '添付書類名', key: 'tenpu', type: 'textarea', plain: true, h: 18, span: 24 }],
      ] },
      // 確認書類ごとに、確認したらレ、問題があれば処置を記入
      { type: 'table', key: 'docs', rows: 18, rowH: 7,
        columns: [
          { label: '確　認　書　類', key: 'doc', w: 34, align: 'left', head: (r) => FIXED[r] ?? null },
          { label: '確認', key: 'ok', w: 10, type: 'checks', options: [''], align: 'center' },
          { label: '処　　　　置', key: 'shochi', w: 96 },
        ],
      },
      { type: 'notes', items: [
        '※ この確認書は工事命令書発行前に作成する事',
        '1. 保管部署 → 営業本部、支店　　2. 確認をしたら確認欄にレを記入する事。　　3. 問題がある場合は処置をし、処置欄に記入の事。',
      ] },
    ],
  };
})();
