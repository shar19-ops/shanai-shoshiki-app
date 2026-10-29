// 本-品質-A0015 是正処置報告書（品質記録様式。元Excel：本ー品質ーA0015 是正処置報告書.xlsx、A4縦1ページ）
// あて先は社内の部署（「○○ 御中」）。不適合事項・是正処置（原因分析・再発防止策）・是正処置実施結果・効果の確認の4つの欄
// 押印欄は元の様式どおり各欄の右下（grid の stamps）。見出しの下に日付（空欄なら「/　　/」）。部署長の欄は2つあるので stampKey で分ける
(function () {
  const sec = (t, span = 2) => ({ text: t, span, cls: 'h15-sec' });
  const ta = (key, lines, span = 1) => ({ key, type: 'textarea', lines, span });
  const st = (boxes, stampKey) => ({ stamps: [{ boxes, dates: true, stampKey }], span: 1 });
  // 押印欄の列は1つ20mm（押印欄の幅）。cols: 2 の表で、左が記述欄
  const box = (n, rows) => ({ type: 'grid', cols: 2, colWidths: [null, `${n * 20}mm`], rows });

  FORM_DEFS['hin-a0015'] = {
    code: '本-品質-A0015', title: '是正処置報告書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    fileIO: true, // 部署と安全品質保証部の間で書き足していくのでファイルに保存
    fileKeys: ['no', 'atesaki'], // ファイル名は「本-品質-A0015_No_部署_日付.json」
    meta: [{ label: '作成日', key: 'sakusei', type: 'date', jp: true }, { label: 'No.', key: 'no', w: 25, right: true }],
    stamps: [], // 押印欄は各欄の右下（元の様式どおり）
    blocks: [
      { type: 'custom', render: ({ h, field }) => h('div', { class: 'h15-to' },
        h('div', { class: 'h15-ate' }, field({ key: 'atesaki', placeholder: '部署名' }), h('span', { class: 'h15-onchu' }, '御中'))) },
      { type: 'para', text: '下記不適合事項（電気設備･工程･品質システム）について是正処置の実施をお願い致します。', style: 'margin:0' },
      { type: 'grid', cols: 3, colWidths: ['31mm', null, '20mm'], rows: [
        [sec('不適合事項', 3)],
        [ta('futekigo', 3, 2), st(['管理責任者'], 'k.')],
        [{ label: '是正処置期限', lw: 1, key: 'kigen', type: 'date', jp: true, span: 3 }],
      ] },
      box(2, [
        [sec('是正処置')],
        [{ text: '　原因分析', span: 2, cls: 'h15-sub' }],
        [ta('genin', 4, 2)],
        [{ text: '　再発防止策', span: 2, cls: 'h15-sub' }],
        [ta('boshi', 4), st(['安全品質|保証部長\n承　認', '部署長'], 'z.')],
      ]),
      box(1, [
        [sec('是正処置実施結果')],
        [ta('kekka', 3), st(['部署長'], 'j.')],
      ]),
      box(1, [
        [sec('効果の確認')],
        [ta('koka', 3), st(['安全品質|保証部長\n保　管'], 'c.')],
      ]),
      { type: 'notes', items: [
        '1.　電気設備及び工程時に安全品質保証部長が承認を行ない、本確認書のコピーを担当本部長（支店は支店長）及び担当部長に配付する。',
        '2.　品質システム時に管理責任者が承認を行なう。',
      ] },
      { type: 'para', text: '保管：安全品質保証部', style: 'text-align:right;font-weight:bold;margin:0' },
    ],
  };
})();
