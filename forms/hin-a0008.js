// 本-品質-A0008 是正処置要求書・報告書（品質記録様式。元Excel：本ー品質ーA0008 是正処置要求書・報告書.xlsx、A4縦1ページ）
// 内部監査の是正。あて先は社内の部署（「○○ 御中」）。本-品質-A0015 と同じ作り：押印欄は元の様式どおり各欄の右下（grid の stamps）、見出しの下に日付（空欄なら「/　　/」）
//   同じ見出しの欄が複数あるので stampKey で分ける。紙に出力して押印する想定（A0005 と同じ）なのでクリック押印の欄はない
// 結果レベル・是正処置の状況・フォローアップ監査はクリックで選ぶ。記述欄は文字の量に合わせて伸ばす（長文が切れて印刷されないように）
(function () {
  const sec = (t, span = 2) => ({ text: t, span, cls: 'h15-sec' });
  const ta = (key, lines, span = 1) => ({ key, type: 'textarea', lines, span });
  const st = (boxes, stampKey, rs, span = 1) => ({ stamps: [{ boxes, dates: true, stampKey }], span, rs });
  // 押印欄の列は1つ20mm（押印欄の幅）。cols: 2 の表で、左が記述欄
  const box = (n, rows) => ({ type: 'grid', cols: 2, colWidths: [null, `${n * 20}mm`], rows });
  const AREAS = ['futekigo', 'shori', 'genin', 'boshi', 'kekka', 'follow'];
  const HOSHO = '安全品質|保証部長';

  FORM_DEFS['hin-a0008'] = {
    code: '本-品質-A0008', title: '是正処置要求書・報告書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    meta: [],
    sheetClass: 'tight-gap h08', // 欄が多いので、欄の間と押印欄を詰めて1枚に
    stamps: [], // 押印欄は各欄の右下（元の様式どおり）
    setup: ({ inputs }) => AREAS.forEach((key) => {
      const el = inputs[key];
      if (!el) return;
      const min = ShoshikiApp.layoutH(el);
      const grow = () => { el.style.height = '0'; el.style.height = `${Math.max(min, el.scrollHeight)}px`; };
      el.addEventListener('input', grow);
      grow();
    }),
    blocks: [
      { type: 'custom', render: ({ h, field }) => h('div', { class: 'h15-to h08-to' },
        h('div', { class: 'h15-ate' }, field({ key: 'atesaki', placeholder: '部署名' }), h('span', { class: 'h15-onchu' }, '御中')),
        h('div', { class: 'h08-right' }, h('div', { class: 'h08-made' }, h('span', null, '作成日'), h('div', { class: 'h08-date' }, field({ key: 'sakusei', type: 'date', jp: true }))), h('div', { class: 'h08-from' }, '安全品質保証部'))) },
      { type: 'custom', render: ({ h, field }) => h('div', { class: 'h08-lead' }, '下記不適合事項につき、',
        h('div', { class: 'h08-date' }, field({ key: 'kigen', type: 'date', jp: true })), '迄にとられる是正処置の報告をお願いいたします。') },
      box(1, [
        [sec('不適合事項')],
        [ta('futekigo', 3), st(['主任監査員'], 'a.', 2)],
        [{ key: 'levelW', type: 'inline', span: 1, parts: ['結果レベル', { key: 'level', type: 'radio', options: ['Ａ', 'Ｂ', 'Ｃ'], nowrap: true }] }],
      ]),
      box(2, [
        [sec('不適合処理結果')],
        [ta('shori', 3), st([HOSHO, '部署長'], 'b.')],
      ]),
      box(2, [
        [sec('是正処置')],
        [{ text: '　原因分析', span: 2, cls: 'h15-sub' }],
        [ta('genin', 2, 2)],
        [{ text: '　再発防止策', span: 2, cls: 'h15-sub' }],
        [ta('boshi', 3), st([HOSHO, '部署長'], 'c.')],
      ]),
      box(1, [
        [sec('是正処置実施結果')],
        [ta('kekka', 3), st(['部署長'], 'd.')],
      ]),
      { type: 'grid', cols: 3, colWidths: ['38mm', null, '20mm'], rows: [
        [{ label: '是正処置の状況', span: 1 }, { key: 'jokyo', type: 'radio', options: ['良', '不良（→再度是正処置を実施する）'], nowrap: true, span: 1 }, st([HOSHO], 'e.', 2)],
        [{ label: 'フォローアップ監査', span: 1 }, { key: 'followKind', type: 'radio', vertical: true, options: ['１．フォローアップ監査実施', '２．次回監査時', '３．本報告書を以ってフォローアップとする。'], span: 1 }],
      ] },
      box(2, [
        [sec('フォローアップ監査')],
        [ta('follow', 3), st([HOSHO, '主任監査員'], 'f.')],
      ]),
      { type: 'para', text: '保管：安全品質保証部', style: 'text-align:right;font-weight:bold;margin:0' },
    ],
  };
})();
