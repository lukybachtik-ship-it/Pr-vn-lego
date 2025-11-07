# Právní LEGO - Nové funkce

## 🎯 Analýza smlouvy "Co chybí?"

Aplikace nyní automaticky analyzuje vaši smlouvu a upozorňuje na chybějící bloky.

### Jak to funguje:
1. Po sestavení smlouvy přejděte na stránku **Kontrola smlouvy**
2. Nahoře uvidíte **Analýzu smlouvy** s procentuálním skóre kompletnosti
3. Aplikace zobrazí:
   - 🔴 **Chybí povinné bloky** - nezbytné pro platnost smlouvy
   - 🟡 **Doporučené bloky** - výrazně zvyšují bezpečnost
   - ⚪ **Volitelné bloky** - mohou být užitečné

### Příklad upozornění:
> "Není definováno, jak a kdy bude dílo předáno. Doporučujeme blok 'Předání díla' přidat, abyste předešli sporům o dokončení."

### Inteligentní kontroly:
- Kontrola přiměřenosti smluvních pokut (max 10% z celkové částky)
- Varování před neúplnými bloky
- Specifická doporučení podle typu smlouvy

---

## 🔍 Pokročilá integrace s veřejnými rejstříky

Rozšířili jsme ověření IČO o komplexní kontrolu spolehlivosti protistrany.

### Co se nyní kontroluje:

#### 1. **ARES** (základní údaje)
- Název firmy
- Adresa sídla
- ✨ **NOVĚ:** Seznam jednatelů

#### 2. **Insolvenční rejstřík**
- ⚠️ Kontrola aktivních insolvencí
- Výrazné červené varování pokud nalezeno

#### 3. **Nespolehlivé plátce DPH**
- ⚠️ Kontrola zda firma není nespolehlivý plátce
- Upozornění na riziko při platbách DPH

### Jak používat:
1. V bloku **Smluvní strany** zadejte IČO
2. Klikněte na **Ověřit**
3. Během pár sekund uvidíte:
   - ✅ Zelené potvrzení: "Bez insolvencí, spolehlivý plátce DPH"
   - ⚠️ Červené varování: pokud jsou rizika

### Automatické předvyplnění:
- Název firmy se automaticky doplní
- Adresa se předvyplní
- **NOVĚ:** Seznam jednatelů pro přípravu podpisu

---

## 📅 Správa životního cyklu smlouvy

Aplikace nyní hlídá důležité termíny ve vaší smlouvě.

### Automatická detekce termínů:
- 💰 **Splatnost plateb** (z podmínek platby)
- 📦 **Termíny dodání** (z časového plánu)
- ⏰ **Konečné termíny** (deadline díla)
- 🔄 **Začátek/konec pronájmu**
- 🛡️ **Konec záruky** (automaticky vypočítáno)

### Časová osa:
Na stránce **Kontrola smlouvy** uvidíte:
- Přehlednou časovou osu všech termínů
- Barevné označení:
  - 🔴 **Po termínu** - nestihli jste
  - 🟡 **Blíží se** (do 7 dnů) - jednejte rychle
  - 🟢 **V pořádku** - máte dostatek času
  - ⚪ **Splněno** - hotovo

### Statistiky:
- Počet nesplněných termínů
- Blížící se termíny
- Splněné úkoly

### Příklad:
```
📦 Termín dodání
   15. prosince 2025
   Dodání na: Sídlo kupujícího
   🟡 Blíží se (5 dnů)
```

---

## ✅ Uzavření a správa smluv

Aplikace nyní umožňuje uzavřít (finalizovat) smlouvy a sledovat je v centrálním dashboardu.

### Jak uzavřít smlouvu:
1. Na stránce **Kontrola smlouvy** klikněte na tlačítko **Uzavřít a uložit smlouvu**
2. Zadejte název smlouvy (nebo ponechte automatický)
3. Smlouva se uloží a zobrazí se v dashboardu na hlavní stránce

### Dashboard (hlavní stránka):
- 📊 **Přehled všech uzavřených smluv**
- ⚠️ **Barevné označení urgence**:
  - 🔴 **Červená** - jsou termíny po lhůtě!
  - 🟡 **Žlutá** - termíny se blíží (do 7 dnů)
  - 🟢 **Zelená** - vše v pořádku
- 📅 **Počet termínů k hlídání** - vidíte přímo na kartě smlouvy

### Možnosti na dashboardu:
- **Zobrazit smlouvu** - otevře detail se všemi informacemi
- **Smazat** - odstraní smlouvu z přehledu
- **Koncepty** - přístup k rozpracovaným smlouvám

### Příklad:
```
📄 Smlouva o dílo - Vývoj webu
   Vytvořeno: 7. 11. 2025
   🟡 2 termíny se blíží
   [Zobrazit smlouvu] [Smazat]
```

---

## 💡 Tipy pro využití:

1. **Před podpisem**: Zkontrolujte IČO protistrany v plné analýze
2. **Po podpisu**: Uzavřete smlouvu tlačítkem "Uzavřít a uložit"
3. **V dashboardu**: Sledujte barevné označení smluv s blížícími se termíny
4. **Pravidelně**: Kontrolujte dashboard a blížící se deadline

