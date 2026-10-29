FORM_DEFS['02'] = {
  code: '般-02', title: '現場案内図・連絡先',
  meta: [
    { label: '作成日', key: 'date', type: 'date' },
    { label: '作成者', key: 'author', w: 40 },
  ],
  blocks: [
    { type: 'grid', rows: [
      [{ label: '工　番', key: 'koban', span: 9 }, { label: '件　名', key: 'subject', span: 15 }],
      [{ label: '現場所在地', key: 'siteAddr', lw: 5 }],
      [{ label: '建築現場\n事務所', span: 5, rs: 3 }, { label: '会社名', key: 'bCompany', lw: 3, span: 19 }],
      [{ label: '所在地', key: 'bAddr', lw: 3, span: 19 }],
      [{ label: 'TEL', key: 'bTel', lw: 3, span: 10, type: 'tel' }, { label: 'FAX', key: 'bFax', lw: 3, span: 9, type: 'tel' }],
      [{ label: '当社現場\n事務所', span: 5, rs: 2 }, { label: '所在地', key: 'oAddr', lw: 3, span: 19 }],
      [{ label: 'TEL', key: 'oTel', lw: 3, span: 10, type: 'tel' }, { label: 'FAX', key: 'oFax', lw: 3, span: 9, type: 'tel' }],
      [{ label: '工事長', key: 'chief', lw: 5, span: 9 }, { label: '作業所長', key: 'manager', lw: 3, span: 7 }, { label: '作業所員', key: 'staff', lw: 3, span: 8 }],
      [{ label: '最寄駅', key: 'station', lw: 5 }],
    ] },
    // 案内図は本-安全-A0006 の略図の欄と同じ：地図の画像を下絵に敷き、文字・矢印・図形を書き込める（修正指示書。以前貼った画像は下絵として引き継ぐ）
    { type: 'sketch', label: '案　内　図', key: 'map', grow: true, hideSyms: ['①', '②', '✖', '♀', '▽'] },
    { type: 'notes', items: [
      '※1　全ての欄を漏れなく記入すること。',
      '※2　所在地は住居表示の住所とすること。（ビル名、階数も忘れずに記入すること。）',
    ] },
  ],
};
