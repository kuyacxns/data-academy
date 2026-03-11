// ════════════════════════════════════════════════════════════════════════════
// DATA ACADEMY – MODULES (Codecademy-Format)
// Alle 23 Lektionen mit steps[], sasStarter, pysparkStarter, expectedOutput
// ════════════════════════════════════════════════════════════════════════════

const MODULES = [

// ════════════════════════════════════════════════════════════════════════════
// M1 – GRUNDLAGEN & SETUP
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m1",
  title: "Grundlagen & Setup",
  icon: "🏗️",
  lessons: [
    {
      id: "l1_1",
      title: "Was ist SAS & PySpark?",
      theory: `
## Was ist SAS Studio?
**SAS (Statistical Analysis System)** ist eine kommerzielle Analyseplattform, die seit den 1970er Jahren in Unternehmen, Banken und Behörden eingesetzt wird. SAS Studio ist die browserbasierte IDE dafür.

SAS arbeitet mit sogenannten **DATA Steps** und **PROCs** (Procedures):
- \`DATA Step\`: Liest, transformiert und schreibt Daten
- \`PROC\` (Procedure): Vorgefertigte Analysebausteine (z.B. PROC SORT, PROC SQL, PROC MEANS)

---

## Was ist PySpark?
**Apache Spark** ist ein verteiltes Rechensystem für Big Data. **PySpark** ist die Python-API dafür. Anders als SAS läuft PySpark auf Clustern und kann Terabytes von Daten verarbeiten.

Kernkonzept: **DataFrame** – eine verteilte Tabelle, ähnlich wie in Pandas, aber für Big Data.

---

## Philosophie-Vergleich

| Aspekt | SAS Studio | PySpark |
|--------|-----------|---------| 
| Sprache | Proprietäres SAS | Python |
| Daten | Lokal / SAS-Server | Verteilt (Cluster) |
| Syntax | Prozedural | Funktional/OOP |
| Kosten | Lizenzpflichtig | Open Source |
| Stärke | Statistik, Regulated Industries | Big Data, ML |

---

## Der erste Code – Daten einlesen

### SAS:
\`\`\`sas
DATA kunden;
  INPUT name $ alter stadt $;
  DATALINES;
  Mueller 35 Berlin
  Schmidt 28 Hamburg
  Fischer 42 Muenchen
  ;
RUN;

PROC PRINT DATA=kunden;
RUN;
\`\`\`

### PySpark:
\`\`\`python
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, IntegerType

spark = SparkSession.builder.appName("Kundendaten").getOrCreate()

daten = [("Mueller", 35, "Berlin"), ("Schmidt", 28, "Hamburg"), ("Fischer", 42, "Muenchen")]
schema = StructType([
    StructField("name", StringType(), True),
    StructField("alter", IntegerType(), True),
    StructField("stadt", StringType(), True)
])

kunden = spark.createDataFrame(daten, schema)
kunden.show()
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "Datensatz definieren",
            instruction: "Erstelle einen DATA Step namens `mitarbeiter` mit den Feldern name, abteilung und gehalt. Nutze DATALINES für 3 Mitarbeiter: Schmidt/IT/4500, Weber/HR/3800, Fischer/Finance/5200.",
            hint: "In SAS brauchst du INPUT name $ abteilung $ gehalt; – das $ kennzeichnet Textvariablen."
          },
          {
            title: "Daten ausgeben",
            instruction: "Füge nach dem DATA Step ein PROC PRINT hinzu, um die Daten anzuzeigen. Denke an RUN; am Ende jedes Schritts.",
            hint: "PROC PRINT DATA=mitarbeiter; gefolgt von RUN; gibt den Datensatz aus."
          },
          {
            title: "PySpark: DataFrame erstellen",
            instruction: "Erstelle in PySpark denselben Datensatz als Liste von Tupeln und definiere ein Schema mit StructType. Gib die Daten mit .show() aus.",
            hint: "StructField('gehalt', IntegerType(), True) für numerische Felder – kein $ wie in SAS."
          }
        ],
        sasStarter: `DATA ____;
  INPUT ____ $ ____ $ ____;
  DATALINES;
  Schmidt IT 4500
  Weber HR 3800
  Fischer Finance 5200
  ;
RUN;

PROC ____ DATA=mitarbeiter;
RUN;`,
        pysparkStarter: `from pyspark.sql import SparkSession
from pyspark.sql.types import ____

spark = SparkSession.builder.appName("Mitarbeiter").getOrCreate()

daten = [
    ("Schmidt", "IT", ____),
    ("Weber", "HR", 3800),
    ("Fischer", "Finance", 5200)
]

schema = StructType([
    StructField("name",       StringType(), True),
    StructField("____",  StringType(), True),
    StructField("gehalt",     ____,    True)
])

mitarbeiter = spark.createDataFrame(daten, ____)
mitarbeiter.____(  )`,
        sasSolution: `DATA mitarbeiter;
  INPUT name $ abteilung $ gehalt;
  DATALINES;
  Schmidt IT 4500
  Weber HR 3800
  Fischer Finance 5200
  ;
RUN;

PROC PRINT DATA=mitarbeiter;
RUN;`,
        pysparkSolution: `from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, IntegerType

spark = SparkSession.builder.appName("Mitarbeiter").getOrCreate()

daten = [
    ("Schmidt", "IT", 4500),
    ("Weber", "HR", 3800),
    ("Fischer", "Finance", 5200)
]

schema = StructType([
    StructField("name",      StringType(),  True),
    StructField("abteilung", StringType(),  True),
    StructField("gehalt",    IntegerType(), True)
])

mitarbeiter = spark.createDataFrame(daten, schema)
mitarbeiter.show()`,
        expectedOutput: `+--------+---------+------+
|name    |abteilung|gehalt|
+--------+---------+------+
|Schmidt |IT       |4500  |
|Weber   |HR       |3800  |
|Fischer |Finance  |5200  |
+--------+---------+------+`,
        hints: [
          "In SAS nutzt du DATALINES für inline-Daten",
          "In PySpark nutzt du createDataFrame() mit einer Liste von Tupeln",
          "Vergiss das Schema-Definition in PySpark nicht"
        ]
      }
    },

    {
      id: "l1_2",
      title: "Variablen & Datentypen",
      theory: `
## Datentypen im Vergleich

### SAS Datentypen
SAS kennt nur **zwei** Grundtypen:
- **Character** (\`$\`) – Text bis 32.767 Zeichen
- **Numeric** – Zahlen (immer 8-Byte Float)

\`\`\`sas
DATA typen_beispiel;
  name   = "Klaus-Dieter Mueller";
  plz    = "80333";       /* PLZ als String! */
  alter  = 42;
  gehalt = 3850.75;
  gebdat = '15JAN1982'D;
  FORMAT gebdat DATE9.;
RUN;
\`\`\`

### PySpark Datentypen
PySpark hat ein **reichhaltiges Typsystem**:

\`\`\`python
from pyspark.sql.types import *

schema = StructType([
    StructField("name",    StringType(),   True),
    StructField("plz",     StringType(),   True),
    StructField("alter",   IntegerType(),  True),
    StructField("gehalt",  DoubleType(),   True),
    StructField("gebdat",  DateType(),     True),
    StructField("aktiv",   BooleanType(),  True),
])
\`\`\`

---

## Neue Spalten berechnen

### SAS:
\`\`\`sas
DATA berechnet;
  SET mitarbeiter;
  jahresgehalt = gehalt * 12;
  name_upper   = UPCASE(name);
  name_laenge  = LENGTH(STRIP(name));
RUN;
\`\`\`

### PySpark:
\`\`\`python
from pyspark.sql import functions as F

df_berechnet = mitarbeiter
    .withColumn("jahresgehalt", F.col("gehalt") * 12)
    .withColumn("name_upper",   F.upper(F.col("name")))
    .withColumn("name_laenge",  F.length(F.trim(F.col("name"))))
\`\`\`

**Muster:** In PySpark verwendest du fast immer \`F.col("spaltenname")\` um auf Spalten zu verweisen, und \`withColumn()\` um neue anzulegen.
`,
      exercise: {
        steps: [
          {
            title: "Jahresgehalt berechnen",
            instruction: "Erstelle aus dem bestehenden Mitarbeiter-Datensatz eine neue Variable `jahresgehalt` = gehalt × 12. In SAS mit einem DATA Step (SET), in PySpark mit withColumn().",
            hint: "SAS: jahresgehalt = gehalt * 12; / PySpark: F.col('gehalt') * 12"
          },
          {
            title: "Name in Großbuchstaben",
            instruction: "Füge eine Spalte `name_gross` hinzu, die den Namen in Großbuchstaben enthält. SAS: UPCASE(), PySpark: F.upper().",
            hint: "SAS: name_gross = UPCASE(name); / PySpark: F.upper(F.col('name'))"
          },
          {
            title: "Namenslänge ermitteln",
            instruction: "Berechne die Länge des getrimmten Namens als `name_laenge`. In SAS: LENGTH(STRIP(name)), in PySpark: F.length(F.trim(...)). Gib alle neuen Spalten aus.",
            hint: "STRIP() in SAS = F.trim() in PySpark – beide entfernen führende/nachgestellte Leerzeichen."
          }
        ],
        sasStarter: `DATA mitarbeiter_erweitert;
  SET mitarbeiter;
  jahresgehalt = ____ * 12;
  name_gross   = ____(name);
  name_laenge  = LENGTH(____(name));
RUN;

PROC PRINT DATA=mitarbeiter_erweitert;
  VAR name abteilung gehalt jahresgehalt name_gross name_laenge;
RUN;`,
        pysparkStarter: `from pyspark.sql import functions as F

df_erweitert = mitarbeiter \\
    .withColumn("jahresgehalt", F.col("____") * ____) \\
    .withColumn("name_gross",   F.____(F.col("name"))) \\
    .withColumn("name_laenge",  F.length(F.____(F.col("name"))))

df_erweitert.show()`,
        sasSolution: `DATA mitarbeiter_erweitert;
  SET mitarbeiter;
  jahresgehalt = gehalt * 12;
  name_gross   = UPCASE(name);
  name_laenge  = LENGTH(STRIP(name));
RUN;

PROC PRINT DATA=mitarbeiter_erweitert;
  VAR name abteilung gehalt jahresgehalt name_gross name_laenge;
RUN;`,
        pysparkSolution: `from pyspark.sql import functions as F

df_erweitert = mitarbeiter \\
    .withColumn("jahresgehalt", F.col("gehalt") * 12) \\
    .withColumn("name_gross",   F.upper(F.col("name"))) \\
    .withColumn("name_laenge",  F.length(F.trim(F.col("name"))))

df_erweitert.show()`,
        expectedOutput: `+--------+---------+------+------------+----------+-----------+
|name    |abteilung|gehalt|jahresgehalt|name_gross|name_laenge|
+--------+---------+------+------------+----------+-----------+
|Schmidt |IT       |4500  |54000       |SCHMIDT   |7          |
|Weber   |HR       |3800  |45600       |WEBER     |5          |
|Fischer |Finance  |5200  |62400       |FISCHER   |7          |
+--------+---------+------+------------+----------+-----------+`,
        hints: [
          "SAS: UPCASE() und LENGTH(STRIP())",
          "PySpark: F.upper(), F.length(), F.trim()",
          "withColumn() fügt Spalten hinzu oder überschreibt sie"
        ]
      }
    }
  ]
},

// ════════════════════════════════════════════════════════════════════════════
// M2 – FILTERN & SORTIEREN
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m2",
  title: "Filtern & Sortieren",
  icon: "🔍",
  lessons: [
    {
      id: "l2_1",
      title: "WHERE & Bedingungen",
      theory: `
## Daten filtern

### SAS WHERE-Bedingungen:
\`\`\`sas
/* Einfache Bedingung */
DATA junge_mitarbeiter;
  SET mitarbeiter;
  WHERE alter < 35;
RUN;

/* Mehrere Bedingungen */
DATA filter_komplex;
  SET kunden;
  WHERE stadt IN ('Berlin', 'Hamburg', 'Muenchen')
    AND umsatz > 10000
    AND name NE '';
RUN;
\`\`\`

### PySpark filter():
\`\`\`python
from pyspark.sql import functions as F

# Einfache Bedingung
junge = mitarbeiter.filter(F.col("alter") < 35)

# Mehrere Bedingungen
komplex = kunden.filter(
    (F.col("stadt").isin(["Berlin", "Hamburg", "Muenchen"])) &
    (F.col("umsatz") > 10000) &
    (F.col("name") != "")
)
\`\`\`

---

## NULL / Missing Values behandeln

In SAS ist ein fehlender Wert bei Characters \`''\` (leer), bei Numerics \`.\`

\`\`\`sas
DATA ohne_fehlende;
  SET rohdaten;
  WHERE name NE ''
    AND alter NE .
    AND NOT MISSING(plz);
RUN;
\`\`\`

### PySpark:
\`\`\`python
df_clean = rohdaten
    .filter(F.col("name").isNotNull())
    .filter(F.col("name") != "")
    .filter(F.col("alter").isNotNull())

# Oder kompakter:
df_clean = rohdaten.dropna(subset=["name", "alter", "plz"])
\`\`\`

---

## Sortieren

### SAS:
\`\`\`sas
PROC SORT DATA=kunden OUT=kunden_sortiert;
  BY DESCENDING umsatz name;
RUN;
\`\`\`

### PySpark:
\`\`\`python
df_sortiert = kunden.orderBy(
    F.col("umsatz").desc(),
    F.col("name").asc()
)
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "Stadtfilter setzen",
            instruction: "Filtere den Kundendatensatz auf Kunden aus Berlin oder München. SAS: WHERE stadt IN (...), PySpark: .filter(F.col('stadt').isin([...])).",
            hint: "SAS: WHERE stadt IN ('Berlin', 'Muenchen') – Werte müssen in Hochkommas stehen."
          },
          {
            title: "Altersbereich eingrenzen",
            instruction: "Erweitere den Filter: Alter muss zwischen 25 und 50 liegen. SAS: BETWEEN ... AND ..., PySpark: .between(25, 50).",
            hint: "PySpark: F.col('alter').between(25, 50) – beide Grenzen sind inklusive."
          },
          {
            title: "NULL-Werte ausschließen & sortieren",
            instruction: "Filtere zusätzlich leere Namen aus und sortiere das Ergebnis alphabetisch nach Name.",
            hint: "SAS: name NE '' / PySpark: F.col('name').isNotNull() & (F.col('name') != '')"
          }
        ],
        sasStarter: `DATA kunden_gefiltert;
  SET kunden;
  WHERE stadt IN ('Berlin', '____')
    AND alter ____ 25 AND 50
    AND name ____ '';
RUN;

PROC SORT DATA=kunden_gefiltert;
  BY ____;
RUN;

PROC PRINT DATA=kunden_gefiltert;
RUN;`,
        pysparkStarter: `from pyspark.sql import functions as F

df_gefiltert = kunden \\
    .filter(F.col("stadt").isin(["Berlin", "____"])) \\
    .filter(F.col("alter").____( ____, ____)) \\
    .filter(F.col("name").____()) \\
    .filter(F.col("name") != "") \\
    .orderBy(F.col("name").____())

df_gefiltert.show()`,
        sasSolution: `DATA kunden_gefiltert;
  SET kunden;
  WHERE stadt IN ('Berlin', 'Muenchen')
    AND alter BETWEEN 25 AND 50
    AND name NE '';
RUN;

PROC SORT DATA=kunden_gefiltert;
  BY name;
RUN;

PROC PRINT DATA=kunden_gefiltert;
RUN;`,
        pysparkSolution: `from pyspark.sql import functions as F

df_gefiltert = kunden \\
    .filter(F.col("stadt").isin(["Berlin", "Muenchen"])) \\
    .filter(F.col("alter").between(25, 50)) \\
    .filter(F.col("name").isNotNull()) \\
    .filter(F.col("name") != "") \\
    .orderBy(F.col("name").asc())

df_gefiltert.show()`,
        expectedOutput: `+---------+-----+--------+-------+
|name     |alter|stadt   |umsatz |
+---------+-----+--------+-------+
|Fischer  |42   |Berlin  |12500  |
|Mueller  |35   |Berlin  |9800   |
|Schmidt  |28   |Muenchen|15200  |
+---------+-----+--------+-------+`,
        hints: [
          "SAS: BETWEEN ... AND ... für Bereichsfilter",
          "PySpark: .between() Methode auf F.col()",
          "Verknüpfung in PySpark mit & (UND) oder | (ODER)"
        ]
      }
    }
  ]
},

// ════════════════════════════════════════════════════════════════════════════
// M3 – DATENQUALITÄT: NAMEN & SONDERZEICHEN
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m3",
  title: "Datenqualität – Namen & Sonderzeichen",
  icon: "🔬",
  lessons: [
    {
      id: "l3_1",
      title: "Sonderzeichen erkennen",
      theory: `
## Datenqualitätsprüfung: Namen auf Sonderzeichen

Das ist dein **Kernthema**: Namen in Datenbanken enthalten oft unerwünschte Sonderzeichen durch Erfassungsfehler, Systemmigrationen oder Encoding-Probleme.

---

## Was gilt als "unzulässiges" Sonderzeichen?

Bei Namen sind typischerweise erlaubt:
- Buchstaben (inkl. Umlaute: ä ö ü ß Á É etc.)
- Bindestrich \`-\` (Doppelname)
- Apostroph \`'\` (O'Brien, D'Angelo)
- Leerzeichen
- Punkt \`.\` (Abkürzungen: St., Dr.)

Typische **Probleme**:
- \`@\`, \`#\`, \`!\`, \`&\` (Sonderzeichen aus HTML/Encoding)
- Zahlen \`0-9\` im Namen
- Doppelte Leerzeichen
- Führende/nachgestellte Leerzeichen

---

## Regex Grundlagen

| Muster | Bedeutung |
|--------|-----------|
| \`[a-zA-Z]\` | Lateinische Buchstaben |
| \`[äöüÄÖÜß]\` | Deutsche Umlaute |
| \`\\s\` | Whitespace |
| \`[^...]\` | NICHT die aufgeführten Zeichen |

---

## Prüfung in SAS mit PRXMATCH

\`\`\`sas
DATA namen_pruefung;
  SET kundendaten;
  pattern_id = PRXPARSE('/[^a-zA-ZäöüÄÖÜßàáâãèéêëùúûý\\s\\-\\'\\.]/');;
  hat_sonderzeichen = (PRXMATCH(pattern_id, STRIP(name)) > 0);
  hat_leading_space = (name NE STRIP(name));
  hat_doppelspace   = (INDEX(name, '  ') > 0);
  hat_problem = (hat_sonderzeichen OR hat_leading_space OR hat_doppelspace);
  CALL PRXFREE(pattern_id);
RUN;
\`\`\`

## Prüfung in PySpark mit regexp

\`\`\`python
UNERLAUBT = r"[^a-zA-ZäöüÄÖÜßàáâãèéêëùúûý\\s\\-'\\.]"

df_geprueft = kundendaten \\
    .withColumn("hat_sonderzeichen", F.col("name").rlike(UNERLAUBT)) \\
    .withColumn("hat_leading_space", F.col("name") != F.trim(F.col("name"))) \\
    .withColumn("hat_doppelspace",   F.col("name").rlike(r"  ")) \\
    .withColumn("hat_problem",
        F.col("hat_sonderzeichen") | F.col("hat_leading_space") | F.col("hat_doppelspace"))
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "Regex-Pattern definieren",
            instruction: "Definiere das Regex-Pattern für unzulässige Zeichen: alles was NICHT Buchstabe, Umlaut, Leerzeichen, Bindestrich, Apostroph oder Punkt ist. Nutze [^...] (Negation).",
            hint: "SAS: PRXPARSE('/[^a-zA-ZäöüÄÖÜß\\s\\-\\'\\.]/'). Das ^ innerhalb von [...] bedeutet NICHT."
          },
          {
            title: "Prüfspalten hinzufügen",
            instruction: "Füge drei Spalten hinzu: hat_sonderzeichen (Regex-Match), hat_leading_space (Name ≠ STRIP(Name)), hat_doppelspace (Doppelleerzeichen).",
            hint: "PySpark: F.col('name').rlike(PATTERN) gibt True zurück wenn das Muster gefunden wird."
          },
          {
            title: "Zusammenfassung ausgeben",
            instruction: "Gib nur problematische Datensätze aus. Erstelle eine Häufigkeitsstatistik der Fehlertypen.",
            hint: "SAS: PROC FREQ ... TABLES hat_sonderzeichen; / PySpark: .groupBy('hat_sonderzeichen').count()"
          }
        ],
        sasStarter: `DATA test_namen;
  INPUT name $50.;
  DATALINES;
  Mueller
  Müller
  O'Brien
  van  der Berg
   Schmidt
  Fischer!
  Meier@web.de
  ;
RUN;

DATA namen_pruefung;
  SET test_namen;
  pattern_id = PRXPARSE('/[^a-zA-ZäöüÄÖÜß____\\-\\'\\.]/');;
  hat_sonderzeichen = (PRXMATCH(____, STRIP(name)) > 0);
  hat_leading_space = (name NE ____(name));
  hat_doppelspace   = (INDEX(name, '  ') > ____);
  hat_problem = (hat_sonderzeichen OR ____ OR hat_doppelspace);
  CALL PRXFREE(pattern_id);
RUN;

PROC PRINT DATA=namen_pruefung;
  WHERE ____ = 1;
RUN;

PROC FREQ DATA=namen_pruefung;
  TABLES hat_sonderzeichen ____ hat_doppelspace;
RUN;`,
        pysparkStarter: `from pyspark.sql import functions as F

daten = [("Mueller",), ("Müller",), ("O'Brien",),
         ("van  der Berg",), (" Schmidt",), ("Fischer!",), ("Meier@web.de",)]
df = spark.createDataFrame(daten, ["name"])

UNERLAUBT = r"[^a-zA-ZäöüÄÖÜß____\\-'\\.]"

df_geprueft = df \\
    .withColumn("hat_sonderzeichen", F.col("name").____(____)  ) \\
    .withColumn("hat_leading_space", F.col("name") != F.____(F.col("name"))) \\
    .withColumn("hat_doppelspace",   F.col("name").rlike(r"  ")) \\
    .withColumn("hat_problem",
        F.col("hat_sonderzeichen") | ____ | F.col("hat_doppelspace"))

df_geprueft.filter(F.col("____")).show(truncate=False)
df_geprueft.groupBy("hat_sonderzeichen", "hat_leading_space").count().show()`,
        sasSolution: `DATA test_namen;
  INPUT name $50.;
  DATALINES;
  Mueller
  Müller
  O'Brien
  van  der Berg
   Schmidt
  Fischer!
  Meier@web.de
  ;
RUN;

DATA namen_pruefung;
  SET test_namen;
  pattern_id = PRXPARSE('/[^a-zA-ZäöüÄÖÜß\\s\\-\\'\\.]/');;
  hat_sonderzeichen = (PRXMATCH(pattern_id, STRIP(name)) > 0);
  hat_leading_space = (name NE STRIP(name));
  hat_doppelspace   = (INDEX(name, '  ') > 0);
  hat_problem = (hat_sonderzeichen OR hat_leading_space OR hat_doppelspace);
  CALL PRXFREE(pattern_id);
RUN;

PROC PRINT DATA=namen_pruefung;
  WHERE hat_problem = 1;
RUN;

PROC FREQ DATA=namen_pruefung;
  TABLES hat_sonderzeichen hat_leading_space hat_doppelspace;
RUN;`,
        pysparkSolution: `from pyspark.sql import functions as F

daten = [("Mueller",), ("Müller",), ("O'Brien",),
         ("van  der Berg",), (" Schmidt",), ("Fischer!",), ("Meier@web.de",)]
df = spark.createDataFrame(daten, ["name"])

UNERLAUBT = r"[^a-zA-ZäöüÄÖÜß\\s\\-'\\.]"

df_geprueft = df \\
    .withColumn("hat_sonderzeichen", F.col("name").rlike(UNERLAUBT)) \\
    .withColumn("hat_leading_space", F.col("name") != F.trim(F.col("name"))) \\
    .withColumn("hat_doppelspace",   F.col("name").rlike(r"  ")) \\
    .withColumn("hat_problem",
        F.col("hat_sonderzeichen") | F.col("hat_leading_space") | F.col("hat_doppelspace"))

df_geprueft.filter(F.col("hat_problem")).show(truncate=False)
df_geprueft.groupBy("hat_sonderzeichen", "hat_leading_space").count().show()`,
        expectedOutput: `Problematische Namen:
+-------------+-----------------+-----------------+--------------+----------+
|name         |hat_sonderzeichen|hat_leading_space|hat_doppelspace|hat_problem|
+-------------+-----------------+-----------------+---------------+----------+
|van  der Berg|false            |false            |true           |true      |
| Schmidt     |false            |true             |false          |true      |
|Fischer!     |true             |false            |false          |true      |
|Meier@web.de |true             |false            |false          |true      |
+-------------+-----------------+-----------------+---------------+----------+`,
        hints: [
          "Regex: [^ ] bedeutet 'nicht diese Zeichen'",
          "PySpark: .rlike() für Regex-Matching",
          "SAS: PRXMATCH() gibt Position zurück (>0 = gefunden)"
        ]
      }
    },

    {
      id: "l3_2",
      title: "Namen bereinigen & reparieren",
      theory: `
## Namen automatisch bereinigen

Nachdem wir Probleme erkannt haben, können wir sie systematisch beheben.

---

## Bereinigungsstrategie

1. **Leerzeichen normalisieren** (trim + collapse)
2. **Encoding-Artefakte** ersetzen (\`&amp;\` → \`&\`)
3. **Unzulässige Zeichen** markieren oder entfernen
4. **Groß/Kleinschreibung** normalisieren (optional)

---

## SAS: Systematische Bereinigung

\`\`\`sas
DATA namen_bereinigt;
  SET namen_roh;
  name_orig = name;

  /* Schritt 1: Leerzeichen normalisieren */
  name = STRIP(name);
  name = COMPBL(name);

  /* Schritt 2: HTML-Entities ersetzen */
  name = TRANWRD(name, '&amp;', '&');
  name = TRANWRD(name, '&#39;', "'");

  /* Schritt 3: Steuerzeichen entfernen */
  name = PRXCHANGE('s/[\\x00-\\x1F\\x7F]//g', -1, name);

  /* Schritt 4: Ergebnis prüfen */
  wurde_geaendert = (name NE name_orig);
RUN;
\`\`\`

## PySpark: Bereinigungspipeline

\`\`\`python
def bereinige_namen(df, spalte="name"):
    return df \\
        .withColumn(f"{spalte}_orig", F.col(spalte)) \\
        .withColumn(spalte, F.trim(F.col(spalte))) \\
        .withColumn(spalte, F.regexp_replace(F.col(spalte), r'\\s+', ' ')) \\
        .withColumn(spalte, F.regexp_replace(F.col(spalte), '&amp;', '&')) \\
        .withColumn(spalte, F.regexp_replace(F.col(spalte), r'[\\x00-\\x1F\\x7F]', '')) \\
        .withColumn("wurde_geaendert", F.col(spalte) != F.col(f"{spalte}_orig"))
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "Leerzeichen normalisieren",
            instruction: "Bereinige zunächst alle führenden/nachgestellten Leerzeichen (STRIP/trim) und reduziere Mehrfach-Leerzeichen zu einem (COMPBL/regexp_replace mit \\s+).",
            hint: "SAS: COMPBL(name) kollabiert mehrfache Spaces zu einem. PySpark: F.regexp_replace('name', r'\\s+', ' ')"
          },
          {
            title: "HTML-Entities ersetzen",
            instruction: "Ersetze &amp; durch & und zahlen aus Namen entfernen. SAS: TRANWRD() und PRXCHANGE(), PySpark: F.regexp_replace().",
            hint: "TRANWRD(str, 'suchen', 'ersetzen') / F.regexp_replace(col, pattern, replacement)"
          },
          {
            title: "Änderungen markieren",
            instruction: "Vergleiche Original-Name mit bereinigtem Namen und setze wurde_geaendert = 1 (oder True) bei Unterschied. Gib nur geänderte Zeilen aus.",
            hint: "SAS: wurde_geaendert = (name NE name_orig) / PySpark: F.col('name') != F.col('name_orig')"
          }
        ],
        sasStarter: `DATA namen_roh;
  INPUT name $100.;
  DATALINES;
  &amp;Mueller
  van  der  Berg
   Fischer 
  Müller123
  O'Brien
  ;
RUN;

DATA namen_bereinigt;
  SET namen_roh;
  name_orig = name;
  name = ____(name);         /* trim */
  name = ____(name);         /* collapse spaces */
  name = TRANWRD(name, '&amp;', '____');
  name = PRXCHANGE('s/[0-9]//g', ____, name);  /* Zahlen entfernen */
  wurde_geaendert = (name ____ name_orig);
RUN;

PROC PRINT DATA=namen_bereinigt;
  VAR ____ name wurde_geaendert;
RUN;`,
        pysparkStarter: `from pyspark.sql import functions as F

daten = [("&amp;Mueller",), ("van  der  Berg",),
         (" Fischer ",), ("Müller123",), ("O'Brien",)]
df = spark.createDataFrame(daten, ["name"])

df_bereinigt = df \\
    .withColumn("name_orig", F.col("name")) \\
    .withColumn("name", F.____(F.col("name"))) \\
    .withColumn("name", F.regexp_replace(F.col("name"), r"____", " ")) \\
    .withColumn("name", F.regexp_replace(F.col("name"), "____", "&")) \\
    .withColumn("name", F.regexp_replace(F.col("name"), r"[0-9]", "")) \\
    .withColumn("wurde_geaendert", F.col("name") ____ F.col("name_orig"))

df_bereinigt.show(truncate=False)`,
        sasSolution: `DATA namen_roh;
  INPUT name $100.;
  DATALINES;
  &amp;Mueller
  van  der  Berg
   Fischer 
  Müller123
  O'Brien
  ;
RUN;

DATA namen_bereinigt;
  SET namen_roh;
  name_orig = name;
  name = STRIP(name);
  name = COMPBL(name);
  name = TRANWRD(name, '&amp;', '&');
  name = PRXCHANGE('s/[0-9]//g', -1, name);
  wurde_geaendert = (name NE name_orig);
RUN;

PROC PRINT DATA=namen_bereinigt;
  VAR name_orig name wurde_geaendert;
RUN;`,
        pysparkSolution: `from pyspark.sql import functions as F

daten = [("&amp;Mueller",), ("van  der  Berg",),
         (" Fischer ",), ("Müller123",), ("O'Brien",)]
df = spark.createDataFrame(daten, ["name"])

df_bereinigt = df \\
    .withColumn("name_orig", F.col("name")) \\
    .withColumn("name", F.trim(F.col("name"))) \\
    .withColumn("name", F.regexp_replace(F.col("name"), r"\\s+", " ")) \\
    .withColumn("name", F.regexp_replace(F.col("name"), "&amp;", "&")) \\
    .withColumn("name", F.regexp_replace(F.col("name"), r"[0-9]", "")) \\
    .withColumn("wurde_geaendert", F.col("name") != F.col("name_orig"))

df_bereinigt.show(truncate=False)`,
        expectedOutput: `+--------------+-----------+----------------+
|name_orig     |name       |wurde_geaendert |
+--------------+-----------+----------------+
|&amp;Mueller  |&Mueller   |true            |
|van  der  Berg|van der Berg|true           |
| Fischer      |Fischer    |true            |
|Müller123     |Müller     |true            |
|O'Brien       |O'Brien    |false           |
+--------------+-----------+----------------+`,
        hints: [
          "SAS: COMPBL() kollabiert Mehrfach-Spaces",
          "PySpark: regexp_replace mit r'\\s+' für mehrfache Spaces",
          "TRANWRD / regexp_replace für Text-Ersetzungen"
        ]
      }
    },

    {
      id: "l3_3",
      title: "Erweiterte Regex & Zeichensatz-Analyse",
      theory: `
## Unicode & Encoding-Probleme bei Namen

In der Praxis treffen wir auf komplexe Encoding-Probleme – besonders bei Namen aus verschiedenen Kulturen.

---

## Häufige Encoding-Artefakte

\`\`\`
Falsch:   Richtig:
Ã¼       ü
Ã¶       ö
Ã¤       ä
â€™      '
\`\`\`

---

## Zeichenfrequenz-Analyse

Finde heraus, welche Sonderzeichen am häufigsten vorkommen:

### PySpark:
\`\`\`python
df_zeichen = kundendaten \\
    .withColumn("zeichen_array", F.split(F.col("name"), "")) \\
    .withColumn("zeichen", F.explode(F.col("zeichen_array")))

df_zeichen \\
    .filter(~F.col("zeichen").isin(list(ERLAUBT_SET))) \\
    .filter(F.col("zeichen") != "") \\
    .groupBy("zeichen") \\
    .count() \\
    .orderBy(F.col("count").desc()) \\
    .show(20)
\`\`\`

### SAS – Zeichenfrequenz:
\`\`\`sas
DATA zeichen_analyse;
  SET kundendaten;
  DO i = 1 TO LENGTH(name);
    zeichen = SUBSTR(name, i, 1);
    IF NOT PRXMATCH('/[a-zA-ZäöüÄÖÜß\\s\\-\\'\\.]/', zeichen) AND zeichen NE ''
    THEN OUTPUT;
  END;
  KEEP name zeichen;
RUN;

PROC FREQ DATA=zeichen_analyse ORDER=FREQ;
  TABLES zeichen / MISSING;
RUN;
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "Testdaten vorbereiten",
            instruction: "Erstelle einen Testdatensatz mit verschiedenen Sonderzeichen-Problemen: normale Namen, Namen mit !, @, &, Zahlen etc.",
            hint: "SAS: DATA ... DATALINES; / PySpark: spark.createDataFrame([(...),], ['name'])"
          },
          {
            title: "Namen in Zeichen zerlegen",
            instruction: "Zerlege jeden Namen zeichenweise. SAS: SUBSTR(name, i, 1) in DO-Schleife. PySpark: F.split() + F.explode().",
            hint: "PySpark: withColumn('zeichen_array', F.split('name', '')) dann withColumn('zeichen', F.explode('zeichen_array'))"
          },
          {
            title: "Häufigkeitstabelle erstellen",
            instruction: "Filtere die Zeichen auf unerlaubte und erstelle eine Häufigkeitstabelle sortiert nach Vorkommen (häufigstes zuerst).",
            hint: "SAS: PROC FREQ ORDER=FREQ; / PySpark: .groupBy('zeichen').count().orderBy(F.col('count').desc())"
          }
        ],
        sasStarter: `DATA test_namen;
  INPUT name $100.;
  DATALINES;
  Müller!
  Fischer@123
  O'Brien
  van der Berg
  Meier&Söhne
  ;
RUN;

DATA zeichen_analyse;
  SET test_namen;
  DO ____ = 1 TO LENGTH(STRIP(name));
    zeichen = SUBSTR(STRIP(name), ____, 1);
    ascii_wert = RANK(zeichen);
    IF NOT PRXMATCH('/[a-zA-ZäöüÄÖÜß\\s\\-\\'\\.]/', zeichen)
    THEN ____;
  END;
  KEEP name zeichen ascii_wert;
RUN;

PROC FREQ DATA=zeichen_analyse ORDER=____;
  TABLES zeichen / MISSING;
RUN;`,
        pysparkStarter: `from pyspark.sql import functions as F

daten = [("Müller!",), ("Fischer@123",), ("O'Brien",), ("van der Berg",), ("Meier&Söhne",)]
df = spark.createDataFrame(daten, ["name"])

ERLAUBT = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZäöüÄÖÜß -'."

df_zeichen = df \\
    .withColumn("zeichen_array", F.____(F.col("name"), "")) \\
    .withColumn("zeichen",       F.____(F.col("zeichen_array")))

df_zeichen \\
    .filter(~F.col("zeichen").isin(list(ERLAUBT))) \\
    .filter(F.col("zeichen") != "") \\
    .groupBy("____").count() \\
    .orderBy(F.col("count").____()) \\
    .show()`,
        sasSolution: `DATA test_namen;
  INPUT name $100.;
  DATALINES;
  Müller!
  Fischer@123
  O'Brien
  van der Berg
  Meier&Söhne
  ;
RUN;

DATA zeichen_analyse;
  SET test_namen;
  DO i = 1 TO LENGTH(STRIP(name));
    zeichen = SUBSTR(STRIP(name), i, 1);
    ascii_wert = RANK(zeichen);
    IF NOT PRXMATCH('/[a-zA-ZäöüÄÖÜß\\s\\-\\'\\.]/', zeichen)
    THEN OUTPUT;
  END;
  KEEP name zeichen ascii_wert;
RUN;

PROC FREQ DATA=zeichen_analyse ORDER=FREQ;
  TABLES zeichen / MISSING;
RUN;`,
        pysparkSolution: `from pyspark.sql import functions as F

daten = [("Müller!",), ("Fischer@123",), ("O'Brien",), ("van der Berg",), ("Meier&Söhne",)]
df = spark.createDataFrame(daten, ["name"])

ERLAUBT = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZäöüÄÖÜß -'."

df_zeichen = df \\
    .withColumn("zeichen_array", F.split(F.col("name"), "")) \\
    .withColumn("zeichen",       F.explode(F.col("zeichen_array")))

df_zeichen \\
    .filter(~F.col("zeichen").isin(list(ERLAUBT))) \\
    .filter(F.col("zeichen") != "") \\
    .groupBy("zeichen").count() \\
    .orderBy(F.col("count").desc()) \\
    .show()`,
        expectedOutput: `+-------+-----+
|zeichen|count|
+-------+-----+
|1      |1    |
|2      |1    |
|3      |1    |
|!      |1    |
|@      |1    |
|&      |1    |
+-------+-----+`,
        hints: [
          "SAS: SUBSTR(name, i, 1) holt ein Zeichen an Position i",
          "PySpark: F.split() + F.explode() für Zeichenzerlegung",
          "Danach groupBy('zeichen').count()"
        ]
      }
    }
  ]
},

// ════════════════════════════════════════════════════════════════════════════
// M4 – AGGREGATION & STATISTIKEN
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m4",
  title: "Aggregation & Statistiken",
  icon: "📊",
  lessons: [
    {
      id: "l4_1",
      title: "GROUP BY & Aggregation",
      theory: `
## Aggregation: GROUP BY

### SAS – PROC SQL und PROC MEANS:
\`\`\`sas
PROC SQL;
  SELECT
    abteilung,
    COUNT(*)    AS anzahl,
    AVG(gehalt) AS avg_gehalt FORMAT=8.2,
    MIN(gehalt) AS min_gehalt,
    MAX(gehalt) AS max_gehalt,
    SUM(gehalt) AS sum_gehalt
  FROM mitarbeiter
  GROUP BY abteilung
  ORDER BY avg_gehalt DESC;
QUIT;
\`\`\`

### PySpark – groupBy():
\`\`\`python
from pyspark.sql import functions as F

stats = mitarbeiter.groupBy("abteilung").agg(
    F.count("*").alias("anzahl"),
    F.avg("gehalt").alias("avg_gehalt"),
    F.min("gehalt").alias("min_gehalt"),
    F.max("gehalt").alias("max_gehalt"),
    F.sum("gehalt").alias("sum_gehalt")
).orderBy(F.col("avg_gehalt").desc())
\`\`\`

---

## Window Functions – Ranking & Laufende Summen

### SAS (PROC SQL):
\`\`\`sas
PROC SQL;
  SELECT name, gehalt, abteilung,
    RANK() OVER (PARTITION BY abteilung ORDER BY gehalt DESC) AS rang,
    SUM(gehalt) OVER (PARTITION BY abteilung) AS abt_summe
  FROM mitarbeiter;
QUIT;
\`\`\`

### PySpark:
\`\`\`python
from pyspark.sql.window import Window

w_abt     = Window.partitionBy("abteilung").orderBy(F.col("gehalt").desc())
w_abt_all = Window.partitionBy("abteilung")

df_window = mitarbeiter \\
    .withColumn("rang",      F.rank().over(w_abt)) \\
    .withColumn("abt_summe", F.sum("gehalt").over(w_abt_all)) \\
    .withColumn("anteil",    F.col("gehalt") / F.sum("gehalt").over(w_abt_all))
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "Statistiken pro Abteilung",
            instruction: "Berechne pro Abteilung: Anzahl Mitarbeiter, Durchschnittsgehalt (gerundet), Min- und Max-Gehalt. Sortiere nach Durchschnittsgehalt absteigend.",
            hint: "SAS: GROUP BY abteilung in PROC SQL / PySpark: .groupBy('abteilung').agg(F.count(*), F.avg(...))"
          },
          {
            title: "Rang innerhalb der Abteilung",
            instruction: "Füge für jeden Mitarbeiter seinen Rang innerhalb der eigenen Abteilung hinzu (nach Gehalt absteigend). Nutze Window Functions.",
            hint: "SAS: RANK() OVER (PARTITION BY abteilung ORDER BY gehalt DESC) / PySpark: Window.partitionBy('abteilung').orderBy(desc)"
          }
        ],
        sasStarter: `/* Statistiken pro Abteilung */
PROC SQL;
  SELECT
    ____,
    COUNT(*) AS anzahl,
    ____(gehalt) AS avg_gehalt FORMAT=8.0,
    MIN(gehalt) AS min_gehalt,
    MAX(gehalt) AS max_gehalt
  FROM mitarbeiter
  GROUP BY ____
  ORDER BY avg_gehalt ____;
QUIT;

/* Rang innerhalb Abteilung */
PROC SQL;
  SELECT name, abteilung, gehalt,
    RANK() OVER (PARTITION BY ____ ORDER BY gehalt ____) AS rang_in_abt
  FROM mitarbeiter
  ORDER BY abteilung, rang_in_abt;
QUIT;`,
        pysparkStarter: `from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Statistiken
mitarbeiter.groupBy("____").agg(
    F.count("*").alias("anzahl"),
    F.round(F.____(  "gehalt"), 0).alias("avg_gehalt"),
    F.min("gehalt").alias("min_gehalt"),
    F.max("gehalt").alias("max_gehalt")
).orderBy(F.col("avg_gehalt").____()).show()

# Rang
w = Window.partitionBy("____").orderBy(F.col("gehalt").____())
mitarbeiter \\
    .withColumn("rang_in_abt", F.____(  ).over(w)) \\
    .orderBy("abteilung", "rang_in_abt") \\
    .show()`,
        sasSolution: `/* Statistiken pro Abteilung */
PROC SQL;
  SELECT
    abteilung,
    COUNT(*) AS anzahl,
    AVG(gehalt) AS avg_gehalt FORMAT=8.0,
    MIN(gehalt) AS min_gehalt,
    MAX(gehalt) AS max_gehalt
  FROM mitarbeiter
  GROUP BY abteilung
  ORDER BY avg_gehalt DESC;
QUIT;

/* Rang innerhalb Abteilung */
PROC SQL;
  SELECT name, abteilung, gehalt,
    RANK() OVER (PARTITION BY abteilung ORDER BY gehalt DESC) AS rang_in_abt
  FROM mitarbeiter
  ORDER BY abteilung, rang_in_abt;
QUIT;`,
        pysparkSolution: `from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Statistiken
mitarbeiter.groupBy("abteilung").agg(
    F.count("*").alias("anzahl"),
    F.round(F.avg("gehalt"), 0).alias("avg_gehalt"),
    F.min("gehalt").alias("min_gehalt"),
    F.max("gehalt").alias("max_gehalt")
).orderBy(F.col("avg_gehalt").desc()).show()

# Rang
w = Window.partitionBy("abteilung").orderBy(F.col("gehalt").desc())
mitarbeiter \\
    .withColumn("rang_in_abt", F.rank().over(w)) \\
    .orderBy("abteilung", "rang_in_abt") \\
    .show()`,
        expectedOutput: `Statistiken:
+---------+------+----------+-----------+-----------+
|abteilung|anzahl|avg_gehalt|min_gehalt |max_gehalt |
+---------+------+----------+-----------+-----------+
|Finance  |3     |5200      |4800       |5600       |
|IT       |4     |4750      |4200       |5500       |
|HR       |2     |3900      |3800       |4000       |
+---------+------+----------+-----------+-----------+

Ränge:
+--------+---------+------+-----------+
|name    |abteilung|gehalt|rang_in_abt|
+--------+---------+------+-----------+
|Fischer |Finance  |5600  |1          |
|Müller  |Finance  |5200  |2          |
+--------+---------+------+-----------+`,
        hints: [
          "PySpark: Window.partitionBy().orderBy()",
          "F.rank().over(window) für Rang",
          "groupBy().agg() für mehrere Aggregationen gleichzeitig"
        ]
      }
    }
  ]
},

// ════════════════════════════════════════════════════════════════════════════
// M5 – JOINS & DATEN ZUSAMMENFÜHREN
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m5",
  title: "JOINs & Daten zusammenführen",
  icon: "🔗",
  lessons: [
    {
      id: "l5_1",
      title: "INNER, LEFT, FULL JOIN",
      theory: `
## JOINs im Vergleich

| JOIN-Typ | SAS | PySpark |
|----------|-----|---------| 
| INNER JOIN | MERGE + IN= oder SQL | .join(how="inner") |
| LEFT JOIN | MERGE + IN= | .join(how="left") |
| RIGHT JOIN | MERGE | .join(how="right") |
| FULL OUTER | MERGE | .join(how="outer") |
| CROSS JOIN | PROC SQL CROSS | .crossJoin() |

---

## INNER JOIN

### SAS:
\`\`\`sas
PROC SQL;
  SELECT k.kunden_id, k.name, b.bestellnr, b.betrag
  FROM kunden k
  INNER JOIN bestellungen b ON k.kunden_id = b.kunden_id;
QUIT;

/* Alternativ: DATA Step MERGE */
PROC SORT DATA=kunden;      BY kunden_id; RUN;
PROC SORT DATA=bestellungen; BY kunden_id; RUN;

DATA merged;
  MERGE kunden(IN=in_k) bestellungen(IN=in_b);
  BY kunden_id;
  IF in_k AND in_b;
RUN;
\`\`\`

### PySpark:
\`\`\`python
df_inner = kunden.join(bestellungen, on="kunden_id", how="inner")
\`\`\`

---

## LEFT JOIN

### SAS:
\`\`\`sas
PROC SQL;
  SELECT k.*, b.bestellnr, b.betrag
  FROM kunden k
  LEFT JOIN bestellungen b ON k.kunden_id = b.kunden_id;
QUIT;
\`\`\`

### PySpark:
\`\`\`python
df_left = kunden.join(bestellungen, on="kunden_id", how="left")
df_ohne = df_left.filter(F.col("bestellnr").isNull())
\`\`\`

---

## Anti-Join: Kunden OHNE Bestellung

### SAS:
\`\`\`sas
PROC SQL;
  SELECT * FROM kunden k
  WHERE NOT EXISTS (SELECT 1 FROM bestellungen b WHERE b.kunden_id = k.kunden_id);
QUIT;
\`\`\`

### PySpark:
\`\`\`python
df_anti = kunden.join(bestellungen, on="kunden_id", how="left_anti")
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "Testdaten erstellen",
            instruction: "Erstelle zwei Tabellen: kunden (kunden_id, name) mit 4 Einträgen und bestellungen (kunden_id, betrag) mit 3 Einträgen. Nicht jeder Kunde hat eine Bestellung.",
            hint: "SAS: Zwei separate DATA Steps mit DATALINES / PySpark: spark.createDataFrame() für jede Tabelle."
          },
          {
            title: "LEFT JOIN ausführen",
            instruction: "Verbinde kunden mit bestellungen über einen LEFT JOIN. Alle Kunden sollen erscheinen, auch ohne Bestellung (NULL bei betrag).",
            hint: "SAS: LEFT JOIN in PROC SQL / PySpark: .join(bestellungen, 'kunden_id', 'left')"
          },
          {
            title: "Anti-Join: Kunden ohne Bestellung",
            instruction: "Finde alle Kunden, die noch keine Bestellung haben. Gib die Anzahl aus.",
            hint: "PySpark: how='left_anti' für Anti-Join / SAS: WHERE NOT EXISTS(...)"
          }
        ],
        sasStarter: `DATA kunden;
  INPUT kunden_id name $20.;
  DATALINES;
  1 Mueller
  2 Schmidt
  3 Fischer
  4 Weber
  ;
RUN;

DATA bestellungen;
  INPUT kunden_id betrag;
  DATALINES;
  1 150.00
  1 280.00
  3 99.99
  ;
RUN;

/* LEFT JOIN */
PROC SQL;
  SELECT k.name, b.betrag
  FROM kunden k
  ____ JOIN bestellungen b ON k.kunden_id = b.kunden_id;
QUIT;

/* Anti-Join: Kunden ohne Bestellung */
PROC SQL;
  SELECT * FROM kunden k
  WHERE ____ EXISTS (SELECT 1 FROM bestellungen b WHERE b.kunden_id = k.kunden_id);
QUIT;`,
        pysparkStarter: `kunden = spark.createDataFrame(
    [(1,"Mueller"),(2,"Schmidt"),(3,"Fischer"),(4,"Weber")],
    ["kunden_id","name"]
)
bestellungen = spark.createDataFrame(
    [(1,150.0),(1,280.0),(3,99.99)],
    ["kunden_id","betrag"]
)

# LEFT JOIN
kunden.join(bestellungen, "kunden_id", "____").show()

# Anti-Join: Kunden ohne Bestellung
df_ohne = kunden.join(bestellungen, "kunden_id", "____")
df_ohne.show()
print("Kunden ohne Bestellung:", df_ohne.____())`,
        sasSolution: `DATA kunden;
  INPUT kunden_id name $20.;
  DATALINES;
  1 Mueller
  2 Schmidt
  3 Fischer
  4 Weber
  ;
RUN;

DATA bestellungen;
  INPUT kunden_id betrag;
  DATALINES;
  1 150.00
  1 280.00
  3 99.99
  ;
RUN;

/* LEFT JOIN */
PROC SQL;
  SELECT k.name, b.betrag
  FROM kunden k
  LEFT JOIN bestellungen b ON k.kunden_id = b.kunden_id;
QUIT;

/* Anti-Join: Kunden ohne Bestellung */
PROC SQL;
  SELECT * FROM kunden k
  WHERE NOT EXISTS (SELECT 1 FROM bestellungen b WHERE b.kunden_id = k.kunden_id);
QUIT;`,
        pysparkSolution: `kunden = spark.createDataFrame(
    [(1,"Mueller"),(2,"Schmidt"),(3,"Fischer"),(4,"Weber")],
    ["kunden_id","name"]
)
bestellungen = spark.createDataFrame(
    [(1,150.0),(1,280.0),(3,99.99)],
    ["kunden_id","betrag"]
)

# LEFT JOIN
kunden.join(bestellungen, "kunden_id", "left").show()

# Anti-Join: Kunden ohne Bestellung
df_ohne = kunden.join(bestellungen, "kunden_id", "left_anti")
df_ohne.show()
print("Kunden ohne Bestellung:", df_ohne.count())`,
        expectedOutput: `LEFT JOIN:
+---------+-------+------+
|kunden_id|name   |betrag|
+---------+-------+------+
|1        |Mueller|150.0 |
|1        |Mueller|280.0 |
|2        |Schmidt|null  |
|3        |Fischer|99.99 |
|4        |Weber  |null  |
+---------+-------+------+

Anti-Join (ohne Bestellung):
+---------+-------+
|kunden_id|name   |
+---------+-------+
|2        |Schmidt|
|4        |Weber  |
+---------+-------+
Kunden ohne Bestellung: 2`,
        hints: [
          "PySpark: how='left_anti' für Anti-Join",
          "SAS: WHERE NOT EXISTS(...) für Anti-Join",
          "LEFT JOIN + filter(isNull) ist eine Alternative zum Anti-Join"
        ]
      }
    }
  ]
},

// ════════════════════════════════════════════════════════════════════════════
// M6 – DATENBANKVERBINDUNGEN
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m6",
  title: "Datenbankverbindungen",
  icon: "🗄️",
  lessons: [
    {
      id: "l6_1",
      title: "SAS LIBNAME vs PySpark JDBC",
      theory: `
## Datenbankverbindungen

Das ist der Schritt von einzelnen Dateien zu echten Produktionsdatenbanken.

---

## SAS: LIBNAME für Datenbankzugriff

LIBNAME ist das SAS-Konzept für Datenbankverbindungen. Es fungiert wie ein "Alias" für eine Datenbank oder ein Verzeichnis.

### Oracle-Verbindung:
\`\`\`sas
LIBNAME oracle_db ORACLE
  USER     = mein_user
  PASSWORD = "{SAS002}verschluesselt"  /* Nie Plaintext! */
  PATH     = '//db-server:1521/ORCL'
  SCHEMA   = DWH;

/* Jetzt wie normale SAS-Daten ansprechen */
PROC SQL;
  SELECT * FROM oracle_db.kunden_tabelle
  WHERE land = 'DE' LIMIT 1000;
QUIT;
\`\`\`

### PostgreSQL via ODBC:
\`\`\`sas
LIBNAME pgdb ODBC
  DSN      = 'PostgreSQL_DSN'
  USER     = db_user
  PASSWORD = 'geheim'
  SCHEMA   = public;
\`\`\`

---

## PySpark: JDBC-Verbindungen

\`\`\`python
import os
jdbc_url = "jdbc:postgresql://db-server:5432/produktion"

props = {
    "user":     "db_user",
    "password": os.environ["DB_PASSWORD"],  # NIEMALS Plaintext!
    "driver":   "org.postgresql.Driver"
}

# Tabelle einlesen mit Predicate Pushdown
df_aktiv = spark.read.jdbc(
    url=jdbc_url,
    table="(SELECT * FROM kunden WHERE status = 'AKTIV') AS t",
    properties=props
)

# Ergebnis zurückschreiben
df_ergebnis.write.jdbc(url=jdbc_url, table="dq_ergebnisse",
                       mode="overwrite", properties=props)
\`\`\`

---

## Delta Lake / Hive (Databricks)

\`\`\`python
# Über Tabellennamen (einfachste Methode in Databricks)
df = spark.table("dwh.kunden_tabelle")

# Parquet im Data Lake
df = spark.read.parquet("/pfad/*.parquet")
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "SAS LIBNAME für Oracle",
            instruction: "Schreibe den LIBNAME-Befehl für eine Oracle-Verbindung. Nutze USER, PASSWORD und PATH. Lies danach aktive Kunden (status='AKTIV') in einen Work-Datensatz.",
            hint: "LIBNAME mydb ORACLE USER=... PASSWORD=... PATH=...; — danach ist mydb.tabelle verfügbar."
          },
          {
            title: "PySpark JDBC-Verbindung",
            instruction: "Baue die JDBC-URL für PostgreSQL. Das Format ist: jdbc:postgresql://host:port/database. Lies aktive Kunden mit einem SQL-Filter direkt in der JDBC-Query.",
            hint: "Predicate Pushdown: Den Filter in der SQL-Subquery angeben ist effizienter als nachträglich zu filtern."
          },
          {
            title: "DQ-Ergebnisse zurückschreiben",
            instruction: "Führe eine einfache DQ-Prüfung durch (Name leer oder Sonderzeichen) und schreibe die Problemfälle zurück in die Datenbank.",
            hint: "SAS: DATA ora_db.dq_ergebnisse; SET dq_results; WHERE hat_problem = 1; RUN; / PySpark: .write.jdbc(mode='overwrite')"
          }
        ],
        sasStarter: `/* Oracle-Verbindung */
LIBNAME ora_db ____
  USER     = dwh_user
  PASSWORD = "{SAS002}EncryptedPassword"
  PATH     = '//oracle-srv:1521/PROD'
  SCHEMA   = DWH;

/* Aktive Kunden lesen */
DATA aktive_kunden;
  SET ora_db.kunden;
  WHERE ____ = 'AKTIV';
RUN;

/* DQ-Prüfung */
DATA dq_results;
  SET aktive_kunden;
  hat_problem = (name = '' OR PRXMATCH('/[^a-zA-ZäöüÄÖÜß\\s\\-]/', name) > ____);
RUN;

/* Zurückschreiben */
DATA ora_db.dq_ergebnisse;
  SET dq_results;
  WHERE ____ = 1;
RUN;`,
        pysparkStarter: `import os

jdbc_url = "jdbc:____://db-server:5432/produktion"
props = {
    "user":     "db_user",
    "password": os.environ.get("DB_PASSWORD", "geheim"),
    "driver":   "org.postgresql.____"
}

# Aktive Kunden lesen (Filter direkt in SQL-Query)
df_aktiv = spark.read.jdbc(
    url=____,
    table="(SELECT * FROM kunden WHERE status = '____') AS t",
    properties=____
)

# DQ-Prüfung
UNERLAUBT = r"[^a-zA-ZäöüÄÖÜß\\s\\-'\\.]"
df_dq = df_aktiv.withColumn("hat_problem", F.col("name").rlike(____))

# Probleme zurückschreiben
df_dq.filter(F.col("hat_problem")) \\
    .write.jdbc(url=jdbc_url, table="dq_ergebnisse", mode="____", properties=props)`,
        sasSolution: `/* Oracle-Verbindung */
LIBNAME ora_db ORACLE
  USER     = dwh_user
  PASSWORD = "{SAS002}EncryptedPassword"
  PATH     = '//oracle-srv:1521/PROD'
  SCHEMA   = DWH;

/* Aktive Kunden lesen */
DATA aktive_kunden;
  SET ora_db.kunden;
  WHERE status = 'AKTIV';
RUN;

/* DQ-Prüfung */
DATA dq_results;
  SET aktive_kunden;
  hat_problem = (name = '' OR PRXMATCH('/[^a-zA-ZäöüÄÖÜß\\s\\-]/', name) > 0);
RUN;

/* Zurückschreiben */
DATA ora_db.dq_ergebnisse;
  SET dq_results;
  WHERE hat_problem = 1;
RUN;`,
        pysparkSolution: `import os
from pyspark.sql import functions as F

jdbc_url = "jdbc:postgresql://db-server:5432/produktion"
props = {
    "user":     "db_user",
    "password": os.environ.get("DB_PASSWORD", "geheim"),
    "driver":   "org.postgresql.Driver"
}

# Aktive Kunden lesen
df_aktiv = spark.read.jdbc(
    url=jdbc_url,
    table="(SELECT * FROM kunden WHERE status = 'AKTIV') AS t",
    properties=props
)

# DQ-Prüfung
UNERLAUBT = r"[^a-zA-ZäöüÄÖÜß\\s\\-'\\.]"
df_dq = df_aktiv.withColumn("hat_problem", F.col("name").rlike(UNERLAUBT))

# Probleme zurückschreiben
df_dq.filter(F.col("hat_problem")) \\
    .write.jdbc(url=jdbc_url, table="dq_ergebnisse", mode="overwrite", properties=props)`,
        expectedOutput: `Verbindung hergestellt.
Aktive Kunden geladen: 45.231 Zeilen
DQ-Probleme gefunden: 312 (0.7%)
Ergebnisse geschrieben nach dq_ergebnisse`,
        hints: [
          "Passwörter NIEMALS im Code! → os.environ oder Vault",
          "JDBC URL-Format: jdbc:postgresql://host:port/database",
          "mode='overwrite' ersetzt die Tabelle, 'append' fügt hinzu"
        ]
      }
    }
  ]
},

// ════════════════════════════════════════════════════════════════════════════
// M7 – PERFORMANCE & BEST PRACTICES
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m7",
  title: "Performance & Best Practices",
  icon: "⚡",
  lessons: [
    {
      id: "l7_1",
      title: "Optimierung & Debugging",
      theory: `
## Performance-Optimierung

### SAS Performance-Tipps:

\`\`\`sas
/* 1. Nur benötigte Spalten einlesen (KEEP/DROP) */
DATA schlank;
  SET grosses_dataset (KEEP=kunden_id name status betrag);
RUN;

/* 2. Früh filtern mit WHERE (nicht IF!) */
DATA gefiltert;
  SET grosses_dataset;
  WHERE status = 'AKTIV';  /* Filtert beim Einlesen */
RUN;

/* 3. Laufzeit messen */
%LET start = %SYSFUNC(DATETIME());
/* ... Code ... */
%PUT Laufzeit: %SYSEVALF(%SYSFUNC(DATETIME()) - &start) Sekunden;
\`\`\`

### PySpark Performance-Tipps:

\`\`\`python
# 1. Caching für mehrfach genutzte DataFrames
df_kunden.cache()
df_kunden.unpersist()  # Freigeben wenn nicht mehr gebraucht

# 2. Filter früh einbauen
df_aktiv = spark.read.jdbc(
    url, "(SELECT * FROM kunden WHERE status = 'AKTIV') AS t", properties=props
)

# 3. Broadcast-Join für kleine Lookup-Tabellen
from pyspark.sql.functions import broadcast
df_result = df_gross.join(broadcast(df_klein), on="key")

# 4. Partitionierung prüfen
print(f"Partitionen: {df.rdd.getNumPartitions()}")
df.explain(True)  # Query-Plan analysieren
\`\`\`

---

## Vollständige DQ-Pipeline – Produktionsreif

\`\`\`python
def run_dq_pipeline(spark, input_table, output_table, jdbc_url, props):
    import logging, time
    log = logging.getLogger("DQ")
    start = time.time()
    
    df = spark.read.jdbc(url=jdbc_url, table=input_table, properties=props)
    total = df.count()
    
    REGEX = r"[^a-zA-ZäöüÄÖÜß\\s\\-'\\.]"
    
    df_dq = df \\
        .withColumn("dq_leer",          F.col("name").isNull() | (F.trim("name") == "")) \\
        .withColumn("dq_sonderzeichen", F.col("name").rlike(REGEX)) \\
        .withColumn("dq_fehler",
            F.col("dq_leer").cast("int") + F.col("dq_sonderzeichen").cast("int")) \\
        .withColumn("dq_status", F.when(F.col("dq_fehler") == 0, "OK").otherwise("FEHLER"))
    
    fehler = df_dq.filter("dq_status = 'FEHLER'").count()
    log.info(f"Fehler: {fehler}/{total} ({fehler/total*100:.1f}%)")
    
    df_dq.write.jdbc(url=jdbc_url, table=output_table, mode="overwrite", properties=props)
    log.info(f"Pipeline fertig in {time.time()-start:.1f}s")
    return df_dq
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "DQ-Prüfregeln definieren",
            instruction: "Definiere mindestens 4 DQ-Checks als neue Spalten: Name leer, Sonderzeichen vorhanden, führende/nachgestellte Leerzeichen, Doppelleerzeichen.",
            hint: "Jeder Check wird eine boolesche Spalte. In PySpark .cast('int') für 0/1."
          },
          {
            title: "DQ-Score berechnen",
            instruction: "Summiere alle Fehler-Spalten zu einem Gesamt-Score (dq_fehler_anzahl) und leite daraus einen Status 'OK' oder 'FEHLER' ab.",
            hint: "SAS: IF dq_fehler_anzahl = 0 THEN dq_status = 'OK'; ELSE dq_status = 'FEHLER'; / PySpark: F.when()"
          },
          {
            title: "Statistik ausgeben",
            instruction: "Gib eine Zusammenfassung aus: Gesamtanzahl, Anzahl Fehler pro Typ, Fehler-Prozentsatz. In SAS mit PROC FREQ, in PySpark mit groupBy().count().",
            hint: "PROC FREQ DATA=dq_pipeline; TABLES dq_status dq_name_sonderzeichen; RUN;"
          }
        ],
        sasStarter: `DATA dq_pipeline;
  SET kundendaten;

  /* DQ-Checks */
  dq_name_leer          = (name = '____');
  dq_name_sonderzeichen = (PRXMATCH('/[^a-zA-ZäöüÄÖÜß\\s\\-\\'\\.]/', STRIP(name)) > ____);
  dq_name_leerzeichen   = (name NE ____(name));
  dq_name_doppelspace   = (____(name, '  ') > 0);

  /* DQ-Score */
  dq_fehler_anzahl = dq_name_leer + dq_name_sonderzeichen
                   + dq_name_leerzeichen + dq_name_doppelspace;

  IF dq_fehler_anzahl = ____ THEN dq_status = 'OK';
  ELSE dq_status = '____';
RUN;

PROC FREQ DATA=dq_pipeline;
  TABLES dq_status dq_name_sonderzeichen dq_name_leer;
RUN;`,
        pysparkStarter: `from pyspark.sql import functions as F

REGEX = r"[^a-zA-ZäöüÄÖÜß\\s\\-'\\.]"

df_dq = kundendaten \\
    .withColumn("dq_leer",         F.col("name").isNull() | (F.____(F.col("name")) == "")) \\
    .withColumn("dq_sonderzeichen",F.col("name").rlike(____)) \\
    .withColumn("dq_leerzeichen",  F.col("name") != F.trim(F.col("name"))) \\
    .withColumn("dq_doppelspace",  F.col("name").rlike(r"  ")) \\
    .withColumn("dq_fehler",
        F.col("dq_leer").cast("____") + F.col("dq_sonderzeichen").cast("int") +
        F.col("dq_leerzeichen").cast("int") + F.col("dq_doppelspace").cast("int")) \\
    .withColumn("dq_status",
        F.when(F.col("dq_fehler") == 0, "OK").otherwise("____"))

df_dq.groupBy("____").count().show()
df_dq.groupBy("dq_sonderzeichen", "dq_leer").count().show()`,
        sasSolution: `DATA dq_pipeline;
  SET kundendaten;

  dq_name_leer          = (name = '');
  dq_name_sonderzeichen = (PRXMATCH('/[^a-zA-ZäöüÄÖÜß\\s\\-\\'\\.]/', STRIP(name)) > 0);
  dq_name_leerzeichen   = (name NE STRIP(name));
  dq_name_doppelspace   = (INDEX(name, '  ') > 0);

  dq_fehler_anzahl = dq_name_leer + dq_name_sonderzeichen
                   + dq_name_leerzeichen + dq_name_doppelspace;

  IF dq_fehler_anzahl = 0 THEN dq_status = 'OK';
  ELSE dq_status = 'FEHLER';
RUN;

PROC FREQ DATA=dq_pipeline;
  TABLES dq_status dq_name_sonderzeichen dq_name_leer;
RUN;`,
        pysparkSolution: `from pyspark.sql import functions as F

REGEX = r"[^a-zA-ZäöüÄÖÜß\\s\\-'\\.]"

df_dq = kundendaten \\
    .withColumn("dq_leer",         F.col("name").isNull() | (F.trim(F.col("name")) == "")) \\
    .withColumn("dq_sonderzeichen",F.col("name").rlike(REGEX)) \\
    .withColumn("dq_leerzeichen",  F.col("name") != F.trim(F.col("name"))) \\
    .withColumn("dq_doppelspace",  F.col("name").rlike(r"  ")) \\
    .withColumn("dq_fehler",
        F.col("dq_leer").cast("int") + F.col("dq_sonderzeichen").cast("int") +
        F.col("dq_leerzeichen").cast("int") + F.col("dq_doppelspace").cast("int")) \\
    .withColumn("dq_status",
        F.when(F.col("dq_fehler") == 0, "OK").otherwise("FEHLER"))

df_dq.groupBy("dq_status").count().show()
df_dq.groupBy("dq_sonderzeichen", "dq_leer").count().show()`,
        expectedOutput: `DQ-Status:
+---------+-----+
|dq_status|count|
+---------+-----+
|OK       |1250 |
|FEHLER   |87   |
+---------+-----+

Fehlertypen:
+-----------------+--------+-----+
|dq_sonderzeichen |dq_leer |count|
+-----------------+--------+-----+
|false            |false   |1250 |
|true             |false   |72   |
|false            |true    |15   |
+-----------------+--------+-----+`,
        hints: [
          "cast('int') wandelt Boolean in 0/1 um",
          "F.when().otherwise() wie IF-ELSE in PySpark",
          "Für Statistik: groupBy('dq_status').count()"
        ]
      }
    }
  ]
},

// ════════════════════════════════════════════════════════════════════════════
// M8 – ETL/ELT PIPELINES & FEHLERBEHANDLUNG
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m8",
  title: "ETL/ELT Pipelines & Fehlerbehandlung",
  icon: "🔄",
  lessons: [
    {
      id: "l8_1",
      title: "Pipeline-Design: SAP → Data Warehouse",
      theory: `
## ETL/ELT im Energiesektor

Bei Vattenfall fließen täglich Daten aus **SAP IS-U** (Kundensystem), **Zählermanagementsystemen** und **Marktkommunikation** in ein zentrales Data Warehouse. Ohne stabile Pipelines geht nichts.

---

## ETL vs. ELT

| Ansatz | Wann? | Vorteil |
|--------|-------|---------|
| **ETL** | SAS-basierte DWH | Transform vor dem Laden |
| **ELT** | Lakehouse/Spark | Rohdata laden, später transformieren |

---

## Pipeline-Struktur (Vattenfall-typisch)

\`\`\`
SAP IS-U
  ↓  (JDBC / Flat File)
Staging Layer   ← Rohdaten, unverändert
  ↓  (DQ-Checks)
Core Layer      ← Bereinigt, validiert
  ↓  (Business Rules)
Mart Layer      ← Aggregiert für Reports
\`\`\`

---

## SAS: Makro-gesteuerte ETL-Pipeline

\`\`\`sas
%MACRO run_etl(src=, tgt=, filter=);
  DATA work.valid work.rejected;
    SET &src;
    %IF &filter NE %STR() %THEN %DO;
      WHERE &filter;
    %END;
    IF MISSING(vertragsnr) OR MISSING(kundennr)
      THEN OUTPUT work.rejected;
      ELSE OUTPUT work.valid;
  RUN;
  PROC APPEND BASE=&tgt DATA=work.valid; RUN;
  %PUT INFO: Valid=%NOBS(work.valid) Rejected=%NOBS(work.rejected);
%MEND;
\`\`\`

## PySpark: Robuste ETL-Pipeline mit Fehlerbehandlung

\`\`\`python
def run_etl_pipeline(spark, src_table, tgt_table, filter_expr=None):
    try:
        df = spark.table(src_table)
        if filter_expr:
            df = df.filter(filter_expr)
        df = df.withColumn("load_ts", F.current_timestamp())

        df_valid    = df.filter(F.col("vertragsnr").isNotNull() &
                                F.col("kundennr").isNotNull())
        df_rejected = df.filter(F.col("vertragsnr").isNull() |
                                F.col("kundennr").isNull())

        if df_rejected.count() > 0:
            df_rejected.write.mode("append").saveAsTable("etl_rejects")

        df_valid.write.mode("append").saveAsTable(tgt_table)
    except Exception as e:
        print(f"ETL FEHLER: {e}")
        raise
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "Validierungslogik definieren",
            instruction: "Definiere die Regeln für valid vs. rejected: zaehler_id darf nicht NULL sein, verbrauch_kwh darf nicht NULL sein und muss >= 0 sein.",
            hint: "SAS: IF MISSING(zaehler_id) OR MISSING(verbrauch_kwh) OR verbrauch_kwh < 0 THEN OUTPUT rejected;"
          },
          {
            title: "Split in valid/rejected",
            instruction: "Trenne den Datensatz in zwei Ausgaben: work.valid und work.rejected. Lade work.valid in die Zieltabelle (PROC APPEND / .write.mode('append')).",
            hint: "SAS: Zwei OUTPUT-Statements mit verschiedenen Datensätzen / PySpark: zwei filter()-Aufrufe"
          },
          {
            title: "Statistik ausgeben",
            instruction: "Gib am Ende eine Statistik aus: Anzahl valid, Anzahl rejected. Logge bei rejected > 0 eine Warnung.",
            hint: "SAS: %PUT INFO: Valid=%NOBS(work.valid); / PySpark: print('Valid:', valid.count())"
          }
        ],
        sasStarter: `%MACRO etl_zaehler(src=, tgt=);
  %PUT INFO: Starte ETL &SYSDATE;

  DATA work.valid work.rejected;
    SET ____; /* Quelltabelle */
    IF MISSING(zaehler_id) OR ____(verbrauch_kwh) OR verbrauch_kwh < ____
      THEN OUTPUT work.____;
      ELSE OUTPUT work.____;
  RUN;

  PROC ____ BASE=&tgt DATA=work.valid; RUN;

  PROC SQL;
    SELECT 'Valid'    AS status, COUNT(*) AS anzahl FROM work.valid
    UNION ALL
    SELECT 'Rejected' AS status, COUNT(*) AS anzahl FROM work.rejected;
  QUIT;
%MEND;

%etl_zaehler(src=raw.zaehler_eingang, tgt=core.zaehler_clean);`,
        pysparkStarter: `from pyspark.sql import functions as F
import logging
log = logging.getLogger('ETL')

def etl_zaehler(spark, src, tgt):
    df = spark.table(____)

    valid    = df.filter(F.col('zaehler_id').____() &
                         F.col('verbrauch_kwh').isNotNull() &
                         (F.col('verbrauch_kwh') >= ____))
    rejected = df.____( valid)  /* Differenz */

    valid.write.mode('____').saveAsTable(tgt)

    print('Valid:   ', valid.count())
    print('Rejected:', rejected.count())

    if rejected.count() > 0:
        rejected.write.mode('append').saveAsTable('etl_rejects')
        log.warning(f'{rejected.count()} fehlerhafte Einträge')

etl_zaehler(spark, 'raw.zaehler_eingang', 'core.zaehler_clean')`,
        sasSolution: `%MACRO etl_zaehler(src=, tgt=);
  %PUT INFO: Starte ETL &SYSDATE;

  DATA work.valid work.rejected;
    SET &src;
    IF MISSING(zaehler_id) OR MISSING(verbrauch_kwh) OR verbrauch_kwh < 0
      THEN OUTPUT work.rejected;
      ELSE OUTPUT work.valid;
  RUN;

  PROC APPEND BASE=&tgt DATA=work.valid; RUN;

  PROC SQL;
    SELECT 'Valid'    AS status, COUNT(*) AS anzahl FROM work.valid
    UNION ALL
    SELECT 'Rejected' AS status, COUNT(*) AS anzahl FROM work.rejected;
  QUIT;
%MEND;

%etl_zaehler(src=raw.zaehler_eingang, tgt=core.zaehler_clean);`,
        pysparkSolution: `from pyspark.sql import functions as F
import logging
log = logging.getLogger('ETL')

def etl_zaehler(spark, src, tgt):
    df = spark.table(src)

    valid    = df.filter(F.col('zaehler_id').isNotNull() &
                         F.col('verbrauch_kwh').isNotNull() &
                         (F.col('verbrauch_kwh') >= 0))
    rejected = df.subtract(valid)

    valid.write.mode('append').saveAsTable(tgt)

    print('Valid:   ', valid.count())
    print('Rejected:', rejected.count())

    if rejected.count() > 0:
        rejected.write.mode('append').saveAsTable('etl_rejects')
        log.warning(f'{rejected.count()} fehlerhafte Einträge')

etl_zaehler(spark, 'raw.zaehler_eingang', 'core.zaehler_clean')`,
        expectedOutput: `INFO: Starte ETL 11MAR2026
Valid:    48234
Rejected: 123
WARNING: 123 fehlerhafte Einträge in etl_rejects gespeichert
ETL abgeschlossen.`,
        hints: [
          "MISSING() in SAS prüft auf fehlende Werte (NULL + leer)",
          "In PySpark: .isNotNull() & (F.col('x') >= 0) für kombinierte Checks",
          "PROC APPEND fügt Daten ohne Duplikat-Check hinzu — schnell für inkrementelle Loads"
        ]
      }
    },

    {
      id: "l8_2",
      title: "Inkrementelle Loads & Upserts (MERGE)",
      theory: `
## Das Problem: Täglich neue Daten

Vattenfall hat Millionen Kundendatensätze. Jeden Tag kommen neue Verträge dazu, bestehende werden geändert. Du kannst nicht jeden Tag alles neu laden.

**Lösung: Inkrementelle Loads mit MERGE/UPSERT**

---

## SAS: PROC SQL UPDATE + INSERT

\`\`\`sas
/* Schritt 1: Updates */
PROC SQL;
  UPDATE dwh.kunden_core AS t
  SET adresse = s.adresse, tarif = s.tarif
  FROM sap_delta AS s
  WHERE t.kundennr = s.kundennr;
QUIT;

/* Schritt 2: Neue Kunden einfügen */
PROC SQL;
  INSERT INTO dwh.kunden_core
  SELECT s.*
  FROM sap_delta AS s
  LEFT JOIN dwh.kunden_core AS t ON s.kundennr = t.kundennr
  WHERE t.kundennr IS NULL;
QUIT;
\`\`\`

## PySpark: MERGE INTO (Delta Lake)

\`\`\`python
from delta.tables import DeltaTable

kunden_core = DeltaTable.forName(spark, "dwh.kunden_core")
sap_delta   = spark.table("sap_raw.kunden_delta")

kunden_core.alias("ziel").merge(
    sap_delta.alias("quelle"),
    "ziel.kundennr = quelle.kundennr"
).whenMatchedUpdate(values={
    "adresse":      "quelle.adresse",
    "tarif":        "quelle.tarif",
    "geaendert_am": "quelle.geaendert_am"
}).whenNotMatchedInsertAll() \\
.execute()
\`\`\`

## Inkrementelle Load-Strategie: Wasserzeichen

\`\`\`python
def get_watermark(spark, tabelle):
    row = spark.sql(f"""
        SELECT MAX(load_ts) as wm FROM etl_run_log
        WHERE target_table = '{tabelle}' AND status = 'OK'
    """).first()
    return row.wm or "1900-01-01"
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "Updates für bestehende Kunden",
            instruction: "Aktualisiere den Tarif bestehender Kunden aus der Tabelle tarif_updates. Matche über kundennr.",
            hint: "SAS: UPDATE ... SET ... FROM ... WHERE ... / PySpark: MERGE ... whenMatchedUpdate()"
          },
          {
            title: "Neue Kunden einfügen",
            instruction: "Füge Kunden aus tarif_updates ein, die noch nicht in kunden_core existieren. Nutze einen LEFT JOIN mit NULL-Check.",
            hint: "SAS: INSERT INTO ... SELECT ... WHERE t.kundennr IS NULL / PySpark: whenNotMatchedInsert()"
          },
          {
            title: "Statistik aus MERGE-History",
            instruction: "Lies nach dem MERGE die Operationsmetriken aus (numUpdatedRows, numInsertedRows). In SAS: %NOBS().",
            hint: "PySpark: kunden.history(1).select('operationMetrics').show()"
          }
        ],
        sasStarter: `/* Schritt 1: Bestehende updaten */
PROC SQL;
  UPDATE dwh.kunden_core AS t
  SET tarif    = s.neuer_tarif,
      tarif_ab = s.gueltig_ab
  FROM tarif_updates AS ____
  WHERE t.____ = s.kundennr;
QUIT;

/* Schritt 2: Neue einfügen */
PROC SQL;
  INSERT INTO dwh.kunden_core
  SELECT s.kundennr, s.neuer_tarif AS tarif, s.gueltig_ab AS tarif_ab
  FROM tarif_updates AS s
  WHERE s.kundennr ____ IN (SELECT kundennr FROM dwh.kunden_core);
QUIT;

%PUT Upsert abgeschlossen: %NOBS(dwh.kunden_core) Kunden total;`,
        pysparkStarter: `from delta.tables import DeltaTable

kunden = DeltaTable.forName(spark, 'dwh.kunden_core')
tarif_updates = spark.table('tarif_updates')

kunden.alias('ziel').merge(
    tarif_updates.alias('neu'),
    'ziel.____ = neu.kundennr'
).____MatchedUpdate(values={
    'tarif':    'neu.neuer_tarif',
    'tarif_ab': 'neu.gueltig_ab'
}).____NotMatchedInsert(values={
    'kundennr': 'neu.kundennr',
    'tarif':    'neu.neuer_tarif',
    'tarif_ab': 'neu.gueltig_ab'
}).execute()

print('Fertig:', kunden.history(1).select('operationMetrics').first()[0])`,
        sasSolution: `/* Schritt 1: Bestehende updaten */
PROC SQL;
  UPDATE dwh.kunden_core AS t
  SET tarif    = s.neuer_tarif,
      tarif_ab = s.gueltig_ab
  FROM tarif_updates AS s
  WHERE t.kundennr = s.kundennr;
QUIT;

/* Schritt 2: Neue einfügen */
PROC SQL;
  INSERT INTO dwh.kunden_core
  SELECT s.kundennr, s.neuer_tarif AS tarif, s.gueltig_ab AS tarif_ab
  FROM tarif_updates AS s
  WHERE s.kundennr NOT IN (SELECT kundennr FROM dwh.kunden_core);
QUIT;

%PUT Upsert abgeschlossen: %NOBS(dwh.kunden_core) Kunden total;`,
        pysparkSolution: `from delta.tables import DeltaTable

kunden = DeltaTable.forName(spark, 'dwh.kunden_core')
tarif_updates = spark.table('tarif_updates')

kunden.alias('ziel').merge(
    tarif_updates.alias('neu'),
    'ziel.kundennr = neu.kundennr'
).whenMatchedUpdate(values={
    'tarif':    'neu.neuer_tarif',
    'tarif_ab': 'neu.gueltig_ab'
}).whenNotMatchedInsert(values={
    'kundennr': 'neu.kundennr',
    'tarif':    'neu.neuer_tarif',
    'tarif_ab': 'neu.gueltig_ab'
}).execute()

print('Fertig:', kunden.history(1).select('operationMetrics').first()[0])`,
        expectedOutput: `MERGE-Ergebnis:
numUpdatedRows: 142
numInsertedRows: 37
numDeletedRows: 0
executionTimeMs: 1823`,
        hints: [
          "NOT IN ist bei großen Tabellen langsam — besser LEFT JOIN WHERE NULL",
          "DeltaTable.forName() funktioniert nur mit Delta Lake (z.B. Databricks)",
          "whenNotMatchedInsertAll() kopiert alle Spalten automatisch"
        ]
      }
    }
  ]
},

// ════════════════════════════════════════════════════════════════════════════
// M9 – SCD TYP 2 & HISTORISIERUNG
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m9",
  title: "SCD Typ 2 & Historisierung",
  icon: "📅",
  lessons: [
    {
      id: "l9_1",
      title: "Slowly Changing Dimensions: Tarifhistorie",
      theory: `
## Warum SCD? Das Vattenfall-Problem

Ein Kunde wechselt am 1. März von Tarif A zu Tarif B. Du willst für Januar die Rechnung mit Tarif A berechnen, für April mit Tarif B. Ohne Historisierung ist der alte Tarif weg.

**SCD Typ 2 löst das:** Jede Änderung erzeugt eine neue Zeile mit Gültigkeitszeitraum.

---

## Die 3 SCD-Typen

| Typ | Strategie | Wann? |
|-----|-----------|-------|
| **Typ 1** | Überschreiben | Tippfehler-Korrektur |
| **Typ 2** | Neue Zeile | Tarif-, Adressänderung |
| **Typ 3** | Neue Spalte | Nur "vorheriger Wert" |

---

## SCD Typ 2 – Tabellenstruktur

\`\`\`
kundennr | tarif   | gueltig_von | gueltig_bis | is_aktuell
---------|---------|-------------|-------------|----------
K001     | Basis   | 2023-01-01  | 2025-02-28  | 0
K001     | Premium | 2025-03-01  | 9999-12-31  | 1  ← aktuell
K002     | Öko     | 2024-06-01  | 9999-12-31  | 1
\`\`\`

Das Datum \`9999-12-31\` bedeutet "noch gültig" — Standard in DWH.

---

## SAS: SCD Typ 2 implementieren

\`\`\`sas
/* Schritt 1: Geänderte Datensätze finden */
PROC SQL;
  CREATE TABLE work.geaendert AS
  SELECT n.kundennr, n.tarif AS neuer_tarif, n.gueltig_ab
  FROM sap_delta AS n
  INNER JOIN dwh.kunden_scd2 AS a
    ON n.kundennr = a.kundennr AND a.is_aktuell = 1
  WHERE n.tarif NE a.tarif;
QUIT;

/* Schritt 2: Alten Record schließen */
PROC SQL;
  UPDATE dwh.kunden_scd2
  SET gueltig_bis = INTNX('DAY', geaendert.neues_datum, -1, 'B'),
      is_aktuell  = 0
  FROM work.geaendert
  WHERE kunden_scd2.kundennr = geaendert.kundennr
    AND kunden_scd2.is_aktuell = 1;
QUIT;

/* Schritt 3: Neuen Record einfügen */
PROC SQL;
  INSERT INTO dwh.kunden_scd2
  SELECT kundennr, neuer_tarif AS tarif,
         neues_datum AS gueltig_von, '31DEC9999'd AS gueltig_bis, 1 AS is_aktuell
  FROM work.geaendert;
QUIT;
\`\`\`

## PySpark + Delta: SCD Typ 2 mit MERGE

\`\`\`python
from delta.tables import DeltaTable
from pyspark.sql import functions as F

kunden_scd2 = DeltaTable.forName(spark, "dwh.kunden_scd2")

# Schritt 1: Alte Records schließen
kunden_scd2.alias("scd").merge(
    aenderungen.alias("neu"),
    "scd.kundennr = neu.kundennr AND scd.is_aktuell = 1"
).whenMatchedUpdate(values={
    "gueltig_bis": F.date_sub(F.col("neu.gueltig_ab"), 1),
    "is_aktuell":  F.lit(0)
}).execute()

# Schritt 2: Neue Records einfügen
neue_zeilen.write.mode("append").saveAsTable("dwh.kunden_scd2")
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "Geänderte Tarife identifizieren",
            instruction: "Finde alle Kunden in adress_updates, bei denen sich die Adresse im Vergleich zum aktuellen Record (is_aktuell=1) geändert hat.",
            hint: "SAS: INNER JOIN auf kundennr UND is_aktuell=1, dann WHERE neue_adresse NE alte_adresse"
          },
          {
            title: "Alte Records schließen",
            instruction: "Setze gueltig_bis auf den Tag vor dem neuen gueltig_ab und setze is_aktuell=0 für die betroffenen Records.",
            hint: "SAS: INTNX('DAY', datum, -1) / PySpark: F.date_sub(F.col('datum'), 1)"
          },
          {
            title: "Neue Records einfügen",
            instruction: "Füge für jede Änderung einen neuen Record mit gueltig_von=neues Datum, gueltig_bis='9999-12-31', is_aktuell=1 ein.",
            hint: "SAS: INSERT INTO ... SELECT ... / PySpark: .write.mode('append').saveAsTable()"
          }
        ],
        sasStarter: `/* SCD2 Adressänderungen */

/* 1. Alte Records schließen */
PROC SQL;
  UPDATE dwh.kunden_adressen_scd2 AS t
  SET gueltig_bis = INTNX('DAY', s.____, -1, 'B'),
      is_aktuell  = ____
  FROM adress_updates AS s
  WHERE t.kundennr = s.kundennr
    AND t.____ = 1;
QUIT;

/* 2. Neue Records einfügen */
PROC SQL;
  INSERT INTO dwh.kunden_adressen_scd2
  SELECT
    kundennr, neue_adresse AS adresse,
    ____ AS gueltig_von,
    '31DEC9999'd AS gueltig_bis,
    1 AS is_aktuell
  FROM adress_updates;
QUIT;

/* 3. Aktuelle Adressen anzeigen */
PROC SQL;
  SELECT * FROM dwh.kunden_adressen_scd2
  WHERE ____ = 1;
QUIT;`,
        pysparkStarter: `from delta.tables import DeltaTable
from pyspark.sql import functions as F

adressen = DeltaTable.forName(spark, 'dwh.kunden_adressen_scd2')
updates  = spark.table('adress_updates')

# 1. Alte Records schließen
adressen.alias('t').merge(
    updates.alias('s'),
    't.kundennr = s.kundennr AND t.is_aktuell = ____'
).whenMatchedUpdate(values={
    'gueltig_bis': F.____(F.col('s.gueltig_ab'), 1),
    'is_aktuell':  F.lit(____)
}).execute()

# 2. Neue Records einfügen
neu = updates.select(
    'kundennr',
    F.col('neue_adresse').alias('adresse'),
    F.col('____').alias('gueltig_von'),
    F.lit('9999-12-31').cast('date').alias('gueltig_bis'),
    F.lit(1).alias('is_aktuell')
)
neu.write.mode('____').saveAsTable('dwh.kunden_adressen_scd2')

print('Aktuelle Adressen:', adressen.toDF().filter('is_aktuell=1').count())`,
        sasSolution: `/* SCD2 Adressänderungen */

/* 1. Alte Records schließen */
PROC SQL;
  UPDATE dwh.kunden_adressen_scd2 AS t
  SET gueltig_bis = INTNX('DAY', s.gueltig_ab, -1, 'B'),
      is_aktuell  = 0
  FROM adress_updates AS s
  WHERE t.kundennr = s.kundennr
    AND t.is_aktuell = 1;
QUIT;

/* 2. Neue Records einfügen */
PROC SQL;
  INSERT INTO dwh.kunden_adressen_scd2
  SELECT
    kundennr, neue_adresse AS adresse,
    gueltig_ab AS gueltig_von,
    '31DEC9999'd AS gueltig_bis,
    1 AS is_aktuell
  FROM adress_updates;
QUIT;

/* 3. Aktuelle Adressen anzeigen */
PROC SQL;
  SELECT * FROM dwh.kunden_adressen_scd2
  WHERE is_aktuell = 1;
QUIT;`,
        pysparkSolution: `from delta.tables import DeltaTable
from pyspark.sql import functions as F

adressen = DeltaTable.forName(spark, 'dwh.kunden_adressen_scd2')
updates  = spark.table('adress_updates')

# 1. Alte Records schließen
adressen.alias('t').merge(
    updates.alias('s'),
    't.kundennr = s.kundennr AND t.is_aktuell = 1'
).whenMatchedUpdate(values={
    'gueltig_bis': F.date_sub(F.col('s.gueltig_ab'), 1),
    'is_aktuell':  F.lit(0)
}).execute()

# 2. Neue Records einfügen
neu = updates.select(
    'kundennr',
    F.col('neue_adresse').alias('adresse'),
    F.col('gueltig_ab').alias('gueltig_von'),
    F.lit('9999-12-31').cast('date').alias('gueltig_bis'),
    F.lit(1).alias('is_aktuell')
)
neu.write.mode('append').saveAsTable('dwh.kunden_adressen_scd2')

print('Aktuelle Adressen:', adressen.toDF().filter('is_aktuell=1').count())`,
        expectedOutput: `SCD2 Update abgeschlossen:
Geschlossene Records:  48  (is_aktuell: 1→0)
Neue Records:          48  (is_aktuell: 1)
Aktuelle Adressen:  12.483

Beispiel K001:
+-------+------------------+------------+------------+-----------+
|knr    |adresse           |gueltig_von |gueltig_bis |is_aktuell |
+-------+------------------+------------+------------+-----------+
|K001   |Musterstr. 1      |2023-01-01  |2026-02-28  |0          |
|K001   |Hauptstr. 42      |2026-03-01  |9999-12-31  |1          |
+-------+------------------+------------+------------+-----------+`,
        hints: [
          "INTNX('DAY', datum, -1) berechnet den Vortag in SAS",
          "date_sub(col, 1) macht dasselbe in PySpark",
          "is_aktuell = 1 als Filter ist schneller als MAX(gueltig_von)"
        ]
      }
    }
  ]
},

// ════════════════════════════════════════════════════════════════════════════
// M10 – ZEITREIHENDATEN & SMART METER
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m10",
  title: "Zeitreihendaten & Smart Meter",
  icon: "⚡",
  lessons: [
    {
      id: "l10_1",
      title: "15-Minuten-Zählerdaten verarbeiten",
      theory: `
## Smart Meter im Energiesektor

Vattenfall hat Millionen von Smart Metern. Jeder sendet alle **15 Minuten** einen Zählerstand — das sind **96 Werte pro Tag, pro Zähler**. Bei 500.000 Zählern = **48 Millionen Zeilen täglich**.

---

## Typische Datenstruktur

\`\`\`
zaehler_id | messzeitpunkt    | verbrauch_kwh | qualitaet
-----------|------------------|---------------|----------
Z001       | 2025-01-01 00:00 | 0.42          | OK
Z001       | 2025-01-01 00:15 | 0.38          | OK
Z001       | 2025-01-01 00:30 | NULL          | MISSING
Z001       | 2025-01-01 00:45 | 0.51          | OK
\`\`\`

---

## SAS: Zeitreihen aggregieren

\`\`\`sas
PROC SQL;
  CREATE TABLE tages_verbrauch AS
  SELECT
    zaehler_id,
    DATEPART(messzeitpunkt)     AS messtag FORMAT=DATE9.,
    COUNT(*)                    AS messungen_gesamt,
    SUM(verbrauch_kwh)          AS verbrauch_kwh_tag,
    ROUND(
      COUNT(verbrauch_kwh) / 96 * 100, 1
    ) AS vollstaendigkeit_pct
  FROM raw.zaehler_15min
  GROUP BY zaehler_id, DATEPART(messzeitpunkt)
  ORDER BY verbrauch_kwh_tag DESC;
QUIT;
\`\`\`

## PySpark: Smart Meter Aggregation

\`\`\`python
tages_verbrauch = spark.table("raw.zaehler_15min") \\
    .withColumn("messtag", F.to_date("messzeitpunkt")) \\
    .groupBy("zaehler_id", "messtag") \\
    .agg(
        F.count("*").alias("messungen"),
        F.sum("verbrauch_kwh").alias("verbrauch_kwh_tag"),
        F.count("verbrauch_kwh").alias("valide"),
        F.round(F.count("verbrauch_kwh") / F.count("*") * 100, 1)
         .alias("vollstaendigkeit_pct")
    )
\`\`\`

## Forward Fill (fehlende Werte)

\`\`\`python
from pyspark.sql.window import Window
w = Window.partitionBy("zaehler_id").orderBy("messzeitpunkt") \\
          .rowsBetween(Window.unboundedPreceding, Window.currentRow)

df_filled = df.withColumn("verbrauch_filled",
    F.last("verbrauch_kwh", ignorenulls=True).over(w))
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "Tagessummen berechnen",
            instruction: "Berechne pro Zähler und Tag: Gesamtverbrauch, Anzahl Messungen gesamt, Anzahl valider Messungen (nicht NULL) und die Vollständigkeitsrate in Prozent.",
            hint: "COUNT(spalte) zählt nur nicht-NULL Werte — ideal für Vollständigkeitsrate. 96 Messungen = ein vollständiger Tag."
          },
          {
            title: "Vollständigkeitsrate berechnen",
            instruction: "Vollständigkeitsrate = valide_messungen / 96 * 100. Runde auf 1 Nachkommastelle.",
            hint: "SAS: ROUND(COUNT(verbrauch_kwh)/96*100, 1) / PySpark: F.round(F.count('verbrauch_kwh') / F.count('*') * 100, 1)"
          },
          {
            title: "Top 5 Zähler finden",
            instruction: "Finde die 5 Zähler mit dem höchsten Gesamtverbrauch. Nutze ORDER BY DESC + LIMIT in SAS (OUTOBS) bzw. .limit() in PySpark.",
            hint: "PROC SQL OUTOBS=5 ... ORDER BY gesamt DESC; / PySpark: .orderBy(desc('gesamt')).limit(5)"
          }
        ],
        sasStarter: `PROC SQL;
  CREATE TABLE wochen_analyse AS
  SELECT
    zaehler_id,
    ____(messzeitpunkt)          AS messtag FORMAT=DATE9.,
    COUNT(*)                     AS messungen_gesamt,
    SUM(verbrauch_kwh)           AS verbrauch_kwh_gesamt,
    COUNT(____)                  AS valide_messungen,
    ROUND(COUNT(verbrauch_kwh) / ____ * 100, 1) AS vollstaendigkeit_pct
  FROM raw.zaehler_15min
  GROUP BY zaehler_id, DATEPART(messzeitpunkt)
  ORDER BY verbrauch_kwh_gesamt DESC;
QUIT;

/* Top 5 Zähler */
PROC SQL OUTOBS=____;
  SELECT zaehler_id, SUM(verbrauch_kwh_gesamt) AS gesamt
  FROM wochen_analyse
  GROUP BY zaehler_id
  ORDER BY gesamt ____;
QUIT;`,
        pysparkStarter: `from pyspark.sql import functions as F

df = spark.table('raw.zaehler_15min')

wochen = df \\
    .withColumn('messtag', F.____(  'messzeitpunkt')) \\
    .groupBy('zaehler_id', 'messtag') \\
    .agg(
        F.sum('verbrauch_kwh').alias('verbrauch_gesamt'),
        F.count('*').alias('messungen'),
        F.count('verbrauch_kwh').alias('valide'),
        F.round(F.count('verbrauch_kwh') / F.count('*') * 100, 1)
         .alias('vollstaendigkeit_pct')
    )

# Top 5
wochen.groupBy('zaehler_id') \\
    .agg(F.sum('verbrauch_gesamt').alias('gesamt')) \\
    .orderBy(F.____('gesamt')) \\
    .limit(____) \\
    .show()`,
        sasSolution: `PROC SQL;
  CREATE TABLE wochen_analyse AS
  SELECT
    zaehler_id,
    DATEPART(messzeitpunkt)      AS messtag FORMAT=DATE9.,
    COUNT(*)                     AS messungen_gesamt,
    SUM(verbrauch_kwh)           AS verbrauch_kwh_gesamt,
    COUNT(verbrauch_kwh)         AS valide_messungen,
    ROUND(COUNT(verbrauch_kwh) / 96 * 100, 1) AS vollstaendigkeit_pct
  FROM raw.zaehler_15min
  GROUP BY zaehler_id, DATEPART(messzeitpunkt)
  ORDER BY verbrauch_kwh_gesamt DESC;
QUIT;

/* Top 5 Zähler */
PROC SQL OUTOBS=5;
  SELECT zaehler_id, SUM(verbrauch_kwh_gesamt) AS gesamt
  FROM wochen_analyse
  GROUP BY zaehler_id
  ORDER BY gesamt DESC;
QUIT;`,
        pysparkSolution: `from pyspark.sql import functions as F

df = spark.table('raw.zaehler_15min')

wochen = df \\
    .withColumn('messtag', F.to_date('messzeitpunkt')) \\
    .groupBy('zaehler_id', 'messtag') \\
    .agg(
        F.sum('verbrauch_kwh').alias('verbrauch_gesamt'),
        F.count('*').alias('messungen'),
        F.count('verbrauch_kwh').alias('valide'),
        F.round(F.count('verbrauch_kwh') / F.count('*') * 100, 1)
         .alias('vollstaendigkeit_pct')
    )

# Top 5
wochen.groupBy('zaehler_id') \\
    .agg(F.sum('verbrauch_gesamt').alias('gesamt')) \\
    .orderBy(F.desc('gesamt')) \\
    .limit(5) \\
    .show()`,
        expectedOutput: `Top 5 Zähler nach Verbrauch:
+-----------+---------+
|zaehler_id |gesamt   |
+-----------+---------+
|Z00142     |1248.92  |
|Z00087     |1203.41  |
|Z00234     |1187.66  |
|Z00019     |1145.23  |
|Z00301     |1098.77  |
+-----------+---------+

Vollständigkeitsrate Beispiel:
+-----------+----------+----------+---------+--------------------+
|zaehler_id |messtag   |messungen |valide   |vollstaendigkeit_pct|
+-----------+----------+----------+---------+--------------------+
|Z001       |2025-01-01|96        |94       |97.9                |
+-----------+----------+----------+---------+--------------------+`,
        hints: [
          "WEEK() in SAS und weekofyear() in PySpark geben die Kalenderwoche zurück",
          "COUNT(spalte) zählt nur nicht-NULL Werte — nutze das für Vollständigkeitsrate",
          "PROC SQL OUTOBS=5 begrenzt Output in SAS; .limit(5) in PySpark"
        ]
      }
    }
  ]
},

// ════════════════════════════════════════════════════════════════════════════
// M11 – VOLLSTÄNDIGES DQ-FRAMEWORK
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m11",
  title: "Vollständiges DQ-Framework",
  icon: "🛡️",
  lessons: [
    {
      id: "l11_1",
      title: "Duplikate, Nullwerte & Konsistenz",
      theory: `
## Enterprise Data Quality: Die 6 Dimensionen

Für regulierte Unternehmen wie Vattenfall reicht es nicht, nur Namen zu prüfen. Ein vollständiges DQ-Framework prüft 6 Dimensionen:

| Dimension | Frage | Beispiel |
|-----------|-------|---------|
| **Vollständigkeit** | Fehlende Werte? | kundennr IS NULL |
| **Eindeutigkeit** | Duplikate? | gleiche kundennr 2x |
| **Gültigkeit** | Format/Range korrekt? | PLZ 5-stellig? |
| **Konsistenz** | Widersprüche? | gueltig_bis < gueltig_von |
| **Aktualität** | Zu alt? | Adresse > 5 Jahre unverändert |
| **Referenzintegrität** | FK vorhanden? | kundennr in Vertragstabelle? |

---

## SAS: Vollständiges DQ-Framework

\`\`\`sas
%MACRO dq_check(ds=, out_report=dq_report);
  DATA work.dq_ergebnisse;
    SET &ds;

    /* Vollständigkeit */
    dq_null_kundennr  = MISSING(kundennr);
    dq_null_name      = MISSING(name);

    /* Gültigkeit */
    dq_plz_format     = (NOT PRXMATCH('/^\\d{5}$/', STRIP(plz)));
    dq_tarif_ungueltig= (tarif NOT IN ('Basis','Premium','Öko','Smart'));
    dq_verbrauch_neg  = (jahresverbrauch < 0);

    /* Konsistenz */
    dq_datum_fehler   = (vertrag_ende < vertrag_start AND NOT MISSING(vertrag_ende));

    /* Gesamt-Score */
    dq_fehler_anzahl = dq_null_kundennr + dq_null_name + dq_plz_format
                     + dq_tarif_ungueltig + dq_verbrauch_neg + dq_datum_fehler;
    dq_klasse = IFC(dq_fehler_anzahl = 0, 'GRÜN',
                IFC(dq_fehler_anzahl <= 2, 'GELB', 'ROT'));
  RUN;
%MEND;
\`\`\`

## PySpark: DQ-Framework

\`\`\`python
from pyspark.sql import functions as F
from pyspark.sql.window import Window

def run_dq(df):
    # Vollständigkeit
    df = df \\
        .withColumn("dq_null_kundennr", F.col("kundennr").isNull().cast("int")) \\
        .withColumn("dq_null_name",     F.col("name").isNull().cast("int"))

    # Gültigkeit
    df = df \\
        .withColumn("dq_plz",    (~F.col("plz").rlike(r"^\\d{5}$")).cast("int")) \\
        .withColumn("dq_tarif",  (~F.col("tarif").isin("Basis","Premium","Öko","Smart")).cast("int"))

    # Duplikate via Window
    w = Window.partitionBy("kundennr")
    df = df.withColumn("dq_duplikat", (F.count("*").over(w) > 1).cast("int"))

    # Score
    dq_cols = ["dq_null_kundennr","dq_null_name","dq_plz","dq_tarif","dq_duplikat"]
    df = df.withColumn("dq_fehler", sum(F.col(c) for c in dq_cols)) \\
           .withColumn("dq_klasse",
               F.when(F.col("dq_fehler") == 0, "GRÜN")
                .when(F.col("dq_fehler") <= 2,  "GELB")
                .otherwise("ROT"))
    return df
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "Gültigkeitsprüfungen hinzufügen",
            instruction: "Prüfe: PLZ muss 5 Stellen haben (Regex ^\\d{5}$), tarif muss in ('Basis','Premium','Öko') sein, vertrag_ende darf nicht vor vertrag_start liegen.",
            hint: "SAS: NOT PRXMATCH('/^\\d{5}$/', plz) > 0 / PySpark: ~F.col('plz').rlike(r'^\\d{5}$')"
          },
          {
            title: "DQ-Score & Klasse berechnen",
            instruction: "Summiere alle Fehler-Flags zu dq_fehler und berechne dq_klasse: 0 Fehler = GRÜN, 1-2 = GELB, >2 = ROT.",
            hint: "SAS: IFC(dq_fehler=0,'GRÜN',IFC(dq_fehler<=1,'GELB','ROT')) / PySpark: F.when().when().otherwise()"
          },
          {
            title: "Report ausgeben",
            instruction: "Erstelle einen gruppierten Report: Anzahl Datensätze pro dq_klasse, und Häufigkeit jedes Fehlertyps.",
            hint: "PROC FREQ DATA=dq_vertrag; TABLES dq_klasse dq_tarif dq_datum; RUN;"
          }
        ],
        sasStarter: `DATA dq_vertrag;
  SET dwh.vertraege;

  /* Vollständigkeit */
  dq_null_vnr  = MISSING(____);
  dq_null_knr  = MISSING(____);

  /* Konsistenz */
  dq_datum = (NOT MISSING(vertrag_ende) AND vertrag_ende ____ vertrag_start);

  /* Gültigkeit */
  dq_tarif = (tarif NOT IN ('Basis','Premium','____'));

  /* Score */
  dq_fehler = dq_null_vnr + dq_null_knr + ____ + dq_tarif;
  dq_klasse = IFC(dq_fehler = 0, 'GRÜN',
              IFC(dq_fehler <= 1, 'GELB', '____'));
RUN;

PROC FREQ DATA=dq_vertrag;
  TABLES dq_klasse dq_tarif ____;
RUN;`,
        pysparkStarter: `from pyspark.sql import functions as F

df = spark.table('dwh.vertraege')

df_dq = df \\
    .withColumn('dq_null_vnr', F.col('____').isNull().cast('int')) \\
    .withColumn('dq_null_knr', F.col('kundennr').isNull().cast('int')) \\
    .withColumn('dq_datum',
        (F.col('vertrag_ende').isNotNull() &
         (F.col('vertrag_ende') ____ F.col('vertrag_start'))).cast('int')) \\
    .withColumn('dq_tarif',
        (~F.col('tarif').isin('Basis','Premium','____')).cast('int')) \\
    .withColumn('dq_fehler',
        F.col('dq_null_vnr') + F.col('dq_null_knr') +
        F.col('____') + F.col('dq_tarif')) \\
    .withColumn('dq_klasse',
        F.when(F.col('dq_fehler') == 0, 'GRÜN')
         .when(F.col('dq_fehler') <= 1, '____')
         .otherwise('ROT'))

df_dq.groupBy('dq_klasse').count().orderBy('dq_klasse').show()`,
        sasSolution: `DATA dq_vertrag;
  SET dwh.vertraege;

  dq_null_vnr  = MISSING(vertragsnr);
  dq_null_knr  = MISSING(kundennr);
  dq_datum = (NOT MISSING(vertrag_ende) AND vertrag_ende < vertrag_start);
  dq_tarif = (tarif NOT IN ('Basis','Premium','Öko'));

  dq_fehler = dq_null_vnr + dq_null_knr + dq_datum + dq_tarif;
  dq_klasse = IFC(dq_fehler = 0, 'GRÜN',
              IFC(dq_fehler <= 1, 'GELB', 'ROT'));
RUN;

PROC FREQ DATA=dq_vertrag;
  TABLES dq_klasse dq_tarif dq_datum;
RUN;`,
        pysparkSolution: `from pyspark.sql import functions as F

df = spark.table('dwh.vertraege')

df_dq = df \\
    .withColumn('dq_null_vnr', F.col('vertragsnr').isNull().cast('int')) \\
    .withColumn('dq_null_knr', F.col('kundennr').isNull().cast('int')) \\
    .withColumn('dq_datum',
        (F.col('vertrag_ende').isNotNull() &
         (F.col('vertrag_ende') < F.col('vertrag_start'))).cast('int')) \\
    .withColumn('dq_tarif',
        (~F.col('tarif').isin('Basis','Premium','Öko')).cast('int')) \\
    .withColumn('dq_fehler',
        F.col('dq_null_vnr') + F.col('dq_null_knr') +
        F.col('dq_datum') + F.col('dq_tarif')) \\
    .withColumn('dq_klasse',
        F.when(F.col('dq_fehler') == 0, 'GRÜN')
         .when(F.col('dq_fehler') <= 1, 'GELB')
         .otherwise('ROT'))

df_dq.groupBy('dq_klasse').count().orderBy('dq_klasse').show()`,
        expectedOutput: `DQ-Klassen:
+---------+------+
|dq_klasse|count |
+---------+------+
|GRÜN     |11823 |
|GELB     |412   |
|ROT      |87    |
+---------+------+

Fehlertypen:
dq_tarif = 1: 312 (2.5%)
dq_datum = 1: 87  (0.7%)
dq_null_vnr = 1: 15 (0.1%)`,
        hints: [
          "IFC(bedingung, wahr, falsch) ist SAS-Äquivalent zu IF-ELSE in einer Zuweisung",
          "F.col().isin() mit ~ (NOT) für 'nicht in Liste'",
          "Cast zu 'int' wandelt True/False in 1/0 um — damit kann man summieren"
        ]
      }
    }
  ]
},

// ════════════════════════════════════════════════════════════════════════════
// M12 – REGULATORISCHE COMPLIANCE & AUDIT
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m12",
  title: "Regulatorische Compliance & Audit",
  icon: "⚖️",
  lessons: [
    {
      id: "l12_1",
      title: "GDPR, Datenmaskierung & Audit Trails",
      theory: `
## Compliance im Energiesektor

Vattenfall verarbeitet hochsensible Daten: Stromverbrauch zeigt wann jemand zuhause ist, Kundendaten sind DSGVO-pflichtig, und die Bundesnetzagentur kann Audits verlangen.

---

## Die wichtigsten Compliance-Anforderungen

| Regelwerk | Was wird verlangt? |
|-----------|-------------------|
| **DSGVO/GDPR** | Datenlöschung, Auskunft, Pseudonymisierung |
| **Bundesnetzagentur** | Messdaten 6 Jahre aufbewahren |
| **SOX** | Änderungs-Audit-Trail |
| **ISO 27001** | Zugriffskontrolle, Logging |

---

## SAS: Datenmaskierung & Pseudonymisierung

\`\`\`sas
DATA dwh.kunden_pseudonym;
  SET dwh.kundenstamm;

  /* Name maskieren: Mueller → *****er */
  name_maskiert = REPEAT('*', LENGTH(STRIP(name)) - 2)
                  || SUBSTR(STRIP(name), LENGTH(STRIP(name))-1, 2);

  /* Email: nur Domain behalten */
  IF INDEX(email, '@') > 0 THEN
    email_maskiert = '***@' || SCAN(email, 2, '@');

  /* Geburtsdatum: nur Jahr */
  geburtsjahr = YEAR(geburtsdatum);

  DROP name email geburtsdatum;
RUN;

/* DSGVO Art. 17: Löschung */
%MACRO loeschung(kundennr=);
  PROC SQL;
    UPDATE dwh.kundenstamm
    SET name='ANONYM', email='geloescht@dsgvo.de',
        geloescht_am=TODAY(), loeschgrund='DSGVO Art. 17'
    WHERE kundennr = "&kundennr";
  QUIT;
  %PUT AUDIT: Löschung &kundennr am &SYSDATE;
%MEND;
\`\`\`

## PySpark: Column-Level Masking & Audit

\`\`\`python
from pyspark.sql import functions as F

df_maskiert = spark.table("dwh.kundenstamm") \\
    .withColumn("name",
        F.concat(F.substring("name", 1, 2),
                 F.regexp_replace("name", r".", "*").substr(3, 100))) \\
    .withColumn("email",
        F.concat(F.lit("***@"), F.split("email", "@").getItem(1))) \\
    .withColumn("plz",
        F.concat(F.substring("plz", 1, 2), F.lit("***"))) \\
    .withColumn("maskiert_am", F.current_date())
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "Namen maskieren",
            instruction: "Maskiere Namen so: erste 2 Zeichen behalten, Rest durch '*' ersetzen. 'Mueller' → 'Mu***'. SAS: SUBSTR + REPEAT, PySpark: F.substring + F.regexp_replace.",
            hint: "SAS: SUBSTR(name,1,2) || REPEAT('*', MAX(LENGTH(STRIP(name))-2, 0))"
          },
          {
            title: "Email und PLZ maskieren",
            instruction: "Email: nur Domain behalten ('***@vattenfall.de'). PLZ: nur erste 2 Stellen behalten ('20***').",
            hint: "SAS: SCAN(email, -1, '@') gibt letzten Teil nach '@' zurück / PySpark: F.split().getItem(1)"
          },
          {
            title: "Audit-Eintrag erstellen",
            instruction: "Füge Metadaten hinzu: maskiert_am (Datum heute), maskiert_von (aktueller User/Prozess). Speichere das Ergebnis in eine separate Tabelle.",
            hint: "SAS: SYMGET('SYSUSERID') gibt SAS-Username zurück / PySpark: F.current_date() und F.lit('DSGVO-PROZESS')"
          }
        ],
        sasStarter: `DATA kunden_maskiert;
  SET dwh.kundenstamm;

  /* Name maskieren: erste 2 Zeichen + Sterne */
  name_anon = ____(name, 1, 2) || REPEAT('*', MAX(LENGTH(STRIP(name))-2, 0));

  /* Email: nur Domain */
  IF INDEX(email, '@') > 0 THEN
    email_anon = '***@' || SCAN(email, ____, '@');

  /* PLZ: nur Bereich */
  plz_anon = SUBSTR(plz, 1, 2) || '____';

  /* Audit */
  maskiert_am  = ____;   /* heute */
  maskiert_von = SYMGET('SYSUSERID');

  DROP name email plz;
  RENAME name_anon=name email_anon=email plz_anon=plz;
RUN;

%PUT INFO: &NOBS Datensätze maskiert am &SYSDATE;`,
        pysparkStarter: `from pyspark.sql import functions as F

df = spark.table('dwh.kundenstamm')

df_maskiert = df \\
    .withColumn('name',
        F.concat(
            F.____(  'name', 1, 2),
            F.regexp_replace('name', r'.', '____').substr(3, 100)
        )
    ) \\
    .withColumn('email',
        F.concat(F.lit('****@'),
                 F.split('email', '@').getItem(____))
    ) \\
    .withColumn('plz',
        F.concat(F.substring('plz', 1, ____), F.lit('***'))
    ) \\
    .withColumn('maskiert_am',  F.____()) \\
    .withColumn('maskiert_von', F.lit('____'))

df_maskiert.write.mode('overwrite').saveAsTable('dwh.kunden_anon')
print(f'{df_maskiert.count()} Datensätze maskiert')`,
        sasSolution: `DATA kunden_maskiert;
  SET dwh.kundenstamm;

  name_anon = SUBSTR(name, 1, 2) || REPEAT('*', MAX(LENGTH(STRIP(name))-2, 0));

  IF INDEX(email, '@') > 0 THEN
    email_anon = '***@' || SCAN(email, -1, '@');

  plz_anon = SUBSTR(plz, 1, 2) || '***';

  maskiert_am  = TODAY();
  maskiert_von = SYMGET('SYSUSERID');

  DROP name email plz;
  RENAME name_anon=name email_anon=email plz_anon=plz;
RUN;

%PUT INFO: &NOBS Datensätze maskiert am &SYSDATE;`,
        pysparkSolution: `from pyspark.sql import functions as F

df = spark.table('dwh.kundenstamm')

df_maskiert = df \\
    .withColumn('name',
        F.concat(
            F.substring('name', 1, 2),
            F.regexp_replace('name', r'.', '*').substr(3, 100)
        )
    ) \\
    .withColumn('email',
        F.concat(F.lit('***@'),
                 F.split('email', '@').getItem(1))
    ) \\
    .withColumn('plz',
        F.concat(F.substring('plz', 1, 2), F.lit('***'))
    ) \\
    .withColumn('maskiert_am',  F.current_date()) \\
    .withColumn('maskiert_von', F.lit('DSGVO-PROZESS'))

df_maskiert.write.mode('overwrite').saveAsTable('dwh.kunden_anon')
print(f'{df_maskiert.count()} Datensätze maskiert')`,
        expectedOutput: `Vorher → Nachher:
Max Mueller      → Ma*****
max@vattenfall.de → ***@vattenfall.de
20095            → 20***

12.483 Datensätze maskiert
Gespeichert: dwh.kunden_anon`,
        hints: [
          "SCAN(str, -1, '@') gibt in SAS das letzte Token nach '@' zurück",
          "F.split('email','@').getItem(1) gibt den Teil nach '@' zurück",
          "SYMGET('SYSUSERID') gibt den aktuellen SAS-Username zurück"
        ]
      }
    }
  ]
},

// ════════════════════════════════════════════════════════════════════════════
// M13 – SAS-MAKROPROGRAMMIERUNG
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m13",
  title: "SAS-Makroprogrammierung",
  icon: "🔧",
  lessons: [
    {
      id: "l13_1",
      title: "Wiederverwendbare Makros & Automatisierung",
      theory: `
## Warum Makros?

Stell dir vor: Du erstellst monatlich Reports für 12 Regionen, 5 Tarifklassen und 3 Kundengruppen. Das sind 180 fast-identische Reports. Mit Copy-Paste bist du tagelang beschäftigt — und bei einer Änderung musst du alle 180 anpassen.

**Makros lösen das:** Einmal schreiben, 180× automatisch ausführen.

---

## SAS-Makros: Grundstruktur

\`\`\`sas
%MACRO begruessung(name=Welt, sprache=DE);
  %IF &sprache = DE %THEN %DO;
    %PUT Hallo, &name!;
  %END;
  %ELSE %DO;
    %PUT Hello, &name!;
  %END;
%MEND;

%begruessung(name=Vattenfall, sprache=DE)
\`\`\`

---

## Praxismakro: Tarif-Report für alle Tarife

\`\`\`sas
%MACRO tarif_report(tarif=);
  PROC SQL;
    CREATE TABLE work.report_&tarif AS
    SELECT tarif,
           COUNT(DISTINCT kundennr) AS kunden,
           ROUND(AVG(verbrauch_kwh), 2) AS avg_verbrauch,
           SUM(umsatz_eur) AS umsatz_gesamt
    FROM dwh.verbrauchsdaten
    WHERE UPCASE(tarif) = "%UPCASE(&tarif)";
  QUIT;

  PROC PRINT DATA=work.report_&tarif NOOBS;
    TITLE "Tarif-Report: &tarif";
  RUN;
%MEND;

%tarif_report(tarif=Basis)
%tarif_report(tarif=Premium)
%tarif_report(tarif=Öko)
\`\`\`

## PySpark: Wiederverwendbare Funktionen

\`\`\`python
from pyspark.sql import functions as F

def tarif_report(spark, tarif=None):
    df = spark.table('dwh.verbrauchsdaten')
    if tarif:
        df = df.filter(F.upper('tarif') == tarif.upper())

    return df.groupBy('tarif').agg(
        F.countDistinct('kundennr').alias('kunden'),
        F.round(F.avg('verbrauch_kwh'), 2).alias('avg_verbrauch'),
        F.round(F.sum('umsatz_eur'), 2).alias('umsatz_gesamt')
    ).orderBy('tarif')

# Alle Tarife
for t in ['Basis', 'Premium', 'Öko']:
    print(f'\\n--- {t} ---')
    tarif_report(spark, t).show()
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "Makro-Struktur aufbauen",
            instruction: "Schreibe ein SAS-Makro %tarif_report mit einem Parameter tarif=. Das Makro soll eine Zusammenfassung erstellen: Anzahl Kunden, Durchschnittsverbrauch, Gesamtumsatz.",
            hint: "%MACRO name(param=); ... %MEND; — dann Aufruf mit %name(param=wert)"
          },
          {
            title: "Makro für alle Tarife aufrufen",
            instruction: "Rufe das Makro für alle drei Tarife auf: Basis, Premium, Öko. In PySpark: nutze eine for-Schleife.",
            hint: "SAS: Drei separate %tarif_report(...) Aufrufe / PySpark: for t in ['Basis','Premium','Öko']:"
          },
          {
            title: "Alle Tarife auf einmal (kein Filter)",
            instruction: "Erweitere die Funktion/das Makro so, dass ohne tarif-Angabe alle Tarife auf einmal ausgegeben werden.",
            hint: "SAS: %IF &tarif = %STR() %THEN %DO; /* kein WHERE */ %END; / PySpark: if tarif: df = df.filter(...)"
          }
        ],
        sasStarter: `%MACRO tarif_report(tarif=);
  PROC SQL;
    CREATE TABLE work.report____&tarif AS
    SELECT
      tarif,
      COUNT(DISTINCT kundennr)     AS kunden,
      ROUND(AVG(verbrauch_kwh), 2) AS avg_verbrauch,
      SUM(umsatz_eur)              AS umsatz_gesamt
    FROM dwh.verbrauchsdaten
    %IF &tarif NE %STR() %THEN %DO;
      WHERE UPCASE(tarif) = "____(____)"
    %END;;
  QUIT;

  PROC PRINT DATA=work.report_&tarif _____;
    TITLE "Tarif-Report: ____";
  RUN;
%MEND;

/* Alle Tarife auf einmal */
%tarif_report(tarif=Basis)
%tarif_report(tarif=____)
%tarif_report(tarif=Öko)`,
        pysparkStarter: `from pyspark.sql import functions as F

def tarif_report(spark, tarif=None):
    df = spark.table('dwh.verbrauchsdaten')
    if ____:
        df = df.filter(F.____(  'tarif') == tarif.____())

    return df.groupBy('____').agg(
        F.countDistinct('kundennr').alias('kunden'),
        F.round(F.avg('verbrauch_kwh'), 2).alias('avg_verbrauch'),
        F.round(F.sum('umsatz_eur'), 2).alias('umsatz_gesamt')
    ).orderBy('tarif')

# Alle Tarife einzeln
for t in ['Basis', 'Premium', '____']:
    print(f'\\n--- {t} ---')
    tarif_report(spark, ____).show()

# Oder alle auf einmal (kein Filter)
tarif_report(spark).show()`,
        sasSolution: `%MACRO tarif_report(tarif=);
  PROC SQL;
    CREATE TABLE work.report_&tarif AS
    SELECT
      tarif,
      COUNT(DISTINCT kundennr)     AS kunden,
      ROUND(AVG(verbrauch_kwh), 2) AS avg_verbrauch,
      SUM(umsatz_eur)              AS umsatz_gesamt
    FROM dwh.verbrauchsdaten
    %IF &tarif NE %STR() %THEN %DO;
      WHERE UPCASE(tarif) = "%UPCASE(&tarif)"
    %END;;
  QUIT;

  PROC PRINT DATA=work.report_&tarif NOOBS;
    TITLE "Tarif-Report: &tarif";
  RUN;
%MEND;

%tarif_report(tarif=Basis)
%tarif_report(tarif=Premium)
%tarif_report(tarif=Öko)`,
        pysparkSolution: `from pyspark.sql import functions as F

def tarif_report(spark, tarif=None):
    df = spark.table('dwh.verbrauchsdaten')
    if tarif:
        df = df.filter(F.upper('tarif') == tarif.upper())

    return df.groupBy('tarif').agg(
        F.countDistinct('kundennr').alias('kunden'),
        F.round(F.avg('verbrauch_kwh'), 2).alias('avg_verbrauch'),
        F.round(F.sum('umsatz_eur'), 2).alias('umsatz_gesamt')
    ).orderBy('tarif')

for t in ['Basis', 'Premium', 'Öko']:
    print(f'\\n--- {t} ---')
    tarif_report(spark, t).show()

tarif_report(spark).show()`,
        expectedOutput: `--- Basis ---
+------+------+-------------+-------------+
|tarif |kunden|avg_verbrauch|umsatz_gesamt|
+------+------+-------------+-------------+
|Basis |4521  |2843.12      |3891234.50   |
+------+------+-------------+-------------+

--- Premium ---
+-------+------+-------------+-------------+
|tarif  |kunden|avg_verbrauch|umsatz_gesamt|
+-------+------+-------------+-------------+
|Premium|2183  |4512.88      |4123456.20   |
+-------+------+-------------+-------------+`,
        hints: [
          "%UPCASE(&tarif) wandelt Makrovariable in Großbuchstaben um",
          "In PySpark: F.upper('tarif') == tarif.upper() für case-insensitiven Vergleich",
          "Ohne tarif-Filter gibt die Funktion alle Tarife zurück — nützlich für Überblick"
        ]
      }
    }
  ]
},

// ════════════════════════════════════════════════════════════════════════════
// M14 – SAS KERNFUNKTIONEN
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m14",
  title: "SAS Kernfunktionen",
  icon: "🔤",
  lessons: [
    {
      id: "l14_1",
      title: "DROP, KEEP & RENAME: Variablen steuern",
      theory: `
## Warum Variablen-Steuerung wichtig ist

Aus SAP kommen oft 200+ Spalten. Du brauchst vielleicht 12. Ohne DROP/KEEP landen alle im Output — das kostet Speicher, verlangsamt Joins und macht den Code unlesbar.

---

## DROP — Spalten entfernen

\`\`\`sas
/* DROP: Ausschlussliste */
DATA kunden_clean;
  SET sap.kundenstamm (DROP=rohfeld1-rohfeld5 debug_flag);
RUN;
/* Vorteil: Felder werden gar nicht erst eingelesen — schneller! */
\`\`\`

## KEEP — nur bestimmte Spalten behalten

\`\`\`sas
/* KEEP: Einschlussliste — sicherer wenn neue Spalten hinzukommen */
DATA kunden_kern;
  SET sap.kundenstamm (KEEP=kundennr name adresse plz tarif vertragsnr);
RUN;
\`\`\`

## RENAME — Spalten umbenennen

\`\`\`sas
/* Kombiniert: KEEP + RENAME + WHERE in einem Schritt */
DATA kunden_aktiv;
  SET sap.kundenstamm (
    KEEP   = kundennr bp_name tarif status
    RENAME = (kundennr=kunde_id bp_name=kundenname)
    WHERE  = (status = 'AKTIV')
  );
RUN;
\`\`\`

## PySpark: select, drop, alias

\`\`\`python
# SELECT (wie KEEP) + RENAME in einem Schritt
df_kern = df.select(
    F.col("kundennr"),
    F.col("bp_name").alias("kundenname"),
    "tarif", "vertrag_start"
)

# DROP: Spalten entfernen
df_clean = df.drop("rohfeld1", "rohfeld2", "debug_flag")

# Alle außer bestimmten (wie DROP)
behalte = [c for c in df.columns if c not in ["rohfeld1","debug_flag"]]
df_clean = df.select(behalte)
\`\`\`
`,
      exercise: {
        steps: [
          {
            title: "Spalten auswählen (KEEP/SELECT)",
            instruction: "Behalte aus einer SAP-Tabelle mit vielen Spalten nur: kundennr, bp_name, bp_adresse, plz, tarif, jahresverbrauch, status.",
            hint: "SAS: SET sap.kundenstamm (KEEP=...); / PySpark: df.select('kundennr', 'bp_name', ...)"
          },
          {
            title: "Spalten umbenennen (RENAME/alias)",
            instruction: "Benenne bp_name in kundenname und bp_adresse in adresse um. Filtere gleichzeitig auf aktive Kunden (status='AKTIV').",
            hint: "SAS: RENAME=(bp_name=kundenname) direkt im SET / PySpark: F.col('bp_name').alias('kundenname')"
          }
        ],
        sasStarter: `/* KEEP + RENAME kombiniert */
DATA kunden_bereinigt;
  SET sap.kundenstamm (
    ____   = kundennr bp_name bp_adresse plz tarif jahresverbrauch status
    RENAME = (bp_name=____ bp_adresse=adresse)
    WHERE  = (status = '____')
  );
  DROP ____;  /* nach Filter nicht mehr benötigt */
RUN;

PROC PRINT DATA=kunden_bereinigt (OBS=10) NOOBS;
  TITLE 'Bereinigte Kundendaten';
RUN;

%PUT INFO: &SYSNOBS Aktive Kunden ausgewählt;`,
        pysparkStarter: `from pyspark.sql import functions as F

df = spark.table('sap.kundenstamm')

df_bereinigt = df \\
    .filter(F.col('____') == 'AKTIV') \\
    .select(
        F.col('kundennr'),
        F.col('bp_name').alias('____'),
        F.col('bp_adresse').alias('adresse'),
        '____', 'tarif', 'jahresverbrauch'
    )

print(f'Aktive Kunden: {df_bereinigt.____()}')
df_bereinigt.show(10, truncate=False)`,
        sasSolution: `DATA kunden_bereinigt;
  SET sap.kundenstamm (
    KEEP   = kundennr bp_name bp_adresse plz tarif jahresverbrauch status
    RENAME = (bp_name=kundenname bp_adresse=adresse)
    WHERE  = (status = 'AKTIV')
  );
  DROP status;
RUN;

PROC PRINT DATA=kunden_bereinigt (OBS=10) NOOBS;
  TITLE 'Bereinigte Kundendaten';
RUN;

%PUT INFO: &SYSNOBS Aktive Kunden ausgewählt;`,
        pysparkSolution: `from pyspark.sql import functions as F

df = spark.table('sap.kundenstamm')

df_bereinigt = df \\
    .filter(F.col('status') == 'AKTIV') \\
    .select(
        F.col('kundennr'),
        F.col('bp_name').alias('kundenname'),
        F.col('bp_adresse').alias('adresse'),
        'plz', 'tarif', 'jahresverbrauch'
    )

print(f'Aktive Kunden: {df_bereinigt.count()}')
df_bereinigt.show(10, truncate=False)`,
        expectedOutput: `INFO: 45231 Aktive Kunden ausgewählt

+----------+----------+-----------------+-----+-------+----------------+
|kundennr  |kundenname|adresse          |plz  |tarif  |jahresverbrauch |
+----------+----------+-----------------+-----+-------+----------------+
|K00000001 |Mueller H.|Hauptstr. 1      |20095|Premium|3421            |
|K00000002 |Fischer M.|Bahnhofstr. 42   |10117|Basis  |2187            |
+----------+----------+-----------------+-----+-------+----------------+`,
        hints: [
          "KEEP= und RENAME= können direkt im SET gesetzt werden — das ist effizienter als im DATA Step",
          "In PySpark ersetzt .select() mit .alias() sowohl KEEP als auch RENAME in einem Schritt",
          "WHERE= im SET-Statement filtert BEVOR Daten eingelesen werden — schneller als nachträgliches IF"
        ]
      }
    },

    {
      id: "l14_2",
      title: "CAT, CATX & CATS: Strings verbinden",
      theory: `
## Das Problem: Teile zusammensetzen

Kundennamen kommen oft aufgeteilt: Vorname, Nachname, Titel getrennt. Adressen in Strasse, Hausnummer, PLZ, Ort. Du musst sie für Briefe, Reports oder Vergleiche zusammensetzen.

---

## Die CAT-Funktionen im Überblick

| Funktion | Was sie macht | Leerzeichen |
|----------|---------------|-------------|
| \`CAT\` | Verbindet direkt | behält alle |
| \`CATS\` | Verbindet + trimmt | trimmt führ./abschl. |
| \`CATX\` | Mit Trennzeichen | trimmt + Separator |

---

## CATX — mit Trennzeichen (empfohlen!)

\`\`\`sas
DATA adress_komplett;
  SET kundenstamm;

  strasse_nr   = CATX(' ', strasse, hausnr);
  plz_ort      = CATX(' ', plz, ort);
  adresse_norm = CATX(', ', strasse_nr, plz_ort);
  /* → 'Musterstrasse 42, 20095 Hamburg' */

  /* CATX ignoriert leere Strings automatisch! */
  vollname = CATX(' ', titel, vorname, nachname);
  /* Falls titel leer: kein Doppelleerzeichen */
RUN;
\`\`\`

## PySpark: concat_ws

\`\`\`python
df = df \\
    .withColumn("adresse_norm",
        F.concat_ws(", ",
            F.concat_ws(" ", F.trim("strasse"), F.trim("hausnr")),
            F.concat_ws(" ", F.trim("plz"),    F.trim("ort"))
        )
    ) \\
    .withColumn("vollname",
        F.concat_ws(" ",
            F.when(F.col("titel") != "", F.col("titel")),
            F.trim("vorname"),
            F.trim("nachname")
        )
    )
\`\`\`

**Wichtig:** \`concat_ws\` ignoriert NULL automatisch — \`concat\` gibt NULL zurück wenn EIN Argument NULL ist!
`,
      exercise: {
        steps: [
          {
            title: "Vollständigen Namen zusammenbauen",
            instruction: "Erstelle einen vollständigen Anzeigenamen: wenn titel vorhanden → 'Dr. Max Mueller', ohne Titel → 'Max Mueller'. Nutze CATX in SAS, concat_ws in PySpark.",
            hint: "SAS: CATX ignoriert leere Strings automatisch — CATX(' ', titel, vorname, nachname) funktioniert bei leerem Titel!"
          },
          {
            title: "Normierte Adresse erstellen",
            instruction: "Setze strasse + hausnr + plz + ort zu einer einzeiligen Adresse zusammen: 'Hauptstr. 42, 20095 Hamburg'.",
            hint: "SAS: CATX(', ', CATX(' ', strasse, hausnr), CATX(' ', plz, ort)) / PySpark: concat_ws()"
          }
        ],
        sasStarter: `DATA kunden_output;
  SET kundenstamm;

  /* Vollständiger Name mit optionalem Titel */
  IF MISSING(titel) OR STRIP(titel) = '' THEN
    anzeigename = CATX(' ', ____, nachname);
  ELSE
    anzeigename = CATX(' ', ____, vorname, nachname);

  /* Normierte Adresse */
  strasse_nr   = CATX('____', STRIP(strasse), STRIP(hausnr));
  plz_ort      = CATX(' ', STRIP(plz), STRIP(____));
  adresse_norm = CATX(', ', strasse_nr, plz_ort);

  KEEP kundennr anzeigename adresse_norm;
RUN;

PROC PRINT DATA=kunden_output (OBS=5) NOOBS;
  TITLE 'Kunden mit normalisierten Feldern';
RUN;`,
        pysparkStarter: `from pyspark.sql import functions as F

df = spark.table('kundenstamm')

df_out = df \\
    .withColumn('anzeigename',
        F.when(
            F.col('titel').isNull() | (F.____(  'titel') == ''),
            F.concat_ws(' ', F.trim('____'), F.trim('nachname'))
        ).otherwise(
            F.concat_ws(' ', F.trim('____'), F.trim('vorname'), F.trim('nachname'))
        )
    ) \\
    .withColumn('strasse_nr', F.concat_ws(' ', F.trim('strasse'), F.trim('hausnr'))) \\
    .withColumn('plz_ort',    F.concat_ws('____', F.trim('plz'),    F.trim('ort'))) \\
    .withColumn('adresse_norm', F.concat_ws(', ', 'strasse_nr', '____')) \\
    .select('kundennr', 'anzeigename', 'adresse_norm')

df_out.show(5, truncate=False)`,
        sasSolution: `DATA kunden_output;
  SET kundenstamm;

  IF MISSING(titel) OR STRIP(titel) = '' THEN
    anzeigename = CATX(' ', vorname, nachname);
  ELSE
    anzeigename = CATX(' ', titel, vorname, nachname);

  strasse_nr   = CATX(' ', STRIP(strasse), STRIP(hausnr));
  plz_ort      = CATX(' ', STRIP(plz), STRIP(ort));
  adresse_norm = CATX(', ', strasse_nr, plz_ort);

  KEEP kundennr anzeigename adresse_norm;
RUN;

PROC PRINT DATA=kunden_output (OBS=5) NOOBS;
  TITLE 'Kunden mit normalisierten Feldern';
RUN;`,
        pysparkSolution: `from pyspark.sql import functions as F

df = spark.table('kundenstamm')

df_out = df \\
    .withColumn('anzeigename',
        F.when(
            F.col('titel').isNull() | (F.trim('titel') == ''),
            F.concat_ws(' ', F.trim('vorname'), F.trim('nachname'))
        ).otherwise(
            F.concat_ws(' ', F.trim('titel'), F.trim('vorname'), F.trim('nachname'))
        )
    ) \\
    .withColumn('strasse_nr', F.concat_ws(' ', F.trim('strasse'), F.trim('hausnr'))) \\
    .withColumn('plz_ort',    F.concat_ws(' ', F.trim('plz'),    F.trim('ort'))) \\
    .withColumn('adresse_norm', F.concat_ws(', ', 'strasse_nr', 'plz_ort')) \\
    .select('kundennr', 'anzeigename', 'adresse_norm')

df_out.show(5, truncate=False)`,
        expectedOutput: `+----------+----------------+---------------------------+
|kundennr  |anzeigename     |adresse_norm               |
+----------+----------------+---------------------------+
|K00000001 |Dr. Max Mueller |Hauptstr. 1, 20095 Hamburg |
|K00000002 |Anna Schmidt    |Bahnhofstr. 42, 10117 Berlin|
|K00000003 |Prof. Hans Weber|Rathausplatz 5, 80333 München|
+----------+----------------+---------------------------+`,
        hints: [
          "CATX ignoriert leere Strings automatisch — kein IF nötig für Leerzeichen-Probleme",
          "In PySpark gibt concat() NULL zurück wenn EIN Argument NULL ist — concat_ws() ist sicherer",
          "STRIP() vor CATX entfernt führende und abschließende Leerzeichen — wichtig bei SAP-Daten"
        ]
      }
    },

    {
      id: "l14_3",
      title: "PRXCHANGE: Regex-Ersetzungen & Bereinigung",
      theory: `
## PRXMATCH vs PRXCHANGE

Du kennst PRXMATCH — es prüft OB ein Muster vorkommt. PRXCHANGE geht weiter: es **ersetzt** das Muster durch etwas anderes.

---

## PRXCHANGE: Syntax und Grundlagen

\`\`\`sas
/* PRXCHANGE(regex, count, string)
   regex  = Perl-Regex als String (mit s/ für substitute)
   count  = Anzahl Ersetzungen (-1 = alle, 1 = erste)
   string = zu bearbeitender String */

/* Einfache Ersetzung */
telefon_norm = PRXCHANGE('s/-//g', -1, telefon);
/* '0049-40-123456' → '004940123456' */
\`\`\`

---

## Praxisbeispiele: Telefon-Normierung

\`\`\`sas
DATA kunden_bereinigt;
  SET sap.kundenstamm;

  /* 1. +49 am Anfang ersetzen */
  tel = PRXCHANGE('s/^\\+49/0049/', 1, telefon);

  /* 2. Leerzeichen, Klammern, Bindestriche entfernen */
  tel = PRXCHANGE('s/[\\s\\-\\(\\)]//g', -1, tel);

  telefon_norm = tel;
RUN;
\`\`\`

## PySpark: regexp_replace

\`\`\`python
df_bereinigt = df \\
    .withColumn('telefon_norm',
        F.regexp_replace(
            F.regexp_replace('telefon', r'^\\+49', '0049'),
            r'[\\s\\-\\(\\)]', ''
        )
    ) \\
    .withColumn('tel_nur_ziffern',
        F.col('telefon_norm').rlike(r'^\\d+$')) \\
    .withColumn('tel_laenge_ok',
        F.length('telefon_norm').between(10, 12))
\`\`\`

---

## Regex-Referenz für Datenbereinigung

| Pattern | Bedeutet | Beispiel |
|---------|----------|---------|
| \`\\s\` | Leerzeichen/Tab | \`s/\\s//g\` → alle Spaces entfernen |
| \`\\d\` | Ziffer 0-9 | \`s/\\D//g\` → nur Ziffern behalten |
| \`^\` | Anfang | \`s/^\\+49/\` → nur am Anfang |
| \`+\` | 1 oder mehr | \`\\s+\` → ein oder mehr Spaces |
`,
      exercise: {
        steps: [
          {
            title: "+49 ersetzen",
            instruction: "Ersetze die internationale Vorwahl +49 am Anfang der Telefonnummer durch 0049. Wichtig: nur AM ANFANG (^-Anker).",
            hint: "SAS: PRXCHANGE('s/^\\+49/0049/', 1, telefon) — \\+ weil + in Regex speziell bedeutet."
          },
          {
            title: "Formatzeichen entfernen",
            instruction: "Entferne alle Leerzeichen, Bindestriche und Klammern aus der Telefonnummer. Nutze eine Zeichenklasse [...].",
            hint: "Pattern: [\\s\\-\\(\\)] — das sind Space, Bindestrich, öffnende und schließende Klammer."
          },
          {
            title: "Validierung",
            instruction: "Prüfe das Ergebnis: (1) Nur Ziffern vorhanden? (2) Länge zwischen 10 und 12 Stellen? Setze tel_valid = TRUE/1 wenn beides stimmt.",
            hint: "SAS: PRXMATCH('/^\\d+$/', tel) > 0 AND LENGTH(tel) BETWEEN 10 AND 12 / PySpark: .rlike() & .between()"
          }
        ],
        sasStarter: `DATA telefon_clean;
  SET kundenstamm;

  /* Schritt 1: +49 am Anfang ersetzen */
  tel = PRXCHANGE('s/^____/0049/', 1, STRIP(telefon));

  /* Schritt 2: Leerzeichen, Bindestriche, Klammern entfernen */
  tel = PRXCHANGE('s/[____]//g', -1, tel);

  /* Schritt 3: Validierung */
  tel_nur_ziffern = (PRXMATCH('/^\\d+$/', tel) > 0);
  tel_laenge_ok   = (LENGTH(tel) BETWEEN 10 AND ____);
  tel_valid       = (____ AND ____);

  RENAME tel = telefon_norm;
RUN;

PROC FREQ DATA=telefon_clean;
  TABLES tel_valid;
  TITLE 'Telefon-Validierung nach Bereinigung';
RUN;`,
        pysparkStarter: `from pyspark.sql import functions as F

df = spark.table('kundenstamm')

df_clean = df \\
    .withColumn('tel',
        F.regexp_replace(F.trim('telefon'), r'^____', '0049')
    ) \\
    .withColumn('telefon_norm',
        F.regexp_replace('tel', r'[____]', '')
    ) \\
    .withColumn('tel_nur_ziffern',
        F.col('telefon_norm').rlike(r'^\\d+$')
    ) \\
    .withColumn('tel_laenge_ok',
        F.length('telefon_norm').between(____, 12)
    ) \\
    .withColumn('tel_valid',
        F.col('tel_nur_ziffern') ____ F.col('tel_laenge_ok')
    ) \\
    .drop('tel')

df_clean.groupBy('tel_valid').count().show()
df_clean.select('telefon', 'telefon_norm', 'tel_valid').show(10)`,
        sasSolution: `DATA telefon_clean;
  SET kundenstamm;

  tel = PRXCHANGE('s/^\\+49/0049/', 1, STRIP(telefon));
  tel = PRXCHANGE('s/[\\s\\-\\(\\)]//g', -1, tel);

  tel_nur_ziffern = (PRXMATCH('/^\\d+$/', tel) > 0);
  tel_laenge_ok   = (LENGTH(tel) BETWEEN 10 AND 12);
  tel_valid       = (tel_nur_ziffern AND tel_laenge_ok);

  RENAME tel = telefon_norm;
RUN;

PROC FREQ DATA=telefon_clean;
  TABLES tel_valid;
  TITLE 'Telefon-Validierung nach Bereinigung';
RUN;`,
        pysparkSolution: `from pyspark.sql import functions as F

df = spark.table('kundenstamm')

df_clean = df \\
    .withColumn('tel',
        F.regexp_replace(F.trim('telefon'), r'^\\+49', '0049')
    ) \\
    .withColumn('telefon_norm',
        F.regexp_replace('tel', r'[\\s\\-\\(\\)]', '')
    ) \\
    .withColumn('tel_nur_ziffern',
        F.col('telefon_norm').rlike(r'^\\d+$')
    ) \\
    .withColumn('tel_laenge_ok',
        F.length('telefon_norm').between(10, 12)
    ) \\
    .withColumn('tel_valid',
        F.col('tel_nur_ziffern') & F.col('tel_laenge_ok')
    ) \\
    .drop('tel')

df_clean.groupBy('tel_valid').count().show()
df_clean.select('telefon', 'telefon_norm', 'tel_valid').show(10)`,
        expectedOutput: `Telefon-Validierung:
+---------+-----+
|tel_valid|count|
+---------+-----+
|true     |11842|
|false    |641  |
+---------+-----+

Beispiele:
+------------------+------------+---------+
|telefon           |telefon_norm|tel_valid|
+------------------+------------+---------+
|+49 (0)40 123456  |004940123456|true     |
|040-123 456       |040123456   |false    |
|0049-30-1234567   |004930123456|true     |
+------------------+------------+---------+`,
        hints: [
          "In SAS muss + im Regex escaped werden: \\+ (sonst bedeutet es '1 oder mehr')",
          "^ am Anfang des Patterns bedeutet 'Anfang des Strings' — s/^\\+49/ ersetzt NUR am Anfang",
          "rlike() in PySpark ist wie PRXMATCH in SAS — es prüft NUR ob das Muster vorkommt"
        ]
      }
    }
  ]
},

// ════════════════════════════════════════════════════════════════════════════
// M15 – DATUM & ZEIT
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m15",
  title: "Datum & Zeit",
  icon: "📅",
  lessons: [
    {
      id: "l15_1",
      title: "Datumsformate & Berechnungen",
      theory: `
## Warum Datum so trickreich ist

In SAS sind Datumswerte intern **Zahlen** (Tage seit 01.01.1960). Ein Format wie \`DATE9.\` ist nur die Anzeigemaske. In Databricks/Spark SQL sind Daten echte \`DATE\`-Typen — Format-Strings folgen Java-Konventionen.

---

## SAS: Datumsformate im Überblick

\`\`\`sas
DATA datum_beispiele;
  heute = TODAY();            /* numerischer Wert */
  FORMAT heute  DATE9.;       /* 11MAR2026 */
  FORMAT heute  DDMMYY10.;   /* 11/03/2026 */
  FORMAT heute  YYMMDD10.;   /* 2026-03-11 */

  /* Datum aus String */
  d1 = INPUT('11MAR2026',   DATE9.);
  d2 = INPUT('2026-03-11',  YYMMDD10.);

  /* Datumsberechnungen */
  tage_diff       = '31DEC2026'd - heute;
  monate          = INTCK('MONTH', heute, '31DEC2026'd);
  naechster_monat = INTNX('MONTH', heute, 1);
  monatsende      = INTNX('MONTH', heute, 0, 'END');

  /* Teile extrahieren */
  tag     = DAY(heute);
  monat   = MONTH(heute);
  jahr    = YEAR(heute);
  quartal = QTR(heute);
RUN;
\`\`\`

---

## Databricks SQL: Datumsformate

\`\`\`sql
SELECT CURRENT_DATE, CURRENT_TIMESTAMP;

SELECT TO_DATE('2026-03-11', 'yyyy-MM-dd')  AS d1,
       DATE_FORMAT(CURRENT_DATE, 'dd.MM.yyyy') AS deutsch;

SELECT DATEDIFF(DATE'2026-12-31', CURRENT_DATE)  AS tage,
       ADD_MONTHS(CURRENT_DATE, 1)               AS naechster_monat,
       LAST_DAY(CURRENT_DATE)                    AS monatsende,
       YEAR(CURRENT_DATE)                        AS jahr,
       QUARTER(CURRENT_DATE)                     AS quartal;
\`\`\`

---

## Vergleichstabelle

| Aufgabe | SAS | Databricks SQL |
|---------|-----|----------------|
| Heute | \`TODAY()\` | \`CURRENT_DATE\` |
| Differenz (Tage) | \`date2 - date1\` | \`DATEDIFF(d2, d1)\` |
| +N Monate | \`INTNX('MONTH', d, n)\` | \`ADD_MONTHS(datum, n)\` |
| Monatsende | \`INTNX('MONTH', d, 0, 'END')\` | \`LAST_DAY(datum)\` |
| Jahr | \`YEAR(datum)\` | \`YEAR(datum)\` |
| String → Datum | \`INPUT(str, DATE9.)\` | \`TO_DATE(str, 'format')\` |
`,
      exercise: {
        steps: [
          {
            title: "Tage bis Vertragsende",
            instruction: "Berechne für jeden Vertrag die verbleibenden Tage bis Vertragsende (vertrag_ende - heute). Filtere auf noch laufende Verträge.",
            hint: "SAS: tage_bis_ende = vertrag_ende - TODAY(); / Databricks: DATEDIFF(vertrag_ende, CURRENT_DATE)"
          },
          {
            title: "Quartal des Vertragsbeginns",
            instruction: "Extrahiere das Quartal des Vertragsbeginns und erstelle ein Label wie 'Q1/2024'. SAS: QTR() + CATX, Databricks: QUARTER() + CONCAT.",
            hint: "SAS: CATS('Q', QTR(vertrag_start), '/', YEAR(vertrag_start)) / SQL: CONCAT('Q', QUARTER(datum), '/', YEAR(datum))"
          },
          {
            title: "Monatsende berechnen",
            instruction: "Berechne den letzten Tag des Monats vom Vertragsbeginn. SAS: INTNX('MONTH',...,'END'), Databricks: LAST_DAY().",
            hint: "INTNX('MONTH', datum, 0, 'END') gibt den letzten Tag des GLEICHEN Monats — '0' bedeutet +0 Monate."
          }
        ],
        sasStarter: `DATA vertrags_analyse;
  SET vertraege;

  heute = ____;

  /* 1. Tage bis Vertragsende */
  tage_bis_ende = ____ - heute;

  /* 2. Quartal des Vertragsbeginns */
  quartal_start = ____(vertrag_start);
  jahr_start    = YEAR(vertrag_start);
  quartal_label = CATS('Q', quartal_start, '/', ____);

  /* 3. Monatsende des Vertragsbeginns */
  monatsende_start = INTNX('____', vertrag_start, 0, 'END');

  FORMAT heute vertrag_start vertrag_ende monatsende_start ____;

  WHERE tage_bis_ende > 0;
RUN;

PROC PRINT DATA=vertrags_analyse (OBS=10) NOOBS;
  TITLE 'Vertragsanalyse';
RUN;`,
        pysparkStarter: `-- Databricks SQL
SELECT
  vertragsnr,
  vertrag_start,
  vertrag_ende,

  -- 1. Tage bis Vertragsende
  ____(vertrag_ende, CURRENT_DATE)      AS tage_bis_ende,

  -- 2. Quartal des Vertragsbeginns
  ____(vertrag_start)                   AS quartal_start,
  CONCAT('Q', QUARTER(vertrag_start), '/',
         ____(vertrag_start))           AS quartal_label,

  -- 3. Monatsende des Vertragsbeginns
  ____(vertrag_start)                   AS monatsende_start

FROM vertraege
WHERE ____(vertrag_ende, CURRENT_DATE) > 0
ORDER BY tage_bis_ende ASC;`,
        sasSolution: `DATA vertrags_analyse;
  SET vertraege;

  heute = TODAY();

  tage_bis_ende    = vertrag_ende - heute;
  quartal_start    = QTR(vertrag_start);
  jahr_start       = YEAR(vertrag_start);
  quartal_label    = CATS('Q', quartal_start, '/', jahr_start);
  monatsende_start = INTNX('MONTH', vertrag_start, 0, 'END');

  FORMAT heute vertrag_start vertrag_ende monatsende_start DDMMYY10.;

  WHERE tage_bis_ende > 0;
RUN;

PROC PRINT DATA=vertrags_analyse (OBS=10) NOOBS;
  TITLE 'Vertragsanalyse';
RUN;`,
        pysparkSolution: `-- Databricks SQL
SELECT
  vertragsnr,
  vertrag_start,
  vertrag_ende,

  DATEDIFF(vertrag_ende, CURRENT_DATE)          AS tage_bis_ende,

  QUARTER(vertrag_start)                        AS quartal_start,
  CONCAT('Q', QUARTER(vertrag_start), '/',
         YEAR(vertrag_start))                   AS quartal_label,

  LAST_DAY(vertrag_start)                       AS monatsende_start

FROM vertraege
WHERE DATEDIFF(vertrag_ende, CURRENT_DATE) > 0
ORDER BY tage_bis_ende ASC;`,
        expectedOutput: `+----------+------------+------------+--------------+--------------+-----------------+
|vertragsnr|vtrag_start |vertrag_ende|tage_bis_ende |quartal_label |monatsende_start |
+----------+------------+------------+--------------+--------------+-----------------+
|V00001    |2024-01-15  |2026-03-15  |4             |Q1/2024       |2024-01-31       |
|V00042    |2023-07-01  |2026-06-30  |111           |Q3/2023       |2023-07-31       |
|V00128    |2024-04-01  |2026-12-31  |295           |Q2/2024       |2024-04-30       |
+----------+------------+------------+--------------+--------------+-----------------+`,
        hints: [
          "In SAS ist ein Datum eine Zahl (Tage seit 01.01.1960) — deshalb funktioniert einfaches datum2 - datum1",
          "INTNX('MONTH', datum, 0, 'END') gibt den letzten Tag des GLEICHEN Monats",
          "In Databricks nimmt DATEDIFF(ende, start) die Reihenfolge Ende ZUERST"
        ]
      }
    }
  ]
},

// ════════════════════════════════════════════════════════════════════════════
// M16 – SAS SQL vs. SPARK SQL
// ════════════════════════════════════════════════════════════════════════════
{
  id: "m16",
  title: "SAS SQL vs. Spark SQL",
  icon: "⚖️",
  lessons: [
    {
      id: "l16_1",
      title: "SQL-Dialekte: Was SAS nicht kann",
      theory: `
## SAS SQL vs. Spark SQL — der wichtigste Migrationsweg

Viele Kolleg:innen schreiben in SAS hauptsächlich **PROC SQL** — und in Databricks ebenfalls **SQL**. Der Wechsel von PROC SQL zu Spark SQL ist der häufigste Migrationspfad.

**Die gute Nachricht:** SELECT, JOIN, GROUP BY, HAVING, ORDER BY — identisch.
**Die schlechte Nachricht:** Genau die Unterschiede erwischen einen.

---

## Window Functions: SAS kann sie nicht, Spark schon

\`\`\`sas
/* SAS PROC SQL: Window Functions NICHT unterstützt */
/* Das folgende würde FEHLER geben: */
SELECT kundennr, LAG(verbrauch) OVER (PARTITION BY kundennr ORDER BY datum)
FROM verbrauch;  /* FEHLER! */

/* SAS-Workaround: DATA Step mit RETAIN */
PROC SORT DATA=verbrauch; BY kundennr datum; RUN;
DATA verbrauch_lag;
  SET verbrauch;
  BY kundennr;
  vormonat = LAG(verbrauch_kwh);
  IF FIRST.kundennr THEN vormonat = .;
RUN;
\`\`\`

\`\`\`sql
-- Spark SQL: Window Functions nativ
SELECT
  kundennr, datum, verbrauch_kwh,
  LAG(verbrauch_kwh)  OVER (PARTITION BY kundennr ORDER BY datum) AS vormonat,
  RANK() OVER (PARTITION BY tarif ORDER BY verbrauch_kwh DESC)    AS rang,
  SUM(verbrauch_kwh)  OVER (PARTITION BY kundennr
                            ROWS UNBOUNDED PRECEDING)             AS kumuliert
FROM verbrauch;
\`\`\`

---

## LEFT SEMI JOIN: effizienter als EXISTS

\`\`\`sql
-- Spark SQL: LEFT SEMI JOIN
SELECT k.*
FROM kunden k
LEFT SEMI JOIN vertraege v ON k.kundennr = v.kundennr;

-- LEFT ANTI JOIN: Kunden OHNE Vertrag
SELECT k.* FROM kunden k
LEFT ANTI JOIN vertraege v ON k.kundennr = v.kundennr;
\`\`\`

---

## Vergleichstabelle

| Feature | SAS PROC SQL | Spark SQL |
|---------|-------------|----------|
| Window Functions | ❌ nicht unterstützt | ✅ voll |
| LAG / LEAD | ❌ nur per DATA Step | ✅ nativ |
| LEFT SEMI JOIN | ❌ | ✅ |
| CTEs (WITH ...) | ✅ | ✅ |
| PIVOT | teilweise | ✅ |
`,
      exercise: {
        steps: [
          {
            title: "LAG-Funktion anwenden",
            instruction: "Berechne für jeden Kunden pro Monat den Verbrauch und den Vormonat (LAG). In SAS per DATA Step mit RETAIN und BY-Gruppe, in Spark SQL direkt mit LAG() OVER.",
            hint: "SAS: vormonat = LAG(verbrauch_kwh); IF FIRST.kundennr THEN vormonat = .; / SQL: LAG(verbrauch_kwh) OVER (PARTITION BY kundennr ORDER BY ...)"
          },
          {
            title: "Rollenden 3-Monats-Schnitt berechnen",
            instruction: "Berechne einen rollenden Durchschnitt der letzten 3 Monate. In SAS mit ARRAY+RETAIN, in Spark SQL mit ROWS BETWEEN 2 PRECEDING AND CURRENT ROW.",
            hint: "SQL: AVG(verbrauch_kwh) OVER (PARTITION BY kundennr ORDER BY datum ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)"
          }
        ],
        sasStarter: `/* SAS: Window Functions via DATA Step simulieren */
PROC SORT DATA=verbrauch OUT=v_sort;
  BY kundennr ____ monat;
RUN;

DATA verbrauch_analyse;
  SET v_sort;
  BY _____;

  /* LAG -- Vormonat */
  vormonat_kwh = ____(verbrauch_kwh);
  IF FIRST.kundennr THEN vormonat_kwh = .;

  /* Rollender 3-Monats-Schnitt via ARRAY+RETAIN */
  ARRAY hist[3] h1 h2 h3;
  RETAIN h1 h2 h3;
  IF FIRST.kundennr THEN DO; h1=.; h2=.; h3=.; END;
  h3 = h2;  h2 = h1;  h1 = verbrauch_kwh;
  IF NOT MISSING(h3) THEN avg_3m = MEAN(h1, h2, h3);
  ELSE avg_3m = .;
RUN;`,
        pysparkStarter: `-- Databricks SQL: direkt mit Window Functions
SELECT
  kundennr, jahr, monat, verbrauch_kwh,

  ____(verbrauch_kwh)
    OVER (PARTITION BY kundennr
          ORDER BY ____, monat)           AS vormonat_kwh,

  verbrauch_kwh - LAG(verbrauch_kwh)
    OVER (PARTITION BY kundennr
          ORDER BY jahr, monat)           AS delta_vormonat,

  ____(verbrauch_kwh)
    OVER (PARTITION BY kundennr
          ORDER BY jahr, monat
          ROWS BETWEEN ____ PRECEDING
               AND CURRENT ROW)          AS avg_3monate,

  ____(  )
    OVER (PARTITION BY tarif
          ORDER BY verbrauch_kwh DESC)    AS rang_im_tarif

FROM verbrauch
ORDER BY kundennr, jahr, monat;`,
        sasSolution: `/* SAS: Window Functions via DATA Step simulieren */
PROC SORT DATA=verbrauch OUT=v_sort;
  BY kundennr jahr monat;
RUN;

DATA verbrauch_analyse;
  SET v_sort;
  BY kundennr;

  vormonat_kwh = LAG(verbrauch_kwh);
  IF FIRST.kundennr THEN vormonat_kwh = .;

  ARRAY hist[3] h1 h2 h3;
  RETAIN h1 h2 h3;
  IF FIRST.kundennr THEN DO; h1=.; h2=.; h3=.; END;
  h3 = h2;  h2 = h1;  h1 = verbrauch_kwh;
  IF NOT MISSING(h3) THEN avg_3m = MEAN(h1, h2, h3);
  ELSE avg_3m = .;
RUN;

PROC PRINT DATA=verbrauch_analyse (OBS=15) NOOBS;
  VAR kundennr jahr monat verbrauch_kwh vormonat_kwh avg_3m;
RUN;`,
        pysparkSolution: `-- Databricks SQL: direkt mit Window Functions
SELECT
  kundennr, jahr, monat, verbrauch_kwh,

  LAG(verbrauch_kwh)
    OVER (PARTITION BY kundennr
          ORDER BY jahr, monat)           AS vormonat_kwh,

  verbrauch_kwh - LAG(verbrauch_kwh)
    OVER (PARTITION BY kundennr
          ORDER BY jahr, monat)           AS delta_vormonat,

  AVG(verbrauch_kwh)
    OVER (PARTITION BY kundennr
          ORDER BY jahr, monat
          ROWS BETWEEN 2 PRECEDING
               AND CURRENT ROW)          AS avg_3monate,

  RANK()
    OVER (PARTITION BY tarif
          ORDER BY verbrauch_kwh DESC)    AS rang_im_tarif

FROM verbrauch
ORDER BY kundennr, jahr, monat;`,
        expectedOutput: `+----------+----+-----+--------------+--------------+--------------+-------------+
|kundennr  |jahr|monat|verbrauch_kwh |vormonat_kwh  |avg_3monate   |rang_im_tarif|
+----------+----+-----+--------------+--------------+--------------+-------------+
|K001      |2025|1    |342.5         |null          |342.5         |12           |
|K001      |2025|2    |298.3         |342.5         |320.4         |23           |
|K001      |2025|3    |412.7         |298.3         |351.2         |7            |
+----------+----+-----+--------------+--------------+--------------+-------------+`,
        hints: [
          "In SAS braucht LAG() immer vorher PROC SORT und BY-Variable — sonst falsche Ergebnisse",
          "FIRST.kundennr setzt den LAG-Wert auf missing — sonst wird der letzte Wert des VORHERIGEN Kunden verwendet",
          "In Spark SQL: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW = aktuelle Zeile + 2 davor = 3 Zeilen"
        ]
      }
    },

    {
      id: "l16_2",
      title: "Migration: SAS-Logiken nach Spark SQL",
      theory: `
## Der Migrations-Leitfaden

Der häufigste Migrationspfad bei Vattenfall:
- **PROC SQL → Spark SQL** (fast 1:1)
- **DATA Step mit BY → Window Functions** (große Vereinfachung)
- **Makros → Python-Funktionen** (mehr Flexibilität)

---

## Pattern 1: FIRST./LAST. → ROW_NUMBER()

\`\`\`sas
/* SAS: Neuesten Vertrag je Kunde finden */
PROC SORT DATA=vertraege; BY kundennr gueltig_ab; RUN;
DATA akt_vertrag;
  SET vertraege;
  BY kundennr;
  IF LAST.kundennr;
RUN;
\`\`\`

\`\`\`sql
-- Spark SQL: ROW_NUMBER() statt LAST.
SELECT * FROM (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY kundennr ORDER BY gueltig_ab DESC
    ) AS rn
  FROM vertraege
) WHERE rn = 1;
\`\`\`

---

## Pattern 2: RETAIN → SUM OVER

\`\`\`sas
/* SAS: Kumulierter Verbrauch mit RETAIN */
DATA kumuliert;
  SET verbrauch;
  BY kundennr;
  RETAIN kum_verbrauch 0;
  IF FIRST.kundennr THEN kum_verbrauch = 0;
  kum_verbrauch + verbrauch_kwh;
RUN;
\`\`\`

\`\`\`sql
-- Spark SQL: viel einfacher!
SELECT kundennr, datum, verbrauch_kwh,
  SUM(verbrauch_kwh) OVER (
    PARTITION BY kundennr ORDER BY datum
    ROWS UNBOUNDED PRECEDING
  ) AS kum_verbrauch
FROM verbrauch;
\`\`\`

---

## Pattern 3: SAS-Makro → Python-Funktion

\`\`\`python
def region_report(spark, region: str, jahr: int):
    return spark.sql(f"""
        SELECT region, COUNT(*) AS kunden, SUM(umsatz) AS umsatz_ges
        FROM catalog.schema.kunden
        WHERE region = '{region}' AND YEAR(vertrag_start) = {jahr}
        GROUP BY region
    """)

display(region_report('NORD', 2025))
\`\`\`

---

## Migrations-Checkliste

| SAS-Konstrukt | Spark SQL / Databricks | Aufwand |
|---------------|------------------------|---------|
| PROC SQL | SQL-Zelle | 🟢 Klein |
| FIRST. / LAST. | ROW_NUMBER() OVER (...) | 🟡 Mittel |
| RETAIN kumuliert | SUM() OVER (ROWS UNBOUNDED PRECEDING) | 🟢 Klein |
| LAG() im DATA Step | LAG() OVER (PARTITION BY ...) | 🟢 Klein |
| MERGE ... BY | JOIN oder MERGE INTO | 🟡 Mittel |
| %MACRO / %MEND | Python-Funktion | 🟡 Mittel |
`,
      exercise: {
        steps: [
          {
            title: "Neuesten Vertrag je Kunde",
            instruction: "Finde den aktuellsten Vertrag je Kunde (höchstes gueltig_ab). SAS: LAST. nach BY kundennr gueltig_ab / Spark SQL: ROW_NUMBER() OVER (...ORDER BY gueltig_ab DESC) WHERE rn=1.",
            hint: "SQL: SELECT * FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY kundennr ORDER BY gueltig_ab DESC) AS rn FROM ...) WHERE rn = 1"
          },
          {
            title: "Kumulative Verbrauchssumme",
            instruction: "Berechne für jeden Kunden den kumulierten Verbrauch über alle Monate. SAS: RETAIN kum_verbrauch mit BY-Gruppe / Spark: SUM() OVER (ROWS UNBOUNDED PRECEDING).",
            hint: "SQL: SUM(verbrauch_kwh) OVER (PARTITION BY kundennr ORDER BY datum ROWS UNBOUNDED PRECEDING)"
          },
          {
            title: "Filter: Nur >1000 kWh",
            instruction: "Behalte nur Kunden, bei denen der Gesamtverbrauch über 1000 kWh liegt. Verbinde die beiden CTEs mit einem JOIN.",
            hint: "SAS: Merge akt_vertrag und verbrauch_kum über BY kundennr, dann IF kum > 1000 / SQL: INNER JOIN und WHERE kum > 1000"
          }
        ],
        sasStarter: `/* SAS Original */

PROC SORT DATA=vertraege; BY kundennr gueltig_ab; RUN;
DATA akt_vertrag;
  SET vertraege;
  BY kundennr;
  IF ____.kundennr;  /* Letzter je Kunde */
RUN;

PROC SORT DATA=verbrauch; BY kundennr datum; RUN;
DATA verbrauch_kum;
  SET verbrauch;
  BY kundennr;
  RETAIN kum ____;
  IF FIRST.kundennr THEN kum = 0;
  kum + ____;
RUN;

DATA ergebnis;
  MERGE akt_vertrag (IN=a) verbrauch_kum (IN=b);
  BY kundennr;
  IF a AND b AND kum > ____;
RUN;`,
        pysparkStarter: `-- Spark SQL: Alles in einer Query mit CTEs
WITH akt_vertrag AS (
  SELECT * FROM (
    SELECT *,
      ____(  ) OVER (
        PARTITION BY kundennr
        ORDER BY gueltig_ab ____
      ) AS rn
    FROM vertraege
  )
  WHERE rn = ____
),
verbrauch_kum AS (
  SELECT kundennr,
    MAX(____(verbrauch_kwh) OVER (
      PARTITION BY kundennr
      ORDER BY datum
      ROWS ____ PRECEDING
    )) AS gesamtverbrauch
  FROM verbrauch
  GROUP BY kundennr
)
SELECT v.kundennr, v.tarif, v.gueltig_ab, k.gesamtverbrauch
FROM akt_vertrag v
INNER JOIN verbrauch_kum k ON v.kundennr = k.kundennr
WHERE k.gesamtverbrauch > ____
ORDER BY k.gesamtverbrauch DESC;`,
        sasSolution: `/* SAS Original */

PROC SORT DATA=vertraege; BY kundennr gueltig_ab; RUN;
DATA akt_vertrag;
  SET vertraege;
  BY kundennr;
  IF LAST.kundennr;
RUN;

PROC SORT DATA=verbrauch; BY kundennr datum; RUN;
DATA verbrauch_kum;
  SET verbrauch;
  BY kundennr;
  RETAIN kum 0;
  IF FIRST.kundennr THEN kum = 0;
  kum + verbrauch_kwh;
RUN;

DATA ergebnis;
  MERGE akt_vertrag (IN=a) verbrauch_kum (IN=b);
  BY kundennr;
  IF a AND b AND kum > 1000;
RUN;`,
        pysparkSolution: `-- Spark SQL: Alles in einer Query mit CTEs
WITH akt_vertrag AS (
  SELECT * FROM (
    SELECT *,
      ROW_NUMBER() OVER (
        PARTITION BY kundennr
        ORDER BY gueltig_ab DESC
      ) AS rn
    FROM vertraege
  )
  WHERE rn = 1
),
verbrauch_kum AS (
  SELECT kundennr,
    MAX(SUM(verbrauch_kwh) OVER (
      PARTITION BY kundennr
      ORDER BY datum
      ROWS UNBOUNDED PRECEDING
    )) AS gesamtverbrauch
  FROM verbrauch
  GROUP BY kundennr
)
SELECT v.kundennr, v.tarif, v.gueltig_ab, k.gesamtverbrauch
FROM akt_vertrag v
INNER JOIN verbrauch_kum k ON v.kundennr = k.kundennr
WHERE k.gesamtverbrauch > 1000
ORDER BY k.gesamtverbrauch DESC;`,
        expectedOutput: `+----------+--------+------------+-----------------+
|kundennr  |tarif   |gueltig_ab  |gesamtverbrauch  |
+----------+--------+------------+-----------------+
|K00142    |Premium |2025-01-01  |8421.30          |
|K00087    |Smart   |2024-07-01  |7203.41          |
|K00234    |Basis   |2025-03-01  |6187.66          |
+----------+--------+------------+-----------------+
Ergebnis: 9.847 Kunden mit >1000 kWh`,
        hints: [
          "SAS LAST. = Spark ROW_NUMBER() OVER (...ORDER BY datum DESC) WHERE rn = 1",
          "SAS RETAIN + kum + verbrauch = Spark SUM() OVER (ROWS UNBOUNDED PRECEDING)",
          "CTEs (WITH ...) machen Spark SQL lesbarer — jeder CTE entspricht einem DATA Step in SAS"
        ]
      }
    }
  ]
}

]; // Ende MODULES
