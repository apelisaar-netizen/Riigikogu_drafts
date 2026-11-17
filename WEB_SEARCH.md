# Arvamuste veebiotsing

Aadress: https://riigikogu-arvamuste-otsing.vivaciousacorn1.chatgpt.site

Vaikimisi on kasutusel tähendusotsing: kirjelda küsimust oma sõnadega. Küsimuse ja dokumentide 333 tekstilõigu sisu võrreldakse mitmekeelse keelemudeli abil. Sõnaotsing on eraldi valik. Esitaja-, teema- ja dokumendiliigi filtrid ning täisteksti ja algdokumendi avamine on alles. Otsinguparameetrid säilivad URL-is.

Esimesel päringul laadib brauser ligikaudu 120 MB mudeli ning tokenisaatori. Küsimust töödeldakse brauseris ja seda ei saadeta tehisaruteenusele. Mudeli tõrke korral kuvatakse veateade; tähendusotsingut ei asendata automaatselt sõnaotsinguga.

Veebi lähtekood asub kaustas `web/`. GitHubist loetakse `data/899-SE.jsonl`; võrguvea korral kasutatakse salvestatud koopiat. Tähendusindeksisse kuuluvad 26 dokumendi tekstid. Uute või muudetud tekstide jaoks tuleb indeks uuesti arvutada. Originaaldokumentide uuesti kogumine ei ole automaatne.

Kohalik käivitamine, mudeli kirjeldus ja indeksi uuendamine: [SEMANTIC_SEARCH.md](SEMANTIC_SEARCH.md).