---

## 📄 Generátor Předávacích Protokolů

Aplikace nyní umožňuje vytvořit předávací protokol pro dokončené dílo.

### Co to řeší:
Když dokončíte dílo a předáte ho zákazníkovi, potřebujete **důkaz**, že dílo bylo předáno a v jakém stavu. Pokud se zákazník za měsíc ozve s reklamací, budete vědět, jestli šlo o oprávněnou závadu, nebo zákazník něco rozbil.

### Jak to funguje:
1. V detailu **uzavřené smlouvy o dílo** najdete modrý panel "Předávací protokol"
2. Klikněte na **"Vygenerovat předávací protokol"**
3. Vyplňte:
   - **Datum předání** (předvyplněno na dnes)
   - **Stav díla**: "Bez výhrad" nebo "S výhradami"
   - **Popis výhrad** (pokud jsou závady k odstranění)
4. Protokol se automaticky vygeneruje a stáhne jako DOCX

### Co obsahuje protokol:
- Smluvní strany (z vaší smlouvy)
- Předmět díla (z vaší smlouvy)
- Datum předání
- Stav díla (s/bez výhrad)
- Popis výhrad (pokud jsou)
- Místa pro podpisy obou stran

### Výhody:
- 😌 **Pocit dotaženosti** - Profesionální přístup k uzavření zakázky
- 🛡️ **Ochrana** - Máte důkaz o stavu díla v době předání
- ⚡ **Rychlost** - 1 kliknutí, 3 vyplněná pole, hotovo
- 📁 **Historie** - Všechny protokoly uloženy u smlouvy

### Příklad použití:
```
Dokončili jste web pro zákazníka:
1. Otevřete smlouvu v dashboardu
2. Klikněte "Vygenerovat předávací protokol"
3. Zadáte datum, zaškrtnete "Bez výhrad"
4. Protokol se stáhne, vytisknete, zákazník podepíše
5. Máte důkaz, že web byl v pořádku při předání
```

---

## 💸 Palubní Deska Peněz (Mini Cash-Flow)

Sledujte své příjmy a výdaje na jednom přehledném místě.

### Co to řeší:
Nejenže musíte hlídat, kdy vám klient zaplatí, ale také kdy **vy** musíte zaplatit subdodavatelům nebo za materiál. Bez přehledu nevíte, kolik peněz vám skutečně zůstane.

### Jak to funguje:
1. Klikněte na tlačítko **"Peníze"** na hlavní stránce
2. Přidávejte faktury jednoduše:
   - **Příjmy** - faktury, které jste vystavili (co vám má přijít)
   - **Výdaje** - faktury, které jste obdrželi (co musíte zaplatit)
3. U každé faktury zadáte:
   - **Od koho / Komu** (jméno)
   - **Kolik** (částka)
   - **Kdy je splatnost** (datum)
   - **Popis** (volitelně)

### Co vidíte na dashboardu:
- 💰 **Celkové příjmy** (nezaplacené) - zelená karta
- 💳 **Celkové výdaje** (nezaplacené) - červená karta
- 💵 **Očekávaný zůstatek** - kolik vám zůstane po zaplacení všeho
- 📅 **Tento měsíc** - přehled aktuálního měsíce
- 📋 **Seznam nezaplacených faktur** - seřazené podle splatnosti

### Inteligentní upozornění:
- 🔴 **Po splatnosti** - faktura měla být zaplacena, urgujte!
- ⏰ **Čeká** - faktura ještě není po splatnosti
- ✅ **Zaplaceno** - označené jako zaplacené

### Jak označit fakturu jako zaplacenou:
- Klikněte na tlačítko **"Zaplaceno"** u dané faktury
- Faktura se přesune do historie a nebude se počítat do cash-flow

### Výhody:
- 👨‍✈️ **Pocit kontroly** - Poprvé vidíte své peníze přehledně
- 📊 **Předvídatelnost** - Víte dopředu, jak budete na tom za měsíc
- ⚠️ **Varování** - Uvidíte, když vám nezbyde dost peněz
- 🎯 **Jednoduchost** - Jen 3 pole, žádná složitá účetní terminologie

### Příklad použití:
```
Máte 3 zakázky:
1. Klient A mi dluží 50 000 Kč (splatnost 15.12.)
2. Klient B mi dluží 30 000 Kč (splatnost 20.12.)
3. Musím zaplatit subdodavateli 15 000 Kč (splatnost 18.12.)

Dashboard vám ukáže:
→ Příjmy: 80 000 Kč
→ Výdaje: 15 000 Kč
→ Očekávaný zůstatek: +65 000 Kč ✅

Vidíte, že máte dobrou rezervu!
```

---

## 🚀 Budoucí funkce v plánu:

- 📧 Email notifikace před termíny
- ✍️ Integrace s BankID Sign pro elektronický podpis
- 📱 Mobilní aplikace pro hlídání termínů
- 🤖 AI asistent pro generování smluvních klauzulí
- 📈 Grafy a statistiky cash-flow

---

**Vytvořeno s ❤️ pro snadnější právní život**
