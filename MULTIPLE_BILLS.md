# Mitme eelnõu arvamused

Veebilehe ülaosas on eelnõu valik, **Lisa eelnõu** ja **Ekspordi eelnõu**.

## Lisamine

1. Vajuta „Lisa eelnõu“.
2. Kleebi Riigikogu eelnõu või selle „Arvamused“ lehe link ning vali „Impordi arvamused“.
3. Oota failide lugemise ja tähendusindeksi koostamise lõpuni. Lisatud eelnõu avaneb eraldi.

Imporditakse avalikud PDF-, DOCX-, HTML- ja tekstifailid. Pildid, allkirjakonteinerid ja avamata failiviited jäetakse välja. Skaneeritud PDF võib vajada tekstituvastust; OCR ei kuulu sellesse importi. Loetamatute failide arv ja põhjused on lisatud eelnõu juures nähtavad. Identsed tekstid jäetakse kordamata; eri failivormingutest saadud tekstid võivad vorminduserinevuste tõttu siiski eraldi jääda. Automaatset sisupiiride eraldamist tasub võrrelda algdokumendiga.

Lisatud eelnõud salvestatakse brauseri IndexedDB-sse. Need **ei lisandu automaatselt ühisesse GitHubi repositooriumi ega ilmu teistes seadmetes**. Brauseri saidiandmete kustutamine võib need eemaldada. Ekspordi oluline kogu JSON-failina; samast lisamisaknast saab faili teises brauseris importida. Indeks arvutatakse failist importimisel uuesti, mitte ei usaldata failis kaasas olevat indeksit.

Iga eelnõu dokumendid, indeks ja filtrid on eraldi. 899 SE senised teemakokkuvõtted jäävad alles. Uuel eelnõul kuvatakse nende asemel ausalt tähistatud, allikaviidetega sisulõikude koond; vabalt genereeritud vastuseid ei looda.

## Piirid

Ühes automaatimpordis kuni 80 loetavat faili, kuni 12 MB faili kohta, kuni 200 lehekülge PDF-is, kuni 350 000 märki dokumendis ning kuni 2400 indekseeritavat lõiku. Ekspordifaili import toetab kuni 100 dokumenti ja kuni 6 miljonit märki. Suurem kogu vajab eraldi ettevalmistamist.

Rakendus ei kasuta tasulist mudeli-API-t. Failide lugemine, indeks ja otsing toimuvad brauseris. Riigikogu avalike failide laadimiseks on serveril piiratud lugemisvahend `/api/source`: lubatud on ainult Riigikogu eelnõulehed ja avalikud failide allalaadimislingid. Piiratud juurdepääsuga materjali ei avata. Tõlketeegid ja mudel laaditakse versiooniga kinnitatud avalikest hoidlatest.

## Ehitamine

Sitesi versioon kasutab Workerit. Lähtekoodis on leht `dist/` all ja serveri lubatud allikalingid failis `server/source-proxy.js`. Käivita `node scripts/build-worker.mjs`: tulemuseks on `dist/server/index.js`, mis sisaldab lehe tekstilisi varasid. `.openai/hosting.json` säilitab sama `project_id`, kuid ei sisalda enam `static` välja. Juurutuse arhiivi kuuluvad `.openai/hosting.json` ja `dist/server/index.js`. Server ei vaja API-võtmeid ega kasutaja GitHubi kirjutusõigust.

## Muude menetlusallikate lisamine

Avatud eelnõu juures olev „Lisa allikaid“ võimaldab lisada seletuskirju, komisjoni istungi protokolle, eelnõu tekste, muudatusettepanekuid ja muid menetlusdokumente. Kasutaja määrab liigi, pealkirja, koostaja, kuupäeva ning Riigikogu algallika lingi. Dokument loetakse otselingilt või valitud PDF-, DOCX-, TXT- või HTML-failist. Skannitud pildifailide tekstituvastust ei ole.

Lisatud dokumendid liidetakse valitud kogu dokumentidega, säilitades varasemad tekstid ja kontrollsummad. Korduvad tekstid jäetakse vahele. Tähendusindeks koostatakse ainult uutest dokumentidest ning liidetakse varasemate vektoritega. Ka algse 899 SE kogu saab täiendada: selleks salvestatakse eraldi kohandatud kohalik või serverikogu; algne näidiskogu jääb eraldi valitavaks.

