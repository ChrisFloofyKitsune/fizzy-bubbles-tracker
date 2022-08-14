(self["webpackChunk_N_E"]=self["webpackChunk_N_E"]||[]).push([[81],{1440:function(e,r,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/data",function(){return t(4040)}]);if(false);},4040:function(e,r,t){"use strict";t.r(r);t.d(r,{DataPage:function(){return DataPage},default:function(){return G}});var a=t(7568);var n=t(4051);var l=t.n(n);var s=t(5893);var o=t(698);var c=t(2623);var i=t(5117);var u=t(4459);var d=t(9236);var f=t(7841);var v=t(6441);var E=t(7294);var h=t(4924);var p=t(2670);var x=t(6081);var N=t(2760);var _=t(4417);var m=t(3280);var C;(function(e){e["TEXT"]="TEXT";e["INTEGER"]="INTEGER";e["BOOLEAN"]="BOOLEAN";e["DATE"]="DATE";e["ID"]="ID";e["FOREIGN_KEY"]="FOREIGN_KEY";e["FOREIGN_KEY_LIST"]="FOREIGN_KEY_LIST";e["URL"]="URL";e["IMAGE_URL"]="IMAGE_URL";e["BBCODE"]="BBCODE";e["JSON"]="JSON";e["JSON_LIST"]="JSON_LIST";e["ENUM_GENDER"]="ENUM_GENDER";e["ENUM_CONTEST_STAT"]="ENUM_CONTEST_STAT";e["ENUM_CURRENCY_TYPE"]="ENUM_CURRENCY_TYPE";e["ENUM_MOVE_SOURCE_CATEGORY"]="ENUM_MOVE_SOURCE_CATEGORY"})(C||(C={}));function classifyProp(e,r){var t=C;var a;if(!!(a=e.findRelationWithPropertyPath(r)))return a.isManyToOne?t.FOREIGN_KEY:t.FOREIGN_KEY_LIST;var n=e.findColumnWithPropertyName(r);if(!n)return null;switch(n.propertyName){case"uuid":case"id":return t.ID;case"gender":return t.ENUM_GENDER;case"stat":return t.ENUM_CONTEST_STAT;case"currencyType":return t.ENUM_CURRENCY_TYPE;case"category":return t.ENUM_MOVE_SOURCE_CATEGORY;case"sourceURL":case"evolutionStageOneSource":case"evolutionStageTwoSource":return t.URL;case"imageLink":return t.IMAGE_URL;case"template":case"bbcodeProfile":return t.BBCODE;case"date":return t.DATE;case"levelUpMoves":return t.JSON_LIST;default:switch(n.type){case"integer":return t.INTEGER;case"boolean":return t.BOOLEAN;case"simple-json":return t.JSON;default:return t.TEXT}}}var y=t(8067);var S=t(1232);var T=t(4280);var b=t(7084);var g=t(705);var w=t(5434);var I=t(2753);var R=t(7484);var O;(function(e){e[e["EXISTS"]=0]="EXISTS";e[e["NEW"]=1]="NEW";e[e["CHANGED"]=2]="CHANGED";e[e["DELETING"]=3]="DELETING"})(O||(O={}));var j=(0,y.k)((function(e){var r;return r={hiddenCol:{display:"none",width:0},requiredColHeader:{"&.rdg-cell::before":{content:'"* "',color:e.colors.red[9]}}},(0,h.Z)(r,O.NEW,{".rdg-cell":{backgroundColor:e.fn.darken(e.colors.green[5],.5)}}),(0,h.Z)(r,O.CHANGED,{".rdg-cell":{backgroundColor:e.fn.darken(e.colors.yellow[5],.5)}}),(0,h.Z)(r,O.DELETING,{".rdg-cell":{backgroundColor:e.fn.darken(e.colors.red[5],.5),textDecoration:"line-through"}}),r}));var k=(0,s.jsx)("div",{children:"No data loaded"});function SqlTable(e){var r=e.entityMetadata,t=e.dataSource,n=e.placeholder,o=void 0===n?k:n,d=e.changesPendingCallback,v=void 0===d?function(){}:d;var y,D;var G=j();var A=(0,E.useState)([]),M=A[0],U=A[1];var L=(0,E.useState)(null),Y=L[0],P=L[1];var X=(0,E.useState)(false),B=X[0],F=X[1];var W=(0,E.useState)(false),Z=W[0],H=W[1];var z=(0,E.useState)(),K=z[0],J=z[1];var q=(0,E.useState)(),$=q[0],V=q[1];(0,E.useEffect)((function(){var e=[{key:"tempId",name:"Temp ID",required:false,minWidth:0,width:0,maxWidth:0,headerCellClass:G.classes.hiddenCol,cellClass:function(){return G.classes.hiddenCol}},x.F_];var t=true,a=false,n=void 0;try{var _loop=function(t,a){var n=a.value;var l=classifyProp(r,n);var o=r.findColumnWithPropertyName(n);var c=false;if(o)c=!o.isNullable&&!o.isGenerated&&void 0===o.default;var i={type:l,required:c,key:n,name:(o&&o.isPrimary?"\ud83d\udd11 ":"")+(0,_.toHeaderCase)(n),width:"calc(min-content + 2em)",resizable:true,summaryFormatter:function(){return(0,s.jsx)(s.Fragment,{children:(0,_.toHeaderCase)(l)})},headerCellClass:c?G.classes.requiredColHeader:void 0,cellClass:function(){return"".concat(n,"-cell")}};if(l===C.TEXT)Object.assign(i,{editable:true,editor:x.H4});e.push(i)};for(var l=Object.values(r.propertiesMap)[Symbol.iterator](),o;!(t=(o=l.next()).done);t=true)_loop(l,o)}catch(c){a=true;n=c}finally{try{if(!t&&null!=l.return)l.return()}finally{if(a)throw n}}U(e);J(void 0);F(false);v(false);V(void 0)}),[G.classes.requiredColHeader,G.classes.hiddenCol,v,r,Z]);(0,m.useAsyncEffect)((0,a.Z)(l().mark((function _callee(){var e,a,n,s,o,c,i,u;return l().wrap((function _callee$(l){while(1)switch(l.prev=l.next){case 0:if(r){l.next=3;break}P(null);return l.abrupt("return");case 3:l.next=5;return t.getRepository(r.name).find({loadEagerRelations:false,loadRelationIds:true});case 5:e=l.sent;a=[];n=true,s=false,o=void 0;l.prev=8;c=function(e,r){var t=r.value;Object.keys(t).forEach((function(e){if(null===t[e])t[e]=void 0;if((0,R.isDayjs)(t[e]))t[e]=t[e].format("DD-MMM-YYYY");else if("object"===typeof t[e])t[e]=JSON.stringify(t[e],null,2)}));t.tempId=self.crypto.randomUUID();t.hash=(0,g.sha1)(Object.assign({},t));t.state=O.EXISTS;a.push(t)};for(i=e[Symbol.iterator]();!(n=(u=i.next()).done);n=true)c(i,u);l.next=17;break;case 13:l.prev=13;l.t0=l["catch"](8);s=true;o=l.t0;case 17:l.prev=17;l.prev=18;if(!n&&null!=i.return)i.return();case 20:l.prev=20;if(!s){l.next=23;break}throw o;case 23:return l.finish(20);case 24:return l.finish(17);case 25:P(a);case 26:case"end":return l.stop()}}),_callee,null,[[8,13,17,25],[18,,20,24]])}))),[r,Z]);var Q=(0,E.useCallback)((function(e,r){var t=r.indexes;var a=true,n=false,l=void 0;try{for(var s=t[Symbol.iterator](),o;!(a=(o=s.next()).done);a=true){var c=o.value;var i=e[c];if(i.state===O.EXISTS||i.state===O.CHANGED){var u=Object.assign({},i);delete u.hash;delete u.state;i.state=(0,g.sha1)(u)===i.hash?O.EXISTS:O.CHANGED}}}catch(f){n=true;l=f}finally{try{if(!a&&null!=s.return)s.return()}finally{if(n)throw l}}var d=!e.every((function(e){return e.state===O.EXISTS}));F(d);v(d);P(e)}),[v]);var ee=(0,E.useCallback)((function(){var e=t.getRepository(r.target);var a=e.create();a.tempId=self.crypto.randomUUID();a.state=O.NEW;var n=true,l=false,s=void 0;try{for(var o=Object.values(r.propertiesMap)[Symbol.iterator](),c;!(n=(c=o.next()).done);n=true){var i=c.value;a[i]=void 0}}catch(u){l=true;s=u}finally{try{if(!n&&null!=o.return)o.return()}finally{if(l)throw s}}P(Y.concat(a));F(true);v(true);J(void 0)}),[r,Y,v,t]);var re=(0,E.useCallback)((function(){var e=[];var r=true,t=false,a=void 0;try{var _loop=function(r,t){var a=t.value;var n=Y.find((function(e){return e.tempId===a}));if(!n)return"continue";if(n.state===O.NEW)e.push(n);else n.state=O.DELETING};for(var n=$[Symbol.iterator](),l;!(r=(l=n.next()).done);r=true)_loop(n,l)}catch(c){t=true;a=c}finally{try{if(!r&&null!=n.return)n.return()}finally{if(t)throw a}}var s=Y.some((function(e){return e.state===O.DELETING}));F(s);v(s);var o=Y.filter((function(r){return!e.includes(r)}));P(o);V(void 0)}),[Y,$,v]);var te=(0,E.useCallback)((0,a.Z)(l().mark((function _callee(){var e,a,n,s;return l().wrap((function _callee$(l){while(1)switch(l.prev=l.next){case 0:J(void 0);e=t.getRepository(r.target);a=Y.filter((function(e){return e.state!==O.EXISTS}));a.forEach((function(e){return Object.keys(e).forEach((function(r){return e[r]=""===e[r]?null:e[r]}))}));n=a.filter((function(e){return e.state!==O.DELETING}));s=a.filter((function(e){return e.state===O.DELETING}));l.prev=6;if(!n){l.next=10;break}l.next=10;return e.save(n);case 10:if(!s){l.next=13;break}l.next=13;return e.remove(s);case 13:H(!Z);l.next=23;break;case 16:l.prev=16;l.t0=l["catch"](6);if(!(0,p.Z)(l.t0,N.K_)){l.next=22;break}J(l.t0);l.next=23;break;case 22:throw l.t0;case 23:case"end":return l.stop()}}),_callee,null,[[6,16]])}))),[r,Y,Z,t]);if(!M||null===Y)return(0,s.jsx)(s.Fragment,{children:o});return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(u.x,{sx:!K?{}:(0,h.Z)({},".state-".concat(O.NEW,", .state-").concat(O.CHANGED),(0,h.Z)({},"& .".concat(null===(y=K.message.match(RegExp("\\.(?<prop>\\w+)$")))||void 0===y?void 0:null===(D=y.groups)||void 0===D?void 0:D.prop,"-cell"),{boxShadow:"inset 0 0 0 3px red"})),children:(0,s.jsx)(x.ZP,{columns:M,rows:Y,rowKeyGetter:function(e){return e.tempId},summaryRows:[{}],rowClass:function(e){return(e&&e.state?G.classes[e.state]:"")+" state-".concat(e.state)},onRowsChange:Q,selectedRows:$,onSelectedRowsChange:V})}),(0,s.jsxs)(S.Z,{mt:"xs",children:[(0,s.jsx)(f.z,{leftIcon:(0,s.jsx)(I.dt,{}),color:"green",onClick:(0,a.Z)(l().mark((function _callee(){return l().wrap((function _callee$(e){while(1)switch(e.prev=e.next){case 0:e.next=2;return ee();case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),_callee)}))),children:"Add Row"}),(0,s.jsx)(f.z,{disabled:!$||0===$.size,leftIcon:(0,s.jsx)(I.pJ,{}),color:"red",sx:{marginRight:"auto"},onClick:re,children:"Remove Row(s)"}),(0,s.jsx)(f.z,{disabled:!B,leftIcon:(0,s.jsx)(I.FB,{}),color:"yellow",onClick:function(){H(!Z)},children:"Cancel Changes"}),(0,s.jsx)(f.z,{disabled:!B,leftIcon:(0,s.jsx)(I.N,{}),color:"blue",onClick:(0,a.Z)(l().mark((function _callee(){return l().wrap((function _callee$(e){while(1)switch(e.prev=e.next){case 0:e.next=2;return te();case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),_callee)}))),children:"Save Changes"})]}),!K?"":(0,s.jsx)(c.X,{withBorder:true,mt:"xl",sx:function(e){return{backgroundColor:e.fn.darken(e.colors.red[9],.5)}},children:(0,s.jsx)(T.V,{color:"red",cite:(0,s.jsx)(i.x,{weight:"bolder",sx:{color:"white"},children:K.name}),icon:(0,s.jsx)(w.pKf,{size:32}),children:(0,s.jsx)(b.E,{color:"red",children:K.message})})})]})}var D=t(5266);var DataPage=function(){var e=(0,E.useState)([]),r=e[0],t=e[1];var n=(0,E.useState)(void 0),h=n[0],p=n[1];var x=(0,E.useState)(false),N=x[0],_=x[1];var m=(0,v.wl)();(0,E.useEffect)((function(){if(!m)return;t(m.entityMetadatas.filter((function(e){return e.synchronize})));p(m.entityMetadatas[0])}),[m]);var C;return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(o.Ph,{data:r.map((function(e){return e.name})),value:null!==(C=null===h||void 0===h?void 0:h.name)&&void 0!==C?C:"Loading...",onChange:function(e){p(r.find((function(r){return r.name===e})))},sx:{maxWidth:"15em"},disabled:N}),(0,s.jsx)(c.X,{sx:{overflowX:"clip",maxWidth:"100%"},children:!h||!m?(0,s.jsx)(i.x,{children:"Loading..."}):(0,s.jsxs)(u.x,{pt:"lg",children:[(0,s.jsx)(d.D,{order:6,children:h.name}),(0,s.jsx)(SqlTable,{entityMetadata:h,dataSource:m,changesPendingCallback:_})]})}),(0,s.jsx)(f.z,{mt:"xl",leftIcon:(0,s.jsx)(I.aN,{}),color:"red",rightIcon:(0,s.jsx)(I.aN,{}),onClick:function(){return(0,D._5)({title:(0,s.jsx)(d.D,{order:1,children:"RESET DATABASE!?"}),centered:true,size:"lg",children:(0,s.jsxs)(i.x,{children:['This will wipe ALL data and reset the database to "factory default".',(0,s.jsx)("br",{}),"If you're not actively developing this web app, you probably will never need to press this."]}),labels:{cancel:"On second thought, NO.",confirm:"I'm sure"},onConfirm:(0,a.Z)(l().mark((function _callee(){return l().wrap((function _callee$(e){while(1)switch(e.prev=e.next){case 0:if(m){e.next=2;break}return e.abrupt("return");case 2:e.next=4;return m.dropDatabase();case 4:e.next=6;return m.synchronize();case 6:e.next=8;return m.runMigrations();case 8:case"end":return e.stop()}}),_callee)})))})},children:"RESET DATABASE"})]})};var G=DataPage}},function(e){var __webpack_exec__=function(r){return e(e.s=r)};e.O(0,[228,705,990,774,888,179],(function(){return __webpack_exec__(1440)}));var r=e.O();_N_E=r}]);