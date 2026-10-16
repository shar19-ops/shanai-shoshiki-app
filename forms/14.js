// 工料発注承認メモ（A4横）
(function () {
  // 区分データ（元Excelの「区分データ」シート）
  const KUBUN = [
    ['A00', '電線'], ['B00', '電線管'], ['E00', '配線器具'], ['F01', 'レースウエー・モール'], ['F02', 'ケーブルラック'],
    ['F03', 'フロアーダクト'], ['F04', '架空地中線材'], ['F05', 'ハンドホール'], ['F06', '変電設備用資材'], ['F07', '避雷針用資材'],
    ['F09', 'コンクリート材'], ['F10', '耐火処理材'], ['F20', '機器取付用木板'], ['F4X', 'ハンドホール'], ['F50', '材料費'],
    ['FXX', '仮設足場費'], ['G00', '電線管用付属品'], ['H00', '位置ボックス'], ['H01', 'プルボックス'], ['K02', '掘削費'],
    ['K10', 'ケーブル整端費'], ['K16', '高所作業足場費'], ['K18', 'ＡＬＣ開口費'], ['K31', 'Ｄ式管理費'], ['K50', '工料'],
    ['K51', '住戸工料'], ['K53', '土工費'], ['K60', '雑工事費'], ['KXX', 'コンクリート舗装費'], ['L00', '場内運搬費'],
    ['L01', '重量物運搬費'], ['L03', 'バスダクト運搬費'], ['M00', '消耗費'], ['M01', '雑材料'], ['M02', '予備線・接地材'],
    ['O00', '現場経費'], ['O16', '先行工事費'], ['O17', '予備費'], ['O6Y', '労務予備費'], ['O7Y', '検査予備費'],
    ['S00', '接地工事材料'], ['T00', '塗装費'], ['U00', '仮枠材'], ['U01', '天井切込補強費'], ['U03', '天井切込費'],
  ];
  const kubunName = (code) => (KUBUN.find((k) => k[0] === code) || [])[1] || '';
  const ROWS = 7;
  const detail = (key, start) => ({
    type: 'table', key, rows: ROWS, rowNoStart: start, rowH: 7.5,
    columns: [
      { label: '№', key: 'no', w: 8, rowNo: true },
      // 選んだ後はコード（K50 など）だけを表示。区分名は右の列に自動表示
      { label: '区分', key: 'kubun', w: 16, type: 'select', align: 'center', codeOnly: true, options: KUBUN.map((k) => [k[0], `${k[0]} ${k[1]}`]) },
      { label: '区分名', key: 'name', w: 30, align: 'left', rowCalc: (r, v) => kubunName(v[`${key}.${r}.kubun`]) },
      { label: '実行額', key: 'jikko', w: 23, type: 'money' },
      { label: '発注額', key: 'hachu', w: 23, type: 'money' },
    ],
  });
  const sumBoth = (k) => (n) => {
    let s = 0;
    for (let r = 1; r <= ROWS; r++) s += n(`a.${r}.${k}`) + n(`b.${r}.${k}`);
    return s;
  };
  // 代表区分：K50 があれば K50、無ければ1行目の区分
  const daihyo = (n, v) => {
    const codes = [];
    for (let r = 1; r <= ROWS; r++) codes.push(v[`a.${r}.kubun`], v[`b.${r}.kubun`]);
    return codes.includes('K50') ? 'K50' : (v['a.1.kubun'] || '');
  };

  FORM_DEFS['14'] = {
    code: '般-14', title: '工料発注承認メモ', orientation: 'landscape',
    selfStamp: '発行者', // 本人欄（デート印を押す欄）
    meta: [
      { label: '発行日', key: 'date', type: 'date' },
      { label: '注文番号 ※2', key: 'orderNo', w: 40, right: true }, // 発行日と同じ行で押印欄側に寄せる
    ],
    stamps: [{ boxes: ['承認', '確認', '確認', '確認', '発行者'] }],
    blocks: [
      // 1項目＝6列（ラベル3列＋入力3列）を基本単位にそろえる。件名・発注先名・工期は幅広
      { type: 'grid', lw: 3, rows: [
        [{ label: '事業所', key: 'officeCd', type: 'select', options: LISTS.officeCodes, span: 6 }, { label: '工　番', key: 'koban', span: 6 }, { label: '件　名', key: 'subject', span: 12 }],
        [{ label: '発注先CD', key: 'vendorCd', span: 6 }, { label: '発注先名', key: 'vendor', span: 18 }],
        [{ label: '労災保険', key: 'rosai', type: 'select', options: ['0:発注者加入', '1:受注者加入', '2:なし'], span: 6 },
          { label: '見積書工期', key: 'kFrom', key2: 'kTo', type: 'daterange', span: 12 },
          { label: 'インボイス登録番号', key: 'invoice', prefix: 'T', placeholder: '13桁', maxlength: 13, span: 6 }],
        [{ label: '発注方式', key: 'hoshiki', type: 'select', options: ['A', 'B', 'C', 'D', 'E'], align: 'center', span: 6 },
          { label: '雄和会費', key: 'yuwa', type: 'select', options: ['0:徴収', '1:免除'], span: 6 },
          { label: '代表区分 ※1', key: 'daihyo', type: 'calc', align: 'center', calc: daihyo, span: 6 },
          { label: '法定福利費', key: 'fukuri', type: 'money', unit: '円', span: 6 }],
        [{ label: '電気工事', key: 'denki', type: 'calc', calc: sumBoth('hachu'), unit: '円', span: 6 },
          { label: '消費税', key: 'tax', type: 'calc', calc: (n) => Math.floor(sumBoth('hachu')(n) * 0.1), unit: '円', span: 6 },
          { label: '注文金額', key: 'total', type: 'calc', calc: (n) => sumBoth('hachu')(n) + Math.floor(sumBoth('hachu')(n) * 0.1), unit: '円', span: 6 },
          { span: 6 }],
        [{ label: '内訳　現金', key: 'cash', type: 'money', unit: '円', span: 6 },
          { label: '内訳　手形', key: 'tegata', type: 'calc', unit: '円', span: 6, calc: (n, v) => (v.cash ? sumBoth('hachu')(n) - n('cash') : '') },
          { label: 'サイト', key: 'site', type: 'select', options: ['60', '30'], unit: '日（通常60日）', span: 6 },
          { span: 6 }],
      ] },
      { type: 'row', gap: 3, items: [
        { ...detail('a', 1), title: '内訳明細' },
        { ...detail('b', 8), title: '　', foot: [[
          { label: '合　計', span: 3 },
          { key: 'sumJ', type: 'calc', calc: sumBoth('jikko') },
          { key: 'sumH', type: 'calc', calc: sumBoth('hachu') },
        ]] },
      ] },
      { type: 'notes', items: [
        '※1　代表区分は「K50」があるときは「K50」を使用し、なければ内訳明細より1区分選択する。（自動表示）',
        '※2　注文番号は、増減処理を行うときのみ発行者が記入すること。',
      ] },
    ],
  };
})();
