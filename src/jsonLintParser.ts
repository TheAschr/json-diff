// @ts-nocheck

interface Location {
  first_line: number;
  first_column: number;
  last_line: number;
  last_column: number;
}

const lexer = {
  EOF: 1,
  parseError: function parseError(str, hash) {
    if (this.yy.parseError) {
      this.yy.parseError(str, hash);
    } else {
      throw new Error(str);
    }
  },
  setInput: function (input) {
    this._input = input;
    this._more = this._less = this.done = false;
    this.yylineno = this.yyleng = 0;
    this.yytext = this.matched = this.match = "";
    this.conditionStack = ["INITIAL"];
    this.yylloc = {
      first_line: 1,
      first_column: 0,
      last_line: 1,
      last_column: 0,
    };
    return this;
  },
  input: function () {
    const ch = this._input[0];
    this.yytext += ch;
    this.yyleng++;
    this.match += ch;
    this.matched += ch;
    const lines = ch.match(/\n/);
    if (lines) this.yylineno++;
    this._input = this._input.slice(1);
    return ch;
  },
  unput: function (ch) {
    this._input = ch + this._input;
    return this;
  },
  more: function () {
    this._more = true;
    return this;
  },
  less: function (n) {
    this._input = this.match.slice(n) + this._input;
  },
  pastInput: function () {
    const past = this.matched.substr(
      0,
      this.matched.length - this.match.length
    );
    return (
      (past.length > 20 ? "..." : "") + past.substr(-20).replace(/\n/g, "")
    );
  },
  upcomingInput: function () {
    let next = this.match;
    if (next.length < 20) {
      next += this._input.substr(0, 20 - next.length);
    }
    return (next.substr(0, 20) + (next.length > 20 ? "..." : "")).replace(
      /\n/g,
      ""
    );
  },
  showPosition: function () {
    const pre = this.pastInput();
    const c = new Array(pre.length + 1).join("-");
    return pre + this.upcomingInput() + "\n" + c + "^";
  },
  next: function () {
    if (this.done) {
      return this.EOF;
    }
    if (!this._input) this.done = true;

    let token, match, tempMatch, index, lines;
    if (!this._more) {
      this.yytext = "";
      this.match = "";
    }
    const rules = this._currentRules();
    for (let i = 0; i < rules.length; i++) {
      tempMatch = this._input.match(this.rules[rules[i]]);
      if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
        match = tempMatch;
        index = i;
        if (!this.options.flex) break;
      }
    }
    if (match) {
      lines = match[0].match(/\n.*/g);
      if (lines) this.yylineno += lines.length;
      this.yylloc = {
        first_line: this.yylloc.last_line,
        last_line: this.yylineno + 1,
        first_column: this.yylloc.last_column,
        last_column: lines
          ? lines[lines.length - 1].length - 1
          : this.yylloc.last_column + match[0].length,
      };
      this.yytext += match[0];
      this.match += match[0];
      this.yyleng = this.yytext.length;
      this._more = false;
      this._input = this._input.slice(match[0].length);
      this.matched += match[0];
      token = this.performAction.call(
        this,
        this.yy,
        this,
        rules[index],
        this.conditionStack[this.conditionStack.length - 1]
      );
      if (this.done && this._input) this.done = false;
      if (token) return token;
      else return;
    }
    if (this._input === "") {
      return this.EOF;
    } else {
      this.parseError(
        "Lexical error on line " +
          (this.yylineno + 1) +
          ". Unrecognized text.\n" +
          this.showPosition(),
        { text: "", token: null, line: this.yylineno }
      );
    }
  },
  lex: function lex() {
    const r = this.next();
    if (typeof r !== "undefined") {
      return r;
    } else {
      return this.lex();
    }
  },
  begin: function begin(condition) {
    this.conditionStack.push(condition);
  },
  popState: function popState() {
    return this.conditionStack.pop();
  },
  _currentRules: function _currentRules() {
    return this.conditions[this.conditionStack[this.conditionStack.length - 1]]
      .rules;
  },
  topState: function () {
    return this.conditionStack[this.conditionStack.length - 2];
  },
  pushState: function begin(condition) {
    this.begin(condition);
  },
  options: {},
  performAction: function anonymous(_, yy_, $avoiding_name_collisions) {
    switch ($avoiding_name_collisions) {
      case 0 /* skip whitespace */:
        break;
      case 1:
        return 6;
      case 2:
        yy_.yytext = yy_.yytext.substr(1, yy_.yyleng - 2);
        return 4;
      case 3:
        return 17;

      case 4:
        return 18;

      case 5:
        return 23;

      case 6:
        return 24;

      case 7:
        return 22;

      case 8:
        return 21;

      case 9:
        return 10;

      case 10:
        return 11;

      case 11:
        return 8;

      case 12:
        return 14;

      case 13:
        return "INVALID";
    }
  },
  rules: [
    /^(?:\s+)/,
    /^(?:(-?([0-9]|[1-9][0-9]+))(\.[0-9]+)?([eE][-+]?[0-9]+)?\b)/,
    // eslint-disable-next-line no-control-regex
    /^(?:"(?:\\[\\"bfnrt/]|\\u[a-fA-F0-9]{4}|[^\\\0-\x09\x0a-\x1f"])*")/,
    /^(?:\{)/,
    /^(?:\})/,
    /^(?:\[)/,
    /^(?:\])/,
    /^(?:,)/,
    /^(?::)/,
    /^(?:true\b)/,
    /^(?:false\b)/,
    /^(?:null\b)/,
    /^(?:$)/,
    /^(?:.)/,
  ],
  conditions: {
    INITIAL: {
      rules: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      inclusive: true,
    },
  },
};

