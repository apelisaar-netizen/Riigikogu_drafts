# Arvamuste veebiotsing

Aadress: https://riigikogu-arvamuste-otsing.vivaciousacorn1.chatgpt.site

Sitesi leht on avaldatud omaniku privaatse ligipääsuga. Andmekogu ise on avalik.

Otsing kasutab selle repositooriumi faili `data/899-SE.jsonl`. Otsida saab teksti, esitaja, teema ja dokumendiliigi järgi. Tulemused näitavad tekstikatkendeid, täisteksti ja Riigikogu algdokumendi linki. Kõik päringu sõnad peavad leiduma; sõnatüve otsing ei ole lemmatiseerimine ega semantiline otsing. Otsinguparameetrid säilivad URL-is.

Veebi lähtekood asub kaustas `web/`; GitHubi tõrke korral kasutatakse `web/data.json` salvestatud koopiat. See koopia ei uuene automaatselt. Leht ei käivita originaaldokumentide uuesti kogumist ega ühenda eraldi digikaksikurakendust.

Kohalikuks kasutamiseks käivita repositooriumi juures `python -m http.server 8000` ja ava `http://localhost:8000/web/`.
