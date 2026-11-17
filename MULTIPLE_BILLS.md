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

## Serveri taustal indekseerimine

Serverisse salvestamisel saadetakse esmalt puhastatud tekstid ja algfailid Sitesi R2-sse. Brauser ei loo selle valiku puhul enam tähendusindeksit. Üleslaadimise lõpus pannakse kogu püsivasse järjekorda ja kuvatakse kohe jagamislink. Pärast seda võib lehe või arvuti sulgeda. Ainult brauseris säilitamise puhul koostatakse indeks endiselt kohapeal.

`.github/workflows/index-collections.yml` kontrollib järjekorda GitHub Actionsis iga viie minuti järel. GitHubi ajastus võib hilineda; viieminutiline intervall ei taga viie minuti jooksul alustamist. Indekseerimine kasutab tasuta avalikku multilingual-e5-small q8 mudelit, mitte tasulist tehisaru API-t. Dokumente töödeldakse ajutiselt GitHubi serveritööruumis; neid ei lisata hoidlasse, vahemällu ega töölogidesse. Vahemällu pannakse ainult avalikud mudelifailid ja npm-i sõltuvused.

Töö võtmine nõuab GitHubi allkirjastatud OIDC-identiteeti just selle hoidla main-haru indekseerimisvoost. Eraldi API-võtit ega hoidlasalajast pole vaja. Töö saab ajutise eraldi õigustunnuse; külaline ei saa töid loetleda ega indekseid muuta. Katkenud töö võetakse 30-minutilise tööloa lõppemisel uuesti ette, kokku kuni kolm katset. Edenemine salvestatakse serverisse; avatud ooteleht kontrollib valmimist 15 sekundi järel.

Säilitusaeg jääb loomise hetkest viieks päevaks ega pikene indekseerimise või avamisega. Aegunud kogu ei saa lugeda ega indekseerimistulemust salvestada. `.github/workflows/delete-expired-collections.yml` kustutab aegunud failid kord päevas kell 02.17 UTC, sõltumata avatud brauseritest.
