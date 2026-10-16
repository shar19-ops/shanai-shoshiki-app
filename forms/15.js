// 積算依頼登録メモ
(function () {
  const C = CODES;
  // 番号付き項目（ラベル左寄せ）
  // 必須記入項目（元Excelの色塗り欄）
  const REQ = new Set(['01','02','03','04','05','06','07','15','16','24','25','45','46','31','35','36','37','38','39','40','41','42','43','44']);
  const it = (no, label, key, o = {}) => ({ label: `${no}. ${label}`, key, span: 12, req: REQ.has(no), ...o });
  const code = (no, label, key, span = 12) => [
    { label: `${no}. ${label}`, key: key + 'Cd', placeholder: 'コード', span: Math.round(span * 0.6), req: REQ.has(no) },
    { key: key + 'Name', placeholder: '名称', span: span - Math.round(span * 0.6) },
  ];

  FORM_DEFS['15'] = {
    code: '般-15', title: '積算依頼登録メモ',
    selfStamp: '発行者', // 本人欄（デート印を押す欄）
    meta: [{ label: '依頼日', key: 'date', type: 'date' }],
    bottomStamps: ['登録済検印'], // 下部（フッターの上）に置く押印欄
    stamps: [{ boxes: ['確認', '確認', '発行者'] }],
    blocks: [
      { type: 'grid', dense: true, lalign: 'left', lw: 5, rows: [
        [{ label: '営業事業所', key: 'office', type: 'select', options: LISTS.officeCodes, span: 8 },
          { label: '見積物件コード', key: 'mitsuCd', span: 8, lw: 4 }, { label: '関連物件コード', key: 'relCd', span: 8, lw: 4 }],
        [{ label: '作業種別', key: 'sagyoShu', type: 'select', options: ['1：新規物件積算', '2：設計変更再積算', '3：一部変更積算'], span: 8 },
          { label: '作業分類', key: 'sagyoBun', suggest: ['1：見積部積算', '2：見積部入力', '3：見積部概算', '9：その他'], span: 8, lw: 3 },
          { label: '見積種別', key: 'mitsuShu', suggest: ['1：本見積', '2：予算見積', '3：合見積', '9：その他'], span: 8, lw: 3 }],
        '■ 物件情報',
        [it('01', '物件名称', 'name', { span: 24, placeholder: '30文字以内', maxlength: 30 })],
        [it('02', '物件略称(ｶﾀｶﾅ)', 'kana', { span: 24, placeholder: '30文字以内', maxlength: 30 })],
        [it('03', '予想工期', 'kFrom', { key2: 'kTo', type: 'daterange', span: 24 })], // 「〜」の両側に罫線なし
        [...code('04', '施工地区', 'area'), it('05', '工事場所', 'place', { placeholder: '漢字・30文字以内' })],
        [...code('06', '積算引合先', 'hikiai'), it('07', '積算引合先窓口', 'madoguchi')],
        [...code('08', '建設会社', 'kensetsu'), ...code('09', '設計事務所', 'sekkei')],
        [...code('10', '施主', 'seshu'), ...code('11', '予想契約先', 'keiyaku')],
        [it('12', '建物用途', 'youto', { suggest: C.youto }), it('13', '主要構造', 'kozo', { suggest: C.kozo })],
        [{ label: '　　階数', span: 5 }, { label: '地上', key: 'fUp', unit: '階', lw: 2, span: 6 }, { label: '地下', key: 'fDown', unit: '階', lw: 2, span: 6 }, { label: '塔屋', key: 'fPh', unit: '階', lw: 2, span: 7 }],
        [{ label: '　　棟数', key: 'tou', unit: '棟', span: 7 }, { label: '住宅戸数', key: 'ko', unit: '戸', lw: 3, span: 6 }, { label: '室数', key: 'shitsu', unit: '室', lw: 2, span: 5 }, { label: '病床数', key: 'byosho', unit: '床', lw: 3, span: 6 }],
        [{ label: '　　延床面積', key: 'menseki', type: 'number', unit: '㎡', span: 12 }, { label: '施工路長', key: 'rocho', type: 'number', unit: '㎞', span: 12 }],
        // 用途(1)〜(4)と面積比率を1行に（4 + 5×4 = 24列）
        [{ label: '　　用途・面積比率', span: 4, lw: 4 }, ...[1, 2, 3, 4].flatMap((i) => [
          { label: `(${i})`, key: 'y' + i, suggest: C.youto, lw: 1, span: 3 }, { key: `y${i}r`, unit: '％', span: 2 }])],
        [it('14', '総工費', 'sokohi', { type: 'money', unit: '円' }), it('15', '予想電気工事費', 'denkihi', { type: 'money', unit: '円' })],
        [it('16', '設備工事識別', 'setsubi', { type: 'select', options: C.setsubi, span: 8 }), it('17', '建築工事識別', 'kenchiku', { type: 'select', options: C.kenchiku, span: 8 }), it('18', '官庁・民間', 'kanmin', { type: 'select', options: C.kanmin, span: 8 })],
        [it('19', 'JV工事識別', 'jv', { type: 'select', options: C.jv, span: 8 }), it('20', '元請・下請', 'motouke', { type: 'select', options: C.motouke, span: 8 }), it('21', '直接契約識別', 'choku', { type: 'select', options: C.chokusetsu, span: 8 })],
        [it('22', 'コストオン識別', 'costOn', { type: 'select', options: C.costOn, span: 8 }), it('23', '物件状況識別', 'bukken', { suggest: C.bukken, span: 8 }), { span: 8 }],
        [...code('24', '営業担当者', 'eigyo'), it('25', '予想受注月度', 'juchuM', { type: 'ym' })],
        [...code('45', '受注担当部署', 'juchuBu'), ...code('46', '施工担当部署', 'sekoBu')],
        [it('26', '備考（物件説明）', 'biko1', { span: 24, placeholder: '上段・30文字以内', maxlength: 30 })],
        [{ label: '', key: 'biko2', span: 24, placeholder: '下段・30文字以内', maxlength: 30 }],
        '■ 提出条件',
        [it('27', '提出日時', 'teishutsuD', { type: 'date', span: 9 }), { key: 'teishutsuT', type: 'time', span: 3 }, it('28', '質疑提出日時', 'shitsugiD', { type: 'date', span: 9 }), { key: 'shitsugiT', type: 'time', span: 3 }],
        [it('29', '入札日時', 'nyusatsuD', { type: 'date', span: 9 }), { key: 'nyusatsuT', type: 'time', span: 3 }, it('30', '概算種別', 'gaisan', { suggest: ['1：積算', '2：数量表示概算', '3：概算', '9：その他'] })],
        [it('31', '提出条件', 'joken', { span: 24, placeholder: 'その他は8文字以内' })],
        [{ label: '32. 積算根拠', key: 'konkyo', type: 'checks', span: 24, options: ['1：設計図', '2：変更指示', '3：質疑応答', '4：見積要領', '5：現場説明', '9：その他'] }],
        [{ label: '33. 提出書類', key: 'shorui', type: 'checks', span: 24, options: ['1：見積書', '2：工程表', '3：組織表', '4：拾出書', '5：外注品見積書', '9：その他'] }],
        '■ 見積書作成条件',
        [it('34', '提出宛先名称', 'atesaki1', { span: 24, placeholder: '上段・30文字以内', maxlength: 30 })],
        [{ label: '', key: 'atesaki2', span: 24, placeholder: '下段・30文字以内', maxlength: 30 }],
        [it('35', '社印識別', 'shain', { type: 'select', options: ['1：本店印', '2：本店長印', '3：社長印', '9：不要'] }), it('36', '見積日付', 'mitsuDate', { type: 'date' })],
        [it('37', '見積有効期限', 'yuko', { suggest: ['1：提出日付より3ヶ月', '2：記載不要'], span: 14 }), { label: '他', key: 'yukoDate', type: 'date', span: 10, lw: 2 }],
        [it('38', '支払条件', 'shiharai', { suggest: ['1：従来通り', '2：御指示通り'], span: 14 }), { label: '他', key: 'shiharaiDate', type: 'date', span: 10, lw: 2 }],
        [it('39', '見積特記事項', 'tokki', { span: 24, suggest: ['1：本見積に消費税は、含まれておりません', '2：なし', '3：その他（下記欄に記入）'] })],
        [it('40', '使用目的', 'mokuteki', { suggest: ['1：提出用', '2：契約用', '9：その他'] }), it('41', '作成期限', 'kigenD', { type: 'date', span: 9 }), { key: 'kigenT', type: 'time', span: 3 }],
        [it('42', '当社用紙識別', 'tosha', { suggest: ['1：電算出力', '2：清書'], span: 8 }), { label: '部数', key: 'toshaBu', unit: '部', lw: 2, span: 4 }, it('43', '指定用紙識別', 'shitei', { suggest: ['1：電算出力', '2：清書'], span: 8 }), { label: '部数', key: 'shiteiBu', unit: '部', lw: 2, span: 4 }],
        [it('44', '作成条件説明', 'setsumei1', { span: 24, placeholder: '上段・30文字以内', maxlength: 30 })],
        [{ label: '', key: 'setsumei2', span: 24, placeholder: '下段・30文字以内', maxlength: 30 }],
      ] },
      { type: 'notes', items: [
        '(注1) コード欄はコード・文字・数字、名称欄は名称を記入（または候補から選択）。見積物件コードは物件情報登録済みの場合のみ。関連物件コードは増築・改修・隣接物件（登録済の場合は記入しない）。',
        '(注2) 色付きの欄は必須記入項目。但し、15，24は物件情報登録済みの場合は記入しない。(注3) 直属上長に内容確認後、登録する事。(注4) 積算依頼書と内容照合し、登録者が保管の事。',
        '(注5) JV(S)はスポンサー、JV(P)はパートナー。(注6) 部署コード＝事業所コード（本店=010、横浜=020、北関東=090…）＋本部コード（営業本部=40、工事本部=20、RE部=70、支店=00）',
      ] },
    ],
  };
})();
