// 受注報告登録メモ（簡易版の試作）
// 本来の受注登録メモアプリ（juchu-touroku-webapp）は社内共有フォルダの得意先・担当者マスタを読み込むが、
// ここでは読み込まず、コード・名称を手入力する。検印の流れ・添付書類・CSV出力は持たない（紙で回送）。
(function () {
  const C = CODES;
  const it = (no, label, key, o = {}) => ({ label: `${no}. ${label}`, key, span: 12, req: true, ...o });
  // 得意先・担当者：コードと名称を手入力（マスタ検索なし）
  const code = (no, label, key, o = {}) => [
    { label: `${no}. ${label}`, key: key + 'Cd', placeholder: 'コード', span: 9, req: o.req !== false },
    { key: key + 'Name', placeholder: '名称', span: o.span || 15 },
  ];
  const sel = (no, label, key, options, o = {}) => it(no, label, key, { type: 'select', options, span: 8, ...o });
  const busho = ['01040：営業本部', '01021：第1工事本部', '01022：第2工事本部', '01023：ＲＥ部', '02000：東関東支店',
    '03000：横浜支店', '04000：大阪支店', '05000：名古屋支店', '06000：仙台支店', '09000：北関東支店'];
  const pct = (a, b) => (a ? Math.floor(((a - b) / a) * 1000) / 10 : null); // 粗利率（小数点第2位切捨て）

  FORM_DEFS['22'] = {
    code: '般-22', title: '受注報告登録メモ',
    selfStamp: '発行者',
    meta: [{ label: '発行日', key: 'date', type: 'date' }],
    stamps: [{ boxes: ['確認', '確認', '発行者'] }],
    bottomStamps: ['登録済検印'],
    blocks: [
      { type: 'grid', dense: true, lalign: 'left', lw: 5, rows: [
        [{ label: '注文区分', key: 'kubun', type: 'select', options: ['1：新規', '2：増額', '3：減額', '4：赤伝/黒伝', '5：工事取消'], span: 6, lw: 3, req: true },
          { label: '工事番号', key: 'koban', placeholder: '26-0000', span: 6, lw: 3 },
          { label: '施工事業所', key: 'jigyosho', type: 'select', options: LISTS.officeCodes, span: 6, lw: 3, req: true },
          { label: '見積番号', key: 'mitsuNo', placeholder: '000-00-00000-00', span: 6, lw: 3 }],
        '■ 基本情報',
        [it('01', '受注計上年月', 'keijoYm', { type: 'ym', span: 9 }), { label: '02. 契約先', key: 'keiyakuCd', placeholder: 'コード', span: 7, lw: 3, req: true }, { key: 'keiyakuName', placeholder: '名称', span: 8 }],
        [it('03', '物件略称(漢字)', 'nameKanji', { span: 24, maxlength: 30, placeholder: '30文字以内' })],
        [it('04', '物件略称(ｶﾀｶﾅ)', 'nameKana', { span: 24, maxlength: 30, placeholder: '30文字以内' })],
        [it('05', '工期', 'kFrom', { key2: 'kTo', type: 'daterange', span: 16 }), it('06', '施工地区', 'chiku', { span: 8, lw: 4 })],
        [it('07', '工事場所(漢字)', 'place', { span: 24, maxlength: 30, placeholder: '30文字以内' })],
        [sel('08', '推定・確定識別', 'suitei', ['1：確定', '2：推定'], { span: 12 }), sel('09', '注文書類識別', 'chumon', ['1：注文書（契約書含む）', '2：承諾書'], { span: 12 })],
        '■ 金額',
        [it('10', '契約金額', 'keiyakuGaku', { type: 'money', unit: '円' }), it('11', '決定実行金額', 'kettei', { type: 'money', unit: '円', req: false })],
        [it('12', '最終見積金額', 'saishu', { type: 'money', unit: '円' }), it('13', '推定実行金額', 'suiteiGaku', { type: 'money', unit: '円' })],
        [{ label: '　　粗利率（13）', key: 'arari', type: 'calc', unit: '％', dec: 1, calc: (n) => pct(n('keiyakuGaku'), n('suiteiGaku')), span: 12 },
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
        [sel('27', '工番採番識別', 'saiban', ['1：営業（通常工番）', '2：工事（通常工番）', '3：RE(7000～)', '4：サービス(8000～)']), sel('28', '設備工事識別', 'setsubi', C.setsubi), { span: 8 }],
        '■ 建物情報',
        [it('29', '建物用途', 'youto', { type: 'select', options: C.youto, span: 9 }), { label: 'その他', key: 'youtoEtc', span: 15, lw: 3, placeholder: '「99：その他」の場合' }],
        [{ label: '　　住戸戸数', key: 'ko', type: 'number', unit: '戸', span: 8 }, { label: '室数', key: 'shitsu', type: 'number', unit: '室', span: 8, lw: 3 }, { label: '病床数', key: 'byosho', type: 'number', unit: '床', span: 8, lw: 3 }],
        '■ 担当者・部署',
        [...code('30', '営業担当者', 'eigyo', { span: 5 }), it('31', '受注担当部署', 'juchuBu', { type: 'select', options: busho, span: 10, lw: 4 })],
        [...code('32', '工事担当者', 'koji', { span: 5 }), it('33', '施工担当部署', 'sekoBu', { type: 'select', options: busho, span: 10, lw: 4 })],
        '■ 34. 支払条件',
        [it('34', '支払条件', 'shiharai', { type: 'select', options: ['0：通常（出来高払）', '1：特殊'], span: 12 }), { span: 12 }],
        [{ label: '　　出来高締', key: 'dekidaka', type: 'number', unit: '日', span: 8 }, { label: '請求締', key: 'seikyu', type: 'number', unit: '日', span: 8, lw: 3 }, { label: '支払日', key: 'shiharaiBi', type: 'number', unit: '日', span: 8, lw: 3 }],
        [{ label: '　　前渡金', key: 'maetoki', type: 'number', unit: '％', span: 8 }, { label: '中間払', key: 'chukan', type: 'number', unit: '回', span: 8, lw: 3 }, { label: '竣工後', key: 'shunko', type: 'number', unit: '％', span: 8, lw: 3 }],
        [{ label: '　　現金', key: 'genkin', type: 'number', unit: '％', span: 8, req: true },
          { label: '手形', key: 'tegata', type: 'calc', unit: '％', calc: (n, v) => (v.genkin === '' || v.genkin == null ? null : 100 - n('genkin')), showZero: true, span: 8, lw: 3 },
          { label: 'サイト', key: 'site', type: 'select', options: ['15', '30', '45', '60'], unit: '日', span: 8, lw: 3 }],
        '■ その他',
        [sel('35', '契約方式識別', 'keiyakuHoshiki', ['0：通常', '1：コストオン工事', '2：CM'], { span: 12 }), sel('36', '予算変更', 'yosan', ['1：有り', '2：無し'], { span: 12, req: false })],
        [it('37', '特記事項', 'tokki', { span: 24, maxlength: 30, placeholder: '30文字以内', req: false })],
        [{ label: '38. 小工事実行予算', span: 5, rs: 3 }, { label: '', span: 3 }, ...['材料費（F50）', '外注費（Z50）', '工料（K50）', '経費（O00）'].map((l) => ({ label: l, span: 4, lalign: 'center' }))],
        [{ label: '積算金額', span: 3 }, ...['zZai', 'zGai', 'zKou', 'zKei'].map((k) => ({ key: k, type: 'money', span: 4 }))],
        [{ label: '実行金額', span: 3 }, ...['jZai', 'jGai', 'jKou', 'jKei'].map((k) => ({ key: k, type: 'money', span: 4 }))],
      ] },
      { type: 'notes', items: [
        '(注1) 得意先・担当者はコードと名称を記入（マスタの検索はありません）。色付きの欄は必須記入項目。',
        '(注2) 36. 予算変更は、注文区分 1：新規・5：取消の時は記入しない。38. 小工事実行予算は契約金額500万円以下の時に記入。',
        '(注3) 添付書類（見積書・注文書／承諾書、500万円超は実行予算書・工事経費計算書）は紙で添付すること。',
      ] },
    ],
  };
})();