export const jsonLintParser = {
  yy: {},
  lexer,
  symbols_: {
    error: 2,
    JSONString: 3,
    STRING: 4,
    JSONNumber: 5,
    NUMBER: 6,
    JSONNullLiteral: 7,
    NULL: 8,
    JSONBooleanLiteral: 9,
    TRUE: 10,
    FALSE: 11,
    JSONText: 12,
    JSONValue: 13,
    EOF: 14,
    JSONObject: 15,
    JSONArray: 16,
    "{": 17,
    "}": 18,
    JSONMemberList: 19,
    JSONMember: 20,
    ":": 21,
    ",": 22,
    "[": 23,
    "]": 24,
    JSONElementList: 25,
    $accept: 0,
    $end: 1,
  },
  terminals_: {
    2: "error",
    4: "STRING",
    6: "NUMBER",
    8: "NULL",
    10: "TRUE",
    11: "FALSE",
    14: "EOF",
    17: "{",
    18: "}",
    21: ":",
    22: ",",
    23: "[",
    24: "]",
  },
  productions_: [
    0,
    [3, 1],
    [5, 1],
    [7, 1],
    [9, 1],
    [9, 1],
    [12, 2],
    [13, 1],
    [13, 1],
    [13, 1],
    [13, 1],
    [13, 1],
    [13, 1],
    [15, 2],
    [15, 3],
    [20, 3],
    [19, 1],
    [19, 3],
    [16, 2],
    [16, 3],
    [25, 1],
    [25, 3],
  ],
  performAction: function anonymous(yytext, _, __, ___, yystate, $$) {
    const $0 = $$.length - 1;
    switch (yystate) {
      case 1: // replace escaped characters with actual character
        this.$ = yytext
          .replace(/\\(\\|")/g, "$1")
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r")
          .replace(/\\t/g, "\t")
          .replace(/\\v/g, "\v")
          .replace(/\\f/g, "\f")
          .replace(/\\b/g, "\b");

        break;
      case 2:
        this.$ = Number(yytext);
        break;
      case 3:
        this.$ = null;
        break;
      case 4:
        this.$ = true;
        break;
      case 5:
        this.$ = false;
        break;
      case 6:
        return (this.$ = $$[$0 - 1]);
      case 13:
        this.$ = {};
        break;
      case 14:
        this.$ = $$[$0 - 1];
        break;
      case 15:
        this.$ = [$$[$0 - 2], $$[$0]];
        break;
      case 16:
        this.$ = {};
        this.$[$$[$0][0]] = $$[$0][1];
        break;
      case 17:
        this.$ = $$[$0 - 2];
        $$[$0 - 2][$$[$0][0]] = $$[$0][1];
        break;
      case 18:
        this.$ = [];
        break;
      case 19:
        this.$ = $$[$0 - 1];
        break;
      case 20:
        this.$ = [$$[$0]];
        break;
      case 21:
        this.$ = $$[$0 - 2];
        $$[$0 - 2].push($$[$0]);
        break;
    }
  },
  table: [
    {
      3: 5,
      4: [1, 12],
      5: 6,
      6: [1, 13],
      7: 3,
      8: [1, 9],
      9: 4,
      10: [1, 10],
      11: [1, 11],
      12: 1,
      13: 2,
      15: 7,
      16: 8,
      17: [1, 14],
      23: [1, 15],
    },
    { 1: [3] },
    { 14: [1, 16] },
    { 14: [2, 7], 18: [2, 7], 22: [2, 7], 24: [2, 7] },
    { 14: [2, 8], 18: [2, 8], 22: [2, 8], 24: [2, 8] },
    { 14: [2, 9], 18: [2, 9], 22: [2, 9], 24: [2, 9] },
    { 14: [2, 10], 18: [2, 10], 22: [2, 10], 24: [2, 10] },
    { 14: [2, 11], 18: [2, 11], 22: [2, 11], 24: [2, 11] },
    { 14: [2, 12], 18: [2, 12], 22: [2, 12], 24: [2, 12] },
    { 14: [2, 3], 18: [2, 3], 22: [2, 3], 24: [2, 3] },
    { 14: [2, 4], 18: [2, 4], 22: [2, 4], 24: [2, 4] },
    { 14: [2, 5], 18: [2, 5], 22: [2, 5], 24: [2, 5] },
    { 14: [2, 1], 18: [2, 1], 21: [2, 1], 22: [2, 1], 24: [2, 1] },
    { 14: [2, 2], 18: [2, 2], 22: [2, 2], 24: [2, 2] },
    { 3: 20, 4: [1, 12], 18: [1, 17], 19: 18, 20: 19 },
    {
      3: 5,
      4: [1, 12],
      5: 6,
      6: [1, 13],
      7: 3,
      8: [1, 9],
      9: 4,
      10: [1, 10],
      11: [1, 11],
      13: 23,
      15: 7,
      16: 8,
      17: [1, 14],
      23: [1, 15],
      24: [1, 21],
      25: 22,
    },
    { 1: [2, 6] },
    { 14: [2, 13], 18: [2, 13], 22: [2, 13], 24: [2, 13] },
    { 18: [1, 24], 22: [1, 25] },
    { 18: [2, 16], 22: [2, 16] },
    { 21: [1, 26] },
    { 14: [2, 18], 18: [2, 18], 22: [2, 18], 24: [2, 18] },
    { 22: [1, 28], 24: [1, 27] },
    { 22: [2, 20], 24: [2, 20] },
    { 14: [2, 14], 18: [2, 14], 22: [2, 14], 24: [2, 14] },
    { 3: 20, 4: [1, 12], 20: 29 },
    {
      3: 5,
      4: [1, 12],
      5: 6,
      6: [1, 13],
      7: 3,
      8: [1, 9],
      9: 4,
      10: [1, 10],
      11: [1, 11],
      13: 30,
      15: 7,
      16: 8,
      17: [1, 14],
      23: [1, 15],
    },
    { 14: [2, 19], 18: [2, 19], 22: [2, 19], 24: [2, 19] },
    {
      3: 5,
      4: [1, 12],
      5: 6,
      6: [1, 13],
      7: 3,
      8: [1, 9],
      9: 4,
      10: [1, 10],
      11: [1, 11],
      13: 31,
      15: 7,
      16: 8,
      17: [1, 14],
      23: [1, 15],
    },
    { 18: [2, 17], 22: [2, 17] },
    { 18: [2, 15], 22: [2, 15] },
    { 22: [2, 21], 24: [2, 21] },
  ],
  defaultActions: { 16: [2, 6] },
  parseError: function parseError(str: string) {
    throw new Error(str);
  },
  parse: function parse(input) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    let stack = [0];
    let vstack = [null]; // semantic value stack
    let lstack: Location[] = []; // location stack
    const table = this.table;
    let yytext = "";
    let yylineno = 0;
    let yyleng = 0;
    let recovering = 0;
    const TERROR = 2;
    const EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == "undefined") this.lexer.yylloc = {};
    let yyloc: Location = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === "function")
      this.parseError = this.yy.parseError;

    function popStack(n) {
      stack.length = stack.length - 2 * n;
      vstack.length = vstack.length - n;
      lstack.length = lstack.length - n;
    }

    function lex() {
      let token;
      token = self.lexer.lex() || 1; // $end = 1
      // if token isn't its numeric value, convert
      if (typeof token !== "number") {
        token = self.symbols_[token] || token;
      }
      return token;
    }

    let symbol;
    let preErrorSymbol;
    let state;
    let action;
    let r;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yyval: any = {};
    let p;
    let len;
    let newState;
    let expected;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // retreive state number from top of stack
      state = stack[stack.length - 1];

      // use default actions if available
      if (this.defaultActions[state]) {
        action = this.defaultActions[state];
      } else {
        if (symbol == null) symbol = lex();
        // read action for current state and first input
        action = table[state] && table[state][symbol];
      }

      // handle parse error
      if (typeof action === "undefined" || !action.length || !action[0]) {
        let errStr = "";
        if (!recovering) {
          // Report error
          expected = [];
          for (p in table[state])
            if (this.terminals_[p] && p > 2) {
              expected.push("'" + this.terminals_[p] + "'");
            }
          if (this.lexer.showPosition) {
            errStr =
              "Parse error on line " +
              (yylineno + 1) +
              ":\n" +
              this.lexer.showPosition() +
              "\nExpecting " +
              expected.join(", ") +
              ", got '" +
              this.terminals_[symbol] +
              "'";
          } else {
            errStr =
              "Parse error on line " +
              (yylineno + 1) +
              ": Unexpected " +
              (symbol === 1 /*EOF*/
                ? "end of input"
                : "'" + (this.terminals_[symbol] || symbol) + "'");
          }
          this.parseError(errStr, {
            text: this.lexer.match,
            token: this.terminals_[symbol] || symbol,
            line: this.lexer.yylineno,
            loc: yyloc,
            expected: expected,
          });
        }

        // just recovered from another error
        if (recovering === 3) {
          if (symbol === EOF) {
            throw new Error(errStr || "Parsing halted.");
          }

          // discard current lookahead and grab another
          yyleng = this.lexer.yyleng;
          yytext = this.lexer.yytext;
          yylineno = this.lexer.yylineno;
          yyloc = this.lexer.yylloc;
          symbol = lex();
        }

        // try to recover from error
        // eslint-disable-next-line no-constant-condition
        while (true) {
          // check for error recovery rule in this state
          if (TERROR.toString() in table[state]) {
            break;
          }
          if (state === 0) {
            throw new Error(errStr || "Parsing halted.");
          }
          popStack(1);
          state = stack[stack.length - 1];
        }

        preErrorSymbol = symbol; // save the lookahead token
        symbol = TERROR; // insert generic error symbol as new lookahead
        state = stack[stack.length - 1];
        action = table[state] && table[state][TERROR];
        recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
      }

      // this shouldn't happen, unless resolve defaults are off
      if (action[0] instanceof Array && action.length > 1) {
        throw new Error(
          "Parse Error: multiple actions possible at state: " +
            state +
            ", token: " +
            symbol
        );
      }

      switch (action[0]) {
        case 1: // shift
          //this.shiftCount++;

          stack.push(symbol);
          vstack.push(this.lexer.yytext);
          lstack.push(this.lexer.yylloc);
          stack.push(action[1]); // push state
          symbol = null;
          if (!preErrorSymbol) {
            // normal execution/no error
            yyleng = this.lexer.yyleng;
            yytext = this.lexer.yytext;
            yylineno = this.lexer.yylineno;
            yyloc = this.lexer.yylloc;
            if (recovering > 0) recovering--;
          } else {
            // error just occurred, resume old lookahead f/ before error
            symbol = preErrorSymbol;
            preErrorSymbol = null;
          }
          break;

        case 2: // reduce
          //this.reductionCount++;

          len = this.productions_[action[1]][1];

          // perform semantic action
          yyval.$ = vstack[vstack.length - len]; // default to $$ = $1
          // default location, uses first token for firsts, last for lasts
          yyval._$ = {
            first_line: lstack[lstack.length - (len || 1)].first_line,
            last_line: lstack[lstack.length - 1].last_line,
            first_column: lstack[lstack.length - (len || 1)].first_column,
            last_column: lstack[lstack.length - 1].last_column,
          };
          r = this.performAction.call(
            yyval,
            yytext,
            yyleng,
            yylineno,
            this.yy,
            action[1],
            vstack,
            lstack
          );

          if (typeof r !== "undefined") {
            return r;
          }

          // pop off stack
          if (len) {
            stack = stack.slice(0, -1 * len * 2);
            vstack = vstack.slice(0, -1 * len);
            lstack = lstack.slice(0, -1 * len);
          }

          stack.push(this.productions_[action[1]][0]); // push nonterminal (reduce)
          vstack.push(yyval.$);
          lstack.push(yyval._$);
          // goto new state = table[STATE][NONTERMINAL]
          newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
          stack.push(newState);
          break;

        case 3: // accept
          return true;
      }
    }
  },
};