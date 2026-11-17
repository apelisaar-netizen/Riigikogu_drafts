# Tähendusotsing

Vaikimisi võrdleb veebileht küsimust dokumentide 333 kattuva tekstilõiguga. Kasutatakse mitmekeelset mudelit `Xenova/multilingual-e5-small` (q8, revision `761b726dd34fb83930e26aab4e9ac3899aa1fa78`), normaliseeritud 384-mõõtmelisi vektoreid ja koosinussarnasust. Dokumenti näidatakse selle kõige sarnasema lõigu põhjal. Kuvatakse kuni 12 tugevamat vastet; lävend on parima vaste sarnasus miinus 0,035, kuid vähemalt 0,75. Sarnasus ei ole õigusliku järelduse õigsuse ega dokumendi asjakohasuse tõenäosus.

Veeb: https://riigikogu-arvamuste-otsing.vivaciousacorn1.chatgpt.site

Näiteks sobivad küsimused „Kas vabatahtlikele jääb liiga suur koormus?“ ja „Kas karistused võivad väikese talu pankrotti viia?“. Sama sõnastuse esinemine dokumendis pole nõutav. Sõnaotsing on eraldi valik; mudeli tõrke korral ei asendata tähendusotsingut märkamatult sõnaotsinguga.

Dokumendivektorid on ette arvutatud. Brauser laadib esimese päringu ajal Hugging Face'ist ligikaudu 120 MB mudeli ja lisaks tokenisaatori ning salvestab need võimalusel vahemällu. Küsimuse vektor arvutatakse brauseri Web Worker'is; päringut ei saadeta tehisaruteenusele. Nõutav on WebAssembly toega ajakohane brauser ja esmakordseks mudelilaadimiseks võrguühendus. Dokumentide allalaadimine GitHubist ja mudelifailide allalaadimine Hugging Face'ist on endiselt võrgupäringud.

`semantic-index.json` seob lõigud dokumentide ja nende tekstiräsidega. `embeddings.json` sisaldab Float32 vektoreid base64-kodeeringus. Muutunud või uue tekstiga dokumenti ei otsita vana vektori alusel; kasutajale näidatakse indeksi uuendamise vajadust. Indeks tuleb teksti muutmisel uuesti arvutada sama mudeli, revisjoni ja seadistusega. Pythonis kasutatav `search.py` jääb sõnaotsinguks.

## Veebi käivitamine GitHubi lähtekoodist

Kaustas `web` käivita `npm install --ignore-scripts` ja `node copy-vendor.mjs`, seejärel repositooriumi juures `python -m http.server 8000`. Ava `http://localhost:8000/web/`. `--ignore-scripts` väldib serveripoolse ONNX-runtimi tarbetut paigaldusprogrammi; brauser kasutab paketis olevaid WebAssembly-faile.

Kontrollitud on viis eestikeelset sisulist päringut ning brauseris mudeli laadimine, kahe küsimuse tulemused ja esitajafilter. Tegemist on otsinguga algtekstides, mitte automaatselt koostatud õigusliku vastusega.

## Tasuta kokkuvõttev vastus

Otsingu ette kuvatakse nüüd tähenduse järgi valitud teemakokkuvõte. Kaetud on 15 teemat, mille 40 kokkuvõttelõigul on viited algdokumentidele. `topic-summaries.json` sisaldab ette koostatud kokkuvõtteid ja `topic-vectors.json` sama E5 mudeliga arvutatud teemavektoreid. Uut suurt generatiivset mudelit ei käivitata: päringule leitakse kõige sarnasem teemakokkuvõte ja selle lõigud filtreeritakse valitud esitaja, teema ja dokumendiliigi järgi. Tasulist API-t, API-võtit ega täiendavat pluginat ei kasutata.

Teemakokkuvõtted ei kata kõiki võimalikke küsimusi. Kui lähima teema sarnasus on alla 0,80 või filtritele ei vasta ükski kokkuvõttelõik, näidatakse seda otse ning algtekstide otsing jääb kasutatavaks. Allikateksti muutmisel eemaldab tekstiräsi kontroll vana kokkuvõtte vastavad lõigud koos vana vektorindeksi tulemustega. Kokkuvõtteid tuleb uute allikate või muudatuste korral sisuliselt uuendada; neid ei genereerita automaatselt.

Kontrollitud on kaheksa eri teemaga eestikeelse päringu teemavalik, kõigi 40 lõigu allikaviidete olemasolu ning esitaja- ja puuduvate vastete käsitlemine.
