import{j as x}from"./vendor-react-Df4CD_Gv.js";import{D as _}from"./download-rFhi6YOd.js";import{F as U}from"./file-spreadsheet-BIHW5ep4.js";import{F as z}from"./users-i7y8KTiR.js";import{S as M}from"./sheet-BlayAiwC.js";import{M as G,e as k,B as V}from"./ui-BzygkM-D.js";import{z as X,s as q}from"./vendor-pdf-BorpXIXO.js";import{u as E}from"./main-CcKOnOqP.js";const h=e=>String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,""),y=e=>{let r=e+1,o="";for(;r>0;){const t=(r-1)%26;o=String.fromCharCode(65+t)+o,r=Math.floor((r-1)/26)}return o},Y=e=>(e.getTime()-Date.UTC(1899,11,30)-e.getTimezoneOffset()*6e4)/864e5,A=e=>{if(!e)return null;if(e instanceof Date)return isNaN(e.getTime())?null:e;if(typeof(e==null?void 0:e.toDate)=="function")return e.toDate();if(typeof e=="object"&&typeof e.seconds=="number")return new Date(e.seconds*1e3);const r=new Date(String(e).length===10?`${e}T00:00:00`:e);return isNaN(r.getTime())?null:r},H={text:4,number:5,money:6,date:7,datetime:8,percent:9},W=6,Z=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="4">
<numFmt numFmtId="164" formatCode="&quot;₹&quot;#,##0.00;[Red]-&quot;₹&quot;#,##0.00"/>
<numFmt numFmtId="165" formatCode="dd mmm yyyy"/>
<numFmt numFmtId="166" formatCode="dd mmm yyyy, hh:mm"/>
<numFmt numFmtId="167" formatCode="#,##0"/>
</numFmts>
<fonts count="6">
<font><sz val="11"/><color rgb="FF1F2937"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="16"/><color rgb="FF111827"/><name val="Calibri"/><family val="2"/></font>
<font><sz val="10"/><color rgb="FF6B7280"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="11"/><color rgb="FF111827"/><name val="Calibri"/><family val="2"/></font>
<font><u/><sz val="11"/><color rgb="FF0563C1"/><name val="Calibri"/><family val="2"/></font>
</fonts>
<fills count="5">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF111827"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF5F7FA"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFEEF0F3"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="3">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left/><right/><top/><bottom style="thin"><color rgb="FFE5E7EB"/></bottom><diagonal/></border>
<border><left/><right/><top style="medium"><color rgb="FF111827"/></top><bottom/><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="21">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="3" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="167" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="top"/></xf>
<xf numFmtId="166" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="top"/></xf>
<xf numFmtId="10" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="167" fontId="0" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="164" fontId="0" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="165" fontId="0" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="top"/></xf>
<xf numFmtId="166" fontId="0" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="top"/></xf>
<xf numFmtId="10" fontId="0" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="0" fontId="4" fillId="4" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
<xf numFmtId="164" fontId="4" fillId="4" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>
<xf numFmtId="167" fontId="4" fillId="4" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>
<xf numFmtId="0" fontId="5" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>
<xf numFmtId="0" fontId="5" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`,w=(e,r,o,t,n)=>{if(r==null||r==="")return`<c r="${e}" s="${t}"/>`;if(o==="link"){const l=String(r);return/^https?:\/\/[^\s"]{1,240}$/i.test(l)?`<c r="${e}" s="${t}" t="str"><f>HYPERLINK("${h(l)}","${h(n||l)}")</f><v>${h(n||l)}</v></c>`:`<c r="${e}" s="${t}" t="inlineStr"><is><t xml:space="preserve">${h(r)}</t></is></c>`}if(o==="number"||o==="money"||o==="percent"){const l=Number(r);if(Number.isFinite(l))return`<c r="${e}" s="${t}"><v>${l}</v></c>`}if(o==="date"||o==="datetime"){const l=A(r);if(l)return`<c r="${e}" s="${t}"><v>${Y(l)}</v></c>`}return`<c r="${e}" s="${t}" t="inlineStr"><is><t xml:space="preserve">${h(r)}</t></is></c>`},J=(e,r)=>e==null?0:r==="money"?String(Math.round(Number(e)||0)).length+6:r==="link"?16:r==="date"?11:r==="datetime"?18:Math.max(...String(e).split(`
`).map(o=>o.length)),B=({sheetName:e="Sheet1",title:r,subtitle:o,columns:t,rows:n,totals:l})=>{const s=n.map(m=>t.map(d=>typeof d.value=="function"?d.value(m):m[d.key])),p=(r?1:0)+(o?1:0),i=p+(p?2:1),c=y(t.length-1),$=t.map((m,d)=>m.width||Math.min(60,Math.max(m.header.length+4,...s.slice(0,500).map(g=>J(g[d],m.type)+2),8))),u=[];let a=1;if(r&&(u.push(`<row r="${a}" ht="26" customHeight="1">${w(`A${a}`,r,"text",1)}</row>`),a++),o&&(u.push(`<row r="${a}">${w(`A${a}`,o,"text",2)}</row>`),a++),p&&a++,u.push(`<row r="${a}" ht="24" customHeight="1">${t.map((m,d)=>w(`${y(d)}${a}`,m.header,"text",3)).join("")}</row>`),a++,s.forEach((m,d)=>{const g=d%2===1?W:0;u.push(`<row r="${a}">${m.map((b,f)=>w(`${y(f)}${a}`,b,t[f].type||"text",t[f].type==="link"?19+(g?1:0):H[t[f].type||"text"]+g,t[f].label)).join("")}</row>`),a++}),l&&s.length){const m=i+1,d=a-1,g=t.map((b,f)=>{const v=`${y(f)}${a}`;return f===0?w(v,"Total","text",16):l[b.key||b.header]?`<c r="${v}" s="${b.type==="money"?17:18}"><f>SUM(${y(f)}${m}:${y(f)}${d})</f></c>`:`<c r="${v}" s="16"/>`});u.push(`<row r="${a}">${g.join("")}</row>`),a++}const D=Math.max(i,i+s.length),P=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetPr><outlinePr summaryBelow="0"/></sheetPr>
<dimension ref="A1:${c}${Math.max(1,a-1)}"/>
<sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane ySplit="${i}" topLeftCell="A${i+1}" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A${i+1}" sqref="A${i+1}"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="18"/>
<cols>${$.map((m,d)=>`<col min="${d+1}" max="${d+1}" width="${m}" customWidth="1"/>`).join("")}</cols>
<sheetData>${u.join("")}</sheetData>
${s.length?`<autoFilter ref="A${i}:${c}${D}"/>`:""}
${r?`<mergeCells count="${o?2:1}"><mergeCell ref="A1:${c}1"/>${o?`<mergeCell ref="A2:${c}2"/>`:""}</mergeCells>`:""}
<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>
<pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/>
</worksheet>`,N=h(e.replace(/[\\/?*[\]:]/g," ").slice(0,31)||"Sheet1"),O={"[Content_Types].xml":`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`,"_rels/.rels":`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`,"docProps/core.xml":`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${h(r||e)}</dc:title><dc:creator>Newbi Entertainment</dc:creator>
<dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().replace(/\.\d+Z$/,"Z")}</dcterms:created>
</cp:coreProperties>`,"xl/workbook.xml":`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${N}" sheetId="1" r:id="rId1"/></sheets>
${s.length?`<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'${N}'!$A$${i}:$${c}$${D}</definedName></definedNames>`:""}
</workbook>`,"xl/_rels/workbook.xml.rels":`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,"xl/styles.xml":Z,"xl/worksheets/sheet1.xml":P};return X(Object.fromEntries(Object.entries(O).map(([m,d])=>[m,q(d)])),{level:6})},K=e=>{var l;if(!((l=e.rows)!=null&&l.length))return!1;const r=B(e),o=new Blob([r],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),t=URL.createObjectURL(o),n=document.createElement("a");return n.href=t,n.download=e.filename.endsWith(".xlsx")?e.filename:`${e.filename}.xlsx`,document.body.appendChild(n),n.click(),n.remove(),setTimeout(()=>URL.revokeObjectURL(t),4e3),!0},ge=(e,r,o)=>[`${e} ${r}${e===1?"":"s"}`,o,`exported ${new Date().toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"})}`].filter(Boolean).join(" · "),F=e=>String(e).padStart(2,"0"),Q=(e,r)=>{if(e==null)return"";if(r==="date"||r==="datetime"){const o=A(e);if(!o)return String(e);const t=`${o.getFullYear()}-${F(o.getMonth()+1)}-${F(o.getDate())}`;return r==="date"?t:`${t} ${F(o.getHours())}:${F(o.getMinutes())}`}return e},j=({columns:e,rows:r})=>{const o=t=>{let n=String(t??"");return/^[=+\-@\t\r]/.test(n)&&!/^[+-]?[\d\s().-]+$/.test(n)&&(n=`'${n}`),/[",\n\r]/.test(n)?`"${n.replace(/"/g,'""')}"`:n};return[e.map(t=>o(t.header)).join(","),...r.map(t=>e.map(n=>o(Q(typeof n.value=="function"?n.value(t):t[n.key],n.type))).join(","))].join(`\r
`)},ee=e=>{var l;if(!((l=e.rows)!=null&&l.length))return!1;const{filename:r}=e,o=new Blob(["\uFEFF"+j(e)],{type:"text/csv;charset=utf-8"}),t=URL.createObjectURL(o),n=document.createElement("a");return n.href=t,n.download=r.replace(/\.xlsx$/,"").replace(/\.csv$/,"")+".csv",document.body.appendChild(n),n.click(),n.remove(),setTimeout(()=>URL.revokeObjectURL(t),4e3),!0},xe=()=>{const e=new Date;return`${e.getFullYear()}-${F(e.getMonth()+1)}-${F(e.getDate())}`},R="860370467784-smr5osvs7vo5mjmp1ehd6qgddivkovtb.apps.googleusercontent.com",te="https://www.googleapis.com/auth/drive.file",oe="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",ne="https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",T=!!R;let S=null,I=null,C=!1;const L=()=>{var e,r;return T?(r=(e=window.google)==null?void 0:e.accounts)!=null&&r.oauth2?Promise.resolve():(S||(S=new Promise((o,t)=>{const n=document.createElement("script");n.src="https://accounts.google.com/gsi/client",n.async=!0,n.onload=()=>o(),n.onerror=()=>{S=null,t(new Error("Couldn't reach Google. Check your connection and try again."))},document.head.appendChild(n)})),S):Promise.reject(new Error("Google Sheets is not set up."))},re=()=>new Promise((e,r)=>{if(I&&I.expiresAt>Date.now()+6e4){e(I.value);return}window.google.accounts.oauth2.initTokenClient({client_id:R,scope:te,callback:t=>{if(t.error||!t.access_token){r(new Error(t.error_description||"Google didn't allow access to Drive."));return}I={value:t.access_token,expiresAt:Date.now()+Number(t.expires_in||3600)*1e3},e(I.value)},error_callback:t=>r(Object.assign(new Error((t==null?void 0:t.type)==="popup_failed_to_open"?"Allow pop-ups for this site, then try again.":"Google sign-in was closed."),{cancelled:(t==null?void 0:t.type)==="popup_closed"}))}).requestAccessToken({prompt:""})}),le=async(e,r,o)=>{var p,i,c,$,u;const t=new FormData;t.append("metadata",new Blob([JSON.stringify({name:r,mimeType:"application/vnd.google-apps.spreadsheet"})],{type:"application/json"})),t.append("file",o);const n=await fetch(ne,{method:"POST",headers:{Authorization:`Bearer ${e}`},body:t});if(n.ok)return n.json();const l=await n.json().catch(()=>({})),s=((c=(i=(p=l==null?void 0:l.error)==null?void 0:p.errors)==null?void 0:i[0])==null?void 0:c.reason)||(($=l==null?void 0:l.error)==null?void 0:$.status);throw n.status===401&&(I=null),Object.assign(new Error(s==="accessNotConfigured"||s==="SERVICE_DISABLED"?"The Google Drive API is turned off for this project.":n.status===401?"Your Google sign-in expired. Try again.":((u=l==null?void 0:l.error)==null?void 0:u.message)||"Google Drive didn't take the file."),{status:n.status})},ae=e=>String(e.filename||e.title||"Newbi export").replace(/\.(xlsx|csv)$/i,""),se=async(e,{format:r="xlsx"}={})=>{var t;const o=E.getState().addToast;if(!((t=e==null?void 0:e.rows)!=null&&t.length))return o==null||o("There's nothing to export.","info"),!1;if(C)return!1;C=!0;try{await L();const n=await re(),l=r==="csv"?new Blob([j(e)],{type:"text/csv"}):new Blob([B(e)],{type:oe}),s=await le(n,ae(e),l),p=s.webViewLink||`https://docs.google.com/spreadsheets/d/${s.id}/edit`,i=window.open(p,"_blank");return i?(i.opener=null,o==null||o("Saved in your Google Drive. Edits stay in Drive, not in Newbi.","success",{title:"Opened in Google Sheets"})):o==null||o("Saved in your Google Drive.","success",{title:"Google Sheet ready",action:{label:"Open",onClick:()=>window.open(p,"_blank","noopener")},duration:15e3}),!0}catch(n){return n!=null&&n.cancelled||o==null||o((n==null?void 0:n.message)||"Try again in a moment.","error",{title:"Couldn't open in Google Sheets"}),!1}finally{C=!1}},ye=({getSpec:e,label:r="Export",className:o,size:t,hint:n})=>{const l=s=>{const p=e();if(s==="sheets"){se(p);return}const i=p&&(s==="xlsx"?K(p):ee(p)),c=E.getState().addToast;i?c==null||c("Download started.","success"):c==null||c("There's nothing to export.","info")};return x.jsxs(G,{className:o,trigger:({toggle:s})=>x.jsxs(V,{variant:"secondary",size:t,onClick:p=>{T&&L().catch(()=>{}),s(p)},className:"h-11",children:[x.jsx(_,{size:14})," ",r]}),children:[x.jsx(k,{icon:U,onClick:()=>l("xlsx"),hint:n||"Formatted sheet with totals and filters",children:"Excel (.xlsx)"}),x.jsx(k,{icon:z,onClick:()=>l("csv"),hint:"Plain data for other tools",children:"CSV"}),T&&x.jsx(k,{icon:M,onClick:()=>l("sheets"),hint:"Saves a copy in your Drive to edit there",children:"Google Sheets"})]})};export{ye as E,K as a,ee as d,ge as e,xe as f,T as g,L as l,se as o};
