System.register(["jimu-core","jimu-ui/advanced/setting-components","jimu-ui"],(function(e,t){var a={},i={},n={};return{setters:[function(e){a.React=e.React},function(e){i.MapWidgetSelector=e.MapWidgetSelector,i.SettingRow=e.SettingRow,i.SettingSection=e.SettingSection},function(e){n.TextInput=e.TextInput}],execute:function(){
var R=a.React;
var Setting=function(p){
  var c=p.config,id=p.id;
  var set=function(k,v){p.onSettingChange({id:id,config:c.set(k,v)})};
  var rad=function(label,k,hint){return R.createElement(i.SettingRow,{label:label,flow:"wrap"},
    R.createElement(n.TextInput,{size:"sm",className:"w-100",defaultValue:c[k]||"",onAcceptValue:function(v){set(k,v)}}),
    hint?R.createElement("div",{style:{fontSize:12,opacity:.8,marginTop:4}},hint):null)};
  return R.createElement("div",{className:"widget-setting-nybyggnadskarta-export"},
    R.createElement(i.SettingSection,{title:"Karta"},
      R.createElement(i.SettingRow,null,R.createElement(i.MapWidgetSelector,{onSelect:function(ids){p.onSettingChange({id:id,useMapWidgetIds:ids})},useMapWidgetIds:p.useMapWidgetIds})),
      R.createElement(i.SettingRow,null,R.createElement("div",{style:{fontSize:12,opacity:.8}},"Välj kartwidgeten där fastigheten och utsnittet ska visas."))),
    R.createElement(i.SettingSection,{title:"Tjänster"},
      rad("Exportverktyg","gpUrl","Adressen till uppgiften Exportera i webbverktyget Nybyggnadskarta_export."),
      rad("Fastighetslager","fastighetUrl","Lagret med fastighetsytor."),
      rad("Fält med fastighetsbeteckning","fastighetFalt",null),
      rad("Detaljplanelager","detaljplanUrl","Lagret Detaljplaner, med fälten Plankarta och Planbestammelse.")),
    R.createElement(i.SettingSection,{title:"Rithuvud"},
      rad("Giltighetstid","giltighetstid",null)));
};
e({__esModule:!0,__set_webpack_public_path__:function(){},default:Setting});
}}}));
