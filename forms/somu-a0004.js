// 本-総務-A0004 新規文書登録依頼（品質記録様式。元Word：本-総務-A0004 新規文書登録依頼.doc、A4縦1ページ）
// 文書作成者が上の欄を書いて総務部へ回し、総務部が文書番号・制定日を書く。押印欄は元の様式どおり各記入欄の右下（日付つき）、作成者にデート印（作成日の欄がないのでデート印の日付は今日）
// 文書種別は1つを選ぶ。下の「文書番号設定基準」は元の様式のままの参考の表（印刷にも出す）
(function () {
  const ZIGYOSHO = ['全：全社', '本：本店', '横：横浜支店', '東：東関東支店', '北：北関東支店', '大：大阪支店', '名：名古屋支店', '仙：仙台支店', '福：福岡支店'];
  const BUSHO_L = ['管本：管理本部', '総務：総務部', '人事：総務部', '経理：経理部', '情報：情報システム部', '業本：業務本部', '安全：安全管理部', '品質：品質保証部', '営推：営業推進部', '予算：予算部', '見積：見積部'];
  const BUSHO_R = ['設計：設計部', '営本：営業本部', '営業：営業部', '開本：開発本部', '開発：開発営業部', '購本：購買本部', '購買：購買部', '資材：資材係', '工本：工事本部', '工事：工事部', '工務：工事部、CAD部'];
  const BUNRUI = ['0：品質文書全般', '7：指針', '8：施工標準', '9：外部文書', '1～6：未使用', 'A～Z：未使用'];
  const RENBAN = ['0001', '～', '9999'];

  // 文書番号設定基準（参考）
  const kijun = { type: 'custom', render: ({ h }) => {
    const part = (t, no) => h('span', { class: 's04-part' }, h('span', { class: 's04-pt' }, t), h('span', { class: 's04-pn' }, no));
    const list = (items, cls) => h('td', { class: 's04-list' + (cls ? ' ' + cls : '') }, ...items.map((t) => h('div', null, t)));
    return h('div', null,
      h('div', { class: 's04-ref' }, '参考（詳細は規定類、標準類を参照すること）'),
      h('table', { class: 'grid s04' }, h('colgroup', null, ...[35, null, null, 34, 22].map((w) => h('col', { style: w ? `width:${w}mm` : null }))),
        h('tbody', null,
          h('tr', null, h('th', { colspan: 5 }, '文書番号設定基準')),
          h('tr', null, h('td', { colspan: 5, class: 's04-rule' },
            h('div', { class: 's04-no' }, part('本', '①'), h('span', { class: 's04-sep' }, '－'), part('○○', '②'), h('span', { class: 's04-sep' }, '－'), part('0', '③'), part('0000', '④')),
            h('div', { class: 's04-note' }, '“－”は全角とする。'))),
          h('tr', null, h('th', null, '①事業所コード'), h('th', { colspan: 2 }, '②主管部署コード'), h('th', null, '③分類コード'), h('th', null, '④一連番号')),
          h('tr', null, list(ZIGYOSHO), list(BUSHO_L), list(BUSHO_R), list(BUNRUI), list(RENBAN, 'center')))));
  } };

  FORM_DEFS['somu-a0004'] = {
    code: '本-総務-A0004', title: '新規文書登録依頼',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    selfStamp: '作成者', // 作成者にデート印
    meta: [],
    stamps: [], // 押印欄は各記入欄の右下（元の様式どおり）
    blocks: [
      { type: 'grid', title: '文書作成者記入欄', lw: 5, rowH: 8, rows: [
        [{ label: '文 書 名', key: 'bunsho', span: 24 }],
        [{ label: '文書種別', key: 'shubetsu', type: 'radio', options: ['第二階層文書', '第三階層文書', '第四階層文書'], nowrap: true, span: 24 }],
        [{ label: '作成部署', key: 'busho', span: 24 }],
      ] },
      { type: 'stamps', align: 'right', groups: [{ boxes: ['作成者'], dates: true }] },
      { type: 'grid', title: '総務部記入欄', lw: 5, rowH: 8, rows: [
        [{ label: '文書番号', key: 'bunshoNo', span: 24 }],
        [{ label: '制 定 日', key: 'seitei', type: 'date', jp: true, span: 24 }],
      ] },
      { type: 'stamps', align: 'right', groups: [{ boxes: ['総務部'], dates: true }] },
      { type: 'spacer' },
      kijun,
    ],
  };
})();
