System.register(["jimu-core","jimu-arcgis","jimu-ui","esri/Graphic","esri/layers/GraphicsLayer","esri/rest/query","esri/rest/support/Query","esri/rest/geoprocessor","esri/geometry/geometryEngine","esri/geometry/projection","esri/geometry/SpatialReference","esri/request"],(function(e,t){var m={};function U(x,f){return x&&typeof x[f]==="function"?x:(x&&x.default&&typeof x.default[f]==="function"?x.default:x)}return{setters:[function(x){m.React=x.React},function(x){m.JimuMapViewComponent=x.JimuMapViewComponent},function(x){m.Button=x.Button,m.TextInput=x.TextInput},function(x){m.Graphic=x.default},function(x){m.GraphicsLayer=x.default},function(x){m.query=U(x,"executeQueryJSON")},function(x){m.Query=x.default},function(x){m.gp=U(x,"submitJob")},function(x){m.ge=U(x,"union")},function(x){m.projection=U(x,"project")},function(x){m.SpatialReference=x.default},function(x){m.request=x.default}],execute:function(){
/* Nybyggnadskarta, export. Haparanda kommun.
   Valjer fastighet, forhandsgranskar utsnittet och bestaller PDF och DXF fran webbverktyget
   Nybyggnadskarta_export. All data hamtas med den inloggning som appen redan har. */
var R=m.React,h=R.createElement;
var STANDARD={
  gpUrl:"https://geodata.haparanda.se/server/rest/services/Nybyggnadskarta_export/GPServer/Exportera",
  fastighetUrl:"https://geodata.haparanda.se/server/rest/services/Fastigheter_ytor/MapServer/9",
  fastighetFalt:"fastighet",
  detaljplanUrl:"https://geodata.haparanda.se/server/rest/services/Bygg_miljo_lager/MapServer/7",
  wkid:3018,skalorWidget:[500,1000,2000,4000,5000],giltighetstid:"1 år"};
// kartramens matt i mm for varje mall (samma som i cim2dxf.mall_for)
var RAMAR={"A4 liggande":[152.8,172.8],"A4 stående":[188.8,180.4],"A3 liggande":[275.7669,259.7923],"A3 stående":[152.8,382.8],
  "A2 liggande":[449.8,382.8],"A2 stående":[275.8,556.8],"A1 liggande":[696.8,556.8],"A1 stående":[449.8,803.8],
  "A0 liggande":[1044.8,803.8],"A0 stående":[696.8,1151.8]};
var ARK=["A4","A3","A2","A1","A0"];
var FALT=[
  ["adress","Adress"],["dnr","Diarienummer"],
  ["kartframstallning_av","Kartframställning, utförd av"]];
var FALT_VA=[
  ["spillv_forbindelse","Spillvatten, höjd vid förbindelsepunkten"],["dagv_forbindelse","Dagvatten, höjd vid förbindelsepunkten"],
  ["spillv_uppdamning","Spillvatten, uppdämningshöjd"],["dagv_uppdamning","Dagvatten, uppdämningshöjd"],
  ["vattentryck","Normalt vattentryck (kg/cm2)"]];
var CSS=".nyb{padding:12px;height:100%;overflow:auto;font-size:13px;line-height:1.4;background:var(--sys-color-surface-paper,#fff);color:var(--sys-color-surface-paper-text,#1f1f1f);box-shadow:0 1px 4px rgba(0,0,0,.25)}"+
  ".nyb h3{font-size:14px;font-weight:600;margin:14px 0 6px}.nyb h3:first-child{margin-top:0}"+
  ".nyb .rad{margin-bottom:8px}.nyb label.et{display:block;font-size:12px;opacity:.8;margin-bottom:2px}"+
  ".nyb .forslag{border:1px solid var(--sys-color-divider-secondary,#ccc);max-height:180px;overflow:auto;margin-top:2px}"+
  ".nyb .forslag div{padding:4px 8px;cursor:pointer}.nyb .forslag div:hover{background:rgba(0,120,200,.12)}"+
  ".nyb .info{background:rgba(0,0,0,.05);padding:8px;margin:8px 0}.nyb .fel{background:#fde8e8;color:#8a1c1c;padding:8px;margin:8px 0}"+
  ".nyb .knappar{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.nyb .skala label{margin-right:14px;cursor:pointer}"+
  ".nyb select{width:100%;height:28px;font-size:13px;border:1px solid var(--sys-color-divider-secondary,#bbb);background:#fff;color:inherit}.nyb .tva{display:flex;gap:8px}.nyb .tva>div{flex:1}.nyb .stapeltext{display:flex;justify-content:space-between;margin-bottom:6px}.nyb .stapel{height:8px;background:rgba(0,0,0,.12);border-radius:4px;overflow:hidden;position:relative}.nyb .fyllning{height:100%;width:0;background:#0079c1;border-radius:4px;transition:width .6s ease}.nyb .stapel.obestamd .fyllning{position:absolute;width:30%;animation:nyb-glid 1.4s ease-in-out infinite}@keyframes nyb-glid{0%{left:-30%}100%{left:100%}}.nyb .liten{font-size:12px;opacity:.8}.nyb .plan{margin:2px 0}";

function bet(n){return String(n||"").split(">")[0].trim()}
function sql(s){return String(s).replace(/'/g,"''")}
function ram(c,skala,mm){var w=mm[0]/1000*skala,hh=mm[1]/1000*skala;return[c[0]-w/2,c[1]-hh/2,c[0]+w/2,c[1]+hh/2]}
function datum(v){if(!v)return null;if(typeof v==="number"){var d=new Date(v);return d.toISOString().slice(0,10)}
  v=String(v).trim();return/^\d{8}$/.test(v)?v.slice(0,4)+"-"+v.slice(4,6)+"-"+v.slice(6):v}
function lank(v){v=v?String(v).trim():"";if(!v)return null;if(/^www\./i.test(v))v="https://"+v;return/^https?:\/\//i.test(v)?v:null}
function attr(a,namn){var k=Object.keys(a);for(var i=0;i<k.length;i++)if(k[i].toLowerCase()===namn.toLowerCase())return a[k[i]];return null}

var Widget=function(props){
  var cfg=Object.assign({},STANDARD,props.config&&props.config.asMutable?props.config.asMutable({deep:!0}):props.config||{});
  var mapId=props.useMapWidgetIds&&props.useMapWidgetIds.length?props.useMapWidgetIds[0]:null;
  var S=R.useState,ref=R.useRef;
  var _v=S(null),jmv=_v[0],setJmv=_v[1];
  var _t=S(""),text=_t[0],setText=_t[1];
  var _f=S([]),forslag=_f[0],setForslag=_f[1];
  var _o=S(null),obj=_o[0],setObj=_o[1];            // {namn, geom, center0, areal}
  var _c=S(null),center=_c[0],setCenter=_c[1];
  var skalor=(cfg.skalorWidget||STANDARD.skalorWidget).slice();if(skalor.indexOf(500)<0)skalor.unshift(500);
  var _s=S(skalor.indexOf(1000)>=0?1000:skalor[0]),skala=_s[0],setSkala=_s[1];
  var _a=S("A3"),ark=_a[0],setArk=_a[1];
  var _ri=S("liggande"),riktning=_ri[0],setRiktning=_ri[1];
  var format=ark+" "+riktning,mm=RAMAR[format];
  var _p=S(null),planer=_p[0],setPlaner=_p[1];      // null = inte hamtade
  var _l=S(""),lage=_l[0],setLage=_l[1];            // "", "valj", "flytta"
  // kartframstallningen utfors av den som ar inloggad i portalen
  var anv=props.user?(props.user.fullName||props.user.username||""):"";
  var _r=S(anv?{kartframstallning_av:anv}:{}),rh=_r[0],setRh=_r[1];
  R.useEffect(function(){if(anv)setRh(function(o){return o.kartframstallning_av?o:Object.assign({},o,{kartframstallning_av:anv})})},[anv]);
  var _va=S(false),visaVa=_va[0],setVisaVa=_va[1];
  var _j=S({status:"",fel:"",pdf:null,dxf:null,arbetar:false}),jobb=_j[0],setJobb=_j[1];
  var _m=S(""),medd=_m[0],setMedd=_m[1];
  var lager=ref(null),lageRef=ref(""),sokNr=ref(0),lasRef=ref({});
  lageRef.current=lage;
  lasRef.current={center:center,skala:skala,mm:mm,arbetar:jobb.arbetar};
  var sr=new m.SpatialReference({wkid:cfg.wkid});

  function tillVy(g){var v=jmv&&jmv.view;if(!v||!g)return Promise.resolve(g);
    if(v.spatialReference.wkid===cfg.wkid)return Promise.resolve(g);
    return m.projection.load().then(function(){return m.projection.project(g,v.spatialReference)})}
  function tillData(g){if(!g||g.spatialReference.wkid===cfg.wkid)return Promise.resolve(g);
    return m.projection.load().then(function(){return m.projection.project(g,sr)})}

  // lagret med forhandsgranskningen
  R.useEffect(function(){
    if(!jmv)return;
    var gl=new m.GraphicsLayer({title:"Nybyggnadskarta, utsnitt",listMode:"hide"});
    jmv.view.map.add(gl);lager.current=gl;
    var vy=jmv.view;
    m.projection.load().catch(function(){});
    function punkt(ev){            // skarmpunkt till kartans koordinatsystem (wkid i installningarna), synkront
      var p=vy.toMap({x:ev.x,y:ev.y});if(!p)return null;
      if(p.spatialReference.wkid!==cfg.wkid){try{p=m.projection.project(p,sr)}catch(x){return null}}
      return p?[p.x,p.y]:null}
    var hk=vy.on("click",function(ev){
      var l=lageRef.current;if(!l)return;
      ev.stopPropagation();
      tillData(ev.mapPoint).then(function(p){
        if(l==="flytta"){setCenter([p.x,p.y]);setLage("")}
        else if(l==="valj"){setLage("");valjVidPunkt(p)}
      });
    });
    // utsnittet kan dras med musen: tryck inne i den roda ramen och dra
    var grepp=null;
    var hd=vy.on("drag",function(ev){
      var st=lasRef.current;
      if(ev.action==="start"){
        grepp=null;
        if(!st.center||st.arbetar)return;
        var p=punkt(ev.origin||ev);if(!p)return;
        var b=ram(st.center,st.skala,st.mm);
        if(p[0]<b[0]||p[0]>b[2]||p[1]<b[1]||p[1]>b[3])return;
        grepp=[st.center[0]-p[0],st.center[1]-p[1]];
        ev.stopPropagation();
      }else if(grepp){
        ev.stopPropagation();
        var q=punkt(ev);
        if(q)setCenter([q[0]+grepp[0],q[1]+grepp[1]]);
        if(ev.action==="end")grepp=null;
      }
    });
    return function(){hk.remove();hd.remove();try{jmv.view.map.remove(gl);gl.destroy()}catch(x){}lager.current=null};
  },[jmv]);

  // rita fastighet och ram
  R.useEffect(function(){
    var gl=lager.current;if(!gl)return;
    gl.removeAll();
    if(!center)return;
    var b=ram(center,skala,mm);
    var ruta={type:"polygon",rings:[[[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]],[b[0],b[1]]]],spatialReference:{wkid:cfg.wkid}};
    var aktuell=true;
    Promise.all([obj?tillVy(obj.geom):Promise.resolve(null),tillVy(m.Graphic.fromJSON({geometry:ruta}).geometry)]).then(function(g){
      if(!aktuell||lager.current!==gl)return;
      gl.removeAll();
      if(g[0])gl.add(new m.Graphic({geometry:g[0],symbol:{type:"simple-fill",color:[0,120,200,.12],outline:{color:[0,90,170,1],width:1.5}}}));
      gl.add(new m.Graphic({geometry:g[1],symbol:{type:"simple-fill",color:[0,0,0,0],outline:{color:[200,30,30,1],width:2,style:"dash"}}}));
      var k=g[1].extent.center;
      gl.add(new m.Graphic({geometry:k,symbol:{type:"simple-marker",style:"cross",size:12,color:[200,30,30,1],outline:{color:[200,30,30,1],width:1.5}}}));
      gl.add(new m.Graphic({geometry:{type:"point",x:g[1].extent.xmin,y:g[1].extent.ymax,spatialReference:g[1].spatialReference},
        symbol:{type:"text",text:format+", 1:"+skala,color:[200,30,30,1],haloColor:"white",haloSize:1.5,
          horizontalAlignment:"left",verticalAlignment:"bottom",yoffset:3,font:{size:10,weight:"bold"}}}));
    });
    return function(){aktuell=false};
  },[obj,center,skala,format,jmv]);

  function zooma(c,sk,ma){var v=jmv&&jmv.view;if(!v||!c)return;
    var b=ram(c,sk,ma||mm);
    tillVy(m.Graphic.fromJSON({geometry:{xmin:b[0],ymin:b[1],xmax:b[2],ymax:b[3],spatialReference:{wkid:cfg.wkid}}}).geometry)
      .then(function(x){v.goTo(x.expand(1.25)).catch(function(){})})}

  function sok(v){
    setText(v);setMedd("");
    var nr=++sokNr.current;
    v=v.trim();
    if(v.length<2){setForslag([]);return}
    var q=new m.Query({where:"UPPER("+cfg.fastighetFalt+") LIKE '"+sql(v.toUpperCase())+"%'",outFields:[cfg.fastighetFalt],
      returnGeometry:false,returnDistinctValues:true,orderByFields:[cfg.fastighetFalt],num:60});
    m.query.executeQueryJSON(cfg.fastighetUrl,q).then(function(r){
      if(nr!==sokNr.current)return;
      var ut=[];r.features.forEach(function(f){var n=bet(attr(f.attributes,cfg.fastighetFalt));if(n&&ut.indexOf(n)<0)ut.push(n)});
      ut.sort(function(x,y){return x.localeCompare(y,"sv",{numeric:true})});setForslag(ut.slice(0,15));
    }).catch(function(x){if(nr===sokNr.current){setForslag([]);setMedd("Sökningen misslyckades: "+(x&&x.message||x))}});
  }

  function valj(namn){
    namn=bet(namn);
    setForslag([]);setText(namn);setMedd("");setPlaner(null);setJobb({status:"",fel:"",pdf:null,dxf:null,arbetar:false});
    var N=sql(String(namn).toUpperCase()),F="UPPER("+cfg.fastighetFalt+")";
    // lagret anger omradesnummer efter beteckningen (BRANDEN 2>1): alla omraden hamtas
    var q=new m.Query({where:F+" = '"+N+"' OR "+F+" LIKE '"+N+">%'",outFields:[cfg.fastighetFalt],
      returnGeometry:true,outSpatialReference:sr});
    m.query.executeQueryJSON(cfg.fastighetUrl,q).then(function(r){
      var gs=r.features.map(function(f){return f.geometry}).filter(Boolean);
      if(!gs.length){setObj(null);setCenter(null);setMedd('Hittar ingen fastighet som heter "'+namn+'".');return}
      var geom=gs.length>1?m.ge.union(gs):gs[0],ex=geom.extent;
      var areal=0;gs.forEach(function(g){areal+=Math.abs(m.ge.planarArea(g,"square-meters"))});
      var c=[(ex.xmin+ex.xmax)/2,(ex.ymin+ex.ymax)/2];
      setObj({namn:String(namn).toUpperCase(),geom:geom,center0:c,areal:Math.round(areal),delar:gs.length});
      setCenter(c);zooma(c,skala);hamtaPlaner(geom);
    }).catch(function(x){setMedd("Fastigheten kunde inte hämtas: "+(x&&x.message||x))});
  }

  function valjVidPunkt(p){
    var q=new m.Query({geometry:p,spatialRelationship:"intersects",outFields:[cfg.fastighetFalt],returnGeometry:false});
    m.query.executeQueryJSON(cfg.fastighetUrl,q).then(function(r){
      var n=r.features.length?attr(r.features[0].attributes,cfg.fastighetFalt):null;
      if(n)valj(n);else setMedd("Ingen fastighet på den platsen.");
    }).catch(function(x){setMedd("Fastigheten kunde inte hämtas: "+(x&&x.message||x))});
  }

  function hamtaPlaner(geom){
    if(!cfg.detaljplanUrl){setPlaner([]);return}
    var inre=null;try{inre=m.ge.buffer(geom,-0.5,"meters")}catch(x){}
    var q=new m.Query({geometry:inre||geom,spatialRelationship:"intersects",outFields:["*"],returnGeometry:false});
    m.query.executeQueryJSON(cfg.detaljplanUrl,q).then(function(r){
      setPlaner(r.features.map(function(f){var a=f.attributes,l=[];
        [["Plankarta","Plankarta"],["Plankarta 2","Plankarta_2"],["Planbestämmelser","Planbestammelse"]].forEach(function(x){
          var u=lank(attr(a,x[1]));if(u)l.push([x[0],u])});
        return{beteckning:attr(a,"planbet"),namn:attr(a,"Plannamn_intern")||attr(a,"plnamn"),laga_kraft:datum(attr(a,"ldat")),lankar:l}}));
    }).catch(function(x){setPlaner(null);setMedd("Detaljplanerna kunde inte hämtas: "+(x&&x.message||x))});
  }

  function exportera(){
    if(!center||jobb.arbetar)return;
    var rit=Object.assign({},rh,{giltighetstid:cfg.giltighetstid});
    if(obj&&planer)rit.planer=planer;
    var par={fastighet:obj?obj.namn:"-",skala:String(skala),rithuvud:JSON.stringify(rit),
      mittpunkt:center[0].toFixed(2)+","+center[1].toFixed(2),format:format,lage:"widget"};
    setJobb({status:"Kartan ritas",procent:0,fel:"",pdf:null,dxf:null,arbetar:true});
    m.gp.submitJob(cfg.gpUrl,par).then(function(j){
      return j.waitForJobCompletion({interval:2500,statusCallback:function(s){
        // tjanstens meddelanden "Forlopp NN %" ger procentsatsen, ovriga meddelanden visas inte
        var ms=s.messages||[],pr=null;
        for(var i=ms.length-1;i>=0;i--){var mt=/Forlopp\s+(\d+)/.exec(String(ms[i].description||""));if(mt){pr=+mt[1];break}}
        setJobb(function(o){return Object.assign({},o,{status:"Kartan ritas",procent:pr})})}})
      .then(function(){return Promise.all([j.fetchResultData("dxf"),j.fetchResultData("pdf").catch(function(){return null})])});
    }).then(function(res){
      var u=function(x){return x&&x.value&&(x.value.url||x.value)||null};
      setJobb({status:"Klart.",fel:u(res[1])?"":"PDF:en kunde inte skapas, DXF-filen finns.",pdf:u(res[1]),dxf:u(res[0]),arbetar:false});
    }).catch(function(x){
      var ms=x&&x.messages||x&&x.details&&x.details.messages||[];
      var d=ms.filter(function(q){return/error/i.test(q.type||"")}).map(function(q){return String(q.description||"").trim()})
        .filter(function(t){return t&&!/^Traceback|^Failed/.test(t.replace(/^\ufeff/,""))})[0]||"";
      setJobb({status:"",fel:"Exporten misslyckades. "+(d||x&&x.message||String(x)),pdf:null,dxf:null,arbetar:false});
    });
  }

  function laddaNer(url){
    var namn=decodeURIComponent(String(url).split("?")[0].split("/").pop());
    m.request(url,{responseType:"blob"}).then(function(r){
      var a=document.createElement("a"),o=URL.createObjectURL(r.data);
      a.href=o;a.download=namn;document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(o)},60000);
    }).catch(function(x){setMedd("Filen kunde inte laddas ner: "+(x&&x.message||x))});
  }

  function kartansMitt(){var v=jmv&&jmv.view;if(!v)return;
    tillData(v.center).then(function(p){setCenter([p.x,p.y]);zooma([p.x,p.y],skala)})}
  function rensa(){setObj(null);setPlaner(null);setText("");setForslag([]);setMedd("")}
  function falt(par){return h("div",{className:"rad",key:par[0]},h("label",{className:"et"},par[1]),
    h(m.TextInput,{size:"sm",className:"w-100",value:rh[par[0]]||"",disabled:jobb.arbetar,
      onChange:function(ev){var v=ev.target.value;setRh(function(o){var n=Object.assign({},o);n[par[0]]=v;return n})}}))}

  var flyttad=obj&&center&&(Math.abs(center[0]-obj.center0[0])>.01||Math.abs(center[1]-obj.center0[1])>.01);
  var idag=new Date();idag=idag.getFullYear()+"-"+("0"+(idag.getMonth()+1)).slice(-2)+"-"+("0"+idag.getDate()).slice(-2);
  var utanfor=false;
  if(obj&&center){var b=ram(center,skala,mm),ex=obj.geom.extent;utanfor=ex.xmin<b[0]||ex.ymin<b[1]||ex.xmax>b[2]||ex.ymax>b[3]}

  return h("div",{className:"nyb jimu-widget"},
    h("style",null,CSS),
    mapId?h(m.JimuMapViewComponent,{useMapWidgetId:mapId,onActiveViewChange:function(v){setJmv(v)}}):
      h("div",{className:"fel"},"Välj en kartwidget i widgetens inställningar."),
    h("h3",null,"1. Fastighet (valfritt)"),
    h("div",{className:"liten rad"},"Välj en fastighet för att få beteckning, areal och detaljplan i rithuvudet, eller placera utsnittet fritt under punkt 2."),
    h(m.TextInput,{size:"sm",className:"w-100",placeholder:"Sök fastighet, t.ex. BRANDEN 2",value:text,disabled:jobb.arbetar,
      onChange:function(ev){sok(ev.target.value)},onKeyDown:function(ev){if(ev.key==="Enter"&&text.trim())valj(forslag.length===1?forslag[0]:text.trim())}}),
    forslag.length?h("div",{className:"forslag"},forslag.map(function(n){return h("div",{key:n,onClick:function(){valj(n)}},n)})):null,
    h("div",{className:"knappar"},
      h(m.Button,{size:"sm",type:lage==="valj"?"primary":"default",disabled:!jmv||jobb.arbetar,
        onClick:function(){setLage(lage==="valj"?"":"valj")}},lage==="valj"?"Klicka på fastigheten i kartan …":"Välj i kartan"),
      obj?h(m.Button,{size:"sm",disabled:jobb.arbetar,onClick:rensa},"Ingen fastighet"):null),
    medd?h("div",{className:"fel"},medd):null,
    obj?h("div",{className:"info"},h("b",null,obj.namn),h("br"),"Areal: "+obj.areal.toLocaleString("sv-SE")+" m²"+(obj.delar>1?" ("+obj.delar+" skiften)":""),
      h("br"),"Detaljplan: ",planer===null?"hämtas …":planer.length?planer.map(function(p,i){
        return h("div",{className:"plan",key:i},[p.beteckning,p.namn].filter(Boolean).join(" "),
          p.lankar.map(function(l){return h("span",{key:l[0]}," · ",h("a",{href:l[1],target:"_blank",rel:"noopener noreferrer"},l[0]))}))}):"ingen (utanför detaljplanelagt område)"):null,
    h("h3",null,"2. Utsnitt"),
    h("div",{className:"tva rad"},
      h("div",null,h("label",{className:"et"},"Format"),h("select",{value:ark,disabled:jobb.arbetar,
        onChange:function(ev){var v=ev.target.value;setArk(v);if(center)zooma(center,skala,RAMAR[v+" "+riktning])}},
        ARK.map(function(a){return h("option",{key:a,value:a},a)}))),
      h("div",null,h("label",{className:"et"},"Riktning"),h("select",{value:riktning,disabled:jobb.arbetar,
        onChange:function(ev){var v=ev.target.value;setRiktning(v);if(center)zooma(center,skala,RAMAR[ark+" "+v])}},
        h("option",{value:"liggande"},"Liggande"),h("option",{value:"stående"},"Stående")))),
    h("div",{className:"rad skala"},skalor.map(function(s){return h("label",{key:s},
      h("input",{type:"radio",name:"nyb-skala-"+props.id,checked:skala===s,disabled:jobb.arbetar,onChange:function(){setSkala(s);if(center)zooma(center,s)}})," 1:"+s)})),
    h("div",{className:"liten"},center?"Den röda ramen visar vad som kommer med, "+Math.round(mm[0]*skala/1000)+" × "+Math.round(mm[1]*skala/1000)+" m. Dra ramen i kartan för att flytta den. DXF-filen innehåller modellen för utsnittet och en layout i valt format och vald skala.":
      "Placera utsnittet i kartan, eller välj en fastighet ovan."),
    utanfor?h("div",{className:"liten"},"Hela fastigheten ryms inte i utsnittet."):null,
    h("div",{className:"knappar"},
      h(m.Button,{size:"sm",type:lage==="flytta"?"primary":"default",disabled:!jmv||jobb.arbetar,
        onClick:function(){setLage(lage==="flytta"?"":"flytta")}},lage==="flytta"?"Klicka på ny mittpunkt i kartan …":center?"Flytta med klick":"Placera med klick"),
      h(m.Button,{size:"sm",disabled:!jmv||jobb.arbetar,onClick:kartansMitt},"Kartans mitt"),
      flyttad?h(m.Button,{size:"sm",disabled:jobb.arbetar,onClick:function(){setCenter(obj.center0);zooma(obj.center0,skala)}},"Till fastigheten"):null,
      center?h(m.Button,{size:"sm",type:"tertiary",onClick:function(){zooma(center,skala)}},"Zooma till utsnittet"):null),
    h("h3",null,"3. Uppgifter i rithuvudet"),
    h("div",{className:"liten rad"},"Upprättad och kartframställningens datum sätts till "+idag+". Areal och detaljplan fylls i automatiskt när en fastighet är vald. Kartan är en förenklad nybyggnadskarta, fältkontroll anges som ej utförd. Uppgifterna låses i filen."),
    FALT.map(falt),
    h(m.Button,{size:"sm",type:"tertiary",onClick:function(){setVisaVa(!visaVa)}},visaVa?"Dölj VA-uppgifter":"Lägg till VA-uppgifter"),
    visaVa?h("div",{style:{marginTop:6}},FALT_VA.map(falt)):null,
    h("h3",null,"4. Skapa"),
    h(m.Button,{type:"primary",className:"w-100",disabled:!center||jobb.arbetar,onClick:exportera},jobb.arbetar?"Arbetar …":"Skapa PDF och DXF"),
    jobb.status?(jobb.arbetar?h("div",{className:"info"},
      h("div",{className:"stapeltext"},h("span",null,jobb.status+" …"),h("span",null,jobb.procent!=null?jobb.procent+" %":"")),
      h("div",{className:"stapel"+(jobb.procent==null?" obestamd":""),role:"progressbar","aria-valuemin":0,"aria-valuemax":100,
        "aria-valuenow":jobb.procent!=null?jobb.procent:undefined},
        h("div",{className:"fyllning",style:jobb.procent!=null?{width:Math.max(2,Math.min(100,jobb.procent))+"%"}:null}))):
      h("div",{className:"info"},jobb.status)):null,
    jobb.fel?h("div",{className:"fel"},jobb.fel):null,
    jobb.pdf||jobb.dxf?h("div",{className:"knappar"},
      jobb.pdf?h(m.Button,{size:"sm",type:"primary",onClick:function(){laddaNer(jobb.pdf)}},"Ladda ner PDF"):null,
      jobb.dxf?h(m.Button,{size:"sm",type:"primary",onClick:function(){laddaNer(jobb.dxf)}},"Ladda ner DXF"):null):null);
};
e({__esModule:!0,__set_webpack_public_path__:function(){},default:Widget});
}}}));