Brauseris oleva kogu täiendamine salvestab selle uue seisu samasse kohalikku kogusse. Serverisse salvestamisel luuakse täiendatud kogust uus viiepäevane kogu ja uus jagamislink. Varasem serverikogu ja selle tähtaeg säilivad. Serverikogu kopeerimisel võetakse kaasa seal olevad algfailid. Dokumendi liik kuvatakse vastetes ja kokkuvõtte allikaloendis ning seda saab kasutada filtrina. JSON-eksport ja -import säilitavad uued liigid ning algallika viited.

Indekseerimine toimub praegu mõlema salvestusvaliku puhul brauseris. Serverisse salvestamine võib võtta kauem, sest lisandub tekstide, indeksi ja algfailide üleslaadimine. See sõltub failide mahust, arvuti kiirusest ja ühendusest. Leht peab töö lõpuni avatuks jääma. Serveri ligipääs lõpeb loomise hetkest viie päeva möödudes; füüsiline kustutus töötab kord päevas kell 02.17 UTC, teenuse ajastus võib hilineda. See muudatus ei aktiveeri GitHub Actionsis indekseerimist.

## Riigikogu avaliku API liidestus

„Leia eelnõu Riigikogu API-st“ otsib numbri (nt 899 SE), pealkirja, eelnõu lingi või UUID järgi. Kasutusel on avalikud `https://api.riigikogu.ee/api/volumes/drafts` ja `/api/volumes/drafts/{uuid}` lugemispäringud. Võtit ega kontot pole vaja. Sama numbrit võib esineda eri koosseisudes, mistõttu kasutaja valib otsingutulemuste seast õige eelnõu.

Kataloog ühendab API `texts` failid, `opinions` failid, `readings[].proceedingEvents[].protocolFiles` protokollid ning `amendments` failid. Seletuskirjad on sõltumata lugemisest sama liiki. Ainult toetatud vormingu ja avaliku allalaadimisviitega faile saab valida; juurdepääsupiiranguga ja mittetoetatud kirjed kuvatakse põhjusega, kuid neid ei laadita. Protokoll võib sisaldada ka teiste samal istungil käsitletud eelnõude arutelu või lisasid; kasutaja kontrollib valikut.

API metaandmete lugemine käib piiratud samapäritolu `/api/riigikogu/drafts` vahenduse kaudu, mis ei võta vastu suvalist serveriaadressi ega kirjutuspäringuid. Failide lugemine kasutab sama mahupiirangute ja ümbersuunamise kontrolliga `/api/source` vahendust; lubatud on API avalike failide allalaadimise aadressid.

API kaudu imporditud kogu ei laadi algfaile Sitesi serverisse ega salvesta neid brauseri andmebaasi. PDF-/DOCX-/HTML-/TXT-failidest loetakse tekst, ajutine failikoopia vabaneb pärast töötlemist. Salvestatakse tekstid, allikaviited ja tähendusindeks kasutaja valitud asukohta. Serverivariandil säilib viiepäevane säilitusaeg ja kord päevas toimuv kustutuskontroll. Indekseerimine toimub endiselt brauseris. See liidestus ei aktiveeri varasemat GitHub Actionsis töötlemise kavandit.

Sama eelnõu avatud kogule lisatakse ainult uued failid ja ainult need indekseeritakse. Teise eelnõu puhul luuakse uus kogu; olemasoleva teise kohaliku kogu ülekirjutamise asemel palutakse see kõigepealt avada. Lugemata failid näidatakse enne osalise impordi salvestamist ning need säilivad ka kogu veaaruandes. API kataloog on päringu hetke seis, mitte automaatselt taustal uuenev kogu.

## API on vaikimisi lisamisviis

Põhiribal on „Lisa eelnõu“ ja „Täienda allikakogu“. Esimene avab tühja API-otsingu, teine avab API-s kohe praeguse eelnõu allikaloendi. JSON-varukoopia, käsitsi faili/otselingi lisamine ning arvamuste veebilehelt importimine paiknevad suletavas jaotises „Muud lisamisvõimalused“. Varukoopia eksport asub samas jaotises.

Igas lisamisvaates on vahetatav „Allikate lisamise viis“ koos lühikese selgitusega. API leiab seotud avalikud dokumendid automaatselt, käsitsi lisamine täiendab API-st puuduvat allikat, JSON taastab ekspordi hetke seisu ning vana arvamuste lehe import on piiratud varuvariant. Poolelioleva lugemise, indekseerimise või salvestamise ajal viisi vahetada ei saa. Brauseri/serveri salvestusvalik ning selle selgitused säilivad.
