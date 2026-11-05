// 本-品質-A0005 内部監査計画・報告書（品質記録様式。元Excel：本ー品質ーA0005 内部監査計画・報告書.xlsx、A4縦1ページ）
// 上が計画（被監査部署〜フォローアップの有無）、下が報告（監査所見と A・B・C の件数）。元の様式どおり1つの表
// 押印欄（安全品証部長・チームリーダー）は元の様式どおりフォローアップと監査所見の右下に1組ずつ（grid の stamps、stampKey で分ける）。見出しの下に日付（空欄なら「/　　/」）
// 記述欄は文字の量に合わせて伸ばす（長文が切れて印刷されないように。最初の高さより低くはしない）
(function () {
  const sec = (t) => ({ text: t, span: 5, cls: 'h15-sec' });
  const ta = (key, lines, span = 5, rs) => ({ key, type: 'textarea', plain: true, lineToggle: false, lines, span, rs });
  const st = (stampKey, rs) => ({ stamps: [{ boxes: ['安全品証部長', 'チームリーダー'], dates: true, stampKey }], span: 2, rs });
  const AREAS = ['mokuteki', 'juten', 'hani', 'schedule', 'followup', 'shoken'];

  FORM_DEFS['hin-a0005'] = {
    code: '本-品質-A0005', title: '内部監査計画・報告書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    meta: [],
    stamps: [], // 押印欄は表の中の右下（元の様式どおり）
    setup: ({ inputs }) => AREAS.forEach((key) => {
      const el = inputs[key];
      if (!el) return;
      const min = el.getBoundingClientRect().height;
      const grow = () => { el.style.height = '0'; el.style.height = `${Math.max(min, el.scrollHeight)}px`; };
      el.addEventListener('input', grow);
      grow();
    }),
    blocks: [
      { type: 'grid', cols: 5, colWidths: ['38mm', null, '30mm', '20mm', '20mm'], rowH: 6.5, rows: [
        [{ label: '被監査部署', key: 'busho', lw: 1, span: 2 }, { label: '監査日', key: 'kansabi', type: 'date', jp: true, lw: 1, span: 3 }],
        [{ label: '被監査部署責任者', key: 'sekinin', lw: 1, span: 2 }, { label: '監査場所', key: 'basho', lw: 1, span: 3 }],
        [{ label: '監査目的', span: 1, rs: 4 }, ta('mokuteki', 3, 1, 4), { label: '監査チーム', key: 'team', lw: 1, span: 3 }],
        [{ label: 'チームリーダー', key: 'leader', lw: 1, span: 3 }],
        [{ label: '監査員', key: 'kansain1', lw: 1, span: 3 }],
        [{ label: '監査員', key: 'kansain2', lw: 1, span: 3 }],
        [sec('監査重点項目')],
        [ta('juten', 4)],
        [sec('監査範囲')],
        [ta('hani', 3)],
        [{ label: '監査基準', key: 'kijun', lw: 1, span: 5 }],
        [sec('監査スケジュール')],
        [ta('schedule', 3)],
        [{ label: 'フォローアップの有無', span: 1 }, ta('followup', 3, 2), st('f.')],
        [sec('監査所見')],
        [ta('shoken', 13, 3), st('s.', 2)],
        [{ key: 'kensuW', type: 'inline', span: 3, parts: ['A：', { key: 'cntA', type: 'number', align: 'center', w: 14 }, '件、　B：', { key: 'cntB', type: 'number', align: 'center', w: 14 }, '件、　C：', { key: 'cntC', type: 'number', align: 'center', w: 14 }, '件'] }],
      ] },
    ],
  };
})();
