(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };

  /* ---------- audio ---------- */
  var ctx = null;
  function getCtx(){
    if(!ctx){ var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null; ctx = new AC(); }
    if(ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function env(g,t,a,d,p){ g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(p,t+a); g.gain.exponentialRampToValueAtTime(.0001,t+a+d); }
  function kick(t,c){ c=c||getCtx(); if(!c)return; var o=c.createOscillator(),g=c.createGain();
    o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(46,t+.12); env(g,t,.002,.3,.9);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t+.34); }
  function snare(t,c){ c=c||getCtx(); if(!c)return; var len=Math.floor(c.sampleRate*.2),buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);
    for(var i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2);
    var n=c.createBufferSource(); n.buffer=buf; var f=c.createBiquadFilter(); f.type="highpass"; f.frequency.value=1500;
    var g=c.createGain(); env(g,t,.001,.16,.45); n.connect(f).connect(g).connect(c.destination); n.start(t);
    var o=c.createOscillator(),g2=c.createGain(); o.type="triangle"; o.frequency.setValueAtTime(185,t); env(g2,t,.001,.09,.22);
    o.connect(g2).connect(c.destination); o.start(t); o.stop(t+.12); }
  function hat(t,open,c){ c=c||getCtx(); if(!c)return; var dur=open?.16:.04,len=Math.floor(c.sampleRate*dur),buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);
    for(var i=0;i<len;i++) d[i]=Math.random()*2-1;
    var n=c.createBufferSource(); n.buffer=buf; var f=c.createBiquadFilter(); f.type="highpass"; f.frequency.value=8000;
    var g=c.createGain(); env(g,t,.001,dur,.2); n.connect(f).connect(g).connect(c.destination); n.start(t); }
  function bass(t,freq,c){ c=c||getCtx(); if(!c)return; var o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();
    o.type="sawtooth"; o.frequency.value=freq||55; f.type="lowpass"; f.frequency.setValueAtTime(440,t); f.frequency.exponentialRampToValueAtTime(130,t+.2);
    env(g,t,.004,.24,.5); o.connect(f).connect(g).connect(c.destination); o.start(t); o.stop(t+.3); }
  function blip(t,freq,c){ c=c||getCtx(); if(!c)return; var o=c.createOscillator(),g=c.createGain(); o.type="square"; o.frequency.value=freq;
    env(g,t,.001,.12,.16); o.connect(g).connect(c.destination); o.start(t); o.stop(t+.14); }
  function pluck(t,freq,c){ c=c||getCtx(); if(!c)return; var o1=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),g2=c.createGain(),f=c.createBiquadFilter();
    o1.type="triangle"; o2.type="sawtooth"; o1.frequency.value=freq; o2.frequency.value=freq*1.003; g2.gain.value=.4;
    f.type="lowpass"; f.frequency.setValueAtTime(Math.min(7000,freq*8),t); f.frequency.exponentialRampToValueAtTime(Math.max(400,freq*2),t+.25);
    env(g,t,.004,.36,.2); o1.connect(g); o2.connect(g2).connect(g); g.connect(c.destination);
    o1.start(t); o2.start(t); o1.stop(t+.42); o2.stop(t+.42); }
  function chime(){ var c=getCtx(); if(!c)return; var t=c.currentTime; [392,523,659,784].forEach(function(f,i){ blip(t+i*.07,f); }); }
  function playMotif(steps,root){ var c=getCtx(); if(!c)return; root=root||220; steps.forEach(function(semi,i){
    var f=root*Math.pow(2,semi/12),t=c.currentTime+i*.16,o=c.createOscillator(),g=c.createGain(); o.type="triangle"; o.frequency.value=f;
    env(g,t,.004,.18,.22); o.connect(g).connect(c.destination); o.start(t); o.stop(t+.2); if(i%2===0) kick(t); }); }

  var LANES=["kick","snare","hat","bass"], LABELS={kick:"KICK",snare:"SNARE",hat:"HAT",bass:"BASS"}, STEPS=16;
  var BASSNOTES=[55,55,73,55,55,55,82,55,49,49,65,49,55,55,73,82];
  function trigger(lane,t,step,c){ if(lane==="kick")kick(t,c); else if(lane==="snare")snare(t,c); else if(lane==="hat")hat(t,false,c); else bass(t,BASSNOTES[step],c); }

  function Sequencer(getGrid,getBpm,onStep,getRoll){ this.getGrid=getGrid; this.getBpm=getBpm; this.onStep=onStep; this.getRoll=getRoll||null; this.playing=false; this.timer=null; this.step=0; this.nextTime=0; }
  Sequencer.prototype.start=function(){ var c=getCtx(); if(!c||this.playing)return; var self=this; this.playing=true; this.step=0; this.nextTime=c.currentTime+.06; this.timer=setInterval(function(){self.tick();},25); };
  Sequencer.prototype.stop=function(){ this.playing=false; if(this.timer)clearInterval(this.timer); this.timer=null; };
  Sequencer.prototype.tick=function(){ var c=getCtx(); if(!c)return; var ahead=.1, stepDur=60/this.getBpm()/4, grid=this.getGrid(), roll=this.getRoll?this.getRoll():null, self=this;
    while(this.nextTime < c.currentTime+ahead){ var s=this.step;
      LANES.forEach(function(lane){ if(grid[lane][s]) trigger(lane,self.nextTime,s); });
      if(roll){ for(var r=0;r<roll.length;r++){ if(roll[r][s]) pluck(self.nextTime, ROLL_FREQS[r]); } }
      var when=Math.max(0,(this.nextTime-c.currentTime)*1000), fire=s;
      setTimeout(function(){ if(self.playing) self.onStep(fire); }, when);
      this.nextTime+=stepDur; this.step=(this.step+1)%STEPS; } };
  function emptyGrid(){ return {kick:Array(STEPS).fill(false),snare:Array(STEPS).fill(false),hat:Array(STEPS).fill(false),bass:Array(STEPS).fill(false)}; }
  function starterGrid(){ return {
    kick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0].map(Boolean),
    snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0].map(Boolean),
    hat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0].map(Boolean),
    bass:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0].map(Boolean) }; }

  /* piano roll: C3 (low) .. B4 (high), rows ordered HIGH -> LOW */
  var NOTE_NAMES=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"], ROLL_LO=48, ROLL_HI=71;
  var ROLL_ROWS=[], ROLL_FREQS=[];
  for(var _m=ROLL_HI;_m>=ROLL_LO;_m--){ var _nm=NOTE_NAMES[_m%12]; ROLL_ROWS.push({label:_nm+(Math.floor(_m/12)-1),black:_nm.indexOf("#")>=0}); ROLL_FREQS.push(440*Math.pow(2,(_m-69)/12)); }
  function emptyRoll(){ return ROLL_ROWS.map(function(){ return Array(STEPS).fill(false); }); }
  function starterRoll(){ var g=emptyRoll(); function put(midi,step){ var row=ROLL_HI-midi; if(row>=0&&row<g.length)g[row][step]=true; }
    put(57,0); put(60,4); put(64,8); put(62,10); put(60,12); put(57,14); return g; }

  /* ---------- state ---------- */
  var ST = { scene:"enter", values:[], beatMade:false, gemFound:false, merchFound:false,
    emailCaptured:false, email:"", lastScore:0, best:0, bedroomKeyFound:false,
    mixes:[ {id:"rooftop",t:"Dat Thang (Live Edit)",s:"HOUSE · 124",src:"your beat",motif:[0,4,7,12,7,4],unlocked:false},
            {id:"crate",t:"Motion Is Faith (Dub)",s:"TECHNO · 128",src:"the crate gem",motif:[0,3,7,10,7,3],unlocked:false} ],
    digIdx:0 };
  var RECORDS=[
    {t:"DAT THANG",s:"KC · 2026",gem:false,sp:"https://album.link/i/1888990994",
      art:"https://www.killscomfort.com/_next/image?url=https%3A%2F%2Fis1-ssl.mzstatic.com%2Fimage%2Fthumb%2FMusic211%2Fv4%2Fd8%2Fa9%2F6c%2Fd8a96c9d-17c7-42bc-7405-842db6dc4717%2Fartwork.jpg%2F1000x1000bb.jpg&w=640&q=80",
      preview:"https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d7/ce/c9/d7cec90f-b1dd-34ba-21c7-45c6299e501d/mzaf_5446410421613724799.plus.aac.p.m4a"},
    {t:"MOTION IS FAITH",s:"KC · 2026",gem:true,sp:"https://album.link/i/1874702610",
      art:"https://www.killscomfort.com/_next/image?url=https%3A%2F%2Fis1-ssl.mzstatic.com%2Fimage%2Fthumb%2FMusic211%2Fv4%2Fee%2F27%2F18%2Fee271829-c074-a332-c9a5-97ef544d21c5%2Fartwork.jpg%2F1000x1000bb.jpg&w=640&q=80",
      preview:"https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/41/bf/fb/41bffbbc-74c0-6622-fca9-fda9653bc105/mzaf_16424072541100210585.plus.aac.p.m4a"},
    {t:"GOOD OL RUB",s:"KC · 2025",gem:false,sp:"https://album.link/i/1845773988",
      art:"https://www.killscomfort.com/_next/image?url=https%3A%2F%2Fis1-ssl.mzstatic.com%2Fimage%2Fthumb%2FMusic211%2Fv4%2F50%2Ffa%2Fc6%2F50fac600-a9d3-6037-0567-f3c0f10d970f%2Fartwork.jpg%2F1000x1000bb.jpg&w=640&q=80",
      preview:"https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/83/cb/e7/83cbe798-e504-70c0-c540-d556bcc0c57e/mzaf_592846234758439.plus.aac.p.m4a"},
    {t:"MAN AS MACHINE",s:"KC · 2024",gem:false,sp:"https://album.link/i/1783458640",
      art:"https://www.killscomfort.com/_next/image?url=https%3A%2F%2Fis1-ssl.mzstatic.com%2Fimage%2Fthumb%2FMusic211%2Fv4%2Ff1%2F65%2Fe0%2Ff165e014-41cf-9ee8-6266-29a9c3fdb534%2Fartwork.jpg%2F1000x1000bb.jpg&w=640&q=80",
      preview:"https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a0/45/8a/a0458a2c-28fe-6365-894e-2b13165fd66d/mzaf_13017840132552697855.plus.aac.p.m4a"},
    {t:"HOMOLOGATION",s:"KC · 2024",gem:false,sp:"https://album.link/i/1766590615",
      art:"https://www.killscomfort.com/_next/image?url=https%3A%2F%2Fis1-ssl.mzstatic.com%2Fimage%2Fthumb%2FMusic221%2Fv4%2F22%2F39%2Fca%2F2239cab0-292a-faf8-a152-5e37fe71e28d%2Fartwork.jpg%2F1000x1000bb.jpg&w=640&q=80",
      preview:"https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/be/7c/44/be7c4434-0315-187e-097c-8fb7d70f7a1f/mzaf_2884327996418119601.plus.aac.p.m4a"},
    {t:"SUPERVISOR",s:"KC · 2024",gem:false,sp:"https://album.link/i/1762103358",
      art:"https://www.killscomfort.com/_next/image?url=https%3A%2F%2Fis1-ssl.mzstatic.com%2Fimage%2Fthumb%2FMusic211%2Fv4%2F3a%2F3e%2F52%2F3a3e52bf-ae9e-c922-1aab-92f51cfb05c2%2Fartwork.jpg%2F1000x1000bb.jpg&w=640&q=80",
      preview:"https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b0/d2/2f/b0d22f12-4c57-1bf0-369b-1507f9f93830/mzaf_7685293742251392411.plus.aac.p.m4a"},
    {t:"OPERATOR",s:"KC · 2024",gem:false,sp:"https://album.link/i/1758625943",
      art:"https://www.killscomfort.com/_next/image?url=https%3A%2F%2Fis1-ssl.mzstatic.com%2Fimage%2Fthumb%2FMusic211%2Fv4%2Fa4%2F16%2F42%2Fa416426c-c47d-744b-99dd-ce12b776361c%2Fartwork.jpg%2F1000x1000bb.jpg&w=640&q=80",
      preview:"https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/96/d1/3f/96d13f3a-a7f5-3805-a448-5d069e93c63a/mzaf_4098659183663401454.plus.aac.p.m4a"},
    {t:"4 12",s:"KC · 2024",gem:false,sp:"https://album.link/i/1746836681",
      art:"https://www.killscomfort.com/_next/image?url=https%3A%2F%2Fis1-ssl.mzstatic.com%2Fimage%2Fthumb%2FMusic221%2Fv4%2F2e%2F9f%2F38%2F2e9f3866-25b8-a702-eeec-8e0067914172%2Fartwork.jpg%2F1000x1000bb.jpg&w=640&q=80",
      preview:"https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/74/dd/fe/74ddfeb0-bac3-89c7-be36-ddee9f298365/mzaf_14281175054035891465.plus.aac.p.m4a"},
    {t:"CHUPABIEN.WAV",s:"KC · 2024",gem:false,sp:"https://album.link/i/1730416415",
      art:"https://www.killscomfort.com/_next/image?url=https%3A%2F%2Fis1-ssl.mzstatic.com%2Fimage%2Fthumb%2FMusic126%2Fv4%2F95%2F3b%2Fab%2F953babba-7c8c-8b5d-7513-ca6c4b0229c9%2Fartwork.jpg%2F1000x1000bb.jpg&w=640&q=80",
      preview:"https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/f8/93/2f/f8932fce-5795-f6ae-83a9-219e356fef6a/mzaf_187924517099601971.plus.aac.p.m4a"} ];
  var WALL=[ {by:"KILLSCOMFORT",p:"Comfort is where momentum goes to die. Ride anyway."},
    {by:"@ANDREA_M",p:"First time DJing sober. Terrifying. Did it."},
    {by:"@LOTELEVEN",p:"Quit the job that paid more. Building the thing that pays in meaning."},
    {by:"@J.RIVERA",p:"Showed up to the picnic not knowing a soul. Left with five."} ];
  try{ var _se=localStorage.getItem("kc_email"); if(_se){ ST.email=_se; ST.emailCaptured=true; } }catch(e){}
  try{ if(localStorage.getItem("kc_bed_key")==="1") ST.bedroomKeyFound=true; }catch(e){}

  function unlockedCount(){ var n=ST.mixes.filter(function(m){return m.unlocked;}).length; return n+(ST.merchFound?1:0); }
  function syncHud(){ $("vCount").textContent=ST.values.length; $("uCount").textContent=unlockedCount(); }
  function collect(v){ if(ST.values.indexOf(v)===-1){ ST.values.push(v); syncHud(); } }
  function flash(msg){ var m=$("toastMount"); m.innerHTML='<div class="toast">'+msg+'</div>'; setTimeout(function(){ m.innerHTML=""; },2200); }
  function unlockMix(id,label){ var m=ST.mixes.find(function(x){return x.id===id;}); if(m&&!m.unlocked){ m.unlocked=true; chime(); flash(label); syncHud(); } }

  function show(scene){
    ST.scene=scene;
    ["lobby","enter","ride","hub","warehouse","arrival","exit","bedroom"].forEach(function(s){ $("s-"+s).classList.toggle("on", s===scene); });
    $("hud").classList.toggle("on", scene==="hub"||scene==="ride");
    $("skipBtn").style.display = (scene==="exit") ? "none" : "block";
    var pad=$("touchPad");
    if(pad) pad.classList.toggle("on", scene==="warehouse"||scene==="bedroom");
    if(scene==="hub") refreshHub();
    if(scene==="exit") renderChips();
  }

  /* ---------- mobile touch pad (D-pad + B) ---------- */
  function mountTouchPad(cfg){
    cfg=cfg||{};
    var pad=$("touchPad");
    if(!pad) return { cleanup:function(){} };
    var keys=cfg.keys||{};
    var active=cfg.isActive||function(){ return true; };
    var paused=cfg.paused||function(){ return false; };
    var onInteract=cfg.onInteract||function(){};
    var onMove=cfg.onMove||function(){};
    var handlers=[];

    function setKeys(codes, down){
      for(var i=0;i<codes.length;i++) keys[codes[i]]=down;
    }
    function bindHold(id, codes){
      var btn=$(id);
      if(!btn) return;
      var down=function(e){ e.preventDefault(); if(!active()||paused()) return; setKeys(codes,true); onMove(); };
      var up=function(e){ e.preventDefault(); setKeys(codes,false); };
      btn.addEventListener("pointerdown",down); btn.addEventListener("pointerup",up);
      btn.addEventListener("pointerleave",up); btn.addEventListener("pointercancel",up);
      handlers.push(function(){ btn.removeEventListener("pointerdown",down); btn.removeEventListener("pointerup",up); btn.removeEventListener("pointerleave",up); btn.removeEventListener("pointercancel",up); });
    }
    bindHold("touchUp",["ArrowUp","KeyW"]);
    bindHold("touchDown",["ArrowDown","KeyS"]);
    bindHold("touchLeft",["ArrowLeft","KeyA"]);
    bindHold("touchRight",["ArrowRight","KeyD"]);
    var bBtn=$("touchB");
    if(bBtn){
      var onB=function(e){ e.preventDefault(); if(!active()||paused()) return; onInteract(); };
      bBtn.addEventListener("pointerdown",onB);
      handlers.push(function(){ bBtn.removeEventListener("pointerdown",onB); });
    }
    return { cleanup:function(){ handlers.forEach(function(fn){ fn(); }); setKeys(["ArrowUp","KeyW","ArrowDown","KeyS","ArrowLeft","KeyA","ArrowRight","KeyD"],false); } };
  }

  /* ---------- hub ---------- */
  function refreshHub(){
    $("spot-beat").classList.toggle("done",ST.beatMade); $("s-beat").textContent=ST.beatMade?"✓ BEAT LOCKED":"▷ BUILD A BEAT";
    $("spot-dig").classList.toggle("done",ST.gemFound); $("s-dig").textContent=ST.gemFound?"✓ GEM PULLED":"▷ FIND THE GEM";
    var um=ST.mixes.filter(function(m){return m.unlocked;}).length;
    $("spot-mixes").classList.toggle("locked",um===0); $("s-mixes").textContent=um?("▷ "+um+" UNLOCKED"):"▷ LOCKED";
    $("spot-merch").style.display = ((ST.beatMade||ST.gemFound)&&!ST.merchFound)?"flex":"none";
  }
  function onBeatLocked(){ if(!ST.beatMade){ ST.beatMade=true; unlockMix("rooftop","▷ SECRET MIX UNLOCKED — ROOFTOP / DAT THANG"); refreshHub(); } }

  /* ---------- panels ---------- */
  function openPanel(title,bodyHtml,after){
    var pm=$("panelMount");
    pm.innerHTML='<div class="panel"><div class="panelTop"><div class="t">'+title+'</div><button class="x" id="pClose">Close ✕</button></div><div class="panelBody" id="pBody"></div></div>';
    $("pBody").innerHTML=bodyHtml; $("pClose").onclick=closePanel; if(after) after();
  }
  function closePanel(){ $("panelMount").innerHTML=""; stopBedDrone(); }

  /* merch shop + cart (checkout links to real store; wire Stripe in production) */
  /* ===== MERCH / STORE ===== drop real photo URLs into `img` to replace the mockups */
  var MERCH=[
    {id:"shorts", name:"KILLS SHORTS", price:60, type:"shorts", ac:"#e9e9ec",
      img:"https://www.killscomfort.com/_next/image?url=%2Fabout%2FFINALS-2.png&w=1080&q=75",
      desc:"Street-ready. Logo across the front. Built for movement.",
      sizes:["32","34","36","38"]},
    {id:"hoodie", name:"KillsComfort Diamond Hoodie", price:70, type:"hoodie", ac:"#c7cace",
      img:"https://www.killscomfort.com/_next/image?url=%2Fmerch%2Fhoodie.png&w=1080&q=75",
      desc:"Diamond logo hoodie \u2014 heavyweight comfort, movement energy.",
      sizes:["S","M","L","XL","2X"]}
  ];
  function prodArt(type,ac){ var s='<svg class="prodSvg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">';
    if(type==="tee"||type==="hoodie"){ s+='<path d="M32 26 L44 18 Q50 24 56 18 L68 26 L80 38 L71 47 L68 43 L68 86 L32 86 L32 43 L29 47 L20 38 Z" fill="#1c1c22" stroke="'+ac+'" stroke-width="2"/>';
      if(type==="hoodie"){ s+='<path d="M40 20 Q50 33 60 20" fill="none" stroke="'+ac+'" stroke-width="2"/><rect x="41" y="60" width="18" height="15" fill="none" stroke="'+ac+'" stroke-width="1.4"/><line x1="47" y1="23" x2="47" y2="40" stroke="'+ac+'" stroke-width="1.4"/><line x1="53" y1="23" x2="53" y2="40" stroke="'+ac+'" stroke-width="1.4"/>'; }
      else { s+='<path d="M42 20 Q50 28 58 20" fill="none" stroke="'+ac+'" stroke-width="1.4"/>'; } }
    else if(type==="cap"){ s+='<path d="M24 58 Q50 24 76 54 Q78 58 76 61 L30 61 Q24 61 24 58 Z" fill="#1c1c22" stroke="'+ac+'" stroke-width="2"/><path d="M30 61 L88 63 Q90 67 84 69 L52 67 Z" fill="#16161c" stroke="'+ac+'" stroke-width="1.4"/><circle cx="50" cy="30" r="2" fill="'+ac+'"/>'; }
    else if(type==="shorts"){ s+='<path d="M32 30 L68 30 L67 58 L56 58 L52 40 L48 40 L44 58 L33 58 Z" fill="#1c1c22" stroke="'+ac+'" stroke-width="2"/><line x1="32" y1="34" x2="68" y2="34" stroke="'+ac+'" stroke-width="1.4"/>'; }
    else { s+='<rect x="26" y="26" width="48" height="48" rx="9" fill="#1c1c22" stroke="'+ac+'" stroke-width="2"/><text x="50" y="58" text-anchor="middle" font-size="24" fill="'+ac+'">\u2726</text>'; }
    return s+'</svg>'; }
  function prodImg(m,big){ return m.img ? '<img class="prodImg'+(big?" big":"")+'" src="'+m.img+'" alt="'+escHtml(m.name)+'">' : prodArt(m.type,m.ac); }
  function mById(id){ for(var i=0;i<MERCH.length;i++) if(MERCH[i].id===id) return MERCH[i]; return null; }
  function loadCart(){ try{ return JSON.parse(localStorage.getItem("kc_cart")||"[]"); }catch(e){ return []; } }
  function saveCart(a){ try{ localStorage.setItem("kc_cart", JSON.stringify(a)); }catch(e){} }
  function cartCount(){ return loadCart().reduce(function(n,it){ return n+it.qty; },0); }
  function cartSum(){ return loadCart().reduce(function(n,it){ return n+it.qty*it.price; },0); }
  function ckey(it){ return it.id+"|"+(it.size||""); }
  function addToCart(m,size){ var c=loadCart(),key=m.id+"|"+(size||""),f=null; c.forEach(function(x){ if(ckey(x)===key)f=x; });
    if(f)f.qty++; else c.push({id:m.id,name:m.name,price:m.price,type:m.type,ac:m.ac,img:m.img||"",size:size||"",qty:1}); saveCart(c); }
  function setQtyKey(key,q){ saveCart(loadCart().map(function(x){ if(ckey(x)===key)x.qty=q; return x; }).filter(function(x){ return x.qty>0; })); }
  function flashBtn(b,txt){ var t=b.textContent; b.textContent=txt; setTimeout(function(){ b.textContent=t; },1000); }
  function openShop(){ getCtx(); openPanel("Merch \u2014 the rack",
    '<div class="shopGrid" id="shop"></div>'+
    '<div class="shopFoot"><span class="cartLine" id="cartLine"></span><span class="regNote">Check out at the register \u2192</span></div>',
    function(){ renderShop(); }); }
  function renderShop(){ var el=$("shop"); if(!el)return; el.innerHTML="";
    MERCH.forEach(function(m){ var card=document.createElement("button"); card.className="prodCard";
      card.innerHTML='<div class="prodThumb">'+prodImg(m,false)+'</div><div class="prodNm">'+escHtml(m.name)+'</div><div class="prodPr">$'+m.price+'</div>';
      card.onclick=function(){ openProduct(m); }; el.appendChild(card); });
    cartLine(); }
  function cartLine(){ var el=$("cartLine"); if(el) el.textContent = cartCount()? (cartCount()+" in cart \u00b7 $"+cartSum()) : "Cart empty"; }
  function openProduct(m){ getCtx(); var size=(m.sizes&&m.sizes[0])||"One size";
    openPanel(m.name,
      '<div class="pd"><div class="pdImg">'+prodImg(m,true)+'</div>'+
      '<div class="pdInfo"><div class="pdPr">$'+m.price+(m.tag?' \u00b7 '+escHtml(m.tag):'')+'</div>'+
      '<p class="pdDesc">'+escHtml(m.desc)+'</p>'+
      '<div class="pdSizes" id="pdSizes"></div>'+
      '<div class="row" style="gap:10px;margin-top:16px"><button class="btn ghost" id="pdBack">\u2039 Back</button><button class="btn solid" id="pdAdd">Add to cart</button></div>'+
      '</div></div>',
      function(){ renderSizes(); $("pdBack").onclick=openShop; $("pdAdd").onclick=function(){ addToCart(m,size); flashBtn(this,"\u2713 Added"); }; });
    function renderSizes(){ var el=$("pdSizes"); if(!el)return; el.innerHTML='<div class="pdSzHead">SIZE</div><div class="szRow" id="szRow"></div>';
      var row=$("szRow"); m.sizes.forEach(function(sz){ var b=document.createElement("button"); b.className="szBtn"+(sz===size?" on":""); b.textContent=sz;
        b.onclick=function(){ size=sz; renderSizes(); }; row.appendChild(b); }); }
  }
  function openCheckout(){ getCtx(); var step="cart", info={};
    openPanel("Checkout", '<div id="coBody"></div>', function(){ renderStep(); });
    function dots(cur){ return ["cart","details","pay"].map(function(s,i){ var lab=["Cart","Details","Payment"][i];
      return '<span class="coDot'+(s===cur?" on":"")+'">'+(i+1)+' '+lab+'</span>'; }).join('<span class="coSep">\u203a</span>'); }
    function renderStep(){ var b=$("coBody"); if(!b)return; var c=loadCart();
      if(step==="cart"){
        b.innerHTML='<div class="coSteps">'+dots("cart")+'</div><div class="cart" id="cartList"></div>'+
          '<div class="cartFoot"><div class="cartTot" id="cartTot"></div><div class="row" style="gap:10px"><button class="btn ghost" id="coShop">\u2039 Keep shopping</button><button class="btn solid" id="coNext">Continue \u2192</button></div></div>';
        renderCartList(); $("coShop").onclick=openShop;
        $("coNext").onclick=function(){ if(!loadCart().length)return; step="details"; renderStep(); };
      } else if(step==="details"){
        b.innerHTML='<div class="coSteps">'+dots("details")+'</div>'+
          '<div class="form">'+
          field("Full name","co_name",info.name)+field("Email","co_email",info.email)+
          field("Address","co_addr",info.addr)+
          '<div class="fRow">'+field("City","co_city",info.city)+field("State","co_state",info.state)+'</div>'+
          '<div class="fRow">'+field("ZIP","co_zip",info.zip)+field("Country","co_country",info.country||"USA")+'</div>'+
          '<div class="fErr" id="coErr"></div></div>'+
          '<div class="row" style="gap:10px"><button class="btn ghost" id="coBack">\u2039 Cart</button><button class="btn solid" id="coToPay">Continue to payment \u2192</button></div>';
        $("coBack").onclick=function(){ step="cart"; renderStep(); };
        $("coToPay").onclick=function(){ info={name:val("co_name"),email:val("co_email"),addr:val("co_addr"),city:val("co_city"),state:val("co_state"),zip:val("co_zip"),country:val("co_country")};
          if(!info.name||!info.email||!info.addr){ $("coErr").textContent="Name, email and address are required."; return; }
          if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(info.email)){ $("coErr").textContent="That email doesn't look right."; return; }
          step="pay"; renderStep(); };
      } else {
        var ship=8, sub=cartSum(), tot=sub+ship;
        b.innerHTML='<div class="coSteps">'+dots("pay")+'</div>'+
          '<div class="coSummary" id="coSummary"></div>'+
          '<div class="coTotals"><div><span>Subtotal</span><b>$'+sub+'</b></div><div><span>Shipping</span><b>$'+ship+'</b></div><div class="grand"><span>Total</span><b>$'+tot+'</b></div></div>'+
          '<div class="coShip">Ship to: '+escHtml(info.name)+' \u00b7 '+escHtml(info.addr)+', '+escHtml(info.city||"")+' '+escHtml(info.state||"")+' '+escHtml(info.zip||"")+'</div>'+
          '<button class="btn solid" id="coPay" style="width:100%;margin-top:14px">Pay $'+tot+' with card</button>'+
          '<a class="btn ghost" href="/checkout" style="display:block;text-align:center;margin-top:8px">Checkout on site \u2197</a>'+
          '<div class="coNote" id="coNote">\uD83D\uDD12 Secure checkout via Stripe (card / Apple Pay / Google Pay). The button above is the in-game test flow; the link runs your real Stripe checkout.</div>'+
          '<button class="btn ghost" id="coBack2" style="margin-top:10px">\u2039 Details</button>';
        renderSummary(); $("coBack2").onclick=function(){ step="details"; renderStep(); };
        $("coPay").onclick=function(){ this.disabled=true; this.textContent="Placing order\u2026";
          setTimeout(function(){ saveCart([]); b.innerHTML='<div class="coDone"><div class="coCheck">\u2713</div><div class="coDoneT">Order placed</div><div class="coDoneS">Confirmation sent to '+escHtml(info.email)+'. (Test build \u2014 wire Stripe + Resend for the real thing.)</div><button class="btn solid" id="coClose">Done</button></div>'; $("coClose").onclick=closePanel; }, 700); };
      }
      function renderSummary(){ var el=$("coSummary"); if(!el)return; el.innerHTML=""; loadCart().forEach(function(it){ var r=document.createElement("div"); r.className="coLine";
        r.innerHTML='<span>'+escHtml(it.name)+(it.size&&it.size!=="One size"?' \u00b7 '+escHtml(it.size):'')+' \u00d7'+it.qty+'</span><b>$'+(it.qty*it.price)+'</b>'; el.appendChild(r); }); }
    }
    function renderCartList(){ var el=$("cartList"); if(!el)return; var c=loadCart(), nx=$("coNext");
      if(!c.length){ el.innerHTML='<span class="loopsEmpty">Cart empty \u2014 grab something off the merch rack.</span>'; if($("cartTot"))$("cartTot").textContent=""; if(nx){ nx.style.opacity=".45"; } return; }
      el.innerHTML=""; c.forEach(function(it){ var key=ckey(it); var row=document.createElement("div"); row.className="cartRow";
        row.innerHTML='<div class="cartThumb">'+prodImg(it,false)+'</div><div class="cartNm">'+escHtml(it.name)+(it.size&&it.size!=="One size"?'<span class="cartSz">'+escHtml(it.size)+'</span>':'')+'</div>'+
          '<div class="qty"><button class="qb qm">\u2212</button><b>'+it.qty+'</b><button class="qb qp">+</button></div><div class="cartPr">$'+(it.qty*it.price)+'</div>';
        row.querySelector(".qm").onclick=function(){ setQtyKey(key,it.qty-1); renderCartList(); };
        row.querySelector(".qp").onclick=function(){ setQtyKey(key,it.qty+1); renderCartList(); };
        el.appendChild(row); });
      if($("cartTot"))$("cartTot").textContent="Subtotal  $"+cartSum(); if(nx)nx.style.opacity="1"; }
    function field(label,id,v){ return '<label class="fLbl">'+label+'<input class="fInp" id="'+id+'" value="'+(v?escHtml(v):"")+'"></label>'; }
    function val(id){ var e=$(id); return e?e.value.trim():""; }
  }

  /* beat panel */
  function loadLoops(){ try{ return JSON.parse(localStorage.getItem("kc_loops")||"[]"); }catch(e){ return []; } }
  function saveLoops(a){ try{ localStorage.setItem("kc_loops", JSON.stringify(a)); }catch(e){} }
  function cloneGrid(g){ var out=emptyGrid(); LANES.forEach(function(l){ if(g&&g[l]) for(var i=0;i<STEPS;i++) out[l][i]=!!g[l][i]; }); return out; }
  function cloneRoll(r){ var out=emptyRoll(); if(r) for(var i=0;i<out.length;i++){ if(r[i]) for(var j=0;j<STEPS;j++) out[i][j]=!!r[i][j]; } return out; }
  function renderLoopWav(lp, done){
    var bpm=lp.bpm||96, stepDur=(60/bpm)/4, total=STEPS*stepDur+0.6, sr=44100;
    var OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext; if(!OAC){ done(null); return; }
    var oc; try{ oc=new OAC(2, Math.ceil(sr*total), sr); }catch(e){ done(null); return; }
    var grid=lp.grid||emptyGrid(), roll=lp.roll||emptyRoll();
    for(var s=0;s<STEPS;s++){ var t=s*stepDur;
      LANES.forEach(function(lane){ if(grid[lane]&&grid[lane][s]) trigger(lane,t,s,oc); });
      for(var r=0;r<roll.length;r++){ if(roll[r]&&roll[r][s]) pluck(t,ROLL_FREQS[r],oc); } }
    oc.startRendering().then(function(buf){ done(bufToWav(buf)); }).catch(function(){ done(null); });
  }
  function bufToWav(buf){ var nch=buf.numberOfChannels, len=buf.length, sr=buf.sampleRate;
    var ab=new ArrayBuffer(44+len*nch*2), v=new DataView(ab), off=0;
    function ws(s){ for(var i=0;i<s.length;i++) v.setUint8(off++,s.charCodeAt(i)); }
    function u32(x){ v.setUint32(off,x,true); off+=4; } function u16(x){ v.setUint16(off,x,true); off+=2; }
    ws("RIFF"); u32(36+len*nch*2); ws("WAVE"); ws("fmt "); u32(16); u16(1); u16(nch); u32(sr); u32(sr*nch*2); u16(nch*2); u16(16); ws("data"); u32(len*nch*2);
    var ch=[]; for(var c=0;c<nch;c++) ch.push(buf.getChannelData(c));
    for(var i2=0;i2<len;i2++){ for(var c2=0;c2<nch;c2++){ var x=Math.max(-1,Math.min(1,ch[c2][i2])); v.setInt16(off, x<0?x*0x8000:x*0x7FFF, true); off+=2; } }
    return new Blob([ab],{type:"audio/wav"}); }
  function downloadBlob(blob,name){ var url=URL.createObjectURL(blob),a=document.createElement("a"); a.href=url; a.download=name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); },1200); }
  function escHtml(s){ return String(s).replace(/[&<>"']/g,function(m){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]; }); }
  function openBeat(){
    var grid=emptyGrid(), roll=emptyRoll(), bpm=96, playing=false, head=-1;
    var seq=new Sequencer(function(){return grid;},function(){return bpm;},function(i){ head=i; paintHeads(); },function(){return roll;});
    openPanel("Build a beat",
      '<div class="transport">'+
      '<button class="btn solid" id="bPlay">▶ Play</button>'+
      '<button class="btn ghost" id="bClear">Clear</button>'+
      '<button class="btn ghost" id="bSeed">Drop a starter</button>'+
      '<span class="bpm">BPM<input type="range" id="bBpm" min="78" max="150" value="96"><b id="bBpmV">96</b></span>'+
      '</div><div class="seq" id="seq"></div>'+
      '<div class="roll" id="roll"><div class="rollHead"><span class="rollTitle">PIANO ROLL · MELODY</span><span class="rollSub">C3 – B4 · tap to place notes</span></div><div class="rollScroll" id="rollGrid"></div></div>'+
      '<div class="beathint">Top grid: <b>drums + bass</b>. Bottom grid: <b>melody</b> — stack notes for chords, draw a line across the bar.<br>Lock something that moves (drums or a melody) and the warehouse <b>unlocks a secret mix.</b></div>'+
      '<div class="saver"><input class="loopName" id="bName" placeholder="name this loop" maxlength="24"><button class="btn ghost" id="bSave">Save loop</button></div>'+
      '<div class="loops" id="loops"></div>',
      mount);
    function mount(){
      var seqEl=$("seq"); seqEl.innerHTML="";
      LANES.forEach(function(lane){
        var tr=document.createElement("div"); tr.className="track";
        var lbl=document.createElement("div"); lbl.className="lbl"; lbl.textContent=LABELS[lane];
        var st=document.createElement("div"); st.className="steps";
        for(var i=0;i<STEPS;i++){ (function(i){
          var c=document.createElement("button"); c.className="cell"+((i%4===0)?" beat":""); c.dataset.lane=lane; c.dataset.i=i;
          c.onclick=function(){ getCtx(); grid[lane][i]=!grid[lane][i]; c.classList.toggle("on",grid[lane][i]);
            if(grid[lane][i]){ var cc=getCtx(); trigger(lane,cc?cc.currentTime:0,i); } checkLock(); };
          st.appendChild(c); })(i); }
        tr.appendChild(lbl); tr.appendChild(st); seqEl.appendChild(tr);
      });
      var rollEl=$("rollGrid"); rollEl.innerHTML="";
      ROLL_ROWS.forEach(function(rr,r){
        var row=document.createElement("div"); row.className="rollRow"+(rr.black?" black":"");
        var key=document.createElement("div"); key.className="rollKey"+(rr.black?" black":""); key.textContent=rr.label;
        var steps=document.createElement("div"); steps.className="rollSteps";
        for(var i=0;i<STEPS;i++){ (function(i){
          var c=document.createElement("button"); c.className="rollCell"+((i%4===0)?" bar":""); c.dataset.row=r; c.dataset.i=i;
          c.onclick=function(){ getCtx(); roll[r][i]=!roll[r][i]; c.classList.toggle("on",roll[r][i]);
            if(roll[r][i]){ var cc=getCtx(); pluck(cc?cc.currentTime:0,ROLL_FREQS[r]); } checkLock(); };
          steps.appendChild(c); })(i); }
        row.appendChild(key); row.appendChild(steps); rollEl.appendChild(row);
      });
      $("bPlay").onclick=function(){ getCtx(); if(playing){ seq.stop(); playing=false; head=-1; paintHeads(); this.textContent="▶ Play"; } else { seq.start(); playing=true; this.textContent="■ Stop"; } };
      $("bClear").onclick=function(){ grid=emptyGrid(); roll=emptyRoll(); repaint(); };
      $("bSeed").onclick=function(){ getCtx(); grid=starterGrid(); roll=starterRoll(); repaint(); checkLock(); };
      $("bBpm").oninput=function(){ bpm=+this.value; $("bBpmV").textContent=bpm; };
      $("bSave").onclick=function(){ var name=($("bName").value||"").trim(); var loops=loadLoops(); if(!name) name="Loop "+(loops.length+1);
        loops.unshift({ id:Date.now()+"", name:name, bpm:bpm, grid:cloneGrid(grid), roll:cloneRoll(roll) }); saveLoops(loops);
        $("bName").value=""; renderLoops(); var b=this, t=b.textContent; b.textContent="\u2713 Saved"; setTimeout(function(){ b.textContent=t; },1100); };
      renderLoops();
      var origClose=$("pClose").onclick; $("pClose").onclick=function(){ seq.stop(); origClose(); };
    }
    function loadLoopInto(lp){ grid=cloneGrid(lp.grid); roll=cloneRoll(lp.roll); bpm=lp.bpm||96;
      $("bBpm").value=bpm; $("bBpmV").textContent=bpm; repaint(); checkLock(); }
    function renderLoops(){ var wrap=$("loops"); if(!wrap)return; var loops=loadLoops();
      if(!loops.length){ wrap.innerHTML='<span class="loopsEmpty">No saved loops yet — build something and hit Save.</span>'; return; }
      wrap.innerHTML='<div class="loopsHead">SAVED LOOPS</div>';
      loops.forEach(function(lp){ var chip=document.createElement("div"); chip.className="loopChip";
        chip.innerHTML='<button class="loopLoad">'+escHtml(lp.name)+' \u00b7 '+(lp.bpm||96)+' BPM</button><button class="loopDl" title="Download WAV">\u2913 WAV</button><button class="loopDel" title="Delete">\u2715</button>';
        chip.querySelector(".loopLoad").onclick=function(){ getCtx(); loadLoopInto(lp); };
        chip.querySelector(".loopDl").onclick=function(){ var b=this; if(b.dataset.busy)return; b.dataset.busy="1"; var txt=b.textContent; b.textContent="\u2026";
          renderLoopWav(lp,function(blob){ b.textContent=txt; b.dataset.busy=""; if(blob) downloadBlob(blob,(lp.name||"loop").replace(/[^\w\-]+/g,"_").toLowerCase()+".wav"); else b.textContent="\u2717"; }); };
        chip.querySelector(".loopDel").onclick=function(){ saveLoops(loadLoops().filter(function(x){ return x.id!==lp.id; })); renderLoops(); };
        wrap.appendChild(chip); });
    }
    function repaint(){
      Array.prototype.forEach.call(document.querySelectorAll("#seq .cell"),function(c){ c.classList.toggle("on",grid[c.dataset.lane][+c.dataset.i]); });
      Array.prototype.forEach.call(document.querySelectorAll("#roll .rollCell"),function(c){ c.classList.toggle("on",roll[+c.dataset.row][+c.dataset.i]); });
    }
    function paintHeads(){
      Array.prototype.forEach.call(document.querySelectorAll("#seq .cell"),function(c){ c.classList.toggle("play",(+c.dataset.i)===head); });
      Array.prototype.forEach.call(document.querySelectorAll("#roll .rollCell"),function(c){ c.classList.toggle("colplay",(+c.dataset.i)===head); });
    }
    function checkLock(){ if(ST.beatMade)return; var hits=0,lanesUsed=0; LANES.forEach(function(l){ var h=grid[l].filter(Boolean).length; hits+=h; if(h)lanesUsed++; });
      var notes=0,pitches=0; roll.forEach(function(rw){ var h=rw.filter(Boolean).length; notes+=h; if(h)pitches++; });
      if((hits>=4&&lanesUsed>=2)||(notes>=4&&pitches>=2)) onBeatLocked(); }
  }

  /* ---------- stem deck (SYNTH DEMO — real build loads audio files; see React StemPlayer) ---------- */
  /* ===== real audio stem player ===== drop hosted stem URLs into STEMS, or load files in-player */
  var STREAM={ spotify:"https://open.spotify.com/artist/1C0WKJTNpv2Xli0swIcTE8", soundcloud:"https://soundcloud.com/killscomfort" };
  var STEMS={
    // Per track title. In production, host stems and fill urls (or load local files in the player):
    // "MOTION IS FAITH":[{name:"DRUMS",url:"/stems/motion-is-faith/drums.mp3"},{name:"BASS",url:"/stems/motion-is-faith/bass.mp3"},{name:"KEYS",url:"/stems/motion-is-faith/keys.mp3"},{name:"VOX",url:"/stems/motion-is-faith/vox.mp3"}]
  };
  function labelFromName(fn){ return fn.replace(/\.[^.]+$/,"").replace(/[_\-]+/g," ").trim().split(/\s+/).slice(-1)[0].toUpperCase().slice(0,8)||"STEM"; }
  function decodeUrls(cfg, cb){ var a=getCtx(); if(!a){ cb(null); return; } var items=new Array(cfg.length), done=0, ok=true;
    cfg.forEach(function(s,idx){ fetch(s.url).then(function(r){ return r.arrayBuffer(); }).then(function(ab){ a.decodeAudioData(ab, function(buf){ items[idx]={name:s.name,buffer:buf}; if(++done===cfg.length) cb(ok?items:null); }, function(){ ok=false; if(++done===cfg.length) cb(null); }); }).catch(function(){ ok=false; if(++done===cfg.length) cb(null); }); }); }
  function decodeFiles(files, cb){ var a=getCtx(); if(!a){ cb(null); return; } var arr=Array.prototype.slice.call(files), items=[], done=0;
    function fin(){ if(done===arr.length) cb(items.length?items:null); }
    arr.forEach(function(f){ var fr=new FileReader(); fr.onload=function(){ a.decodeAudioData(fr.result.slice(0), function(buf){ items.push({name:labelFromName(f.name),buffer:buf}); done++; fin(); }, function(){ done++; fin(); }); }; fr.onerror=function(){ done++; fin(); }; fr.readAsArrayBuffer(f); }); }
  function makeAudioDeck(items){ var a=getCtx(); if(!a) return null;
    var master=a.createGain(); master.connect(a.destination);
    var stems=items.map(function(it){ var g=a.createGain(); g.connect(master); return {name:it.name,buffer:it.buffer,gain:g,muted:false,solo:false,src:null}; });
    var dur=stems.reduce(function(m,s){ return Math.max(m,s.buffer.duration); },0.001);
    var playing=false,startTime=0,offset=0,raf=null,onTick=null;
    function anySolo(){ return stems.some(function(s){ return s.solo; }); }
    function applyGains(){ var solo=anySolo(); stems.forEach(function(s){ var on=solo?s.solo:!s.muted; s.gain.gain.setTargetAtTime(on?1:0, a.currentTime, 0.012); }); }
    function startSrc(at){ stems.forEach(function(s){ var src=a.createBufferSource(); src.buffer=s.buffer; src.loop=true; src.connect(s.gain); src.start(0, at % s.buffer.duration); s.src=src; }); }
    function stopSrc(){ stems.forEach(function(s){ if(s.src){ try{ s.src.stop(); }catch(e){} s.src=null; } }); }
    function loop(){ if(!playing)return; var pos=((a.currentTime-startTime)%dur)/dur; if(onTick)onTick(pos); raf=requestAnimationFrame(loop); }
    function play(tick){ if(playing)return; onTick=tick||onTick; applyGains(); offset=offset%dur; startTime=a.currentTime-offset; startSrc(offset); playing=true; loop(); }
    function pause(){ if(!playing)return; offset=(a.currentTime-startTime)%dur; stopSrc(); playing=false; if(raf)cancelAnimationFrame(raf); }
    return { stems:stems, duration:dur, isPlaying:function(){ return playing; },
      play:play, pause:pause,
      seek:function(f){ var was=playing; if(was)pause(); offset=Math.max(0,Math.min(0.999,f))*dur; if(was)play(); else if(onTick)onTick(offset/dur); },
      restart:function(){ var was=playing; if(was)pause(); offset=0; if(was)play(); else if(onTick)onTick(0); },
      toggleMute:function(i){ stems[i].muted=!stems[i].muted; if(stems[i].muted)stems[i].solo=false; applyGains(); },
      toggleSolo:function(i){ stems[i].solo=!stems[i].solo; if(stems[i].solo)stems[i].muted=false; applyGains(); },
      stop:function(){ pause(); } };
  }

  var _imgCache={};
  function loadArtMap(){ try{ return JSON.parse(localStorage.getItem("kc_art")||"{}"); }catch(e){ return {}; } }
  function getArt(r){ var m=loadArtMap(); return m[r.t] || r.art || null; }
  function drawImgCover(c,im,S){ var iw=im.naturalWidth||im.width, ih=im.naturalHeight||im.height; if(!iw)return; var s=Math.max(S/iw,S/ih), w=iw*s, h=ih*s; try{ c.drawImage(im,(S-w)/2,(S-h)/2,w,h); }catch(e){} }
  function drawProc(c,r,seed,S){ c.clearRect(0,0,S,S);
    var bg=c.createLinearGradient(0,0,S,S); bg.addColorStop(0,"#1c1c24"); bg.addColorStop(1,"#0b0b0f"); c.fillStyle=bg; c.fillRect(0,0,S,S);
    var ac=r.gem?"#c7cace":["#36e6ff","#e5534b","#ff9a2e","#8ed64a","#9a9aa3"][seed%5];
    c.save(); c.globalAlpha=.45; c.strokeStyle=ac; var m=seed%4;
    if(m===0){ for(var i=0;i<7;i++){ c.lineWidth=1+i*0.5; c.beginPath(); c.arc(S*0.52,S*0.42,S*0.08+i*S*0.055,0,Math.PI*2); c.stroke(); } }
    else if(m===1){ c.lineWidth=2; for(var j=0;j<9;j++){ c.beginPath(); c.moveTo(0,S*j/9); c.lineTo(S,S*j/9+S*0.16); c.stroke(); } }
    else if(m===2){ c.lineWidth=1.4; for(var k=0;k<12;k++){ var a=k/12*Math.PI*2; c.beginPath(); c.moveTo(S*0.5,S*0.45); c.lineTo(S*0.5+Math.cos(a)*S*0.55,S*0.45+Math.sin(a)*S*0.55); c.stroke(); } }
    else { c.lineWidth=2; for(var q=0;q<6;q++){ c.strokeRect(S*0.12+q*5,S*0.1+q*5,S*0.76-q*10,S*0.7-q*10); } }
    c.restore();
    c.fillStyle=ac; c.font='700 '+(S*0.058)+'px "Space Mono",monospace'; c.textAlign="left"; c.textBaseline="top"; c.fillText("KILLSCOMFORT",S*0.07,S*0.07);
    c.fillStyle="#e9e9ec"; c.textAlign="left"; c.textBaseline="bottom"; var fs=Math.max(9,S*0.12); c.font='700 '+fs+'px "Archivo Narrow","Arial Narrow",Impact,sans-serif';
    r.t.split(" ").reverse().forEach(function(w,i){ c.fillText(w, S*0.07, S-S*0.07-i*fs*0.92); }); }
  function drawCover(c,r,seed,S){ var url=getArt(r);
    if(!url){ drawProc(c,r,seed,S); return; }
    var im=_imgCache[url];
    if(im && im._ok){ drawImgCover(c,im,S); return; }
    drawProc(c,r,seed,S);
    if(im){ im._q.push([c,S]); return; }
    im=new Image(); im._q=[[c,S]]; _imgCache[url]=im;
    im.onload=function(){ im._ok=true; im._q.forEach(function(p){ drawImgCover(p[0],im,p[1]); }); im._q=[]; };
    im.onerror=function(){ im._ok=false; };
    im.src=url; }
  function storeArt(track,file,cb){ var im=new Image(); var ou=URL.createObjectURL(file);
    im.onload=function(){ var cn=document.createElement("canvas"); cn.width=cn.height=320; var cx=cn.getContext("2d");
      var s=Math.max(320/im.naturalWidth,320/im.naturalHeight), w=im.naturalWidth*s, h=im.naturalHeight*s; cx.drawImage(im,(320-w)/2,(320-h)/2,w,h);
      var url=null; try{ url=cn.toDataURL("image/jpeg",0.85); }catch(e){}
      URL.revokeObjectURL(ou);
      if(url){ var m=loadArtMap(); m[track]=url; try{ localStorage.setItem("kc_art",JSON.stringify(m)); }catch(e){} } cb&&cb(url); };
    im.onerror=function(){ URL.revokeObjectURL(ou); cb&&cb(null); }; im.src=ou; }
  /* dig panel */
  function openDig(){
    var msg="", deck=null, loadedIdx=-1, ttAudio=(typeof Audio!=="undefined")?new Audio():null, ttUrl=null;
    openPanel("Dig the crates",
      '<p class="tiny" style="margin-top:0;">FLIP THROUGH · PUT ONE ON THE TURNTABLE · PULL FOR STEMS · ONE IS A GEM</p>'+
      '<div class="crate" id="crate"></div>'+
      '<div class="digctl"><button class="btn ghost" id="dPrev">‹ Flip</button><button class="btn solid" id="dPull">Pull this one</button><button class="btn ghost" id="dNext">Flip ›</button></div>'+
      '<p class="digMsg" id="dMsg"></p>'+
      '<div class="ttwrap" id="ttWrap"><div class="stemhint">▷ Pull a record to spin it.</div></div>'+
      '<div class="stemwrap" id="stemWrap"></div>', mount);
    function mount(){ paint();
      $("dPrev").onclick=function(){ ST.digIdx=(ST.digIdx-1+RECORDS.length)%RECORDS.length; msg=""; paint(); };
      $("dNext").onclick=function(){ ST.digIdx=(ST.digIdx+1)%RECORDS.length; msg=""; paint(); };
      $("dPull").onclick=function(){ var r=RECORDS[ST.digIdx]; var c=getCtx();
        if(r.gem){ if(!ST.gemFound){ ST.gemFound=true; unlockMix("crate","▷ GEM PULLED — MOTION IS FAITH (DUB) UNLOCKED"); refreshHub(); } msg="That's the one. On the platter — solo the parts below."; }
        else { blip(c?c.currentTime:0,160); msg="On the platter. Hit play, or pull the stems below."; }
        renderTurntable(RECORDS[ST.digIdx]); loadDeck(ST.digIdx); paintMsg(); };
      var origClose=$("pClose").onclick; $("pClose").onclick=function(){ if(deck)deck.stop(); if(ttAudio){ ttAudio.pause(); } origClose(); };
    }
    function renderTurntable(r){ var w=$("ttWrap"); if(!w)return;
      if(ttAudio){ ttAudio.pause(); }
      w.innerHTML='<div class="tt" id="ttBox"><div class="platter"><div class="vinyl drop" id="vinyl"><div class="spindle"></div><canvas class="ttlabel" width="150" height="150"></canvas></div></div>'+
        '<div class="tonearm"></div>'+
        '<div class="ttside"><div class="ttnm">'+r.t+'</div>'+
        '<div class="ttctl"><button class="btn solid" id="ttPlay">\u25b6 Play</button><label class="btn ghost" id="ttLoadL">Load track<input type="file" id="ttFile" accept="audio/*" style="display:none"></label><label class="btn ghost" id="ttArtL">Cover<input type="file" id="ttArt" accept="image/*" style="display:none"></label></div>'+
        '<div class="seek" id="ttSeek"><div class="seekFill" id="ttFill"></div></div>'+
        '<div class="stemLinks"><a class="btn ghost" href="'+(r.sp||STREAM.spotify)+'" target="_blank" rel="noopener">Listen \u2197</a><a class="btn ghost" href="'+STREAM.soundcloud+'" target="_blank" rel="noopener">SoundCloud \u2197</a></div>'+
        '</div></div>';
      var lab=w.querySelector(".ttlabel"); if(lab) drawCover(lab.getContext("2d"), r, RECORDS.indexOf(r), 150);
      var box=$("ttBox"), vinyl=$("vinyl"), fill=$("ttFill"), play=$("ttPlay");
      if(r.preview && ttAudio){ ttAudio.src=r.preview; }
      function setPlaying(on){ if(on){ box.classList.add("playing"); vinyl.className="vinyl spin"; play.textContent="\u25a0 Stop"; } else { box.classList.remove("playing"); vinyl.className="vinyl"; play.textContent="\u25b6 Play"; } }
      if(ttAudio){
        ttAudio.ontimeupdate=function(){ if(fill&&ttAudio.duration) fill.style.width=(ttAudio.currentTime/ttAudio.duration*100)+"%"; };
        ttAudio.onended=function(){ setPlaying(false); };
        ttAudio.onpause=function(){ setPlaying(false); };
        ttAudio.onplay=function(){ setPlaying(true); };
      }
      play.onclick=function(){ if(!ttAudio) return; if(!ttAudio.src){ $("ttFile").click(); return; }
        if(ttAudio.paused){ ttAudio.play().catch(function(){}); } else { ttAudio.pause(); } };
      $("ttSeek").onclick=function(e){ if(!ttAudio||!ttAudio.duration)return; var b=this.getBoundingClientRect(); ttAudio.currentTime=(e.clientX-b.left)/b.width*ttAudio.duration; };
      $("ttFile").onchange=function(){ if(!this.files||!this.files.length||!ttAudio)return; if(ttUrl) URL.revokeObjectURL(ttUrl); ttUrl=URL.createObjectURL(this.files[0]); ttAudio.src=ttUrl; ttAudio.play().catch(function(){}); };
      $("ttArt").onchange=function(){ if(!this.files||!this.files.length)return; storeArt(r.t, this.files[0], function(url){ if(url){ delete _imgCache[url]; if(lab) drawCover(lab.getContext("2d"), r, RECORDS.indexOf(r), 150); paint(); } }); };
    }
    function loadDeck(idx){
      if(deck){ deck.stop(); deck=null; }
      var r=RECORDS[idx]; loadedIdx=idx;
      var cfg=STEMS[r.t];
      if(cfg && cfg.length && cfg.every(function(s){ return s.url; })){ renderPlayer(r,"loading");
        decodeUrls(cfg,function(items){ if(!items){ renderPlayer(r,"error"); return; } deck=makeAudioDeck(items); renderPlayer(r,"ready"); }); }
      else { renderPlayer(r,"idle"); }
    }
    function renderPlayer(r,state){
      var wrap=$("stemWrap"); if(!wrap)return;
      var links='<div class="stemLinks"><a class="btn ghost" href="'+STREAM.spotify+'" target="_blank" rel="noopener">Spotify \u2197</a>'+
        '<a class="btn ghost" href="'+STREAM.soundcloud+'" target="_blank" rel="noopener">SoundCloud \u2197</a></div>';
      if(state==="ready" && deck){
        var rows=deck.stems.map(function(s,i){ return '<div class="stemrow" id="srow'+i+'"><span class="sn">'+s.name+'</span>'+
          '<button class="stembtn m" id="mute'+i+'">MUTE</button><button class="stembtn s" id="solo'+i+'">SOLO</button></div>'; }).join("");
        wrap.innerHTML='<div class="stemhead"><div class="nm">'+r.t+'</div><button class="btn solid" id="stPlay">\u25b6 Play</button><button class="btn ghost" id="stRe">\u21ba</button></div>'+
          '<div class="seek" id="seek"><div class="seekFill" id="seekFill"></div></div>'+rows+links;
        var fill=$("seekFill");
        $("stPlay").onclick=function(){ if(deck.isPlaying()){ deck.pause(); this.textContent="\u25b6 Play"; } else { deck.play(function(p){ if(fill)fill.style.width=(p*100)+"%"; }); this.textContent="\u25a0 Stop"; } };
        $("stRe").onclick=function(){ deck.restart(); };
        $("seek").onclick=function(e){ var b=this.getBoundingClientRect(); deck.seek((e.clientX-b.left)/b.width); };
        deck.stems.forEach(function(s,i){ $("mute"+i).onclick=function(){ deck.toggleMute(i); sync(); }; $("solo"+i).onclick=function(){ deck.toggleSolo(i); sync(); }; });
        function sync(){ var anySolo=deck.stems.some(function(s){ return s.solo; }); deck.stems.forEach(function(s,i){ $("mute"+i).classList.toggle("active",s.muted); $("solo"+i).classList.toggle("active",s.solo); $("srow"+i).classList.toggle("off", anySolo?!s.solo:s.muted); }); }
        sync();
      } else if(state==="loading"){
        wrap.innerHTML='<div class="stemhead"><div class="nm">'+r.t+'</div></div><div class="stemhint">Decoding stems\u2026</div>';
      } else {
        var note = state==="error" ? "Couldn\u2019t load those stems \u2014 try again, or load files below." : "No stems wired for this track yet. Load your own to try the player, or hear the full track:";
        wrap.innerHTML='<div class="stemhead"><div class="nm">'+r.t+'</div></div><div class="stemhint">'+note+'</div>'+
          '<div class="stemLoad"><label class="btn solid">Load stems<input type="file" id="stemFiles" accept="audio/*" multiple style="display:none"></label><span class="tiny">pick drums / bass / keys / vox</span></div>'+links;
        var inp=$("stemFiles"); if(inp) inp.onchange=function(){ if(!this.files||!this.files.length)return; renderPlayer(r,"loading");
          decodeFiles(this.files,function(items){ if(!items){ renderPlayer(r,"error"); return; } deck=makeAudioDeck(items); renderPlayer(r,"ready"); }); };
      }
    }
    function paint(){
      var el=$("crate"); el.innerHTML="";
      RECORDS.forEach(function(r,i){ var d=i-ST.digIdx;
        var s=document.createElement("div"); s.className="sleeve"+(r.gem?" gem":"");
        s.style.transform="translateX("+(d*26)+"px) translateY("+(Math.abs(d)*6)+"px) rotate("+(d*4)+"deg) scale("+(d===0?1:.9)+")";
        s.style.zIndex=String(50-Math.abs(d)); s.style.opacity=Math.abs(d)>2?0:1; s.style.filter=d===0?"none":"brightness(.7)";
        var cov=document.createElement("canvas"); cov.className="coverCv"; cov.width=150; cov.height=150; drawCover(cov.getContext("2d"), r, i, 150);
        s.appendChild(cov);
        s.onclick=function(){ ST.digIdx=i; msg=""; var c=getCtx(); blip(c?c.currentTime:0,300+i*20); if(loadedIdx===i||Math.abs(d)===0){ renderTurntable(r); loadDeck(i); } paint(); };
        el.appendChild(s); });
      paintMsg();
    }
    function paintMsg(){ var m=$("dMsg"); m.innerHTML = msg.indexOf("That's the one")===0 ? "<b>"+msg+"</b>" : msg; }
  }

  /* mixes panel */
  function openMixes(){
    var html=ST.mixes.map(function(m){
      return '<div class="mix'+(m.unlocked?"":" locked")+'">'+
        '<button class="mixplay" data-id="'+m.id+'"'+(m.unlocked?"":" disabled")+'>'+(m.unlocked?"▶":"✕")+'</button>'+
        '<div class="mixinfo"><div class="t">'+m.t+'</div><div class="s">'+(m.unlocked?m.s:("LOCKED · "+m.src))+'</div></div>'+
        '<div class="mixtag">'+(m.unlocked?"UNLOCKED":"FIND IT")+'</div></div>';
    }).join("");
    if(unlockedCount()===0) html+='<p class="tiny" style="margin-top:6px;">Nothing here yet. Build a beat and pull the crate gem to unlock these.</p>';
    html+='<p class="tiny" style="margin-top:10px;">Previews are synth stand-ins — swap for real SoundCloud/Spotify embeds.</p>';
    openPanel("Secret mixes",html,function(){
      Array.prototype.forEach.call(document.querySelectorAll(".mixplay"),function(b){
        b.onclick=function(){ if(b.disabled)return; getCtx(); var m=ST.mixes.find(function(x){return x.id===b.dataset.id;}); if(m) playMotif(m.motif); };
      });
    });
  }

  /* merch panel */
  function openMerch(){
    ST.merchFound=true; refreshHub();
    openPanel("Hidden merch",
      '<div class="merchcard"><div class="merchvis"><span>KillsComfort</span></div>'+
      '<div class="merchmeta"><div class="eyebrow">STASH DROP · FOUND IN THE WAREHOUSE</div>'+
      '<h2 class="mid" style="font-size:30px;margin-top:8px;">Motion Is Faith<br>Heavyweight Hoodie</h2>'+
      '<p class="lede">Blacked-out print, oversized fit. Only shows up if you went looking. Limited run.</p>'+
      '<div class="row" style="margin-top:14px;"><a class="btn solid" href="/merch">Claim it →</a>'+
      '<button class="btn ghost" id="mClose2">Keep digging</button></div></div></div>',
      function(){ $("mClose2").onclick=closePanel; });
  }

  /* wall panel */
  function openWall(){
    openPanel("Community wall",
      '<div class="wallform"><input id="wInput" maxlength="120" placeholder="What pushed you past comfort?"><button class="btn solid" id="wPost">Post</button></div>'+
      '<div class="wallgrid" id="wGrid"></div>'+
      '<p class="tiny" style="margin-top:8px;">Demo wall — posts live in this session. Wire to Supabase to make them stick.</p>',
      function(){ paintWall();
        $("wPost").onclick=post; $("wInput").addEventListener("keydown",function(e){ if(e.key==="Enter") post(); });
      });
    function post(){ var v=$("wInput").value.trim(); if(!v)return; WALL.unshift({by:"YOU",p:v}); $("wInput").value=""; chime(); collect("COMMUNITY"); paintWall(); }
    function paintWall(){ $("wGrid").innerHTML=WALL.map(function(n){ return '<div class="note"><p>'+escapeHtml(n.p)+'</p><div class="by">'+escapeHtml(n.by)+'</div></div>'; }).join(""); }
  }
  function escapeHtml(s){ return s.replace(/[&<>"']/g,function(ch){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]; }); }

  /* endless: death + email capture */
  function isEmail(v){ return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); }
  function usernameFromEmail(email){
    var base = email.split("@")[0].replace(/[^a-zA-Z0-9 _-]/g, "").slice(0, 20);
    return base.length >= 2 ? base : "rider";
  }
  function postNewsletter(email){
    fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, source: "ride" })
    }).catch(function(){});
  }
  function saveRideScore(email, score){
    fetch("/api/street-run/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameFromEmail(email),
        email: email,
        score: score
      })
    }).catch(function(){});
  }
  function openEmailGate(){
    openPanel("You wiped out",
      '<p class="lede" style="margin-top:0;">Score <b style="color:var(--chrome-hi)">'+ST.lastScore+'m</b>. Drop your email to respawn — and get first word on KillsComfort events, drops & secret sets.</p>'+
      '<div class="wallform" style="margin-top:14px;"><input id="emInput" type="email" placeholder="you@email.com"><button class="btn solid" id="emGo">Respawn →</button></div>'+
      '<p class="tiny" id="emErr" style="margin-top:8px;color:#d8a07a;min-height:12px;"></p>'+
      '<button class="btn ghost" id="emBack" style="margin-top:4px;">Back to warehouse</button>',
      function(){ var i=$("emInput"); if(i) i.focus();
        $("emGo").onclick=submitEmail; $("emInput").addEventListener("keydown",function(e){ if(e.key==="Enter") submitEmail(); });
        $("emBack").onclick=function(){ closePanel(); goHub(); }; });
  }
  function submitEmail(){
    var v=$("emInput").value.trim();
    if(!isEmail(v)){ $("emErr").textContent="Enter a valid email to respawn."; return; }
    ST.email=v; ST.emailCaptured=true; try{ localStorage.setItem("kc_email",v); }catch(e){}
    postNewsletter(v);
    flash("✦ YOU'RE IN — RESPAWNING"); closePanel(); goEndless();
  }
  function openCrash(){
    openPanel("You wiped out",
      '<p class="lede" style="margin-top:0;">Score <b style="color:var(--chrome-hi)">'+ST.lastScore+'m</b> · Best <b>'+ST.best+'m</b></p>'+
      '<div class="row" style="margin-top:16px;"><button class="btn solid" id="crRun">Run again →</button><button class="btn ghost" id="crHub">Back to warehouse</button></div>',
      function(){ $("crRun").onclick=function(){ closePanel(); goEndless(); }; $("crHub").onclick=function(){ closePanel(); goHub(); }; });
  }
  function onDeath(score){
    stopRide=null; ST.lastScore=score; if(score>ST.best) ST.best=score;
    if(ST.emailCaptured && ST.email) saveRideScore(ST.email, score);
    if(!ST.emailCaptured) openEmailGate(); else openCrash();
  }

  /* exit chips */
  function renderChips(){
    var items=[["CURIOSITY",ST.values.indexOf("CURIOSITY")>-1],["COMMUNITY",ST.values.indexOf("COMMUNITY")>-1],
      ["DISCIPLINE",ST.values.indexOf("DISCIPLINE")>-1],["BEAT",ST.beatMade],["CRATE GEM",ST.gemFound],["STASH MERCH",ST.merchFound]];
    $("chips").innerHTML=items.map(function(it){ return '<span class="chip'+(it[1]?" got":"")+'">'+(it[1]?"✓ ":"· ")+it[0]+'</span>'; }).join("");
  }

  /* ---------- ride canvas ---------- */
  function startRide(opts){
    var onArrive=opts.onArrive||function(){}, onCollect=opts.onCollect||function(){}, onDeath=opts.onDeath||function(){}, mode=opts.mode||"collect";
    var rideSpec=opts.spec||getBikeSpec();
    var canvas=$("cv"), ctx2=canvas.getContext("2d"), wrap=$("s-ride");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var DPR=Math.min(2,window.devicePixelRatio||1), W=0,H=0, raf=0, last=performance.now();
    var S={dist:0,scroll:0,ground:0,rider:{y:0,vy:0},tokens:[],pops:[],lights:[],windows:[],buildings:[],
      escapes:[],graffiti:[],dumpsters:[],rain:[],phase:"ride",arrive:0,arrived:false,
      unlocked:false,warehouseX:0,runwayStart:0,
      skid:{active:false,until:0},obs:[],nextObs:600,score:0,speedBase:0.27,dead:false,
      flick:1,inited:false};
    var RUNWAY=1100;
    var VALUES=["CURIOSITY","COMMUNITY","DISCIPLINE"];
    function RIDER_SX(){ return W*.3; }
    function w2s(wx){ return RIDER_SX()+(wx-S.dist); }
    function loopX(start,factor,span){ var x=(start-S.scroll*factor)%span; if(x<0)x+=span; return x; }
    function ease(t){ return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
    function lerp(a,b,t){ return a+(b-a)*t; }
    function tokenY(tk){ return S.ground-120-tk.bandFrac*80; }
    function init(){
      S.ground=H*.8; S.lights=[]; for(var i=0;i<12;i++)S.lights.push(320+i*330);
      S.buildings=[]; for(i=0;i<14;i++)S.buildings.push({x:i*150+Math.random()*40,w:80+Math.random()*70,h:90+Math.random()*150});
      S.windows=[]; for(i=0;i<44;i++)S.windows.push({x:i*64+Math.random()*24,y:H*.16+Math.random()*H*.36,w:7+Math.random()*7,h:9+Math.random()*12,on:Math.random()<.32});
      S.escapes=[]; for(i=0;i<7;i++)S.escapes.push(i*280+Math.random()*80);
      S.graffiti=[]; for(i=0;i<10;i++)S.graffiti.push({x:i*220+Math.random()*120,y:S.ground-30-Math.random()*90,r:10+Math.random()*22});
      S.dumpsters=[]; for(i=0;i<5;i++)S.dumpsters.push(i*520+260+Math.random()*120);
      if(!S.inited && mode==="collect"){ S.tokens=[]; var vx=560; VALUES.forEach(function(v){ S.tokens.push({x:vx,bandFrac:Math.random(),v:v}); vx+=560; }); }
      S.rain=[]; if(!reduce) for(i=0;i<70;i++)S.rain.push({x:Math.random()*W,y:Math.random()*H,len:7+Math.random()*12,sp:.55+Math.random()*.5});
      S.inited=true;
    }
    function resize(){ var r=wrap.getBoundingClientRect(); W=r.width; H=r.height; canvas.width=Math.max(1,W*DPR); canvas.height=Math.max(1,H*DPR); ctx2.setTransform(DPR,0,0,DPR,0,0); init(); }
    var ro=new ResizeObserver(resize); ro.observe(wrap); resize();
    function hop(){ if(S.rider.y===0){ S.rider.vy=-1.05; var c=getCtx(); blip(c?c.currentTime:0,420); } }
    function doSkid(){ S.skid.until=performance.now()+700; var c=getCtx(); blip(c?c.currentTime:0,150); }
    function onPointer(e){ e.preventDefault(); var rect=canvas.getBoundingClientRect(); var zy=(e.clientY-rect.top)/Math.max(1,rect.height);
      if(mode==="endless" && zy>0.58) doSkid(); else hop(); }
    function onKey(e){ if(e.code==="Space"||e.code==="ArrowUp"){ e.preventDefault(); hop(); } else if(e.code==="ArrowDown"){ e.preventDefault(); if(mode==="endless") doSkid(); } }
    canvas.addEventListener("pointerdown",onPointer); window.addEventListener("keydown",onKey);

    function frame(now){ var dt=Math.min(40,now-last); last=now; if(!S.inited){ raf=requestAnimationFrame(frame); return; }
      var speed=.24;
      if(mode==="endless"){
        S.skid.active=(now<S.skid.until);
        var d=Math.min(1,S.dist/9000), sp=S.speedBase+0.26*d;
        S.dist+=dt*sp; S.scroll+=dt*sp;
        S.rider.vy+=.0026*dt; S.rider.y+=S.rider.vy*dt; if(S.rider.y>0){ S.rider.y=0; S.rider.vy=0; }
        S.score=Math.floor(S.dist/12);
        if(S.dist>=S.nextObs){ var type=Math.random()<.5?"pothole":"truck"; S.obs.push({x:S.dist+W*0.9,type:type,w:type==="truck"?96:48}); S.nextObs=S.dist+(560-300*d)+Math.random()*150; }
        var rxE=RIDER_SX(), gyE=S.ground;
        for(var oi=S.obs.length-1; oi>=0; oi--){ var o=S.obs[oi], ox=w2s(o.x); if(ox<-160){ S.obs.splice(oi,1); continue; }
          if(Math.abs(ox-rxE)<o.w/2+12){
            if(o.type==="pothole"){ if(gyE+Math.min(0,S.rider.y)>gyE-34) S.dead=true; }
            else { if(!S.skid.active && (gyE-56+S.rider.y)<gyE-30) S.dead=true; }
          }
          if(S.dead) break;
        }
        if(S.dead){ var cc=getCtx(); if(cc){ snare(cc.currentTime); bass(cc.currentTime,41); } cancelAnimationFrame(raf); cleanup(); onDeath(S.score); return; }
      } else if(S.phase==="ride"){
        S.dist+=dt*speed; S.scroll+=dt*speed; S.rider.vy+=.0026*dt; S.rider.y+=S.rider.vy*dt;
        if(S.rider.y>0){ S.rider.y=0; S.rider.vy=0; }
        var rx=RIDER_SX(), ry=S.ground-30+S.rider.y;
        for(var ti=S.tokens.length-1; ti>=0; ti--){ var tk=S.tokens[ti], sx=w2s(tk.x), ty=tokenY(tk)+Math.sin(now/300+tk.x)*6;
          if(Math.abs(sx-rx)<30&&Math.abs(ty-ry)<34){ S.tokens.splice(ti,1); onCollect(tk.v); var c=getCtx(); blip(c?c.currentTime:0,680); S.pops.push({x:rx,y:ty,text:"+"+tk.v,life:1});
            if(S.tokens.length===0){ S.unlocked=true; S.runwayStart=S.dist; S.warehouseX=S.dist+RUNWAY; $("ridehint").textContent="WAREHOUSE UNLOCKED → ROLL IN"; }
            continue; }
          if(sx<-60){ var maxX=S.dist; S.tokens.forEach(function(q){ if(q.x>maxX)maxX=q.x; }); tk.x=Math.max(S.dist+760,maxX+520); tk.bandFrac=Math.random(); }
        }
        if(S.unlocked && S.dist>=S.warehouseX){ S.phase="arrive"; $("ridehint").style.display="none"; }
      } else {
        S.arrive+=dt/1500;
        if(S.arrive>=1&&!S.arrived){ S.arrived=true; cancelAnimationFrame(raf); cleanup(); onArrive(); return; }
      }
      S.flick=.72+Math.random()*.28;
      S.pops.forEach(function(p){ p.life-=dt/1000; }); S.pops=S.pops.filter(function(p){return p.life>0;});
      draw(now); raf=requestAnimationFrame(frame);
    }
    function cleanup(){ ro.disconnect(); canvas.removeEventListener("pointerdown",onPointer); window.removeEventListener("keydown",onKey); }

    function draw(now){ var c=ctx2;
      var sky=c.createLinearGradient(0,0,0,H); sky.addColorStop(0,"#0a0a0d"); sky.addColorStop(.5,"#0d0d11"); sky.addColorStop(.82,"#0a0a0c"); sky.addColorStop(1,"#060607");
      c.fillStyle=sky; c.fillRect(0,0,W,H);
      var haze=c.createRadialGradient(W*.72,H*.4,8,W*.72,H*.4,H*.62); haze.addColorStop(0,"rgba(120,140,160,0.05)"); haze.addColorStop(1,"transparent"); c.fillStyle=haze; c.fillRect(0,0,W,H);
      buildings(now); fireEscapes(); neon(now); brick(); graffiti(); streetlights(now); road(); dumpsters(); fence(); if(!reduce) rain();
      if(mode==="endless"){ obstacles(now); } else { tokens(now); warehouse(); }
      var glow=riderGlow(), rx=RIDER_SX(), ry=S.ground+S.rider.y, scale=1, alpha=1;
      if(S.phase==="arrive"){ var t=ease(Math.min(1,S.arrive)), door=w2s(S.warehouseX); rx=lerp(RIDER_SX(),door,t); scale=lerp(1,.4,t); alpha=Math.max(0,1-Math.max(0,S.arrive-.55)/.45); }
      bike(rx,ry,now,glow,scale,alpha,(mode==="endless"&&S.skid.active));
      pops(); if(mode==="endless"){ scoreHud(); } else { progress(); } vignette();
    }
    function buildings(now){ var c=ctx2,span=W+320; c.fillStyle="#0e0e12";
      S.buildings.forEach(function(b){ var x=loopX(b.x,.16,span)-160; c.fillRect(x,H*.55-b.h,b.w,b.h); });
      S.windows.forEach(function(w){ var x=loopX(w.x,.06,W+240)-120; c.fillStyle=w.on?("rgba(205,210,216,"+(.1*S.flick)+")"):"rgba(38,40,46,0.5)"; c.fillRect(x,w.y,w.w,w.h); }); }
    function fireEscapes(){ var c=ctx2; c.strokeStyle="#15151a"; c.lineWidth=2;
      S.escapes.forEach(function(ex){ var x=loopX(ex,.3,W+300)-150,top=H*.22;
        for(var f=0;f<4;f++){ var y=top+f*46; c.beginPath(); c.moveTo(x,y); c.lineTo(x+54,y); c.lineTo(x+54,y+46); c.moveTo(x,y); c.lineTo(x,y+46); c.moveTo(x+6,y); c.lineTo(x+48,y+46); c.stroke(); } }); }
    function neon(now){ var c=ctx2,x=loopX(W*.2,.12,W+520)-260,y=H*.3,f=Math.random()<.06?.25:S.flick;
      c.strokeStyle="rgba(170,180,190,"+(.5*f)+")"; c.lineWidth=2; c.strokeRect(x,y,16,86);
      c.fillStyle="rgba(210,220,228,"+(.42*f)+")"; for(var i=0;i<4;i++)c.fillRect(x+4,y+10+i*18,8,8);
      var g=c.createRadialGradient(x+8,y+43,2,x+8,y+43,70); g.addColorStop(0,"rgba(180,195,205,"+(.16*f)+")"); g.addColorStop(1,"transparent"); c.fillStyle=g; c.fillRect(x-60,y-30,140,160); }
    function brick(){ var c=ctx2; c.strokeStyle="rgba(30,30,36,0.6)"; c.lineWidth=1; var off=(S.scroll*.5)%26;
      for(var y=S.ground-120;y<S.ground;y+=13){ c.beginPath(); c.moveTo(0,y); c.lineTo(W,y); c.stroke(); }
      for(var x=-off;x<W;x+=26){ c.beginPath(); c.moveTo(x,S.ground-120); c.lineTo(x,S.ground); c.stroke(); } }
    function graffiti(){ var c=ctx2; S.graffiti.forEach(function(g){ var x=loopX(g.x,.5,W+300)-150;
      c.strokeStyle="rgba(120,122,130,0.22)"; c.lineWidth=3; c.beginPath(); c.moveTo(x-g.r,g.y);
      c.quadraticCurveTo(x,g.y-g.r,x+g.r,g.y); c.quadraticCurveTo(x,g.y+g.r*.6,x-g.r,g.y); c.stroke(); }); }
    function streetlights(now){ var c=ctx2; S.lights.forEach(function(lx){ var sx=w2s(lx); if(sx<-120||sx>W+120)return;
      c.strokeStyle="#101014"; c.lineWidth=4; c.beginPath(); c.moveTo(sx+40,0); c.lineTo(sx+40,H*.2); c.lineTo(sx,H*.2); c.stroke();
      var cone=c.createLinearGradient(sx,H*.2,sx,S.ground); cone.addColorStop(0,"rgba(200,205,210,"+(.1*S.flick)+")"); cone.addColorStop(1,"transparent");
      c.fillStyle=cone; c.beginPath(); c.moveTo(sx-6,H*.2); c.lineTo(sx+6,H*.2); c.lineTo(sx+70,S.ground); c.lineTo(sx-70,S.ground); c.closePath(); c.fill();
      var pool=c.createRadialGradient(sx,S.ground,4,sx,S.ground,90); pool.addColorStop(0,"rgba(190,196,204,"+(.12*S.flick)+")"); pool.addColorStop(1,"transparent");
      c.fillStyle=pool; c.beginPath(); c.ellipse(sx,S.ground+6,90,16,0,0,Math.PI*2); c.fill(); }); }
    function road(){ var c=ctx2; var a=c.createLinearGradient(0,S.ground,0,H); a.addColorStop(0,"#0c0c0f"); a.addColorStop(1,"#070709");
      c.fillStyle=a; c.fillRect(0,S.ground,W,H-S.ground);
      c.strokeStyle="#23242a"; c.lineWidth=2; c.beginPath(); c.moveTo(0,S.ground); c.lineTo(W,S.ground); c.stroke();
      S.lights.forEach(function(lx){ var sx=w2s(lx); if(sx<-40||sx>W+40)return; var g=c.createLinearGradient(sx,S.ground,sx,H);
        g.addColorStop(0,"rgba(180,190,200,"+(.06*S.flick)+")"); g.addColorStop(1,"transparent"); c.fillStyle=g; c.fillRect(sx-8,S.ground,16,H-S.ground); });
      c.fillStyle="rgba(120,124,130,0.4)"; var off=(S.scroll*.9)%70; for(var x=-off;x<W;x+=70)c.fillRect(x,S.ground+30,26,3); }
    function dumpsters(){ var c=ctx2; S.dumpsters.forEach(function(dx){ var x=w2s(dx); if(x<-120||x>W+120)return; var w=90,h=46,y=S.ground-h;
      c.fillStyle="#0c0c0f"; c.fillRect(x,y,w,h); c.strokeStyle="#1c1c22"; c.lineWidth=2; c.strokeRect(x,y,w,h);
      c.fillStyle="#101015"; c.fillRect(x-4,y-6,w+8,8); c.fillStyle="#0a0a0d"; c.beginPath();
      c.ellipse(x+w+16,S.ground-8,14,12,0,0,Math.PI*2); c.ellipse(x+w+34,S.ground-6,11,10,0,0,Math.PI*2); c.fill(); }); }
    function fence(){ var c=ctx2; c.strokeStyle="rgba(60,62,70,0.25)"; c.lineWidth=1; var off=(S.scroll*.7)%18,top=S.ground-70;
      for(var x=-off;x<W;x+=18){ c.beginPath(); c.moveTo(x,top); c.lineTo(x+18,top+18); c.moveTo(x+18,top); c.lineTo(x,top+18); c.stroke(); } }
    function rain(){ var c=ctx2; c.strokeStyle="rgba(170,178,188,0.18)"; c.lineWidth=1;
      S.rain.forEach(function(d){ d.y+=d.sp*14; d.x-=d.sp*3; if(d.y>H){ d.y=-10; d.x=Math.random()*W; } c.beginPath(); c.moveTo(d.x,d.y); c.lineTo(d.x-2,d.y+d.len); c.stroke(); }); }
    function riderGlow(){ var g=0; S.lights.forEach(function(lx){ g=Math.max(g,1-Math.abs(S.dist-lx)/200); }); return Math.max(0,Math.min(1,g)); }
    function tokens(now){ var c=ctx2; S.tokens.forEach(function(tk){ var sx=w2s(tk.x); if(sx<-40||sx>W+40)return; var ty=tokenY(tk)+Math.sin(now/300+tk.x)*6;
      c.save(); c.translate(sx,ty); c.strokeStyle="rgba(231,231,236,0.85)"; c.lineWidth=2; c.strokeRect(-22,-14,44,28);
      var g=c.createRadialGradient(0,0,2,0,0,30); g.addColorStop(0,"rgba(220,224,228,0.14)"); g.addColorStop(1,"transparent"); c.fillStyle=g; c.fillRect(-30,-22,60,44);
      c.fillStyle="#e9e9ec"; c.font='700 13px "Space Mono",monospace'; c.textAlign="center"; c.textBaseline="middle"; c.fillText(tk.v.slice(0,3),0,1); c.restore(); }); }
    function warehouse(){ if(!S.unlocked)return; var c=ctx2,doorX=w2s(S.warehouseX); if(doorX>W+200)return; var wallLeft=doorX-150;
      c.fillStyle="#0b0b0e"; c.fillRect(wallLeft,0,W-wallLeft+220,S.ground);
      c.strokeStyle="rgba(40,40,48,0.6)"; c.lineWidth=1; for(var x=wallLeft;x<W+220;x+=12){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,S.ground); c.stroke(); }
      var dw=120,dh=H*.34,dx=doorX-dw/2,dy=S.ground-dh; c.fillStyle="#050506"; c.fillRect(dx,dy,dw,dh);
      var inner=c.createLinearGradient(dx,dy,dx,S.ground); inner.addColorStop(0,"rgba(150,156,164,0.10)"); inner.addColorStop(1,"rgba(120,126,134,0.02)"); c.fillStyle=inner; c.fillRect(dx,dy,dw,dh);
      c.fillStyle="#101014"; c.fillRect(dx-6,dy-26,dw+12,24); c.strokeStyle="rgba(60,62,70,0.7)";
      for(var i=0;i<5;i++){ var yy=dy-24+i*5; c.beginPath(); c.moveTo(dx-6,yy); c.lineTo(dx+dw+6,yy); c.stroke(); }
      var lampX=doorX,lampY=dy-44; c.fillStyle="rgba(210,216,222,"+(.5*S.flick)+")"; c.beginPath(); c.arc(lampX,lampY,5,0,Math.PI*2); c.fill();
      var cone=c.createRadialGradient(lampX,lampY,3,lampX,lampY,110); cone.addColorStop(0,"rgba(200,206,214,"+(.14*S.flick)+")"); cone.addColorStop(1,"transparent");
      c.fillStyle=cone; c.beginPath(); c.moveTo(lampX-8,lampY); c.lineTo(lampX+8,lampY); c.lineTo(lampX+90,S.ground); c.lineTo(lampX-90,S.ground); c.closePath(); c.fill();
      c.fillStyle="rgba(150,152,160,0.55)"; c.font='700 12px "Space Mono",monospace'; c.textAlign="center"; c.textBaseline="alphabetic";
      c.fillText("BAY 07  //  KILLSCOMFORT",doorX,dy-56); c.fillStyle="rgba(200,204,210,0.6)"; c.fillText("✦",doorX,dy+dh*.4); }
    function neonLabel(c,x,y,arrow,label,col,pulse){ c.save(); c.shadowColor=col; c.shadowBlur=10*(pulse||1); c.fillStyle=col; c.textAlign="center"; c.textBaseline="alphabetic";
      c.font='800 13px "Space Mono",monospace'; c.fillText(arrow,x,y);
      c.font='800 9px "Space Mono",monospace'; c.fillText(label,x,y+11); c.restore(); }
    function obstacles(now){ var c=ctx2,gy=S.ground; S.obs.forEach(function(o){ var ox=w2s(o.x); if(ox<-160||ox>W+180)return;
      var pulse=0.55+0.45*Math.sin(now/180+o.x);
      if(o.type==="pothole"){
        var C="#36e6ff", hw=o.w/2;
        var gg=c.createRadialGradient(ox,gy,2,ox,gy,o.w); gg.addColorStop(0,"rgba(54,230,255,"+(0.20*pulse)+")"); gg.addColorStop(1,"transparent");
        c.fillStyle=gg; c.fillRect(ox-o.w,gy-12,o.w*2,44);
        c.save(); c.shadowColor=C; c.shadowBlur=18*pulse;
        c.fillStyle="#04080b"; c.beginPath(); c.moveTo(ox-hw,gy); c.lineTo(ox-hw+10,gy+16); c.lineTo(ox+hw-10,gy+16); c.lineTo(ox+hw,gy); c.closePath(); c.fill();
        c.strokeStyle=C; c.lineWidth=2.6; c.beginPath(); c.moveTo(ox-hw,gy); c.lineTo(ox+hw,gy); c.stroke();
        c.lineWidth=2; c.beginPath(); c.moveTo(ox-hw,gy); c.lineTo(ox-hw+10,gy+16); c.moveTo(ox+hw,gy); c.lineTo(ox+hw-10,gy+16); c.stroke();
        c.globalAlpha=0.5; c.lineWidth=1; c.beginPath(); c.moveTo(ox-hw+5,gy+8); c.lineTo(ox+hw-5,gy+8); c.stroke(); c.globalAlpha=1;
        c.restore();
        neonLabel(c,ox,gy-70,"▲","JUMP",C,pulse);
      } else {
        var K="#ff9a2e", top=gy-92, bot=gy-34, w=o.w;
        c.save(); c.shadowColor=K; c.shadowBlur=16*pulse;
        c.fillStyle="rgba(10,7,3,0.85)"; c.fillRect(ox-w/2,top,w,bot-top);
        c.strokeStyle=K; c.lineWidth=2.6; c.strokeRect(ox-w/2,top,w,bot-top);
        c.lineWidth=2; c.strokeRect(ox+w/2-2,top+6,14,bot-top-6);
        c.globalAlpha=0.7; c.lineWidth=1.4; c.beginPath(); c.moveTo(ox-w/2,(top+bot)/2); c.lineTo(ox+w/2,(top+bot)/2); c.stroke(); c.globalAlpha=1;
        c.lineWidth=3; c.beginPath(); c.moveTo(ox-w/2-6,bot+2); c.lineTo(ox+w/2+6,bot+2); c.stroke();
        c.restore();
        c.save(); c.shadowColor=K; c.shadowBlur=6*pulse; c.fillStyle="rgba(255,185,100,0.92)"; c.font='700 11px "Space Mono",monospace'; c.textAlign="center"; c.textBaseline="middle"; c.fillText("KC HAUL",ox-2,(top+bot)/2); c.restore();
        c.save(); c.shadowColor=K; c.shadowBlur=8*pulse; c.strokeStyle=K; c.lineWidth=2;
        for(var k=-1;k<=1;k++){ var cx=ox+k*14; c.beginPath(); c.moveTo(cx-5,gy-16); c.lineTo(cx,gy-10); c.lineTo(cx+5,gy-16); c.stroke(); }
        c.restore();
        neonLabel(c,ox,top-22,"▼","DUCK",K,pulse);
      }
    }); }
    function scoreHud(){ var c=ctx2; c.fillStyle="#9a9aa3"; c.font='700 12px "Space Mono",monospace'; c.textBaseline="alphabetic";
      c.textAlign="left"; c.fillText("// dist: "+S.score+"m",22,30);
      c.textAlign="right"; c.fillStyle="#c7cace"; c.fillText("best: "+Math.max(ST.best,S.score)+"m",W-22,30); }
    function seg(c,a,b){ c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); }
    function wheel(c,cx,cy,r,rot,glow){
      c.lineWidth=r*.16; c.strokeStyle="#34373c"; c.beginPath(); c.arc(cx,cy,r,0,Math.PI*2); c.stroke();
      var ro2=r*.86,ri=r*.46; c.save(); c.beginPath(); c.arc(cx,cy,ro2,0,Math.PI*2); c.arc(cx,cy,ri,0,Math.PI*2,true);
      var g=c.createLinearGradient(cx,cy-ro2,cx,cy+ro2),hi=.78+glow*.22;
      g.addColorStop(0,"rgba(238,241,243,"+hi+")"); g.addColorStop(.48,"rgba(150,155,160,0.85)"); g.addColorStop(.52,"rgba(70,73,78,0.95)"); g.addColorStop(1,"rgba(36,38,41,1)");
      c.fillStyle=g; c.fill("evenodd"); c.restore();
      c.strokeStyle="rgba(200,205,210,"+(.5+glow*.4)+")"; c.lineWidth=1;
      for(var i=0;i<5;i++){ var a=rot+i*Math.PI*2/5; c.beginPath(); c.moveTo(cx+Math.cos(a)*ri,cy+Math.sin(a)*ri); c.lineTo(cx+Math.cos(a)*ro2,cy+Math.sin(a)*ro2); c.stroke(); }
      c.fillStyle="rgba(225,228,232,"+(.7+glow*.3)+")"; c.beginPath(); c.arc(cx,cy,r*.12,0,Math.PI*2); c.fill();
      var sa=rot*.6; c.strokeStyle="rgba(255,255,255,"+(.4+glow*.5)+")"; c.lineWidth=r*.18; c.beginPath(); c.arc(cx,cy,r*.66,sa,sa+.7); c.stroke();
    }
    function bike(x,gy,now,glow,scale,alpha,skid){ var c=ctx2; c.save(); c.globalAlpha=alpha;
      var s=scale*0.82; c.save(); c.translate(x,gy); if(skid) c.rotate(-0.13);
      drawCyclist(c, 0, 0, s, now*0.006, now*0.02, rideSpec); c.restore();
      if(skid){ var Rw=26*s; c.strokeStyle="rgba(40,42,48,0.8)"; c.lineWidth=3; c.beginPath(); c.moveTo(x-Rw*2.6,gy+0.5); c.lineTo(x-Rw*0.6,gy+0.5); c.stroke();
        for(var sI=0;sI<5;sI++){ var spx=x-Rw*1.6-Math.random()*24, spy=gy-Math.random()*6; c.strokeStyle="rgba(255,"+(210+Math.random()*40)+","+(150+Math.random()*50)+",0.9)"; c.lineWidth=1.4; c.beginPath(); c.moveTo(spx,spy); c.lineTo(spx-4-Math.random()*6,spy+2+Math.random()*4); c.stroke(); } }
      c.restore(); }
    function pops(){ var c=ctx2; S.pops.forEach(function(p){ c.save(); c.globalAlpha=Math.max(0,p.life); c.fillStyle="#e9e9ec";
      c.font='700 18px "Archivo Narrow","Arial Narrow",Impact,sans-serif'; c.textAlign="center"; c.fillText(p.text,p.x,p.y-(1-p.life)*44); c.restore(); }); }
    function progress(){ var c=ctx2,pw=W-44,frac,label;
      if(!S.unlocked){ var got=3-S.tokens.length; frac=got/3; label="// tags: "+got+"/3"; }
      else { frac=Math.min(1,(S.dist-S.runwayStart)/Math.max(1,S.warehouseX-S.runwayStart)); label="// to_the_warehouse"; }
      c.fillStyle="#1a1a1e"; c.fillRect(22,18,pw,3); c.fillStyle="#c7cace"; c.fillRect(22,18,pw*frac,3);
      c.fillStyle="#6f6f78"; c.font='10px "Space Mono",monospace'; c.textAlign="left"; c.textBaseline="alphabetic"; c.fillText(label,22,40); }
    function vignette(){ var c=ctx2,v=c.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.8),dark=S.phase==="arrive"?.4+ease(S.arrive)*.6:.4;
      v.addColorStop(0,"transparent"); v.addColorStop(1,"rgba(0,0,0,"+dark+")"); c.fillStyle=v; c.fillRect(0,0,W,H); }

    raf=requestAnimationFrame(frame);
    return function(){ cancelAnimationFrame(raf); cleanup(); };
  }

  /* ---------- arcade lobby (overworld entrance) ---------- */
  function startLobby(onEnter){
    var canvas=$("lcv"), ctx=canvas.getContext("2d");
    var DPR=Math.min(2,window.devicePixelRatio||1), W=0,H=0;
    var S={ floorY:0, char:{x:0,face:1,phase:0,moving:false}, target:null, pending:null,
      props:{}, cam:{zoom:1,cx:0,cy:0}, zoom:{active:false,t:0}, bubble:{text:"",until:0}, jam:0, inited:false };
    var keyL=false,keyR=false;
    function rr(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
    function ease(t){ return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
    function layout(){
      S.floorY=H*0.82;
      var cx=W*0.74, cw=150, ch=248, bx=cx-cw/2, by=S.floorY-ch, sw=cw-40, sh=92, sy0=by+50;
      S.props.cabinet={x:cx,cw:cw,ch:ch,bx:bx,by:by, screen:{cx:cx, cy:sy0+sh/2, w:sw, h:sh}, reach:100, approach:cx-76};
      S.props.boombox={x:W*0.44, reach:56, approach:W*0.44-30};
      S.props.poster ={x:W*0.19, y:H*0.30, reach:74, approach:W*0.19};
      if(!S.inited){ S.char.x=W*0.32; S.inited=true; }
      S.char.x=Math.max(40,Math.min(W-40,S.char.x));
    }
    function resize(){ var r=canvas.getBoundingClientRect(); W=r.width; H=r.height; canvas.width=Math.max(1,W*DPR); canvas.height=Math.max(1,H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); layout(); }
    window.addEventListener("resize",resize); resize();

    function nearest(){ var c=S.char.x, p=S.props;
      if(Math.abs(c-p.cabinet.x)<p.cabinet.reach) return "cabinet";
      if(Math.abs(c-p.boombox.x)<p.boombox.reach) return "boombox";
      if(Math.abs(c-p.poster.x)<p.poster.reach) return "poster";
      return null; }
    function doInteract(name){
      if(name==="cabinet"){ S.zoom.active=true; S.zoom.t=0; var c=getCtx(); if(c){ blip(c.currentTime,520); blip(c.currentTime+.08,700); } }
      else if(name==="poster"){ S.bubble={text:"Free daytime arts picnic - Oct 17 - Wynwood. Pull up.",until:performance.now()+3400}; }
      else if(name==="boombox"){ playMotif([0,3,7,10,7,3,10,7],196); S.jam=performance.now()+1500; S.bubble={text:"\u266a",until:performance.now()+1400}; }
    }
    function interactNearest(){ var n=nearest(); if(n) doInteract(n); }
    function onKey(e){ if(S.zoom.active)return; getCtx();
      if(e.code==="ArrowLeft"||e.code==="KeyA"){ keyL=true; S.target=null; S.pending=null; }
      else if(e.code==="ArrowRight"||e.code==="KeyD"){ keyR=true; S.target=null; S.pending=null; }
      else if(e.code==="ArrowUp"||e.code==="Space"||e.code==="KeyE"){ e.preventDefault(); interactNearest(); } }
    function onKeyUp(e){ if(e.code==="ArrowLeft"||e.code==="KeyA")keyL=false; if(e.code==="ArrowRight"||e.code==="KeyD")keyR=false; }
    function onPointer(e){ if(S.zoom.active)return; e.preventDefault(); getCtx();
      var r=canvas.getBoundingClientRect(), tx=(e.clientX-r.left), ty=(e.clientY-r.top), p=S.props;
      if(Math.abs(tx-p.cabinet.x)<96 && ty<S.floorY){ S.target=p.cabinet.approach; S.pending="cabinet"; }
      else if(Math.abs(tx-p.boombox.x)<46){ S.target=p.boombox.approach; S.pending="boombox"; }
      else if(Math.abs(tx-p.poster.x)<52 && ty<S.floorY*0.62){ S.target=p.poster.approach; S.pending="poster"; }
      else { S.target=Math.max(40,Math.min(W-40,tx)); S.pending=null; } }
    canvas.addEventListener("pointerdown",onPointer); window.addEventListener("keydown",onKey); window.addEventListener("keyup",onKeyUp);
    function cleanup(){ window.removeEventListener("resize",resize); canvas.removeEventListener("pointerdown",onPointer); window.removeEventListener("keydown",onKey); window.removeEventListener("keyup",onKeyUp); touchCtl.cleanup(); }

    var raf=0,last=performance.now();
    function frame(now){ var dt=Math.min(40,now-last); last=now;
      if(S.zoom.active){ S.zoom.t+=dt/1150; var e=ease(Math.min(1,S.zoom.t)), sc=S.props.cabinet.screen;
        var Z=Math.max(W/sc.w,H/sc.h)*1.15; S.cam.zoom=1+(Z-1)*e; S.cam.cx=W/2+(sc.cx-W/2)*e; S.cam.cy=H/2+(sc.cy-H/2)*e;
        if(S.zoom.t>=1){ cancelAnimationFrame(raf); cleanup(); onEnter(); return; } }
      else {
        var dir=0; if(keyL)dir=-1; else if(keyR)dir=1;
        if(dir===0 && S.target!=null){ if(Math.abs(S.target-S.char.x)<4){ var pd=S.pending; S.target=null; S.pending=null; if(pd)doInteract(pd); } else dir=(S.target>S.char.x)?1:-1; }
        S.char.moving=(dir!==0);
        if(dir!==0){ S.char.face=dir; S.char.x+=dir*0.24*dt; S.char.x=Math.max(40,Math.min(W-40,S.char.x)); S.char.phase+=dt*0.012; }
        else { var n=nearest(); if(n==="cabinet") S.char.face=(S.props.cabinet.x>S.char.x)?1:-1; }
      }
      draw(now); raf=requestAnimationFrame(frame);
    }
    function draw(now){ var c=ctx;
      c.clearRect(0,0,W,H);
      c.save(); c.translate(W/2,H/2); c.scale(S.cam.zoom,S.cam.zoom); c.translate(-S.cam.cx,-S.cam.cy);
      room(c,now); poster(c); boombox(c,now); cabinet(c,now);
      drawChar(c,S.char.x,S.floorY,S.char.face,S.char.phase,S.char.moving,now);
      if(!S.zoom.active){ var n=nearest();
        if(n==="cabinet") prompt(c,S.props.cabinet.x,S.props.cabinet.by-8,"\u25b2 PLAY");
        else if(n==="boombox") prompt(c,S.props.boombox.x,S.floorY-42,"\u25b2 JAM");
        else if(n==="poster") prompt(c,S.props.poster.x,S.props.poster.y-64,"\u25b2 READ");
      }
      if(S.bubble.text && now<S.bubble.until) bubble(c,S.char.x,S.floorY-70,S.bubble.text);
      c.restore();
      var uiA = S.zoom.active ? Math.max(0,1-S.zoom.t*2.2) : 1;
      if(uiA>0){ c.save(); c.globalAlpha=uiA; c.fillStyle="#6f6f78"; c.font='11px "Space Mono",monospace'; c.textAlign="center"; c.textBaseline="alphabetic";
        c.fillText("\u2190 \u2192  or TAP to walk   \u00b7   \u2191 to interact", W/2, H-20); c.restore(); }
      vignette(c);
      if(S.zoom.active){ c.fillStyle="rgba(4,7,10,"+Math.max(0,(S.zoom.t-0.62)/0.38)+")"; c.fillRect(0,0,W,H); }
    }
    function room(c,now){ var fy=S.floorY;
      var wall=c.createLinearGradient(0,0,0,fy); wall.addColorStop(0,"#0b0b0e"); wall.addColorStop(1,"#0e0e12"); c.fillStyle=wall; c.fillRect(0,0,W,fy);
      c.strokeStyle="rgba(38,38,46,.5)"; c.lineWidth=1; for(var x=0;x<W;x+=64){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,fy); c.stroke(); }
      c.save(); c.shadowColor="#8fdcff"; c.shadowBlur=16; c.fillStyle="rgba(190,228,246,.9)"; c.font='700 22px "Space Mono",monospace'; c.textAlign="center"; c.textBaseline="middle"; c.fillText("KILLSCOMFORT ARCADE",W/2,H*0.14); c.restore();
      c.fillStyle="rgba(120,124,132,.4)"; c.font='10px "Space Mono",monospace'; c.fillText("// motion is faith",W/2,H*0.14+22);
      var fl=c.createLinearGradient(0,fy,0,H); fl.addColorStop(0,"#0c0c0f"); fl.addColorStop(1,"#070709"); c.fillStyle=fl; c.fillRect(0,fy,W,H-fy);
      c.strokeStyle="#20222a"; c.lineWidth=2; c.beginPath(); c.moveTo(0,fy); c.lineTo(W,fy); c.stroke();
      c.strokeStyle="rgba(90,94,102,.14)"; c.lineWidth=1;
      for(var i=-7;i<=7;i++){ c.beginPath(); c.moveTo(W/2+i*26,fy); c.lineTo(W/2+i*150,H); c.stroke(); }
    }
    function poster(c){ var p=S.props.poster, pw=84,ph=112, px=p.x-pw/2, py=p.y-ph/2;
      c.fillStyle="#111116"; c.fillRect(px,py,pw,ph); c.strokeStyle="rgba(120,124,132,.5)"; c.lineWidth=2; c.strokeRect(px,py,pw,ph);
      c.fillStyle="rgba(210,214,220,.85)"; c.textAlign="center"; c.textBaseline="alphabetic";
      c.font='700 13px "Archivo Narrow","Arial Narrow",Impact,sans-serif';
      ["COMMUNITY","BY KILLSCOMFORT","","OCT 17","WYNWOOD"].forEach(function(t,i){ c.fillText(t,p.x,py+22+i*20); });
    }
    function boombox(c,now){ var b=S.props.boombox, fy=S.floorY, bw=64,bh=34, bx=b.x-bw/2, by=fy-bh;
      c.fillStyle="#0e0e13"; c.fillRect(bx,by,bw,bh); c.strokeStyle="#2a2a30"; c.lineWidth=1; c.strokeRect(bx,by,bw,bh);
      c.strokeStyle="#2a2a30"; c.lineWidth=2; c.beginPath(); c.arc(b.x,by,14,Math.PI,0); c.stroke();
      c.fillStyle="#17171d"; c.beginPath(); c.arc(bx+16,by+bh/2,9,0,Math.PI*2); c.arc(bx+bw-16,by+bh/2,9,0,Math.PI*2); c.fill();
      c.fillStyle="#26262e"; c.beginPath(); c.arc(bx+16,by+bh/2,3,0,Math.PI*2); c.arc(bx+bw-16,by+bh/2,3,0,Math.PI*2); c.fill();
      if(now<S.jam){ c.save(); c.shadowColor="#cfeaf5"; c.shadowBlur=8; c.fillStyle="rgba(210,235,245,.9)"; c.font='12px "Space Mono",monospace'; c.textAlign="center";
        c.fillText("\u266a",bx-6,by-6); c.fillText("\u266b",bx+bw+6,by-12); c.restore(); }
    }
    function cabinet(c,now){ var cb=S.props.cabinet, x=cb.x, fy=S.floorY, cw=cb.cw, ch=cb.ch, bx=cb.bx, by=cb.by, sc=cb.screen;
      var pool=c.createRadialGradient(x,fy,4,x,fy,130); pool.addColorStop(0,"rgba(90,200,240,.14)"); pool.addColorStop(1,"transparent"); c.fillStyle=pool; c.beginPath(); c.ellipse(x,fy,130,22,0,0,Math.PI*2); c.fill();
      c.fillStyle="#0e0e13"; rr(c,bx,by,cw,ch,10); c.fill();
      c.save(); c.shadowColor="#36e6ff"; c.shadowBlur=14; c.strokeStyle="#36e6ff"; c.lineWidth=3; c.beginPath(); c.moveTo(bx+3,by+30); c.lineTo(bx+3,fy-12); c.stroke(); c.restore();
      c.save(); c.shadowColor="#ff9a2e"; c.shadowBlur=14; c.strokeStyle="#ff9a2e"; c.lineWidth=3; c.beginPath(); c.moveTo(bx+cw-3,by+30); c.lineTo(bx+cw-3,fy-12); c.stroke(); c.restore();
      c.fillStyle="#141419"; c.fillRect(bx+8,by+6,cw-16,30);
      c.save(); c.shadowColor="#cfeaf5"; c.shadowBlur=8; c.fillStyle="rgba(220,235,245,.92)"; c.font='700 13px "Space Mono",monospace'; c.textAlign="center"; c.textBaseline="middle"; c.fillText("KILLSCOMFORT",x,by+21); c.restore();
      var sx=sc.cx-sc.w/2, sy=sc.cy-sc.h/2;
      c.fillStyle="#04070a"; c.fillRect(sx,sy,sc.w,sc.h);
      c.strokeStyle="rgba(120,200,230,.06)"; c.lineWidth=1; for(var yy=sy+2;yy<sy+sc.h;yy+=3){ c.beginPath(); c.moveTo(sx,yy); c.lineTo(sx+sc.w,yy); c.stroke(); }
      var sg=c.createRadialGradient(sc.cx,sc.cy,4,sc.cx,sc.cy,sc.w*0.7); sg.addColorStop(0,"rgba(54,230,255,.12)"); sg.addColorStop(1,"transparent"); c.fillStyle=sg; c.fillRect(sx,sy,sc.w,sc.h);
      c.save(); c.shadowColor="#36e6ff"; c.shadowBlur=10; c.strokeStyle="rgba(120,210,240,.5)"; c.lineWidth=1.5; c.strokeRect(sx,sy,sc.w,sc.h); c.restore();
      c.textAlign="center"; c.textBaseline="middle";
      c.fillStyle="rgba(224,238,246,.95)"; c.font='700 13px "Archivo Narrow","Arial Narrow",Impact,sans-serif'; c.fillText("MOTION IS FAITH",sc.cx,sc.cy-10);
      if(Math.floor(now/500)%2===0){ c.save(); c.shadowColor="#36e6ff"; c.shadowBlur=8; c.fillStyle="#36e6ff"; c.font='700 10px "Space Mono",monospace'; c.fillText("\u25b6 PRESS START",sc.cx,sc.cy+16); c.restore(); }
      c.fillStyle="#111117"; c.fillRect(bx+10,by+ch-96,cw-20,36);
      c.strokeStyle="#3a3a42"; c.lineWidth=4; c.beginPath(); c.moveTo(x-26,by+ch-66); c.lineTo(x-26,by+ch-82); c.stroke();
      c.fillStyle="#e5534b"; c.beginPath(); c.arc(x-26,by+ch-86,5,0,Math.PI*2); c.fill();
      ["#36e6ff","#ff9a2e","#e9e9ec"].forEach(function(col,i){ c.fillStyle=col; c.beginPath(); c.arc(x+2+i*16,by+ch-72,4,0,Math.PI*2); c.fill(); });
      c.fillStyle="#000"; c.fillRect(x-6,by+ch-44,12,4);
    }
    function drawChar(c,x,fy,face,phase,moving,now){ c.save(); c.translate(x,fy);
      var bob=moving?Math.abs(Math.sin(phase))*2:Math.sin(now/520)*1.3; c.translate(0,-bob);
      c.fillStyle="rgba(0,0,0,.35)"; c.beginPath(); c.ellipse(0,1,16,4,0,0,Math.PI*2); c.fill();
      if(face<0) c.scale(-1,1);
      var G=c.createLinearGradient(0,-62,0,0); G.addColorStop(0,"#ffffff"); G.addColorStop(.4,"#dfe3e7"); G.addColorStop(.66,"#aab0b7"); G.addColorStop(1,"#6c7178");
      var stride=moving?Math.sin(phase)*8:3, hipY=-24;
      c.strokeStyle=G; c.lineCap="round"; c.lineWidth=5;
      c.beginPath(); c.moveTo(0,hipY); c.lineTo(-stride*0.6,-2); c.stroke();
      c.beginPath(); c.moveTo(0,hipY); c.lineTo(stride*0.6,-2); c.stroke();
      c.fillStyle=G; c.beginPath(); c.moveTo(-7,hipY); c.lineTo(7,hipY); c.lineTo(6,-46); c.lineTo(-6,-46); c.closePath(); c.fill();
      c.strokeStyle="rgba(255,255,255,.5)"; c.lineWidth=1; c.beginPath(); c.moveTo(-2,hipY); c.lineTo(-2,-45); c.stroke();
      var arm=moving?Math.sin(phase+Math.PI)*7:2; c.strokeStyle=G; c.lineWidth=4; c.beginPath(); c.moveTo(0,-44); c.lineTo(arm*0.6,-26); c.stroke();
      var hy=-54, hg=c.createRadialGradient(-2,hy-2,1,0,hy,8); hg.addColorStop(0,"#ffffff"); hg.addColorStop(.5,"#cfd3d8"); hg.addColorStop(1,"#7d828a");
      c.fillStyle=hg; c.beginPath(); c.arc(0,hy,7,0,Math.PI*2); c.fill();
      c.fillStyle="rgba(18,20,24,.7)"; c.fillRect(1,hy-2,6,3);
      c.fillStyle="rgba(255,255,255,.85)"; c.beginPath(); c.arc(-2,hy-2,1.3,0,Math.PI*2); c.fill();
      c.restore();
    }
    function prompt(c,x,y,text){ c.save(); c.font='700 10px "Space Mono",monospace'; var w=c.measureText(text).width+16;
      c.fillStyle="rgba(10,10,12,.85)"; c.strokeStyle="rgba(130,134,142,.6)"; c.lineWidth=1; rr(c,x-w/2,y-16,w,18,4); c.fill(); c.stroke();
      c.fillStyle="#e9e9ec"; c.textAlign="center"; c.textBaseline="middle"; c.fillText(text,x,y-7); c.restore(); }
    function bubble(c,x,y,text){ c.save(); c.font='700 11px "Space Mono",monospace';
      var lines=wrap(c,text,190), w=0; lines.forEach(function(ln){ w=Math.max(w,c.measureText(ln).width); }); w+=18; var h=lines.length*15+10;
      c.fillStyle="rgba(14,14,18,.95)"; c.strokeStyle="rgba(130,134,142,.6)"; c.lineWidth=1; rr(c,x-w/2,y-h,w,h,6); c.fill(); c.stroke();
      c.fillStyle="rgba(14,14,18,.95)"; c.beginPath(); c.moveTo(x-5,y-1); c.lineTo(x+5,y-1); c.lineTo(x,y+6); c.closePath(); c.fill();
      c.fillStyle="#e9e9ec"; c.textAlign="center"; c.textBaseline="middle"; lines.forEach(function(ln,i){ c.fillText(ln,x,y-h+12+i*15); }); c.restore(); }
    function wrap(c,text,maxw){ var words=text.split(" "),lines=[],cur=""; words.forEach(function(w){ var test=cur?cur+" "+w:w; if(c.measureText(test).width>maxw&&cur){ lines.push(cur); cur=w; } else cur=test; }); if(cur)lines.push(cur); return lines; }
    function vignette(c){ var v=c.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.85); v.addColorStop(0,"transparent"); v.addColorStop(1,"rgba(0,0,0,.5)"); c.fillStyle=v; c.fillRect(0,0,W,H); }

    raf=requestAnimationFrame(frame);
    return function(){ cancelAnimationFrame(raf); cleanup(); };
  }

  /* ---------- spec-driven bikes (modeled from Gregory's real bikes) ---------- */
  var PRESET={
    road:{Rw:26, wb:1.45, bbDrop:0.80, cr:0.52, seatBack:0.52, seatUp:2.02, shFwd:0.55, shUp:2.42, barUp:1.36, barFwd:0.10, tire:0.15},
    bmx :{Rw:21, wb:1.28, bbDrop:0.55, cr:0.50, seatBack:0.30, seatUp:1.55, shFwd:0.35, shUp:1.95, barUp:1.50, barFwd:0.04, tire:0.22},
    mtn :{Rw:27, wb:1.52, bbDrop:0.78, cr:0.52, seatBack:0.50, seatUp:2.02, shFwd:0.50, shUp:2.40, barUp:1.42, barFwd:0.08, tire:0.24}
  };
  var BIKES={
    hero:{id:"hero",name:"Hero (black)", preset:"road",bars:"riser",wheel:"deepdish",knobby:false,fork:"rigid",frame:"#15151a",rim:"#c7cace",tire:"#0c0c0e",accent:"#c7cace"},
    red :{id:"red", name:"Red BMX",      preset:"bmx", bars:"bmx",  wheel:"slick",   knobby:false,fork:"rigid",frame:"#c0342b",rim:"#17171b",tire:"#0c0c0e",accent:"#e5534b"},
    mtn :{id:"mtn", name:"Mountain",     preset:"mtn", bars:"flat", wheel:"slick",   knobby:true, fork:"susp", frame:"#16171b",rim:"#9a9aa3",tire:"#0c0c0e",accent:"#8ed64a"}
  };
  var BIKE_ORDER=["hero","red","mtn"];
  function getBikeSpec(){ var id=null; try{ id=localStorage.getItem("kc_bike"); }catch(e){} return BIKES[id]||BIKES.hero; }
  function setBike(id){ try{ localStorage.setItem("kc_bike",id); }catch(e){} }
  function ikKnee(hx,hy,fx,fy,Lt,Ls){ var dx=fx-hx,dy=fy-hy,d=Math.hypot(dx,dy);
    var dc=Math.max(Math.abs(Lt-Ls)+0.01, Math.min(Lt+Ls-0.01, d)); var a=Math.atan2(dy,dx);
    var ca=(dc*dc+Lt*Lt-Ls*Ls)/(2*dc*Lt); ca=Math.max(-1,Math.min(1,ca)); var A=Math.acos(ca);
    var k1={x:hx+Lt*Math.cos(a+A),y:hy+Lt*Math.sin(a+A)}, k2={x:hx+Lt*Math.cos(a-A),y:hy+Lt*Math.sin(a-A)};
    return (k1.x>k2.x)?k1:k2; }
  function bikeGeom(spec,cx,groundY,scale){ var P=PRESET[spec.preset]||PRESET.road, Rw=P.Rw*scale, ay=groundY-Rw;
    var rax=cx-P.wb*Rw, fax=cx+P.wb*Rw, bb={x:cx-0.05*Rw,y:groundY-P.bbDrop*Rw}, cr=P.cr*Rw;
    var hip={x:bb.x-P.seatBack*Rw,y:bb.y-P.seatUp*Rw};
    var headBot={x:fax-0.16*Rw,y:ay-0.55*Rw}, headTop={x:fax-0.32*Rw,y:ay-P.barUp*Rw};
    var grip;
    if(spec.bars==="bmx") grip={x:headTop.x-0.02*Rw,y:headTop.y-0.85*Rw};
    else if(spec.bars==="drop") grip={x:headTop.x+0.42*Rw,y:headTop.y+0.30*Rw};
    else if(spec.bars==="flat") grip={x:headTop.x-0.42*Rw,y:headTop.y-0.06*Rw};
    else grip={x:headTop.x-0.34*Rw,y:headTop.y-0.30*Rw};
    var sh={x:bb.x+P.shFwd*Rw,y:bb.y-P.shUp*Rw};
    return { P:P,Rw:Rw,ay:ay,rax:rax,fax:fax,cx:cx,bb:bb,cr:cr, hip:hip, sh:sh,
      head:{x:sh.x+0.42*Rw,y:sh.y-0.52*Rw}, headTop:headTop, headBot:headBot, grip:grip, hand:grip }; }
  function feetOf(g,phase){ return { nf:{x:g.bb.x+g.cr*Math.cos(phase),y:g.bb.y+g.cr*Math.sin(phase)},
    ff:{x:g.bb.x+g.cr*Math.cos(phase+Math.PI),y:g.bb.y+g.cr*Math.sin(phase+Math.PI)} }; }
  function drawBars(c,g,spec,tube){ var Rw=g.Rw, h=g.headTop, gp=g.grip;
    if(spec.bars==="bmx"){ var neck={x:h.x,y:h.y-Rw*0.1}; tube(h,neck); tube(neck,gp);
      var lw=c.lineWidth; c.lineWidth=Rw*0.05; tube({x:neck.x-Rw*0.01,y:neck.y-Rw*0.34},{x:gp.x+Rw*0.01,y:gp.y+Rw*0.30}); c.lineWidth=lw; }
    else if(spec.bars==="drop"){ tube(h,gp); c.beginPath(); c.arc(gp.x-Rw*0.06,gp.y+Rw*0.15,Rw*0.16,-1.5,1.5); c.stroke(); }
    else if(spec.bars==="flat"){ var n={x:h.x,y:h.y-Rw*0.14}; tube(h,n); tube(n,gp); }
    else { var n2={x:h.x-Rw*0.03,y:h.y-Rw*0.15}; tube(h,n2); tube(n2,gp); } }
  function drawBikeParts(c,g,spec,phase,wheelRot){ var Rw=g.Rw, ft=feetOf(g,phase);
    function tube(a,b){ c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke(); }
    c.fillStyle="rgba(0,0,0,.34)"; c.beginPath(); c.ellipse(g.cx,g.ay+Rw+2,g.P.wb*Rw+Rw*0.5,0.32*Rw,0,0,Math.PI*2); c.fill();
    function wheel(wx){ var tireW=Rw*g.P.tire;
      c.strokeStyle=spec.tire; c.lineWidth=tireW; c.beginPath(); c.arc(wx,g.ay,Rw,0,Math.PI*2); c.stroke();
      if(spec.knobby){ c.strokeStyle=spec.tire; c.lineWidth=Math.max(1.4,Rw*0.05); for(var k=0;k<26;k++){ var a=k/26*Math.PI*2,r0=Rw+tireW*0.28,r1=Rw+tireW*0.72; c.beginPath(); c.moveTo(wx+Math.cos(a)*r0,g.ay+Math.sin(a)*r0); c.lineTo(wx+Math.cos(a)*r1,g.ay+Math.sin(a)*r1); c.stroke(); } }
      if(spec.wheel==="deepdish"){ c.strokeStyle=spec.rim; c.lineWidth=Rw*0.26; c.beginPath(); c.arc(wx,g.ay,Rw-tireW/2-Rw*0.13,0,Math.PI*2); c.stroke();
        c.save(); c.translate(wx,g.ay); c.rotate(wheelRot); c.strokeStyle="rgba(255,255,255,.22)"; c.lineWidth=1; for(var s=0;s<4;s++){ c.rotate(Math.PI/2); c.beginPath(); c.moveTo(0,0); c.lineTo(Rw*0.66,0); c.stroke(); } c.restore(); }
      else { c.strokeStyle=spec.rim; c.lineWidth=2; c.beginPath(); c.arc(wx,g.ay,Rw-tireW/2,0,Math.PI*2); c.stroke();
        c.save(); c.translate(wx,g.ay); c.rotate(wheelRot); c.strokeStyle="rgba(200,205,210,.4)"; c.lineWidth=1; for(var s2=0;s2<8;s2++){ c.rotate(Math.PI/4); c.beginPath(); c.moveTo(0,0); c.lineTo(Rw*0.82,0); c.stroke(); } c.restore(); }
      c.fillStyle=spec.rim; c.beginPath(); c.arc(wx,g.ay,Rw*0.1,0,Math.PI*2); c.fill(); }
    wheel(g.rax); wheel(g.fax);
    c.strokeStyle=spec.frame; c.lineCap="round"; c.lineWidth=Rw*0.15;
    tube({x:g.rax,y:g.ay},g.bb); tube({x:g.rax,y:g.ay},g.hip); tube(g.bb,g.hip); tube(g.bb,g.headBot); tube(g.hip,g.headTop); tube(g.headTop,g.headBot);
    c.strokeStyle="rgba(255,255,255,.14)"; c.lineWidth=Rw*0.05;
    tube(g.bb,g.hip); tube(g.bb,g.headBot); tube(g.hip,g.headTop); tube({x:g.rax,y:g.ay},g.bb);
    c.strokeStyle=spec.accent; c.lineWidth=Rw*0.05; tube(g.bb,g.headBot); tube(g.hip,g.headTop);
    if(spec.fork==="susp"){ c.strokeStyle=spec.frame; c.lineWidth=Rw*0.16; tube(g.headBot,{x:g.fax,y:g.ay});
      var fm={x:(g.headBot.x+g.fax)/2,y:(g.headBot.y+g.ay)/2}; c.strokeStyle=spec.accent; c.lineWidth=Rw*0.06; tube({x:fm.x-Rw*0.02,y:fm.y-Rw*0.16},{x:fm.x+Rw*0.02,y:fm.y+Rw*0.16}); c.strokeStyle=spec.frame; }
    else { c.strokeStyle=spec.frame; c.lineWidth=Rw*0.12; tube(g.headBot,{x:g.fax,y:g.ay}); }
    c.lineWidth=Rw*0.1; drawBars(c,g,spec,tube);
    c.strokeStyle="rgba(255,255,255,.16)"; c.lineWidth=Rw*0.04; drawBars(c,g,spec,tube);
    c.strokeStyle=spec.frame;
    c.fillStyle="#3a3a44"; c.fillRect(g.hip.x-Rw*0.3,g.hip.y-Rw*0.12,Rw*0.6,Rw*0.16);
    c.fillStyle="rgba(255,255,255,.18)"; c.fillRect(g.hip.x-Rw*0.3,g.hip.y-Rw*0.12,Rw*0.6,Rw*0.04);
    c.strokeStyle=spec.accent; c.lineWidth=Rw*0.1; tube(g.bb,ft.nf); tube(g.bb,ft.ff);
    c.fillStyle=spec.accent; c.beginPath(); c.arc(g.bb.x,g.bb.y,Rw*0.12,0,Math.PI*2); c.fill();
    c.fillStyle="#1a1a20"; [ft.nf,ft.ff].forEach(function(f){ c.fillRect(f.x-Rw*0.2,f.y-Rw*0.04,Rw*0.4,Rw*0.12); });
    return ft; }
  function drawCyclist(c,x,groundY,scale,phase,wheelRot,spec){ spec=spec||getBikeSpec();
    var g=bikeGeom(spec,x,groundY,scale), Rw=g.Rw, ft=feetOf(g,phase);
    var Lt=1.16*Rw, Ls=1.24*Rw;
    var nk=ikKnee(g.hip.x,g.hip.y,ft.nf.x,ft.nf.y,Lt,Ls), fk=ikKnee(g.hip.x,g.hip.y,ft.ff.x,ft.ff.y,Lt,Ls);
    var chrome=c.createLinearGradient(0,groundY-3*Rw,0,groundY); chrome.addColorStop(0,"#f4f5f7"); chrome.addColorStop(.5,"#c7cace"); chrome.addColorStop(1,"#74787e");
    function legTo(knee,foot,bright){ c.strokeStyle=bright?chrome:"rgba(150,155,162,.6)"; c.lineCap="round";
      c.lineWidth=Rw*0.22; c.beginPath(); c.moveTo(g.hip.x,g.hip.y); c.lineTo(knee.x,knee.y); c.stroke();
      c.lineWidth=Rw*0.18; c.beginPath(); c.moveTo(knee.x,knee.y); c.lineTo(foot.x,foot.y); c.stroke();
      c.fillStyle=bright?"#2a2a30":"#1a1a20"; c.fillRect(foot.x-Rw*0.2,foot.y-Rw*0.04,Rw*0.4,Rw*0.12); }
    legTo(fk,ft.ff,false);
    drawBikeParts(c,g,spec,phase,wheelRot);
    c.strokeStyle=chrome; c.lineCap="round"; c.lineWidth=Rw*0.34; c.beginPath(); c.moveTo(g.hip.x,g.hip.y); c.lineTo(g.sh.x,g.sh.y); c.stroke();
    c.lineWidth=Rw*0.16; c.beginPath(); c.moveTo(g.sh.x,g.sh.y); c.lineTo(g.hand.x,g.hand.y); c.stroke();
    var hg=c.createRadialGradient(g.head.x-2,g.head.y-2,1,g.head.x,g.head.y,Rw*0.42); hg.addColorStop(0,"#fff"); hg.addColorStop(.5,"#cfd3d8"); hg.addColorStop(1,"#7d828a");
    c.fillStyle=hg; c.beginPath(); c.arc(g.head.x,g.head.y,Rw*0.4,0,Math.PI*2); c.fill();
    c.fillStyle="rgba(18,20,24,.7)"; c.fillRect(g.head.x-Rw*0.05,g.head.y-Rw*0.12,Rw*0.4,Rw*0.16);
    legTo(nk,ft.nf,true); }
  function drawBikeStatic(c,x,groundY,scale,spec){ var g=bikeGeom(spec,x,groundY,scale); drawBikeParts(c,g,spec,0.7,0); }

  /* ---------- arrival (sidescroll roll-in from the left) ---------- */
  function startArrival(onDone){
    var canvas=$("acv"), ctx=canvas.getContext("2d");
    var DPR=Math.min(2,window.devicePixelRatio||1), W=0,H=0;
    var S={ x:-150, speed:0, phase:0, wheelRot:0, doorProg:0, fade:0, ph:"ride" }, done=false;
    function resize(){ var r=canvas.getBoundingClientRect(); W=r.width;H=r.height; canvas.width=Math.max(1,W*DPR); canvas.height=Math.max(1,H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); }
    window.addEventListener("resize",resize); resize();
    function finish(){ if(done)return; done=true; cancelAnimationFrame(raf); cleanup(); onDone(); }
    function onTap(){ getCtx(); finish(); }
    canvas.addEventListener("pointerdown",onTap);
    function cleanup(){ window.removeEventListener("resize",resize); canvas.removeEventListener("pointerdown",onTap); }
    var raf=0,last=performance.now();
    function frame(now){ var dt=Math.min(40,now-last); last=now;
      var groundY=H*0.82, doorX=W*0.72, scale=Math.max(0.78,Math.min(1.5,H/540));
      S.speed += (0.34 - S.speed)*0.05; S.x += S.speed*dt*(S.ph==="in"?1.15:1);
      S.phase += S.speed*dt*0.028; S.wheelRot += S.speed*dt*0.05;
      var dist=doorX-S.x; S.doorProg=Math.max(0,Math.min(1,(270-dist)/230));
      if(S.x>doorX-4 && S.ph==="ride") S.ph="in";
      if(S.ph==="in"){ S.fade += dt/620; if(S.fade>=1){ finish(); return; } }
      draw(groundY,doorX,scale); raf=requestAnimationFrame(frame);
    }
    function draw(groundY,doorX,scale){ var c=ctx;
      var push=S.ph==="in"?1+0.6*S.fade:1;
      c.save(); if(push!==1){ c.translate(doorX,groundY-95*scale); c.scale(push,push); c.translate(-doorX,-(groundY-95*scale)); }
      var sky=c.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,"#0a0a0f"); sky.addColorStop(1,"#111119"); c.fillStyle=sky; c.fillRect(0,0,W,groundY);
      c.fillStyle="#0d0d13"; for(var i=0;i<8;i++){ var bw=W/9, bh=40+((i*53)%90); c.fillRect(i*W/8*0.92,groundY-bh-56,bw-8,bh); }
      var fx=doorX-70; c.fillStyle="#101015"; c.fillRect(fx,60,W-fx,groundY-60); c.strokeStyle="#24242b"; c.lineWidth=2; c.strokeRect(fx,60,W-fx,groundY-60);
      c.save(); c.shadowColor="#8fdcff"; c.shadowBlur=16; c.fillStyle="rgba(190,228,246,.9)"; c.font='700 '+Math.round(20*scale)+'px "Space Mono",monospace'; c.textAlign="center"; c.textBaseline="middle"; c.fillText("KILLSCOMFORT",(fx+W)/2,108); c.restore();
      var dw=150*scale, dx0=doorX-dw*0.2, doorTop=groundY-190*scale;
      c.fillStyle="#050507"; c.fillRect(dx0,doorTop,dw,groundY-doorTop);
      if(S.doorProg>0.3){ var ig=c.createLinearGradient(dx0,doorTop,dx0,groundY); ig.addColorStop(0,"rgba(120,200,230,"+(0.12*S.doorProg)+")"); ig.addColorStop(1,"transparent"); c.fillStyle=ig; c.fillRect(dx0,doorTop,dw,groundY-doorTop); }
      var dh=(groundY-doorTop)*(1-S.doorProg);
      if(dh>1){ c.fillStyle="#17171c"; c.fillRect(dx0,doorTop,dw,dh); c.strokeStyle="#2a2a32"; c.lineWidth=2; for(var yy=doorTop+8;yy<doorTop+dh;yy+=12){ c.beginPath(); c.moveTo(dx0,yy); c.lineTo(dx0+dw,yy); c.stroke(); } c.strokeStyle="#3a3a42"; c.strokeRect(dx0,doorTop,dw,dh); }
      var road=c.createLinearGradient(0,groundY,0,H); road.addColorStop(0,"#0c0c0f"); road.addColorStop(1,"#060608"); c.fillStyle=road; c.fillRect(0,groundY,W,H-groundY);
      c.strokeStyle="#20222a"; c.lineWidth=2; c.beginPath(); c.moveTo(0,groundY); c.lineTo(W,groundY); c.stroke();
      c.strokeStyle="rgba(120,124,132,.22)"; c.setLineDash([26,22]); c.lineWidth=3; c.beginPath(); c.moveTo(0,groundY+(H-groundY)*0.55); c.lineTo(W,groundY+(H-groundY)*0.55); c.stroke(); c.setLineDash([]);
      drawCyclist(c,S.x,groundY,scale,S.phase,S.wheelRot);
      c.restore();
      var v=c.createRadialGradient(W/2,H/2,H*0.34,W/2,H/2,H*0.9); v.addColorStop(0,"transparent"); v.addColorStop(1,"rgba(0,0,0,.5)"); c.fillStyle=v; c.fillRect(0,0,W,H);
      c.fillStyle="#6f6f78"; c.font='11px "Space Mono",monospace'; c.textAlign="center"; c.textBaseline="alphabetic"; c.fillText("ROLLING IN\u2026  (tap to skip)",W/2,H-18);
      if(S.fade>0){ c.fillStyle="rgba(5,5,7,"+Math.min(1,S.fade)+")"; c.fillRect(0,0,W,H); }
    }
    raf=requestAnimationFrame(frame);
    return function(){ cancelAnimationFrame(raf); cleanup(); };
  }

  /* ---------- warehouse (2.5D walkable overworld) ---------- */
  function startWarehouse(opts){
    opts=opts||{};
    var canvas=$("whcv"), ctx=canvas.getContext("2d");
    var DPR=Math.min(2,window.devicePixelRatio||1), VW=0,VH=0;
    var WORLD={w:1440,h:940}, FL={x0:120,y0:150,x1:1344,y1:864};
    var DOOR={x:120,y:520,h:240};
    var PARK={x:300,y:470};
    function rr(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
    function ease(t){ return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
    function shadow(c,x,y,rx){ c.fillStyle="rgba(0,0,0,.34)"; c.beginPath(); c.ellipse(x,y,rx,rx*0.32,0,0,Math.PI*2); c.fill(); }

    // stations: hotspot (hx,hy) on the floor in front, box for tap hit-test, drawer, accent
    var ST_=[
      { id:"studio",  x:300, y:250, hx:300, hy:300, r:74, label:"\u25b2 STUDIO",  ac:"#36e6ff", draw:dStudio },
      { id:"merch",   x:520, y:210, hx:520, hy:262, r:66, label:"\u25b2 MERCH",   ac:"#9a9aa3", draw:dMerch },
      { id:"checkout",x:520, y:470, hx:520, hy:522, r:66, label:"\u25b2 REGISTER",ac:"#5dcaa5", draw:dCheckout },
      { id:"inquiry", x:690, y:470, hx:690, hy:522, r:66, label:"\u25b2 INQUIRY", ac:"#e9e9ec", draw:dInquiry },
      { id:"arcade",  x:760, y:210, hx:760, hy:270, r:72, label:"\u25b2 ARCADE",  ac:"#ff9a2e", draw:dArcade },
      { id:"library", x:1050,y:230, hx:1050,hy:288, r:72, label:"\u25b2 LIBRARY", ac:"#5dcaa5", draw:dLibrary },
      { id:"stairs",  x:1280,y:210, hx:1268,hy:280, r:70, label:"\u25b2 UPSTAIRS",ac:"#c7cace", draw:dStairs },
      { id:"music",   x:320, y:640, hx:320, hy:700, r:76, label:"\u25b2 CRATES",  ac:"#36e6ff", draw:dCrates },
      { id:"car",     x:1030,y:660, hx:1030,hy:740, r:96, label:"\u25b2 THE CAR", ac:"#e5534b", draw:dCar },
      { id:"closet",  x:1280,y:520, hx:1256,hy:560, r:70, label:"\u25b2 CLOSET",  ac:"#9a9aa3", draw:dCloset },
      { id:"bikewall",x:360, y:430, hx:360, hy:472, r:80, label:"\u25b2 BIKES",   ac:"#c7cace", draw:dBikewall }
    ];

    var S={ char:{x:DOOR.x-24,y:DOOR.y,vx:0,vy:0,face:1,phase:0,moving:false,onBike:false},
      cam:{x:0,y:0}, target:null, pending:null, near:null, parked:false, doorProg:1, fadeIn:0,
      walkFrom:{x:DOOR.x-24,y:DOOR.y}, intro:{phase:"done", t:0}, toast:{text:"",until:0} };
    if(opts.walkIn){ S.intro.phase="walk"; S.char.x=DOOR.x-24; S.char.y=DOOR.y; S.char.face=1; S.walkFrom={x:DOOR.x-24,y:DOOR.y}; S.fadeIn=1; }
    else if(opts.skipIntro){ var sp={arcade:{x:760,y:300}, center:{x:720,y:480}, park:{x:PARK.x+40,y:PARK.y}, door:{x:DOOR.x+60,y:DOOR.y}, stairs:{x:1240,y:300}}[opts.spawn||"center"];
      S.char.x=sp.x; S.char.y=sp.y; S.parked=true; }
    else { S.char.x=720; S.char.y=480; S.parked=true; }

    var keys={};
    function onKey(e){ if(S.intro.phase!=="done")return; getCtx();
      if(["ArrowLeft","KeyA","ArrowRight","KeyD","ArrowUp","KeyW","ArrowDown","KeyS"].indexOf(e.code)>=0){ keys[e.code]=true; S.target=null; S.pending=null; }
      if(e.code==="Space"||e.code==="KeyE"||e.code==="Enter"){ e.preventDefault(); if(!paused()&&S.near) whInteract(S.near); } }
    function onKeyUp(e){ keys[e.code]=false; }
    function onPointer(e){ if(S.intro.phase!=="done"||paused())return; e.preventDefault(); getCtx();
      var r=canvas.getBoundingClientRect(), sx=(e.clientX-r.left), sy=(e.clientY-r.top);
      var wx=sx+S.cam.x, wy=sy+S.cam.y, hit=null;
      for(var i=0;i<ST_.length;i++){ var s=ST_[i]; if(Math.abs(wx-s.x)<70 && Math.abs(wy-(s.y-6))<70){ hit=s; break; } }
      if(hit){ S.target={x:hit.hx,y:hit.hy}; S.pending=hit.id; }
      else { S.target={x:Math.max(FL.x0,Math.min(FL.x1,wx)), y:Math.max(FL.y0,Math.min(FL.y1,wy))}; S.pending=null; } }
    canvas.addEventListener("pointerdown",onPointer); window.addEventListener("keydown",onKey); window.addEventListener("keyup",onKeyUp);
    var touchCtl=mountTouchPad({ keys:keys, isActive:function(){ return S.intro.phase==="done"; }, paused:paused,
      onInteract:function(){ if(!paused()&&S.near) whInteract(S.near); },
      onMove:function(){ S.target=null; S.pending=null; } });
    function paused(){ return !!document.querySelector("#panelMount .panel"); }

    function resize(){ var r=canvas.getBoundingClientRect(); VW=r.width; VH=r.height; canvas.width=Math.max(1,VW*DPR); canvas.height=Math.max(1,VH*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); }
    window.addEventListener("resize",resize); resize();
    function cleanup(){ window.removeEventListener("resize",resize); canvas.removeEventListener("pointerdown",onPointer); window.removeEventListener("keydown",onKey); window.removeEventListener("keyup",onKeyUp); touchCtl.cleanup(); }

    function camFollow(){ var tx=S.char.x-VW/2, ty=S.char.y-VH/2;
      S.cam.x += (Math.max(0,Math.min(WORLD.w-VW,tx))-S.cam.x)*0.12;
      S.cam.y += (Math.max(0,Math.min(WORLD.h-VH,ty))-S.cam.y)*0.12;
      if(WORLD.w<VW) S.cam.x=(WORLD.w-VW)/2; if(WORLD.h<VH) S.cam.y=(WORLD.h-VH)/2; }

    function nearestStation(){ var best=null,bd=1e9; for(var i=0;i<ST_.length;i++){ var s=ST_[i], d=Math.hypot(S.char.x-s.hx,S.char.y-s.hy); if(d<s.r&&d<bd){bd=d;best=s;} } return best?best.id:null; }

    var raf=0,last=performance.now();
    function frame(now){ var dt=Math.min(40,now-last); last=now;
      if(S.fadeIn>0) S.fadeIn=Math.max(0,S.fadeIn-dt/520);
      if(S.intro.phase==="walk"){ S.intro.t+=dt/1700; var e2=ease(Math.min(1,S.intro.t));
        var px=S.walkFrom.x+(PARK.x+60-S.walkFrom.x)*e2, py=S.walkFrom.y+(PARK.y-S.walkFrom.y)*e2;
        S.char.face=(px<S.char.x)?-1:1; S.char.x=px; S.char.y=py; S.char.moving=true; S.char.phase+=dt*0.012;
        if(S.intro.t>=1){ S.intro.phase="done"; S.parked=true; S.char.moving=false; } camFollow(); }
      else {
        var ax=0,ay=0;
        if(keys.ArrowLeft||keys.KeyA)ax-=1; if(keys.ArrowRight||keys.KeyD)ax+=1;
        if(keys.ArrowUp||keys.KeyW)ay-=1; if(keys.ArrowDown||keys.KeyS)ay+=1;
        if((ax||ay)){ S.target=null; S.pending=null; }
        else if(S.target){ var dx=S.target.x-S.char.x, dy=S.target.y-S.char.y, d=Math.hypot(dx,dy);
          if(d<6){ var pd=S.pending; S.target=null; S.pending=null; if(pd&&!paused()) whInteract(pd); } else { ax=dx/d; ay=dy/d; } }
        var mv=(ax||ay)&&!paused(); S.char.moving=mv;
        if(mv){ var L=Math.hypot(ax,ay)||1; var sp=0.27*dt; S.char.x+=ax/L*sp; S.char.y+=ay/L*sp; if(ax<-0.05)S.char.face=-1; else if(ax>0.05)S.char.face=1; S.char.phase+=dt*0.014;
          S.char.x=Math.max(FL.x0,Math.min(FL.x1,S.char.x)); S.char.y=Math.max(FL.y0,Math.min(FL.y1,S.char.y)); }
        S.near=paused()?null:nearestStation();
        camFollow();
      }
      draw(now); raf=requestAnimationFrame(frame);
    }

    function draw(now){ var c=ctx; c.clearRect(0,0,VW,VH);
      c.save(); c.translate(-S.cam.x,-S.cam.y);
      floor(c); backwall(c,now); exterior(c,now); baydoor(c);
      var items=ST_.map(function(s){ return {y:s.y, fn:function(){ s.draw(c,s,now); }}; });
      items.push({ y:S.char.y, fn:function(){ drawChar(c,now); } });
      items.sort(function(a,b){ return a.y-b.y; });
      items.forEach(function(it){ it.fn(); });
      if(S.intro.phase==="done" && S.near){ var s=stById(S.near); if(s){
        var lbl=s.label, ac=s.ac;
        if(!ST.bedroomKeyFound && (s.id==="arcade"||s.id==="bikewall")){ lbl="\u25b2 LOCKED"; ac="#6f6f78"; }
        tag(c,s.x,s.y-58,lbl,ac); } }
      c.restore();
      // screen-space UI
      if(S.intro.phase==="done"){ c.fillStyle="#6f6f78"; c.font='11px "Space Mono",monospace'; c.textAlign="center"; c.textBaseline="alphabetic";
        var hint=$("touchPad")&&$("touchPad").classList.contains("on")
          ? "D-PAD to walk  \u00b7  B to interact with stations"
          : "WASD / \u2190\u2191\u2193\u2192  or TAP to walk   \u00b7   SPACE / TAP a station to interact";
        c.fillText(hint, VW/2, VH-18); }
      if(now<S.toast.until){ c.save(); c.font='700 12px "Space Mono",monospace'; var w=Math.min(VW-40,c.measureText(S.toast.text).width+26);
        c.fillStyle="rgba(14,14,18,.94)"; c.strokeStyle="rgba(130,134,142,.6)"; rr(c,VW/2-w/2,14,w,30,7); c.fill(); c.stroke();
        c.fillStyle="#e9e9ec"; c.textAlign="center"; c.textBaseline="middle"; c.fillText(S.toast.text,VW/2,30); c.restore(); }
      vignette(c);
      if(S.fadeIn>0){ c.fillStyle="rgba(5,5,7,"+S.fadeIn+")"; c.fillRect(0,0,VW,VH); }
    }
    function stById(id){ for(var i=0;i<ST_.length;i++) if(ST_[i].id===id) return ST_[i]; return null; }

    function floor(c){ c.fillStyle="#0e0e11"; c.fillRect(0,0,WORLD.w,WORLD.h);
      var g=c.createLinearGradient(0,FL.y0,0,WORLD.h); g.addColorStop(0,"#141418"); g.addColorStop(1,"#0b0b0e"); c.fillStyle=g; c.fillRect(0,FL.y0-20,WORLD.w,WORLD.h);
      c.strokeStyle="rgba(90,94,102,.10)"; c.lineWidth=1;
      for(var x=FL.x0;x<=FL.x1;x+=80){ c.beginPath(); c.moveTo(x,FL.y0); c.lineTo(x,FL.y1); c.stroke(); }
      for(var y=FL.y0;y<=FL.y1;y+=80){ c.beginPath(); c.moveTo(FL.x0,y); c.lineTo(FL.x1,y); c.stroke(); }
      c.strokeStyle="#24242b"; c.lineWidth=3; c.strokeRect(FL.x0-14,FL.y0-14,(FL.x1-FL.x0)+28,(FL.y1-FL.y0)+28);
    }
    function backwall(c,now){ var g=c.createLinearGradient(0,0,0,FL.y0); g.addColorStop(0,"#08080a"); g.addColorStop(1,"#101014"); c.fillStyle=g; c.fillRect(0,0,WORLD.w,FL.y0-14);
      c.strokeStyle="rgba(40,40,48,.5)"; c.lineWidth=1; for(var x=0;x<WORLD.w;x+=70){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,FL.y0-14); c.stroke(); }
      c.save(); c.shadowColor="#8fdcff"; c.shadowBlur=16; c.fillStyle="rgba(190,228,246,.9)"; c.font='700 30px "Space Mono",monospace'; c.textAlign="center"; c.textBaseline="middle"; c.fillText("KILLSCOMFORT WAREHOUSE",WORLD.w/2,66); c.restore();
      c.fillStyle="rgba(120,124,132,.4)"; c.font='11px "Space Mono",monospace'; c.fillText("// motion is faith",WORLD.w/2,96);
    }
    function exterior(c,now){ var wx=FL.x0, gy0=DOOR.y-DOOR.h/2, gy1=DOOR.y+DOOR.h/2;
      c.fillStyle="#060608"; c.fillRect(0,FL.y0-14,wx,(FL.y1-FL.y0)+28);
      c.fillStyle="#101015"; c.fillRect(wx-10,FL.y0-14,12,(gy0-(FL.y0-14))); c.fillRect(wx-10,gy1,12,(FL.y1+14-gy1));
      c.strokeStyle="#24242b"; c.lineWidth=2; c.strokeRect(wx-10,FL.y0-14,12,(gy0-(FL.y0-14))); c.strokeRect(wx-10,gy1,12,(FL.y1+14-gy1));
      c.fillStyle="#17171c"; c.fillRect(wx-12,gy0-6,16,10); c.fillRect(wx-12,gy1-4,16,10);
      var lg=c.createLinearGradient(wx,DOOR.y,wx+150,DOOR.y); lg.addColorStop(0,"rgba(120,200,230,.10)"); lg.addColorStop(1,"transparent"); c.fillStyle=lg; c.fillRect(wx,gy0,150,DOOR.h);
      c.save(); c.shadowColor="#8fdcff"; c.shadowBlur=10; c.fillStyle="rgba(190,228,246,.7)"; c.font='700 12px "Space Mono",monospace'; c.textAlign="left"; c.textBaseline="middle"; c.fillText("KILLSCOMFORT",wx+8,gy0-16); c.restore();
    }
    function baydoor(c){ var wx=FL.x0, gy0=DOOR.y-DOOR.h/2; c.fillStyle="#0a0a0c"; c.fillRect(wx-14,gy0-10,6,DOOR.h+20); }

    // ---- station drawers (compact top-down 3/4) ----
    function base(c,s,w,h){ shadow(c,s.x,s.y+h*0.42,w*0.6); c.save(); c.shadowColor=s.ac; c.shadowBlur=10; }
    function neonEdge(c,x,y,w,h,ac){ c.save(); c.shadowColor=ac; c.shadowBlur=12; c.strokeStyle=ac; c.lineWidth=2; c.strokeRect(x,y,w,h); c.restore(); }
    function dStudio(c,s){ base(c,s,150,84); c.restore(); var x=s.x-75,y=s.y-64;
      c.fillStyle="#15151b"; rr(c,x,y+34,150,46,6); c.fill(); c.strokeStyle="#2a2a32"; c.lineWidth=1; c.stroke();
      for(var m=0;m<2;m++){ var mx=x+32+m*52;
        c.fillStyle="#0a0a0e"; c.fillRect(mx,y,44,30);
        c.save(); c.shadowColor=s.ac; c.shadowBlur=8; c.fillStyle="rgba(54,230,255,.14)"; c.fillRect(mx+3,y+3,38,24); c.restore();
        c.strokeStyle=s.ac; c.lineWidth=1; c.beginPath(); for(var i=0;i<38;i+=2){ var yy=y+15+Math.sin((i+m*9)*0.55)*6; if(i===0)c.moveTo(mx+3+i,yy); else c.lineTo(mx+3+i,yy); } c.stroke();
        c.fillStyle="#141419"; c.fillRect(mx+17,y+30,10,5); }
      [x+4,x+132].forEach(function(sx){ c.fillStyle="#111117"; c.fillRect(sx,y+10,14,24); c.fillStyle="#26262e"; c.beginPath(); c.arc(sx+7,y+18,4,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(sx+7,y+27,2.4,0,Math.PI*2); c.fill(); });
      c.fillStyle="#1a1a20"; rr(c,x+42,y+45,52,9,2); c.fill();
      var kx=x+32,ky=y+58,kw=86; c.fillStyle="#e6e7ea"; rr(c,kx,ky,kw,15,2); c.fill();
      c.strokeStyle="#9a9aa3"; c.lineWidth=0.5; for(var k=0;k<14;k++){ c.beginPath(); c.moveTo(kx+k*(kw/14),ky); c.lineTo(kx+k*(kw/14),ky+15); c.stroke(); }
      c.fillStyle="#0e0e13"; [1,2,4,5,6,8,9,11,12].forEach(function(k){ c.fillRect(kx+k*(kw/14)-2.4,ky,4.8,9); }); }
    function dCrates(c,s){ base(c,s,140,70); c.restore(); var x=s.x-70,y=s.y-70;
      c.fillStyle="#121217"; rr(c,x,y,140,84,6); c.fill(); c.strokeStyle="#2a2a32"; c.lineWidth=1; c.strokeRect(x,y,140,84);
      for(var r=0;r<2;r++)for(var cc=0;cc<4;cc++){ c.fillStyle=r+cc%2? "#1a1a20":"#15151b"; c.fillRect(x+8+cc*33,y+8+r*38,28,30);
        c.strokeStyle=cc%2?"#36e6ff":"#5dcaa5"; c.globalAlpha=.5; c.strokeRect(x+8+cc*33,y+8+r*38,28,30); c.globalAlpha=1; } }
    function dArcade(c,s){ base(c,s,64,96); c.restore(); var x=s.x-32,y=s.y-96, locked=!ST.bedroomKeyFound;
      if(locked) c.globalAlpha=0.5;
      c.fillStyle="#0e0e13"; rr(c,x,y,64,104,8); c.fill(); neonEdge(c,x+3,y+22,58,78,locked?"#6f6f78":s.ac);
      c.fillStyle="#141419"; c.fillRect(x+6,y+4,52,16); c.fillStyle=locked?"#6f6f78":s.ac; c.font='7px "Space Mono",monospace'; c.textAlign="center"; c.fillText(locked?"LOCKED":"ARCADE",s.x,y+14);
      c.fillStyle="#04070a"; c.fillRect(x+10,y+26,44,34);
      if(!locked){ c.save(); c.shadowColor=s.ac; c.shadowBlur=8; c.fillStyle="rgba(255,154,46,.18)"; c.fillRect(x+12,y+28,40,30); c.restore();
        ["#36e6ff","#ff9a2e","#e9e9ec"].forEach(function(col,i){ c.fillStyle=col; c.beginPath(); c.arc(x+18+i*14,y+78,3,0,Math.PI*2); c.fill(); }); }
      c.globalAlpha=1; }
    function dLibrary(c,s){ base(c,s,120,84); c.restore(); var x=s.x-60,y=s.y-84;
      c.fillStyle="#121217"; rr(c,x,y,120,96,6); c.fill(); c.strokeStyle="#2a2a32"; c.strokeRect(x,y,120,96);
      for(var r=0;r<3;r++){ for(var i=0;i<10;i++){ c.fillStyle=["#5dcaa5","#36e6ff","#9a9aa3","#e5534b"][(i+r)%4]; c.globalAlpha=.55; c.fillRect(x+8+i*10,y+8+r*28,7,22); } } c.globalAlpha=1; }
    function dStairs(c,s){ base(c,s,110,70); c.restore(); var x=s.x-55,y=s.y-72;
      for(var i=0;i<5;i++){ c.fillStyle=i%2?"#17171d":"#1c1c23"; c.fillRect(x+i*8,y+i*12,110-i*16,14); }
      c.save(); c.shadowColor=s.ac; c.shadowBlur=8; c.fillStyle=s.ac; c.font='700 14px "Space Mono",monospace'; c.textAlign="center"; c.fillText("\u25b2",s.x,y-4); c.restore(); }
    function dCar(c,s){ shadow(c,s.x,s.y+30,110); var x=s.x-96,y=s.y-46;
      c.fillStyle="#7a1f18"; rr(c,x,y,192,86,26); c.fill(); c.fillStyle="#e5534b"; rr(c,x+6,y+6,180,60,22); c.fill();
      c.fillStyle="#0a0a0e"; rr(c,x+40,y+10,110,30,10); c.fill();
      c.fillStyle="#141418"; c.beginPath(); c.arc(x+42,y+84,15,0,Math.PI*2); c.arc(x+150,y+84,15,0,Math.PI*2); c.fill();
      c.fillStyle="#2a2a30"; c.beginPath(); c.arc(x+42,y+84,6,0,Math.PI*2); c.arc(x+150,y+84,6,0,Math.PI*2); c.fill(); }
    function dCloset(c,s){ base(c,s,90,96); c.restore(); var x=s.x-45,y=s.y-96;
      c.fillStyle="#14141a"; rr(c,x,y,90,104,6); c.fill(); c.strokeStyle="#2a2a32"; c.strokeRect(x,y,90,104);
      c.strokeStyle="#33333c"; c.beginPath(); c.moveTo(s.x,y+4); c.lineTo(s.x,y+100); c.stroke();
      c.fillStyle="#4a4a54"; c.beginPath(); c.arc(s.x-6,y+54,2.5,0,Math.PI*2); c.arc(s.x+6,y+54,2.5,0,Math.PI*2); c.fill(); }
    function dInquiry(c,s){ base(c,s,110,54); c.restore(); var x=s.x-55,y=s.y-52;
      c.fillStyle="#15151b"; rr(c,x,y+22,110,42,6); c.fill(); c.strokeStyle="#2a2a32"; c.lineWidth=1; c.stroke();
      c.fillStyle="#0a0a0e"; c.fillRect(x+32,y,44,26); c.save(); c.shadowColor=s.ac; c.shadowBlur=6; c.fillStyle="rgba(233,233,236,.12)"; c.fillRect(x+35,y+3,38,20); c.restore();
      c.fillStyle="#1a1a20"; rr(c,x+28,y+26,52,8,2); c.fill();
      c.fillStyle="#141419"; c.strokeStyle=s.ac; c.lineWidth=1; c.strokeRect(x+8,y+36,24,15); c.beginPath(); c.moveTo(x+8,y+36); c.lineTo(x+20,y+45); c.lineTo(x+32,y+36); c.stroke();
      c.fillStyle=s.ac; c.font='8px "Space Mono",monospace'; c.textAlign="center"; c.fillText("INQUIRY",x+55,y+60); }
    function dMerch(c,s){ base(c,s,120,74); c.restore(); var x=s.x-60,y=s.y-78;
      c.strokeStyle="#3a3a42"; c.lineWidth=3; c.beginPath(); c.moveTo(x+6,y+8); c.lineTo(x+6,y+74); c.moveTo(x+114,y+8); c.lineTo(x+114,y+74); c.moveTo(x,y+8); c.lineTo(x+120,y+8); c.stroke();
      var cols=MERCH.map(function(m){ return m.ac; });
      for(var i=0;i<4;i++){ var gx=x+12+i*27, gy=y+16, ac=cols[i]||"#9a9aa3";
        c.strokeStyle="#6f6f78"; c.lineWidth=1; c.beginPath(); c.moveTo(gx+9,y+8); c.lineTo(gx+9,gy); c.stroke();
        c.fillStyle="#1c1c22"; c.strokeStyle=ac; c.lineWidth=1.4;
        c.beginPath(); c.moveTo(gx+2,gy+5); c.lineTo(gx+6,gy); c.lineTo(gx+9,gy+3); c.lineTo(gx+12,gy); c.lineTo(gx+16,gy+5); c.lineTo(gx+13,gy+10); c.lineTo(gx+13,gy+40); c.lineTo(gx+2,gy+40); c.lineTo(gx+2,gy+10); c.closePath(); c.fill(); c.stroke(); } }
    function dCheckout(c,s){ base(c,s,110,58); c.restore(); var x=s.x-55,y=s.y-56;
      c.fillStyle="#131318"; rr(c,x,y+20,110,44,6); c.fill(); c.strokeStyle="#2a2a32"; c.lineWidth=1; c.strokeRect(x,y+20,110,44);
      c.fillStyle="#0a0a0e"; c.fillRect(x+14,y,42,26); c.save(); c.shadowColor=s.ac; c.shadowBlur=8; c.fillStyle="rgba(93,202,165,.18)"; c.fillRect(x+16,y+3,38,20); c.restore();
      c.fillStyle=s.ac; c.font='8px "Space Mono",monospace'; c.textAlign="center"; c.fillText("REGISTER",x+35,y+15);
      var n=(typeof cartCount==="function")?cartCount():0;
      if(n>0){ c.save(); c.shadowColor="#ff9a2e"; c.shadowBlur=8; c.fillStyle="#ff9a2e"; c.beginPath(); c.arc(x+98,y+4,10,0,Math.PI*2); c.fill();
        c.fillStyle="#1a1200"; c.font='700 10px "Space Mono",monospace'; c.textAlign="center"; c.textBaseline="middle"; c.fillText(n+"",x+98,y+4); c.restore(); } }
    function dBikewall(c,s){ var w=196,h=118, x=s.x-w/2,y=s.y-h+8, locked=!ST.bedroomKeyFound;
      if(locked) c.globalAlpha=0.5;
      c.fillStyle="#0f0f13"; rr(c,x,y,w,h,8); c.fill(); c.strokeStyle="#24242b"; c.lineWidth=1; c.strokeRect(x,y,w,h);
      c.strokeStyle="#2a2a32"; c.lineWidth=3; c.beginPath(); c.moveTo(x+10,y+18); c.lineTo(x+w-10,y+18); c.stroke();
      if(!locked){
        var sel=getBikeSpec().id;
        BIKE_ORDER.forEach(function(id,i){ var spec=BIKES[id], bx=x+34+i*64, by=y+72;
          c.save(); c.globalAlpha=(id===sel)?1:0.5; drawBikeStatic(c,bx,by,0.42,spec); c.restore();
          if(id===sel){ c.strokeStyle=spec.accent; c.lineWidth=1.5; c.strokeRect(bx-26,by-34,52,44); } });
        c.fillStyle="rgba(120,124,132,.6)"; c.font='9px "Space Mono",monospace'; c.textAlign="center"; c.fillText("BIKE WALL \u2014 tap to ride",s.x,y+h-6);
      } else {
        c.fillStyle="#6f6f78"; c.font='9px "Space Mono",monospace'; c.textAlign="center"; c.fillText("LOCKED \u2014 find the key upstairs",s.x,y+h-6);
      }
      c.globalAlpha=1; }

    function drawChar(c,now){ var x=S.char.x,y=S.char.y; shadow(c,x,y+4,16);
      if(S.char.onBike){ c.save(); c.globalAlpha=.95; c.strokeStyle="#c7cace"; c.lineWidth=2.5;
        c.beginPath(); c.arc(x-14,y+8,10,0,Math.PI*2); c.moveTo(x+14+10,y+8); c.arc(x+14,y+8,10,0,Math.PI*2); c.stroke();
        c.beginPath(); c.moveTo(x-14,y+8); c.lineTo(x,y-4); c.lineTo(x+14,y+8); c.moveTo(x,y-4); c.lineTo(x+5,y-14); c.stroke(); c.restore(); }
      c.save(); c.translate(x, y + (S.char.onBike? -18 : 0));
      var bob=S.char.moving?Math.abs(Math.sin(S.char.phase))*2:Math.sin(now/560)*1.1; c.translate(0,-bob);
      if(S.char.face<0) c.scale(-1,1);
      var G=c.createLinearGradient(0,-46,0,0); G.addColorStop(0,"#ffffff"); G.addColorStop(.45,"#dfe3e7"); G.addColorStop(1,"#6c7178");
      var stride=S.char.moving?Math.sin(S.char.phase)*6:2;
      c.strokeStyle=G; c.lineCap="round"; c.lineWidth=5;
      c.beginPath(); c.moveTo(0,-18); c.lineTo(-stride*0.6,0); c.stroke();
      c.beginPath(); c.moveTo(0,-18); c.lineTo(stride*0.6,0); c.stroke();
      c.fillStyle=G; c.beginPath(); c.moveTo(-6,-18); c.lineTo(6,-18); c.lineTo(5,-36); c.lineTo(-5,-36); c.closePath(); c.fill();
      var hy=-42, hg=c.createRadialGradient(-2,hy-2,1,0,hy,7); hg.addColorStop(0,"#ffffff"); hg.addColorStop(.5,"#cfd3d8"); hg.addColorStop(1,"#7d828a");
      c.fillStyle=hg; c.beginPath(); c.arc(0,hy,6,0,Math.PI*2); c.fill();
      c.fillStyle="rgba(18,20,24,.7)"; c.fillRect(1,hy-2,5,3);
      c.restore(); }

    function tag(c,x,y,text,ac){ c.save(); c.font='700 10px "Space Mono",monospace'; var w=c.measureText(text).width+16;
      c.fillStyle="rgba(10,10,12,.88)"; c.strokeStyle=ac; c.lineWidth=1; rr(c,x-w/2,y-16,w,18,4); c.fill(); c.stroke();
      c.fillStyle="#e9e9ec"; c.textAlign="center"; c.textBaseline="middle"; c.fillText(text,x,y-7); c.restore(); }
    function vignette(c){ var v=c.createRadialGradient(VW/2,VH/2,VH*0.34,VW/2,VH/2,VH*0.9); v.addColorStop(0,"transparent"); v.addColorStop(1,"rgba(0,0,0,.5)"); c.fillStyle=v; c.fillRect(0,0,VW,VH); }

    // expose a toast setter for external callbacks
    startWarehouse._toast=function(t){ S.toast={text:t,until:performance.now()+2600}; };

    raf=requestAnimationFrame(frame);
    return function(){ cancelAnimationFrame(raf); cleanup(); };
  }

  /* ---------- bedroom (upstairs) ---------- */
  var bedDroneStop=null;
  function stopBedDrone(){ if(bedDroneStop){ bedDroneStop(); bedDroneStop=null; } }
  function startBedDrone(){
    stopBedDrone();
    var c=getCtx(); if(!c) return;
    var nodes=[];
    [55,82.5,110,164.81].forEach(function(f,i){
      var o=c.createOscillator(), g=c.createGain();
      o.type="sine"; o.frequency.value=f; g.gain.value=0.018+i*0.005;
      o.connect(g).connect(c.destination); o.start();
      nodes.push(o);
    });
    bedDroneStop=function(){ nodes.forEach(function(o){ try{ o.stop(); }catch(e){} }); nodes=[]; };
  }

  function startBedroom(opts){
    opts=opts||{};
    var canvas=$("bedcv"), ctx=canvas.getContext("2d");
    var DPR=Math.min(2,window.devicePixelRatio||1), VW=0,VH=0;
    var WORLD={w:980,h:720}, FL={x0:90,y0:170,x1:890,y1:660};
    function rr(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
    function shadow(c,x,y,rx){ c.fillStyle="rgba(0,0,0,.34)"; c.beginPath(); c.ellipse(x,y,rx,rx*0.32,0,0,Math.PI*2); c.fill(); }

    var ST_=[
      { id:"bed", x:420, y:500, hx:420, hy:560, r:78, label:"\u25b2 REST", ac:"#9ab4ff", draw:dBed },
      { id:"nightstand", x:560, y:470, hx:560, hy:530, r:62, label:"\u25b2 PHONE", ac:"#5dcaa5", draw:dNightstand },
      { id:"keyhook", x:170, y:300, hx:170, hy:360, r:58, label:"\u25b2 KEY", ac:"#ffcf5a", draw:dKey },
      { id:"stairsdown", x:500, y:210, hx:500, hy:270, r:68, label:"\u25bc DOWN", ac:"#c7cace", draw:dStairsDown }
    ];

    var S={ char:{x:500,y:420,vx:0,vy:0,face:1,phase:0,moving:false},
      cam:{x:0,y:0}, target:null, pending:null, near:null, toast:{text:"",until:0} };
    if(opts.spawn==="stairs"){ S.char.x=500; S.char.y=300; }

    var keys={};
    function paused(){ return !!document.querySelector("#panelMount .panel"); }
    function onKey(e){
      if(["ArrowLeft","KeyA","ArrowRight","KeyD","ArrowUp","KeyW","ArrowDown","KeyS"].indexOf(e.code)>=0){ keys[e.code]=true; S.target=null; S.pending=null; }
      if(e.code==="Space"||e.code==="KeyE"||e.code==="Enter"){ e.preventDefault(); if(!paused()&&S.near) brInteract(S.near); }
    }
    function onKeyUp(e){ keys[e.code]=false; }
    function onPointer(e){ if(paused())return; e.preventDefault(); getCtx();
      var r=canvas.getBoundingClientRect(), sx=(e.clientX-r.left), sy=(e.clientY-r.top);
      var wx=sx+S.cam.x, wy=sy+S.cam.y, hit=null;
      for(var i=0;i<ST_.length;i++){ var s=ST_[i]; if(Math.abs(wx-s.x)<64 && Math.abs(wy-(s.y-6))<64){ hit=s; break; } }
      if(hit){ S.target={x:hit.hx,y:hit.hy}; S.pending=hit.id; }
      else { S.target={x:Math.max(FL.x0,Math.min(FL.x1,wx)), y:Math.max(FL.y0,Math.min(FL.y1,wy))}; S.pending=null; } }
    canvas.addEventListener("pointerdown",onPointer); window.addEventListener("keydown",onKey); window.addEventListener("keyup",onKeyUp);
    var touchCtl=mountTouchPad({ keys:keys, paused:paused,
      onInteract:function(){ if(!paused()&&S.near) brInteract(S.near); },
      onMove:function(){ S.target=null; S.pending=null; } });

    function resize(){ var r=canvas.getBoundingClientRect(); VW=r.width; VH=r.height; canvas.width=Math.max(1,VW*DPR); canvas.height=Math.max(1,VH*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); }
    window.addEventListener("resize",resize); resize();
    function cleanup(){ window.removeEventListener("resize",resize); canvas.removeEventListener("pointerdown",onPointer); window.removeEventListener("keydown",onKey); window.removeEventListener("keyup",onKeyUp); touchCtl.cleanup(); }

    function camFollow(){ var tx=S.char.x-VW/2, ty=S.char.y-VH/2;
      S.cam.x += (Math.max(0,Math.min(WORLD.w-VW,tx))-S.cam.x)*0.12;
      S.cam.y += (Math.max(0,Math.min(WORLD.h-VH,ty))-S.cam.y)*0.12;
      if(WORLD.w<VW) S.cam.x=(WORLD.w-VW)/2; if(WORLD.h<VH) S.cam.y=(WORLD.h-VH)/2; }
    function nearestStation(){ var best=null,bd=1e9; for(var i=0;i<ST_.length;i++){ var s=ST_[i], d=Math.hypot(S.char.x-s.hx,S.char.y-s.hy); if(d<s.r&&d<bd){bd=d;best=s;} } return best?best.id:null; }
    function stById(id){ for(var i=0;i<ST_.length;i++) if(ST_[i].id===id) return ST_[i]; return null; }

    var raf=0,last=performance.now();
    function frame(now){ var dt=Math.min(40,now-last); last=now;
      var ax=0,ay=0;
      if(keys.ArrowLeft||keys.KeyA)ax-=1; if(keys.ArrowRight||keys.KeyD)ax+=1;
      if(keys.ArrowUp||keys.KeyW)ay-=1; if(keys.ArrowDown||keys.KeyS)ay+=1;
      if((ax||ay)){ S.target=null; S.pending=null; }
      else if(S.target){ var dx=S.target.x-S.char.x, dy=S.target.y-S.char.y, d=Math.hypot(dx,dy);
        if(d<6){ var pd=S.pending; S.target=null; S.pending=null; if(pd&&!paused()) brInteract(pd); } else { ax=dx/d; ay=dy/d; } }
      var mv=(ax||ay)&&!paused(); S.char.moving=mv;
      if(mv){ var L=Math.hypot(ax,ay)||1; var sp=0.27*dt; S.char.x+=ax/L*sp; S.char.y+=ay/L*sp; if(ax<-0.05)S.char.face=-1; else if(ax>0.05)S.char.face=1; S.char.phase+=dt*0.014;
        S.char.x=Math.max(FL.x0,Math.min(FL.x1,S.char.x)); S.char.y=Math.max(FL.y0,Math.min(FL.y1,S.char.y)); }
      S.near=paused()?null:nearestStation();
      camFollow(); draw(now); raf=requestAnimationFrame(frame);
    }

    function draw(now){ var c=ctx; c.clearRect(0,0,VW,VH);
      c.save(); c.translate(-S.cam.x,-S.cam.y);
      drawRoom(c,now);
      var items=ST_.map(function(s){ return {y:s.y, fn:function(){ s.draw(c,s,now); }}; });
      items.push({ y:S.char.y, fn:function(){ drawBedChar(c,now); } });
      items.sort(function(a,b){ return a.y-b.y; });
      items.forEach(function(it){ it.fn(); });
      if(S.near){ var s=stById(S.near); if(s) bedTag(c,s.x,s.y-58,s.label,s.ac); }
      c.restore();
      c.fillStyle="#6f6f78"; c.font='11px "Space Mono",monospace'; c.textAlign="center"; c.textBaseline="alphabetic";
      var hint=$("touchPad")&&$("touchPad").classList.contains("on")
        ? "D-PAD to walk  \u00b7  B to interact"
        : "WASD / \u2190\u2191\u2193\u2192  or TAP to walk   \u00b7   SPACE to interact";
      c.fillText(hint, VW/2, VH-18);
      if(now<S.toast.until){ c.save(); c.font='700 12px "Space Mono",monospace'; var w=Math.min(VW-40,c.measureText(S.toast.text).width+26);
        c.fillStyle="rgba(14,14,18,.94)"; c.strokeStyle="rgba(130,134,142,.6)"; rr(c,VW/2-w/2,14,w,30,7); c.fill(); c.stroke();
        c.fillStyle="#e9e9ec"; c.textAlign="center"; c.textBaseline="middle"; c.fillText(S.toast.text,VW/2,30); c.restore(); }
      var v=c.createRadialGradient(VW/2,VH/2,VH*0.34,VW/2,VH/2,VH*0.9); v.addColorStop(0,"transparent"); v.addColorStop(1,"rgba(0,0,0,.5)"); c.fillStyle=v; c.fillRect(0,0,VW,VH);
    }

    function drawRoom(c,now){
      c.fillStyle="#0a0a0d"; c.fillRect(0,0,WORLD.w,WORLD.h);
      var rug=c.createLinearGradient(FL.x0,FL.y0,FL.x1,FL.y1); rug.addColorStop(0,"#14131a"); rug.addColorStop(1,"#101018");
      c.fillStyle=rug; rr(c,FL.x0-20,FL.y0-10,(FL.x1-FL.x0)+40,(FL.y1-FL.y0)+24,18); c.fill();
      c.fillStyle="#12121a"; c.fillRect(0,0,WORLD.w,FL.y0-8);
      c.fillStyle="rgba(120,180,220,.08)"; c.fillRect(720,40,180,120);
      c.strokeStyle="rgba(90,94,102,.25)"; c.lineWidth=1;
      for(var x=FL.x0;x<=FL.x1;x+=70){ c.beginPath(); c.moveTo(x,FL.y0); c.lineTo(x,FL.y1); c.stroke(); }
      c.save(); c.shadowColor="#b8c8ff"; c.shadowBlur=14; c.fillStyle="rgba(200,210,255,.85)"; c.font='700 24px "Space Mono",monospace'; c.textAlign="center"; c.fillText("UPSTAIRS BEDROOM",WORLD.w/2,58); c.restore();
      c.fillStyle="rgba(120,124,132,.45)"; c.font='11px "Space Mono",monospace'; c.fillText("// slow down upstairs",WORLD.w/2,84);
      var lampPulse=0.5+Math.sin(now/900)*0.12;
      c.save(); c.globalAlpha=lampPulse; c.fillStyle="rgba(255,214,140,.12)"; c.beginPath(); c.arc(760,180,90,0,Math.PI*2); c.fill(); c.restore();
    }
    function dBed(c,s){ shadow(c,s.x,s.y+24,90); var x=s.x-120,y=s.y-70;
      c.fillStyle="#1a1a22"; rr(c,x,y+40,240,56,10); c.fill();
      c.fillStyle="#242430"; rr(c,x+8,y+8,224,48,8); c.fill();
      c.fillStyle="#cfd5e8"; rr(c,x+16,y+16,208,34,6); c.fill();
      c.fillStyle="#9aa3bf"; rr(c,x+16,y+16,48,34,6); c.fill(); }
    function dNightstand(c,s){ shadow(c,s.x,s.y+16,34); var x=s.x-28,y=s.y-44;
      c.fillStyle="#17171d"; rr(c,x,y+18,56,40,5); c.fill();
      c.fillStyle="#0a0a0e"; rr(c,x+8,y,40,24,4); c.fill();
      c.save(); c.shadowColor=s.ac; c.shadowBlur=8; c.fillStyle="rgba(93,202,165,.2)"; c.fillRect(x+10,y+3,36,18); c.restore(); }
    function dKey(c,s){ shadow(c,s.x,s.y+8,20); c.strokeStyle="#3a3a42"; c.lineWidth=2; c.beginPath(); c.moveTo(s.x,s.y-40); c.lineTo(s.x,s.y+4); c.stroke();
      c.fillStyle=ST.bedroomKeyFound?"#ffcf5a":"#6f6f78"; c.beginPath(); c.arc(s.x,s.y-46,8,0,Math.PI*2); c.fill();
      if(!ST.bedroomKeyFound){ c.fillStyle="#101015"; c.fillRect(s.x-3,s.y-49,6,10); } }
    function dStairsDown(c,s){ var x=s.x-50,y=s.y-60;
      for(var i=0;i<5;i++){ c.fillStyle=i%2?"#17171d":"#1c1c23"; c.fillRect(x+i*8,y+i*12,100-i*16,14); }
      c.fillStyle=s.ac; c.font='700 14px "Space Mono",monospace'; c.textAlign="center"; c.fillText("\u25bc",s.x,y-4); }
    function drawBedChar(c,now){ var x=S.char.x,y=S.char.y; shadow(c,x,y+4,16);
      c.save(); c.translate(x,y); var bob=S.char.moving?Math.abs(Math.sin(S.char.phase))*2:Math.sin(now/560)*1.1; c.translate(0,-bob);
      if(S.char.face<0) c.scale(-1,1);
      var G=c.createLinearGradient(0,-46,0,0); G.addColorStop(0,"#ffffff"); G.addColorStop(.45,"#dfe3e7"); G.addColorStop(1,"#6c7178");
      var stride=S.char.moving?Math.sin(S.char.phase)*6:2;
      c.strokeStyle=G; c.lineCap="round"; c.lineWidth=5;
      c.beginPath(); c.moveTo(0,-18); c.lineTo(-stride*0.6,0); c.stroke();
      c.beginPath(); c.moveTo(0,-18); c.lineTo(stride*0.6,0); c.stroke();
      c.fillStyle=G; c.beginPath(); c.moveTo(-6,-18); c.lineTo(6,-18); c.lineTo(5,-36); c.lineTo(-5,-36); c.closePath(); c.fill();
      c.fillStyle=G; c.beginPath(); c.arc(0,-42,6,0,Math.PI*2); c.fill(); c.restore(); }
    function bedTag(c,x,y,text,ac){ c.save(); c.font='700 10px "Space Mono",monospace'; var w=c.measureText(text).width+16;
      c.fillStyle="rgba(10,10,12,.88)"; c.strokeStyle=ac; c.lineWidth=1; rr(c,x-w/2,y-16,w,18,4); c.fill(); c.stroke();
      c.fillStyle="#e9e9ec"; c.textAlign="center"; c.textBaseline="middle"; c.fillText(text,x,y-7); c.restore(); }

    startBedroom._toast=function(t){ S.toast={text:t,until:performance.now()+2600}; };
    raf=requestAnimationFrame(frame);
    return function(){ cancelAnimationFrame(raf); cleanup(); stopBedDrone(); };
  }

  function openBedRest(){
    openPanel("Rest","<p class=\"lede\" style=\"margin:0 0 14px\">Lie down. Slow frequencies wash over you — sleep, reset, breathe.</p>"+
      "<div class=\"row\" style=\"gap:10px;flex-wrap:wrap\"><button class=\"btn solid\" id=\"bedPlay\">Play relaxing tone</button><button class=\"btn ghost\" id=\"bedStop\">Stop</button></div>",
      function(){ $("bedPlay").onclick=function(){ startBedDrone(); flash("Relaxing frequencies on"); };
        $("bedStop").onclick=function(){ stopBedDrone(); flash("Tone stopped"); }; });
  }
  function openNightstandPhone(){
    openPanel("Nightstand phone",
      "<p class=\"lede\" style=\"margin:0 0 14px\">Booking, links, what\u2019s next — straight from upstairs.</p>"+
      "<div class=\"row\" style=\"flex-direction:column;gap:10px;align-items:stretch\">"+
      "<a class=\"btn solid\" href=\"/book\">Book a set</a>"+
      "<a class=\"btn ghost\" href=\"/music\">Listen</a>"+
      "<a class=\"btn ghost\" href=\"/merch\">Shop merch</a>"+
      "<a class=\"btn ghost\" href=\"/services\">Services</a>"+
      "<a class=\"btn ghost\" href=\"https://instagram.com/killscomfort\" target=\"_blank\" rel=\"noopener\">Instagram</a></div>");
  }
  function openBedroomKey(){
    if(!ST.bedroomKeyFound){
      ST.bedroomKeyFound=true;
      try{ localStorage.setItem("kc_bed_key","1"); }catch(e){}
      chime(); collect("key");
      if(startBedroom._toast) startBedroom._toast("Key found — arcade unlocked");
    }
    openPanel("The key",
      "<p class=\"lede\" style=\"margin:0 0 14px\">This unlocks the arcade games downstairs. Night Ride and Endless Survival are yours.</p>"+
      "<div class=\"row\" style=\"flex-direction:column;gap:10px;align-items:stretch\">"+
      "<button class=\"btn solid\" id=\"keyArcade\">Open arcade games</button>"+
      "<button class=\"btn ghost\" id=\"keyDown\">Head downstairs</button></div>",
      function(){
        $("keyArcade").onclick=function(){ closePanel(); whArcade(); };
        $("keyDown").onclick=function(){ closePanel(); goWarehouse({skipIntro:true,spawn:"stairs"}); };
      });
  }
  function brInteract(id){
    if(id==="bed") openBedRest();
    else if(id==="nightstand") openNightstandPhone();
    else if(id==="keyhook") openBedroomKey();
    else if(id==="stairsdown") goWarehouse({skipIntro:true,spawn:"stairs"});
  }

  /* ---------- wiring ---------- */
  var stopRide=null, stopLobby=null, stopWarehouse=null, stopArrival=null, stopBedroom=null;
  function goHub(){ goWarehouse({skipIntro:true,spawn:"center"}); }
  function goWarehouse(o){ if(stopRide){ stopRide(); stopRide=null; } if(stopLobby){ stopLobby(); stopLobby=null; } if(stopArrival){ stopArrival(); stopArrival=null; } if(stopBedroom){ stopBedroom(); stopBedroom=null; } if(stopWarehouse){ stopWarehouse(); stopWarehouse=null; } closePanel(); stopBedDrone(); $("hud").classList.remove("on"); show("warehouse"); stopWarehouse=startWarehouse(o||{}); }
  function goBedroom(o){ if(stopRide){ stopRide(); stopRide=null; } if(stopLobby){ stopLobby(); stopLobby=null; } if(stopArrival){ stopArrival(); stopArrival=null; } if(stopWarehouse){ stopWarehouse(); stopWarehouse=null; } if(stopBedroom){ stopBedroom(); stopBedroom=null; } closePanel(); $("hud").classList.remove("on"); show("bedroom"); stopBedroom=startBedroom(o||{spawn:"stairs"}); }
  function goArrival(){ if(stopRide){ stopRide(); stopRide=null; } if(stopWarehouse){ stopWarehouse(); stopWarehouse=null; } if(stopBedroom){ stopBedroom(); stopBedroom=null; } if(stopArrival){ stopArrival(); stopArrival=null; } closePanel(); $("hud").classList.remove("on"); show("arrival"); stopArrival=startArrival(function(){ stopArrival=null; goWarehouse({walkIn:true}); }); }
  function whToast(t){ if(startWarehouse._toast) startWarehouse._toast(t); }
  function whSoon(title,body){ openPanel(title,'<p class="lede" style="margin:0">'+body+'</p>'); }
  function hasArcadeKey(){ return !!ST.bedroomKeyFound; }
  function openArcadeLocked(){
    openPanel("Arcade locked",
      '<p class="lede" style="margin:0 0 14px">The games are locked. Head upstairs, grab the key from the hook, then come back down.</p>'+
      '<div class="row" style="flex-direction:column;gap:10px;align-items:stretch">'+
      '<button class="btn solid" id="lockStairs">Go upstairs \u2192</button></div>',
      function(){ $("lockStairs").onclick=function(){ closePanel(); goBedroom({spawn:"stairs"}); }; });
  }
  function whInteract(id){ getCtx();
    if(id==="studio") openBeat();
    else if(id==="music") openDig();
    else if(id==="merch") openShop();
    else if(id==="checkout") openCheckout();
    else if(id==="library") whLibrary();
    else if(id==="inquiry") openInquiry();
    else if(id==="arcade") whArcade();
    else if(id==="stairs") goBedroom({spawn:"stairs"});
    else if(id==="closet") whSoon("Closet","Customize your character \u2014 outfits and looks. Coming soon.");
    else if(id==="car") whSoon("The car","Parked on the main floor. Something\u2019s coming here. Stay tuned.");
    else if(id==="bikewall"){ if(!hasArcadeKey()) openArcadeLocked(); else openBikePicker(); }
  }
  function openBikePicker(){ getCtx(); openPanel("Bike wall \u2014 pick your ride",
    '<div class="bikeStage"><button class="bikeArrow" id="bikeL" aria-label="Previous">\u2039</button>'+
    '<canvas class="bikeCanvas" id="bikeCanvas"></canvas>'+
    '<button class="bikeArrow r" id="bikeR" aria-label="Next">\u203a</button></div>'+
    '<div class="bikeNm" id="bikeName"></div>'+
    '<div class="bikeDots" id="bikeDots"></div>'+
    '<div class="row" style="gap:10px;margin-top:14px"><button class="btn solid" id="bikeRide">Go for a ride \u2192</button></div>',
    function(){ initBikePicker(); }); }
  function initBikePicker(){ var cv=$("bikeCanvas"), stage=cv&&cv.parentNode, name=$("bikeName"), dots=$("bikeDots"); if(!cv)return;
    var i=Math.max(0,BIKE_ORDER.indexOf(getBikeSpec().id)), DPR=Math.min(2,window.devicePixelRatio||1);
    dots.innerHTML=""; BIKE_ORDER.forEach(function(){ dots.appendChild(document.createElement("span")).className="bikeDot"; });
    function draw(){ var avail=(stage&&stage.clientWidth)||320; var cw=Math.max(200,Math.min(320,avail-96)), ch=Math.round(cw*0.6);
      cv.width=Math.round(cw*DPR); cv.height=Math.round(ch*DPR); cv.style.width=cw+"px"; cv.style.height=ch+"px";
      var cx=cv.getContext("2d"); cx.setTransform(DPR,0,0,DPR,0,0); cx.clearRect(0,0,cw,ch);
      var spec=BIKES[BIKE_ORDER[i]], scale=cw/300*1.5, Rw=(PRESET[spec.preset]?PRESET[spec.preset].Rw:26)*scale;
      var groundY=Math.round(ch/2 + 1.42*Rw);
      drawBikeStatic(cx, cw/2, groundY, scale, spec);
      if(name) name.textContent=spec.name;
      Array.prototype.forEach.call(dots.children,function(d,k){ d.className="bikeDot"+(k===i?" on":""); });
      setBike(BIKE_ORDER[i]); }
    function go(n){ i=(n+BIKE_ORDER.length)%BIKE_ORDER.length; cv.style.opacity="0.2"; setTimeout(function(){ draw(); cv.style.opacity="1"; },90); }
    draw();
    if($("bikeL")) $("bikeL").onclick=function(){ go(i-1); };
    if($("bikeR")) $("bikeR").onclick=function(){ go(i+1); };
    Array.prototype.forEach.call(dots.children,function(d,k){ d.onclick=function(){ go(k); }; });
    var sx=0,drag=false;
    cv.addEventListener("pointerdown",function(e){ drag=true; sx=e.clientX; });
    cv.addEventListener("pointerup",function(e){ if(!drag)return; drag=false; var dx=e.clientX-sx; if(dx<-38) go(i+1); else if(dx>38) go(i-1); });
    cv.addEventListener("wheel",function(e){ if(Math.abs(e.deltaY)>4){ e.preventDefault(); go(i+(e.deltaY>0?1:-1)); } },{passive:false});
    window.addEventListener("resize", draw);
    if($("bikeRide")) $("bikeRide").onclick=function(){ goRideFromArcade("endless"); }; }
  function loadScores(){ try{ return JSON.parse(localStorage.getItem("kc_scores")||"[]"); }catch(e){ return []; } }
  function saveScore(name,score){ var a=loadScores(); a.push({name:name,score:score,ts:Date.now()}); a.sort(function(p,q){ return q.score-p.score; }); a=a.slice(0,8); try{ localStorage.setItem("kc_scores",JSON.stringify(a)); }catch(e){} }
  function openGameOver(score){ ST.best=Math.max(ST.best||0,score); getCtx();
    openPanel("Wiped out",
      '<div class="go"><div class="goScore">'+score+'</div><div class="goBest">best \u00b7 '+ST.best+'</div>'+
      '<div class="goSave"><input class="loopName" id="goName" placeholder="name for the board" maxlength="14"><button class="btn ghost" id="goSaveBtn">Save score</button></div>'+
      '<div class="goBoard" id="goBoard"></div>'+
      '<div class="row" style="flex-direction:column;gap:10px;align-items:stretch;margin-top:16px">'+
      '<button class="btn solid" id="goRetry">Retry \u21ba</button>'+
      '<button class="btn ghost" id="goMenu">Back to warehouse</button></div></div>',
      function(){ renderBoard();
        $("goSaveBtn").onclick=function(){ var nm=($("goName").value||"").trim()||"KC"; saveScore(nm,score); $("goName").value=""; renderBoard(); flashBtn(this,"\u2713 Saved"); };
        $("goRetry").onclick=function(){ goRideFromArcade("endless"); };
        $("goMenu").onclick=function(){ closePanel(); goWarehouse({skipIntro:true,spawn:"arcade"}); }; }); }
  function renderBoard(){ var el=$("goBoard"); if(!el)return; var a=loadScores();
    if(!a.length){ el.innerHTML='<div class="goBHead">HIGH SCORES</div><span class="loopsEmpty">No scores yet \u2014 save yours.</span>'; return; }
    el.innerHTML='<div class="goBHead">HIGH SCORES</div>';
    a.forEach(function(s,i){ var r=document.createElement("div"); r.className="goRow"; r.innerHTML='<span>'+(i+1)+'. '+escHtml(s.name)+'</span><b>'+s.score+'</b>'; el.appendChild(r); }); }
  function whLibrary(){ openPanel("Library",    '<div class="row" style="flex-direction:column;gap:10px;align-items:stretch">'+
    '<button class="btn solid" id="libMixes">Secret mixes</button>'+
    '<button class="btn ghost" id="libWall">Community wall</button>'+
    '</div>');
    $("libMixes").onclick=openMixes; $("libWall").onclick=openWall; }
  function openInquiry(){ getCtx(); var mode="pick";
    openPanel("Inquiry", '<div id="inqBody"></div>', function(){ render(); });
    function render(){ var b=$("inqBody"); if(!b)return;
      if(mode==="pick"){ b.innerHTML=
        '<p class="lede" style="margin:0 0 14px">Booking KillsComfort for a club, private, or corporate event? Reach out.</p>'+
        '<div class="row" style="flex-direction:column;gap:10px;align-items:stretch">'+
        '<a class="btn solid" href="mailto:Killscomfort@gmail.com?subject=Booking%20inquiry%20%E2%80%94%20KillsComfort&body=Event%20type%3A%0ADate%3A%0ALocation%3A%0ADetails%3A%0A" >Send an email</a>'+
        '<button class="btn ghost" id="inqForm">Fill out the inquiry form</button></div>';
        $("inqForm").onclick=function(){ mode="form"; render(); }; }
      else if(mode==="form"){ b.innerHTML=
        '<div class="form">'+
        field("Name","iq_name","")+field("Email","iq_email","")+
        '<label class="fLbl">Event type<select class="fInp" id="iq_type"><option>Club night</option><option>Private event</option><option>Corporate</option><option>Festival</option><option>Other</option></select></label>'+
        '<div class="fRow">'+field("Date","iq_date","")+field("Location","iq_loc","")+'</div>'+
        '<label class="fLbl">Details<textarea class="fInp" id="iq_msg" rows="3"></textarea></label>'+
        '<div class="fErr" id="iqErr"></div></div>'+
        '<div class="row" style="gap:10px"><button class="btn ghost" id="iqBack">\u2039 Back</button><button class="btn solid" id="iqSend">Send inquiry \u2192</button></div>';
        $("iqBack").onclick=function(){ mode="pick"; render(); };
        $("iqSend").onclick=function(){ var nm=v("iq_name"),em=v("iq_email");
          if(!nm||!em){ $("iqErr").textContent="Name and email are required."; return; }
          if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){ $("iqErr").textContent="That email doesn't look right."; return; }
          var body="Name: "+nm+"%0AEmail: "+em+"%0AEvent: "+encodeURIComponent(v("iq_type"))+"%0ADate: "+encodeURIComponent(v("iq_date"))+"%0ALocation: "+encodeURIComponent(v("iq_loc"))+"%0ADetails: "+encodeURIComponent(v("iq_msg"));
          window.location.href="mailto:Killscomfort@gmail.com?subject=Booking%20inquiry%20%E2%80%94%20"+encodeURIComponent(nm)+"&body="+body;
          mode="sent"; render(); }; }
      else { b.innerHTML='<div class="coDone"><div class="coCheck">\u2713</div><div class="coDoneT">Inquiry ready</div><div class="coDoneS">Your email app should open with the details filled in. In production this posts straight to your site form via Resend.</div><button class="btn solid" id="iqDone">Done</button></div>'; $("iqDone").onclick=closePanel; }
      function field(label,id,val){ return '<label class="fLbl">'+label+'<input class="fInp" id="'+id+'" value="'+(val?escHtml(val):"")+'"></label>'; }
      function v(id){ var e=$(id); return e?(""+e.value).trim():""; }
    }
  }
  function whArcade(){
    if(!hasArcadeKey()){ openArcadeLocked(); return; }
    openPanel("Arcade \u2014 pick a game",
    '<div class="row" style="flex-direction:column;gap:10px;align-items:stretch">'+
    '<button class="btn solid" id="acNight">Night Ride \u00b7 grab the 3 tags</button>'+
    '<button class="btn ghost" id="acEndless">Endless Survival \u00b7 highscore</button>'+
    '</div>');
    $("acNight").onclick=function(){ goRideFromArcade("collect"); };
    $("acEndless").onclick=function(){ goRideFromArcade("endless"); }; }
  function goRideFromArcade(mode){
    if(!hasArcadeKey()){ openArcadeLocked(); return; }
    getCtx(); closePanel(); if(stopWarehouse){ stopWarehouse(); stopWarehouse=null; } if(stopBedroom){ stopBedroom(); stopBedroom=null; } show("ride"); $("hud").classList.add("on");
    $("ridehint").style.display=""; var spec=getBikeSpec();
    if(mode==="collect"){ $("ridehint").textContent="TAP / SPACE TO HOP \u00b7 GRAB ALL 3 TAGS";
      stopRide=startRide({mode:"collect", spec:spec, onArrive:function(){ goWarehouse({skipIntro:true,spawn:"arcade"}); }, onCollect:collect }); }
    else { $("ridehint").textContent="TAP TOP = JUMP  \u00b7  TAP BOTTOM = DUCK";
      stopRide=startRide({mode:"endless", spec:spec, onDeath:function(score){ if(stopRide){ stopRide=null; } openGameOver(score); } }); } }
  $("keepRiding").onclick=function(){ goRideFromArcade("endless"); };
  $("startBtn").onclick=function(){ goArrival(); };
  $("skipBtn").onclick=function(){ if(stopRide){ stopRide(); stopRide=null; } if(stopLobby){ stopLobby(); stopLobby=null; } if(stopArrival){ stopArrival(); stopArrival=null; } if(stopWarehouse){ stopWarehouse(); stopWarehouse=null; } if(stopBedroom){ stopBedroom(); stopBedroom=null; } stopBedDrone(); if(window.top&&window.top!==window){ window.top.location.href="/site"; } else { show("exit"); } };
  $("headOut").onclick=function(){ if(stopWarehouse){ stopWarehouse(); stopWarehouse=null; } if(stopBedroom){ stopBedroom(); stopBedroom=null; } stopBedDrone(); show("exit"); };
  $("again").onclick=function(){ ST.values=[]; ST.beatMade=false; ST.gemFound=false; ST.merchFound=false; ST.mixes.forEach(function(m){m.unlocked=false;}); ST.digIdx=0; syncHud(); goArrival(); };
  $("spot-beat").onclick=function(){ getCtx(); openBeat(); };
  $("spot-dig").onclick=function(){ getCtx(); openDig(); };
  $("spot-mixes").onclick=function(){ getCtx(); openMixes(); };
  $("spot-wall").onclick=function(){ getCtx(); openWall(); };
  $("spot-merch").onclick=function(){ openMerch(); };
  document.addEventListener("keydown",function(e){ if(e.key==="Escape") closePanel(); });
  syncHud(); goArrival();
})();
