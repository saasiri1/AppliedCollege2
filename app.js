(function(){
  var $ = function(id){ return document.getElementById(id); };
  var FIELDS = ['org','name','sid','sec','college','major','mobile'];
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
    var c = $('content'), size = 14;
    c.style.fontSize = size + 'pt';
    var guard = 0;
    while (c.scrollHeight > c.clientHeight + 1 && size > 11 && guard++ < 24){
      size -= 0.25;
      c.style.fontSize = size + 'pt';
    }
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
    $('v_sec').innerHTML    = '<b>رقم الشعبة:</b> ' + escapeHtml(val('sec'));
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
    {id:'sec',    label:'رقم الشعبة',    test:function(v){ return /^[0-9]{1,8}$/.test(v); },  msg:'أرقام فقط'},
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

  var DIGITS = {sid:9, sec:8, mobile:10};
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
  $('pdf').addEventListener('click', function(){
    var r = validate(true);
    if (!r.ok){ if (r.first) r.first.focus(); return; }
    showLetter();
    render();
    fit();
    requestAnimationFrame(function(){ window.print(); });
  });
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
