import assert from 'node:assert/strict';
import {attachContent,projectContent,contentSnippet,focusedExcerpt,bodyRanges} from '../web/content-view.js';
const text=`From: sekretar@example.ee
Teema: arvamus
Riigikogu komisjon
Teie 12.11.2026 nr 1-2
Lugupeetud komisjoni esimees
Täname võimaluse eest arvamust avaldada.
Toetame eelnõu eesmärki.
1. Järelevalve korraldamisel tuleb tagada sõltumatu kontroll. Järelevalve kulud peab katma riik, sest omavalitsustel puuduvad selleks vahendid.
2. Eelnõu jõustumiseks on vaja vähemalt kuuekuulist üleminekuaega.
Lugupidamisega
Mari Näidis
Kirja koostaja: sekretär
Telefon: +372 5555555
sekretar@example.ee`;
const d=attachContent({text},null,'hash');
assert(d.contentText.includes('Toetame eelnõu eesmärki.'));assert(d.contentText.includes('üleminekuaega'));
for(const unwanted of ['From:','Teema:','Täname','Lugupeetud','Lugupidamisega','Mari Näidis','Telefon','example.ee'])assert(!d.contentText.includes(unwanted),unwanted);
const start=text.indexOf('1. Järelevalve'),end=text.indexOf('Lugupidamisega')+30;
const snippet=contentSnippet(d,{start,end,text:text.slice(start,end)},'järelevalve kulud',focusedExcerpt);
assert(snippet.includes('kulud peab katma riik'));assert(!snippet.includes('Lugupidamisega'));
// Existing collections are filtered from original offsets, even if an old chunk starts in a signature.
assert.equal(projectContent(d,text.indexOf('Lugupidamisega')), '');
const mixed=attachContent({text:'Täname võimaluse eest. Toetame keeldu, sest see kaitseb loomi.\nKoostaja: Mari\n'},null,'hash');
assert(mixed.contentText.includes('Toetame keeldu'));
const noGreeting=attachContent({text:'Saatja: nimi@example.ee\nEsitame oma arvamuse eelnõu kohta.\n§ 2 tuleb muuta, et tagada õiguskindlus.\nHeade soovidega\nNimi'},null,'hash');
assert.equal(noGreeting.contentText,'§ 2 tuleb muuta, et tagada õiguskindlus.');
// Hand-checked original bill ranges remain authoritative.
const curated=attachContent({text}, {text_sha256:'same',ranges:[[start,text.indexOf('2. Eelnõu')]]},'same');
assert.deepEqual(curated.contentRanges,[[start,text.indexOf('2. Eelnõu')]]);
for(const [a,b]of bodyRanges(text))assert(a>=0&&b>a&&b<=text.length);
const focus=focusedExcerpt('Sissejuhatav üldine lause. Kulud peab katma riik. Muu teema.','kes katab kulud');
assert(focus.startsWith('… Kulud'));
console.log('PASS: uue ja olemasoleva kogu päised, sissejuhatus, allkiri, kontaktid, sisulise väite säilimine, algteksti nihked ja küsimusele vastav katkend.');
