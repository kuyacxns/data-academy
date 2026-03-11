  // Configure autoloader path
  if (typeof Prism !== 'undefined' && Prism.plugins && Prism.plugins.autoloader) {
    Prism.plugins.autoloader.languages_path =
      'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';
  }

  // Define SAS language for Prism
  Prism.languages.sas = {
    'comment': /\/\*[\s\S]*?\*\//,
    'string': { pattern: /(['"])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, greedy: true },
    'keyword': {
      pattern: /\b(DATA|PROC|RUN|QUIT|SET|MERGE|BY|IF|THEN|ELSE|DO|END|OUTPUT|KEEP|DROP|RENAME|WHERE|INPUT|CARDS|DATALINES|FORMAT|INFORMAT|LENGTH|LABEL|ATTRIB|ARRAY|RETAIN|CALL|PUT|FILE|INFILE|FILENAME|LIBNAME|OPTIONS|TITLE|FOOTNOTE|ODS|CLASS|VAR|MODEL|TABLES|WEIGHT|FREQ|MEANS|SORT|PRINT|CONTENTS|DATASETS|IMPORT|EXPORT|SQL|SELECT|FROM|INTO|LEFT|INNER|OUTER|JOIN|ON|GROUP|ORDER|HAVING|AS|CASE|WHEN|COALESCE|DISTINCT|NOT|AND|OR|IN|BETWEEN|LIKE|IS|NULL|MISSING|NE|EQ|LE|GE|LT|GT|OUT)\b/i,
      alias: 'keyword'
    },
    'function': {
      pattern: /\b(UPCASE|LOWCASE|TRIM|STRIP|COMPRESS|LENGTH|SUBSTR|INDEX|SCAN|TRANWRD|TRANSLATE|CAT|CATS|CATT|CATX|INT|ROUND|FLOOR|CEIL|ABS|SQRT|LOG|EXP|MOD|RANK|CHAR|BYTE|ANYALPHA|ANYDIGIT|DATE|TODAY|DATETIME|MDY|DATEPART|TIMEPART|INTCK|INTNX|COMPBL|PRXMATCH|PRXPARSE|PRXCHANGE|PRXFREE|COUNT|SUM|AVG|MIN|MAX|MEAN|N|NMISS|PUT|INPUT|OPEN|ATTRN|CLOSE|SYSFUNC|SYSEVALF|VARNUM|VARNAME)\b(?=\s*\()/i,
    },
    'macro': { pattern: /%\w+/, alias: 'variable' },
    'macro-var': { pattern: /&\w+\.?/, alias: 'variable' },
    'number': /\b\d+\.?\d*\b/,
    'operator': /[<>=!|&+\-*\/]/,
    'punctuation': /[;.,()[\]{}]/
  };
  </script>

  <!-- Block 2b: Custom SAS syntax mode for CodeMirror (uses defineMode - no addon needed) -->
  <script>
  (function() {
    var SAS_KEYWORDS = /^(DATA|PROC|RUN|QUIT|SET|MERGE|BY|IF|THEN|ELSE|DO|END|OUTPUT|KEEP|DROP|RENAME|WHERE|INPUT|CARDS|DATALINES|FORMAT|INFORMAT|LENGTH|LABEL|ATTRIB|ARRAY|RETAIN|CALL|PUT|FILE|INFILE|FILENAME|LIBNAME|OPTIONS|TITLE|FOOTNOTE|ODS|CLASS|VAR|MODEL|TABLES|WEIGHT|FREQ|MEANS|SORT|PRINT|CONTENTS|DATASETS|IMPORT|EXPORT|SQL|SELECT|FROM|INTO|LEFT|INNER|OUTER|JOIN|ON|GROUP|ORDER|HAVING|AS|CASE|WHEN|COALESCE|COUNT|SUM|AVG|MIN|MAX|DISTINCT|NOT|AND|OR|IN|BETWEEN|LIKE|IS|NULL|MISSING|NE|EQ|LE|GE|LT|GT|UPDATE|INSERT|DELETE|CREATE|DROP|TABLE|VIEW|INDEX|INTNX|INTCK|OUT|NOOBS|NODUPKEY|DUPKEY|DESCENDING|ASCENDING|NODUPS)$/i;

    var SAS_BUILTINS = /^(UPCASE|LOWCASE|TRIM|STRIP|COMPRESS|COMPBL|SUBSTR|INDEX|SCAN|TRANWRD|TRANSLATE|CAT|CATS|CATT|CATX|INT|ROUND|FLOOR|CEIL|ABS|SQRT|LOG|LOG2|LOG10|EXP|MOD|RANK|CHAR|BYTE|ANYALPHA|ANYDIGIT|ANYPUNCT|ANYSPACE|DATE|TODAY|DATETIME|MDY|DMY|DATEPART|TIMEPART|YEAR|MONTH|DAY|QTR|WEEK|DATDIF|YRDIF|PRXMATCH|PRXPARSE|PRXCHANGE|PRXFREE|PRXPOSN|PRXNEXT|PRXSUBSTR|NOBS|SYMGET|SYMPUT|SYMPUTX|SYSFUNC|SYSEVALF|OPEN|CLOSE|ATTRN|VARNUM|VARNAME|IFC|IFN|COALESCE|COALESCEC|MISSING|NMISS|CMISS|LARGEST|SMALLEST|RANGE|STD|VAR|STDERR|KURTOSIS|SKEWNESS|GEOMEAN|HARMEAN|CSSQ|USSQ|SS|SUMWGT|T|PROBT)$/i;

    CodeMirror.defineMode("sas", function() {
      return {
        startState: function() {
          return { inComment: false, inString: false, stringChar: null };
        },
        token: function(stream, state) {
          // Multi-line comment
          if (state.inComment) {
            if (stream.match(/.*?\*\//)) { state.inComment = false; return "comment"; }
            stream.skipToEnd();
            return "comment";
          }

          // Whitespace
          if (stream.eatSpace()) return null;

          // Start of block comment
          if (stream.match("/*")) { state.inComment = true; return "comment"; }

          // Single-line comment (*)
          if (stream.sol() && stream.peek() === "*") {
            stream.skipToEnd(); return "comment";
          }

          // Strings
          var ch = stream.peek();
          if (ch === '"' || ch === "'") {
            stream.next();
            while (!stream.eol()) {
              var c = stream.next();
              if (c === ch) break;
            }
            return "string";
          }

          // Macro: %keyword or &var
          if (ch === "%") { stream.next(); stream.eatWhile(/\w/); return "variable-2"; }
          if (ch === "&") { stream.next(); stream.eatWhile(/[\w\.]/); return "variable-2"; }

          // Numbers
          if (/\d/.test(ch) || (ch === "." && /\d/.test(stream.string[stream.pos + 1]))) {
            stream.match(/[\d]*\.?[\d]*/);
            return "number";
          }

          // Words: keywords, builtins, identifiers
          if (/[a-zA-Z_]/.test(ch)) {
            var word = stream.match(/[a-zA-Z_][\w]*/)[0];
            if (SAS_KEYWORDS.test(word))  return "keyword";
            if (SAS_BUILTINS.test(word) && stream.peek() === "(") return "builtin";
            return "variable";
          }

          // Operators
          if (/[<>=!+\-*\/|]/.test(ch)) { stream.next(); return "operator"; }

          // Punctuation (semicolon highlighted as keyword for visibility)
          if (ch === ";") { stream.next(); return "keyword"; }

          stream.next();
          return null;
        }
      };
    });
  })();
