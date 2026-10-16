// 受注報告登録メモ（簡易版）
// 本来の受注登録メモアプリ（juchu-touroku-webapp、別アプリとして継続）は社内共有フォルダの得意先・担当者マスタを読み込むが、
// ここでは読み込まず、コード・名称を手入力する。検印の流れ・添付書類・CSV出力は持たない（紙で回送）。
// 項目・選択肢・計算は受注登録メモアプリの form-fields.js に合わせる。
(function () {
  const C = CODES;
  const it = (no, label, key, o = {}) => ({ label: `${no}. ${label}`, key, span: 12, req: true, ...o });
  // 得意先・担当者：コードと名称を手入力（マスタ検索なし）
  // 縦の罫線をそろえるため、見出しは全行4列、区切りは4列ごと（4・8・12・16・20列目）に置く
  //   2つ並べる行：見出し4＋入力8｜見出し4＋入力8　　3つ並べる行：(見出し4＋入力4)×3
  //   コード欄：見出し4＋コード4＋名称（残り）
  const code = (no, label, key, o = {}) => [
    { label: `${no}. ${label}`, key: key + 'Cd', placeholder: 'コード', span: 8, req: o.req !== false },
    { key: key + 'Name', placeholder: '名称', span: o.span || 16 },
  ];
  const sel = (no, label, key, options, o = {}) => it(no, label, key, { type: 'select', options, span: 8, ...o });
  const three = (label, key, o = {}) => ({ label, key, type: 'number', span: 8, ...o });
  const busho = ['01040：営業本部', '01021：第1工事本部', '01022：第2工事本部', '01023：ＲＥ部', '02000：東関東支店',
    '03000：横浜支店', '04000：大阪支店', '05000：名古屋支店', '06000：仙台支店', '09000：北関東支店'];
  // 38. 小工事実行予算の列（見出し, keyの末尾）
  const COLS = [['材料費\n（F50）', 'Zai'], ['外注費\n（Z50）', 'Gai'], ['工料\n（K50）', 'Kou'], ['経費\n（O00）', 'Kei2']];
  const pct = (a, b) => (a ? Math.floor(((a - b) / a) * 1000) / 10 : null); // 粗利率（小数点第2位切捨て）

  // 03.物件略称(漢字)の入力から04.物件略称(ｶﾀｶﾅ)を自動入力（受注登録メモアプリの bindFuriganaAutoFill を移植）
  // IMEで変換確定前のかな（compositionupdate）を捕まえて全角カタカナにし、04へ追記する。英数字はそのまま追記。
  // 03の末尾を消すと対応する分を04からも消す。04を手で直した後は、04には触れない。
  const isKana = (t) => /^[぀-ゟ゠-ヿー]*$/.test(t || '');
  const isAlnum = (t) => /^[A-Za-z0-9Ａ-Ｚａ-ｚ０-９]+$/.test(t || '');
  const toKatakana = (t) => String(t ?? '').replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
  function bindKana({ inputs, setVal }) {
    const kanji = inputs.nameKanji, kana = inputs.nameKana;
    if (!kanji || !kana) return;
    let composing = '';
    let auto = kana.value || '';
    let segments = []; // { kanjiLen, kana }
    let tracked = kanji.value.length;
    const intact = () => kana.value === auto;
    const apply = () => { kana.value = auto; setVal('nameKana', auto); };
    const push = (len, k) => { segments.push({ kanjiLen: len, kana: k }); tracked += len; auto += k; apply(); };
    const trim = (newLen) => {
      if (!intact()) { tracked = newLen; segments = []; return; }
      while (segments.length && tracked > newLen) {
        const seg = segments.pop();
        tracked -= seg.kanjiLen;
        auto = auto.slice(0, auto.length - seg.kana.length);
      }
      tracked = Math.min(tracked, newLen);
      apply();
    };
    kanji.addEventListener('compositionstart', () => { composing = ''; });
    kanji.addEventListener('compositionupdate', (e) => { if (isKana(e.data)) composing = e.data; });
    kanji.addEventListener('compositionend', () => {
      if (!composing || !intact()) return;
      const added = kanji.value.length - tracked;
      if (added > 0) push(added, toKatakana(composing));
    });
    kanji.addEventListener('input', (e) => {
      const newLen = kanji.value.length;
      if (newLen === 0) {
        segments = []; tracked = 0;
        if (intact()) { auto = ''; apply(); }
        return;
      }
      if (e.isComposing) return; // 変換中はcompositionendで処理
      if (newLen < tracked) { trim(newLen); return; }
      // 英数字の追記だけ04へ反映。貼り付け・途中への挿入などは追跡をやめる
      if (!e.data || !isAlnum(e.data) || newLen !== tracked + e.data.length || !intact()) { tracked = newLen; segments = []; return; }
      push(e.data.length, e.data);
    });
  }

  // 06.施工地区：都道府県・市区町村の候補（forms/data/prefectures.js）から選べるように。
  // 候補を選ぶと、07.工事場所の先頭に名称を入れる（受注登録メモアプリの applyPrefixLink を移植）。
  // 前に入れた名称（placePrefix）だけを差し替え、その後ろに入力した番地などは残す。
  function bindChiku({ inputs, values, setVal }) {
    const chiku = inputs.chiku, place = inputs.place;
    if (!chiku || !place) return;
    const s = document.createElement('script');
    s.src = 'forms/data/prefectures.js';
    s.onload = () => {
      const dl = document.createElement('datalist');
      dl.id = 'dl_chiku';
      window.PREFECTURES.forEach((p) => { const o = document.createElement('option'); o.value = p; dl.append(o); });
      document.body.append(dl);
      chiku.setAttribute('list', 'dl_chiku');
    };
    document.head.append(s);
    let last = '';
    const apply = () => {
      if (chiku.value === last || !window.PREFECTURES || window.PREFECTURES.indexOf(chiku.value) < 0) return; // 候補から選んだ時だけ
      last = chiku.value;
      const name = chiku.value.replace(/^\d+\s/, '');
      const old = values.placePrefix || '';
      const cur = place.value || '';
      const rest = cur === old ? '' : old && cur.startsWith(old) ? cur.slice(old.length) : cur;
      place.value = name + rest;
      setVal('place', place.value);
      setVal('placePrefix', name);
    };
    chiku.addEventListener('input', apply); // 候補を選ぶとすぐ反映
    chiku.addEventListener('change', apply);
    last = chiku.value;
  }

  FORM_DEFS['22'] = {
    code: '般-22', title: '受注報告登録メモ',
    selfStamp: '発行者',
    meta: [{ label: '発行日', key: 'date', type: 'date' }],
    stamps: [{ boxes: ['確認', '確認', '発行者'] }],
    bottomStamps: ['登録済検印'],
    setup: (ctx) => { bindKana(ctx); bindChiku(ctx); },
    blocks: [
      { type: 'grid', dense: true, lalign: 'left', lw: 4, rows: [
        [{ label: '注文区分', key: 'kubun', type: 'select', options: ['1：新規', '2：増額', '3：減額', '4：赤伝/黒伝', '5：工事取消'], span: 12, req: true },
          { label: '施工事業所', key: 'jigyosho', type: 'select', options: LISTS.officeCodes, span: 12, req: true }],
        [{ label: '工事番号', key: 'koban', placeholder: '例：26-0000（新規の時は記入しない）', maxlength: 12, span: 12 },
          { label: '見積番号', key: 'mitsuNo', placeholder: '000-00-00000-00', span: 12 }],
        '■ 基本情報',
        [it('01', '受注計上年月', 'keijoYm', { type: 'ym', span: 8 }), { label: '02. 契約先', key: 'keiyakuCd', placeholder: 'コード', span: 8, req: true }, { key: 'keiyakuName', placeholder: '名称', span: 8 }],
        [it('03', '物件略称(漢字)', 'nameKanji', { span: 24, maxlength: 30, placeholder: '30文字以内' })],
        [it('04', '物件略称(ｶﾀｶﾅ)', 'nameKana', { span: 24, maxlength: 30, placeholder: '03の入力から自動で入ります（変換が不完全な場合は修正してください）' })],
        [it('05', '工期', 'kFrom', { key2: 'kTo', type: 'daterange', span: 24 })],
        [it('06', '施工地区', 'chiku', { span: 16, placeholder: '都道府県・市区町村名の一部を入力 → 候補から選択' }),
          { text: '候補から選ぶと、07の先頭に名称が入ります', note: true, span: 8 }],
        [it('07', '工事場所(漢字)', 'place', { span: 24, maxlength: 30, placeholder: '30文字以内（06で候補を選ぶと先頭に名称が入ります。続きに番地などを入力）' })],
        [sel('08', '推定・確定識別', 'suitei', ['1：確定', '2：推定'], { span: 12 }), sel('09', '注文書類識別', 'chumon', ['1：注文書（契約書含む）', '2：承諾書'], { span: 12 })],
        '■ 金額',
        [it('10', '契約金額', 'keiyakuGaku', { type: 'money', unit: '円' }), it('11', '決定実行金額', 'kettei', { type: 'money', unit: '円', req: false })],
        [it('12', '最終見積金額', 'saishu', { type: 'money', unit: '円' }), it('13', '推定実行金額', 'suiteiGaku', { type: 'money', unit: '円' })],
        [{ label: '　　粗利率', key: 'arari', type: 'calc', unit: '％', dec: 1, calc: (n) => pct(n('keiyakuGaku'), n('suiteiGaku')), span: 12 },
          it('14', '消費税相当額', 'tax', { type: 'calc', unit: '円', labelField: { key: 'taxRate', type: 'number', default: '10', unit2: '％' },
            calc: (n) => Math.floor(n('keiyakuGaku') * n('taxRate') / 100) })],
        '■ 関係者',
        [...code('15', '施主', 'seshu')],
        [...code('16', '設計事務所', 'sekkei', { req: false })],
        [...code('17', '建築会社', 'kenchiku', { req: false })],
        '■ 識別区分',
        [sel('18', '受注識別', 'juchuS', ['1：本工事', '2：追加工事']), sel('19', '納品識別', 'nohin', ['0：通常', '1：納品']), sel('20', '官庁・民間', 'kanmin', C.kanmin)],
        [sel('21', '元請・下請', 'motouke', C.motouke), sel('22', '施主直接契約', 'choku', C.chokusetsu), sel('23', 'JV工事識別', 'jv', C.jv)],
        [sel('24', '計画外識別', 'keikakugai', ['0：通常', '1：計画外']), sel('25', '社内JV識別', 'shanaiJv', ['0：通常', '1：社内JV']), sel('26', '施工方式識別', 'hoshiki', ['0：通常', '1：D式'])],
        [sel('27', '工番採番識別', 'saiban', ['1：営業（通常工番）', '2：工事（通常工番）', '3：RE(7000～)', '4：サービス(8000～)'], { span: 16 }), sel('28', '設備工事識別', 'setsubi', C.setsubi)],
        '■ 建物情報',
        [it('29', '建物用途', 'youto', { type: 'select', options: C.youto }), { label: 'その他', key: 'youtoEtc', span: 12, placeholder: '「99：その他」の場合' }],
        [three('　　住戸戸数', 'ko', { unit: '戸' }), three('室数', 'shitsu', { unit: '室' }), three('病床数', 'byosho', { unit: '床' })],
        '■ 担当者・部署',
        [...code('30', '営業担当者', 'eigyo', { span: 4 }), it('31', '受注担当部署', 'juchuBu', { type: 'select', options: busho })],
        [...code('32', '工事担当者', 'koji', { span: 4 }), it('33', '施工担当部署', 'sekoBu', { type: 'select', options: busho })],
        [it('34', '支払条件', 'shiharai', { type: 'select', options: ['0：通常（出来高払）', '1：特殊'] }), { span: 12 }],
        [three('　　出来高締', 'dekidaka', { unit: '日' }), three('請求締', 'seikyu', { unit: '日' }), three('支払日', 'shiharaiBi', { unit: '日' })],
        [three('　　前渡金', 'maetoki', { unit: '％' }), three('中間払', 'chukan', { unit: '回' }), three('竣工後', 'shunko', { unit: '％' })],
        [three('　　現金', 'genkin', { unit: '％', req: true }),
          three('手形', 'tegata', { type: 'calc', unit: '％', calc: (n, v) => (v.genkin === '' || v.genkin == null ? null : 100 - n('genkin')), showZero: true }),
          { label: 'サイト', key: 'site', type: 'select', options: ['15', '30', '45', '60'], unit: '日', span: 8 }],
        '■ その他',
        [sel('35', '契約方式識別', 'keiyakuHoshiki', ['0：通常', '1：コストオン工事', '2：CM'], { span: 12 }), sel('36', '予算変更', 'yosan', ['1：有り', '2：無し'], { span: 12, req: false })],
        [it('37', '特記事項', 'tokki', { span: 24, maxlength: 30, placeholder: '30文字以内', req: false })],
        // 38. 小工事実行予算：見出し・各金額・合計とも4列（百万の位まで入る）。合計は行ごとに自動計算
        [{ label: '38. 小工事実行予算', span: 4 }, ...[...COLS.map((c) => c[0]), '合　計'].map((l) => ({ label: l, span: 4, lalign: 'center' }))],
        ...[['z', '　　積算金額'], ['j', '　　実行金額']].map(([r, l]) => [{ label: l, span: 4 },
          ...COLS.map((c) => ({ key: r + c[1], type: 'money', span: 4 })),
          { key: r + 'Kei', type: 'calc', span: 4, calc: (n) => COLS.reduce((t, c) => t + n(r + c[1]), 0) }]),
      ] },
      { type: 'notes', items: [
        '(注1) 得意先・担当者はコードと名称を記入（マスタの検索はありません）。色付きの欄は必須記入項目。',
        '(注2) 36. 予算変更は、注文区分 1：新規・5：取消の時は記入しない。38. 小工事実行予算は契約金額500万円以下の時に記入。',
        '(注3) 添付書類（見積書・注文書／承諾書、500万円超は実行予算書・工事経費計算書）は紙で添付すること。',
      ] },
    ],
  };
})();
