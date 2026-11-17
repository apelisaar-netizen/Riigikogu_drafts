# Riigikogu eelnõude allikakogu

Avalikud arvamused ja muud menetlusdokumendid koos täistekstiotsinguga. Esimene kogu puudutab loomakaitseseaduse ja veterinaarseaduse muutmise eelnõu **899 SE**.

## Otsing

Vajalik on Python 3 koos SQLite FTS5 toega. Lisapakette, kontot ega võrgupäringuid otsinguks ei vajata.

```bash
python search.py "veterinaararst hoiukod"
python search.py "liivakast" --submitter "Tammiste"
python search.py --topic "karistused" --limit 30
python search.py "ketis" --json
```

Otsing leiab kõik sisestatud sõnad ka sõna alguse järgi; see ei tee eesti keele lemmatiseerimist ega semantilist otsingut. Tulemus sisaldab tekstikatkendit ja algdokumendi linki. Kõikide teemaga seotud dokumentide leidmiseks kasuta ka teemasildi filtrit. Andmebaas luuakse käivitamisel mälus JSONL-allikatest.

## Andmed

- `data/899-SE.jsonl`: 26 dokumendi automaatselt eraldatud tekst, esitaja, arvamuste lehe kuupäev, dokumendi liik, automaatsed teemasildid ja Riigikogu allikaviide.
- `data/899-SE-manifest.json`: arvamuste lehel leitud failide loend ja märge nende indekseerimise kohta.
- [Riigikogu arvamuste leht](https://www.riigikogu.ee/tegevus/eelnoud/0c991fe4-2393-4ca6-a71d-38bb508f686f/loomakaitseseaduse-ja-veterinaarseaduse-muutmise-seadus/arvamused/).

Kogu koostati 17.11.2026. `listed_date` on Riigikogu arvamuste lehe kuupäev, mis võib erineda kirja kuupäevast. Sama esitaja eri ajal esitatud kirjad säilitatakse eraldi. Algne ja täiendatud Maaülikooli ettepanek on mõlemad säilitatud. Kaasas on ka valitud täiendavad pöördumised, ministeeriumi muudatusettepanekud ja komisjoni vastus. Korduvaid kaaskirju ja allkirjakonteinereid ei ole tervikuna indekseeritud. Teemasildid põhinevad märksõnadel, mitte käsitsi kinnitatud õiguslikul liigitusel.

Kolme eraisiku arvamuse failid polnud avalikust loendist avatavad: M. K. 14.10.2026, H. K. 16.10.2026 ja A.-L. S. 09.10.2026. M. K. 21.10.2026 avalik PDF on kogus olemas. Pildimanused ja veterinaarse haigusloo lisa ei ole indekseeritud. Puuduvad tekstid ei ole asendatud oletuste või kokkuvõtetega.

Teksti eraldamine PDF-, DOCX- ja HTML-failidest võib kaotada tabelipaigutuse, leheküljeviited või muu vorminduse. Kontrolli täpset tsitaati ja tabelandmeid algdokumendist. Algdokumendi lingi säilitamine ei tähenda, et originaalfail ise oleks siin arhiveeritud. Kogu ei uuene automaatselt.

## Digikaksikus kasutamine

JSONL-kirjed sobivad teadmisteallikasse importimiseks. Iga kirje kannab tunnuseid `provenance: third_party_source` ja `user_authored: false`. **Need on teiste isikute ja asutuste seisukohad, mitte kasutaja enda arvamused ega tema kirjutamisstiili näidised.** Dokumentide väiteid, arvandmeid ja õiguslikke tõlgendusi tuleb omistada nende esitajale. Arvamus ei tõenda ettepaneku vastuvõtmist ega kehtivat õigust.

See repositoorium ja otsinguskript ei ühenda automaatselt ühtegi eraldi digikaksikurakendust. Selliseks ühenduseks peab rakendus repositooriumi lugema või JSONL-faili importima.
