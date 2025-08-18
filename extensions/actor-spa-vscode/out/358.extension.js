'use strict';
(exports.id = 358),
  (exports.ids = [358]),
  (exports.modules = {
    3358: (e, t, r) => {
      r.r(t),
        r.d(t, {
          default: () => Vn,
          languages: () => dn,
          options: () => Fn,
          parsers: () => mn,
          printers: () => Mn,
        });
      var n = Object.create,
        u = Object.defineProperty,
        i = Object.getOwnPropertyDescriptor,
        o = Object.getOwnPropertyNames,
        a = Object.getPrototypeOf,
        l = Object.prototype.hasOwnProperty,
        s = (e) => {
          throw TypeError(e);
        },
        c = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports),
        D = (e, t) => {
          for (var r in t) u(e, r, { get: t[r], enumerable: !0 });
        },
        f = (e, t, r) => (
          (r = null != e ? n(a(e)) : {}),
          ((e, t, r, n) => {
            if ((t && 'object' == typeof t) || 'function' == typeof t)
              for (let r of o(t))
                !l.call(e, r) &&
                  undefined !== r &&
                  u(e, r, { get: () => t[r], enumerable: !(n = i(t, r)) || n.enumerable });
            return e;
          })(!t && e && e.__esModule ? r : u(r, 'default', { value: e, enumerable: !0 }), e)
        ),
        p = (e, t, r) => t.has(e) || s('Cannot ' + r),
        h = (e, t, r) => (p(e, t, 'read from private field'), r ? r.call(e) : t.get(e)),
        d = c((e, t) => {
          t.exports = function (e) {
            return String(e).replace(/\s+/g, ' ');
          };
        }),
        g = c((e, t) => {
          t.exports = function (e) {
            var t = this.Parser,
              g = this.Compiler;
            (function (e) {
              return !!(e && e.prototype && e.prototype.blockTokenizers);
            })(t) &&
              (function (e, t) {
                for (
                  var g,
                    F = t || {},
                    m = e.prototype,
                    C = m.blockTokenizers,
                    E = m.inlineTokenizers,
                    b = m.blockMethods,
                    v = m.inlineMethods,
                    y = C.definition,
                    A = E.reference,
                    x = [],
                    w = -1,
                    k = b.length;
                  ++w < k;
                )
                  'newline' !== (g = b[w]) &&
                    'indentedCode' !== g &&
                    'paragraph' !== g &&
                    'footnoteDefinition' !== g &&
                    x.push([g]);
                function B(e, t, i) {
                  var o,
                    l,
                    D,
                    f,
                    p = t.length + 1,
                    h = 0;
                  if (t.charCodeAt(h++) === a && t.charCodeAt(h++) === c) {
                    for (l = h; h < p; ) {
                      if ((f = t.charCodeAt(h)) != f || f === n || f === r || f === u) return;
                      if (f === s) {
                        (D = h), h++;
                        break;
                      }
                      h++;
                    }
                    if (void 0 !== D && l !== D)
                      return (
                        !!i ||
                        ((o = t.slice(l, D)),
                        e(t.slice(0, h))({
                          type: 'footnoteReference',
                          identifier: o.toLowerCase(),
                          label: o,
                        }))
                      );
                  }
                }
                function q(e, t, r) {
                  var n,
                    u,
                    i,
                    o,
                    f,
                    p,
                    h,
                    d = t.length + 1,
                    g = 0,
                    F = 0;
                  if (t.charCodeAt(g++) === c && t.charCodeAt(g++) === a) {
                    for (i = g; g < d; ) {
                      if ((u = t.charCodeAt(g)) != u) return;
                      if (void 0 === p)
                        if (u === l) g += 2;
                        else if (u === a) F++, g++;
                        else if (u === s) {
                          if (0 === F) {
                            (o = g), g++;
                            break;
                          }
                          F--, g++;
                        } else if (u === D) {
                          for (f = g, p = 1; t.charCodeAt(f + p) === D; ) p++;
                          g += p;
                        } else g++;
                      else if (u === D) {
                        for (f = g, h = 1; t.charCodeAt(f + h) === D; ) h++;
                        (g += h), p === h && (p = void 0), (h = void 0);
                      } else g++;
                    }
                    if (void 0 !== o)
                      return (
                        !!r ||
                        (((n = e.now()).column += 2),
                        (n.offset += 2),
                        e(t.slice(0, g))({
                          type: 'footnote',
                          children: this.tokenizeInline(t.slice(i, o), n),
                        }))
                      );
                  }
                }
                function S(e, t, r) {
                  var n = 0;
                  if (
                    (t.charCodeAt(n) === i && n++,
                    t.charCodeAt(n) === a && t.charCodeAt(n + 1) !== c)
                  )
                    return A.call(this, e, t, r);
                }
                x.push(['footnoteDefinition']),
                  F.inlineNotes && (h(v, 'reference', 'inlineNote'), (E.inlineNote = q)),
                  h(b, 'definition', 'footnoteDefinition'),
                  h(v, 'reference', 'footnoteCall'),
                  (C.definition = function (e, t, n) {
                    for (var i = 0, o = t.charCodeAt(i); o === u || o === r; )
                      o = t.charCodeAt(++i);
                    if (o === a && t.charCodeAt(i + 1) !== c) return y.call(this, e, t, n);
                  }),
                  (C.footnoteDefinition = function (e, t, i) {
                    for (
                      var l,
                        D,
                        h,
                        g,
                        F,
                        m,
                        E,
                        b,
                        v,
                        y,
                        A,
                        x,
                        w,
                        k = this,
                        B = k.interruptFootnoteDefinition,
                        q = k.offset,
                        S = t.length + 1,
                        T = 0,
                        L = [];
                      T < S && ((g = t.charCodeAt(T)) === r || g === u);
                    )
                      T++;
                    if (t.charCodeAt(T++) === a && t.charCodeAt(T++) === c) {
                      for (D = T; T < S; ) {
                        if ((g = t.charCodeAt(T)) != g || g === n || g === r || g === u) return;
                        if (g === s) {
                          (h = T), T++;
                          break;
                        }
                        T++;
                      }
                      if (void 0 !== h && D !== h && t.charCodeAt(T++) === o) {
                        if (i) return !0;
                        for (l = t.slice(D, h), F = e.now(), v = 0, y = 0, A = T, x = []; T < S; ) {
                          if ((g = t.charCodeAt(T)) != g || g === n)
                            (w = { start: v, contentStart: A || T, contentEnd: T, end: T }),
                              x.push(w),
                              g === n && ((v = T + 1), (y = 0), (A = void 0), (w.end = v));
                          else if (void 0 !== y)
                            if (g === u || g === r)
                              (y += g === u ? 1 : f - (y % f)) > f && ((y = void 0), (A = T));
                            else {
                              if (
                                y < f &&
                                w &&
                                (w.contentStart === w.contentEnd ||
                                  d(B, C, k, [e, t.slice(T, p), !0]))
                              )
                                break;
                              (y = void 0), (A = T);
                            }
                          T++;
                        }
                        for (
                          T = -1, S = x.length;
                          S > 0 && (w = x[S - 1]).contentStart === w.contentEnd;
                        )
                          S--;
                        for (m = e(t.slice(0, w.contentEnd)); ++T < S; )
                          (w = x[T]),
                            (q[F.line + T] = (q[F.line + T] || 0) + (w.contentStart - w.start)),
                            L.push(t.slice(w.contentStart, w.end));
                        return (
                          (E = k.enterBlock()),
                          (b = k.tokenizeBlock(L.join(''), F)),
                          E(),
                          m({
                            type: 'footnoteDefinition',
                            identifier: l.toLowerCase(),
                            label: l,
                            children: b,
                          })
                        );
                      }
                    }
                  }),
                  (E.footnoteCall = B),
                  (E.reference = S),
                  (m.interruptFootnoteDefinition = x),
                  (S.locator = A.locator),
                  (B.locator = function (e, t) {
                    return e.indexOf('[', t);
                  }),
                  (q.locator = function (e, t) {
                    return e.indexOf('^[', t);
                  });
              })(t, e),
              (function (e) {
                return !!(e && e.prototype && e.prototype.visitors);
              })(g) &&
                (function (e) {
                  var t = e.prototype.visitors;
                  (t.footnote = function (e) {
                    return '^[' + this.all(e).join('') + ']';
                  }),
                    (t.footnoteReference = function (e) {
                      return '[^' + (e.label || e.identifier) + ']';
                    }),
                    (t.footnoteDefinition = function (e) {
                      for (
                        var t, r = this.all(e).join('\n\n').split('\n'), n = 0, u = r.length;
                        ++n < u;
                      )
                        '' !== (t = r[n]) && (r[n] = '    ' + t);
                      return '[^' + (e.label || e.identifier) + ']: ' + r.join('\n');
                    });
                })(g);
          };
          var r = 9,
            n = 10,
            u = 32,
            i = 33,
            o = 58,
            a = 91,
            l = 92,
            s = 93,
            c = 94,
            D = 96,
            f = 4,
            p = 1024;
          function h(e, t, r) {
            e.splice(e.indexOf(t), 0, r);
          }
          function d(e, t, r, n) {
            for (var u = e.length, i = -1; ++i < u; ) if (t[e[i][0]].apply(r, n)) return !0;
            return !1;
          }
        }),
        F = c((e) => {
          (e.isRemarkParser = function (e) {
            return !!(e && e.prototype && e.prototype.blockTokenizers);
          }),
            (e.isRemarkCompiler = function (e) {
              return !!(e && e.prototype && e.prototype.visitors);
            });
        }),
        m = c((e, t) => {
          var r = F();
          t.exports = function (e) {
            let t = this.Parser,
              D = this.Compiler;
            r.isRemarkParser(t) &&
              (function (e, t) {
                let r = e.prototype,
                  D = r.inlineMethods;
                function f(e, r, D) {
                  let f,
                    p,
                    h,
                    d,
                    g,
                    F,
                    m,
                    C = r.length,
                    E = !1,
                    b = !1,
                    v = 0;
                  if ((r.charCodeAt(v) === l && ((b = !0), v++), r.charCodeAt(v) === i)) {
                    if ((v++, b)) return !!D || e(r.slice(0, v))({ type: 'text', value: '$' });
                    if (
                      (r.charCodeAt(v) === i && ((E = !0), v++),
                      (h = r.charCodeAt(v)),
                      h !== u && h !== n)
                    ) {
                      for (d = v; v < C; ) {
                        if (((p = h), (h = r.charCodeAt(v + 1)), p === i)) {
                          if (
                            ((f = r.charCodeAt(v - 1)),
                            f !== u && f !== n && (h != h || h < o || h > a) && (!E || h === i))
                          ) {
                            (g = v - 1), v++, E && v++, (F = v);
                            break;
                          }
                        } else p === l && (v++, (h = r.charCodeAt(v + 1)));
                        v++;
                      }
                      if (void 0 !== F)
                        return (
                          !!D ||
                          ((m = r.slice(d, g + 1)),
                          e(r.slice(0, F))({
                            type: 'inlineMath',
                            value: m,
                            data: {
                              hName: 'span',
                              hProperties: {
                                className: s.concat(E && t.inlineMathDouble ? [c] : []),
                              },
                              hChildren: [{ type: 'text', value: m }],
                            },
                          }))
                        );
                    }
                  }
                }
                (f.locator = function (e, t) {
                  return e.indexOf('$', t);
                }),
                  (r.inlineTokenizers.math = f),
                  D.splice(D.indexOf('text'), 0, 'math');
              })(t, e),
              r.isRemarkCompiler(D) &&
                (function (e) {
                  e.prototype.visitors.inlineMath = function (e) {
                    let t = '$';
                    return (
                      (
                        (e.data && e.data.hProperties && e.data.hProperties.className) ||
                        []
                      ).includes(c) && (t = '$$'),
                      t + e.value + t
                    );
                  };
                })(D);
          };
          var n = 9,
            u = 32,
            i = 36,
            o = 48,
            a = 57,
            l = 92,
            s = ['math', 'math-inline'],
            c = 'math-display';
        }),
        C = c((e, t) => {
          var r = F();
          t.exports = function () {
            let e = this.Parser,
              t = this.Compiler;
            r.isRemarkParser(e) &&
              (function (e) {
                let t = e.prototype,
                  r = t.blockMethods,
                  c = t.interruptParagraph,
                  D = t.interruptList,
                  f = t.interruptBlockquote;
                (t.blockTokenizers.math = function (e, t, r) {
                  var c = t.length,
                    D = 0;
                  let f, p, h, d, g, F, m, C, E, b, v;
                  for (; D < c && t.charCodeAt(D) === u; ) D++;
                  for (g = D; D < c && t.charCodeAt(D) === i; ) D++;
                  if (((F = D - g), !(F < l))) {
                    for (; D < c && t.charCodeAt(D) === u; ) D++;
                    for (m = D; D < c; ) {
                      if (((f = t.charCodeAt(D)), f === i)) return;
                      if (f === n) break;
                      D++;
                    }
                    if (t.charCodeAt(D) === n) {
                      if (r) return !0;
                      for (
                        p = [],
                          m !== D && p.push(t.slice(m, D)),
                          D++,
                          h = t.indexOf(o, D + 1),
                          h = -1 === h ? c : h;
                        D < c;
                      ) {
                        for (
                          C = !1, b = D, v = h, d = h, E = 0;
                          d > b && t.charCodeAt(d - 1) === u;
                        )
                          d--;
                        for (; d > b && t.charCodeAt(d - 1) === i; ) E++, d--;
                        for (
                          F <= E && t.indexOf(a, b) === d && ((C = !0), (v = d));
                          b <= v && b - D < g && t.charCodeAt(b) === u;
                        )
                          b++;
                        if (C) for (; v > b && t.charCodeAt(v - 1) === u; ) v--;
                        if (((!C || b !== v) && p.push(t.slice(b, v)), C)) break;
                        (D = h + 1), (h = t.indexOf(o, D + 1)), (h = -1 === h ? c : h);
                      }
                      return (
                        (p = p.join('\n')),
                        e(t.slice(0, h))({
                          type: 'math',
                          value: p,
                          data: {
                            hName: 'div',
                            hProperties: { className: s.concat() },
                            hChildren: [{ type: 'text', value: p }],
                          },
                        })
                      );
                    }
                  }
                }),
                  r.splice(r.indexOf('fencedCode') + 1, 0, 'math'),
                  c.splice(c.indexOf('fencedCode') + 1, 0, ['math']),
                  D.splice(D.indexOf('fencedCode') + 1, 0, ['math']),
                  f.splice(f.indexOf('fencedCode') + 1, 0, ['math']);
              })(e),
              r.isRemarkCompiler(t) &&
                (function (e) {
                  e.prototype.visitors.math = function (e) {
                    return '$$\n' + e.value + '\n$$';
                  };
                })(t);
          };
          var n = 10,
            u = 32,
            i = 36,
            o = '\n',
            a = '$',
            l = 2,
            s = ['math', 'math-display'];
        }),
        E = c((e, t) => {
          var r = m(),
            n = C();
          t.exports = function (e) {
            var t = e || {};
            n.call(this, t), r.call(this, t);
          };
        }),
        b = c((e, t) => {
          t.exports = function () {
            for (var e = {}, t = 0; t < arguments.length; t++) {
              var n = arguments[t];
              for (var u in n) r.call(n, u) && (e[u] = n[u]);
            }
            return e;
          };
          var r = Object.prototype.hasOwnProperty;
        }),
        v = c((e, t) => {
          'function' == typeof Object.create
            ? (t.exports = function (e, t) {
                t &&
                  ((e.super_ = t),
                  (e.prototype = Object.create(t.prototype, {
                    constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 },
                  })));
              })
            : (t.exports = function (e, t) {
                if (t) {
                  e.super_ = t;
                  var r = function () {};
                  (r.prototype = t.prototype),
                    (e.prototype = new r()),
                    (e.prototype.constructor = e);
                }
              });
        }),
        y = c((e, t) => {
          var r = b(),
            n = v();
          t.exports = function (e) {
            var t, u, i;
            for (u in (n(a, e), n(o, a), (t = a.prototype)))
              (i = t[u]) && 'object' == typeof i && (t[u] = 'concat' in i ? i.concat() : r(i));
            return a;
            function o(t) {
              return e.apply(this, t);
            }
            function a() {
              return this instanceof a ? e.apply(this, arguments) : new o(arguments);
            }
          };
        }),
        A = c((e, t) => {
          t.exports = function (e, t, r) {
            return function () {
              var n = r || this,
                u = n[e];
              return (
                (n[e] = !t),
                function () {
                  n[e] = u;
                }
              );
            };
          };
        }),
        x = c((e, t) => {
          t.exports = function (e) {
            for (var t = String(e), r = [], n = /\r?\n|\r/g; n.exec(t); ) r.push(n.lastIndex);
            return (
              r.push(t.length + 1),
              {
                toPoint: u,
                toPosition: u,
                toOffset: function (e) {
                  var t,
                    n = e && e.line,
                    u = e && e.column;
                  return (
                    !isNaN(n) && !isNaN(u) && n - 1 in r && (t = (r[n - 2] || 0) + u - 1 || 0),
                    t > -1 && t < r[r.length - 1] ? t : -1
                  );
                },
              }
            );
            function u(e) {
              var t = -1;
              if (e > -1 && e < r[r.length - 1])
                for (; ++t < r.length; )
                  if (r[t] > e) return { line: t + 1, column: e - (r[t - 1] || 0) + 1, offset: e };
              return {};
            }
          };
        }),
        w = c((e, t) => {
          t.exports = function (e, t) {
            return function (n) {
              for (var u, i = 0, o = n.indexOf(r), a = e[t], l = []; -1 !== o; )
                l.push(n.slice(i, o)),
                  (i = o + 1),
                  (!(u = n.charAt(i)) || -1 === a.indexOf(u)) && l.push(r),
                  (o = n.indexOf(r, i + 1));
              return l.push(n.slice(i)), l.join('');
            };
          };
          var r = '\\';
        }),
        k = c((e, t) => {
          t.exports = {
            AElig: 'Æ',
            AMP: '&',
            Aacute: 'Á',
            Acirc: 'Â',
            Agrave: 'À',
            Aring: 'Å',
            Atilde: 'Ã',
            Auml: 'Ä',
            COPY: '©',
            Ccedil: 'Ç',
            ETH: 'Ð',
            Eacute: 'É',
            Ecirc: 'Ê',
            Egrave: 'È',
            Euml: 'Ë',
            GT: '>',
            Iacute: 'Í',
            Icirc: 'Î',
            Igrave: 'Ì',
            Iuml: 'Ï',
            LT: '<',
            Ntilde: 'Ñ',
            Oacute: 'Ó',
            Ocirc: 'Ô',
            Ograve: 'Ò',
            Oslash: 'Ø',
            Otilde: 'Õ',
            Ouml: 'Ö',
            QUOT: '"',
            REG: '®',
            THORN: 'Þ',
            Uacute: 'Ú',
            Ucirc: 'Û',
            Ugrave: 'Ù',
            Uuml: 'Ü',
            Yacute: 'Ý',
            aacute: 'á',
            acirc: 'â',
            acute: '´',
            aelig: 'æ',
            agrave: 'à',
            amp: '&',
            aring: 'å',
            atilde: 'ã',
            auml: 'ä',
            brvbar: '¦',
            ccedil: 'ç',
            cedil: '¸',
            cent: '¢',
            copy: '©',
            curren: '¤',
            deg: '°',
            divide: '÷',
            eacute: 'é',
            ecirc: 'ê',
            egrave: 'è',
            eth: 'ð',
            euml: 'ë',
            frac12: '½',
            frac14: '¼',
            frac34: '¾',
            gt: '>',
            iacute: 'í',
            icirc: 'î',
            iexcl: '¡',
            igrave: 'ì',
            iquest: '¿',
            iuml: 'ï',
            laquo: '«',
            lt: '<',
            macr: '¯',
            micro: 'µ',
            middot: '·',
            nbsp: ' ',
            not: '¬',
            ntilde: 'ñ',
            oacute: 'ó',
            ocirc: 'ô',
            ograve: 'ò',
            ordf: 'ª',
            ordm: 'º',
            oslash: 'ø',
            otilde: 'õ',
            ouml: 'ö',
            para: '¶',
            plusmn: '±',
            pound: '£',
            quot: '"',
            raquo: '»',
            reg: '®',
            sect: '§',
            shy: '­',
            sup1: '¹',
            sup2: '²',
            sup3: '³',
            szlig: 'ß',
            thorn: 'þ',
            times: '×',
            uacute: 'ú',
            ucirc: 'û',
            ugrave: 'ù',
            uml: '¨',
            uuml: 'ü',
            yacute: 'ý',
            yen: '¥',
            yuml: 'ÿ',
          };
        }),
        B = c((e, t) => {
          t.exports = {
            0: '�',
            128: '€',
            130: '‚',
            131: 'ƒ',
            132: '„',
            133: '…',
            134: '†',
            135: '‡',
            136: 'ˆ',
            137: '‰',
            138: 'Š',
            139: '‹',
            140: 'Œ',
            142: 'Ž',
            145: '‘',
            146: '’',
            147: '“',
            148: '”',
            149: '•',
            150: '–',
            151: '—',
            152: '˜',
            153: '™',
            154: 'š',
            155: '›',
            156: 'œ',
            158: 'ž',
            159: 'Ÿ',
          };
        }),
        q = c((e, t) => {
          t.exports = function (e) {
            var t = 'string' == typeof e ? e.charCodeAt(0) : e;
            return t >= 48 && t <= 57;
          };
        }),
        S = c((e, t) => {
          t.exports = function (e) {
            var t = 'string' == typeof e ? e.charCodeAt(0) : e;
            return (t >= 97 && t <= 102) || (t >= 65 && t <= 70) || (t >= 48 && t <= 57);
          };
        }),
        T = c((e, t) => {
          t.exports = function (e) {
            var t = 'string' == typeof e ? e.charCodeAt(0) : e;
            return (t >= 97 && t <= 122) || (t >= 65 && t <= 90);
          };
        }),
        L = c((e, t) => {
          var r = T(),
            n = q();
          t.exports = function (e) {
            return r(e) || n(e);
          };
        }),
        O = c((e, t) => {
          t.exports = {
            AEli: 'Æ',
            AElig: 'Æ',
            AM: '&',
            AMP: '&',
            Aacut: 'Á',
            Aacute: 'Á',
            Abreve: 'Ă',
            Acir: 'Â',
            Acirc: 'Â',
            Acy: 'А',
            Afr: '𝔄',
            Agrav: 'À',
            Agrave: 'À',
            Alpha: 'Α',
            Amacr: 'Ā',
            And: '⩓',
            Aogon: 'Ą',
            Aopf: '𝔸',
            ApplyFunction: '⁡',
            Arin: 'Å',
            Aring: 'Å',
            Ascr: '𝒜',
            Assign: '≔',
            Atild: 'Ã',
            Atilde: 'Ã',
            Aum: 'Ä',
            Auml: 'Ä',
            Backslash: '∖',
            Barv: '⫧',
            Barwed: '⌆',
            Bcy: 'Б',
            Because: '∵',
            Bernoullis: 'ℬ',
            Beta: 'Β',
            Bfr: '𝔅',
            Bopf: '𝔹',
            Breve: '˘',
            Bscr: 'ℬ',
            Bumpeq: '≎',
            CHcy: 'Ч',
            COP: '©',
            COPY: '©',
            Cacute: 'Ć',
            Cap: '⋒',
            CapitalDifferentialD: 'ⅅ',
            Cayleys: 'ℭ',
            Ccaron: 'Č',
            Ccedi: 'Ç',
            Ccedil: 'Ç',
            Ccirc: 'Ĉ',
            Cconint: '∰',
            Cdot: 'Ċ',
            Cedilla: '¸',
            CenterDot: '·',
            Cfr: 'ℭ',
            Chi: 'Χ',
            CircleDot: '⊙',
            CircleMinus: '⊖',
            CirclePlus: '⊕',
            CircleTimes: '⊗',
            ClockwiseContourIntegral: '∲',
            CloseCurlyDoubleQuote: '”',
            CloseCurlyQuote: '’',
            Colon: '∷',
            Colone: '⩴',
            Congruent: '≡',
            Conint: '∯',
            ContourIntegral: '∮',
            Copf: 'ℂ',
            Coproduct: '∐',
            CounterClockwiseContourIntegral: '∳',
            Cross: '⨯',
            Cscr: '𝒞',
            Cup: '⋓',
            CupCap: '≍',
            DD: 'ⅅ',
            DDotrahd: '⤑',
            DJcy: 'Ђ',
            DScy: 'Ѕ',
            DZcy: 'Џ',
            Dagger: '‡',
            Darr: '↡',
            Dashv: '⫤',
            Dcaron: 'Ď',
            Dcy: 'Д',
            Del: '∇',
            Delta: 'Δ',
            Dfr: '𝔇',
            DiacriticalAcute: '´',
            DiacriticalDot: '˙',
            DiacriticalDoubleAcute: '˝',
            DiacriticalGrave: '`',
            DiacriticalTilde: '˜',
            Diamond: '⋄',
            DifferentialD: 'ⅆ',
            Dopf: '𝔻',
            Dot: '¨',
            DotDot: '⃜',
            DotEqual: '≐',
            DoubleContourIntegral: '∯',
            DoubleDot: '¨',
            DoubleDownArrow: '⇓',
            DoubleLeftArrow: '⇐',
            DoubleLeftRightArrow: '⇔',
            DoubleLeftTee: '⫤',
            DoubleLongLeftArrow: '⟸',
            DoubleLongLeftRightArrow: '⟺',
            DoubleLongRightArrow: '⟹',
            DoubleRightArrow: '⇒',
            DoubleRightTee: '⊨',
            DoubleUpArrow: '⇑',
            DoubleUpDownArrow: '⇕',
            DoubleVerticalBar: '∥',
            DownArrow: '↓',
            DownArrowBar: '⤓',
            DownArrowUpArrow: '⇵',
            DownBreve: '̑',
            DownLeftRightVector: '⥐',
            DownLeftTeeVector: '⥞',
            DownLeftVector: '↽',
            DownLeftVectorBar: '⥖',
            DownRightTeeVector: '⥟',
            DownRightVector: '⇁',
            DownRightVectorBar: '⥗',
            DownTee: '⊤',
            DownTeeArrow: '↧',
            Downarrow: '⇓',
            Dscr: '𝒟',
            Dstrok: 'Đ',
            ENG: 'Ŋ',
            ET: 'Ð',
            ETH: 'Ð',
            Eacut: 'É',
            Eacute: 'É',
            Ecaron: 'Ě',
            Ecir: 'Ê',
            Ecirc: 'Ê',
            Ecy: 'Э',
            Edot: 'Ė',
            Efr: '𝔈',
            Egrav: 'È',
            Egrave: 'È',
            Element: '∈',
            Emacr: 'Ē',
            EmptySmallSquare: '◻',
            EmptyVerySmallSquare: '▫',
            Eogon: 'Ę',
            Eopf: '𝔼',
            Epsilon: 'Ε',
            Equal: '⩵',
            EqualTilde: '≂',
            Equilibrium: '⇌',
            Escr: 'ℰ',
            Esim: '⩳',
            Eta: 'Η',
            Eum: 'Ë',
            Euml: 'Ë',
            Exists: '∃',
            ExponentialE: 'ⅇ',
            Fcy: 'Ф',
            Ffr: '𝔉',
            FilledSmallSquare: '◼',
            FilledVerySmallSquare: '▪',
            Fopf: '𝔽',
            ForAll: '∀',
            Fouriertrf: 'ℱ',
            Fscr: 'ℱ',
            GJcy: 'Ѓ',
            G: '>',
            GT: '>',
            Gamma: 'Γ',
            Gammad: 'Ϝ',
            Gbreve: 'Ğ',
            Gcedil: 'Ģ',
            Gcirc: 'Ĝ',
            Gcy: 'Г',
            Gdot: 'Ġ',
            Gfr: '𝔊',
            Gg: '⋙',
            Gopf: '𝔾',
            GreaterEqual: '≥',
            GreaterEqualLess: '⋛',
            GreaterFullEqual: '≧',
            GreaterGreater: '⪢',
            GreaterLess: '≷',
            GreaterSlantEqual: '⩾',
            GreaterTilde: '≳',
            Gscr: '𝒢',
            Gt: '≫',
            HARDcy: 'Ъ',
            Hacek: 'ˇ',
            Hat: '^',
            Hcirc: 'Ĥ',
            Hfr: 'ℌ',
            HilbertSpace: 'ℋ',
            Hopf: 'ℍ',
            HorizontalLine: '─',
            Hscr: 'ℋ',
            Hstrok: 'Ħ',
            HumpDownHump: '≎',
            HumpEqual: '≏',
            IEcy: 'Е',
            IJlig: 'Ĳ',
            IOcy: 'Ё',
            Iacut: 'Í',
            Iacute: 'Í',
            Icir: 'Î',
            Icirc: 'Î',
            Icy: 'И',
            Idot: 'İ',
            Ifr: 'ℑ',
            Igrav: 'Ì',
            Igrave: 'Ì',
            Im: 'ℑ',
            Imacr: 'Ī',
            ImaginaryI: 'ⅈ',
            Implies: '⇒',
            Int: '∬',
            Integral: '∫',
            Intersection: '⋂',
            InvisibleComma: '⁣',
            InvisibleTimes: '⁢',
            Iogon: 'Į',
            Iopf: '𝕀',
            Iota: 'Ι',
            Iscr: 'ℐ',
            Itilde: 'Ĩ',
            Iukcy: 'І',
            Ium: 'Ï',
            Iuml: 'Ï',
            Jcirc: 'Ĵ',
            Jcy: 'Й',
            Jfr: '𝔍',
            Jopf: '𝕁',
            Jscr: '𝒥',
            Jsercy: 'Ј',
            Jukcy: 'Є',
            KHcy: 'Х',
            KJcy: 'Ќ',
            Kappa: 'Κ',
            Kcedil: 'Ķ',
            Kcy: 'К',
            Kfr: '𝔎',
            Kopf: '𝕂',
            Kscr: '𝒦',
            LJcy: 'Љ',
            L: '<',
            LT: '<',
            Lacute: 'Ĺ',
            Lambda: 'Λ',
            Lang: '⟪',
            Laplacetrf: 'ℒ',
            Larr: '↞',
            Lcaron: 'Ľ',
            Lcedil: 'Ļ',
            Lcy: 'Л',
            LeftAngleBracket: '⟨',
            LeftArrow: '←',
            LeftArrowBar: '⇤',
            LeftArrowRightArrow: '⇆',
            LeftCeiling: '⌈',
            LeftDoubleBracket: '⟦',
            LeftDownTeeVector: '⥡',
            LeftDownVector: '⇃',
            LeftDownVectorBar: '⥙',
            LeftFloor: '⌊',
            LeftRightArrow: '↔',
            LeftRightVector: '⥎',
            LeftTee: '⊣',
            LeftTeeArrow: '↤',
            LeftTeeVector: '⥚',
            LeftTriangle: '⊲',
            LeftTriangleBar: '⧏',
            LeftTriangleEqual: '⊴',
            LeftUpDownVector: '⥑',
            LeftUpTeeVector: '⥠',
            LeftUpVector: '↿',
            LeftUpVectorBar: '⥘',
            LeftVector: '↼',
            LeftVectorBar: '⥒',
            Leftarrow: '⇐',
            Leftrightarrow: '⇔',
            LessEqualGreater: '⋚',
            LessFullEqual: '≦',
            LessGreater: '≶',
            LessLess: '⪡',
            LessSlantEqual: '⩽',
            LessTilde: '≲',
            Lfr: '𝔏',
            Ll: '⋘',
            Lleftarrow: '⇚',
            Lmidot: 'Ŀ',
            LongLeftArrow: '⟵',
            LongLeftRightArrow: '⟷',
            LongRightArrow: '⟶',
            Longleftarrow: '⟸',
            Longleftrightarrow: '⟺',
            Longrightarrow: '⟹',
            Lopf: '𝕃',
            LowerLeftArrow: '↙',
            LowerRightArrow: '↘',
            Lscr: 'ℒ',
            Lsh: '↰',
            Lstrok: 'Ł',
            Lt: '≪',
            Map: '⤅',
            Mcy: 'М',
            MediumSpace: ' ',
            Mellintrf: 'ℳ',
            Mfr: '𝔐',
            MinusPlus: '∓',
            Mopf: '𝕄',
            Mscr: 'ℳ',
            Mu: 'Μ',
            NJcy: 'Њ',
            Nacute: 'Ń',
            Ncaron: 'Ň',
            Ncedil: 'Ņ',
            Ncy: 'Н',
            NegativeMediumSpace: '​',
            NegativeThickSpace: '​',
            NegativeThinSpace: '​',
            NegativeVeryThinSpace: '​',
            NestedGreaterGreater: '≫',
            NestedLessLess: '≪',
            NewLine: '\n',
            Nfr: '𝔑',
            NoBreak: '⁠',
            NonBreakingSpace: ' ',
            Nopf: 'ℕ',
            Not: '⫬',
            NotCongruent: '≢',
            NotCupCap: '≭',
            NotDoubleVerticalBar: '∦',
            NotElement: '∉',
            NotEqual: '≠',
            NotEqualTilde: '≂̸',
            NotExists: '∄',
            NotGreater: '≯',
            NotGreaterEqual: '≱',
            NotGreaterFullEqual: '≧̸',
            NotGreaterGreater: '≫̸',
            NotGreaterLess: '≹',
            NotGreaterSlantEqual: '⩾̸',
            NotGreaterTilde: '≵',
            NotHumpDownHump: '≎̸',
            NotHumpEqual: '≏̸',
            NotLeftTriangle: '⋪',
            NotLeftTriangleBar: '⧏̸',
            NotLeftTriangleEqual: '⋬',
            NotLess: '≮',
            NotLessEqual: '≰',
            NotLessGreater: '≸',
            NotLessLess: '≪̸',
            NotLessSlantEqual: '⩽̸',
            NotLessTilde: '≴',
            NotNestedGreaterGreater: '⪢̸',
            NotNestedLessLess: '⪡̸',
            NotPrecedes: '⊀',
            NotPrecedesEqual: '⪯̸',
            NotPrecedesSlantEqual: '⋠',
            NotReverseElement: '∌',
            NotRightTriangle: '⋫',
            NotRightTriangleBar: '⧐̸',
            NotRightTriangleEqual: '⋭',
            NotSquareSubset: '⊏̸',
            NotSquareSubsetEqual: '⋢',
            NotSquareSuperset: '⊐̸',
            NotSquareSupersetEqual: '⋣',
            NotSubset: '⊂⃒',
            NotSubsetEqual: '⊈',
            NotSucceeds: '⊁',
            NotSucceedsEqual: '⪰̸',
            NotSucceedsSlantEqual: '⋡',
            NotSucceedsTilde: '≿̸',
            NotSuperset: '⊃⃒',
            NotSupersetEqual: '⊉',
            NotTilde: '≁',
            NotTildeEqual: '≄',
            NotTildeFullEqual: '≇',
            NotTildeTilde: '≉',
            NotVerticalBar: '∤',
            Nscr: '𝒩',
            Ntild: 'Ñ',
            Ntilde: 'Ñ',
            Nu: 'Ν',
            OElig: 'Œ',
            Oacut: 'Ó',
            Oacute: 'Ó',
            Ocir: 'Ô',
            Ocirc: 'Ô',
            Ocy: 'О',
            Odblac: 'Ő',
            Ofr: '𝔒',
            Ograv: 'Ò',
            Ograve: 'Ò',
            Omacr: 'Ō',
            Omega: 'Ω',
            Omicron: 'Ο',
            Oopf: '𝕆',
            OpenCurlyDoubleQuote: '“',
            OpenCurlyQuote: '‘',
            Or: '⩔',
            Oscr: '𝒪',
            Oslas: 'Ø',
            Oslash: 'Ø',
            Otild: 'Õ',
            Otilde: 'Õ',
            Otimes: '⨷',
            Oum: 'Ö',
            Ouml: 'Ö',
            OverBar: '‾',
            OverBrace: '⏞',
            OverBracket: '⎴',
            OverParenthesis: '⏜',
            PartialD: '∂',
            Pcy: 'П',
            Pfr: '𝔓',
            Phi: 'Φ',
            Pi: 'Π',
            PlusMinus: '±',
            Poincareplane: 'ℌ',
            Popf: 'ℙ',
            Pr: '⪻',
            Precedes: '≺',
            PrecedesEqual: '⪯',
            PrecedesSlantEqual: '≼',
            PrecedesTilde: '≾',
            Prime: '″',
            Product: '∏',
            Proportion: '∷',
            Proportional: '∝',
            Pscr: '𝒫',
            Psi: 'Ψ',
            QUO: '"',
            QUOT: '"',
            Qfr: '𝔔',
            Qopf: 'ℚ',
            Qscr: '𝒬',
            RBarr: '⤐',
            RE: '®',
            REG: '®',
            Racute: 'Ŕ',
            Rang: '⟫',
            Rarr: '↠',
            Rarrtl: '⤖',
            Rcaron: 'Ř',
            Rcedil: 'Ŗ',
            Rcy: 'Р',
            Re: 'ℜ',
            ReverseElement: '∋',
            ReverseEquilibrium: '⇋',
            ReverseUpEquilibrium: '⥯',
            Rfr: 'ℜ',
            Rho: 'Ρ',
            RightAngleBracket: '⟩',
            RightArrow: '→',
            RightArrowBar: '⇥',
            RightArrowLeftArrow: '⇄',
            RightCeiling: '⌉',
            RightDoubleBracket: '⟧',
            RightDownTeeVector: '⥝',
            RightDownVector: '⇂',
            RightDownVectorBar: '⥕',
            RightFloor: '⌋',
            RightTee: '⊢',
            RightTeeArrow: '↦',
            RightTeeVector: '⥛',
            RightTriangle: '⊳',
            RightTriangleBar: '⧐',
            RightTriangleEqual: '⊵',
            RightUpDownVector: '⥏',
            RightUpTeeVector: '⥜',
            RightUpVector: '↾',
            RightUpVectorBar: '⥔',
            RightVector: '⇀',
            RightVectorBar: '⥓',
            Rightarrow: '⇒',
            Ropf: 'ℝ',
            RoundImplies: '⥰',
            Rrightarrow: '⇛',
            Rscr: 'ℛ',
            Rsh: '↱',
            RuleDelayed: '⧴',
            SHCHcy: 'Щ',
            SHcy: 'Ш',
            SOFTcy: 'Ь',
            Sacute: 'Ś',
            Sc: '⪼',
            Scaron: 'Š',
            Scedil: 'Ş',
            Scirc: 'Ŝ',
            Scy: 'С',
            Sfr: '𝔖',
            ShortDownArrow: '↓',
            ShortLeftArrow: '←',
            ShortRightArrow: '→',
            ShortUpArrow: '↑',
            Sigma: 'Σ',
            SmallCircle: '∘',
            Sopf: '𝕊',
            Sqrt: '√',
            Square: '□',
            SquareIntersection: '⊓',
            SquareSubset: '⊏',
            SquareSubsetEqual: '⊑',
            SquareSuperset: '⊐',
            SquareSupersetEqual: '⊒',
            SquareUnion: '⊔',
            Sscr: '𝒮',
            Star: '⋆',
            Sub: '⋐',
            Subset: '⋐',
            SubsetEqual: '⊆',
            Succeeds: '≻',
            SucceedsEqual: '⪰',
            SucceedsSlantEqual: '≽',
            SucceedsTilde: '≿',
            SuchThat: '∋',
            Sum: '∑',
            Sup: '⋑',
            Superset: '⊃',
            SupersetEqual: '⊇',
            Supset: '⋑',
            THOR: 'Þ',
            THORN: 'Þ',
            TRADE: '™',
            TSHcy: 'Ћ',
            TScy: 'Ц',
            Tab: '\t',
            Tau: 'Τ',
            Tcaron: 'Ť',
            Tcedil: 'Ţ',
            Tcy: 'Т',
            Tfr: '𝔗',
            Therefore: '∴',
            Theta: 'Θ',
            ThickSpace: '  ',
            ThinSpace: ' ',
            Tilde: '∼',
            TildeEqual: '≃',
            TildeFullEqual: '≅',
            TildeTilde: '≈',
            Topf: '𝕋',
            TripleDot: '⃛',
            Tscr: '𝒯',
            Tstrok: 'Ŧ',
            Uacut: 'Ú',
            Uacute: 'Ú',
            Uarr: '↟',
            Uarrocir: '⥉',
            Ubrcy: 'Ў',
            Ubreve: 'Ŭ',
            Ucir: 'Û',
            Ucirc: 'Û',
            Ucy: 'У',
            Udblac: 'Ű',
            Ufr: '𝔘',
            Ugrav: 'Ù',
            Ugrave: 'Ù',
            Umacr: 'Ū',
            UnderBar: '_',
            UnderBrace: '⏟',
            UnderBracket: '⎵',
            UnderParenthesis: '⏝',
            Union: '⋃',
            UnionPlus: '⊎',
            Uogon: 'Ų',
            Uopf: '𝕌',
            UpArrow: '↑',
            UpArrowBar: '⤒',
            UpArrowDownArrow: '⇅',
            UpDownArrow: '↕',
            UpEquilibrium: '⥮',
            UpTee: '⊥',
            UpTeeArrow: '↥',
            Uparrow: '⇑',
            Updownarrow: '⇕',
            UpperLeftArrow: '↖',
            UpperRightArrow: '↗',
            Upsi: 'ϒ',
            Upsilon: 'Υ',
            Uring: 'Ů',
            Uscr: '𝒰',
            Utilde: 'Ũ',
            Uum: 'Ü',
            Uuml: 'Ü',
            VDash: '⊫',
            Vbar: '⫫',
            Vcy: 'В',
            Vdash: '⊩',
            Vdashl: '⫦',
            Vee: '⋁',
            Verbar: '‖',
            Vert: '‖',
            VerticalBar: '∣',
            VerticalLine: '|',
            VerticalSeparator: '❘',
            VerticalTilde: '≀',
            VeryThinSpace: ' ',
            Vfr: '𝔙',
            Vopf: '𝕍',
            Vscr: '𝒱',
            Vvdash: '⊪',
            Wcirc: 'Ŵ',
            Wedge: '⋀',
            Wfr: '𝔚',
            Wopf: '𝕎',
            Wscr: '𝒲',
            Xfr: '𝔛',
            Xi: 'Ξ',
            Xopf: '𝕏',
            Xscr: '𝒳',
            YAcy: 'Я',
            YIcy: 'Ї',
            YUcy: 'Ю',
            Yacut: 'Ý',
            Yacute: 'Ý',
            Ycirc: 'Ŷ',
            Ycy: 'Ы',
            Yfr: '𝔜',
            Yopf: '𝕐',
            Yscr: '𝒴',
            Yuml: 'Ÿ',
            ZHcy: 'Ж',
            Zacute: 'Ź',
            Zcaron: 'Ž',
            Zcy: 'З',
            Zdot: 'Ż',
            ZeroWidthSpace: '​',
            Zeta: 'Ζ',
            Zfr: 'ℨ',
            Zopf: 'ℤ',
            Zscr: '𝒵',
            aacut: 'á',
            aacute: 'á',
            abreve: 'ă',
            ac: '∾',
            acE: '∾̳',
            acd: '∿',
            acir: 'â',
            acirc: 'â',
            acut: '´',
            acute: '´',
            acy: 'а',
            aeli: 'æ',
            aelig: 'æ',
            af: '⁡',
            afr: '𝔞',
            agrav: 'à',
            agrave: 'à',
            alefsym: 'ℵ',
            aleph: 'ℵ',
            alpha: 'α',
            amacr: 'ā',
            amalg: '⨿',
            am: '&',
            amp: '&',
            and: '∧',
            andand: '⩕',
            andd: '⩜',
            andslope: '⩘',
            andv: '⩚',
            ang: '∠',
            ange: '⦤',
            angle: '∠',
            angmsd: '∡',
            angmsdaa: '⦨',
            angmsdab: '⦩',
            angmsdac: '⦪',
            angmsdad: '⦫',
            angmsdae: '⦬',
            angmsdaf: '⦭',
            angmsdag: '⦮',
            angmsdah: '⦯',
            angrt: '∟',
            angrtvb: '⊾',
            angrtvbd: '⦝',
            angsph: '∢',
            angst: 'Å',
            angzarr: '⍼',
            aogon: 'ą',
            aopf: '𝕒',
            ap: '≈',
            apE: '⩰',
            apacir: '⩯',
            ape: '≊',
            apid: '≋',
            apos: "'",
            approx: '≈',
            approxeq: '≊',
            arin: 'å',
            aring: 'å',
            ascr: '𝒶',
            ast: '*',
            asymp: '≈',
            asympeq: '≍',
            atild: 'ã',
            atilde: 'ã',
            aum: 'ä',
            auml: 'ä',
            awconint: '∳',
            awint: '⨑',
            bNot: '⫭',
            backcong: '≌',
            backepsilon: '϶',
            backprime: '‵',
            backsim: '∽',
            backsimeq: '⋍',
            barvee: '⊽',
            barwed: '⌅',
            barwedge: '⌅',
            bbrk: '⎵',
            bbrktbrk: '⎶',
            bcong: '≌',
            bcy: 'б',
            bdquo: '„',
            becaus: '∵',
            because: '∵',
            bemptyv: '⦰',
            bepsi: '϶',
            bernou: 'ℬ',
            beta: 'β',
            beth: 'ℶ',
            between: '≬',
            bfr: '𝔟',
            bigcap: '⋂',
            bigcirc: '◯',
            bigcup: '⋃',
            bigodot: '⨀',
            bigoplus: '⨁',
            bigotimes: '⨂',
            bigsqcup: '⨆',
            bigstar: '★',
            bigtriangledown: '▽',
            bigtriangleup: '△',
            biguplus: '⨄',
            bigvee: '⋁',
            bigwedge: '⋀',
            bkarow: '⤍',
            blacklozenge: '⧫',
            blacksquare: '▪',
            blacktriangle: '▴',
            blacktriangledown: '▾',
            blacktriangleleft: '◂',
            blacktriangleright: '▸',
            blank: '␣',
            blk12: '▒',
            blk14: '░',
            blk34: '▓',
            block: '█',
            bne: '=⃥',
            bnequiv: '≡⃥',
            bnot: '⌐',
            bopf: '𝕓',
            bot: '⊥',
            bottom: '⊥',
            bowtie: '⋈',
            boxDL: '╗',
            boxDR: '╔',
            boxDl: '╖',
            boxDr: '╓',
            boxH: '═',
            boxHD: '╦',
            boxHU: '╩',
            boxHd: '╤',
            boxHu: '╧',
            boxUL: '╝',
            boxUR: '╚',
            boxUl: '╜',
            boxUr: '╙',
            boxV: '║',
            boxVH: '╬',
            boxVL: '╣',
            boxVR: '╠',
            boxVh: '╫',
            boxVl: '╢',
            boxVr: '╟',
            boxbox: '⧉',
            boxdL: '╕',
            boxdR: '╒',
            boxdl: '┐',
            boxdr: '┌',
            boxh: '─',
            boxhD: '╥',
            boxhU: '╨',
            boxhd: '┬',
            boxhu: '┴',
            boxminus: '⊟',
            boxplus: '⊞',
            boxtimes: '⊠',
            boxuL: '╛',
            boxuR: '╘',
            boxul: '┘',
            boxur: '└',
            boxv: '│',
            boxvH: '╪',
            boxvL: '╡',
            boxvR: '╞',
            boxvh: '┼',
            boxvl: '┤',
            boxvr: '├',
            bprime: '‵',
            breve: '˘',
            brvba: '¦',
            brvbar: '¦',
            bscr: '𝒷',
            bsemi: '⁏',
            bsim: '∽',
            bsime: '⋍',
            bsol: '\\',
            bsolb: '⧅',
            bsolhsub: '⟈',
            bull: '•',
            bullet: '•',
            bump: '≎',
            bumpE: '⪮',
            bumpe: '≏',
            bumpeq: '≏',
            cacute: 'ć',
            cap: '∩',
            capand: '⩄',
            capbrcup: '⩉',
            capcap: '⩋',
            capcup: '⩇',
            capdot: '⩀',
            caps: '∩︀',
            caret: '⁁',
            caron: 'ˇ',
            ccaps: '⩍',
            ccaron: 'č',
            ccedi: 'ç',
            ccedil: 'ç',
            ccirc: 'ĉ',
            ccups: '⩌',
            ccupssm: '⩐',
            cdot: 'ċ',
            cedi: '¸',
            cedil: '¸',
            cemptyv: '⦲',
            cen: '¢',
            cent: '¢',
            centerdot: '·',
            cfr: '𝔠',
            chcy: 'ч',
            check: '✓',
            checkmark: '✓',
            chi: 'χ',
            cir: '○',
            cirE: '⧃',
            circ: 'ˆ',
            circeq: '≗',
            circlearrowleft: '↺',
            circlearrowright: '↻',
            circledR: '®',
            circledS: 'Ⓢ',
            circledast: '⊛',
            circledcirc: '⊚',
            circleddash: '⊝',
            cire: '≗',
            cirfnint: '⨐',
            cirmid: '⫯',
            cirscir: '⧂',
            clubs: '♣',
            clubsuit: '♣',
            colon: ':',
            colone: '≔',
            coloneq: '≔',
            comma: ',',
            commat: '@',
            comp: '∁',
            compfn: '∘',
            complement: '∁',
            complexes: 'ℂ',
            cong: '≅',
            congdot: '⩭',
            conint: '∮',
            copf: '𝕔',
            coprod: '∐',
            cop: '©',
            copy: '©',
            copysr: '℗',
            crarr: '↵',
            cross: '✗',
            cscr: '𝒸',
            csub: '⫏',
            csube: '⫑',
            csup: '⫐',
            csupe: '⫒',
            ctdot: '⋯',
            cudarrl: '⤸',
            cudarrr: '⤵',
            cuepr: '⋞',
            cuesc: '⋟',
            cularr: '↶',
            cularrp: '⤽',
            cup: '∪',
            cupbrcap: '⩈',
            cupcap: '⩆',
            cupcup: '⩊',
            cupdot: '⊍',
            cupor: '⩅',
            cups: '∪︀',
            curarr: '↷',
            curarrm: '⤼',
            curlyeqprec: '⋞',
            curlyeqsucc: '⋟',
            curlyvee: '⋎',
            curlywedge: '⋏',
            curre: '¤',
            curren: '¤',
            curvearrowleft: '↶',
            curvearrowright: '↷',
            cuvee: '⋎',
            cuwed: '⋏',
            cwconint: '∲',
            cwint: '∱',
            cylcty: '⌭',
            dArr: '⇓',
            dHar: '⥥',
            dagger: '†',
            daleth: 'ℸ',
            darr: '↓',
            dash: '‐',
            dashv: '⊣',
            dbkarow: '⤏',
            dblac: '˝',
            dcaron: 'ď',
            dcy: 'д',
            dd: 'ⅆ',
            ddagger: '‡',
            ddarr: '⇊',
            ddotseq: '⩷',
            de: '°',
            deg: '°',
            delta: 'δ',
            demptyv: '⦱',
            dfisht: '⥿',
            dfr: '𝔡',
            dharl: '⇃',
            dharr: '⇂',
            diam: '⋄',
            diamond: '⋄',
            diamondsuit: '♦',
            diams: '♦',
            die: '¨',
            digamma: 'ϝ',
            disin: '⋲',
            div: '÷',
            divid: '÷',
            divide: '÷',
            divideontimes: '⋇',
            divonx: '⋇',
            djcy: 'ђ',
            dlcorn: '⌞',
            dlcrop: '⌍',
            dollar: '$',
            dopf: '𝕕',
            dot: '˙',
            doteq: '≐',
            doteqdot: '≑',
            dotminus: '∸',
            dotplus: '∔',
            dotsquare: '⊡',
            doublebarwedge: '⌆',
            downarrow: '↓',
            downdownarrows: '⇊',
            downharpoonleft: '⇃',
            downharpoonright: '⇂',
            drbkarow: '⤐',
            drcorn: '⌟',
            drcrop: '⌌',
            dscr: '𝒹',
            dscy: 'ѕ',
            dsol: '⧶',
            dstrok: 'đ',
            dtdot: '⋱',
            dtri: '▿',
            dtrif: '▾',
            duarr: '⇵',
            duhar: '⥯',
            dwangle: '⦦',
            dzcy: 'џ',
            dzigrarr: '⟿',
            eDDot: '⩷',
            eDot: '≑',
            eacut: 'é',
            eacute: 'é',
            easter: '⩮',
            ecaron: 'ě',
            ecir: 'ê',
            ecirc: 'ê',
            ecolon: '≕',
            ecy: 'э',
            edot: 'ė',
            ee: 'ⅇ',
            efDot: '≒',
            efr: '𝔢',
            eg: '⪚',
            egrav: 'è',
            egrave: 'è',
            egs: '⪖',
            egsdot: '⪘',
            el: '⪙',
            elinters: '⏧',
            ell: 'ℓ',
            els: '⪕',
            elsdot: '⪗',
            emacr: 'ē',
            empty: '∅',
            emptyset: '∅',
            emptyv: '∅',
            emsp13: ' ',
            emsp14: ' ',
            emsp: ' ',
            eng: 'ŋ',
            ensp: ' ',
            eogon: 'ę',
            eopf: '𝕖',
            epar: '⋕',
            eparsl: '⧣',
            eplus: '⩱',
            epsi: 'ε',
            epsilon: 'ε',
            epsiv: 'ϵ',
            eqcirc: '≖',
            eqcolon: '≕',
            eqsim: '≂',
            eqslantgtr: '⪖',
            eqslantless: '⪕',
            equals: '=',
            equest: '≟',
            equiv: '≡',
            equivDD: '⩸',
            eqvparsl: '⧥',
            erDot: '≓',
            erarr: '⥱',
            escr: 'ℯ',
            esdot: '≐',
            esim: '≂',
            eta: 'η',
            et: 'ð',
            eth: 'ð',
            eum: 'ë',
            euml: 'ë',
            euro: '€',
            excl: '!',
            exist: '∃',
            expectation: 'ℰ',
            exponentiale: 'ⅇ',
            fallingdotseq: '≒',
            fcy: 'ф',
            female: '♀',
            ffilig: 'ﬃ',
            fflig: 'ﬀ',
            ffllig: 'ﬄ',
            ffr: '𝔣',
            filig: 'ﬁ',
            fjlig: 'fj',
            flat: '♭',
            fllig: 'ﬂ',
            fltns: '▱',
            fnof: 'ƒ',
            fopf: '𝕗',
            forall: '∀',
            fork: '⋔',
            forkv: '⫙',
            fpartint: '⨍',
            frac1: '¼',
            frac12: '½',
            frac13: '⅓',
            frac14: '¼',
            frac15: '⅕',
            frac16: '⅙',
            frac18: '⅛',
            frac23: '⅔',
            frac25: '⅖',
            frac3: '¾',
            frac34: '¾',
            frac35: '⅗',
            frac38: '⅜',
            frac45: '⅘',
            frac56: '⅚',
            frac58: '⅝',
            frac78: '⅞',
            frasl: '⁄',
            frown: '⌢',
            fscr: '𝒻',
            gE: '≧',
            gEl: '⪌',
            gacute: 'ǵ',
            gamma: 'γ',
            gammad: 'ϝ',
            gap: '⪆',
            gbreve: 'ğ',
            gcirc: 'ĝ',
            gcy: 'г',
            gdot: 'ġ',
            ge: '≥',
            gel: '⋛',
            geq: '≥',
            geqq: '≧',
            geqslant: '⩾',
            ges: '⩾',
            gescc: '⪩',
            gesdot: '⪀',
            gesdoto: '⪂',
            gesdotol: '⪄',
            gesl: '⋛︀',
            gesles: '⪔',
            gfr: '𝔤',
            gg: '≫',
            ggg: '⋙',
            gimel: 'ℷ',
            gjcy: 'ѓ',
            gl: '≷',
            glE: '⪒',
            gla: '⪥',
            glj: '⪤',
            gnE: '≩',
            gnap: '⪊',
            gnapprox: '⪊',
            gne: '⪈',
            gneq: '⪈',
            gneqq: '≩',
            gnsim: '⋧',
            gopf: '𝕘',
            grave: '`',
            gscr: 'ℊ',
            gsim: '≳',
            gsime: '⪎',
            gsiml: '⪐',
            g: '>',
            gt: '>',
            gtcc: '⪧',
            gtcir: '⩺',
            gtdot: '⋗',
            gtlPar: '⦕',
            gtquest: '⩼',
            gtrapprox: '⪆',
            gtrarr: '⥸',
            gtrdot: '⋗',
            gtreqless: '⋛',
            gtreqqless: '⪌',
            gtrless: '≷',
            gtrsim: '≳',
            gvertneqq: '≩︀',
            gvnE: '≩︀',
            hArr: '⇔',
            hairsp: ' ',
            half: '½',
            hamilt: 'ℋ',
            hardcy: 'ъ',
            harr: '↔',
            harrcir: '⥈',
            harrw: '↭',
            hbar: 'ℏ',
            hcirc: 'ĥ',
            hearts: '♥',
            heartsuit: '♥',
            hellip: '…',
            hercon: '⊹',
            hfr: '𝔥',
            hksearow: '⤥',
            hkswarow: '⤦',
            hoarr: '⇿',
            homtht: '∻',
            hookleftarrow: '↩',
            hookrightarrow: '↪',
            hopf: '𝕙',
            horbar: '―',
            hscr: '𝒽',
            hslash: 'ℏ',
            hstrok: 'ħ',
            hybull: '⁃',
            hyphen: '‐',
            iacut: 'í',
            iacute: 'í',
            ic: '⁣',
            icir: 'î',
            icirc: 'î',
            icy: 'и',
            iecy: 'е',
            iexc: '¡',
            iexcl: '¡',
            iff: '⇔',
            ifr: '𝔦',
            igrav: 'ì',
            igrave: 'ì',
            ii: 'ⅈ',
            iiiint: '⨌',
            iiint: '∭',
            iinfin: '⧜',
            iiota: '℩',
            ijlig: 'ĳ',
            imacr: 'ī',
            image: 'ℑ',
            imagline: 'ℐ',
            imagpart: 'ℑ',
            imath: 'ı',
            imof: '⊷',
            imped: 'Ƶ',
            in: '∈',
            incare: '℅',
            infin: '∞',
            infintie: '⧝',
            inodot: 'ı',
            int: '∫',
            intcal: '⊺',
            integers: 'ℤ',
            intercal: '⊺',
            intlarhk: '⨗',
            intprod: '⨼',
            iocy: 'ё',
            iogon: 'į',
            iopf: '𝕚',
            iota: 'ι',
            iprod: '⨼',
            iques: '¿',
            iquest: '¿',
            iscr: '𝒾',
            isin: '∈',
            isinE: '⋹',
            isindot: '⋵',
            isins: '⋴',
            isinsv: '⋳',
            isinv: '∈',
            it: '⁢',
            itilde: 'ĩ',
            iukcy: 'і',
            ium: 'ï',
            iuml: 'ï',
            jcirc: 'ĵ',
            jcy: 'й',
            jfr: '𝔧',
            jmath: 'ȷ',
            jopf: '𝕛',
            jscr: '𝒿',
            jsercy: 'ј',
            jukcy: 'є',
            kappa: 'κ',
            kappav: 'ϰ',
            kcedil: 'ķ',
            kcy: 'к',
            kfr: '𝔨',
            kgreen: 'ĸ',
            khcy: 'х',
            kjcy: 'ќ',
            kopf: '𝕜',
            kscr: '𝓀',
            lAarr: '⇚',
            lArr: '⇐',
            lAtail: '⤛',
            lBarr: '⤎',
            lE: '≦',
            lEg: '⪋',
            lHar: '⥢',
            lacute: 'ĺ',
            laemptyv: '⦴',
            lagran: 'ℒ',
            lambda: 'λ',
            lang: '⟨',
            langd: '⦑',
            langle: '⟨',
            lap: '⪅',
            laqu: '«',
            laquo: '«',
            larr: '←',
            larrb: '⇤',
            larrbfs: '⤟',
            larrfs: '⤝',
            larrhk: '↩',
            larrlp: '↫',
            larrpl: '⤹',
            larrsim: '⥳',
            larrtl: '↢',
            lat: '⪫',
            latail: '⤙',
            late: '⪭',
            lates: '⪭︀',
            lbarr: '⤌',
            lbbrk: '❲',
            lbrace: '{',
            lbrack: '[',
            lbrke: '⦋',
            lbrksld: '⦏',
            lbrkslu: '⦍',
            lcaron: 'ľ',
            lcedil: 'ļ',
            lceil: '⌈',
            lcub: '{',
            lcy: 'л',
            ldca: '⤶',
            ldquo: '“',
            ldquor: '„',
            ldrdhar: '⥧',
            ldrushar: '⥋',
            ldsh: '↲',
            le: '≤',
            leftarrow: '←',
            leftarrowtail: '↢',
            leftharpoondown: '↽',
            leftharpoonup: '↼',
            leftleftarrows: '⇇',
            leftrightarrow: '↔',
            leftrightarrows: '⇆',
            leftrightharpoons: '⇋',
            leftrightsquigarrow: '↭',
            leftthreetimes: '⋋',
            leg: '⋚',
            leq: '≤',
            leqq: '≦',
            leqslant: '⩽',
            les: '⩽',
            lescc: '⪨',
            lesdot: '⩿',
            lesdoto: '⪁',
            lesdotor: '⪃',
            lesg: '⋚︀',
            lesges: '⪓',
            lessapprox: '⪅',
            lessdot: '⋖',
            lesseqgtr: '⋚',
            lesseqqgtr: '⪋',
            lessgtr: '≶',
            lesssim: '≲',
            lfisht: '⥼',
            lfloor: '⌊',
            lfr: '𝔩',
            lg: '≶',
            lgE: '⪑',
            lhard: '↽',
            lharu: '↼',
            lharul: '⥪',
            lhblk: '▄',
            ljcy: 'љ',
            ll: '≪',
            llarr: '⇇',
            llcorner: '⌞',
            llhard: '⥫',
            lltri: '◺',
            lmidot: 'ŀ',
            lmoust: '⎰',
            lmoustache: '⎰',
            lnE: '≨',
            lnap: '⪉',
            lnapprox: '⪉',
            lne: '⪇',
            lneq: '⪇',
            lneqq: '≨',
            lnsim: '⋦',
            loang: '⟬',
            loarr: '⇽',
            lobrk: '⟦',
            longleftarrow: '⟵',
            longleftrightarrow: '⟷',
            longmapsto: '⟼',
            longrightarrow: '⟶',
            looparrowleft: '↫',
            looparrowright: '↬',
            lopar: '⦅',
            lopf: '𝕝',
            loplus: '⨭',
            lotimes: '⨴',
            lowast: '∗',
            lowbar: '_',
            loz: '◊',
            lozenge: '◊',
            lozf: '⧫',
            lpar: '(',
            lparlt: '⦓',
            lrarr: '⇆',
            lrcorner: '⌟',
            lrhar: '⇋',
            lrhard: '⥭',
            lrm: '‎',
            lrtri: '⊿',
            lsaquo: '‹',
            lscr: '𝓁',
            lsh: '↰',
            lsim: '≲',
            lsime: '⪍',
            lsimg: '⪏',
            lsqb: '[',
            lsquo: '‘',
            lsquor: '‚',
            lstrok: 'ł',
            l: '<',
            lt: '<',
            ltcc: '⪦',
            ltcir: '⩹',
            ltdot: '⋖',
            lthree: '⋋',
            ltimes: '⋉',
            ltlarr: '⥶',
            ltquest: '⩻',
            ltrPar: '⦖',
            ltri: '◃',
            ltrie: '⊴',
            ltrif: '◂',
            lurdshar: '⥊',
            luruhar: '⥦',
            lvertneqq: '≨︀',
            lvnE: '≨︀',
            mDDot: '∺',
            mac: '¯',
            macr: '¯',
            male: '♂',
            malt: '✠',
            maltese: '✠',
            map: '↦',
            mapsto: '↦',
            mapstodown: '↧',
            mapstoleft: '↤',
            mapstoup: '↥',
            marker: '▮',
            mcomma: '⨩',
            mcy: 'м',
            mdash: '—',
            measuredangle: '∡',
            mfr: '𝔪',
            mho: '℧',
            micr: 'µ',
            micro: 'µ',
            mid: '∣',
            midast: '*',
            midcir: '⫰',
            middo: '·',
            middot: '·',
            minus: '−',
            minusb: '⊟',
            minusd: '∸',
            minusdu: '⨪',
            mlcp: '⫛',
            mldr: '…',
            mnplus: '∓',
            models: '⊧',
            mopf: '𝕞',
            mp: '∓',
            mscr: '𝓂',
            mstpos: '∾',
            mu: 'μ',
            multimap: '⊸',
            mumap: '⊸',
            nGg: '⋙̸',
            nGt: '≫⃒',
            nGtv: '≫̸',
            nLeftarrow: '⇍',
            nLeftrightarrow: '⇎',
            nLl: '⋘̸',
            nLt: '≪⃒',
            nLtv: '≪̸',
            nRightarrow: '⇏',
            nVDash: '⊯',
            nVdash: '⊮',
            nabla: '∇',
            nacute: 'ń',
            nang: '∠⃒',
            nap: '≉',
            napE: '⩰̸',
            napid: '≋̸',
            napos: 'ŉ',
            napprox: '≉',
            natur: '♮',
            natural: '♮',
            naturals: 'ℕ',
            nbs: ' ',
            nbsp: ' ',
            nbump: '≎̸',
            nbumpe: '≏̸',
            ncap: '⩃',
            ncaron: 'ň',
            ncedil: 'ņ',
            ncong: '≇',
            ncongdot: '⩭̸',
            ncup: '⩂',
            ncy: 'н',
            ndash: '–',
            ne: '≠',
            neArr: '⇗',
            nearhk: '⤤',
            nearr: '↗',
            nearrow: '↗',
            nedot: '≐̸',
            nequiv: '≢',
            nesear: '⤨',
            nesim: '≂̸',
            nexist: '∄',
            nexists: '∄',
            nfr: '𝔫',
            ngE: '≧̸',
            nge: '≱',
            ngeq: '≱',
            ngeqq: '≧̸',
            ngeqslant: '⩾̸',
            nges: '⩾̸',
            ngsim: '≵',
            ngt: '≯',
            ngtr: '≯',
            nhArr: '⇎',
            nharr: '↮',
            nhpar: '⫲',
            ni: '∋',
            nis: '⋼',
            nisd: '⋺',
            niv: '∋',
            njcy: 'њ',
            nlArr: '⇍',
            nlE: '≦̸',
            nlarr: '↚',
            nldr: '‥',
            nle: '≰',
            nleftarrow: '↚',
            nleftrightarrow: '↮',
            nleq: '≰',
            nleqq: '≦̸',
            nleqslant: '⩽̸',
            nles: '⩽̸',
            nless: '≮',
            nlsim: '≴',
            nlt: '≮',
            nltri: '⋪',
            nltrie: '⋬',
            nmid: '∤',
            nopf: '𝕟',
            no: '¬',
            not: '¬',
            notin: '∉',
            notinE: '⋹̸',
            notindot: '⋵̸',
            notinva: '∉',
            notinvb: '⋷',
            notinvc: '⋶',
            notni: '∌',
            notniva: '∌',
            notnivb: '⋾',
            notnivc: '⋽',
            npar: '∦',
            nparallel: '∦',
            nparsl: '⫽⃥',
            npart: '∂̸',
            npolint: '⨔',
            npr: '⊀',
            nprcue: '⋠',
            npre: '⪯̸',
            nprec: '⊀',
            npreceq: '⪯̸',
            nrArr: '⇏',
            nrarr: '↛',
            nrarrc: '⤳̸',
            nrarrw: '↝̸',
            nrightarrow: '↛',
            nrtri: '⋫',
            nrtrie: '⋭',
            nsc: '⊁',
            nsccue: '⋡',
            nsce: '⪰̸',
            nscr: '𝓃',
            nshortmid: '∤',
            nshortparallel: '∦',
            nsim: '≁',
            nsime: '≄',
            nsimeq: '≄',
            nsmid: '∤',
            nspar: '∦',
            nsqsube: '⋢',
            nsqsupe: '⋣',
            nsub: '⊄',
            nsubE: '⫅̸',
            nsube: '⊈',
            nsubset: '⊂⃒',
            nsubseteq: '⊈',
            nsubseteqq: '⫅̸',
            nsucc: '⊁',
            nsucceq: '⪰̸',
            nsup: '⊅',
            nsupE: '⫆̸',
            nsupe: '⊉',
            nsupset: '⊃⃒',
            nsupseteq: '⊉',
            nsupseteqq: '⫆̸',
            ntgl: '≹',
            ntild: 'ñ',
            ntilde: 'ñ',
            ntlg: '≸',
            ntriangleleft: '⋪',
            ntrianglelefteq: '⋬',
            ntriangleright: '⋫',
            ntrianglerighteq: '⋭',
            nu: 'ν',
            num: '#',
            numero: '№',
            numsp: ' ',
            nvDash: '⊭',
            nvHarr: '⤄',
            nvap: '≍⃒',
            nvdash: '⊬',
            nvge: '≥⃒',
            nvgt: '>⃒',
            nvinfin: '⧞',
            nvlArr: '⤂',
            nvle: '≤⃒',
            nvlt: '<⃒',
            nvltrie: '⊴⃒',
            nvrArr: '⤃',
            nvrtrie: '⊵⃒',
            nvsim: '∼⃒',
            nwArr: '⇖',
            nwarhk: '⤣',
            nwarr: '↖',
            nwarrow: '↖',
            nwnear: '⤧',
            oS: 'Ⓢ',
            oacut: 'ó',
            oacute: 'ó',
            oast: '⊛',
            ocir: 'ô',
            ocirc: 'ô',
            ocy: 'о',
            odash: '⊝',
            odblac: 'ő',
            odiv: '⨸',
            odot: '⊙',
            odsold: '⦼',
            oelig: 'œ',
            ofcir: '⦿',
            ofr: '𝔬',
            ogon: '˛',
            ograv: 'ò',
            ograve: 'ò',
            ogt: '⧁',
            ohbar: '⦵',
            ohm: 'Ω',
            oint: '∮',
            olarr: '↺',
            olcir: '⦾',
            olcross: '⦻',
            oline: '‾',
            olt: '⧀',
            omacr: 'ō',
            omega: 'ω',
            omicron: 'ο',
            omid: '⦶',
            ominus: '⊖',
            oopf: '𝕠',
            opar: '⦷',
            operp: '⦹',
            oplus: '⊕',
            or: '∨',
            orarr: '↻',
            ord: 'º',
            order: 'ℴ',
            orderof: 'ℴ',
            ordf: 'ª',
            ordm: 'º',
            origof: '⊶',
            oror: '⩖',
            orslope: '⩗',
            orv: '⩛',
            oscr: 'ℴ',
            oslas: 'ø',
            oslash: 'ø',
            osol: '⊘',
            otild: 'õ',
            otilde: 'õ',
            otimes: '⊗',
            otimesas: '⨶',
            oum: 'ö',
            ouml: 'ö',
            ovbar: '⌽',
            par: '¶',
            para: '¶',
            parallel: '∥',
            parsim: '⫳',
            parsl: '⫽',
            part: '∂',
            pcy: 'п',
            percnt: '%',
            period: '.',
            permil: '‰',
            perp: '⊥',
            pertenk: '‱',
            pfr: '𝔭',
            phi: 'φ',
            phiv: 'ϕ',
            phmmat: 'ℳ',
            phone: '☎',
            pi: 'π',
            pitchfork: '⋔',
            piv: 'ϖ',
            planck: 'ℏ',
            planckh: 'ℎ',
            plankv: 'ℏ',
            plus: '+',
            plusacir: '⨣',
            plusb: '⊞',
            pluscir: '⨢',
            plusdo: '∔',
            plusdu: '⨥',
            pluse: '⩲',
            plusm: '±',
            plusmn: '±',
            plussim: '⨦',
            plustwo: '⨧',
            pm: '±',
            pointint: '⨕',
            popf: '𝕡',
            poun: '£',
            pound: '£',
            pr: '≺',
            prE: '⪳',
            prap: '⪷',
            prcue: '≼',
            pre: '⪯',
            prec: '≺',
            precapprox: '⪷',
            preccurlyeq: '≼',
            preceq: '⪯',
            precnapprox: '⪹',
            precneqq: '⪵',
            precnsim: '⋨',
            precsim: '≾',
            prime: '′',
            primes: 'ℙ',
            prnE: '⪵',
            prnap: '⪹',
            prnsim: '⋨',
            prod: '∏',
            profalar: '⌮',
            profline: '⌒',
            profsurf: '⌓',
            prop: '∝',
            propto: '∝',
            prsim: '≾',
            prurel: '⊰',
            pscr: '𝓅',
            psi: 'ψ',
            puncsp: ' ',
            qfr: '𝔮',
            qint: '⨌',
            qopf: '𝕢',
            qprime: '⁗',
            qscr: '𝓆',
            quaternions: 'ℍ',
            quatint: '⨖',
            quest: '?',
            questeq: '≟',
            quo: '"',
            quot: '"',
            rAarr: '⇛',
            rArr: '⇒',
            rAtail: '⤜',
            rBarr: '⤏',
            rHar: '⥤',
            race: '∽̱',
            racute: 'ŕ',
            radic: '√',
            raemptyv: '⦳',
            rang: '⟩',
            rangd: '⦒',
            range: '⦥',
            rangle: '⟩',
            raqu: '»',
            raquo: '»',
            rarr: '→',
            rarrap: '⥵',
            rarrb: '⇥',
            rarrbfs: '⤠',
            rarrc: '⤳',
            rarrfs: '⤞',
            rarrhk: '↪',
            rarrlp: '↬',
            rarrpl: '⥅',
            rarrsim: '⥴',
            rarrtl: '↣',
            rarrw: '↝',
            ratail: '⤚',
            ratio: '∶',
            rationals: 'ℚ',
            rbarr: '⤍',
            rbbrk: '❳',
            rbrace: '}',
            rbrack: ']',
            rbrke: '⦌',
            rbrksld: '⦎',
            rbrkslu: '⦐',
            rcaron: 'ř',
            rcedil: 'ŗ',
            rceil: '⌉',
            rcub: '}',
            rcy: 'р',
            rdca: '⤷',
            rdldhar: '⥩',
            rdquo: '”',
            rdquor: '”',
            rdsh: '↳',
            real: 'ℜ',
            realine: 'ℛ',
            realpart: 'ℜ',
            reals: 'ℝ',
            rect: '▭',
            re: '®',
            reg: '®',
            rfisht: '⥽',
            rfloor: '⌋',
            rfr: '𝔯',
            rhard: '⇁',
            rharu: '⇀',
            rharul: '⥬',
            rho: 'ρ',
            rhov: 'ϱ',
            rightarrow: '→',
            rightarrowtail: '↣',
            rightharpoondown: '⇁',
            rightharpoonup: '⇀',
            rightleftarrows: '⇄',
            rightleftharpoons: '⇌',
            rightrightarrows: '⇉',
            rightsquigarrow: '↝',
            rightthreetimes: '⋌',
            ring: '˚',
            risingdotseq: '≓',
            rlarr: '⇄',
            rlhar: '⇌',
            rlm: '‏',
            rmoust: '⎱',
            rmoustache: '⎱',
            rnmid: '⫮',
            roang: '⟭',
            roarr: '⇾',
            robrk: '⟧',
            ropar: '⦆',
            ropf: '𝕣',
            roplus: '⨮',
            rotimes: '⨵',
            rpar: ')',
            rpargt: '⦔',
            rppolint: '⨒',
            rrarr: '⇉',
            rsaquo: '›',
            rscr: '𝓇',
            rsh: '↱',
            rsqb: ']',
            rsquo: '’',
            rsquor: '’',
            rthree: '⋌',
            rtimes: '⋊',
            rtri: '▹',
            rtrie: '⊵',
            rtrif: '▸',
            rtriltri: '⧎',
            ruluhar: '⥨',
            rx: '℞',
            sacute: 'ś',
            sbquo: '‚',
            sc: '≻',
            scE: '⪴',
            scap: '⪸',
            scaron: 'š',
            sccue: '≽',
            sce: '⪰',
            scedil: 'ş',
            scirc: 'ŝ',
            scnE: '⪶',
            scnap: '⪺',
            scnsim: '⋩',
            scpolint: '⨓',
            scsim: '≿',
            scy: 'с',
            sdot: '⋅',
            sdotb: '⊡',
            sdote: '⩦',
            seArr: '⇘',
            searhk: '⤥',
            searr: '↘',
            searrow: '↘',
            sec: '§',
            sect: '§',
            semi: ';',
            seswar: '⤩',
            setminus: '∖',
            setmn: '∖',
            sext: '✶',
            sfr: '𝔰',
            sfrown: '⌢',
            sharp: '♯',
            shchcy: 'щ',
            shcy: 'ш',
            shortmid: '∣',
            shortparallel: '∥',
            sh: '­',
            shy: '­',
            sigma: 'σ',
            sigmaf: 'ς',
            sigmav: 'ς',
            sim: '∼',
            simdot: '⩪',
            sime: '≃',
            simeq: '≃',
            simg: '⪞',
            simgE: '⪠',
            siml: '⪝',
            simlE: '⪟',
            simne: '≆',
            simplus: '⨤',
            simrarr: '⥲',
            slarr: '←',
            smallsetminus: '∖',
            smashp: '⨳',
            smeparsl: '⧤',
            smid: '∣',
            smile: '⌣',
            smt: '⪪',
            smte: '⪬',
            smtes: '⪬︀',
            softcy: 'ь',
            sol: '/',
            solb: '⧄',
            solbar: '⌿',
            sopf: '𝕤',
            spades: '♠',
            spadesuit: '♠',
            spar: '∥',
            sqcap: '⊓',
            sqcaps: '⊓︀',
            sqcup: '⊔',
            sqcups: '⊔︀',
            sqsub: '⊏',
            sqsube: '⊑',
            sqsubset: '⊏',
            sqsubseteq: '⊑',
            sqsup: '⊐',
            sqsupe: '⊒',
            sqsupset: '⊐',
            sqsupseteq: '⊒',
            squ: '□',
            square: '□',
            squarf: '▪',
            squf: '▪',
            srarr: '→',
            sscr: '𝓈',
            ssetmn: '∖',
            ssmile: '⌣',
            sstarf: '⋆',
            star: '☆',
            starf: '★',
            straightepsilon: 'ϵ',
            straightphi: 'ϕ',
            strns: '¯',
            sub: '⊂',
            subE: '⫅',
            subdot: '⪽',
            sube: '⊆',
            subedot: '⫃',
            submult: '⫁',
            subnE: '⫋',
            subne: '⊊',
            subplus: '⪿',
            subrarr: '⥹',
            subset: '⊂',
            subseteq: '⊆',
            subseteqq: '⫅',
            subsetneq: '⊊',
            subsetneqq: '⫋',
            subsim: '⫇',
            subsub: '⫕',
            subsup: '⫓',
            succ: '≻',
            succapprox: '⪸',
            succcurlyeq: '≽',
            succeq: '⪰',
            succnapprox: '⪺',
            succneqq: '⪶',
            succnsim: '⋩',
            succsim: '≿',
            sum: '∑',
            sung: '♪',
            sup: '⊃',
            sup1: '¹',
            sup2: '²',
            sup3: '³',
            supE: '⫆',
            supdot: '⪾',
            supdsub: '⫘',
            supe: '⊇',
            supedot: '⫄',
            suphsol: '⟉',
            suphsub: '⫗',
            suplarr: '⥻',
            supmult: '⫂',
            supnE: '⫌',
            supne: '⊋',
            supplus: '⫀',
            supset: '⊃',
            supseteq: '⊇',
            supseteqq: '⫆',
            supsetneq: '⊋',
            supsetneqq: '⫌',
            supsim: '⫈',
            supsub: '⫔',
            supsup: '⫖',
            swArr: '⇙',
            swarhk: '⤦',
            swarr: '↙',
            swarrow: '↙',
            swnwar: '⤪',
            szli: 'ß',
            szlig: 'ß',
            target: '⌖',
            tau: 'τ',
            tbrk: '⎴',
            tcaron: 'ť',
            tcedil: 'ţ',
            tcy: 'т',
            tdot: '⃛',
            telrec: '⌕',
            tfr: '𝔱',
            there4: '∴',
            therefore: '∴',
            theta: 'θ',
            thetasym: 'ϑ',
            thetav: 'ϑ',
            thickapprox: '≈',
            thicksim: '∼',
            thinsp: ' ',
            thkap: '≈',
            thksim: '∼',
            thor: 'þ',
            thorn: 'þ',
            tilde: '˜',
            time: '×',
            times: '×',
            timesb: '⊠',
            timesbar: '⨱',
            timesd: '⨰',
            tint: '∭',
            toea: '⤨',
            top: '⊤',
            topbot: '⌶',
            topcir: '⫱',
            topf: '𝕥',
            topfork: '⫚',
            tosa: '⤩',
            tprime: '‴',
            trade: '™',
            triangle: '▵',
            triangledown: '▿',
            triangleleft: '◃',
            trianglelefteq: '⊴',
            triangleq: '≜',
            triangleright: '▹',
            trianglerighteq: '⊵',
            tridot: '◬',
            trie: '≜',
            triminus: '⨺',
            triplus: '⨹',
            trisb: '⧍',
            tritime: '⨻',
            trpezium: '⏢',
            tscr: '𝓉',
            tscy: 'ц',
            tshcy: 'ћ',
            tstrok: 'ŧ',
            twixt: '≬',
            twoheadleftarrow: '↞',
            twoheadrightarrow: '↠',
            uArr: '⇑',
            uHar: '⥣',
            uacut: 'ú',
            uacute: 'ú',
            uarr: '↑',
            ubrcy: 'ў',
            ubreve: 'ŭ',
            ucir: 'û',
            ucirc: 'û',
            ucy: 'у',
            udarr: '⇅',
            udblac: 'ű',
            udhar: '⥮',
            ufisht: '⥾',
            ufr: '𝔲',
            ugrav: 'ù',
            ugrave: 'ù',
            uharl: '↿',
            uharr: '↾',
            uhblk: '▀',
            ulcorn: '⌜',
            ulcorner: '⌜',
            ulcrop: '⌏',
            ultri: '◸',
            umacr: 'ū',
            um: '¨',
            uml: '¨',
            uogon: 'ų',
            uopf: '𝕦',
            uparrow: '↑',
            updownarrow: '↕',
            upharpoonleft: '↿',
            upharpoonright: '↾',
            uplus: '⊎',
            upsi: 'υ',
            upsih: 'ϒ',
            upsilon: 'υ',
            upuparrows: '⇈',
            urcorn: '⌝',
            urcorner: '⌝',
            urcrop: '⌎',
            uring: 'ů',
            urtri: '◹',
            uscr: '𝓊',
            utdot: '⋰',
            utilde: 'ũ',
            utri: '▵',
            utrif: '▴',
            uuarr: '⇈',
            uum: 'ü',
            uuml: 'ü',
            uwangle: '⦧',
            vArr: '⇕',
            vBar: '⫨',
            vBarv: '⫩',
            vDash: '⊨',
            vangrt: '⦜',
            varepsilon: 'ϵ',
            varkappa: 'ϰ',
            varnothing: '∅',
            varphi: 'ϕ',
            varpi: 'ϖ',
            varpropto: '∝',
            varr: '↕',
            varrho: 'ϱ',
            varsigma: 'ς',
            varsubsetneq: '⊊︀',
            varsubsetneqq: '⫋︀',
            varsupsetneq: '⊋︀',
            varsupsetneqq: '⫌︀',
            vartheta: 'ϑ',
            vartriangleleft: '⊲',
            vartriangleright: '⊳',
            vcy: 'в',
            vdash: '⊢',
            vee: '∨',
            veebar: '⊻',
            veeeq: '≚',
            vellip: '⋮',
            verbar: '|',
            vert: '|',
            vfr: '𝔳',
            vltri: '⊲',
            vnsub: '⊂⃒',
            vnsup: '⊃⃒',
            vopf: '𝕧',
            vprop: '∝',
            vrtri: '⊳',
            vscr: '𝓋',
            vsubnE: '⫋︀',
            vsubne: '⊊︀',
            vsupnE: '⫌︀',
            vsupne: '⊋︀',
            vzigzag: '⦚',
            wcirc: 'ŵ',
            wedbar: '⩟',
            wedge: '∧',
            wedgeq: '≙',
            weierp: '℘',
            wfr: '𝔴',
            wopf: '𝕨',
            wp: '℘',
            wr: '≀',
            wreath: '≀',
            wscr: '𝓌',
            xcap: '⋂',
            xcirc: '◯',
            xcup: '⋃',
            xdtri: '▽',
            xfr: '𝔵',
            xhArr: '⟺',
            xharr: '⟷',
            xi: 'ξ',
            xlArr: '⟸',
            xlarr: '⟵',
            xmap: '⟼',
            xnis: '⋻',
            xodot: '⨀',
            xopf: '𝕩',
            xoplus: '⨁',
            xotime: '⨂',
            xrArr: '⟹',
            xrarr: '⟶',
            xscr: '𝓍',
            xsqcup: '⨆',
            xuplus: '⨄',
            xutri: '△',
            xvee: '⋁',
            xwedge: '⋀',
            yacut: 'ý',
            yacute: 'ý',
            yacy: 'я',
            ycirc: 'ŷ',
            ycy: 'ы',
            ye: '¥',
            yen: '¥',
            yfr: '𝔶',
            yicy: 'ї',
            yopf: '𝕪',
            yscr: '𝓎',
            yucy: 'ю',
            yum: 'ÿ',
            yuml: 'ÿ',
            zacute: 'ź',
            zcaron: 'ž',
            zcy: 'з',
            zdot: 'ż',
            zeetrf: 'ℨ',
            zeta: 'ζ',
            zfr: '𝔷',
            zhcy: 'ж',
            zigrarr: '⇝',
            zopf: '𝕫',
            zscr: '𝓏',
            zwj: '‍',
            zwnj: '‌',
          };
        }),
        R = c((e, t) => {
          var r = O();
          t.exports = function (e) {
            return !!n.call(r, e) && r[e];
          };
          var n = {}.hasOwnProperty;
        }),
        N = c((e, t) => {
          var r = k(),
            n = B(),
            u = q(),
            i = S(),
            o = L(),
            a = R();
          t.exports = function (e, t) {
            var u,
              i,
              k = {};
            for (i in (t || (t = {}), D)) (u = t[i]), (k[i] = u ?? D[i]);
            return (
              (k.position.indent || k.position.start) &&
                ((k.indent = k.position.indent || []), (k.position = k.position.start)),
              (function (e, t) {
                var u,
                  i,
                  D,
                  k,
                  B,
                  q,
                  S,
                  L,
                  R,
                  G,
                  W,
                  H,
                  J,
                  Z,
                  Y,
                  K,
                  Q,
                  X,
                  ee,
                  te = t.additional,
                  re = t.nonTerminated,
                  ne = t.text,
                  ue = t.reference,
                  ie = t.warning,
                  oe = t.textContext,
                  ae = t.referenceContext,
                  le = t.warningContext,
                  se = t.position,
                  ce = t.indent || [],
                  De = e.length,
                  fe = 0,
                  pe = -1,
                  he = se.column || 1,
                  de = se.line || 1,
                  ge = '',
                  Fe = [];
                for (
                  'string' == typeof te && (te = te.charCodeAt(0)),
                    K = me(),
                    L = ie
                      ? function (e, t) {
                          var r = me();
                          (r.column += t), (r.offset += t), ie.call(le, M[e], r, e);
                        }
                      : c,
                    fe--,
                    De++;
                  ++fe < De;
                )
                  if ((B === p && (he = ce[pe] || 1), (B = e.charCodeAt(fe)) === g)) {
                    if (
                      (S = e.charCodeAt(fe + 1)) === f ||
                      S === p ||
                      S === h ||
                      S === d ||
                      S === g ||
                      S === m ||
                      S != S ||
                      (te && S === te)
                    ) {
                      (ge += s(B)), he++;
                      continue;
                    }
                    for (
                      H = J = fe + 1,
                        ee = J,
                        S === E
                          ? ((ee = ++H),
                            (S = e.charCodeAt(ee)) === b || S === v
                              ? ((Z = x), (ee = ++H))
                              : (Z = w))
                          : (Z = A),
                        u = '',
                        W = '',
                        k = '',
                        Y = O[Z],
                        ee--;
                      ++ee < De && Y((S = e.charCodeAt(ee)));
                    )
                      (k += s(S)), Z === A && l.call(r, k) && ((u = k), (W = r[k]));
                    (D = e.charCodeAt(ee) === F) &&
                      (ee++, (i = Z === A && a(k)) && ((u = k), (W = i))),
                      (X = 1 + ee - J),
                      (!D && !re) ||
                        (k
                          ? Z === A
                            ? (D && !W
                                ? L(z, 1)
                                : (u !== k && ((X = 1 + (ee = H + u.length) - H), (D = !1)),
                                  D ||
                                    ((R = u ? N : P),
                                    t.attribute
                                      ? (S = e.charCodeAt(ee)) === C
                                        ? (L(R, X), (W = null))
                                        : o(S)
                                          ? (W = null)
                                          : L(R, X)
                                      : L(R, X))),
                              (q = W))
                            : (D || L(I, X),
                              V((q = parseInt(k, T[Z])))
                                ? (L(U, X), (q = s(y)))
                                : q in n
                                  ? (L($, X), (q = n[q]))
                                  : ((G = ''),
                                    _(q) && L($, X),
                                    q > 65535 &&
                                      ((G += s(((q -= 65536) >>> 10) | 55296)),
                                      (q = 56320 | (1023 & q))),
                                    (q = G + s(q))))
                          : Z !== A && L(j, X)),
                      q
                        ? (Ce(),
                          (K = me()),
                          (fe = ee - 1),
                          (he += ee - J + 1),
                          Fe.push(q),
                          (Q = me()).offset++,
                          ue && ue.call(ae, q, { start: K, end: Q }, e.slice(J - 1, ee)),
                          (K = Q))
                        : ((k = e.slice(J - 1, ee)), (ge += k), (he += k.length), (fe = ee - 1));
                  } else 10 === B && (de++, pe++, (he = 0)), B == B ? ((ge += s(B)), he++) : Ce();
                return Fe.join('');
                function me() {
                  return { line: de, column: he, offset: fe + (se.offset || 0) };
                }
                function Ce() {
                  ge && (Fe.push(ge), ne && ne.call(oe, ge, { start: K, end: me() }), (ge = ''));
                }
              })(e, k)
            );
          };
          var l = {}.hasOwnProperty,
            s = String.fromCharCode,
            c = Function.prototype,
            D = {
              warning: null,
              reference: null,
              text: null,
              warningContext: null,
              referenceContext: null,
              textContext: null,
              position: {},
              additional: null,
              attribute: !1,
              nonTerminated: !0,
            },
            f = 9,
            p = 10,
            h = 12,
            d = 32,
            g = 38,
            F = 59,
            m = 60,
            C = 61,
            E = 35,
            b = 88,
            v = 120,
            y = 65533,
            A = 'named',
            x = 'hexadecimal',
            w = 'decimal',
            T = {};
          (T[x] = 16), (T[w] = 10);
          var O = {};
          (O[A] = o), (O[w] = u), (O[x] = i);
          var N = 1,
            I = 2,
            P = 3,
            j = 4,
            z = 5,
            $ = 6,
            U = 7,
            M = {};
          function V(e) {
            return (e >= 55296 && e <= 57343) || e > 1114111;
          }
          function _(e) {
            return (
              (e >= 1 && e <= 8) ||
              11 === e ||
              (e >= 13 && e <= 31) ||
              (e >= 127 && e <= 159) ||
              (e >= 64976 && e <= 65007) ||
              !(65535 & ~e) ||
              65534 == (65535 & e)
            );
          }
          (M[N] = 'Named character references must be terminated by a semicolon'),
            (M[I] = 'Numeric character references must be terminated by a semicolon'),
            (M[P] = 'Named character references cannot be empty'),
            (M[j] = 'Numeric character references cannot be empty'),
            (M[z] = 'Named character references must be known'),
            (M[$] = 'Numeric character references cannot be disallowed'),
            (M[U] = 'Numeric character references cannot be outside the permissible Unicode range');
        }),
        I = c((e, t) => {
          var r = b(),
            n = N();
          t.exports = function (e) {
            return (
              (u.raw = function (e, u, o) {
                return n(e, r(o, { position: t(u), warning: i }));
              }),
              u
            );
            function t(t) {
              for (var r = e.offset, n = t.line, u = []; ++n && n in r; ) u.push((r[n] || 0) + 1);
              return { start: t, indent: u };
            }
            function u(r, u, o) {
              n(r, {
                position: t(u),
                warning: i,
                text: o,
                reference: o,
                textContext: e,
                referenceContext: e,
              });
            }
            function i(t, r, n) {
              3 !== n && e.file.message(t, r);
            }
          };
        }),
        P = c((e, t) => {
          function r(e) {
            var t, r;
            return (
              'text' !== e.type ||
              !e.position ||
              ((t = e.position.start),
              (r = e.position.end),
              t.line !== r.line || r.column - t.column === e.value.length)
            );
          }
          function n(e, t) {
            return (e.value += t.value), e;
          }
          function u(e, t) {
            return this.options.commonmark || this.options.gfm
              ? t
              : ((e.children = e.children.concat(t.children)), e);
          }
          t.exports = function (e) {
            return function (t, i) {
              var o,
                a,
                l,
                s,
                c,
                D = this,
                f = D.offset,
                p = [],
                h = D[e + 'Methods'],
                d = D[e + 'Tokenizers'],
                g = i.line,
                F = i.column;
              if (!t) return p;
              for (b.now = C, b.file = D.file, m(''); t; ) {
                for (
                  o = -1, a = h.length, s = !1;
                  ++o < a &&
                  (!(l = d[h[o]]) ||
                    (l.onlyAtStart && !D.atStart) ||
                    (l.notInList && D.inList) ||
                    (l.notInBlock && D.inBlock) ||
                    (l.notInLink && D.inLink) ||
                    ((c = t.length), l.apply(D, [b, t]), !(s = c !== t.length)));
                );
                s || D.file.fail(new Error('Infinite loop'), b.now());
              }
              return (D.eof = C()), p;
              function m(e) {
                for (var t = -1, r = e.indexOf('\n'); -1 !== r; )
                  g++, (t = r), (r = e.indexOf('\n', r + 1));
                -1 === t ? (F += e.length) : (F = e.length - t),
                  g in f && (-1 !== t ? (F += f[g]) : F <= f[g] && (F = f[g] + 1));
              }
              function C() {
                var e = { line: g, column: F };
                return (e.offset = D.toOffset(e)), e;
              }
              function E(e) {
                (this.start = e), (this.end = C());
              }
              function b(e) {
                var i = (function () {
                    var e = [],
                      t = g + 1;
                    return function () {
                      for (var r = g + 1; t < r; ) e.push((f[t] || 0) + 1), t++;
                      return e;
                    };
                  })(),
                  o = (function () {
                    var e = C();
                    return function (t, r) {
                      var n = t.position,
                        u = n ? n.start : e,
                        i = [],
                        o = n && n.end.line,
                        a = e.line;
                      if (((t.position = new E(u)), n && r && n.indent)) {
                        if (((i = n.indent), o < a)) {
                          for (; ++o < a; ) i.push((f[o] || 0) + 1);
                          i.push(e.column);
                        }
                        r = i.concat(r);
                      }
                      return (t.position.indent = r || []), t;
                    };
                  })(),
                  a = C();
                return (
                  (function (e) {
                    t.slice(0, e.length) !== e &&
                      D.file.fail(
                        new Error(
                          'Incorrectly eaten value: please report this warning on https://git.io/vg5Ft'
                        ),
                        C()
                      );
                  })(e),
                  (l.reset = s),
                  (s.test = c),
                  (l.test = c),
                  (t = t.slice(e.length)),
                  m(e),
                  (i = i()),
                  l
                );
                function l(e, t) {
                  return o(
                    (function (e, t) {
                      var i = t ? t.children : p,
                        o = i[i.length - 1];
                      return (
                        o &&
                          e.type === o.type &&
                          ('text' === e.type || 'blockquote' === e.type) &&
                          r(o) &&
                          r(e) &&
                          (e = ('text' === e.type ? n : u).call(D, o, e)),
                        e !== o && i.push(e),
                        D.atStart && 0 !== p.length && D.exitStart(),
                        e
                      );
                    })(o(e), t),
                    i
                  );
                }
                function s() {
                  var r = l.apply(null, arguments);
                  return (g = a.line), (F = a.column), (t = e + t), r;
                }
                function c() {
                  var r = o({});
                  return (g = a.line), (F = a.column), (t = e + t), r.position;
                }
              }
            };
          };
        }),
        j = c((e, t) => {
          t.exports = i;
          var r = ['\\', '`', '*', '{', '}', '[', ']', '(', ')', '#', '+', '-', '.', '!', '_', '>'],
            n = r.concat(['~', '|']),
            u = n.concat([
              '\n',
              '"',
              '$',
              '%',
              '&',
              "'",
              ',',
              '/',
              ':',
              ';',
              '<',
              '=',
              '?',
              '@',
              '^',
            ]);
          function i(e) {
            var t = e || {};
            return t.commonmark ? u : t.gfm ? n : r;
          }
          (i.default = r), (i.gfm = n), (i.commonmark = u);
        }),
        z = c((e, t) => {
          t.exports = [
            'address',
            'article',
            'aside',
            'base',
            'basefont',
            'blockquote',
            'body',
            'caption',
            'center',
            'col',
            'colgroup',
            'dd',
            'details',
            'dialog',
            'dir',
            'div',
            'dl',
            'dt',
            'fieldset',
            'figcaption',
            'figure',
            'footer',
            'form',
            'frame',
            'frameset',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'head',
            'header',
            'hgroup',
            'hr',
            'html',
            'iframe',
            'legend',
            'li',
            'link',
            'main',
            'menu',
            'menuitem',
            'meta',
            'nav',
            'noframes',
            'ol',
            'optgroup',
            'option',
            'p',
            'param',
            'pre',
            'section',
            'source',
            'title',
            'summary',
            'table',
            'tbody',
            'td',
            'tfoot',
            'th',
            'thead',
            'title',
            'tr',
            'track',
            'ul',
          ];
        }),
        $ = c((e, t) => {
          t.exports = { position: !0, gfm: !0, commonmark: !1, pedantic: !1, blocks: z() };
        }),
        U = c((e, t) => {
          var r = b(),
            n = j(),
            u = $();
          t.exports = function (e) {
            var t,
              i,
              o = this,
              a = o.options;
            if (null == e) e = {};
            else {
              if ('object' != typeof e)
                throw new Error('Invalid value `' + e + '` for setting `options`');
              e = r(e);
            }
            for (t in u) {
              if (
                (null == (i = e[t]) && (i = a[t]),
                ('blocks' !== t && 'boolean' != typeof i) ||
                  ('blocks' === t && 'object' != typeof i))
              )
                throw new Error('Invalid value `' + i + '` for setting `options.' + t + '`');
              e[t] = i;
            }
            return (o.options = e), (o.escape = n(e)), o;
          };
        }),
        M = c((e, t) => {
          function r() {
            return !0;
          }
          t.exports = function e(t) {
            if (null == t) return r;
            if ('string' == typeof t)
              return (function (e) {
                return function (t) {
                  return !(!t || t.type !== e);
                };
              })(t);
            if ('object' == typeof t)
              return 'length' in t
                ? (function (t) {
                    for (var r = [], n = -1; ++n < t.length; ) r[n] = e(t[n]);
                    return function () {
                      for (var e = -1; ++e < r.length; ) if (r[e].apply(this, arguments)) return !0;
                      return !1;
                    };
                  })(t)
                : (function (e) {
                    return function (t) {
                      var r;
                      for (r in e) if (t[r] !== e[r]) return !1;
                      return !0;
                    };
                  })(t);
            if ('function' == typeof t) return t;
            throw new Error('Expected function, string, or object as test');
          };
        }),
        V = c((e, t) => {
          t.exports = function (e) {
            return e;
          };
        }),
        _ = c((e, t) => {
          t.exports = a;
          var r = M(),
            n = V(),
            u = !0,
            i = 'skip',
            o = !1;
          function a(e, t, a, l) {
            var s, c;
            'function' == typeof t && 'function' != typeof a && ((l = a), (a = t), (t = null)),
              (c = r(t)),
              (s = l ? -1 : 1),
              (function e(r, D, f) {
                var p,
                  h = 'object' == typeof r && null !== r ? r : {};
                return (
                  'string' == typeof h.type &&
                    ((p =
                      'string' == typeof h.tagName
                        ? h.tagName
                        : 'string' == typeof h.name
                          ? h.name
                          : void 0),
                    (d.displayName = 'node (' + n(h.type + (p ? '<' + p + '>' : '')) + ')')),
                  d
                );
                function d() {
                  var n,
                    p,
                    h = f.concat(r),
                    d = [];
                  if (
                    (!t || c(r, D, f[f.length - 1] || null)) &&
                    ((d = (function (e) {
                      return null !== e && 'object' == typeof e && 'length' in e
                        ? e
                        : 'number' == typeof e
                          ? [u, e]
                          : [e];
                    })(a(r, f))),
                    d[0] === o)
                  )
                    return d;
                  if (r.children && d[0] !== i)
                    for (p = (l ? r.children.length : -1) + s; p > -1 && p < r.children.length; ) {
                      if ((n = e(r.children[p], p, h)())[0] === o) return n;
                      p = 'number' == typeof n[1] ? n[1] : p + s;
                    }
                  return d;
                }
              })(e, null, [])();
          }
          (a.CONTINUE = u), (a.SKIP = i), (a.EXIT = o);
        }),
        G = c((e, t) => {
          t.exports = o;
          var r = _(),
            n = r.CONTINUE,
            u = r.SKIP,
            i = r.EXIT;
          function o(e, t, n, u) {
            'function' == typeof t && 'function' != typeof n && ((u = n), (n = t), (t = null)),
              r(
                e,
                t,
                function (e, t) {
                  var r = t[t.length - 1],
                    u = r ? r.children.indexOf(e) : null;
                  return n(e, u, r);
                },
                u
              );
          }
          (o.CONTINUE = n), (o.SKIP = u), (o.EXIT = i);
        }),
        W = c((e, t) => {
          var r = G();
          function n(e) {
            delete e.position;
          }
          function u(e) {
            e.position = void 0;
          }
          t.exports = function (e, t) {
            return r(e, t ? n : u), e;
          };
        }),
        H = c((e, t) => {
          var r = b(),
            n = W();
          t.exports = function () {
            var e,
              t = this,
              o = String(t.file),
              a = { line: 1, column: 1, offset: 0 },
              l = r(a);
            return (
              65279 === (o = o.replace(i, u)).charCodeAt(0) &&
                ((o = o.slice(1)), l.column++, l.offset++),
              (e = {
                type: 'root',
                children: t.tokenizeBlock(o, l),
                position: { start: a, end: t.eof || r(a) },
              }),
              t.options.position || n(e, !0),
              e
            );
          };
          var u = '\n',
            i = /\r\n|\r/g;
        }),
        J = c((e, t) => {
          var r = /^[ \t]*(\n|$)/;
          t.exports = function (e, t, n) {
            for (var u, i = '', o = 0, a = t.length; o < a && null != (u = r.exec(t.slice(o))); )
              (o += u[0].length), (i += u[0]);
            if ('' !== i) {
              if (n) return !0;
              e(i);
            }
          };
        }),
        Z = c((e, t) => {
          var r,
            n = '';
          t.exports = function (e, t) {
            if ('string' != typeof e) throw new TypeError('expected a string');
            if (1 === t) return e;
            if (2 === t) return e + e;
            var u = e.length * t;
            if (r !== e || typeof r > 'u') (r = e), (n = '');
            else if (n.length >= u) return n.substr(0, u);
            for (; u > n.length && t > 1; ) 1 & t && (n += e), (t >>= 1), (e += e);
            return (n = (n += e).substr(0, u));
          };
        }),
        Y = c((e, t) => {
          t.exports = function (e) {
            return String(e).replace(/\n+$/, '');
          };
        }),
        K = c((e, t) => {
          var r = Z(),
            n = Y();
          t.exports = function (e, t, r) {
            for (var l, s, c, D = -1, f = t.length, p = '', h = '', d = '', g = ''; ++D < f; )
              if (((l = t.charAt(D)), c))
                if (((c = !1), (p += d), (h += g), (d = ''), (g = ''), l === u)) (d = l), (g = l);
                else
                  for (p += l, h += l; ++D < f; ) {
                    if (!(l = t.charAt(D)) || l === u) {
                      (g = l), (d = l);
                      break;
                    }
                    (p += l), (h += l);
                  }
              else if (
                l === o &&
                t.charAt(D + 1) === l &&
                t.charAt(D + 2) === l &&
                t.charAt(D + 3) === l
              )
                (d += a), (D += 3), (c = !0);
              else if (l === i) (d += l), (c = !0);
              else {
                for (s = ''; l === i || l === o; ) (s += l), (l = t.charAt(++D));
                if (l !== u) break;
                (d += s + l), (g += l);
              }
            if (h) return !!r || e(p)({ type: 'code', lang: null, meta: null, value: n(h) });
          };
          var u = '\n',
            i = '\t',
            o = ' ',
            a = r(o, 4);
        }),
        Q = c((e, t) => {
          t.exports = function (e, t, s) {
            var c,
              D,
              f,
              p,
              h,
              d,
              g,
              F,
              m,
              C,
              E,
              b,
              v,
              y = this,
              A = y.options.gfm,
              x = t.length + 1,
              w = 0,
              k = '';
            if (A) {
              for (; w < x && ((f = t.charAt(w)) === u || f === n); ) (k += f), w++;
              if (((b = w), (f = t.charAt(w)) === i || f === o)) {
                for (w++, D = f, c = 1, k += f; w < x && (f = t.charAt(w)) === D; )
                  (k += f), c++, w++;
                if (!(c < a)) {
                  for (; w < x && ((f = t.charAt(w)) === u || f === n); ) (k += f), w++;
                  for (p = '', g = ''; w < x && (f = t.charAt(w)) !== r && (D !== o || f !== D); )
                    f === u || f === n ? (g += f) : ((p += g + f), (g = '')), w++;
                  if (!(f = t.charAt(w)) || f === r) {
                    if (s) return !0;
                    ((v = e.now()).column += k.length),
                      (v.offset += k.length),
                      (k += p),
                      (p = y.decode.raw(y.unescape(p), v)),
                      g && (k += g),
                      (g = ''),
                      (C = ''),
                      (E = ''),
                      (F = ''),
                      (m = '');
                    for (var B = !0; w < x; )
                      if (((F += C), (m += E), (C = ''), (E = ''), (f = t.charAt(w)) === r)) {
                        for (
                          B ? ((k += f), (B = !1)) : ((C += f), (E += f)), g = '', w++;
                          w < x && (f = t.charAt(w)) === u;
                        )
                          (g += f), w++;
                        if (((C += g), (E += g.slice(b)), !(g.length >= l))) {
                          for (g = ''; w < x && (f = t.charAt(w)) === D; ) (g += f), w++;
                          if (((C += g), (E += g), !(g.length < c))) {
                            for (g = ''; w < x && ((f = t.charAt(w)) === u || f === n); )
                              (C += f), (E += f), w++;
                            if (!f || f === r) break;
                          }
                        }
                      } else (F += f), (E += f), w++;
                    for (k += F + C, w = -1, x = p.length; ++w < x; )
                      if ((f = p.charAt(w)) === u || f === n) h || (h = p.slice(0, w));
                      else if (h) {
                        d = p.slice(w);
                        break;
                      }
                    return e(k)({ type: 'code', lang: h || p || null, meta: d || null, value: m });
                  }
                }
              }
            }
          };
          var r = '\n',
            n = '\t',
            u = ' ',
            i = '~',
            o = '`',
            a = 3,
            l = 4;
        }),
        X = c((e, t) => {
          ((e = t.exports =
            function (t) {
              return t.trim ? t.trim() : e.right(e.left(t));
            }).left = function (e) {
            return e.trimLeft ? e.trimLeft() : e.replace(/^\s\s*/, '');
          }),
            (e.right = function (e) {
              if (e.trimRight) return e.trimRight();
              for (var t = /\s/, r = e.length; t.test(e.charAt(--r)); );
              return e.slice(0, r + 1);
            });
        }),
        ee = c((e, t) => {
          t.exports = function (e, t, r, n) {
            for (var u, i, o = e.length, a = -1; ++a < o; )
              if (
                (void 0 === (i = (u = e[a])[1] || {}).pedantic ||
                  i.pedantic === r.options.pedantic) &&
                (void 0 === i.commonmark || i.commonmark === r.options.commonmark) &&
                t[u[0]].apply(r, n)
              )
                return !0;
            return !1;
          };
        }),
        te = c((e, t) => {
          var r = X(),
            n = ee();
          t.exports = function (e, t, l) {
            for (
              var s,
                c,
                D,
                f,
                p,
                h,
                d,
                g,
                F,
                m = this,
                C = m.offset,
                E = m.blockTokenizers,
                b = m.interruptBlockquote,
                v = e.now(),
                y = v.line,
                A = t.length,
                x = [],
                w = [],
                k = [],
                B = 0;
              B < A && ((c = t.charAt(B)) === o || c === i);
            )
              B++;
            if (t.charAt(B) === a) {
              if (l) return !0;
              for (B = 0; B < A; ) {
                for (
                  d = B, g = !1, -1 === (f = t.indexOf(u, B)) && (f = A);
                  B < A && ((c = t.charAt(B)) === o || c === i);
                )
                  B++;
                if (
                  (t.charAt(B) === a ? (B++, (g = !0), t.charAt(B) === o && B++) : (B = d),
                  (p = t.slice(B, f)),
                  !g && !r(p))
                ) {
                  B = d;
                  break;
                }
                if (!g && ((D = t.slice(B)), n(b, E, m, [e, D, !0]))) break;
                (h = d === B ? p : t.slice(d, f)), k.push(B - d), x.push(h), w.push(p), (B = f + 1);
              }
              for (B = -1, A = k.length, s = e(x.join(u)); ++B < A; )
                (C[y] = (C[y] || 0) + k[B]), y++;
              return (
                (F = m.enterBlock()),
                (w = m.tokenizeBlock(w.join(u), v)),
                F(),
                s({ type: 'blockquote', children: w })
              );
            }
          };
          var u = '\n',
            i = '\t',
            o = ' ',
            a = '>';
        }),
        re = c((e, t) => {
          t.exports = function (e, t, a) {
            for (
              var l,
                s,
                c,
                D = this.options.pedantic,
                f = t.length + 1,
                p = -1,
                h = e.now(),
                d = '',
                g = '';
              ++p < f;
            ) {
              if ((l = t.charAt(p)) !== u && l !== n) {
                p--;
                break;
              }
              d += l;
            }
            for (c = 0; ++p <= f; ) {
              if ((l = t.charAt(p)) !== i) {
                p--;
                break;
              }
              (d += l), c++;
            }
            if (!(c > o) && c && (D || t.charAt(p + 1) !== i)) {
              for (f = t.length + 1, s = ''; ++p < f; ) {
                if ((l = t.charAt(p)) !== u && l !== n) {
                  p--;
                  break;
                }
                s += l;
              }
              if (D || 0 !== s.length || !l || l === r) {
                if (a) return !0;
                for (d += s, s = '', g = ''; ++p < f && (l = t.charAt(p)) && l !== r; )
                  if (l === u || l === n || l === i) {
                    for (; l === u || l === n; ) (s += l), (l = t.charAt(++p));
                    if (D || !g || s || l !== i) {
                      for (; l === i; ) (s += l), (l = t.charAt(++p));
                      for (; l === u || l === n; ) (s += l), (l = t.charAt(++p));
                      p--;
                    } else g += l;
                  } else (g += s + l), (s = '');
                return (
                  (h.column += d.length),
                  (h.offset += d.length),
                  e((d += g + s))({
                    type: 'heading',
                    depth: c,
                    children: this.tokenizeInline(g, h),
                  })
                );
              }
            }
          };
          var r = '\n',
            n = '\t',
            u = ' ',
            i = '#',
            o = 6;
        }),
        ne = c((e, t) => {
          t.exports = function (e, t, s) {
            for (
              var c, D, f, p, h = -1, d = t.length + 1, g = '';
              ++h < d && ((c = t.charAt(h)) === r || c === u);
            )
              g += c;
            if (c === i || c === o || c === a)
              for (D = c, g += c, f = 1, p = ''; ++h < d; )
                if ((c = t.charAt(h)) === D) f++, (g += p + D), (p = '');
                else {
                  if (c !== u)
                    return f >= l && (!c || c === n)
                      ? ((g += p), !!s || e(g)({ type: 'thematicBreak' }))
                      : void 0;
                  p += c;
                }
          };
          var r = '\t',
            n = '\n',
            u = ' ',
            i = '*',
            o = '-',
            a = '_',
            l = 3;
        }),
        ue = c((e, t) => {
          t.exports = function (e) {
            for (var t, o = 0, a = 0, l = e.charAt(o), s = {}, c = 0; l === r || l === n; ) {
              for (a += t = l === r ? i : u, t > 1 && (a = Math.floor(a / t) * t); c < a; )
                s[++c] = o;
              l = e.charAt(++o);
            }
            return { indent: a, stops: s };
          };
          var r = '\t',
            n = ' ',
            u = 1,
            i = 4;
        }),
        ie = c((e, t) => {
          var r = X(),
            n = Z(),
            u = ue();
          t.exports = function (e, t) {
            var l,
              s,
              c,
              D = e.split(i),
              f = D.length + 1,
              p = 1 / 0,
              h = [];
            for (D.unshift(n(o, t) + a); f--; )
              if (((s = u(D[f])), (h[f] = s.stops), 0 !== r(D[f]).length)) {
                if (!s.indent) {
                  p = 1 / 0;
                  break;
                }
                s.indent > 0 && s.indent < p && (p = s.indent);
              }
            if (p !== 1 / 0)
              for (f = D.length; f--; ) {
                for (c = h[f], l = p; l && !(l in c); ) l--;
                D[f] = D[f].slice(c[l] + 1);
              }
            return D.shift(), D.join(i);
          };
          var i = '\n',
            o = ' ',
            a = '!';
        }),
        oe = c((e, t) => {
          var r = X(),
            n = Z(),
            u = q(),
            i = ue(),
            o = ie(),
            a = ee();
          t.exports = function (e, t, n) {
            for (
              var i,
                o,
                F,
                C,
                E,
                b,
                v,
                y,
                x,
                w,
                k,
                B,
                q,
                S,
                T,
                L,
                O,
                R,
                N,
                I,
                P,
                j,
                z,
                $ = this,
                U = $.options.commonmark,
                M = $.options.pedantic,
                V = $.blockTokenizers,
                _ = $.interruptList,
                G = 0,
                W = t.length,
                H = null,
                J = !1;
              G < W && ((C = t.charAt(G)) === d || C === p);
            )
              G++;
            if ((C = t.charAt(G)) === l || C === c || C === D) (E = C), (F = !1);
            else {
              for (F = !0, o = ''; G < W && ((C = t.charAt(G)), u(C)); ) (o += C), G++;
              if (((C = t.charAt(G)), !o || !(C === f || (U && C === g)) || (n && '1' !== o)))
                return;
              (H = parseInt(o, 10)), (E = C);
            }
            if ((C = t.charAt(++G)) === p || C === d || !(M || (C !== h && '' !== C))) {
              if (n) return !0;
              for (G = 0, S = [], T = [], L = []; G < W; ) {
                for (
                  v = G, y = !1, z = !1, -1 === (b = t.indexOf(h, G)) && (b = W), i = 0;
                  G < W;
                ) {
                  if ((C = t.charAt(G)) === d) i += m - (i % m);
                  else {
                    if (C !== p) break;
                    i++;
                  }
                  G++;
                }
                if ((O && i >= O.indent && (z = !0), (C = t.charAt(G)), (x = null), !z)) {
                  if (C === l || C === c || C === D) (x = C), G++, i++;
                  else {
                    for (o = ''; G < W && ((C = t.charAt(G)), u(C)); ) (o += C), G++;
                    (C = t.charAt(G)),
                      G++,
                      o && (C === f || (U && C === g)) && ((x = C), (i += o.length + 1));
                  }
                  if (x)
                    if ((C = t.charAt(G)) === d) (i += m - (i % m)), G++;
                    else if (C === p) {
                      for (j = G + m; G < j && t.charAt(G) === p; ) G++, i++;
                      G === j && t.charAt(G) === p && ((G -= m - 1), (i -= m - 1));
                    } else C !== h && '' !== C && (x = null);
                }
                if (x) {
                  if (!M && E !== x) break;
                  y = !0;
                } else
                  U || z || t.charAt(v) !== p ? U && O && (z = i >= O.indent || i > m) : (z = !0),
                    (y = !1),
                    (G = v);
                if (
                  ((k = t.slice(v, b)),
                  (w = v === G ? k : t.slice(G, b)),
                  (x === l || x === s || x === D) && V.thematicBreak.call($, e, k, !0))
                )
                  break;
                if (((B = q), (q = !y && !r(w).length), z && O))
                  (O.value = O.value.concat(L, k)), (T = T.concat(L, k)), (L = []);
                else if (y)
                  0 !== L.length && ((J = !0), O.value.push(''), (O.trail = L.concat())),
                    (O = { value: [k], indent: i, trail: [] }),
                    S.push(O),
                    (T = T.concat(L, k)),
                    (L = []);
                else if (q) {
                  if (B && !U) break;
                  L.push(k);
                } else {
                  if (B || a(_, V, $, [e, k, !0])) break;
                  (O.value = O.value.concat(L, k)), (T = T.concat(L, k)), (L = []);
                }
                G = b + 1;
              }
              for (
                I = e(T.join(h)).reset({
                  type: 'list',
                  ordered: F,
                  start: H,
                  spread: J,
                  children: [],
                }),
                  R = $.enterList(),
                  N = $.enterBlock(),
                  G = -1,
                  W = S.length;
                ++G < W;
              )
                (O = S[G].value.join(h)),
                  (P = e.now()),
                  e(O)(A($, O, P), I),
                  (O = S[G].trail.join(h)),
                  G !== W - 1 && (O += h),
                  e(O);
              return R(), N(), I;
            }
          };
          var l = '*',
            s = '_',
            c = '+',
            D = '-',
            f = '.',
            p = ' ',
            h = '\n',
            d = '\t',
            g = ')',
            F = 'x',
            m = 4,
            C = /\n\n(?!\s*$)/,
            E = /^\[([ X\tx])][ \t]/,
            b = /^([ \t]*)([*+-]|\d+[.)])( {1,4}(?! )| |\t|$|(?=\n))([^\n]*)/,
            v = /^([ \t]*)([*+-]|\d+[.)])([ \t]+)/,
            y = /^( {1,4}|\t)?/gm;
          function A(e, t, r) {
            var n,
              u,
              i = e.offset,
              o = null;
            return (
              (t = (e.options.pedantic ? x : w).apply(null, arguments)),
              e.options.gfm &&
                (n = t.match(E)) &&
                ((u = n[0].length),
                (o = n[1].toLowerCase() === F),
                (i[r.line] += u),
                (t = t.slice(u))),
              { type: 'listItem', spread: C.test(t), checked: o, children: e.tokenizeBlock(t, r) }
            );
          }
          function x(e, t, r) {
            var n = e.offset,
              u = r.line;
            return (t = t.replace(v, i)), (u = r.line), t.replace(y, i);
            function i(e) {
              return (n[u] = (n[u] || 0) + e.length), u++, '';
            }
          }
          function w(e, t, r) {
            var u,
              a,
              l,
              s,
              c,
              D,
              f,
              d = e.offset,
              g = r.line;
            for (
              s = (t = t.replace(b, function (e, t, r, i, o) {
                return (
                  (a = t + r + i),
                  (l = o),
                  Number(r) < 10 && a.length % 2 == 1 && (r = p + r),
                  (u = t + n(p, r.length) + i) + l
                );
              })).split(h),
                (c = o(t, i(u).indent).split(h))[0] = l,
                d[g] = (d[g] || 0) + a.length,
                g++,
                D = 0,
                f = s.length;
              ++D < f;
            )
              (d[g] = (d[g] || 0) + s[D].length - c[D].length), g++;
            return c.join(h);
          }
        }),
        ae = c((e, t) => {
          t.exports = function (e, t, c) {
            for (var D, f, p, h, d, g = e.now(), F = t.length, m = -1, C = ''; ++m < F; ) {
              if ((p = t.charAt(m)) !== u || m >= a) {
                m--;
                break;
              }
              C += p;
            }
            for (D = '', f = ''; ++m < F; ) {
              if ((p = t.charAt(m)) === r) {
                m--;
                break;
              }
              p === u || p === n ? (f += p) : ((D += f + p), (f = ''));
            }
            if (
              ((g.column += C.length),
              (g.offset += C.length),
              (C += D + f),
              (p = t.charAt(++m)),
              (h = t.charAt(++m)),
              p === r && (h === i || h === o))
            ) {
              for (C += p, f = h, d = h === i ? l : s; ++m < F; ) {
                if ((p = t.charAt(m)) !== h) {
                  if (p !== r) return;
                  m--;
                  break;
                }
                f += p;
              }
              return (
                !!c || e(C + f)({ type: 'heading', depth: d, children: this.tokenizeInline(D, g) })
              );
            }
          };
          var r = '\n',
            n = '\t',
            u = ' ',
            i = '=',
            o = '-',
            a = 3,
            l = 1,
            s = 2;
        }),
        le = c((e) => {
          var t =
              '<[A-Za-z][A-Za-z0-9\\-]*(?:\\s+[a-zA-Z_:][a-zA-Z0-9:._-]*(?:\\s*=\\s*(?:[^"\'=<>`\\u0000-\\u0020]+|\'[^\']*\'|"[^"]*"))?)*\\s*\\/?>',
            r = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>';
          (e.openCloseTag = new RegExp('^(?:' + t + '|' + r + ')')),
            (e.tag = new RegExp(
              '^(?:' +
                t +
                '|' +
                r +
                '|\x3c!----\x3e|\x3c!--(?:-?[^>-])(?:-?[^-])*--\x3e|<[?].*?[?]>|<![A-Za-z]+\\s+[^>]*>|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>)'
            ));
        }),
        se = c((e, t) => {
          var r = le().openCloseTag;
          t.exports = function (e, t, r) {
            for (
              var C,
                E,
                b,
                v,
                y,
                A,
                x,
                w = this.options.blocks.join('|'),
                k = new RegExp('^</?(' + w + ')(?=(\\s|/?>|$))', 'i'),
                B = t.length,
                q = 0,
                S = [
                  [a, l, !0],
                  [s, c, !0],
                  [D, f, !0],
                  [p, h, !0],
                  [d, g, !0],
                  [k, F, !0],
                  [m, F, !1],
                ];
              q < B && ((v = t.charAt(q)) === n || v === u);
            )
              q++;
            if (t.charAt(q) === o) {
              for (
                C = -1 === (C = t.indexOf(i, q + 1)) ? B : C,
                  E = t.slice(q, C),
                  b = -1,
                  y = S.length;
                ++b < y;
              )
                if (S[b][0].test(E)) {
                  A = S[b];
                  break;
                }
              if (A) {
                if (r) return A[2];
                if (((q = C), !A[1].test(E)))
                  for (; q < B; ) {
                    if (
                      ((C = -1 === (C = t.indexOf(i, q + 1)) ? B : C),
                      (E = t.slice(q + 1, C)),
                      A[1].test(E))
                    ) {
                      E && (q = C);
                      break;
                    }
                    q = C;
                  }
                return e((x = t.slice(0, q)))({ type: 'html', value: x });
              }
            }
          };
          var n = '\t',
            u = ' ',
            i = '\n',
            o = '<',
            a = /^<(script|pre|style)(?=(\s|>|$))/i,
            l = /<\/(script|pre|style)>/i,
            s = /^<!--/,
            c = /-->/,
            D = /^<\?/,
            f = /\?>/,
            p = /^<![A-Za-z]/,
            h = />/,
            d = /^<!\[CDATA\[/,
            g = /]]>/,
            F = /^$/,
            m = new RegExp(r.source + '\\s*$');
        }),
        ce = c((e, t) => {
          t.exports = function (e) {
            return n.test('number' == typeof e ? r(e) : e.charAt(0));
          };
          var r = String.fromCharCode,
            n = /\s/;
        }),
        De = c((e, t) => {
          var r = d();
          t.exports = function (e) {
            return r(e).toLowerCase();
          };
        }),
        fe = c((e, t) => {
          var r = ce(),
            n = De();
          t.exports = function (e, t, r) {
            for (
              var g,
                C,
                E,
                b,
                v,
                y,
                A,
                x,
                w = this,
                k = w.options.commonmark,
                B = 0,
                q = t.length,
                S = '';
              B < q && ((b = t.charAt(B)) === s || b === l);
            )
              (S += b), B++;
            if ((b = t.charAt(B)) === c) {
              for (B++, S += b, E = ''; B < q && (b = t.charAt(B)) !== D; )
                b === o && ((E += b), B++, (b = t.charAt(B))), (E += b), B++;
              if (E && t.charAt(B) === D && t.charAt(B + 1) === h) {
                for (
                  y = E, B = (S += E + D + h).length, E = '';
                  B < q && ((b = t.charAt(B)) === l || b === s || b === a);
                )
                  (S += b), B++;
                if (((E = ''), (g = S), (b = t.charAt(B)) === d)) {
                  for (B++; B < q && F((b = t.charAt(B))); ) (E += b), B++;
                  if ((b = t.charAt(B)) === F.delimiter) (S += d + E + b), B++;
                  else {
                    if (k) return;
                    (B -= E.length + 1), (E = '');
                  }
                }
                if (!E) {
                  for (; B < q && m((b = t.charAt(B))); ) (E += b), B++;
                  S += E;
                }
                if (E) {
                  for (A = E, E = ''; B < q && ((b = t.charAt(B)) === l || b === s || b === a); )
                    (E += b), B++;
                  if (
                    ((v = null),
                    (b = t.charAt(B)) === u ? (v = u) : b === i ? (v = i) : b === f && (v = p),
                    v)
                  ) {
                    if (!E) return;
                    for (B = (S += E + b).length, E = ''; B < q && (b = t.charAt(B)) !== v; ) {
                      if (b === a) {
                        if ((B++, (b = t.charAt(B)) === a || b === v)) return;
                        E += a;
                      }
                      (E += b), B++;
                    }
                    if ((b = t.charAt(B)) !== v) return;
                    (C = S), (S += E + b), B++, (x = E), (E = '');
                  } else (E = ''), (B = S.length);
                  for (; B < q && ((b = t.charAt(B)) === l || b === s); ) (S += b), B++;
                  if (!(b = t.charAt(B)) || b === a)
                    return (
                      !!r ||
                      ((g = e(g).test().end),
                      (A = w.decode.raw(w.unescape(A), g, { nonTerminated: !1 })),
                      x && ((C = e(C).test().end), (x = w.decode.raw(w.unescape(x), C))),
                      e(S)({
                        type: 'definition',
                        identifier: n(y),
                        label: y,
                        title: x || null,
                        url: A,
                      }))
                    );
                }
              }
            }
          };
          var u = '"',
            i = "'",
            o = '\\',
            a = '\n',
            l = '\t',
            s = ' ',
            c = '[',
            D = ']',
            f = '(',
            p = ')',
            h = ':',
            d = '<',
            g = '>';
          function F(e) {
            return e !== g && e !== c && e !== D;
          }
          function m(e) {
            return e !== c && e !== D && !r(e);
          }
          F.delimiter = g;
        }),
        pe = c((e, t) => {
          var r = ce();
          t.exports = function (e, t, d) {
            var g, F, m, C, E, b, v, y, A, x, w, k, B, q, S, T, L, O, R, N, I, P;
            if (this.options.gfm) {
              for (g = 0, T = 0, b = t.length + 1, v = []; g < b; ) {
                if (
                  ((N = t.indexOf(u, g)),
                  (I = t.indexOf(s, g + 1)),
                  -1 === N && (N = t.length),
                  -1 === I || I > N)
                ) {
                  if (T < D) return;
                  break;
                }
                v.push(t.slice(g, N)), T++, (g = N + 1);
              }
              for (
                C = v.join(u), g = 0, b = (F = v.splice(1, 1)[0] || []).length, T--, m = !1, w = [];
                g < b;
              ) {
                if ((A = F.charAt(g)) === s) {
                  if (((x = null), !1 === m)) {
                    if (!1 === P) return;
                  } else w.push(m), (m = !1);
                  P = !1;
                } else if (A === o) (x = !0), (m = m || null);
                else if (A === a) m = m === f ? p : x && null === m ? h : f;
                else if (!r(A)) return;
                g++;
              }
              if ((!1 !== m && w.push(m), !(w.length < c))) {
                if (d) return !0;
                for (
                  S = -1, O = [], R = e(C).reset({ type: 'table', align: w, children: O });
                  ++S < T;
                ) {
                  for (
                    L = v[S],
                      E = { type: 'tableRow', children: [] },
                      S && e(u),
                      e(L).reset(E, R),
                      b = L.length + 1,
                      g = 0,
                      y = '',
                      k = '',
                      B = !0;
                    g < b;
                  )
                    (A = L.charAt(g)) !== n && A !== i
                      ? ('' === A || A === s
                          ? B
                            ? e(A)
                            : ((k || A) &&
                                !B &&
                                ((C = k),
                                y.length > 1 &&
                                  (A
                                    ? ((C += y.slice(0, -1)), (y = y.charAt(y.length - 1)))
                                    : ((C += y), (y = ''))),
                                (q = e.now()),
                                e(C)(
                                  { type: 'tableCell', children: this.tokenizeInline(k, q) },
                                  E
                                )),
                              e(y + A),
                              (y = ''),
                              (k = ''))
                          : (y && ((k += y), (y = '')),
                            (k += A),
                            A === l && g !== b - 2 && ((k += L.charAt(g + 1)), g++)),
                        (B = !1),
                        g++)
                      : (k ? (y += A) : e(A), g++);
                  S || e(u + F);
                }
                return R;
              }
            }
          };
          var n = '\t',
            u = '\n',
            i = ' ',
            o = '-',
            a = ':',
            l = '\\',
            s = '|',
            c = 1,
            D = 2,
            f = 'left',
            p = 'center',
            h = 'right';
        }),
        he = c((e, t) => {
          var r = X(),
            n = Y(),
            u = ee();
          t.exports = function (e, t, s) {
            for (
              var c,
                D,
                f,
                p,
                h,
                d = this,
                g = d.options.commonmark,
                F = d.blockTokenizers,
                m = d.interruptParagraph,
                C = t.indexOf(o),
                E = t.length;
              C < E;
            ) {
              if (-1 === C) {
                C = E;
                break;
              }
              if (t.charAt(C + 1) === o) break;
              if (g) {
                for (p = 0, c = C + 1; c < E; ) {
                  if ((f = t.charAt(c)) === i) {
                    p = l;
                    break;
                  }
                  if (f !== a) break;
                  p++, c++;
                }
                if (p >= l && f !== o) {
                  C = t.indexOf(o, C + 1);
                  continue;
                }
              }
              if (((D = t.slice(C + 1)), u(m, F, d, [e, D, !0]))) break;
              if (((c = C), -1 !== (C = t.indexOf(o, C + 1)) && '' === r(t.slice(c, C)))) {
                C = c;
                break;
              }
            }
            return (
              (D = t.slice(0, C)),
              !!s ||
                ((h = e.now()),
                e((D = n(D)))({ type: 'paragraph', children: d.tokenizeInline(D, h) }))
            );
          };
          var i = '\t',
            o = '\n',
            a = ' ',
            l = 4;
        }),
        de = c((e, t) => {
          t.exports = function (e, t) {
            return e.indexOf('\\', t);
          };
        }),
        ge = c((e, t) => {
          var r = de();
          (t.exports = i), (i.locator = r);
          var n = '\n',
            u = '\\';
          function i(e, t, r) {
            var i, o;
            if (t.charAt(0) === u && ((i = t.charAt(1)), -1 !== this.escape.indexOf(i)))
              return (
                !!r || ((o = i === n ? { type: 'break' } : { type: 'text', value: i }), e(u + i)(o))
              );
          }
        }),
        Fe = c((e, t) => {
          t.exports = function (e, t) {
            return e.indexOf('<', t);
          };
        }),
        me = c((e, t) => {
          var r = ce(),
            n = N(),
            u = Fe();
          (t.exports = D), (D.locator = u), (D.notInLink = !0);
          var i = '<',
            o = '>',
            a = '@',
            l = '/',
            s = 'mailto:',
            c = s.length;
          function D(e, t, u) {
            var D,
              f,
              p,
              h,
              d,
              g = this,
              F = '',
              m = t.length,
              C = 0,
              E = '',
              b = !1,
              v = '';
            if (t.charAt(0) === i) {
              for (
                C++, F = i;
                C < m &&
                ((D = t.charAt(C)),
                !(r(D) || D === o || D === a || (':' === D && t.charAt(C + 1) === l)));
              )
                (E += D), C++;
              if (E) {
                if (((v += E), (E = ''), (v += D = t.charAt(C)), C++, D === a)) b = !0;
                else {
                  if (':' !== D || t.charAt(C + 1) !== l) return;
                  (v += l), C++;
                }
                for (; C < m && ((D = t.charAt(C)), !r(D) && D !== o); ) (E += D), C++;
                if (((D = t.charAt(C)), E && D === o))
                  return (
                    !!u ||
                    ((p = v += E),
                    (F += v + D),
                    (f = e.now()).column++,
                    f.offset++,
                    b &&
                      (v.slice(0, c).toLowerCase() === s
                        ? ((p = p.slice(c)), (f.column += c), (f.offset += c))
                        : (v = s + v)),
                    (h = g.inlineTokenizers),
                    (g.inlineTokenizers = { text: h.text }),
                    (d = g.enterLink()),
                    (p = g.tokenizeInline(p, f)),
                    (g.inlineTokenizers = h),
                    d(),
                    e(F)({
                      type: 'link',
                      title: null,
                      url: n(v, { nonTerminated: !1 }),
                      children: p,
                    }))
                  );
              }
            }
          }
        }),
        Ce = c((e, t) => {
          t.exports = function (e, t) {
            var r,
              n = String(e),
              u = 0;
            if ('string' != typeof t) throw new Error('Expected character');
            for (r = n.indexOf(t); -1 !== r; ) u++, (r = n.indexOf(t, r + t.length));
            return u;
          };
        }),
        Ee = c((e, t) => {
          t.exports = function (e, t) {
            var n,
              u,
              i,
              o = -1;
            if (!this.options.gfm) return o;
            for (u = r.length, n = -1; ++n < u; )
              -1 !== (i = e.indexOf(r[n], t)) && (-1 === o || i < o) && (o = i);
            return o;
          };
          var r = ['www.', 'http://', 'https://'];
        }),
        be = c((e, t) => {
          var r = Ce(),
            n = N(),
            u = q(),
            i = T(),
            o = ce(),
            a = Ee();
          (t.exports = y), (y.locator = a), (y.notInLink = !0);
          var l = 33,
            s = 38,
            c = 41,
            D = 42,
            f = 44,
            p = 45,
            h = 46,
            d = 58,
            g = 59,
            F = 63,
            m = 60,
            C = 95,
            E = 126,
            b = '(',
            v = ')';
          function y(e, t, a) {
            var y,
              A,
              x,
              w,
              k,
              B,
              q,
              S,
              T,
              L,
              O,
              R,
              N,
              I,
              P = this,
              j = P.options.gfm,
              z = P.inlineTokenizers,
              $ = t.length,
              U = -1,
              M = !1;
            if (j) {
              if ('www.' === t.slice(0, 4)) (M = !0), (w = 4);
              else if ('http://' === t.slice(0, 7).toLowerCase()) w = 7;
              else {
                if ('https://' !== t.slice(0, 8).toLowerCase()) return;
                w = 8;
              }
              for (U = w - 1, x = w, y = []; w < $; )
                if ((q = t.charCodeAt(w)) !== h) {
                  if (!u(q) && !i(q) && q !== p && q !== C) break;
                  w++;
                } else {
                  if (U === w - 1) break;
                  y.push(w), (U = w), w++;
                }
              if (
                (q === h && (y.pop(), w--),
                void 0 !== y[0] &&
                  ((A = y.length < 2 ? x : y[y.length - 2] + 1), -1 === t.slice(A, w).indexOf('_')))
              ) {
                if (a) return !0;
                for (S = w, k = w; w < $ && ((q = t.charCodeAt(w)), !o(q) && q !== m); )
                  w++,
                    q === l ||
                      q === D ||
                      q === f ||
                      q === h ||
                      q === d ||
                      q === F ||
                      q === C ||
                      q === E ||
                      (S = w);
                if (((w = S), t.charCodeAt(w - 1) === c))
                  for (B = t.slice(k, w), T = r(B, b), L = r(B, v); L > T; )
                    (w = k + B.lastIndexOf(v)), (B = t.slice(k, w)), L--;
                if (t.charCodeAt(w - 1) === g && (w--, i(t.charCodeAt(w - 1)))) {
                  for (S = w - 2; i(t.charCodeAt(S)); ) S--;
                  t.charCodeAt(S) === s && (w = S);
                }
                return (
                  (O = t.slice(0, w)),
                  (N = n(O, { nonTerminated: !1 })),
                  M && (N = 'http://' + N),
                  (I = P.enterLink()),
                  (P.inlineTokenizers = { text: z.text }),
                  (R = P.tokenizeInline(O, e.now())),
                  (P.inlineTokenizers = z),
                  I(),
                  e(O)({ type: 'link', title: null, url: N, children: R })
                );
              }
            }
          }
        }),
        ve = c((e, t) => {
          var r = q(),
            n = T();
          function u(e) {
            return r(e) || n(e) || 43 === e || 45 === e || 46 === e || 95 === e;
          }
          t.exports = function e(t, r) {
            var n, i;
            if (!this.options.gfm || -1 === (n = t.indexOf('@', r))) return -1;
            if ((i = n) === r || !u(t.charCodeAt(i - 1))) return e.call(this, t, n + 1);
            for (; i > r && u(t.charCodeAt(i - 1)); ) i--;
            return i;
          };
        }),
        ye = c((e, t) => {
          var r = N(),
            n = q(),
            u = T(),
            i = ve();
          (t.exports = D), (D.locator = i), (D.notInLink = !0);
          var o = 43,
            a = 45,
            l = 46,
            s = 64,
            c = 95;
          function D(e, t, i) {
            var D,
              f,
              p,
              h,
              d = this,
              g = d.options.gfm,
              F = d.inlineTokenizers,
              m = 0,
              C = t.length,
              E = -1;
            if (g) {
              for (D = t.charCodeAt(m); n(D) || u(D) || D === o || D === a || D === l || D === c; )
                D = t.charCodeAt(++m);
              if (0 !== m && D === s) {
                for (
                  m++;
                  m < C && ((D = t.charCodeAt(m)), n(D) || u(D) || D === a || D === l || D === c);
                )
                  m++, -1 === E && D === l && (E = m);
                if (-1 !== E && E !== m && D !== a && D !== c)
                  return (
                    D === l && m--,
                    (f = t.slice(0, m)),
                    !!i ||
                      ((h = d.enterLink()),
                      (d.inlineTokenizers = { text: F.text }),
                      (p = d.tokenizeInline(f, e.now())),
                      (d.inlineTokenizers = F),
                      h(),
                      e(f)({
                        type: 'link',
                        title: null,
                        url: 'mailto:' + r(f, { nonTerminated: !1 }),
                        children: p,
                      }))
                  );
              }
            }
          }
        }),
        Ae = c((e, t) => {
          var r = T(),
            n = Fe(),
            u = le().tag;
          (t.exports = D), (D.locator = n);
          var i = '<',
            o = '?',
            a = '!',
            l = '/',
            s = /^<a /i,
            c = /^<\/a>/i;
          function D(e, t, n) {
            var D,
              f,
              p = this,
              h = t.length;
            if (
              !(t.charAt(0) !== i || h < 3) &&
              ((D = t.charAt(1)), (r(D) || D === o || D === a || D === l) && (f = t.match(u)))
            )
              return (
                !!n ||
                ((f = f[0]),
                !p.inLink && s.test(f) ? (p.inLink = !0) : p.inLink && c.test(f) && (p.inLink = !1),
                e(f)({ type: 'html', value: f }))
              );
          }
        }),
        xe = c((e, t) => {
          t.exports = function (e, t) {
            var r = e.indexOf('[', t),
              n = e.indexOf('![', t);
            return -1 === n || r < n ? r : n;
          };
        }),
        we = c((e, t) => {
          var r = ce(),
            n = xe();
          (t.exports = g), (g.locator = n);
          var u = '\n',
            i = '!',
            o = '"',
            a = "'",
            l = '(',
            s = ')',
            c = '<',
            D = '>',
            f = '[',
            p = '\\',
            h = ']',
            d = '`';
          function g(e, t, n) {
            var g,
              F,
              m,
              C,
              E,
              b,
              v,
              y,
              A,
              x,
              w,
              k,
              B,
              q,
              S,
              T,
              L,
              O,
              R = this,
              N = '',
              I = 0,
              P = t.charAt(0),
              j = R.options.pedantic,
              z = R.options.commonmark,
              $ = R.options.gfm;
            if (
              (P === i && ((y = !0), (N = P), (P = t.charAt(++I))), P === f && (y || !R.inLink))
            ) {
              for (
                N += P, q = '', I++, w = t.length, B = 0, (T = e.now()).column += I, T.offset += I;
                I < w;
              ) {
                if (((b = P = t.charAt(I)), P === d)) {
                  for (F = 1; t.charAt(I + 1) === d; ) (b += P), I++, F++;
                  m ? F >= m && (m = 0) : (m = F);
                } else if (P === p) I++, (b += t.charAt(I));
                else if ((m && !$) || P !== f) {
                  if ((!m || $) && P === h) {
                    if (!B) {
                      if (t.charAt(I + 1) !== l) return;
                      (b += l), (g = !0), I++;
                      break;
                    }
                    B--;
                  }
                } else B++;
                (q += b), (b = ''), I++;
              }
              if (g) {
                for (A = q, N += q + b, I++; I < w && ((P = t.charAt(I)), r(P)); ) (N += P), I++;
                if (((q = ''), (C = N), (P = t.charAt(I)) === c)) {
                  for (I++, C += c; I < w && (P = t.charAt(I)) !== D; ) {
                    if (z && P === u) return;
                    (q += P), I++;
                  }
                  if (t.charAt(I) !== D) return;
                  (N += c + q + D), (S = q), I++;
                } else {
                  for (
                    P = null, b = '';
                    I < w && ((P = t.charAt(I)), !b || !(P === o || P === a || (z && P === l)));
                  ) {
                    if (r(P)) {
                      if (!j) break;
                      b += P;
                    } else {
                      if (P === l) B++;
                      else if (P === s) {
                        if (0 === B) break;
                        B--;
                      }
                      (q += b), (b = ''), P === p && ((q += p), (P = t.charAt(++I))), (q += P);
                    }
                    I++;
                  }
                  (S = q), (I = (N += q).length);
                }
                for (q = ''; I < w && ((P = t.charAt(I)), r(P)); ) (q += P), I++;
                if (((P = t.charAt(I)), (N += q), q && (P === o || P === a || (z && P === l))))
                  if ((I++, (q = ''), (x = P === l ? s : P), (E = N += P), z)) {
                    for (; I < w && (P = t.charAt(I)) !== x; )
                      P === p && ((q += p), (P = t.charAt(++I))), I++, (q += P);
                    if ((P = t.charAt(I)) !== x) return;
                    for (k = q, N += q + P, I++; I < w && ((P = t.charAt(I)), r(P)); )
                      (N += P), I++;
                  } else
                    for (b = ''; I < w; ) {
                      if ((P = t.charAt(I)) === x) v && ((q += x + b), (b = '')), (v = !0);
                      else if (v) {
                        if (P === s) {
                          (N += q + x + b), (k = q);
                          break;
                        }
                        r(P) ? (b += P) : ((q += x + b + P), (b = ''), (v = !1));
                      } else q += P;
                      I++;
                    }
                if (t.charAt(I) === s)
                  return (
                    !!n ||
                    ((N += s),
                    (S = R.decode.raw(R.unescape(S), e(C).test().end, { nonTerminated: !1 })),
                    k && ((E = e(E).test().end), (k = R.decode.raw(R.unescape(k), E))),
                    (O = { type: y ? 'image' : 'link', title: k || null, url: S }),
                    y
                      ? (O.alt = R.decode.raw(R.unescape(A), T) || null)
                      : ((L = R.enterLink()), (O.children = R.tokenizeInline(A, T)), L()),
                    e(N)(O))
                  );
              }
            }
          }
        }),
        ke = c((e, t) => {
          var r = ce(),
            n = xe(),
            u = De();
          (t.exports = h), (h.locator = n);
          var i = 'link',
            o = 'image',
            a = 'shortcut',
            l = 'collapsed',
            s = 'full',
            c = '!',
            D = '[',
            f = '\\',
            p = ']';
          function h(e, t, n) {
            var h,
              d,
              g,
              F,
              m,
              C,
              E,
              b,
              v = this,
              y = v.options.commonmark,
              A = t.charAt(0),
              x = 0,
              w = t.length,
              k = '',
              B = '',
              q = i,
              S = a;
            if ((A === c && ((q = o), (B = A), (A = t.charAt(++x))), A === D)) {
              for (x++, B += A, C = '', b = 0; x < w; ) {
                if ((A = t.charAt(x)) === D) (E = !0), b++;
                else if (A === p) {
                  if (!b) break;
                  b--;
                }
                A === f && ((C += f), (A = t.charAt(++x))), (C += A), x++;
              }
              if (((k = C), (h = C), (A = t.charAt(x)) === p)) {
                if ((x++, (k += A), (C = ''), !y))
                  for (; x < w && ((A = t.charAt(x)), r(A)); ) (C += A), x++;
                if ((A = t.charAt(x)) === D) {
                  for (d = '', C += A, x++; x < w && (A = t.charAt(x)) !== D && A !== p; )
                    A === f && ((d += f), (A = t.charAt(++x))), (d += A), x++;
                  (A = t.charAt(x)) === p ? ((S = d ? s : l), (C += d + A), x++) : (d = ''),
                    (k += C),
                    (C = '');
                } else {
                  if (!h) return;
                  d = h;
                }
                if (S === s || !E)
                  return (
                    (k = B + k),
                    q === i && v.inLink
                      ? null
                      : !!n ||
                        (((g = e.now()).column += B.length),
                        (g.offset += B.length),
                        (F = {
                          type: q + 'Reference',
                          identifier: u((d = S === s ? d : h)),
                          label: d,
                          referenceType: S,
                        }),
                        q === i
                          ? ((m = v.enterLink()), (F.children = v.tokenizeInline(h, g)), m())
                          : (F.alt = v.decode.raw(v.unescape(h), g) || null),
                        e(k)(F))
                  );
              }
            }
          }
        }),
        Be = c((e, t) => {
          t.exports = function (e, t) {
            var r = e.indexOf('**', t),
              n = e.indexOf('__', t);
            return -1 === n ? r : -1 === r || n < r ? n : r;
          };
        }),
        qe = c((e, t) => {
          var r = X(),
            n = ce(),
            u = Be();
          (t.exports = l), (l.locator = u);
          var i = '\\',
            o = '*',
            a = '_';
          function l(e, t, u) {
            var l,
              s,
              c,
              D,
              f,
              p,
              h,
              d = 0,
              g = t.charAt(d);
            if (
              !(
                (g !== o && g !== a) ||
                t.charAt(++d) !== g ||
                ((s = this.options.pedantic),
                (c = g),
                (f = c + c),
                (p = t.length),
                d++,
                (D = ''),
                (g = ''),
                s && n(t.charAt(d)))
              )
            )
              for (; d < p; ) {
                if (
                  ((h = g),
                  !(
                    (g = t.charAt(d)) !== c ||
                    t.charAt(d + 1) !== c ||
                    (s && n(h)) ||
                    ((g = t.charAt(d + 2)), g === c)
                  ))
                )
                  return r(D)
                    ? !!u ||
                        (((l = e.now()).column += 2),
                        (l.offset += 2),
                        e(f + D + f)({ type: 'strong', children: this.tokenizeInline(D, l) }))
                    : void 0;
                !s && g === i && ((D += g), (g = t.charAt(++d))), (D += g), d++;
              }
          }
        }),
        Se = c((e, t) => {
          t.exports = function (e) {
            return n.test('number' == typeof e ? r(e) : e.charAt(0));
          };
          var r = String.fromCharCode,
            n = /\w/;
        }),
        Te = c((e, t) => {
          t.exports = function (e, t) {
            var r = e.indexOf('*', t),
              n = e.indexOf('_', t);
            return -1 === n ? r : -1 === r || n < r ? n : r;
          };
        }),
        Le = c((e, t) => {
          var r = X(),
            n = Se(),
            u = ce(),
            i = Te();
          (t.exports = s), (s.locator = i);
          var o = '*',
            a = '_',
            l = '\\';
          function s(e, t, i) {
            var s,
              c,
              D,
              f,
              p,
              h,
              d,
              g = 0,
              F = t.charAt(g);
            if (
              !(
                (F !== o && F !== a) ||
                ((c = this.options.pedantic),
                (p = F),
                (D = F),
                (h = t.length),
                g++,
                (f = ''),
                (F = ''),
                c && u(t.charAt(g)))
              )
            )
              for (; g < h; ) {
                if (((d = F), !((F = t.charAt(g)) !== D || (c && u(d))))) {
                  if ((F = t.charAt(++g)) !== D) {
                    if (!r(f) || d === D) return;
                    if (!c && D === a && n(F)) {
                      f += D;
                      continue;
                    }
                    return (
                      !!i ||
                      ((s = e.now()).column++,
                      s.offset++,
                      e(p + f + D)({ type: 'emphasis', children: this.tokenizeInline(f, s) }))
                    );
                  }
                  f += D;
                }
                !c && F === l && ((f += F), (F = t.charAt(++g))), (f += F), g++;
              }
          }
        }),
        Oe = c((e, t) => {
          t.exports = function (e, t) {
            return e.indexOf('~~', t);
          };
        }),
        Re = c((e, t) => {
          var r = ce(),
            n = Oe();
          (t.exports = o), (o.locator = n);
          var u = '~',
            i = '~~';
          function o(e, t, n) {
            var o,
              a,
              l,
              s = '',
              c = '',
              D = '',
              f = '';
            if (this.options.gfm && t.charAt(0) === u && t.charAt(1) === u && !r(t.charAt(2)))
              for (o = 1, a = t.length, (l = e.now()).column += 2, l.offset += 2; ++o < a; ) {
                if (!((s = t.charAt(o)) !== u || c !== u || (D && r(D))))
                  return (
                    !!n || e(i + f + i)({ type: 'delete', children: this.tokenizeInline(f, l) })
                  );
                (f += c), (D = c), (c = s);
              }
          }
        }),
        Ne = c((e, t) => {
          t.exports = function (e, t) {
            return e.indexOf('`', t);
          };
        }),
        Ie = c((e, t) => {
          var r = Ne();
          (t.exports = o), (o.locator = r);
          var n = 10,
            u = 32,
            i = 96;
          function o(e, t, r) {
            for (var o, a, l, s, c, D, f = t.length, p = 0; p < f && t.charCodeAt(p) === i; ) p++;
            if (0 !== p && p !== f) {
              for (o = p, c = t.charCodeAt(p); p < f; ) {
                if (((s = c), (c = t.charCodeAt(p + 1)), s === i)) {
                  if ((void 0 === a && (a = p), (l = p + 1), c !== i && l - a === o)) {
                    D = !0;
                    break;
                  }
                } else void 0 !== a && ((a = void 0), (l = void 0));
                p++;
              }
              if (D) {
                if (r) return !0;
                if (
                  ((p = o),
                  (f = a),
                  (s = t.charCodeAt(p)),
                  (c = t.charCodeAt(f - 1)),
                  (D = !1),
                  f - p > 2 && (s === u || s === n) && (c === u || c === n))
                ) {
                  for (p++, f--; p < f; ) {
                    if ((s = t.charCodeAt(p)) !== u && s !== n) {
                      D = !0;
                      break;
                    }
                    p++;
                  }
                  !0 === D && (o++, a--);
                }
                return e(t.slice(0, l))({ type: 'inlineCode', value: t.slice(o, a) });
              }
            }
          }
        }),
        Pe = c((e, t) => {
          t.exports = function (e, t) {
            for (var r = e.indexOf('\n', t); r > t && ' ' === e.charAt(r - 1); ) r--;
            return r;
          };
        }),
        je = c((e, t) => {
          var r = Pe();
          (t.exports = o), (o.locator = r);
          var n = ' ',
            u = '\n',
            i = 2;
          function o(e, t, r) {
            for (var o, a = t.length, l = -1, s = ''; ++l < a; ) {
              if ((o = t.charAt(l)) === u)
                return l < i ? void 0 : !!r || e((s += o))({ type: 'break' });
              if (o !== n) return;
              s += o;
            }
          }
        }),
        ze = c((e, t) => {
          t.exports = function (e, t, r) {
            var n,
              u,
              i,
              o,
              a,
              l,
              s,
              c,
              D,
              f,
              p = this;
            if (r) return !0;
            for (
              o = (n = p.inlineMethods).length, u = p.inlineTokenizers, i = -1, D = t.length;
              ++i < o;
            )
              'text' !== (c = n[i]) &&
                u[c] &&
                ((s = u[c].locator) || e.file.fail('Missing locator: `' + c + '`'),
                -1 !== (l = s.call(p, t, 1)) && l < D && (D = l));
            (a = t.slice(0, D)),
              (f = e.now()),
              p.decode(a, f, function (t, r, n) {
                e(n || t)({ type: 'text', value: t });
              });
          };
        }),
        $e = c((e, t) => {
          var r = b(),
            n = A(),
            u = x(),
            i = w(),
            o = I(),
            a = P();
          function l(e, t) {
            (this.file = t),
              (this.offset = {}),
              (this.options = r(this.options)),
              this.setOptions({}),
              (this.inList = !1),
              (this.inBlock = !1),
              (this.inLink = !1),
              (this.atStart = !0),
              (this.toOffset = u(t).toOffset),
              (this.unescape = i(this, 'escape')),
              (this.decode = o(this));
          }
          t.exports = l;
          var s = l.prototype;
          function c(e) {
            var t,
              r = [];
            for (t in e) r.push(t);
            return r;
          }
          (s.setOptions = U()),
            (s.parse = H()),
            (s.options = $()),
            (s.exitStart = n('atStart', !0)),
            (s.enterList = n('inList', !1)),
            (s.enterLink = n('inLink', !1)),
            (s.enterBlock = n('inBlock', !1)),
            (s.interruptParagraph = [
              ['thematicBreak'],
              ['list'],
              ['atxHeading'],
              ['fencedCode'],
              ['blockquote'],
              ['html'],
              ['setextHeading', { commonmark: !1 }],
              ['definition', { commonmark: !1 }],
            ]),
            (s.interruptList = [
              ['atxHeading', { pedantic: !1 }],
              ['fencedCode', { pedantic: !1 }],
              ['thematicBreak', { pedantic: !1 }],
              ['definition', { commonmark: !1 }],
            ]),
            (s.interruptBlockquote = [
              ['indentedCode', { commonmark: !0 }],
              ['fencedCode', { commonmark: !0 }],
              ['atxHeading', { commonmark: !0 }],
              ['setextHeading', { commonmark: !0 }],
              ['thematicBreak', { commonmark: !0 }],
              ['html', { commonmark: !0 }],
              ['list', { commonmark: !0 }],
              ['definition', { commonmark: !1 }],
            ]),
            (s.blockTokenizers = {
              blankLine: J(),
              indentedCode: K(),
              fencedCode: Q(),
              blockquote: te(),
              atxHeading: re(),
              thematicBreak: ne(),
              list: oe(),
              setextHeading: ae(),
              html: se(),
              definition: fe(),
              table: pe(),
              paragraph: he(),
            }),
            (s.inlineTokenizers = {
              escape: ge(),
              autoLink: me(),
              url: be(),
              email: ye(),
              html: Ae(),
              link: we(),
              reference: ke(),
              strong: qe(),
              emphasis: Le(),
              deletion: Re(),
              code: Ie(),
              break: je(),
              text: ze(),
            }),
            (s.blockMethods = c(s.blockTokenizers)),
            (s.inlineMethods = c(s.inlineTokenizers)),
            (s.tokenizeBlock = a('block')),
            (s.tokenizeInline = a('inline')),
            (s.tokenizeFactory = a);
        }),
        Ue = c((e, t) => {
          var r = y(),
            n = b(),
            u = $e();
          function i(e) {
            var t = this.data('settings'),
              i = r(u);
            (i.prototype.options = n(i.prototype.options, t, e)), (this.Parser = i);
          }
          (t.exports = i), (i.Parser = u);
        }),
        Me = c((e, t) => {
          t.exports = function (e) {
            if (e) throw e;
          };
        }),
        Ve = c((e, t) => {
          t.exports = function (e) {
            return (
              null != e &&
              null != e.constructor &&
              'function' == typeof e.constructor.isBuffer &&
              e.constructor.isBuffer(e)
            );
          };
        }),
        _e = c((e, t) => {
          var r = Object.prototype.hasOwnProperty,
            n = Object.prototype.toString,
            u = Object.defineProperty,
            i = Object.getOwnPropertyDescriptor,
            o = function (e) {
              return 'function' == typeof Array.isArray
                ? Array.isArray(e)
                : '[object Array]' === n.call(e);
            },
            a = function (e) {
              if (!e || '[object Object]' !== n.call(e)) return !1;
              var t,
                u = r.call(e, 'constructor'),
                i =
                  e.constructor &&
                  e.constructor.prototype &&
                  r.call(e.constructor.prototype, 'isPrototypeOf');
              if (e.constructor && !u && !i) return !1;
              for (t in e);
              return typeof t > 'u' || r.call(e, t);
            },
            l = function (e, t) {
              u && '__proto__' === t.name
                ? u(e, t.name, {
                    enumerable: !0,
                    configurable: !0,
                    value: t.newValue,
                    writable: !0,
                  })
                : (e[t.name] = t.newValue);
            },
            s = function (e, t) {
              if ('__proto__' === t) {
                if (!r.call(e, t)) return;
                if (i) return i(e, t).value;
              }
              return e[t];
            };
          t.exports = function e() {
            var t,
              r,
              n,
              u,
              i,
              c,
              D = arguments[0],
              f = 1,
              p = arguments.length,
              h = !1;
            for (
              'boolean' == typeof D && ((h = D), (D = arguments[1] || {}), (f = 2)),
                (null == D || ('object' != typeof D && 'function' != typeof D)) && (D = {});
              f < p;
              ++f
            )
              if (null != (t = arguments[f]))
                for (r in t)
                  (n = s(D, r)),
                    D !== (u = s(t, r)) &&
                      (h && u && (a(u) || (i = o(u)))
                        ? (i ? ((i = !1), (c = n && o(n) ? n : [])) : (c = n && a(n) ? n : {}),
                          l(D, { name: r, newValue: e(h, c, u) }))
                        : typeof u < 'u' && l(D, { name: r, newValue: u }));
            return D;
          };
        }),
        Ge = c((e, t) => {
          t.exports = (e) => {
            if ('[object Object]' !== Object.prototype.toString.call(e)) return !1;
            let t = Object.getPrototypeOf(e);
            return null === t || t === Object.prototype;
          };
        }),
        We = c((e, t) => {
          var r = [].slice;
          t.exports = function (e, t) {
            var n;
            return function () {
              var t,
                o = r.call(arguments, 0),
                a = e.length > o.length;
              a && o.push(u);
              try {
                t = e.apply(null, o);
              } catch (e) {
                if (a && n) throw e;
                return u(e);
              }
              a ||
                (t && 'function' == typeof t.then
                  ? t.then(i, u)
                  : t instanceof Error
                    ? u(t)
                    : i(t));
            };
            function u() {
              n || ((n = !0), t.apply(null, arguments));
            }
            function i(e) {
              u(null, e);
            }
          };
        }),
        He = c((e, t) => {
          var r = We();
          (t.exports = u), (u.wrap = r);
          var n = [].slice;
          function u() {
            var e = [],
              t = {
                run: function () {
                  var t = -1,
                    u = n.call(arguments, 0, -1),
                    i = arguments[arguments.length - 1];
                  if ('function' != typeof i)
                    throw new Error('Expected function as last argument, not ' + i);
                  (function o(a) {
                    var l = e[++t],
                      s = n.call(arguments, 0).slice(1),
                      c = u.length,
                      D = -1;
                    if (a) i(a);
                    else {
                      for (; ++D < c; ) (null === s[D] || void 0 === s[D]) && (s[D] = u[D]);
                      (u = s), l ? r(l, o).apply(null, u) : i.apply(null, [null].concat(u));
                    }
                  }).apply(null, [null].concat(u));
                },
                use: function (r) {
                  if ('function' != typeof r)
                    throw new Error('Expected `fn` to be a function, not ' + r);
                  return e.push(r), t;
                },
              };
            return t;
          }
        }),
        Je = c((e, t) => {
          var r = {}.hasOwnProperty;
          function n(e) {
            return (!e || 'object' != typeof e) && (e = {}), i(e.line) + ':' + i(e.column);
          }
          function u(e) {
            return (!e || 'object' != typeof e) && (e = {}), n(e.start) + '-' + n(e.end);
          }
          function i(e) {
            return e && 'number' == typeof e ? e : 1;
          }
          t.exports = function (e) {
            return e && 'object' == typeof e
              ? r.call(e, 'position') || r.call(e, 'type')
                ? u(e.position)
                : r.call(e, 'start') || r.call(e, 'end')
                  ? u(e)
                  : r.call(e, 'line') || r.call(e, 'column')
                    ? n(e)
                    : ''
              : '';
          };
        }),
        Ze = c((e, t) => {
          var r = Je();
          function n() {}
          (t.exports = i), (n.prototype = Error.prototype), (i.prototype = new n());
          var u = i.prototype;
          function i(e, t, n) {
            var u, i, o;
            'string' == typeof t && ((n = t), (t = null)),
              (u = (function (e) {
                var t,
                  r = [null, null];
                return (
                  'string' == typeof e &&
                    (-1 === (t = e.indexOf(':'))
                      ? (r[1] = e)
                      : ((r[0] = e.slice(0, t)), (r[1] = e.slice(t + 1)))),
                  r
                );
              })(n)),
              (i = r(t) || '1:1'),
              (o = { start: { line: null, column: null }, end: { line: null, column: null } }),
              t && t.position && (t = t.position),
              t && (t.start ? ((o = t), (t = t.start)) : (o.start = t)),
              e.stack && ((this.stack = e.stack), (e = e.message)),
              (this.message = e),
              (this.name = i),
              (this.reason = e),
              (this.line = t ? t.line : null),
              (this.column = t ? t.column : null),
              (this.location = o),
              (this.source = u[0]),
              (this.ruleId = u[1]);
          }
          (u.file = ''),
            (u.name = ''),
            (u.reason = ''),
            (u.message = ''),
            (u.stack = ''),
            (u.fatal = null),
            (u.column = null),
            (u.line = null);
        }),
        Ye = c((e) => {
          function t(e) {
            if ('string' != typeof e)
              throw new TypeError('Path must be a string. Received ' + JSON.stringify(e));
          }
          (e.basename = function (e, r) {
            var n,
              u,
              i,
              o,
              a = 0,
              l = -1;
            if (void 0 !== r && 'string' != typeof r)
              throw new TypeError('"ext" argument must be a string');
            if ((t(e), (n = e.length), void 0 === r || !r.length || r.length > e.length)) {
              for (; n--; )
                if (47 === e.charCodeAt(n)) {
                  if (i) {
                    a = n + 1;
                    break;
                  }
                } else l < 0 && ((i = !0), (l = n + 1));
              return l < 0 ? '' : e.slice(a, l);
            }
            if (r === e) return '';
            for (u = -1, o = r.length - 1; n--; )
              if (47 === e.charCodeAt(n)) {
                if (i) {
                  a = n + 1;
                  break;
                }
              } else
                u < 0 && ((i = !0), (u = n + 1)),
                  o > -1 &&
                    (e.charCodeAt(n) === r.charCodeAt(o--)
                      ? o < 0 && (l = n)
                      : ((o = -1), (l = u)));
            return a === l ? (l = u) : l < 0 && (l = e.length), e.slice(a, l);
          }),
            (e.dirname = function (e) {
              var r, n, u;
              if ((t(e), !e.length)) return '.';
              for (r = -1, u = e.length; --u; )
                if (47 === e.charCodeAt(u)) {
                  if (n) {
                    r = u;
                    break;
                  }
                } else n || (n = !0);
              return r < 0
                ? 47 === e.charCodeAt(0)
                  ? '/'
                  : '.'
                : 1 === r && 47 === e.charCodeAt(0)
                  ? '//'
                  : e.slice(0, r);
            }),
            (e.extname = function (e) {
              var r,
                n,
                u,
                i = -1,
                o = 0,
                a = -1,
                l = 0;
              for (t(e), u = e.length; u--; )
                if (47 !== (n = e.charCodeAt(u)))
                  a < 0 && ((r = !0), (a = u + 1)),
                    46 === n ? (i < 0 ? (i = u) : 1 !== l && (l = 1)) : i > -1 && (l = -1);
                else if (r) {
                  o = u + 1;
                  break;
                }
              return i < 0 || a < 0 || 0 === l || (1 === l && i === a - 1 && i === o + 1)
                ? ''
                : e.slice(i, a);
            }),
            (e.join = function () {
              for (var e, r = -1; ++r < arguments.length; )
                t(arguments[r]),
                  arguments[r] && (e = void 0 === e ? arguments[r] : e + '/' + arguments[r]);
              return void 0 === e
                ? '.'
                : (function (e) {
                    var r, n;
                    return (
                      t(e),
                      (r = 47 === e.charCodeAt(0)),
                      (n = (function (e, t) {
                        for (var r, n, u = '', i = 0, o = -1, a = 0, l = -1; ++l <= e.length; ) {
                          if (l < e.length) r = e.charCodeAt(l);
                          else {
                            if (47 === r) break;
                            r = 47;
                          }
                          if (47 === r) {
                            if (o !== l - 1 && 1 !== a)
                              if (o !== l - 1 && 2 === a) {
                                if (
                                  u.length < 2 ||
                                  2 !== i ||
                                  46 !== u.charCodeAt(u.length - 1) ||
                                  46 !== u.charCodeAt(u.length - 2)
                                )
                                  if (u.length > 2) {
                                    if ((n = u.lastIndexOf('/')) !== u.length - 1) {
                                      n < 0
                                        ? ((u = ''), (i = 0))
                                        : (i = (u = u.slice(0, n)).length - 1 - u.lastIndexOf('/')),
                                        (o = l),
                                        (a = 0);
                                      continue;
                                    }
                                  } else if (u.length) {
                                    (u = ''), (i = 0), (o = l), (a = 0);
                                    continue;
                                  }
                                t && ((u = u.length ? u + '/..' : '..'), (i = 2));
                              } else
                                u.length ? (u += '/' + e.slice(o + 1, l)) : (u = e.slice(o + 1, l)),
                                  (i = l - o - 1);
                            (o = l), (a = 0);
                          } else 46 === r && a > -1 ? a++ : (a = -1);
                        }
                        return u;
                      })(e, !r)),
                      !n.length && !r && (n = '.'),
                      n.length && 47 === e.charCodeAt(e.length - 1) && (n += '/'),
                      r ? '/' + n : n
                    );
                  })(e);
            }),
            (e.sep = '/');
        }),
        Ke = c((e) => {
          e.cwd = function () {
            return '/';
          };
        }),
        Qe = c((e, t) => {
          var r = Ye(),
            n = Ke(),
            u = Ve();
          t.exports = a;
          var i = {}.hasOwnProperty,
            o = ['history', 'path', 'basename', 'stem', 'extname', 'dirname'];
          function a(e) {
            var t, r;
            if (e) {
              if ('string' == typeof e || u(e)) e = { contents: e };
              else if ('message' in e && 'messages' in e) return e;
            } else e = {};
            if (!(this instanceof a)) return new a(e);
            for (
              this.data = {}, this.messages = [], this.history = [], this.cwd = n.cwd(), r = -1;
              ++r < o.length;
            )
              (t = o[r]), i.call(e, t) && (this[t] = e[t]);
            for (t in e) o.indexOf(t) < 0 && (this[t] = e[t]);
          }
          function l(e, t) {
            if (e && e.indexOf(r.sep) > -1)
              throw new Error('`' + t + '` cannot be a path: did not expect `' + r.sep + '`');
          }
          function s(e, t) {
            if (!e) throw new Error('`' + t + '` cannot be empty');
          }
          function c(e, t) {
            if (!e) throw new Error('Setting `' + t + '` requires `path` to be set too');
          }
          (a.prototype.toString = function (e) {
            return (this.contents || '').toString(e);
          }),
            Object.defineProperty(a.prototype, 'path', {
              get: function () {
                return this.history[this.history.length - 1];
              },
              set: function (e) {
                s(e, 'path'), this.path !== e && this.history.push(e);
              },
            }),
            Object.defineProperty(a.prototype, 'dirname', {
              get: function () {
                return 'string' == typeof this.path ? r.dirname(this.path) : void 0;
              },
              set: function (e) {
                c(this.path, 'dirname'), (this.path = r.join(e || '', this.basename));
              },
            }),
            Object.defineProperty(a.prototype, 'basename', {
              get: function () {
                return 'string' == typeof this.path ? r.basename(this.path) : void 0;
              },
              set: function (e) {
                s(e, 'basename'), l(e, 'basename'), (this.path = r.join(this.dirname || '', e));
              },
            }),
            Object.defineProperty(a.prototype, 'extname', {
              get: function () {
                return 'string' == typeof this.path ? r.extname(this.path) : void 0;
              },
              set: function (e) {
                if ((l(e, 'extname'), c(this.path, 'extname'), e)) {
                  if (46 !== e.charCodeAt(0)) throw new Error('`extname` must start with `.`');
                  if (e.indexOf('.', 1) > -1)
                    throw new Error('`extname` cannot contain multiple dots');
                }
                this.path = r.join(this.dirname, this.stem + (e || ''));
              },
            }),
            Object.defineProperty(a.prototype, 'stem', {
              get: function () {
                return 'string' == typeof this.path ? r.basename(this.path, this.extname) : void 0;
              },
              set: function (e) {
                s(e, 'stem'),
                  l(e, 'stem'),
                  (this.path = r.join(this.dirname || '', e + (this.extname || '')));
              },
            });
        }),
        Xe = c((e, t) => {
          var r = Ze(),
            n = Qe();
          (t.exports = n),
            (n.prototype.message = function (e, t, n) {
              var u = new r(e, t, n);
              return (
                this.path && ((u.name = this.path + ':' + u.name), (u.file = this.path)),
                (u.fatal = !1),
                this.messages.push(u),
                u
              );
            }),
            (n.prototype.info = function () {
              var e = this.message.apply(this, arguments);
              return (e.fatal = null), e;
            }),
            (n.prototype.fail = function () {
              var e = this.message.apply(this, arguments);
              throw ((e.fatal = !0), e);
            });
        }),
        et = c((e, t) => {
          t.exports = Xe();
        }),
        tt = c((e, t) => {
          var r = Me(),
            n = Ve(),
            u = _e(),
            i = Ge(),
            o = He(),
            a = et();
          t.exports = (function e() {
            var t,
              n = [],
              F = o(),
              m = {},
              C = -1;
            return (
              (E.data = function (e, r) {
                return 'string' == typeof e
                  ? 2 === arguments.length
                    ? (h('data', t), (m[e] = r), E)
                    : (s.call(m, e) && m[e]) || null
                  : e
                    ? (h('data', t), (m = e), E)
                    : m;
              }),
              (E.freeze = b),
              (E.attachers = n),
              (E.use = function (e) {
                var r;
                if ((h('use', t), null != e))
                  if ('function' == typeof e) c.apply(null, arguments);
                  else {
                    if ('object' != typeof e)
                      throw new Error('Expected usable value, not `' + e + '`');
                    'length' in e ? s(e) : o(e);
                  }
                return r && (m.settings = u(m.settings || {}, r)), E;
                function o(e) {
                  s(e.plugins), e.settings && (r = u(r || {}, e.settings));
                }
                function a(e) {
                  if ('function' == typeof e) c(e);
                  else {
                    if ('object' != typeof e)
                      throw new Error('Expected usable value, not `' + e + '`');
                    'length' in e ? c.apply(null, e) : o(e);
                  }
                }
                function s(e) {
                  var t = -1;
                  if (null != e) {
                    if ('object' != typeof e || !('length' in e))
                      throw new Error('Expected a list of plugins, not `' + e + '`');
                    for (; ++t < e.length; ) a(e[t]);
                  }
                }
                function c(e, t) {
                  var r = (function (e) {
                    for (var t = -1; ++t < n.length; ) if (n[t][0] === e) return n[t];
                  })(e);
                  r
                    ? (i(r[1]) && i(t) && (t = u(!0, r[1], t)), (r[1] = t))
                    : n.push(l.call(arguments));
                }
              }),
              (E.parse = function (e) {
                var t,
                  r = a(e);
                return (
                  b(),
                  f('parse', (t = E.Parser)),
                  D(t, 'parse') ? new t(String(r), r).parse() : t(String(r), r)
                );
              }),
              (E.stringify = function (e, t) {
                var r,
                  n = a(t);
                return (
                  b(),
                  p('stringify', (r = E.Compiler)),
                  d(e),
                  D(r, 'compile') ? new r(e, n).compile() : r(e, n)
                );
              }),
              (E.run = v),
              (E.runSync = function (e, t) {
                var n, u;
                return (
                  v(e, t, function (e, t) {
                    (u = !0), (n = t), r(e);
                  }),
                  g('runSync', 'run', u),
                  n
                );
              }),
              (E.process = y),
              (E.processSync = function (e) {
                var t, n;
                return (
                  b(),
                  f('processSync', E.Parser),
                  p('processSync', E.Compiler),
                  y((t = a(e)), function (e) {
                    (n = !0), r(e);
                  }),
                  g('processSync', 'process', n),
                  t
                );
              }),
              E
            );
            function E() {
              for (var t = e(), r = -1; ++r < n.length; ) t.use.apply(null, n[r]);
              return t.data(u(!0, {}, m)), t;
            }
            function b() {
              var e, r;
              if (t) return E;
              for (; ++C < n.length; )
                !1 !== (e = n[C])[1] &&
                  (!0 === e[1] && (e[1] = void 0),
                  'function' == typeof (r = e[0].apply(E, e.slice(1))) && F.use(r));
              return (t = !0), (C = 1 / 0), E;
            }
            function v(e, t, r) {
              if ((d(e), b(), !r && 'function' == typeof t && ((r = t), (t = null)), !r))
                return new Promise(n);
              function n(n, u) {
                F.run(e, a(t), function (t, i, o) {
                  (i = i || e), t ? u(t) : n ? n(i) : r(null, i, o);
                });
              }
              n(null, r);
            }
            function y(e, t) {
              if ((b(), f('process', E.Parser), p('process', E.Compiler), !t))
                return new Promise(r);
              function r(r, n) {
                var u = a(e);
                c.run(E, { file: u }, function (e) {
                  e ? n(e) : r ? r(u) : t(null, u);
                });
              }
              r(null, t);
            }
          })().freeze();
          var l = [].slice,
            s = {}.hasOwnProperty,
            c = o()
              .use(function (e, t) {
                t.tree = e.parse(t.file);
              })
              .use(function (e, t, r) {
                e.run(t.tree, t.file, function (e, n, u) {
                  e ? r(e) : ((t.tree = n), (t.file = u), r());
                });
              })
              .use(function (e, t) {
                var r = e.stringify(t.tree, t.file);
                null == r ||
                  ('string' == typeof r || n(r)
                    ? ('value' in t.file && (t.file.value = r), (t.file.contents = r))
                    : (t.file.result = r));
              });
          function D(e, t) {
            return (
              'function' == typeof e &&
              e.prototype &&
              ((function (e) {
                var t;
                for (t in e) return !0;
                return !1;
              })(e.prototype) ||
                t in e.prototype)
            );
          }
          function f(e, t) {
            if ('function' != typeof t) throw new Error('Cannot `' + e + '` without `Parser`');
          }
          function p(e, t) {
            if ('function' != typeof t) throw new Error('Cannot `' + e + '` without `Compiler`');
          }
          function h(e, t) {
            if (t)
              throw new Error(
                'Cannot invoke `' +
                  e +
                  '` on a frozen processor.\nCreate a new processor first, by invoking it: use `processor()` instead of `processor`.'
              );
          }
          function d(e) {
            if (!e || 'string' != typeof e.type) throw new Error('Expected node, got `' + e + '`');
          }
          function g(e, t, r) {
            if (!r) throw new Error('`' + e + '` finished async. Use `' + t + '` instead');
          }
        }),
        rt = {};
      D(rt, { languages: () => dn, options: () => Fn, parsers: () => mn, printers: () => Mn });
      var nt = (e, t, r) => {
          if (!e || null != t)
            return Array.isArray(t) || 'string' == typeof t ? t[r < 0 ? t.length + r : r] : t.at(r);
        },
        ut = (e, t, r, n) => {
          if (!e || null != t)
            return t.replaceAll
              ? t.replaceAll(r, n)
              : r.global
                ? t.replace(r, n)
                : t.split(r).join(n);
        },
        it = f(d(), 1);
      function ot(e) {
        if ('string' != typeof e) throw new TypeError('Expected a string');
        return e.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
      }
      var at = 'string',
        lt = 'array',
        st = 'cursor',
        ct = 'indent',
        Dt = 'align',
        ft = 'trim',
        pt = 'group',
        ht = 'fill',
        dt = 'if-break',
        gt = 'indent-if-break',
        Ft = 'line-suffix',
        mt = 'line-suffix-boundary',
        Ct = 'line',
        Et = 'label',
        bt = 'break-parent',
        vt = new Set([st, ct, Dt, ft, pt, ht, dt, gt, Ft, mt, Ct, Et, bt]),
        yt = function (e) {
          if ('string' == typeof e) return at;
          if (Array.isArray(e)) return lt;
          if (!e) return;
          let { type: t } = e;
          return vt.has(t) ? t : void 0;
        };
      var At = class extends Error {
          name = 'InvalidDocError';
          constructor(e) {
            super(
              (function (e) {
                let t = null === e ? 'null' : typeof e;
                if ('string' !== t && 'object' !== t)
                  return `Unexpected doc '${t}', \nExpected it to be 'string' or 'object'.`;
                if (yt(e)) throw new Error('doc is valid.');
                let r = Object.prototype.toString.call(e);
                if ('[object Object]' !== r) return `Unexpected doc '${r}'.`;
                let n = ((e) => new Intl.ListFormat('en-US', { type: 'disjunction' }).format(e))(
                  [...vt].map((e) => `'${e}'`)
                );
                return `Unexpected doc.type '${e.type}'.\nExpected it to be ${n}.`;
              })(e)
            ),
              (this.doc = e);
          }
        },
        xt = {};
      function wt(e) {
        if (e.length > 0) {
          let t = nt(!1, e, -1);
          !t.expandedStates && !t.break && (t.break = 'propagated');
        }
        return null;
      }
      function kt(e, t = Vt) {
        return (function (e, t) {
          if ('string' == typeof e) return t(e);
          let r = new Map();
          return (function e(n) {
            if (r.has(n)) return r.get(n);
            let u = (function (r) {
              switch (yt(r)) {
                case lt:
                  return t(r.map(e));
                case ht:
                  return t({ ...r, parts: r.parts.map(e) });
                case dt:
                  return t({
                    ...r,
                    breakContents: e(r.breakContents),
                    flatContents: e(r.flatContents),
                  });
                case pt: {
                  let { expandedStates: n, contents: u } = r;
                  return (
                    n ? ((n = n.map(e)), (u = n[0])) : (u = e(u)),
                    t({ ...r, contents: u, expandedStates: n })
                  );
                }
                case Dt:
                case ct:
                case gt:
                case Et:
                case Ft:
                  return t({ ...r, contents: e(r.contents) });
                case at:
                case st:
                case ft:
                case mt:
                case Ct:
                case bt:
                  return t(r);
                default:
                  throw new At(r);
              }
            })(n);
            return r.set(n, u), u;
          })(e);
        })(e, (e) => ('string' == typeof e ? _t(t, e.split('\n')) : e));
      }
      var Bt = () => {},
        qt = Bt,
        St = Bt,
        Tt = Bt;
      function Lt(e) {
        return qt(e), { type: ct, contents: e };
      }
      function Ot(e, t) {
        return qt(t), { type: Dt, contents: t, n: e };
      }
      function Rt(e, t = {}) {
        return (
          qt(e),
          St(t.expandedStates, !0),
          {
            type: pt,
            id: t.id,
            contents: e,
            break: !!t.shouldBreak,
            expandedStates: t.expandedStates,
          }
        );
      }
      function Nt(e) {
        return Ot({ type: 'root' }, e);
      }
      function It(e) {
        return Tt(e), { type: ht, parts: e };
      }
      function Pt(e, t = '', r = {}) {
        return (
          qt(e),
          '' !== t && qt(t),
          { type: dt, breakContents: e, flatContents: t, groupId: r.groupId }
        );
      }
      var jt = { type: bt },
        zt = { type: Ct, hard: !0 },
        $t = { type: Ct },
        Ut = { type: Ct, soft: !0 },
        Mt = [zt, jt],
        Vt = [{ type: Ct, hard: !0, literal: !0 }, jt];
      function _t(e, t) {
        qt(e), St(t);
        let r = [];
        for (let n = 0; n < t.length; n++) 0 !== n && r.push(e), r.push(t[n]);
        return r;
      }
      var Gt = function (e, t) {
          let r = e.match(new RegExp(`(${ot(t)})+`, 'gu'));
          return null === r ? 0 : r.reduce((e, r) => Math.max(e, r.length / t.length), 0);
        },
        Wt = "'",
        Ht = class extends Error {
          name = 'UnexpectedNodeError';
          constructor(e, t, r = 'type') {
            super(`Unexpected ${t} node ${r}: ${JSON.stringify(e[r])}.`), (this.node = e);
          }
        },
        Jt = f(d(), 1),
        Zt = ['noformat', 'noprettier'],
        Yt = ['format', 'prettier'],
        Kt = function (e) {
          let t = (function (e) {
            let t = e.slice(0, 3);
            if ('---' !== t && '+++' !== t) return;
            let r = e.indexOf('\n', 3);
            if (-1 === r) return;
            let n = e.slice(3, r).trim(),
              u = e.indexOf(`\n${t}`, r),
              i = n;
            if (
              (i || (i = '+++' === t ? 'toml' : 'yaml'),
              -1 === u && '---' === t && 'yaml' === i && (u = e.indexOf('\n...', r)),
              -1 === u)
            )
              return;
            let o = u + 1 + 3,
              a = e.charAt(o + 1);
            if (!/\s?/u.test(a)) return;
            let l = e.slice(0, o);
            return {
              type: 'front-matter',
              language: i,
              explicitLanguage: n,
              value: e.slice(r + 1, u),
              startDelimiter: t,
              endDelimiter: l.slice(-3),
              raw: l,
            };
          })(e);
          if (!t) return { content: e };
          let { raw: r } = t;
          return { frontMatter: t, content: ut(!1, r, /[^\n]/gu, ' ') + e.slice(r.length) };
        };
      function Qt(e, t) {
        let r = `@(${t.join('|')})`,
          n = new RegExp(
            [
              `\x3c!--\\s*${r}\\s*--\x3e`,
              `\\{\\s*\\/\\*\\s*${r}\\s*\\*\\/\\s*\\}`,
              `\x3c!--.*\r?\n[\\s\\S]*(^|\n)[^\\S\n]*${r}[^\\S\n]*($|\n)[\\s\\S]*\n.*--\x3e`,
            ].join('|'),
            'mu'
          ),
          u = e.match(n);
        return 0 === (null == u ? void 0 : u.index);
      }
      var Xt = new Set(['position', 'raw']);
      function er(e, t, r) {
        if (
          (('front-matter' === e.type ||
            'code' === e.type ||
            'yaml' === e.type ||
            'import' === e.type ||
            'export' === e.type ||
            'jsx' === e.type) &&
            delete t.value,
          'list' === e.type && delete t.isAligned,
          ('list' === e.type || 'listItem' === e.type) && delete t.spread,
          'text' === e.type)
        )
          return null;
        if (
          ('inlineCode' === e.type && (t.value = ut(!1, e.value, '\n', ' ')),
          'wikiLink' === e.type && (t.value = ut(!1, e.value.trim(), /[\t\n]+/gu, ' ')),
          ('definition' === e.type || 'linkReference' === e.type || 'imageReference' === e.type) &&
            (t.label = (0, Jt.default)(e.label)),
          ('link' === e.type || 'image' === e.type) && e.url && e.url.includes('('))
        )
          for (let r of '<>') t.url = ut(!1, e.url, r, encodeURIComponent(r));
        return (
          ('definition' === e.type || 'link' === e.type || 'image' === e.type) &&
            e.title &&
            (t.title = ut(!1, e.title, /\\(?=["')])/gu, '')),
          'root' === (null == r ? void 0 : r.type) &&
          r.children.length > 0 &&
          (r.children[0] === e ||
            ((function (e) {
              return 'front-matter' === (null == e ? void 0 : e.type);
            })(r.children[0]) &&
              r.children[1] === e)) &&
          'html' === e.type &&
          Qt(e.value, Yt)
            ? null
            : void 0
        );
      }
      er.ignoredProperties = Xt;
      var tr,
        rr,
        nr,
        ur,
        ir,
        or = er,
        ar =
          /(?:[\u{2c7}\u{2c9}-\u{2cb}\u{2d9}\u{2ea}-\u{2eb}\u{305}\u{323}\u{1100}-\u{11ff}\u{2e80}-\u{2e99}\u{2e9b}-\u{2ef3}\u{2f00}-\u{2fd5}\u{2ff0}-\u{303f}\u{3041}-\u{3096}\u{3099}-\u{30ff}\u{3105}-\u{312f}\u{3131}-\u{318e}\u{3190}-\u{4dbf}\u{4e00}-\u{9fff}\u{a700}-\u{a707}\u{a960}-\u{a97c}\u{ac00}-\u{d7a3}\u{d7b0}-\u{d7c6}\u{d7cb}-\u{d7fb}\u{f900}-\u{fa6d}\u{fa70}-\u{fad9}\u{fe10}-\u{fe1f}\u{fe30}-\u{fe6f}\u{ff00}-\u{ffef}\u{16fe3}\u{1aff0}-\u{1aff3}\u{1aff5}-\u{1affb}\u{1affd}-\u{1affe}\u{1b000}-\u{1b122}\u{1b132}\u{1b150}-\u{1b152}\u{1b155}\u{1b164}-\u{1b167}\u{1f200}\u{1f250}-\u{1f251}\u{20000}-\u{2a6df}\u{2a700}-\u{2b739}\u{2b740}-\u{2b81d}\u{2b820}-\u{2cea1}\u{2ceb0}-\u{2ebe0}\u{2ebf0}-\u{2ee5d}\u{2f800}-\u{2fa1d}\u{30000}-\u{3134a}\u{31350}-\u{323af}])(?:[\u{fe00}-\u{fe0f}\u{e0100}-\u{e01ef}])?/u,
        lr =
          /(?:[\u{21}-\u{2f}\u{3a}-\u{40}\u{5b}-\u{60}\u{7b}-\u{7e}]|\p{General_Category=Connector_Punctuation}|\p{General_Category=Dash_Punctuation}|\p{General_Category=Close_Punctuation}|\p{General_Category=Final_Punctuation}|\p{General_Category=Initial_Punctuation}|\p{General_Category=Other_Punctuation}|\p{General_Category=Open_Punctuation})/u,
        sr =
          'windows' === (null == (tr = globalThis.Deno) ? void 0 : tr.build.os) ||
          (null == (nr = null == (rr = globalThis.navigator) ? void 0 : rr.platform)
            ? void 0
            : nr.startsWith('Win')) ||
          (null == (ir = null == (ur = globalThis.process) ? void 0 : ur.platform)
            ? void 0
            : ir.startsWith('win')) ||
          !1;
      function cr(e) {
        if ('file:' !== (e = e instanceof URL ? e : new URL(e)).protocol)
          throw new TypeError(`URL must be a file URL: received "${e.protocol}"`);
        return e;
      }
      function Dr(e, t) {
        if (!t) return;
        let r = ((e) => String(e).split(/[/\\]/u).pop())(t).toLowerCase();
        return (
          e.find(({ filenames: e }) =>
            null == e ? void 0 : e.some((e) => e.toLowerCase() === r)
          ) ?? e.find(({ extensions: e }) => (null == e ? void 0 : e.some((e) => r.endsWith(e))))
        );
      }
      function fr(e, t) {
        if (t) {
          if (String(t).startsWith('file:'))
            try {
              t = (function (e) {
                return sr
                  ? (function (e) {
                      e = cr(e);
                      let t = decodeURIComponent(
                        e.pathname.replace(/\//g, '\\').replace(/%(?![0-9A-Fa-f]{2})/g, '%25')
                      ).replace(/^\\*([A-Za-z]:)(\\|$)/, '$1\\');
                      return '' !== e.hostname && (t = `\\\\${e.hostname}${t}`), t;
                    })(e)
                  : (function (e) {
                      return (
                        (e = cr(e)),
                        decodeURIComponent(e.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, '%25'))
                      );
                    })(e);
              })(t);
            } catch {
              return;
            }
          if ('string' == typeof t)
            return e.find(({ isSupported: e }) => (null == e ? void 0 : e({ filepath: t })));
        }
      }
      var pr = function (e, t) {
          let r = ((e, t) => {
              if (!e || null != t)
                return t.toReversed || !Array.isArray(t) ? t.toReversed() : [...t].reverse();
            })(!1, e.plugins).flatMap((e) => e.languages ?? []),
            n =
              (function (e, t) {
                if (t)
                  return (
                    e.find(({ name: e }) => e.toLowerCase() === t) ??
                    e.find(({ aliases: e }) => (null == e ? void 0 : e.includes(t))) ??
                    e.find(({ extensions: e }) => (null == e ? void 0 : e.includes(`.${t}`)))
                  );
              })(r, t.language) ??
              Dr(r, t.physicalFile) ??
              Dr(r, t.file) ??
              fr(r, t.physicalFile) ??
              fr(r, t.file) ??
              void t.physicalFile;
          return null == n ? void 0 : n.parsers[0];
        },
        hr = new Proxy(() => {}, { get: () => hr });
      function dr(e) {
        return e.position.start.offset;
      }
      function gr(e) {
        return e.position.end.offset;
      }
      var Fr = new Set([
          'liquidNode',
          'inlineCode',
          'emphasis',
          'esComment',
          'strong',
          'delete',
          'wikiLink',
          'link',
          'linkReference',
          'image',
          'imageReference',
          'footnote',
          'footnoteReference',
          'sentence',
          'whitespace',
          'word',
          'break',
          'inlineMath',
        ]),
        mr = new Set([...Fr, 'tableCell', 'paragraph', 'heading']),
        Cr = 'non-cjk',
        Er = 'cj-letter',
        br = 'k-letter',
        vr = 'cjk-punctuation',
        yr = /\p{Script_Extensions=Hangul}/u;
      function Ar(e) {
        let t = [],
          r = e.split(/([\t\n ]+)/u);
        for (let [e, u] of r.entries()) {
          if (e % 2 == 1) {
            t.push({ type: 'whitespace', value: /\n/u.test(u) ? '\n' : ' ' });
            continue;
          }
          if ((0 === e || e === r.length - 1) && '' === u) continue;
          let i = u.split(new RegExp(`(${ar.source})`, 'u'));
          for (let [e, t] of i.entries())
            if ((0 !== e && e !== i.length - 1) || '' !== t) {
              if (e % 2 == 0) {
                '' !== t &&
                  n({
                    type: 'word',
                    value: t,
                    kind: Cr,
                    isCJ: !1,
                    hasLeadingPunctuation: lr.test(t[0]),
                    hasTrailingPunctuation: lr.test(nt(!1, t, -1)),
                  });
                continue;
              }
              if (lr.test(t)) {
                n({
                  type: 'word',
                  value: t,
                  kind: vr,
                  isCJ: !0,
                  hasLeadingPunctuation: !0,
                  hasTrailingPunctuation: !0,
                });
                continue;
              }
              if (yr.test(t)) {
                n({
                  type: 'word',
                  value: t,
                  kind: br,
                  isCJ: !1,
                  hasLeadingPunctuation: !1,
                  hasTrailingPunctuation: !1,
                });
                continue;
              }
              n({
                type: 'word',
                value: t,
                kind: Er,
                isCJ: !0,
                hasLeadingPunctuation: !1,
                hasTrailingPunctuation: !1,
              });
            }
        }
        return t;
        function n(e) {
          let r = nt(!1, t, -1);
          var n, u;
          'word' === (null == r ? void 0 : r.type) &&
            ((n = Cr),
            (u = vr),
            !((r.kind === n && e.kind === u) || (r.kind === u && e.kind === n))) &&
            ![r.value, e.value].some((e) => /\u3000/u.test(e)) &&
            t.push({ type: 'whitespace', value: '' }),
            t.push(e);
        }
      }
      function xr(e, t) {
        let r = t.originalText.slice(e.position.start.offset, e.position.end.offset),
          { numberText: n, leadingSpaces: u } = r.match(
            /^\s*(?<numberText>\d+)(\.|\))(?<leadingSpaces>\s*)/u
          ).groups;
        return { number: Number(n), leadingSpaces: u };
      }
      function wr(e, t) {
        let { value: r } = e;
        return e.position.end.offset === t.length && r.endsWith('\n') && t.endsWith('\n')
          ? r.slice(0, -1)
          : r;
      }
      function kr(e, t) {
        return (function e(r, n, u) {
          let i = { ...t(r, n, u) };
          return i.children && (i.children = i.children.map((t, r) => e(t, r, [i, ...u]))), i;
        })(e, null, []);
      }
      function Br(e) {
        if ('link' !== (null == e ? void 0 : e.type) || 1 !== e.children.length) return !1;
        let [t] = e.children;
        return dr(e) === dr(t) && gr(e) === gr(t);
      }
      var qr = null;
      function Sr(e) {
        if (null !== qr && (qr.property, 1)) {
          let e = qr;
          return (qr = Sr.prototype = null), e;
        }
        return (qr = Sr.prototype = e ?? Object.create(null)), new Sr();
      }
      for (let e = 0; e <= 10; e++) Sr();
      var Tr,
        Lr = (function (e, t = 'type') {
          return (
            (function (e) {
              Sr(e);
            })(e),
            function (r) {
              let n = r[t],
                u = e[n];
              if (!Array.isArray(u))
                throw Object.assign(new Error(`Missing visitor keys for '${n}'.`), { node: r });
              return u;
            }
          );
        })({
          'front-matter': [],
          root: ['children'],
          paragraph: ['children'],
          sentence: ['children'],
          word: [],
          whitespace: [],
          emphasis: ['children'],
          strong: ['children'],
          delete: ['children'],
          inlineCode: [],
          wikiLink: [],
          link: ['children'],
          image: [],
          blockquote: ['children'],
          heading: ['children'],
          code: [],
          html: [],
          list: ['children'],
          thematicBreak: [],
          linkReference: ['children'],
          imageReference: [],
          definition: [],
          footnote: ['children'],
          footnoteReference: [],
          footnoteDefinition: ['children'],
          table: ['children'],
          tableCell: ['children'],
          break: [],
          liquidNode: [],
          import: [],
          export: [],
          esComment: [],
          jsx: [],
          math: [],
          inlineMath: [],
          tableRow: ['children'],
          listItem: ['children'],
          text: [],
        }),
        Or = (e) =>
          !(
            (function (e) {
              return 12288 === e || (e >= 65281 && e <= 65376) || (e >= 65504 && e <= 65510);
            })(e) ||
            (function (e) {
              return (
                (e >= 4352 && e <= 4447) ||
                8986 === e ||
                8987 === e ||
                9001 === e ||
                9002 === e ||
                (e >= 9193 && e <= 9196) ||
                9200 === e ||
                9203 === e ||
                9725 === e ||
                9726 === e ||
                9748 === e ||
                9749 === e ||
                (e >= 9776 && e <= 9783) ||
                (e >= 9800 && e <= 9811) ||
                9855 === e ||
                (e >= 9866 && e <= 9871) ||
                9875 === e ||
                9889 === e ||
                9898 === e ||
                9899 === e ||
                9917 === e ||
                9918 === e ||
                9924 === e ||
                9925 === e ||
                9934 === e ||
                9940 === e ||
                9962 === e ||
                9970 === e ||
                9971 === e ||
                9973 === e ||
                9978 === e ||
                9981 === e ||
                9989 === e ||
                9994 === e ||
                9995 === e ||
                10024 === e ||
                10060 === e ||
                10062 === e ||
                (e >= 10067 && e <= 10069) ||
                10071 === e ||
                (e >= 10133 && e <= 10135) ||
                10160 === e ||
                10175 === e ||
                11035 === e ||
                11036 === e ||
                11088 === e ||
                11093 === e ||
                (e >= 11904 && e <= 11929) ||
                (e >= 11931 && e <= 12019) ||
                (e >= 12032 && e <= 12245) ||
                (e >= 12272 && e <= 12287) ||
                (e >= 12289 && e <= 12350) ||
                (e >= 12353 && e <= 12438) ||
                (e >= 12441 && e <= 12543) ||
                (e >= 12549 && e <= 12591) ||
                (e >= 12593 && e <= 12686) ||
                (e >= 12688 && e <= 12773) ||
                (e >= 12783 && e <= 12830) ||
                (e >= 12832 && e <= 12871) ||
                (e >= 12880 && e <= 42124) ||
                (e >= 42128 && e <= 42182) ||
                (e >= 43360 && e <= 43388) ||
                (e >= 44032 && e <= 55203) ||
                (e >= 63744 && e <= 64255) ||
                (e >= 65040 && e <= 65049) ||
                (e >= 65072 && e <= 65106) ||
                (e >= 65108 && e <= 65126) ||
                (e >= 65128 && e <= 65131) ||
                (e >= 94176 && e <= 94180) ||
                94192 === e ||
                94193 === e ||
                (e >= 94208 && e <= 100343) ||
                (e >= 100352 && e <= 101589) ||
                (e >= 101631 && e <= 101640) ||
                (e >= 110576 && e <= 110579) ||
                (e >= 110581 && e <= 110587) ||
                110589 === e ||
                110590 === e ||
                (e >= 110592 && e <= 110882) ||
                110898 === e ||
                (e >= 110928 && e <= 110930) ||
                110933 === e ||
                (e >= 110948 && e <= 110951) ||
                (e >= 110960 && e <= 111355) ||
                (e >= 119552 && e <= 119638) ||
                (e >= 119648 && e <= 119670) ||
                126980 === e ||
                127183 === e ||
                127374 === e ||
                (e >= 127377 && e <= 127386) ||
                (e >= 127488 && e <= 127490) ||
                (e >= 127504 && e <= 127547) ||
                (e >= 127552 && e <= 127560) ||
                127568 === e ||
                127569 === e ||
                (e >= 127584 && e <= 127589) ||
                (e >= 127744 && e <= 127776) ||
                (e >= 127789 && e <= 127797) ||
                (e >= 127799 && e <= 127868) ||
                (e >= 127870 && e <= 127891) ||
                (e >= 127904 && e <= 127946) ||
                (e >= 127951 && e <= 127955) ||
                (e >= 127968 && e <= 127984) ||
                127988 === e ||
                (e >= 127992 && e <= 128062) ||
                128064 === e ||
                (e >= 128066 && e <= 128252) ||
                (e >= 128255 && e <= 128317) ||
                (e >= 128331 && e <= 128334) ||
                (e >= 128336 && e <= 128359) ||
                128378 === e ||
                128405 === e ||
                128406 === e ||
                128420 === e ||
                (e >= 128507 && e <= 128591) ||
                (e >= 128640 && e <= 128709) ||
                128716 === e ||
                (e >= 128720 && e <= 128722) ||
                (e >= 128725 && e <= 128727) ||
                (e >= 128732 && e <= 128735) ||
                128747 === e ||
                128748 === e ||
                (e >= 128756 && e <= 128764) ||
                (e >= 128992 && e <= 129003) ||
                129008 === e ||
                (e >= 129292 && e <= 129338) ||
                (e >= 129340 && e <= 129349) ||
                (e >= 129351 && e <= 129535) ||
                (e >= 129648 && e <= 129660) ||
                (e >= 129664 && e <= 129673) ||
                (e >= 129679 && e <= 129734) ||
                (e >= 129742 && e <= 129756) ||
                (e >= 129759 && e <= 129769) ||
                (e >= 129776 && e <= 129784) ||
                (e >= 131072 && e <= 196605) ||
                (e >= 196608 && e <= 262141)
              );
            })(e)
          ),
        Rr = /[^\x20-\x7F]/u,
        Nr = function (e) {
          if (!e) return 0;
          if (!Rr.test(e)) return e.length;
          e = e.replace(
            /[#*0-9]\uFE0F?\u20E3|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26D3\uFE0F?(?:\u200D\uD83D\uDCA5)?|\u26F9(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF43\uDF45-\uDF4A\uDF4C-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDF44(?:\u200D\uD83D\uDFEB)?|\uDF4B(?:\u200D\uD83D\uDFE9)?|\uDFC3(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4\uDEB5](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE41\uDE43\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC08(?:\u200D\u2B1B)?|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC26(?:\u200D(?:\u2B1B|\uD83D\uDD25))?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE])))?))?|\uDC6F(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDD75(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?|\uDE42(?:\u200D[\u2194\u2195]\uFE0F?)?|\uDEB6(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE89\uDE8F-\uDEC2\uDEC6\uDECE-\uDEDC\uDEDF-\uDEE9]|\uDD3C(?:\u200D[\u2640\u2642]\uFE0F?|\uD83C[\uDFFB-\uDFFF])?|\uDDCE(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1|\uDDD1\u200D\uD83E\uDDD2(?:\u200D\uD83E\uDDD2)?|\uDDD2(?:\u200D\uD83E\uDDD2)?))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g,
            '  '
          );
          let t = 0;
          for (let r of e) {
            let e = r.codePointAt(0);
            e <= 31 || (e >= 127 && e <= 159) || (e >= 768 && e <= 879) || (t += Or(e) ? 1 : 2);
          }
          return t;
        },
        Ir = Symbol('MODE_BREAK'),
        Pr = Symbol('MODE_FLAT'),
        jr = Symbol('cursor'),
        zr = Symbol('DOC_FILL_PRINTED_LENGTH');
      function $r(e, t) {
        return Mr(e, { type: 'indent' }, t);
      }
      function Ur(e, t, r) {
        return t === Number.NEGATIVE_INFINITY
          ? e.root || { value: '', length: 0, queue: [] }
          : t < 0
            ? Mr(e, { type: 'dedent' }, r)
            : t
              ? 'root' === t.type
                ? { ...e, root: e }
                : Mr(e, { type: 'string' == typeof t ? 'stringAlign' : 'numberAlign', n: t }, r)
              : e;
      }
      function Mr(e, t, r) {
        let n = 'dedent' === t.type ? e.queue.slice(0, -1) : [...e.queue, t],
          u = '',
          i = 0,
          o = 0,
          a = 0;
        for (let e of n)
          switch (e.type) {
            case 'indent':
              c(), r.useTabs ? l(1) : s(r.tabWidth);
              break;
            case 'stringAlign':
              c(), (u += e.n), (i += e.n.length);
              break;
            case 'numberAlign':
              (o += 1), (a += e.n);
              break;
            default:
              throw new Error(`Unexpected type '${e.type}'`);
          }
        return D(), { ...e, value: u, length: i, queue: n };
        function l(e) {
          (u += '\t'.repeat(e)), (i += r.tabWidth * e);
        }
        function s(e) {
          (u += ' '.repeat(e)), (i += e);
        }
        function c() {
          r.useTabs ? (o > 0 && l(o), f()) : D();
        }
        function D() {
          a > 0 && s(a), f();
        }
        function f() {
          (o = 0), (a = 0);
        }
      }
      function Vr(e) {
        let t = 0,
          r = 0,
          n = e.length;
        e: for (; n--; ) {
          let u = e[n];
          if (u !== jr)
            for (let r = u.length - 1; r >= 0; r--) {
              let i = u[r];
              if (' ' !== i && '\t' !== i) {
                e[n] = u.slice(0, r + 1);
                break e;
              }
              t++;
            }
          else r++;
        }
        if (t > 0 || r > 0) for (e.length = n + 1; r-- > 0; ) e.push(jr);
        return t;
      }
      function _r(e, t, r, n, u, i) {
        if (r === Number.POSITIVE_INFINITY) return !0;
        let o = t.length,
          a = [e],
          l = [];
        for (; r >= 0; ) {
          if (0 === a.length) {
            if (0 === o) return !0;
            a.push(t[--o]);
            continue;
          }
          let { mode: e, doc: s } = a.pop(),
            c = yt(s);
          switch (c) {
            case at:
              l.push(s), (r -= Nr(s));
              break;
            case lt:
            case ht: {
              let t = c === lt ? s : s.parts,
                r = s[zr] ?? 0;
              for (let n = t.length - 1; n >= r; n--) a.push({ mode: e, doc: t[n] });
              break;
            }
            case ct:
            case Dt:
            case gt:
            case Et:
              a.push({ mode: e, doc: s.contents });
              break;
            case ft:
              r += Vr(l);
              break;
            case pt: {
              if (i && s.break) return !1;
              let t = s.break ? Ir : e,
                r = s.expandedStates && t === Ir ? nt(!1, s.expandedStates, -1) : s.contents;
              a.push({ mode: t, doc: r });
              break;
            }
            case dt: {
              let t =
                (s.groupId ? u[s.groupId] || Pr : e) === Ir ? s.breakContents : s.flatContents;
              t && a.push({ mode: e, doc: t });
              break;
            }
            case Ct:
              if (e === Ir || s.hard) return !0;
              s.soft || (l.push(' '), r--);
              break;
            case Ft:
              n = !0;
              break;
            case mt:
              if (n) return !1;
          }
        }
        return !1;
      }
      function Gr(e, t) {
        let r = {},
          n = t.printWidth,
          u = (function (e) {
            switch (e) {
              case 'cr':
                return '\r';
              case 'crlf':
                return '\r\n';
              default:
                return '\n';
            }
          })(t.endOfLine),
          i = 0,
          o = [{ ind: { value: '', length: 0, queue: [] }, mode: Ir, doc: e }],
          a = [],
          l = !1,
          s = [],
          c = 0;
        for (
          (function (e) {
            let t = new Set(),
              r = [];
            !(function (e, t, r, n) {
              let u = [e];
              for (; u.length > 0; ) {
                let e = u.pop();
                if (e === xt) {
                  r(u.pop());
                  continue;
                }
                r && u.push(e, xt);
                let i = yt(e);
                if (!i) throw new At(e);
                if (!1 !== (null == t ? void 0 : t(e)))
                  switch (i) {
                    case lt:
                    case ht: {
                      let t = i === lt ? e : e.parts;
                      for (let e = t.length - 1; e >= 0; --e) u.push(t[e]);
                      break;
                    }
                    case dt:
                      u.push(e.flatContents, e.breakContents);
                      break;
                    case pt:
                      if (n && e.expandedStates)
                        for (let t = e.expandedStates.length - 1; t >= 0; --t)
                          u.push(e.expandedStates[t]);
                      else u.push(e.contents);
                      break;
                    case Dt:
                    case ct:
                    case gt:
                    case Et:
                    case Ft:
                      u.push(e.contents);
                      break;
                    case at:
                    case st:
                    case ft:
                    case mt:
                    case Ct:
                    case bt:
                      break;
                    default:
                      throw new At(e);
                  }
              }
            })(
              e,
              function (e) {
                if ((e.type === bt && wt(r), e.type === pt)) {
                  if ((r.push(e), t.has(e))) return !1;
                  t.add(e);
                }
              },
              function (e) {
                e.type === pt && r.pop().break && wt(r);
              },
              !0
            );
          })(e);
          o.length > 0;
        ) {
          let { ind: e, mode: D, doc: f } = o.pop();
          switch (yt(f)) {
            case at: {
              let e = '\n' !== u ? ut(!1, f, '\n', u) : f;
              a.push(e), o.length > 0 && (i += Nr(e));
              break;
            }
            case lt:
              for (let t = f.length - 1; t >= 0; t--) o.push({ ind: e, mode: D, doc: f[t] });
              break;
            case st:
              if (c >= 2) throw new Error("There are too many 'cursor' in doc.");
              a.push(jr), c++;
              break;
            case ct:
              o.push({ ind: $r(e, t), mode: D, doc: f.contents });
              break;
            case Dt:
              o.push({ ind: Ur(e, f.n, t), mode: D, doc: f.contents });
              break;
            case ft:
              i -= Vr(a);
              break;
            case pt:
              switch (D) {
                case Pr:
                  if (!l) {
                    o.push({ ind: e, mode: f.break ? Ir : Pr, doc: f.contents });
                    break;
                  }
                case Ir: {
                  l = !1;
                  let t = { ind: e, mode: Pr, doc: f.contents },
                    u = n - i,
                    a = s.length > 0;
                  if (!f.break && _r(t, o, u, a, r)) o.push(t);
                  else if (f.expandedStates) {
                    let t = nt(!1, f.expandedStates, -1);
                    if (f.break) {
                      o.push({ ind: e, mode: Ir, doc: t });
                      break;
                    }
                    for (let n = 1; n < f.expandedStates.length + 1; n++) {
                      if (n >= f.expandedStates.length) {
                        o.push({ ind: e, mode: Ir, doc: t });
                        break;
                      }
                      {
                        let t = f.expandedStates[n],
                          i = { ind: e, mode: Pr, doc: t };
                        if (_r(i, o, u, a, r)) {
                          o.push(i);
                          break;
                        }
                      }
                    }
                  } else o.push({ ind: e, mode: Ir, doc: f.contents });
                  break;
                }
              }
              f.id && (r[f.id] = nt(!1, o, -1).mode);
              break;
            case ht: {
              let t = n - i,
                u = f[zr] ?? 0,
                { parts: a } = f,
                l = a.length - u;
              if (0 === l) break;
              let c = a[u + 0],
                p = a[u + 1],
                h = { ind: e, mode: Pr, doc: c },
                d = { ind: e, mode: Ir, doc: c },
                g = _r(h, [], t, s.length > 0, r, !0);
              if (1 === l) {
                g ? o.push(h) : o.push(d);
                break;
              }
              let F = { ind: e, mode: Pr, doc: p },
                m = { ind: e, mode: Ir, doc: p };
              if (2 === l) {
                g ? o.push(F, h) : o.push(m, d);
                break;
              }
              let C = a[u + 2],
                E = { ind: e, mode: D, doc: { ...f, [zr]: u + 2 } };
              _r({ ind: e, mode: Pr, doc: [c, p, C] }, [], t, s.length > 0, r, !0)
                ? o.push(E, F, h)
                : g
                  ? o.push(E, m, h)
                  : o.push(E, m, d);
              break;
            }
            case dt:
            case gt: {
              let t = f.groupId ? r[f.groupId] : D;
              if (t === Ir) {
                let t = f.type === dt ? f.breakContents : f.negate ? f.contents : Lt(f.contents);
                t && o.push({ ind: e, mode: D, doc: t });
              }
              if (t === Pr) {
                let t = f.type === dt ? f.flatContents : f.negate ? Lt(f.contents) : f.contents;
                t && o.push({ ind: e, mode: D, doc: t });
              }
              break;
            }
            case Ft:
              s.push({ ind: e, mode: D, doc: f.contents });
              break;
            case mt:
              s.length > 0 && o.push({ ind: e, mode: D, doc: zt });
              break;
            case Ct:
              switch (D) {
                case Pr:
                  if (!f.hard) {
                    f.soft || (a.push(' '), (i += 1));
                    break;
                  }
                  l = !0;
                case Ir:
                  if (s.length > 0) {
                    o.push({ ind: e, mode: D, doc: f }, ...s.reverse()), (s.length = 0);
                    break;
                  }
                  f.literal
                    ? e.root
                      ? (a.push(u, e.root.value), (i = e.root.length))
                      : (a.push(u), (i = 0))
                    : ((i -= Vr(a)), a.push(u + e.value), (i = e.length));
              }
              break;
            case Et:
              o.push({ ind: e, mode: D, doc: f.contents });
              break;
            case bt:
              break;
            default:
              throw new At(f);
          }
          0 === o.length && s.length > 0 && (o.push(...s.reverse()), (s.length = 0));
        }
        let D = a.indexOf(jr);
        if (-1 !== D) {
          let e = a.indexOf(jr, D + 1);
          if (-1 === e) return { formatted: a.filter((e) => e !== jr).join('') };
          let t = a.slice(0, D).join(''),
            r = a.slice(D + 1, e).join('');
          return {
            formatted: t + r + a.slice(e + 1).join(''),
            cursorNodeStart: t.length,
            cursorNodeText: r,
          };
        }
        return { formatted: a.join('') };
      }
      Tr = new WeakMap();
      var Wr = new (class {
          constructor(e) {
            ((e, t) => {
              t.has(e)
                ? s('Cannot add the same private member more than once')
                : t instanceof WeakSet
                  ? t.add(e)
                  : t.set(e, void 0);
            })(this, Tr),
              ((e, t, r) => {
                p(e, t, 'write to private field'), t.set(e, r);
              })(this, Tr, new Set(e));
          }
          getLeadingWhitespaceCount(e) {
            let t = h(this, Tr),
              r = 0;
            for (let n = 0; n < e.length && t.has(e.charAt(n)); n++) r++;
            return r;
          }
          getTrailingWhitespaceCount(e) {
            let t = h(this, Tr),
              r = 0;
            for (let n = e.length - 1; n >= 0 && t.has(e.charAt(n)); n--) r++;
            return r;
          }
          getLeadingWhitespace(e) {
            let t = this.getLeadingWhitespaceCount(e);
            return e.slice(0, t);
          }
          getTrailingWhitespace(e) {
            let t = this.getTrailingWhitespaceCount(e);
            return e.slice(e.length - t);
          }
          hasLeadingWhitespace(e) {
            return h(this, Tr).has(e.charAt(0));
          }
          hasTrailingWhitespace(e) {
            return h(this, Tr).has(nt(!1, e, -1));
          }
          trimStart(e) {
            let t = this.getLeadingWhitespaceCount(e);
            return e.slice(t);
          }
          trimEnd(e) {
            let t = this.getTrailingWhitespaceCount(e);
            return e.slice(0, e.length - t);
          }
          trim(e) {
            return this.trimEnd(this.trimStart(e));
          }
          split(e, t = !1) {
            let r = `[${ot([...h(this, Tr)].join(''))}]+`,
              n = new RegExp(t ? `(${r})` : r, 'u');
            return e.split(n);
          }
          hasWhitespaceCharacter(e) {
            let t = h(this, Tr);
            return Array.prototype.some.call(e, (e) => t.has(e));
          }
          hasNonWhitespaceCharacter(e) {
            let t = h(this, Tr);
            return Array.prototype.some.call(e, (e) => !t.has(e));
          }
          isWhitespaceOnly(e) {
            let t = h(this, Tr);
            return Array.prototype.every.call(e, (e) => t.has(e));
          }
        })(['\t', '\n', '\f', '\r', ' ']),
        Hr = /^\\?.$/su,
        Jr = /^\n *>[ >]*$/u,
        Zr = new Set(['heading', 'tableCell', 'link', 'wikiLink']),
        Yr = new Set('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~');
      function Kr(e) {
        return e === Cr || e === br;
      }
      function Qr(e, t, r, n) {
        if ('preserve' === r && '\n' === t) return Mt;
        let u =
          ' ' === t ||
          ('\n' === t &&
            (function (e, t) {
              if (t) return !0;
              let { previous: r, next: n } = e;
              if (!r || !n) return !0;
              let u = r.kind,
                i = n.kind;
              return (
                !!((Kr(u) && Kr(i)) || (u === br && i === Er) || (i === br && u === Er)) ||
                (u !== vr &&
                  i !== vr &&
                  (u !== Er || i !== Er) &&
                  (!(!Yr.has(n.value[0]) && !Yr.has(nt(!1, r.value, -1))) ||
                    (!r.hasTrailingPunctuation &&
                      !n.hasLeadingPunctuation &&
                      (function ({ parent: e }) {
                        if (void 0 === e.usesCJSpaces) {
                          let t = { ' ': 0, '': 0 },
                            { children: r } = e;
                          for (let e = 1; e < r.length - 1; ++e) {
                            let n = r[e];
                            if ('whitespace' === n.type && (' ' === n.value || '' === n.value)) {
                              let u = r[e - 1].kind,
                                i = r[e + 1].kind;
                              ((u === Er && i === Cr) || (u === Cr && i === Er)) && ++t[n.value];
                            }
                          }
                          e.usesCJSpaces = t[' '] > t[''];
                        }
                        return e.usesCJSpaces;
                      })(e))))
              );
            })(e, n));
        return (function (e, t, r, n) {
          if ('always' !== r || e.hasAncestor((e) => Zr.has(e.type))) return !1;
          if (n) return '' !== t;
          let { previous: u, next: i } = e;
          return (
            !u ||
            !i ||
            ('' !== t &&
              ((u.kind === br && i.kind === Er) ||
                (i.kind === br && u.kind === Er) ||
                !(u.isCJ || i.isCJ)))
          );
        })(e, t, r, n)
          ? u
            ? $t
            : Ut
          : u
            ? ' '
            : '';
      }
      var Xr = new Set(['listItem', 'definition']);
      function en(e) {
        var t, r;
        let { previous: n, next: u } = e;
        return (
          ('sentence' === (null == n ? void 0 : n.type) &&
            'word' === (null == (t = nt(!1, n.children, -1)) ? void 0 : t.type) &&
            !nt(!1, n.children, -1).hasTrailingPunctuation) ||
          ('sentence' === (null == u ? void 0 : u.type) &&
            'word' === (null == (r = u.children[0]) ? void 0 : r.type) &&
            !u.children[0].hasLeadingPunctuation)
        );
      }
      function tn(e, t, r, n) {
        let { node: u } = e,
          i = null === u.checked ? '' : u.checked ? '[x] ' : '[ ] ';
        return [
          i,
          un(e, t, r, {
            processor({ node: e, isFirst: u }) {
              if (u && 'list' !== e.type) return Ot(' '.repeat(i.length), r());
              let o = ' '.repeat(
                (function (e) {
                  return Math.max(0, Math.min(e, 3));
                })(t.tabWidth - n.length)
              );
              return [o, Ot(o, r())];
            },
          }),
        ];
      }
      function rn(e, t) {
        return (function (e, t, r) {
          let n = -1;
          for (let u of t.children)
            if ((u.type === e.type && r(u) ? n++ : (n = -1), u === e)) return n;
        })(e, t, (t) => t.ordered === e.ordered);
      }
      function nn(e, t, r) {
        let n = [],
          u = null,
          { children: i } = e.node;
        for (let [e, t] of i.entries())
          switch (an(t)) {
            case 'start':
              null === u && (u = { index: e, offset: t.position.end.offset });
              break;
            case 'end':
              null !== u &&
                (n.push({ start: u, end: { index: e, offset: t.position.start.offset } }),
                (u = null));
          }
        return un(e, t, r, {
          processor({ index: e }) {
            if (n.length > 0) {
              let r = n[0];
              if (e === r.start.index)
                return [
                  on(i[r.start.index]),
                  t.originalText.slice(r.start.offset, r.end.offset),
                  on(i[r.end.index]),
                ];
              if (r.start.index < e && e < r.end.index) return !1;
              if (e === r.end.index) return n.shift(), !1;
            }
            return r();
          },
        });
      }
      function un(e, t, r, n = {}) {
        let { processor: u = r } = n,
          i = [];
        return (
          e.each(() => {
            let r = u(e);
            !1 !== r &&
              (i.length > 0 &&
                (function ({ node: e, parent: t }) {
                  let r = Fr.has(e.type),
                    n = 'html' === e.type && mr.has(t.type);
                  return !r && !n;
                })(e) &&
                (i.push(Mt),
                ((function ({ node: e, previous: t, parent: r }, n) {
                  if (ln(t, n) || ('list' === e.type && 'listItem' === r.type && 'code' === t.type))
                    return !0;
                  let u = t.type === e.type && Xr.has(e.type),
                    i = 'listItem' === r.type && ('list' === e.type || !ln(r, n)),
                    o = 'next' === an(t),
                    a =
                      'html' === e.type &&
                      'html' === t.type &&
                      t.position.end.line + 1 === e.position.start.line,
                    l =
                      'html' === e.type &&
                      'listItem' === r.type &&
                      'paragraph' === t.type &&
                      t.position.end.line + 1 === e.position.start.line;
                  return !(u || i || o || a || l);
                })(e, t) ||
                  sn(e)) &&
                  i.push(Mt),
                sn(e) && i.push(Mt)),
              i.push(r));
          }, 'children'),
          i
        );
      }
      function on(e) {
        return 'html' === e.type
          ? e.value
          : 'paragraph' === e.type &&
              Array.isArray(e.children) &&
              1 === e.children.length &&
              'esComment' === e.children[0].type
            ? ['{/* ', e.children[0].value, ' */}']
            : void 0;
      }
      function an(e) {
        let t;
        if ('html' === e.type)
          t = e.value.match(/^<!--\s*prettier-ignore(?:-(start|end))?\s*-->$/u);
        else {
          let r;
          'esComment' === e.type
            ? (r = e)
            : 'paragraph' === e.type &&
              1 === e.children.length &&
              'esComment' === e.children[0].type &&
              (r = e.children[0]),
            r && (t = r.value.match(/^prettier-ignore(?:-(start|end))?$/u));
        }
        return !!t && (t[1] || 'next');
      }
      function ln(e, t) {
        return (
          'listItem' === e.type &&
          (e.spread || '\n' === t.originalText.charAt(e.position.end.offset - 1))
        );
      }
      function sn({ node: e, previous: t }) {
        let r = 'list' === t.type,
          n = 'code' === e.type && e.isIndented;
        return r && n;
      }
      function cn(e, t = []) {
        let r = [' ', ...(Array.isArray(t) ? t : [t])];
        return new RegExp(r.map((e) => ot(e)).join('|'), 'u').test(e)
          ? `<${((e, t) => {
              for (let r of t) e = ut(!1, e, r, encodeURIComponent(r));
              return e;
            })(e, '<>')}>`
          : e;
      }
      function Dn(e, t, r = !0) {
        if (!e) return '';
        if (r) return ' ' + Dn(e, t, !1);
        if (
          (e = ut(!1, e, /\\(?=["')])/gu, '')).includes('"') &&
          e.includes("'") &&
          !e.includes(')')
        )
          return `(${e})`;
        let n = (function (e, t) {
          let r = !0 === t || t === Wt ? Wt : '"',
            n = r === Wt ? '"' : Wt,
            u = 0,
            i = 0;
          for (let t of e) t === r ? u++ : t === n && i++;
          return u > i ? n : r;
        })(e, t.singleQuote);
        return (e = ut(!1, e, '\\', '\\\\')), `${n}${(e = ut(!1, e, n, `\\${n}`))}${n}`;
      }
      function fn(e) {
        return `[${(0, it.default)(e.label)}]`;
      }
      function pn(e) {
        return `[^${e.label}]`;
      }
      var hn = {
          preprocess: function (e, t) {
            return (function (e) {
              return kr(e, (e, t, [r]) => {
                if ('text' !== e.type) return e;
                let { value: n } = e;
                return (
                  'paragraph' === r.type &&
                    (0 === t && (n = Wr.trimStart(n)),
                    t === r.children.length - 1 && (n = Wr.trimEnd(n))),
                  { type: 'sentence', position: e.position, children: Ar(n) }
                );
              });
            })(
              (e = (function (e, t) {
                return kr(e, (e, n, u) => {
                  if ('list' === e.type && e.children.length > 0) {
                    for (let t = 0; t < u.length; t++) {
                      let r = u[t];
                      if ('list' === r.type && !r.isAligned) return (e.isAligned = !1), e;
                    }
                    e.isAligned = (function (e) {
                      if (!e.ordered) return !0;
                      let [n, u] = e.children;
                      if (xr(n, t).leadingSpaces.length > 1) return !0;
                      let i = r(n);
                      return (
                        -1 !== i &&
                        (1 === e.children.length
                          ? i % t.tabWidth === 0
                          : i === r(u) &&
                            (i % t.tabWidth === 0 || xr(u, t).leadingSpaces.length > 1))
                      );
                    })(e);
                  }
                  return e;
                });
                function r(e) {
                  return 0 === e.children.length ? -1 : e.children[0].position.start.column - 1;
                }
              })(
                (e = (function (e, t) {
                  return kr(e, (e, r, n) => {
                    if ('code' === e.type) {
                      let r = /^\n?(?: {4,}|\t)/u.test(
                        t.originalText.slice(e.position.start.offset, e.position.end.offset)
                      );
                      if (((e.isIndented = r), r))
                        for (let e = 0; e < n.length; e++) {
                          let t = n[e];
                          if (t.hasIndentedCodeblock) break;
                          'list' === t.type && (t.hasIndentedCodeblock = !0);
                        }
                    }
                    return e;
                  });
                })(
                  (e = (function (e) {
                    return (function (e) {
                      return kr(e, (e) => {
                        if (!e.children) return e;
                        let t = e.children.reduce((e, t) => {
                          let r = nt(!1, e, -1);
                          return (
                            r && ((e, t) => 'text' === e.type && 'text' === t.type)(r, t)
                              ? e.splice(
                                  -1,
                                  1,
                                  ((e, t) => ({
                                    type: 'text',
                                    value: e.value + t.value,
                                    position: { start: e.position.start, end: t.position.end },
                                  }))(r, t)
                                )
                              : e.push(t),
                            e
                          );
                        }, []);
                        return { ...e, children: t };
                      });
                    })(e);
                  })(
                    (e = (function (e, t) {
                      return kr(e, (e) => {
                        if ('text' !== e.type) return e;
                        let { value: r } = e;
                        if (
                          '*' === r ||
                          '_' === r ||
                          !Hr.test(r) ||
                          e.position.end.offset - e.position.start.offset === r.length
                        )
                          return e;
                        let n = t.originalText.slice(
                          e.position.start.offset,
                          e.position.end.offset
                        );
                        return Jr.test(n) ? e : { ...e, value: n };
                      });
                    })(e, t))
                  )),
                  t
                )),
                t
              ))
            );
          },
          print: function (e, t, r) {
            var n;
            let { node: u } = e;
            if (
              (function (e) {
                let t = e.findAncestor(
                  (e) => 'linkReference' === e.type || 'imageReference' === e.type
                );
                return t && ('linkReference' !== t.type || 'full' !== t.referenceType);
              })(e)
            ) {
              let r = [''],
                n = Ar(t.originalText.slice(u.position.start.offset, u.position.end.offset));
              for (let u of n) {
                if ('word' === u.type) {
                  r.push([r.pop(), u.value]);
                  continue;
                }
                let n = Qr(e, u.value, t.proseWrap, !0);
                yt(n) !== at ? r.push(n, '') : r.push([r.pop(), n]);
              }
              return It(r);
            }
            switch (u.type) {
              case 'front-matter':
                return t.originalText.slice(u.position.start.offset, u.position.end.offset);
              case 'root':
                return 0 === u.children.length ? '' : [nn(e, t, r), Mt];
              case 'paragraph':
                return (function (e, t, r) {
                  return (function (e) {
                    let t = [''];
                    return (
                      (function e(r) {
                        for (let n of r) {
                          let r = yt(n);
                          if (r === lt) {
                            e(n);
                            continue;
                          }
                          let u = n,
                            i = [];
                          r === ht && ([u, ...i] = n.parts), t.push([t.pop(), u], ...i);
                        }
                      })(e),
                      It(t)
                    );
                  })(e.map(r, 'children'));
                })(e, 0, r);
              case 'sentence':
                return (function (e, t) {
                  let r = [''];
                  return (
                    e.each(() => {
                      let { node: n } = e,
                        u = t();
                      switch (n.type) {
                        case 'whitespace':
                          if (yt(u) !== at) {
                            r.push(u, '');
                            break;
                          }
                        default:
                          r.push([r.pop(), u]);
                      }
                    }, 'children'),
                    It(r)
                  );
                })(e, r);
              case 'word': {
                let t = ut(
                    !1,
                    ut(!1, u.value, '*', String.raw`\*`),
                    new RegExp([`(^|${lr.source})(_+)`, `(_+)(${lr.source}|$)`].join('|'), 'gu'),
                    (e, t, r, n, u) => ut(!1, r ? `${t}${r}` : `${n}${u}`, '_', String.raw`\_`)
                  ),
                  r = (e, t, r) => 'sentence' === e.type && 0 === r,
                  n = (e, t, r) => Br(e.children[r - 1]);
                return (
                  t !== u.value &&
                    (e.match(void 0, r, n) ||
                      e.match(void 0, r, (e, t, r) => 'emphasis' === e.type && 0 === r, n)) &&
                    (t = t.replace(/^(\\?[*_])+/u, (e) => ut(!1, e, '\\', ''))),
                  t
                );
              }
              case 'whitespace': {
                let { next: r } = e,
                  n = r && /^>|^(?:[*+-]|#{1,6}|\d+[).])$/u.test(r.value) ? 'never' : t.proseWrap;
                return Qr(e, u.value, n);
              }
              case 'emphasis': {
                let i;
                if (Br(u.children[0])) i = t.originalText[u.position.start.offset];
                else {
                  let t = en(e),
                    r = 'strong' === (null == (n = e.parent) ? void 0 : n.type) && en(e.ancestors);
                  i = t || r || e.hasAncestor((e) => 'emphasis' === e.type) ? '*' : '_';
                }
                return [i, un(e, t, r), i];
              }
              case 'strong':
                return ['**', un(e, t, r), '**'];
              case 'delete':
                return ['~~', un(e, t, r), '~~'];
              case 'inlineCode': {
                let e = 'preserve' === t.proseWrap ? u.value : ut(!1, u.value, '\n', ' '),
                  r = (function (e, t) {
                    let r = e.match(new RegExp(`(${ot(t)})+`, 'gu'));
                    if (null === r) return 0;
                    let n = new Map(),
                      u = 0;
                    for (let e of r) {
                      let r = e.length / t.length;
                      n.set(r, !0), r > u && (u = r);
                    }
                    for (let e = 1; e < u; e++) if (!n.get(e)) return e;
                    return u + 1;
                  })(e, '`'),
                  n = '`'.repeat(r || 1),
                  i =
                    e.startsWith('`') ||
                    e.endsWith('`') ||
                    (/^[\n ]/u.test(e) && /[\n ]$/u.test(e) && /[^\n ]/u.test(e))
                      ? ' '
                      : '';
                return [n, i, e, i, n];
              }
              case 'wikiLink': {
                let e = '';
                return (
                  (e = 'preserve' === t.proseWrap ? u.value : ut(!1, u.value, /[\t\n]+/gu, ' ')),
                  ['[[', e, ']]']
                );
              }
              case 'link':
                switch (t.originalText[u.position.start.offset]) {
                  case '<': {
                    let e = 'mailto:';
                    return [
                      '<',
                      u.url.startsWith(e) &&
                      t.originalText.slice(
                        u.position.start.offset + 1,
                        u.position.start.offset + 1 + e.length
                      ) !== e
                        ? u.url.slice(e.length)
                        : u.url,
                      '>',
                    ];
                  }
                  case '[':
                    return ['[', un(e, t, r), '](', cn(u.url, ')'), Dn(u.title, t), ')'];
                  default:
                    return t.originalText.slice(u.position.start.offset, u.position.end.offset);
                }
              case 'image':
                return ['![', u.alt || '', '](', cn(u.url, ')'), Dn(u.title, t), ')'];
              case 'blockquote':
                return ['> ', Ot('> ', un(e, t, r))];
              case 'heading':
                return ['#'.repeat(u.depth) + ' ', un(e, t, r)];
              case 'code': {
                if (u.isIndented) {
                  let e = ' '.repeat(4);
                  return Ot(e, [e, kt(u.value, Mt)]);
                }
                let e = t.__inJsTemplate ? '~' : '`',
                  r = e.repeat(Math.max(3, Gt(u.value, e) + 1));
                return [
                  r,
                  u.lang || '',
                  u.meta ? ' ' + u.meta : '',
                  Mt,
                  kt(wr(u, t.originalText), Mt),
                  Mt,
                  r,
                ];
              }
              case 'html': {
                let { parent: t, isLast: r } = e,
                  n = 'root' === t.type && r ? u.value.trimEnd() : u.value;
                return kt(n, /^<!--.*-->$/su.test(n) ? Mt : Nt(Vt));
              }
              case 'list': {
                let n = rn(u, e.parent),
                  i = (function (e, t) {
                    return (
                      !(!e.ordered || e.children.length < 2 || 1 !== xr(e.children[1], t).number) &&
                      (0 !== xr(e.children[0], t).number ||
                        (e.children.length > 2 && 1 === xr(e.children[2], t).number))
                    );
                  })(u, t);
                return un(e, t, r, {
                  processor(e) {
                    let o = (function () {
                        let r = u.ordered
                          ? (e.isFirst ? u.start : i ? 1 : u.start + e.index) +
                            (n % 2 == 0 ? '. ' : ') ')
                          : n % 2 == 0
                            ? '- '
                            : '* ';
                        return (u.isAligned || u.hasIndentedCodeblock) && u.ordered
                          ? (function (e, t) {
                              let r = (function () {
                                let r = e.length % t.tabWidth;
                                return 0 === r ? 0 : t.tabWidth - r;
                              })();
                              return e + ' '.repeat(r >= 4 ? 0 : r);
                            })(r, t)
                          : r;
                      })(),
                      a = e.node;
                    return 2 === a.children.length &&
                      'html' === a.children[1].type &&
                      a.children[0].position.start.column !== a.children[1].position.start.column
                      ? [o, tn(e, t, r, o)]
                      : [o, Ot(' '.repeat(o.length), tn(e, t, r, o))];
                  },
                });
              }
              case 'thematicBreak': {
                let { ancestors: t } = e,
                  r = t.findIndex((e) => 'list' === e.type);
                return -1 === r ? '---' : rn(t[r], t[r + 1]) % 2 == 0 ? '***' : '---';
              }
              case 'linkReference':
                return [
                  '[',
                  un(e, t, r),
                  ']',
                  'full' === u.referenceType ? fn(u) : 'collapsed' === u.referenceType ? '[]' : '',
                ];
              case 'imageReference':
                return 'full' === u.referenceType
                  ? ['![', u.alt || '', ']', fn(u)]
                  : ['![', u.alt, ']', 'collapsed' === u.referenceType ? '[]' : ''];
              case 'definition': {
                let e = 'always' === t.proseWrap ? $t : ' ';
                return Rt([
                  fn(u),
                  ':',
                  Lt([e, cn(u.url), null === u.title ? '' : [e, Dn(u.title, t, !1)]]),
                ]);
              }
              case 'footnote':
                return ['[^', un(e, t, r), ']'];
              case 'footnoteReference':
                return pn(u);
              case 'footnoteDefinition': {
                let n =
                  1 === u.children.length &&
                  'paragraph' === u.children[0].type &&
                  ('never' === t.proseWrap ||
                    ('preserve' === t.proseWrap &&
                      u.children[0].position.start.line === u.children[0].position.end.line));
                return [
                  pn(u),
                  ': ',
                  n
                    ? un(e, t, r)
                    : Rt([
                        Ot(
                          ' '.repeat(4),
                          un(e, t, r, { processor: ({ isFirst: e }) => (e ? Rt([Ut, r()]) : r()) })
                        ),
                      ]),
                ];
              }
              case 'table':
                return (function (e, t, r) {
                  let { node: n } = e,
                    u = [],
                    i = e.map(
                      () =>
                        e.map(({ index: e }) => {
                          let n = Gr(r(), t).formatted,
                            i = Nr(n);
                          return (u[e] = Math.max(u[e] ?? 3, i)), { text: n, width: i };
                        }, 'children'),
                      'children'
                    ),
                    o = l(!1);
                  if ('never' !== t.proseWrap) return [jt, o];
                  let a = l(!0);
                  return [jt, Rt(Pt(a, o))];
                  function l(e) {
                    return _t(
                      zt,
                      [c(i[0], e), s(e), ...i.slice(1).map((t) => c(t, e))].map(
                        (e) => `| ${e.join(' | ')} |`
                      )
                    );
                  }
                  function s(e) {
                    return u.map((t, r) => {
                      let u = n.align[r],
                        i = 'center' === u || 'right' === u ? ':' : '-';
                      return `${'center' === u || 'left' === u ? ':' : '-'}${e ? '-' : '-'.repeat(t - 2)}${i}`;
                    });
                  }
                  function c(e, t) {
                    return e.map(({ text: e, width: r }, i) => {
                      if (t) return e;
                      let o = u[i] - r,
                        a = n.align[i],
                        l = 0;
                      'right' === a ? (l = o) : 'center' === a && (l = Math.floor(o / 2));
                      let s = o - l;
                      return `${' '.repeat(l)}${e}${' '.repeat(s)}`;
                    });
                  }
                })(e, t, r);
              case 'tableCell':
                return un(e, t, r);
              case 'break':
                return /\s/u.test(t.originalText[u.position.start.offset])
                  ? ['  ', Nt(Vt)]
                  : ['\\', Mt];
              case 'liquidNode':
                return kt(u.value, Mt);
              case 'import':
              case 'export':
              case 'jsx':
                return u.value;
              case 'esComment':
                return ['{/* ', u.value, ' */}'];
              case 'math':
                return ['$$', Mt, u.value ? [kt(u.value, Mt), Mt] : '', '$$'];
              case 'inlineMath':
                return t.originalText.slice(dr(u), gr(u));
              default:
                throw new Ht(u, 'Markdown');
            }
          },
          embed: function (e, t) {
            let { node: r } = e;
            if ('code' === r.type && null !== r.lang) {
              let e = pr(t, { language: r.lang });
              if (e)
                return async (n) => {
                  let u = t.__inJsTemplate ? '~' : '`',
                    i = u.repeat(Math.max(3, Gt(r.value, u) + 1)),
                    o = { parser: e };
                  'ts' === r.lang || 'typescript' === r.lang
                    ? (o.filepath = 'dummy.ts')
                    : 'tsx' === r.lang && (o.filepath = 'dummy.tsx');
                  let a = await n(wr(r, t.originalText), o);
                  return Nt([i, r.lang, r.meta ? ' ' + r.meta : '', Mt, kt(a), Mt, i]);
                };
            }
            switch (r.type) {
              case 'front-matter':
                return (e) =>
                  (async function (e, t) {
                    if ('yaml' === e.language) {
                      let r = e.value.trim(),
                        n = r ? await t(r, { parser: 'yaml' }) : '';
                      return Nt([
                        e.startDelimiter,
                        e.explicitLanguage,
                        Mt,
                        n,
                        n ? Mt : '',
                        e.endDelimiter,
                      ]);
                    }
                  })(r, e);
              case 'import':
              case 'export':
                return (e) => e(r.value, { parser: 'babel' });
              case 'jsx':
                return (e) =>
                  e(`<$>${r.value}</$>`, { parser: '__js_expression', rootMarker: 'mdx' });
            }
            return null;
          },
          massageAstNode: or,
          hasPrettierIgnore: function (e) {
            return e.index > 0 && 'next' === an(e.previous);
          },
          insertPragma: (e) => {
            let t = Kt(e),
              r = '\x3c!-- @format --\x3e';
            return t.frontMatter
              ? `${t.frontMatter.raw}\n\n${r}\n\n${t.content}`
              : `${r}\n\n${t.content}`;
          },
          getVisitorKeys: Lr,
        },
        dn = [
          {
            name: 'Markdown',
            type: 'prose',
            extensions: [
              '.md',
              '.livemd',
              '.markdown',
              '.mdown',
              '.mdwn',
              '.mkd',
              '.mkdn',
              '.mkdown',
              '.ronn',
              '.scd',
              '.workbook',
            ],
            tmScope: 'text.md',
            aceMode: 'markdown',
            aliases: ['md', 'pandoc'],
            codemirrorMode: 'gfm',
            codemirrorMimeType: 'text/x-gfm',
            filenames: ['contents.lr', 'README'],
            wrap: !0,
            parsers: ['markdown'],
            vscodeLanguageIds: ['markdown'],
            linguistLanguageId: 222,
          },
          {
            name: 'MDX',
            type: 'prose',
            extensions: ['.mdx'],
            tmScope: 'text.md',
            aceMode: 'markdown',
            aliases: ['md', 'pandoc'],
            codemirrorMode: 'gfm',
            codemirrorMimeType: 'text/x-gfm',
            filenames: [],
            wrap: !0,
            parsers: ['mdx'],
            vscodeLanguageIds: ['mdx'],
            linguistLanguageId: 222,
          },
        ],
        gn = {
          bracketSpacing: {
            category: 'Common',
            type: 'boolean',
            default: !0,
            description: 'Print spaces between brackets.',
            oppositeDescription: 'Do not print spaces between brackets.',
          },
          objectWrap: {
            category: 'Common',
            type: 'choice',
            default: 'preserve',
            description: 'How to wrap object literals.',
            choices: [
              {
                value: 'preserve',
                description:
                  'Keep as multi-line, if there is a newline between the opening brace and first property.',
              },
              { value: 'collapse', description: 'Fit to a single line when possible.' },
            ],
          },
          singleQuote: {
            category: 'Common',
            type: 'boolean',
            default: !1,
            description: 'Use single quotes instead of double quotes.',
          },
          proseWrap: {
            category: 'Common',
            type: 'choice',
            default: 'preserve',
            description: 'How to wrap prose.',
            choices: [
              { value: 'always', description: 'Wrap prose if it exceeds the print width.' },
              { value: 'never', description: 'Do not wrap prose.' },
              { value: 'preserve', description: 'Wrap prose as-is.' },
            ],
          },
          bracketSameLine: {
            category: 'Common',
            type: 'boolean',
            default: !1,
            description: 'Put > of opening tags on the last line instead of on a new line.',
          },
          singleAttributePerLine: {
            category: 'Common',
            type: 'boolean',
            default: !1,
            description: 'Enforce single attribute per line in HTML, Vue and JSX.',
          },
        },
        Fn = { proseWrap: gn.proseWrap, singleQuote: gn.singleQuote },
        mn = {};
      D(mn, { markdown: () => $n, mdx: () => Un, remark: () => $n });
      var Cn = f(g(), 1),
        En = f(E(), 1),
        bn = f(Ue(), 1),
        vn = f(tt(), 1),
        yn = /^import\s/u,
        An = /^export\s/u,
        xn = String.raw`[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*|`,
        wn = /<!---->|<!---?[^>-](?:-?[^-])*-->/u,
        kn = /^\{\s*\/\*(.*)\*\/\s*\}/u,
        Bn = (e) => yn.test(e),
        qn = (e) => An.test(e),
        Sn = (e, t) => {
          let r = t.indexOf('\n\n'),
            n = t.slice(0, r);
          if (qn(n) || Bn(n)) return e(n)({ type: qn(n) ? 'export' : 'import', value: n });
        },
        Tn = (e, t) => {
          let r = kn.exec(t);
          if (r) return e(r[0])({ type: 'esComment', value: r[1].trim() });
        };
      (Sn.locator = (e) => (qn(e) || Bn(e) ? -1 : 1)), (Tn.locator = (e, t) => e.indexOf('{', t));
      var Ln = function () {
          let { Parser: e } = this,
            {
              blockTokenizers: t,
              blockMethods: r,
              inlineTokenizers: n,
              inlineMethods: u,
            } = e.prototype;
          (t.esSyntax = Sn),
            (n.esComment = Tn),
            r.splice(r.indexOf('paragraph'), 0, 'esSyntax'),
            u.splice(u.indexOf('text'), 0, 'esComment');
        },
        On = function () {
          let e = this.Parser.prototype;
          function t(e, t) {
            let r = Kt(t);
            if (r.frontMatter) return e(r.frontMatter.raw)(r.frontMatter);
          }
          (e.blockMethods = ['frontMatter', ...e.blockMethods]),
            (e.blockTokenizers.frontMatter = t),
            (t.onlyAtStart = !0);
        },
        Rn = function () {
          return (e) =>
            kr(e, (e, t, [r]) =>
              'html' !== e.type || wn.test(e.value) || mr.has(r.type) ? e : { ...e, type: 'jsx' }
            );
        },
        Nn = function () {
          let e = this.Parser.prototype,
            t = e.inlineMethods;
          function r(e, t) {
            let r = t.match(/^(\{%.*?%\}|\{\{.*?\}\})/su);
            if (r) return e(r[0])({ type: 'liquidNode', value: r[0] });
          }
          t.splice(t.indexOf('text'), 0, 'liquid'),
            (e.inlineTokenizers.liquid = r),
            (r.locator = function (e, t) {
              return e.indexOf('{', t);
            });
        },
        In = function () {
          let e = 'wikiLink',
            t = /^\[\[(?<linkContents>.+?)\]\]/su,
            r = this.Parser.prototype,
            n = r.inlineMethods;
          function u(r, n) {
            let u = t.exec(n);
            if (u) {
              let t = u.groups.linkContents.trim();
              return r(u[0])({ type: e, value: t });
            }
          }
          n.splice(n.indexOf('link'), 0, e),
            (r.inlineTokenizers.wikiLink = u),
            (u.locator = function (e, t) {
              return e.indexOf('[', t);
            });
        };
      function Pn({ isMDX: e }) {
        return (t) => {
          let r = (0, vn.default)()
            .use(bn.default, { commonmark: !0, ...(e && { blocks: [xn] }) })
            .use(Cn.default)
            .use(On)
            .use(En.default)
            .use(e ? Ln : jn)
            .use(Nn)
            .use(e ? Rn : jn)
            .use(In);
          return r.run(r.parse(t));
        };
      }
      function jn() {}
      var zn = {
          astFormat: 'mdast',
          hasPragma: (e) => Qt(Kt(e).content.trimStart(), Yt),
          hasIgnorePragma: (e) => Qt(Kt(e).content.trimStart(), Zt),
          locStart: dr,
          locEnd: gr,
        },
        $n = { ...zn, parse: Pn({ isMDX: !1 }) },
        Un = { ...zn, parse: Pn({ isMDX: !0 }) },
        Mn = { mdast: hn },
        Vn = rt;
    },
  });
//# sourceMappingURL=358.extension.js.map
