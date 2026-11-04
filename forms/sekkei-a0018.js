// 本-設計-A0018 設計審査シート（品質記録様式。元Excel：本-設計-A0018 設計審査シート.xlsx、A4縦5ページ＝表紙・設計審査（レビュー）・審査項目）
// 設計担当者が作成、課長・部長が審査・承認（ユーザー指定）：ファイルに保存して BOX の設計部フォルダに置き、Box Drive から開いて上書きする
// 表紙は本-設計-A0012・A0019 と同じ作り。作成者はクリックでデート印（日付は作成日）
// 設備項目は該当する設備の ○ をクリックで ●（空欄の設備は名称を書ける）。審査項目は元の様式どおりの一覧（Ｃ：コスト・Ｇ：グレード審査重点項目）
// 指摘事項の「設計担当CK」「設計課長審査」と確認コメントの押印はクリックで認印（苗字）。合否判定はクリックで選ぶ
(function () {
  const SETSUBI_L = ['電力引込設備', '受変電設備', '発電機設備', '蓄電池設備', '幹線・動力設備', '電灯・コンセント設備', '非常照明・誘導灯設備', '電話設備', 'ＬＡＮ設備', 'テレビ共聴設備', 'ＩＴＶ設備', 'インターホン設備'];
  const SETSUBI_R = ['放送設備', '自動火災報知設備', '避雷設備', '車路管制設備', '航空障害灯設備', '入退室管理設備', '機械警備設備', '中央監視設備', '', '', '', ''];
  // 審査項目：[分野, 項目（「・」で始まるものは前の項目の小項目、「|Ｃ」などは重点項目、「＊」で始まるものは番号なしの説明）]
  const ITEMS = [
    ['共通事項', ['建物種別、建物構造、工法', '内装仕上げ（天井の有無等）|Ｃ', '空調衛生設備のシステム', '配管種別（屋内、屋外）|Ｃ', '配線器具プレートの種別|Ｃ',
      '顧客要求の確認（議事録、仕様書、参考図等）|ＧＣ', '役所との協議内容', '消防署との協議内容', '工事区分の確認（電気、機械、建築、施主）', '空調、衛生、建築との取り合い',
      '建築に依頼する工事内容', '改修工事における工期、工事順序、停電時間等', '改修工事における既存遡及の範囲、内容|Ｃ', '浸水、塩害等の自然災害に対する対策の有無']],
    ['電力引込設備', ['電力会社との協議内容', '引込ルートは施工可能か', 'ハンドホールを適切に設置しているか', '高圧キャビネットについて', '・設置場所、必要寸法の確保', '・24時間、点検可能か',
      '・搬入ルートが確保されているか', '借室、集合住宅用変圧器について', '・設置場所、必要寸法の確保', '・24時間、点検可能か', '・搬入ルートが確保されているか']],
    ['受変電設備', ['設置場所、必要寸法の確保', '単線結線図の構成|ＧＣ', '機器構成、仕様、容量|ＧＣ', '変圧器容量計算書', '不平衡率は基準を満たしているか', '接地線サイズ', '搬入ルートが確保されているか']],
    ['発電機設備', ['設置場所、必要寸法の確保', '機器構成、仕様、容量|ＧＣ', '負荷内容（非常、保安）|ＧＣ', '機器搬入ルートが確保されているか']],
    ['蓄電池設備', ['設置場所、必要寸法の確保', '機器構成、仕様、容量|ＧＣ', '負荷内容|ＧＣ']],
    ['幹線・動力設備', ['配線系統|Ｃ', '1幹線あたりの容量は適切か', '負荷ごとに区分されているか', '施工可能な幹線サイズか|Ｃ', '電圧降下計算書', 'EPS、MBの納まり',
      '動力制御盤の設置場所、納まり、面数、仕様|Ｃ', 'ラック、ダクト、配管の材質は適切か|Ｃ', 'プルボックスの設置場所、個数は適切か',
      'ケーブル支持方法は適切か（本数が10本を超過、もしくは外径の総和が400を超過した場合、ケーブルラックとする）']],
    ['電灯・コンセント設備（非常照明・誘導灯設備含む）', ['照明器具形状、メーカー型番|ＧＣ', '照度計算書', '非常照明、誘導灯の設置基準は適切か', 'スイッチ（リモコン、タンブラ、調光）|Ｃ',
      'コンセント形状、設置基準は適切か|ＧＣ', '電灯分電盤の設置場所、納まり、面数、仕様|Ｃ', '30m以下かつ3直角以下にボックスを設置しているか']],
    ['電話設備', ['電話会社との協議内容', '工事区分（配線、配管、機器）', 'MDFの設置場所、納まり、面数、仕様、接地線|Ｃ', 'IDFの設置場所、納まり、面数、仕様|Ｃ', 'MJ（仕様、口数）']],
    ['ＬＡＮ設備', ['工事区分（配線、配管、機器）', 'MJ（仕様、口数）']],
    ['テレビ共聴設備', ['受信内容', 'アンテナ設置場所', '直列ユニット（仕様、端子数）', '電界強度計算書']],
    ['ＩＴＶ設備', ['システムの確認|ＧＣ', '工事区分（配線、配管、機器）', '機器仕様、設置場所|Ｃ']],
    ['インターホン設備', ['システムの確認|ＧＣ', '機器仕様、設置場所|Ｃ']],
    ['放送設備', ['システムの確認|ＧＣ', '機器仕様、設置場所|Ｃ']],
    ['自動火災報知設備', ['法的要求の確認（省令40号適用等）', '機器仕様、設置場所|Ｃ']],
    ['避雷設備', ['受雷部の保護方法', '高さ20m以上の部分が保護されているか', '引下導線は外周長において、規定の平均間隔以下で設置しているか', '工事区分（引下導線等）']],
    ['車路管制設備', ['システムの確認|ＧＣ', '機器仕様、設置場所|Ｃ']],
    ['航空障害灯設備', ['法的要求の確認（航空局との協議内容等）', '機器仕様、設置場所|Ｃ']],
    ['入退室管理設備', ['システムの確認|ＧＣ', '工事区分（配線、配管、機器）', '機器仕様、設置場所|Ｃ']],
    ['機械警備設備', ['システムの確認|ＧＣ', '工事区分（配線、配管、機器）', '機器仕様、設置場所|Ｃ']],
    ['中央監視設備', ['システムの確認|ＧＣ', '工事区分（配線、配管、機器）', '機器仕様、設置場所|Ｃ']],
    ['その他設備概要', ['＊設備名を列挙し、下記の項目について審査する。', '＊①システムの確認', '＊②メーカー、機器仕様、設置場所', '＊③システム、機器が建物グレード、コストの点に於いて適切か']],
  ];
  // ページごとの分野（元の様式の改ページ：2枚目＝1〜2、3枚目＝3〜8、4枚目＝9〜18、5枚目＝19〜21）
  const PAGE_CATS = [[0, 2], [2, 8], [8, 18], [18, 21]];
  const SHITEKI = 7; // 指摘事項・修正内容の行数

  // 表紙（本-設計-A0012・A0019 と同じ）
  const coverTop = { type: 'custom', render: ({ h, field }) => h('div', { class: 's19-cover' },
    h('div', { class: 's19-koji' }, h('div', { class: 's19-koji-in' }, field({ key: 'koji', align: 'center', placeholder: '工事名' })), h('span', null, '工事')),
    h('div', { class: 's19-title' }, '設 計 審 査 シ ー ト'),
    h('div', { class: 's19-no' }, h('span', null, '設計番号'), h('div', { class: 's19-no-in' }, field({ key: 'sekkeiNo', align: 'center', placeholder: '000-00-00000' })))) };
  const coverBottom = { type: 'custom', render: ({ h, field }) => h('div', { class: 's19-cover' },
    h('div', { class: 's19-date' }, h('span', null, '作　成'), h('div', { class: 's19-date-in' }, field({ key: 'sakusei', type: 'date', jp: true }))),
    h('div', { class: 's19-co' }, '株式会社　雄 電 社　本店　設計部')) };

  // ○ ⇔ ● の切り替え
  const dotBtn = (h, values, setVal, key) => {
    const b = h('button', { type: 'button', class: 's24-dot', title: 'クリックで ○ ⇔ ●' }, values[key] === '1' ? '●' : '○');
    b.addEventListener('click', () => { const on = values[key] !== '1'; setVal(key, on ? '1' : ''); b.textContent = on ? '●' : '○'; });
    return b;
  };

  // 2枚目の上：出席者・審査の観点・設備項目
  const review = { type: 'custom', render: ({ h, field, values, setVal }) => {
    const att = h('div', { class: 's18-att' }, h('span', { class: 's18-att-h' }, '出席者'),
      ...[['設計課長', 'att1'], ['設計担当', 'att2'], ['営業担当', 'att3']].map(([l, key]) => h('span', { class: 's18-att-i' }, h('span', null, l), h('div', null, field({ key })))));
    const legend = h('div', { class: 's18-leg' }, h('div', null, '施工上、利用上、法規制上、コスト上の観点から審査する。'),
      h('div', { class: 's18-leg-r' }, h('div', null, 'Ｃ：コスト審査重点項目'), h('div', null, 'Ｇ：グレード審査重点項目')));
    const cell = (label, key) => [h('td', { class: 's24-d' }, dotBtn(h, values, setVal, key)), label ? h('td', { class: 's24-txt' }, label) : h('td', null, field({ key: `${key}.t` }))];
    const tb = h('tbody', null, h('tr', null, h('th', { colspan: 4, class: 's19-lh' }, '設　備　項　目（該当する設備は●印とする）')));
    SETSUBI_L.forEach((l, i) => tb.append(h('tr', null, ...cell(l, `eq${i + 1}`), ...cell(SETSUBI_R[i], `eq${i + 13}`))));
    return h('div', null, att, legend, h('table', { class: 'grid s24 s18-eq' }, h('colgroup', null, ...[8, null, 8, null].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb));
  } };

  // 審査項目の一覧（分野 from〜to-1）
  const items = (from, to) => ({ type: 'custom', render: ({ h }) => {
    const tb = h('tbody', null, h('tr', null, h('th', { colspan: 3 }, '審　査　項　目'), h('th', null, '重点')));
    ITEMS.slice(from, to).forEach(([cat, list], ci) => {
      tb.append(h('tr', { class: 's18-cat' }, h('td', { class: 's18-cn' }, String(from + ci + 1)), h('td', { colspan: 3 }, cat)));
      let no = 0;
      list.forEach((s) => {
        const [text, mark] = s.split('|');
        const sub = text.startsWith('・'), note = text.startsWith('＊');
        if (!sub && !note) no++;
        tb.append(h('tr', null, h('td'), h('td', { class: 's18-in' }, sub || note ? '' : String(no)),
          h('td', { class: 's18-it' + (sub ? ' sub' : '') }, note ? text.slice(1) : text), h('td', { class: 's18-mk' }, mark || '')));
      });
    });
    return h('table', { class: 'grid s18' }, h('colgroup', null, ...[8, 8, null, 14].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
  } });

  // 最後のページ：指摘事項・合否判定・確認コメント
  const last = { type: 'custom', render: ({ h, field }) => {
    const ink = (key) => h('td', { class: 'in-sm s19-ink' }, field({ key, type: 'inkan' }));
    const shiteki = h('table', { class: 'grid s19 s12s' }, h('colgroup', null, ...[22, null, 20, 20].map((w) => h('col', { style: w ? `width:${w}mm` : null }))),
      h('tbody', null, h('tr', null, h('th', null, '日　付'), h('th', null, '指　摘　事　項　・　修　正　内　容'), h('th', null, '設計担当', h('br'), 'CK'), h('th', null, '設計課長', h('br'), '審査')),
        ...Array.from({ length: SHITEKI }, (_, i) => h('tr', null, h('td', null, field({ key: `s${i + 1}.date`, type: 'date', jp: true, style: 'short' })),
          h('td', null, field({ key: `s${i + 1}.naiyo` })), ink(`s${i + 1}.ck`), ink(`s${i + 1}.shinsa`)))));
    const gohi = h('table', { class: 'grid s19' }, h('colgroup', null, h('col'), h('col', { style: 'width:40mm' })),
      h('tbody', null, h('tr', null, h('th', { class: 's19-lh' }, '設計課長による設計審査合否判定'), h('td', { class: 's12-gohi' }, field({ key: 'gohi', type: 'radio', options: ['合', '否'], nowrap: true, align: 'center' })))));
    const cm = h('table', { class: 'grid s19' }, h('colgroup', null, ...[22, null, 20].map((w) => h('col', { style: w ? `width:${w}mm` : null }))),
      h('tbody', null, h('tr', null, h('th', { colspan: 3, class: 's19-lh' }, '確認コメント記入欄')),
        ...[['設計担当', '内容が網羅されている事を確認した。', 'cm1'], ['設計課長', '審査時に内容が満足されている事を確認した。', 'cm2'], ['設計部長', '上記、承認する。', 'cm3']]
          .map(([who, t, key]) => h('tr', null, h('th', null, who), h('td', { class: 's19-txt' }, t), ink(key)))));
    return h('div', { class: 's12-body' }, h('p', { class: 'para' }, '指摘事項が有る場合、指摘・修正内容を記載し、再度審査を受ける。'), shiteki, gohi, cm);
  } };

  FORM_DEFS['sekkei-a0018'] = {
    code: '本-設計-A0018', title: '設計審査シート',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    selfStamp: '作成者', stampDate: 'sakusei', // 作成者（設計担当責任者）にデート印
    meta: [],
    pages: [
      { subtitle: '（表紙）', stamps: [], blocks: [coverTop,
        { type: 'stamps', align: 'center', groups: [{ boxes: ['承認者\n設計部長', '審査者\n設計課長', '作成者\n設計担当責任者'] }] }, coverBottom, { type: 'spacer' }] },
      ...PAGE_CATS.map(([from, to], i) => ({ subtitle: `（設計審査 ${i + 1}/${PAGE_CATS.length}）`, stamps: [],
        blocks: [...(i === 0 ? [review] : []), items(from, to), ...(i === PAGE_CATS.length - 1 ? [last] : [])] })),
    ],
  };
})();
