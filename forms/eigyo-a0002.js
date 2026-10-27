// 本-営業-A0002 施工能力確認書（品質記録様式。元Excel：本-営業-A0002施工能力確認書.xlsx、A4縦1ページ）
// 押印欄は右上（元は右下に本部長/支店長・作成者）、右端の作成者にデート印。支店長は本部長の欄を共用
// 納期面・技術面とも、確認のしかた（2つのうち1つ）と判定（施工能力あり／なし）を選ぶ
(function () {
  const SECTIONS = [
    { p: 'n', title: '納期面',
      desc: '納期面について工事管理工程表を用いて注文要求事項を満たす能力があることを確認する。工事管理工程表により確認できない場合は、工事本部長(支店工事部長)との打合せにより確認する。',
      opt1: '工事管理工程表により確認', date1: '工事管理工程表発行日', bullets: ['作業所長を配置できる', '工期を遵守できる'],
      opt2: '工事管理工程表では確認できないので、工事本部長(支店工事部長)との打合せにより確認' },
    { p: 'g', title: '技術面',
      desc: '技術面について工事経歴書、技術者経歴書を用いて注文要求事項を満たす能力があることを確認する。工事経歴書、技術者経歴書により確認できない場合は、工事本部長(支店工事部長)との打合せにより確認する。',
      opt1: '工事経歴書、技術者経歴書により確認', bullets: ['類似物件の施工実績がある', '技術者の資格要件を満たすことができる'],
      opt2: '工事経歴書、技術者経歴書では確認できないので、工事本部長(支店工事部長)との打合せによる確認' },
  ];

  const render = ({ h, field }) => h('div', { class: 'e2-wrap' }, ...SECTIONS.map((s) => {
    const opt = (label) => field({ key: `${s.p}How`, type: 'radio', options: [label] }); // 2つのうち1つ
    const date = (k, label) => h('span', { class: 'e2-date' }, `（${label}：`, h('span', { class: 'e2-dv' }, field({ key: k, type: 'date', jp: true })), '）');
    return h('table', { class: 'grid e2' }, h('tbody', null,
      h('tr', null, h('td', { class: 'lbl left e2-h' }, s.title)),
      h('tr', null, h('td', { class: 'e2-body' },
        h('p', { class: 'e2-desc' }, s.desc),
        h('div', { class: 'e2-opt' }, opt(s.opt1), s.date1 ? date(`${s.p}Date1`, s.date1) : null),
        h('ul', { class: 'e2-bul' }, ...s.bullets.map((b) => h('li', null, b))),
        h('div', { class: 'e2-opt' }, opt(s.opt2)),
        h('div', { class: 'e2-sub' }, date(`${s.p}Date2`, '打合せ日')),
        h('div', { class: 'e2-res' }, h('span', { class: 'e2-rl' }, s.title),
          field({ key: `${s.p}Result`, type: 'radio', options: ['施工能力あり', '施工能力なし'] })))),
    ));
  }));

  FORM_DEFS['eigyo-a0002'] = {
    code: '本-営業-A0002', title: '施工能力確認書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '作成者',
    meta: [],
    stamps: [{ boxes: ['本部長\n支店は支店長', '作成者'] }],
    blocks: [
      { type: 'grid', lw: 4, rowH: 8, rows: [
        [{ label: '物件コード', key: 'bukken', span: 10 }, { label: '件　名', key: 'subject', lw: 3, span: 14 }],
        [{ label: '確認部署', key: 'deptW', type: 'inline', span: 24, parts: [
          '　', { key: 'dept', type: 'radio', options: ['営業本部'] }, '　　　', { key: 'dept', type: 'radio', options: ['支店'] },
          '（', { key: 'shiten', w: 40 }, '）'] }],
      ] },
      { type: 'custom', render },
      { type: 'notes', items: ['※ 該当する項目には、□ にレを記入すること。'] },
    ],
  };
})();
