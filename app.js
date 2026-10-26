(function(){
  var $ = function(id){ return document.getElementById(id); };
  var FIELDS = ['name','sid','college','major','mobile'];
  var MAILDOMAIN = '@kku.edu.sa';
  var STORE  = 'coopLetter.v3';

  /* بيانات التدريب الثابتة */
  var TERM      = 'الفصل الثاني 1448';
  var TERM_LONG = 'الفصل الدراسي الثاني 1448';
  var END       = '14 ذو الحجة 1448';

  function gender(){
    var r = document.querySelector('input[name=g]:checked');
    return r ? r.value : 'n';
  }
  function who(){
    var g = gender();
    return g === 'm' ? 'الطالب' : (g === 'f' ? 'الطالبة' : 'الطالب/ـة');
  }
  function email(){
    var sid = $('sid').value.trim();
    return sid ? sid + MAILDOMAIN : '';
  }
  function val(id, dflt){ var v = $(id).value.trim(); return v || (dflt || ''); }
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function autofit(){
    /* الورقة المخفية لا مقاس لها، فنعرضها مؤقتاً خارج الشاشة لنقيسها
       (وإلا خرج ملف الجوال المُجهّز في الخلفية بخط أكبر من المعاينة) */
    var wrap = $('stagewrap');
    wrap.classList.add('measuring');
    var c = $('content'), size = 13;
    c.style.fontSize = size + 'pt';
    var guard = 0;
    while (c.scrollHeight > c.clientHeight + 1 && size > 11 && guard++ < 24){
      size -= 0.25;
      c.style.fontSize = size + 'pt';
    }
    wrap.classList.remove('measuring');
  }

  function render(){
    var w = who();

    $('p1').textContent =
      'انطلاقاً من حرص الكلية على الاهتمام بطلابها وطالباتها وصقل مهاراتهم وتنمية قدراتهم، ونظراً لما ' +
      'يمثله التدريب التعاوني من أهمية بالغة في التعرف على إمكانيات ' + w + ' والوصول بها إلى أعلى ' +
      'مستوى. وحيث أننا نتطلع إلى الشراكة معكم ومشاطرتكم عملية البناء والتنمية من خلال برنامج التدريب ' +
      'التعاوني الذي يمثل جزءاً أساسياً من الخطة الدراسية لطلاب وطالبات الكلية التطبيقية لصقل المهارات ' +
      'وتطبيق المعارف النظرية. لذا نأمل تعاونكم معنا بالمشاركة في تدريب ' + w + ':';

    $('v_name').innerHTML  = '<b>الاسم:</b> ' + escapeHtml(val('name'));
    $('v_sid').innerHTML   = '<b>الرقم الجامعي:</b> ' + escapeHtml(val('sid'));
    $('v_major').innerHTML = '<b>التخصص:</b> ' + escapeHtml(val('major'));

    $('v_mobile').innerHTML = '<b>الجوال:</b> ' + escapeHtml(val('mobile'));
    $('v_email').innerHTML  = '<b>البريد الإلكتروني:</b> <span class="mail">' + escapeHtml(email()) + '</span>';
    $('v_college').innerHTML = '<b>الكلية:</b> ' + escapeHtml(val('college'));
    $('emailPreview').textContent = email() || '—';

    var org = val('org');
    $('p_org').innerHTML = org
      ? '<span>السـادة/ ' + escapeHtml(org) + '</span><span class="hon">المحترمين</span>'
      : '<span>إلى من يهمه الأمر</span>';
    $('p_org').classList.toggle('generic', !org);

    $('p_ack_title').textContent = 'إقرار ' + w + ':';
    $('p_ack_text').textContent =
      'أقر بأن مقرر التدريب الميداني مسجل في جدولي الدراسي، وأن جميع البيانات والمعلومات الواردة في هذا الخطاب صحيحة، وأتحمل كامل المسؤولية عن أي بيانات أو معلومات غير صحيحة.';

    $('p2').textContent =
      'وذلك اعتباراً من بداية ' + TERM_LONG + ' وحتى نهاية الفصل بتاريخ ' + END + '، وبما يتناسب مع إمكانياتكم ' +
      'والتخصصات المتوفرة لديكم. ' +
      'شاكرين لكم كريم تعاونكم في تدريب طلاب وطالبات الكلية ومتطلعين إلى دوام التواصل والتعاون بما ' +
      'يخدم المصلحة التعليمية ويحقق أهدافها.';

    autofit();
    save();
  }

  function save(){
    try{
      var o = {g: gender()};
      FIELDS.forEach(function(k){ o[k] = $(k).value; });
      localStorage.setItem(STORE, JSON.stringify(o));
    }catch(e){}
  }
  function load(){
    try{
      var o = JSON.parse(localStorage.getItem(STORE) || 'null');
      if(!o) return;
      FIELDS.forEach(function(k){ if(typeof o[k] === 'string') $(k).value = o[k]; });
      var r = document.querySelector('input[name=g][value="' + (o.g || 'n') + '"]');
      if(r) r.checked = true;
    }catch(e){}
  }
  function fromQuery(){
    try{
      var q = new URLSearchParams(location.search);
      if(!q.toString()) return;
      FIELDS.forEach(function(k){ if(q.has(k)) $(k).value = q.get(k); });
      if(q.has('g')){
        var r = document.querySelector('input[name=g][value="' + q.get('g') + '"]');
        if(r) r.checked = true;
      }
      if(q.get('print') === '1') setTimeout(function(){
        showLetter();
        fit();
        window.print();
      }, 300);
    }catch(e){}
  }

  function fit(){
    var wrap = $('stagewrap'), stage = $('stage'), pg = $('page');
    if (wrap.classList.contains('is-hidden')) return;
    var s = Math.min(1,
      (wrap.clientWidth - 48) / pg.offsetWidth,
      (wrap.clientHeight - 48) / pg.offsetHeight);
    stage.style.transform = 'scale(' + s + ')';
    stage.style.marginBottom = (pg.offsetHeight * (s - 1)) + 'px';
  }

  function showLetter(){
    $('stagewrap').classList.remove('is-hidden');
    $('stagewrap').setAttribute('aria-hidden', 'false');
  }

  function hideLetter(){
    $('stagewrap').classList.add('is-hidden');
    $('stagewrap').setAttribute('aria-hidden', 'true');
  }

  var RULES = [
    {id:'name',   label:'اسم الطالب',
     test:function(v){ var n = v.split(/\s+/).filter(Boolean).length; return n >= 2 && n <= 5; },
      msg:'الاسم الرباعي'},
    {id:'sid',    label:'الرقم الجامعي', test:function(v){ return /^44[0-9]{7}$/.test(v); }, msg:'يجب أن يتكون من 9 أرقام ويبدأ بـ 44'},
    {id:'college', label:'الكلية'},
    {id:'major',  label:'التخصص'},
    {id:'mobile', label:'رقم الجوال',    test:function(v){ return /^05[0-9]{8}$/.test(v); },  msg:'يبدأ بـ 05 ولا يتجاوز 10 أرقام'}
  ];

  function validate(mark){
    var problems = [], first = null;
    RULES.forEach(function(r){
      var el = $(r.id), v = el.value.trim(), bad = false, why = '';
      if (!v){ bad = true; why = 'مطلوب'; }
      else if (r.test && !r.test(v)){ bad = true; why = r.msg; }
      if (mark) el.classList.toggle('err', bad);
      if (bad){
        problems.push(r.label + ' (' + why + ')');
        if (!first) first = el;
      }
    });
    var ackOk = $('ackChk').checked;
    if (mark) $('ackWrap').classList.toggle('err', !ackOk);
    if (!ackOk){
      problems.push('الإقرار (يجب الموافقة عليه)');
      if (!first) first = $('ackChk');
    }

    var box = $('errbox');
    if (mark && problems.length){
      box.innerHTML = 'أكمل الحقول التالية قبل التوليد:<br>• ' + problems.join('<br>• ');
      box.classList.add('show');
    } else if (!problems.length){
      box.classList.remove('show');
      box.innerHTML = '';
    }
    $('pdf').style.opacity = problems.length ? '.75' : '1';
    return {ok: !problems.length, first: first};
  }

  var DIGITS = {sid:9, mobile:10};
  Object.keys(DIGITS).forEach(function(id){
    $(id).addEventListener('input', function(){
      var clean = this.value.replace(/[^0-9]/g, '');
      if (DIGITS[id]) clean = clean.slice(0, DIGITS[id]);
      if (clean !== this.value){
        var atEnd = this.selectionStart === this.value.length;
        this.value = clean;
        if (atEnd) this.selectionStart = this.selectionEnd = clean.length;
      }
    });
  });

  $('f').addEventListener('input', function(){ validate(false); });
  $('f').addEventListener('input', render);
  $('f').addEventListener('change', render);
  $('ackChk').addEventListener('change', function(){
    if (this.checked) $('ackWrap').classList.remove('err');
    validate(false);
  });
  RULES.forEach(function(r){
    var el = $(r.id);
    var clear = function(){
      var v = this.value.trim();
      if (v && (!r.test || r.test(v))) this.classList.remove('err');
      if (this.tagName === 'SELECT') this.classList.toggle('placeholder', !v);
    };
    el.addEventListener('input', clear);
    el.addEventListener('change', clear);
  });
  /* توليد PDF: يُحفظ الملف مباشرة على جهاز المستخدم؛ ونافذة الطباعة احتياط فقط إن تعذر رسم الورقة */
  var PDF_LABEL = $('pdf').textContent;
  function printLetter(){
    requestAnimationFrame(function(){ window.print(); });
  }
  function saveFile(file){
    var a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000);
  }
  $('pdf').addEventListener('click', function(){
    var r = validate(true);
    if (!r.ok){ if (r.first) r.first.focus(); return; }
    showLetter();
    render();
    fit();
    if (typeof html2pdf === 'undefined'){ printLetter(); return; }
    if (pdfCache.key === dataKey() && pdfCache.file){ saveFile(pdfCache.file); return; }
    var btn = $('pdf');
    btn.textContent = 'جاري تجهيز الملف…';
    btn.disabled = true;
    var done = function(){ btn.textContent = PDF_LABEL; btn.disabled = false; };
    prepare().then(function(file){ done(); saveFile(file); }, function(e){
      done();
      if (window.console) console.error('PDF build failed', e);
      alert('تعذر حفظ الملف مباشرة، ستُفتح نافذة الطباعة: اختر «حفظ كـ PDF».\n' + errText(e));
      printLetter();
    });
  });
  /* إرسال الخطاب عبر قائمة المشاركة في الجهاز (البريد) */
  var SHARE_LABEL = $('share').textContent;
  function shareState(label, busy){
    $('share').textContent = label;
    $('share').disabled = !!busy;
  }
  function resetShare(){ shareState(SHARE_LABEL); }

  /* Safari (الآيفون) قد يرسم الورقة بلا الترويسة في أول محاولتين،
     لذلك نعيد الرسم حتى تظهر الترويسة والنص ثم نبني الـ PDF من الصورة الناتجة */
  /* نرسم الورقة بأنفسنا داخل صورة SVG بمقاس A4 تماماً (foreignObject) ثم ننقلها إلى canvas.
     html2pdf يضع الورقة في منتصف الشاشة، وSafari في الكمبيوتر يزيحها فيخرج الملف فارغاً أو مقصوصاً */
  var PAGE_W = 794, PAGE_H = 1122, PAGE_SCALE = 2;
  function pageCss(){
    return [].map.call(document.styleSheets, function(sh){
      try { return [].map.call(sh.cssRules, function(r){ return r.cssText; }).join('\n'); }
      catch(e){ return ''; }
    }).join('\n');
  }
  function renderPage(){
    var wrap = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
    wrap.setAttribute('dir', 'rtl');
    var style = document.createElementNS('http://www.w3.org/1999/xhtml', 'style');
    style.textContent = pageCss();
    wrap.appendChild(style);
    var pg = $('page').cloneNode(true);
    pg.style.boxShadow = 'none';
    pg.style.margin = '0';
    wrap.appendChild(pg);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + PAGE_W + '" height="' + PAGE_H + '">' +
      '<foreignObject x="0" y="0" width="100%" height="100%">' +
      new XMLSerializer().serializeToString(wrap) + '</foreignObject></svg>';
    return new Promise(function(resolve, reject){
      var img = new Image();
      img.onload = function(){
        var c = document.createElement('canvas');
        c.width = PAGE_W * PAGE_SCALE; c.height = PAGE_H * PAGE_SCALE;
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.scale(PAGE_SCALE, PAGE_SCALE);
        /* Safari قد يرسم الصورة قبل اكتمال صور الخلفية، فننتظر قليلاً قبل الرسم */
        setTimeout(function(){
          try { ctx.drawImage(img, 0, 0); resolve(c); } catch(e){ reject(e); }
        }, 50);
      };
      img.onerror = function(){ reject(new Error('svg image failed')); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }
  function inked(c, y){
    var row = c.getContext('2d').getImageData(0, Math.round(c.height * y), c.width, 1).data, n = 0;
    for (var i = 0; i < row.length; i += 4) if (row[i] < 200 && row[i + 3] > 200) n++;
    return n;
  }
  function complete(c){
    /* شريط الزخرفة أعلى الترويسة + نص في منتصف الورقة */
    var body = 0;
    for (var y = 0.3; y < 0.6; y += 0.01) body += inked(c, y);
    var band = Math.max(inked(c, 0.025), inked(c, 0.03), inked(c, 0.035));
    return band > c.width * 0.2 && body > 0;
  }
  function buildPdf(){
    var tries = 0;
    function attempt(){
      return renderPage().then(function(c){
        if (complete(c)) return c;
        if (++tries < 6) return attempt();
        /* لا نُرسل ملفاً فارغاً أبداً */
        var e = new Error('blank page'); e.name = 'BlankPdf'; throw e;
      });
    }
    return attempt().then(function(c){
      return html2pdf().set({
        margin: 0,
        image: {type: 'jpeg', quality: 0.95},
        jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait'}
      }).from(c, 'canvas').outputPdf('blob');
    });
  }

  /* الآيفون لا يفتح قائمة المشاركة إلا بعد نقرة حديثة (ثوانٍ قليلة)، وتوليد الملف يأخذ وقتاً،
     لذلك نجهّز الملف في الخلفية حين تكتمل البيانات فتفتح القائمة فور الضغط على الزر */
  var pdfCache = {};
  function dataKey(){
    return JSON.stringify(FIELDS.map(function(k){ return $(k).value; }).concat(gender(), TERM_LONG, END));
  }
  function prepare(){
    var key = dataKey();
    if (pdfCache.key === key) return pdfCache.promise;
    var entry = {key: key, file: null};
    /* اسم إنجليزي: مشاركة Chrome في ويندوز تُسقط الملفات ذات الأسماء العربية (تصل فارغة باسم no_name) */
    var name = 'Training-Letter-' + val('sid') + '.pdf';
    entry.promise = buildPdf().then(function(blob){
      entry.file = new File([blob], name, {type: 'application/pdf'});
      return entry.file;
    });
    entry.promise.catch(function(){ if (pdfCache === entry) pdfCache = {}; });
    pdfCache = entry;
    return entry.promise;
  }
  var prepTimer = null;
  function schedulePrepare(){
    clearTimeout(prepTimer);
    prepTimer = setTimeout(function(){
      if (isMobile() && typeof html2pdf !== 'undefined' && validate(false).ok) prepare().catch(function(){});
    }, 800);
  }

  function errText(e){ return e ? (e.name || '') + (e.message ? ': ' + e.message : '') : ''; }

  function shareFile(file){
    var data = {
      files: [file],
      title: 'خطاب التدريب التعاوني',
      text: 'خطاب التدريب التعاوني - ' + val('name') + '\nالبريد: ' + email()
    };
    return navigator.share(data).then(resetShare, function(e){
      if (e && e.name === 'AbortError'){ resetShare(); return; }
      if (e && e.name === 'NotAllowedError'){
        /* انتهت مهلة النقرة أثناء التوليد: الملف جاهز الآن ونقرة ثانية تفتح القائمة فوراً */
        shareState('الخطاب جاهز — اضغط للإرسال');
        return;
      }
      resetShare();
      alert('تعذر فتح قائمة المشاركة.\n' + errText(e));
    });
  }

  function openMail(note){
    location.href = 'mailto:' + email() +
      '?subject=' + encodeURIComponent('خطاب التدريب التعاوني') +
      '&body=' + encodeURIComponent('مرفق خطاب التدريب التعاوني.\n(' + note + ')');
  }
  function downloadAndMail(file){
    saveFile(file);
    /* مهلة قصيرة حتى لا يُلغى التنزيل عند فتح برنامج البريد */
    setTimeout(function(){ openMail('أرفق الملف ' + file.name + ' الذي تم تنزيله'); }, 600);
    resetShare();
  }

  /* الكمبيوتر: رسم الورقة داخل الصفحة قد يخرج فارغاً في بعض المتصفحات (والمشاركة تصل إلى Outlook فارغة)،
     لذلك نستخدم نافذة الطباعة (حفظ كـ PDF) ثم نفتح رسالة جاهزة ببريد الطالب والعنوان */
  function printAndMail(){
    showLetter();
    render();
    fit();
    var done = false;
    var after = function(){
      if (done) return;
      done = true;
      window.removeEventListener('afterprint', after);
      openMail('احفظ الخطاب من نافذة الطباعة كـ PDF ثم أرفقه هنا');
    };
    window.addEventListener('afterprint', after);
    requestAnimationFrame(function(){ window.print(); setTimeout(after, 0); });
  }

  /* قائمة المشاركة للجوال فقط: في ويندوز يصل المرفق إلى Outlook فارغاً (no_name)،
     لذلك نُنزّل الملف في الكمبيوتر ونفتح رسالة جاهزة ببريد الطالب والعنوان */
  function isMobile(){
    if (navigator.userAgentData && navigator.userAgentData.mobile) return true;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function send(file){
    if (isMobile() && navigator.canShare && navigator.canShare({files: [file]})) return shareFile(file);
    downloadAndMail(file);
  }

  $('share').addEventListener('click', function(){
    var r = validate(true);
    if (!r.ok){ if (r.first) r.first.focus(); return; }
    if (!isMobile()){ printAndMail(); return; }
    if (typeof html2pdf === 'undefined'){
      alert('تعذر تحميل أداة توليد الملف. تحقق من الاتصال بالإنترنت ثم أعد المحاولة.');
      return;
    }
    showLetter();
    fit();
    /* الملف جاهز مسبقاً: نشارك مباشرة ضمن نفس النقرة */
    if (pdfCache.key === dataKey() && pdfCache.file){ send(pdfCache.file); return; }
    shareState('جاري تجهيز الخطاب…', true);
    prepare().then(send).catch(function(e){
      resetShare();
      alert('تعذر توليد الخطاب. أعد المحاولة أو استخدم زر «توليد PDF».\n' + errText(e));
    });
  });
  $('f').addEventListener('input', function(){ resetShare(); schedulePrepare(); });
  $('f').addEventListener('change', function(){ resetShare(); schedulePrepare(); });

  $('reset').addEventListener('click', function(){
    FIELDS.forEach(function(k){ $(k).value = ''; });
    document.querySelector('input[name=g][value=n]').checked = true;
    $('ackChk').checked = false;
    $('ackWrap').classList.remove('err');
    RULES.forEach(function(r){
      var el = $(r.id);
      el.classList.remove('err');
      if (el.tagName === 'SELECT') el.classList.add('placeholder');
    });
    $('errbox').classList.remove('show');
    hideLetter();
    render();
    validate(false);
    $('name').focus();
  });
  window.addEventListener('resize', fit);

  load();
  fromQuery();
  render();
  validate(false);
  RULES.forEach(function(r){
    var el = $(r.id);
    if (el.tagName === 'SELECT') el.classList.toggle('placeholder', !el.value);
  });
  fit();
  $('name').focus();
})();
