'use strict';
(exports.id = 54),
  (exports.ids = [54]),
  (exports.modules = {
    1054: (t, e, r) => {
      r.r(e),
        r.d(e, { default: () => jr, languages: () => Ft, parsers: () => Ht, printers: () => Mr });
      var n = Object.defineProperty,
        a = (t) => {
          throw TypeError(t);
        },
        i = (t, e) => {
          for (var r in e) n(t, r, { get: e[r], enumerable: !0 });
        },
        s = (t, e, r) => e.has(t) || a('Cannot ' + r),
        o = (t, e, r) => (s(t, e, 'read from private field'), r ? r.call(t) : e.get(t)),
        l = (t, e, r) =>
          e.has(t)
            ? a('Cannot add the same private member more than once')
            : e instanceof WeakSet
              ? e.add(t)
              : e.set(t, r),
        c = (t, e, r, n) => (s(t, e, 'write to private field'), n ? n.call(t, r) : e.set(t, r), r),
        u = {};
      i(u, { languages: () => Ft, parsers: () => Ht, printers: () => Mr });
      var h = (t, e, r, n) => {
          if (!t || null != e)
            return e.replaceAll
              ? e.replaceAll(r, n)
              : r.global
                ? e.replace(r, n)
                : e.split(r).join(n);
        },
        p = 'string',
        d = 'array',
        m = 'cursor',
        f = 'indent',
        g = 'align',
        y = 'trim',
        b = 'group',
        v = 'fill',
        S = 'if-break',
        w = 'indent-if-break',
        k = 'line-suffix',
        T = 'line-suffix-boundary',
        E = 'line',
        N = 'label',
        A = 'break-parent',
        P = new Set([m, f, g, y, b, v, S, w, k, T, E, N, A]),
        x = (t, e, r) => {
          if (!t || null != e)
            return Array.isArray(e) || 'string' == typeof e ? e[r < 0 ? e.length + r : r] : e.at(r);
        },
        D = function (t) {
          if ('string' == typeof t) return p;
          if (Array.isArray(t)) return d;
          if (!t) return;
          let { type: e } = t;
          return P.has(e) ? e : void 0;
        };
      var C = class extends Error {
        name = 'InvalidDocError';
        constructor(t) {
          super(
            (function (t) {
              let e = null === t ? 'null' : typeof t;
              if ('string' !== e && 'object' !== e)
                return `Unexpected doc '${e}', \nExpected it to be 'string' or 'object'.`;
              if (D(t)) throw new Error('doc is valid.');
              let r = Object.prototype.toString.call(t);
              if ('[object Object]' !== r) return `Unexpected doc '${r}'.`;
              let n = ((t) => new Intl.ListFormat('en-US', { type: 'disjunction' }).format(t))(
                [...P].map((t) => `'${t}'`)
              );
              return `Unexpected doc.type '${t.type}'.\nExpected it to be ${n}.`;
            })(t)
          ),
            (this.doc = t);
        }
      };
      var L = () => {},
        q = L,
        _ = L,
        I = L;
      function O(t) {
        return q(t), { type: f, contents: t };
      }
      function B(t, e = {}) {
        return (
          q(t),
          _(e.expandedStates, !0),
          {
            type: b,
            id: e.id,
            contents: t,
            break: !!e.shouldBreak,
            expandedStates: e.expandedStates,
          }
        );
      }
      function V(t) {
        return q((e = t)), { type: g, contents: e, n: -1 };
        var e;
      }
      function R(t) {
        return I(t), { type: v, parts: t };
      }
      function $(t, e = '', r = {}) {
        return (
          q(t), '' !== e && q(e), { type: S, breakContents: t, flatContents: e, groupId: r.groupId }
        );
      }
      var U = { type: A },
        F = { type: E },
        H = { type: E, soft: !0 },
        z = [{ type: E, hard: !0 }, U],
        M = [{ type: E, hard: !0, literal: !0 }, U];
      function j(t, e) {
        q(t), _(e);
        let r = [];
        for (let n = 0; n < e.length; n++) 0 !== n && r.push(t), r.push(e[n]);
        return r;
      }
      var W,
        G = "'",
        K = function (t, e) {
          let r = !0 === e || e === G ? G : '"',
            n = r === G ? '"' : G,
            a = 0,
            i = 0;
          for (let e of t) e === r ? a++ : e === n && i++;
          return a > i ? n : r;
        };
      W = new WeakMap();
      var Q = new (class {
          constructor(t) {
            l(this, W), c(this, W, new Set(t));
          }
          getLeadingWhitespaceCount(t) {
            let e = o(this, W),
              r = 0;
            for (let n = 0; n < t.length && e.has(t.charAt(n)); n++) r++;
            return r;
          }
          getTrailingWhitespaceCount(t) {
            let e = o(this, W),
              r = 0;
            for (let n = t.length - 1; n >= 0 && e.has(t.charAt(n)); n--) r++;
            return r;
          }
          getLeadingWhitespace(t) {
            let e = this.getLeadingWhitespaceCount(t);
            return t.slice(0, e);
          }
          getTrailingWhitespace(t) {
            let e = this.getTrailingWhitespaceCount(t);
            return t.slice(t.length - e);
          }
          hasLeadingWhitespace(t) {
            return o(this, W).has(t.charAt(0));
          }
          hasTrailingWhitespace(t) {
            return o(this, W).has(x(!1, t, -1));
          }
          trimStart(t) {
            let e = this.getLeadingWhitespaceCount(t);
            return t.slice(e);
          }
          trimEnd(t) {
            let e = this.getTrailingWhitespaceCount(t);
            return t.slice(0, t.length - e);
          }
          trim(t) {
            return this.trimEnd(this.trimStart(t));
          }
          split(t, e = !1) {
            let r = `[${(function (t) {
                if ('string' != typeof t) throw new TypeError('Expected a string');
                return t.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
              })([...o(this, W)].join(''))}]+`,
              n = new RegExp(e ? `(${r})` : r, 'u');
            return t.split(n);
          }
          hasWhitespaceCharacter(t) {
            let e = o(this, W);
            return Array.prototype.some.call(t, (t) => e.has(t));
          }
          hasNonWhitespaceCharacter(t) {
            let e = o(this, W);
            return Array.prototype.some.call(t, (t) => !e.has(t));
          }
          isWhitespaceOnly(t) {
            let e = o(this, W);
            return Array.prototype.every.call(t, (t) => e.has(t));
          }
        })(['\t', '\n', '\f', '\r', ' ']),
        J = function (t) {
          return Array.isArray(t) && t.length > 0;
        },
        Y = class extends Error {
          name = 'UnexpectedNodeError';
          constructor(t, e, r = 'type') {
            super(`Unexpected ${e} node ${r}: ${JSON.stringify(t[r])}.`), (this.node = t);
          }
        };
      function Z(t, e, r) {
        if ('TextNode' === t.type) {
          let n = t.chars.trim();
          if (!n) return null;
          'style' === r.tag && 1 === r.children.length && r.children[0] === t
            ? (e.chars = '')
            : (e.chars = Q.split(n).join(' '));
        }
        'ElementNode' === t.type &&
          (delete e.startTag,
          delete e.openTag,
          delete e.parts,
          delete e.endTag,
          delete e.closeTag,
          delete e.nameNode,
          delete e.body,
          delete e.blockParamNodes,
          delete e.params,
          delete e.path),
          'Block' === t.type && (delete e.blockParamNodes, delete e.params),
          'AttrNode' === t.type && 'class' === t.name.toLowerCase() && delete e.value,
          'PathExpression' === t.type && (e.head = t.head.original);
      }
      Z.ignoredProperties = new Set(['loc', 'selfClosing']);
      var X = Z,
        tt = null;
      function et(t) {
        if (null !== tt && (tt.property, 1)) {
          let t = tt;
          return (tt = et.prototype = null), t;
        }
        return (tt = et.prototype = t ?? Object.create(null)), new et();
      }
      for (let t = 0; t <= 10; t++) et();
      var rt = (function (t, e = 'type') {
        return (
          (function (t) {
            et(t);
          })(t),
          function (r) {
            let n = r[e],
              a = t[n];
            if (!Array.isArray(a))
              throw Object.assign(new Error(`Missing visitor keys for '${n}'.`), { node: r });
            return a;
          }
        );
      })({
        Template: ['body'],
        Block: ['body'],
        MustacheStatement: ['path', 'params', 'hash'],
        BlockStatement: ['path', 'params', 'hash', 'program', 'inverse'],
        ElementModifierStatement: ['path', 'params', 'hash'],
        CommentStatement: [],
        MustacheCommentStatement: [],
        ElementNode: ['attributes', 'modifiers', 'children', 'comments'],
        AttrNode: ['value'],
        TextNode: [],
        ConcatStatement: ['parts'],
        SubExpression: ['path', 'params', 'hash'],
        PathExpression: [],
        StringLiteral: [],
        BooleanLiteral: [],
        NumberLiteral: [],
        NullLiteral: [],
        UndefinedLiteral: [],
        Hash: ['pairs'],
        HashPair: ['value'],
      });
      function nt(t) {
        return t.loc.start.offset;
      }
      function at(t) {
        return t.loc.end.offset;
      }
      var it = new Set([
        'area',
        'base',
        'br',
        'col',
        'command',
        'embed',
        'hr',
        'img',
        'input',
        'keygen',
        'link',
        'meta',
        'param',
        'source',
        'track',
        'wbr',
      ]);
      function st(t) {
        return t.toUpperCase() === t;
      }
      function ot(t) {
        return (
          !0 === t.selfClosing ||
          (function (t) {
            return it.has(t.toLowerCase()) && !st(t[0]);
          })(t.tag) ||
          ((function (t) {
            return (
              'ElementNode' === t.type &&
              'string' == typeof t.tag &&
              !t.tag.startsWith(':') &&
              (st(t.tag[0]) || t.tag.includes('.'))
            );
          })(t) &&
            t.children.every((t) => lt(t)))
        );
      }
      function lt(t) {
        return 'TextNode' === t.type && !/\S/u.test(t.chars);
      }
      function ct(t) {
        return (
          'MustacheCommentStatement' === (null == t ? void 0 : t.type) &&
          'string' == typeof t.value &&
          'prettier-ignore' === t.value.trim()
        );
      }
      function ut(t, e) {
        return nt(t) - nt(e);
      }
      function ht(t, e, r) {
        let { node: n } = t,
          a = n.children.every((t) => lt(t));
        return 'ignore' === e.htmlWhitespaceSensitivity && a
          ? ''
          : t.map(({ isFirst: t }) => {
              let n = r();
              return t && 'ignore' === e.htmlWhitespaceSensitivity ? [H, n] : n;
            }, 'children');
      }
      function pt(t) {
        return ot(t) ? $([H, '/>'], [' />', H]) : $([H, '>'], '>');
      }
      function dt(t) {
        var e;
        return [t.trusting ? '{{{' : '{{', null != (e = t.strip) && e.open ? '~' : ''];
      }
      function mt(t) {
        var e;
        let r = t.trusting ? '}}}' : '}}';
        return [null != (e = t.strip) && e.close ? '~' : '', r];
      }
      function ft(t) {
        return [dt(t), t.openStrip.open ? '~' : '', '#'];
      }
      function gt(t) {
        let e = mt(t);
        return [t.openStrip.close ? '~' : '', e];
      }
      function yt(t) {
        return [dt(t), t.closeStrip.open ? '~' : '', '/'];
      }
      function bt(t) {
        let e = mt(t);
        return [t.closeStrip.close ? '~' : '', e];
      }
      function vt(t) {
        return [dt(t), t.inverseStrip.open ? '~' : ''];
      }
      function St(t) {
        let e = mt(t);
        return [t.inverseStrip.close ? '~' : '', e];
      }
      function wt(t, e) {
        let { node: r } = t,
          n = [],
          a = Bt(t, e);
        return (
          a && n.push(B(a)),
          J(r.program.blockParams) && n.push(Vt(r.program)),
          B([ft(r), Ot(0, e), n.length > 0 ? O([F, j(F, n)]) : '', H, gt(r)])
        );
      }
      function kt(t, e) {
        return ['ignore' === e.htmlWhitespaceSensitivity ? z : '', vt(t), 'else', St(t)];
      }
      var Tt = (t, e) =>
        'VarHead' === t.head.type && 'VarHead' === e.head.type && t.head.name === e.head.name;
      function Et(t, e) {
        let { node: r, grandparent: n } = t;
        return B([
          vt(n),
          ['else', ' ', n.inverse.body[0].path.head.name],
          O([F, B(Bt(t, e)), ...(J(r.program.blockParams) ? [F, Vt(r.program)] : [])]),
          H,
          St(n),
        ]);
      }
      function Nt(t, e, r) {
        let { node: n } = t;
        return 'ignore' === e.htmlWhitespaceSensitivity
          ? [At(n) ? H : z, yt(n), r('path'), bt(n)]
          : [yt(n), r('path'), bt(n)];
      }
      function At(t) {
        return 'BlockStatement' === t.type && t.program.body.every((t) => lt(t));
      }
      function Pt(t) {
        return 'BlockStatement' === t.type && t.inverse;
      }
      function xt(t, e, r) {
        let { node: n } = t;
        if (At(n)) return '';
        let a = r('program');
        return 'ignore' === e.htmlWhitespaceSensitivity ? O([z, a]) : O(a);
      }
      function Dt(t, e, r) {
        let { node: n } = t,
          a = r('inverse'),
          i = 'ignore' === e.htmlWhitespaceSensitivity ? [z, a] : a;
        return (function (t) {
          return (
            Pt(t) &&
            1 === t.inverse.body.length &&
            'BlockStatement' === t.inverse.body[0].type &&
            Tt(t.inverse.body[0].path, t.path)
          );
        })(n)
          ? i
          : Pt(n)
            ? [kt(n, e), O(i)]
            : '';
      }
      function Ct(t) {
        return j(F, Q.split(t));
      }
      function Lt(t) {
        return (t = 'string' == typeof t ? t : '').split('\n').length - 1;
      }
      function qt(t = 0) {
        return Array.from({ length: Math.min(t, 2) }).fill(z);
      }
      function _t(t, e) {
        let r = Ot(0, e),
          n = Bt(t, e);
        return n ? O([r, F, B(n)]) : r;
      }
      function It(t, e) {
        let r = Ot(0, e),
          n = Bt(t, e);
        return n ? [O([r, F, n]), H] : r;
      }
      function Ot(t, e) {
        return e('path');
      }
      function Bt(t, e) {
        var r;
        let { node: n } = t,
          a = [];
        return (
          n.params.length > 0 && a.push(...t.map(e, 'params')),
          (null == (r = n.hash) ? void 0 : r.pairs.length) > 0 && a.push(e('hash')),
          0 === a.length ? '' : j(F, a)
        );
      }
      function Vt(t) {
        return ['as |', t.blockParams.join(' '), '|'];
      }
      var Rt = new Set('!"#%&\'()*+,./;<=>@[\\]^`{|}~'),
        $t = new Set(['true', 'false', 'null', 'undefined']),
        Ut = {
          print: function (t, e, r) {
            var n, a, i, s, o, l, c, u, P;
            let { node: x } = t;
            switch (x.type) {
              case 'Block':
              case 'Program':
              case 'Template':
                return B(t.map(r, 'body'));
              case 'ElementNode': {
                let a = B(
                    (function (t, e) {
                      let { node: r } = t,
                        n = ['attributes', 'modifiers', 'comments'].filter((t) => J(r[t])),
                        a = n.flatMap((t) => r[t]).sort(ut);
                      for (let r of n)
                        t.each(({ node: t }) => {
                          let r = a.indexOf(t);
                          a.splice(r, 1, [F, e()]);
                        }, r);
                      return J(r.blockParams) && a.push(F, Vt(r)), ['<', r.tag, O(a), pt(r)];
                    })(t, r)
                  ),
                  i =
                    'ignore' === e.htmlWhitespaceSensitivity &&
                    'ElementNode' === (null == (n = t.next) ? void 0 : n.type)
                      ? H
                      : '';
                if (ot(x)) return [a, i];
                let s = ['</', x.tag, '>'];
                return 0 === x.children.length
                  ? [a, O(s), i]
                  : 'ignore' === e.htmlWhitespaceSensitivity
                    ? [a, O(ht(t, e, r)), z, O(s), i]
                    : [a, O(B(ht(t, e, r))), O(s), i];
              }
              case 'BlockStatement':
                return (function (t) {
                  var e;
                  let { grandparent: r, node: n } = t;
                  return (
                    1 === (null == (e = null == r ? void 0 : r.inverse) ? void 0 : e.body.length) &&
                    r.inverse.body[0] === n &&
                    Tt(r.inverse.body[0].path, r.path)
                  );
                })(t)
                  ? [Et(t, r), xt(t, e, r), Dt(t, e, r)]
                  : [wt(t, r), B([xt(t, e, r), Dt(t, e, r), Nt(t, e, r)])];
              case 'ElementModifierStatement':
                return B(['{{', It(t, r), '}}']);
              case 'MustacheStatement':
                return B([dt(x), It(t, r), mt(x)]);
              case 'SubExpression':
                return B(['(', _t(t, r), H, ')']);
              case 'AttrNode': {
                let { name: t, value: n } = x,
                  a = 'TextNode' === n.type;
                if (a && '' === n.chars && nt(n) === at(n)) return t;
                let i = a
                    ? K(n.chars, e.singleQuote)
                    : 'ConcatStatement' === n.type
                      ? K(
                          n.parts.map((t) => ('TextNode' === t.type ? t.chars : '')).join(''),
                          e.singleQuote
                        )
                      : '',
                  s = r('value');
                return [t, '=', i, 'class' === t && i ? B(O(s)) : s, i];
              }
              case 'ConcatStatement':
                return t.map(r, 'parts');
              case 'Hash':
                return j(F, t.map(r, 'pairs'));
              case 'HashPair':
                return [x.key, '=', r('value')];
              case 'TextNode': {
                if ('pre' === t.parent.tag || 'style' === t.parent.tag) return x.chars;
                let r = h(!1, x.chars, '{{', String.raw`\{{`),
                  n = (function (t) {
                    for (let e = 0; e < 2; e++) {
                      let r = t.getParentNode(e);
                      if ('AttrNode' === (null == r ? void 0 : r.type)) return r.name.toLowerCase();
                    }
                  })(t);
                if (n) {
                  if ('class' === n) {
                    let e = r.trim().split(/\s+/u).join(' '),
                      n = !1,
                      s = !1;
                    return (
                      'ConcatStatement' === t.parent.type &&
                        ('MustacheStatement' === (null == (a = t.previous) ? void 0 : a.type) &&
                          /^\s/u.test(r) &&
                          (n = !0),
                        'MustacheStatement' === (null == (i = t.next) ? void 0 : i.type) &&
                          /\s$/u.test(r) &&
                          '' !== e &&
                          (s = !0)),
                      [n ? F : '', e, s ? F : '']
                    );
                  }
                  return (function (t, e = M) {
                    return (function (t, e) {
                      if ('string' == typeof t) return e(t);
                      let r = new Map();
                      return (function t(n) {
                        if (r.has(n)) return r.get(n);
                        let a = (function (r) {
                          switch (D(r)) {
                            case d:
                              return e(r.map(t));
                            case v:
                              return e({ ...r, parts: r.parts.map(t) });
                            case S:
                              return e({
                                ...r,
                                breakContents: t(r.breakContents),
                                flatContents: t(r.flatContents),
                              });
                            case b: {
                              let { expandedStates: n, contents: a } = r;
                              return (
                                n ? ((n = n.map(t)), (a = n[0])) : (a = t(a)),
                                e({ ...r, contents: a, expandedStates: n })
                              );
                            }
                            case g:
                            case f:
                            case w:
                            case N:
                            case k:
                              return e({ ...r, contents: t(r.contents) });
                            case p:
                            case m:
                            case y:
                            case T:
                            case E:
                            case A:
                              return e(r);
                            default:
                              throw new C(r);
                          }
                        })(n);
                        return r.set(n, a), a;
                      })(t);
                    })(t, (t) => ('string' == typeof t ? j(e, t.split('\n')) : t));
                  })(r);
                }
                let L = Q.isWhitespaceOnly(r),
                  { isFirst: q, isLast: _ } = t;
                if ('ignore' !== e.htmlWhitespaceSensitivity) {
                  let e = _ && 'Template' === t.parent.type,
                    n = q && 'Template' === t.parent.type;
                  if (L) {
                    if (n || e) return '';
                    let t = [F],
                      a = Lt(r);
                    return a && (t = qt(a)), _ && (t = t.map((t) => V(t))), t;
                  }
                  let a = Q.getLeadingWhitespace(r),
                    i = [];
                  if (a) {
                    i = [F];
                    let t = Lt(a);
                    t && (i = qt(t)), (r = r.slice(a.length));
                  }
                  let s = Q.getTrailingWhitespace(r),
                    o = [];
                  if (s) {
                    if (!e) {
                      o = [F];
                      let t = Lt(s);
                      t && (o = qt(t)), _ && (o = o.map((t) => V(t)));
                    }
                    r = r.slice(0, -s.length);
                  }
                  return [...i, R(Ct(r)), ...o];
                }
                let I = Lt(r),
                  O = (function (t) {
                    return Lt(
                      ((t = 'string' == typeof t ? t : '').match(/^([^\S\n\r]*[\n\r])+/gu) ||
                        [])[0] || ''
                    );
                  })(r),
                  B = (function (t) {
                    return Lt(
                      ((t = 'string' == typeof t ? t : '').match(/([\n\r][^\S\n\r]*)+$/gu) ||
                        [])[0] || ''
                    );
                  })(r);
                if (
                  (q || _) &&
                  L &&
                  ('Block' === t.parent.type ||
                    'ElementNode' === t.parent.type ||
                    'Template' === t.parent.type)
                )
                  return '';
                L && I
                  ? ((O = Math.min(I, 2)), (B = 0))
                  : (('BlockStatement' === (null == (s = t.next) ? void 0 : s.type) ||
                      'ElementNode' === (null == (o = t.next) ? void 0 : o.type)) &&
                      (B = Math.max(B, 1)),
                    ('BlockStatement' === (null == (l = t.previous) ? void 0 : l.type) ||
                      'ElementNode' === (null == (c = t.previous) ? void 0 : c.type)) &&
                      (O = Math.max(O, 1)));
                let $ = '',
                  U = '';
                return (
                  0 === B &&
                    'MustacheStatement' === (null == (u = t.next) ? void 0 : u.type) &&
                    (U = ' '),
                  0 === O &&
                    'MustacheStatement' === (null == (P = t.previous) ? void 0 : P.type) &&
                    ($ = ' '),
                  q && ((O = 0), ($ = '')),
                  _ && ((B = 0), (U = '')),
                  Q.hasLeadingWhitespace(r) && (r = $ + Q.trimStart(r)),
                  Q.hasTrailingWhitespace(r) && (r = Q.trimEnd(r) + U),
                  [...qt(O), R(Ct(r)), ...qt(B)]
                );
              }
              case 'MustacheCommentStatement': {
                let t = nt(x),
                  r = at(x),
                  n = '~' === e.originalText.charAt(t + 2),
                  a = '~' === e.originalText.charAt(r - 3),
                  i = x.value.includes('}}') ? '--' : '';
                return ['{{', n ? '~' : '', '!', i, x.value, i, a ? '~' : '', '}}'];
              }
              case 'PathExpression':
                return (function (t) {
                  return 0 === t.tail.length && t.original.includes('/')
                    ? t.original
                    : [t.head.original, ...t.tail]
                        .map((t, e) =>
                          ((t, e) =>
                            (0 !== e || !t.startsWith('@')) &&
                            ((0 !== e && $t.has(t)) ||
                              /\s/u.test(t) ||
                              /^\d/u.test(t) ||
                              Array.prototype.some.call(t, (t) => Rt.has(t))))(t, e)
                            ? `[${t}]`
                            : t
                        )
                        .join('.');
                })(x);
              case 'BooleanLiteral':
              case 'NumberLiteral':
                return String(x.value);
              case 'CommentStatement':
                return ['\x3c!--', x.value, '--\x3e'];
              case 'StringLiteral':
                return (function (t, e) {
                  let {
                      node: { value: r },
                    } = t,
                    n = K(
                      r,
                      (function (t) {
                        let { ancestors: e } = t,
                          r = e.findIndex((t) => 'SubExpression' !== t.type);
                        return (
                          -1 !== r &&
                          'ConcatStatement' === e[r + 1].type &&
                          'AttrNode' === e[r + 2].type
                        );
                      })(t)
                        ? !e.singleQuote
                        : e.singleQuote
                    );
                  return [n, h(!1, r, n, `\\${n}`), n];
                })(t, e);
              case 'UndefinedLiteral':
                return 'undefined';
              case 'NullLiteral':
                return 'null';
              default:
                throw new Y(x, 'Handlebars');
            }
          },
          massageAstNode: X,
          hasPrettierIgnore: function (t) {
            return (
              ct(t.node) ||
              (t.isInArray &&
                ('children' === t.key || 'body' === t.key || 'parts' === t.key) &&
                ct(t.siblings[t.index - 2]))
            );
          },
          getVisitorKeys: rt,
          embed: function (t) {
            let { node: e } = t;
            if ('TextNode' !== e.type) return;
            let { parent: r } = t;
            if (
              'ElementNode' !== r.type ||
              'style' !== r.tag ||
              1 !== r.children.length ||
              r.children[0] !== e
            )
              return;
            let n = r.attributes.find((t) => 'AttrNode' === t.type && 'lang' === t.name);
            return n &&
              ('TextNode' !== n.value.type || ('' !== n.value.chars && 'css' !== n.value.chars))
              ? void 0
              : async (t) => {
                  let r = await t(e.chars, { parser: 'css' });
                  return r ? [z, r, V(H)] : [];
                };
          },
        },
        Ft = [
          {
            name: 'Handlebars',
            type: 'markup',
            extensions: ['.handlebars', '.hbs'],
            tmScope: 'text.html.handlebars',
            aceMode: 'handlebars',
            aliases: ['hbs', 'htmlbars'],
            parsers: ['glimmer'],
            vscodeLanguageIds: ['handlebars'],
            linguistLanguageId: 155,
          },
        ],
        Ht = {};
      i(Ht, { glimmer: () => zr });
      var zt = Object.freeze([]);
      function Mt() {
        return zt;
      }
      Mt(), Mt();
      var jt = Object.assign,
        Wt = console,
        Gt = (function () {
          var t = function (t, e, r, n) {
              for (r = r || {}, n = t.length; n--; r[t[n]] = e);
              return r;
            },
            e = [2, 44],
            r = [1, 20],
            n = [5, 14, 15, 19, 29, 34, 39, 44, 47, 48, 52, 56, 60],
            a = [1, 35],
            i = [1, 38],
            s = [1, 30],
            o = [1, 31],
            l = [1, 32],
            c = [1, 33],
            u = [1, 34],
            h = [1, 37],
            p = [14, 15, 19, 29, 34, 39, 44, 47, 48, 52, 56, 60],
            d = [14, 15, 19, 29, 34, 44, 47, 48, 52, 56, 60],
            m = [15, 18],
            f = [14, 15, 19, 29, 34, 47, 48, 52, 56, 60],
            g = [33, 64, 71, 79, 80, 81, 82, 83, 84],
            y = [23, 33, 55, 64, 67, 71, 74, 79, 80, 81, 82, 83, 84],
            b = [1, 51],
            v = [23, 33, 55, 64, 67, 71, 74, 79, 80, 81, 82, 83, 84, 86],
            S = [2, 43],
            w = [55, 64, 71, 79, 80, 81, 82, 83, 84],
            k = [1, 58],
            T = [1, 59],
            E = [1, 66],
            N = [33, 64, 71, 74, 79, 80, 81, 82, 83, 84],
            A = [23, 64, 71, 79, 80, 81, 82, 83, 84],
            P = [1, 76],
            x = [64, 67, 71, 79, 80, 81, 82, 83, 84],
            D = [33, 74],
            C = [23, 33, 55, 67, 71, 74],
            L = [1, 106],
            q = [1, 118],
            _ = [71, 76],
            I = {
              trace: function () {},
              yy: {},
              symbols_: {
                error: 2,
                root: 3,
                program: 4,
                EOF: 5,
                program_repetition0: 6,
                statement: 7,
                mustache: 8,
                block: 9,
                rawBlock: 10,
                partial: 11,
                partialBlock: 12,
                content: 13,
                COMMENT: 14,
                CONTENT: 15,
                openRawBlock: 16,
                rawBlock_repetition0: 17,
                END_RAW_BLOCK: 18,
                OPEN_RAW_BLOCK: 19,
                helperName: 20,
                openRawBlock_repetition0: 21,
                openRawBlock_option0: 22,
                CLOSE_RAW_BLOCK: 23,
                openBlock: 24,
                block_option0: 25,
                closeBlock: 26,
                openInverse: 27,
                block_option1: 28,
                OPEN_BLOCK: 29,
                openBlock_repetition0: 30,
                openBlock_option0: 31,
                openBlock_option1: 32,
                CLOSE: 33,
                OPEN_INVERSE: 34,
                openInverse_repetition0: 35,
                openInverse_option0: 36,
                openInverse_option1: 37,
                openInverseChain: 38,
                OPEN_INVERSE_CHAIN: 39,
                openInverseChain_repetition0: 40,
                openInverseChain_option0: 41,
                openInverseChain_option1: 42,
                inverseAndProgram: 43,
                INVERSE: 44,
                inverseChain: 45,
                inverseChain_option0: 46,
                OPEN_ENDBLOCK: 47,
                OPEN: 48,
                expr: 49,
                mustache_repetition0: 50,
                mustache_option0: 51,
                OPEN_UNESCAPED: 52,
                mustache_repetition1: 53,
                mustache_option1: 54,
                CLOSE_UNESCAPED: 55,
                OPEN_PARTIAL: 56,
                partial_repetition0: 57,
                partial_option0: 58,
                openPartialBlock: 59,
                OPEN_PARTIAL_BLOCK: 60,
                openPartialBlock_repetition0: 61,
                openPartialBlock_option0: 62,
                sexpr: 63,
                OPEN_SEXPR: 64,
                sexpr_repetition0: 65,
                sexpr_option0: 66,
                CLOSE_SEXPR: 67,
                hash: 68,
                hash_repetition_plus0: 69,
                hashSegment: 70,
                ID: 71,
                EQUALS: 72,
                blockParams: 73,
                OPEN_BLOCK_PARAMS: 74,
                blockParams_repetition_plus0: 75,
                CLOSE_BLOCK_PARAMS: 76,
                path: 77,
                dataName: 78,
                STRING: 79,
                NUMBER: 80,
                BOOLEAN: 81,
                UNDEFINED: 82,
                NULL: 83,
                DATA: 84,
                pathSegments: 85,
                SEP: 86,
                $accept: 0,
                $end: 1,
              },
              terminals_: {
                2: 'error',
                5: 'EOF',
                14: 'COMMENT',
                15: 'CONTENT',
                18: 'END_RAW_BLOCK',
                19: 'OPEN_RAW_BLOCK',
                23: 'CLOSE_RAW_BLOCK',
                29: 'OPEN_BLOCK',
                33: 'CLOSE',
                34: 'OPEN_INVERSE',
                39: 'OPEN_INVERSE_CHAIN',
                44: 'INVERSE',
                47: 'OPEN_ENDBLOCK',
                48: 'OPEN',
                52: 'OPEN_UNESCAPED',
                55: 'CLOSE_UNESCAPED',
                56: 'OPEN_PARTIAL',
                60: 'OPEN_PARTIAL_BLOCK',
                64: 'OPEN_SEXPR',
                67: 'CLOSE_SEXPR',
                71: 'ID',
                72: 'EQUALS',
                74: 'OPEN_BLOCK_PARAMS',
                76: 'CLOSE_BLOCK_PARAMS',
                79: 'STRING',
                80: 'NUMBER',
                81: 'BOOLEAN',
                82: 'UNDEFINED',
                83: 'NULL',
                84: 'DATA',
                86: 'SEP',
              },
              productions_: [
                0,
                [3, 2],
                [4, 1],
                [7, 1],
                [7, 1],
                [7, 1],
                [7, 1],
                [7, 1],
                [7, 1],
                [7, 1],
                [13, 1],
                [10, 3],
                [16, 5],
                [9, 4],
                [9, 4],
                [24, 6],
                [27, 6],
                [38, 6],
                [43, 2],
                [45, 3],
                [45, 1],
                [26, 3],
                [8, 5],
                [8, 5],
                [11, 5],
                [12, 3],
                [59, 5],
                [49, 1],
                [49, 1],
                [63, 5],
                [68, 1],
                [70, 3],
                [73, 3],
                [20, 1],
                [20, 1],
                [20, 1],
                [20, 1],
                [20, 1],
                [20, 1],
                [20, 1],
                [78, 2],
                [77, 1],
                [85, 3],
                [85, 1],
                [6, 0],
                [6, 2],
                [17, 0],
                [17, 2],
                [21, 0],
                [21, 2],
                [22, 0],
                [22, 1],
                [25, 0],
                [25, 1],
                [28, 0],
                [28, 1],
                [30, 0],
                [30, 2],
                [31, 0],
                [31, 1],
                [32, 0],
                [32, 1],
                [35, 0],
                [35, 2],
                [36, 0],
                [36, 1],
                [37, 0],
                [37, 1],
                [40, 0],
                [40, 2],
                [41, 0],
                [41, 1],
                [42, 0],
                [42, 1],
                [46, 0],
                [46, 1],
                [50, 0],
                [50, 2],
                [51, 0],
                [51, 1],
                [53, 0],
                [53, 2],
                [54, 0],
                [54, 1],
                [57, 0],
                [57, 2],
                [58, 0],
                [58, 1],
                [61, 0],
                [61, 2],
                [62, 0],
                [62, 1],
                [65, 0],
                [65, 2],
                [66, 0],
                [66, 1],
                [69, 1],
                [69, 2],
                [75, 1],
                [75, 2],
              ],
              performAction: function (t, e, r, n, a, i, s) {
                var o = i.length - 1;
                switch (a) {
                  case 1:
                    return i[o - 1];
                  case 2:
                    this.$ = n.prepareProgram(i[o]);
                    break;
                  case 3:
                  case 4:
                  case 5:
                  case 6:
                  case 7:
                  case 8:
                  case 20:
                  case 27:
                  case 28:
                  case 33:
                  case 34:
                    this.$ = i[o];
                    break;
                  case 9:
                    this.$ = {
                      type: 'CommentStatement',
                      value: n.stripComment(i[o]),
                      strip: n.stripFlags(i[o], i[o]),
                      loc: n.locInfo(this._$),
                    };
                    break;
                  case 10:
                    this.$ = {
                      type: 'ContentStatement',
                      original: i[o],
                      value: i[o],
                      loc: n.locInfo(this._$),
                    };
                    break;
                  case 11:
                    this.$ = n.prepareRawBlock(i[o - 2], i[o - 1], i[o], this._$);
                    break;
                  case 12:
                    this.$ = { path: i[o - 3], params: i[o - 2], hash: i[o - 1] };
                    break;
                  case 13:
                    this.$ = n.prepareBlock(i[o - 3], i[o - 2], i[o - 1], i[o], !1, this._$);
                    break;
                  case 14:
                    this.$ = n.prepareBlock(i[o - 3], i[o - 2], i[o - 1], i[o], !0, this._$);
                    break;
                  case 15:
                    this.$ = {
                      open: i[o - 5],
                      path: i[o - 4],
                      params: i[o - 3],
                      hash: i[o - 2],
                      blockParams: i[o - 1],
                      strip: n.stripFlags(i[o - 5], i[o]),
                    };
                    break;
                  case 16:
                  case 17:
                    this.$ = {
                      path: i[o - 4],
                      params: i[o - 3],
                      hash: i[o - 2],
                      blockParams: i[o - 1],
                      strip: n.stripFlags(i[o - 5], i[o]),
                    };
                    break;
                  case 18:
                    this.$ = { strip: n.stripFlags(i[o - 1], i[o - 1]), program: i[o] };
                    break;
                  case 19:
                    var l = n.prepareBlock(i[o - 2], i[o - 1], i[o], i[o], !1, this._$),
                      c = n.prepareProgram([l], i[o - 1].loc);
                    (c.chained = !0), (this.$ = { strip: i[o - 2].strip, program: c, chain: !0 });
                    break;
                  case 21:
                    this.$ = { path: i[o - 1], strip: n.stripFlags(i[o - 2], i[o]) };
                    break;
                  case 22:
                  case 23:
                    this.$ = n.prepareMustache(
                      i[o - 3],
                      i[o - 2],
                      i[o - 1],
                      i[o - 4],
                      n.stripFlags(i[o - 4], i[o]),
                      this._$
                    );
                    break;
                  case 24:
                    this.$ = {
                      type: 'PartialStatement',
                      name: i[o - 3],
                      params: i[o - 2],
                      hash: i[o - 1],
                      indent: '',
                      strip: n.stripFlags(i[o - 4], i[o]),
                      loc: n.locInfo(this._$),
                    };
                    break;
                  case 25:
                    this.$ = n.preparePartialBlock(i[o - 2], i[o - 1], i[o], this._$);
                    break;
                  case 26:
                    this.$ = {
                      path: i[o - 3],
                      params: i[o - 2],
                      hash: i[o - 1],
                      strip: n.stripFlags(i[o - 4], i[o]),
                    };
                    break;
                  case 29:
                    this.$ = {
                      type: 'SubExpression',
                      path: i[o - 3],
                      params: i[o - 2],
                      hash: i[o - 1],
                      loc: n.locInfo(this._$),
                    };
                    break;
                  case 30:
                    this.$ = { type: 'Hash', pairs: i[o], loc: n.locInfo(this._$) };
                    break;
                  case 31:
                    this.$ = {
                      type: 'HashPair',
                      key: n.id(i[o - 2]),
                      value: i[o],
                      loc: n.locInfo(this._$),
                    };
                    break;
                  case 32:
                    this.$ = n.id(i[o - 1]);
                    break;
                  case 35:
                    this.$ = {
                      type: 'StringLiteral',
                      value: i[o],
                      original: i[o],
                      loc: n.locInfo(this._$),
                    };
                    break;
                  case 36:
                    this.$ = {
                      type: 'NumberLiteral',
                      value: Number(i[o]),
                      original: Number(i[o]),
                      loc: n.locInfo(this._$),
                    };
                    break;
                  case 37:
                    this.$ = {
                      type: 'BooleanLiteral',
                      value: 'true' === i[o],
                      original: 'true' === i[o],
                      loc: n.locInfo(this._$),
                    };
                    break;
                  case 38:
                    this.$ = {
                      type: 'UndefinedLiteral',
                      original: void 0,
                      value: void 0,
                      loc: n.locInfo(this._$),
                    };
                    break;
                  case 39:
                    this.$ = {
                      type: 'NullLiteral',
                      original: null,
                      value: null,
                      loc: n.locInfo(this._$),
                    };
                    break;
                  case 40:
                    this.$ = n.preparePath(!0, i[o], this._$);
                    break;
                  case 41:
                    this.$ = n.preparePath(!1, i[o], this._$);
                    break;
                  case 42:
                    i[o - 2].push({ part: n.id(i[o]), original: i[o], separator: i[o - 1] }),
                      (this.$ = i[o - 2]);
                    break;
                  case 43:
                    this.$ = [{ part: n.id(i[o]), original: i[o] }];
                    break;
                  case 44:
                  case 46:
                  case 48:
                  case 56:
                  case 62:
                  case 68:
                  case 76:
                  case 80:
                  case 84:
                  case 88:
                  case 92:
                    this.$ = [];
                    break;
                  case 45:
                  case 47:
                  case 49:
                  case 57:
                  case 63:
                  case 69:
                  case 77:
                  case 81:
                  case 85:
                  case 89:
                  case 93:
                  case 97:
                  case 99:
                    i[o - 1].push(i[o]);
                    break;
                  case 96:
                  case 98:
                    this.$ = [i[o]];
                }
              },
              table: [
                t([5, 14, 15, 19, 29, 34, 48, 52, 56, 60], e, { 3: 1, 4: 2, 6: 3 }),
                { 1: [3] },
                { 5: [1, 4] },
                t([5, 39, 44, 47], [2, 2], {
                  7: 5,
                  8: 6,
                  9: 7,
                  10: 8,
                  11: 9,
                  12: 10,
                  13: 11,
                  24: 15,
                  27: 16,
                  16: 17,
                  59: 19,
                  14: [1, 12],
                  15: r,
                  19: [1, 23],
                  29: [1, 21],
                  34: [1, 22],
                  48: [1, 13],
                  52: [1, 14],
                  56: [1, 18],
                  60: [1, 24],
                }),
                { 1: [2, 1] },
                t(n, [2, 45]),
                t(n, [2, 3]),
                t(n, [2, 4]),
                t(n, [2, 5]),
                t(n, [2, 6]),
                t(n, [2, 7]),
                t(n, [2, 8]),
                t(n, [2, 9]),
                {
                  20: 26,
                  49: 25,
                  63: 27,
                  64: a,
                  71: i,
                  77: 28,
                  78: 29,
                  79: s,
                  80: o,
                  81: l,
                  82: c,
                  83: u,
                  84: h,
                  85: 36,
                },
                {
                  20: 26,
                  49: 39,
                  63: 27,
                  64: a,
                  71: i,
                  77: 28,
                  78: 29,
                  79: s,
                  80: o,
                  81: l,
                  82: c,
                  83: u,
                  84: h,
                  85: 36,
                },
                t(p, e, { 6: 3, 4: 40 }),
                t(d, e, { 6: 3, 4: 41 }),
                t(m, [2, 46], { 17: 42 }),
                {
                  20: 26,
                  49: 43,
                  63: 27,
                  64: a,
                  71: i,
                  77: 28,
                  78: 29,
                  79: s,
                  80: o,
                  81: l,
                  82: c,
                  83: u,
                  84: h,
                  85: 36,
                },
                t(f, e, { 6: 3, 4: 44 }),
                t([5, 14, 15, 18, 19, 29, 34, 39, 44, 47, 48, 52, 56, 60], [2, 10]),
                { 20: 45, 71: i, 77: 28, 78: 29, 79: s, 80: o, 81: l, 82: c, 83: u, 84: h, 85: 36 },
                { 20: 46, 71: i, 77: 28, 78: 29, 79: s, 80: o, 81: l, 82: c, 83: u, 84: h, 85: 36 },
                { 20: 47, 71: i, 77: 28, 78: 29, 79: s, 80: o, 81: l, 82: c, 83: u, 84: h, 85: 36 },
                {
                  20: 26,
                  49: 48,
                  63: 27,
                  64: a,
                  71: i,
                  77: 28,
                  78: 29,
                  79: s,
                  80: o,
                  81: l,
                  82: c,
                  83: u,
                  84: h,
                  85: 36,
                },
                t(g, [2, 76], { 50: 49 }),
                t(y, [2, 27]),
                t(y, [2, 28]),
                t(y, [2, 33]),
                t(y, [2, 34]),
                t(y, [2, 35]),
                t(y, [2, 36]),
                t(y, [2, 37]),
                t(y, [2, 38]),
                t(y, [2, 39]),
                {
                  20: 26,
                  49: 50,
                  63: 27,
                  64: a,
                  71: i,
                  77: 28,
                  78: 29,
                  79: s,
                  80: o,
                  81: l,
                  82: c,
                  83: u,
                  84: h,
                  85: 36,
                },
                t(y, [2, 41], { 86: b }),
                { 71: i, 85: 52 },
                t(v, S),
                t(w, [2, 80], { 53: 53 }),
                { 25: 54, 38: 56, 39: k, 43: 57, 44: T, 45: 55, 47: [2, 52] },
                { 28: 60, 43: 61, 44: T, 47: [2, 54] },
                { 13: 63, 15: r, 18: [1, 62] },
                t(g, [2, 84], { 57: 64 }),
                { 26: 65, 47: E },
                t(N, [2, 56], { 30: 67 }),
                t(N, [2, 62], { 35: 68 }),
                t(A, [2, 48], { 21: 69 }),
                t(g, [2, 88], { 61: 70 }),
                {
                  20: 26,
                  33: [2, 78],
                  49: 72,
                  51: 71,
                  63: 27,
                  64: a,
                  68: 73,
                  69: 74,
                  70: 75,
                  71: P,
                  77: 28,
                  78: 29,
                  79: s,
                  80: o,
                  81: l,
                  82: c,
                  83: u,
                  84: h,
                  85: 36,
                },
                t(x, [2, 92], { 65: 77 }),
                { 71: [1, 78] },
                t(y, [2, 40], { 86: b }),
                {
                  20: 26,
                  49: 80,
                  54: 79,
                  55: [2, 82],
                  63: 27,
                  64: a,
                  68: 81,
                  69: 74,
                  70: 75,
                  71: P,
                  77: 28,
                  78: 29,
                  79: s,
                  80: o,
                  81: l,
                  82: c,
                  83: u,
                  84: h,
                  85: 36,
                },
                { 26: 82, 47: E },
                { 47: [2, 53] },
                t(p, e, { 6: 3, 4: 83 }),
                { 47: [2, 20] },
                { 20: 84, 71: i, 77: 28, 78: 29, 79: s, 80: o, 81: l, 82: c, 83: u, 84: h, 85: 36 },
                t(f, e, { 6: 3, 4: 85 }),
                { 26: 86, 47: E },
                { 47: [2, 55] },
                t(n, [2, 11]),
                t(m, [2, 47]),
                {
                  20: 26,
                  33: [2, 86],
                  49: 88,
                  58: 87,
                  63: 27,
                  64: a,
                  68: 89,
                  69: 74,
                  70: 75,
                  71: P,
                  77: 28,
                  78: 29,
                  79: s,
                  80: o,
                  81: l,
                  82: c,
                  83: u,
                  84: h,
                  85: 36,
                },
                t(n, [2, 25]),
                { 20: 90, 71: i, 77: 28, 78: 29, 79: s, 80: o, 81: l, 82: c, 83: u, 84: h, 85: 36 },
                t(D, [2, 58], {
                  20: 26,
                  63: 27,
                  77: 28,
                  78: 29,
                  85: 36,
                  69: 74,
                  70: 75,
                  31: 91,
                  49: 92,
                  68: 93,
                  64: a,
                  71: P,
                  79: s,
                  80: o,
                  81: l,
                  82: c,
                  83: u,
                  84: h,
                }),
                t(D, [2, 64], {
                  20: 26,
                  63: 27,
                  77: 28,
                  78: 29,
                  85: 36,
                  69: 74,
                  70: 75,
                  36: 94,
                  49: 95,
                  68: 96,
                  64: a,
                  71: P,
                  79: s,
                  80: o,
                  81: l,
                  82: c,
                  83: u,
                  84: h,
                }),
                {
                  20: 26,
                  22: 97,
                  23: [2, 50],
                  49: 98,
                  63: 27,
                  64: a,
                  68: 99,
                  69: 74,
                  70: 75,
                  71: P,
                  77: 28,
                  78: 29,
                  79: s,
                  80: o,
                  81: l,
                  82: c,
                  83: u,
                  84: h,
                  85: 36,
                },
                {
                  20: 26,
                  33: [2, 90],
                  49: 101,
                  62: 100,
                  63: 27,
                  64: a,
                  68: 102,
                  69: 74,
                  70: 75,
                  71: P,
                  77: 28,
                  78: 29,
                  79: s,
                  80: o,
                  81: l,
                  82: c,
                  83: u,
                  84: h,
                  85: 36,
                },
                { 33: [1, 103] },
                t(g, [2, 77]),
                { 33: [2, 79] },
                t([23, 33, 55, 67, 74], [2, 30], { 70: 104, 71: [1, 105] }),
                t(C, [2, 96]),
                t(v, S, { 72: L }),
                {
                  20: 26,
                  49: 108,
                  63: 27,
                  64: a,
                  66: 107,
                  67: [2, 94],
                  68: 109,
                  69: 74,
                  70: 75,
                  71: P,
                  77: 28,
                  78: 29,
                  79: s,
                  80: o,
                  81: l,
                  82: c,
                  83: u,
                  84: h,
                  85: 36,
                },
                t(v, [2, 42]),
                { 55: [1, 110] },
                t(w, [2, 81]),
                { 55: [2, 83] },
                t(n, [2, 13]),
                { 38: 56, 39: k, 43: 57, 44: T, 45: 112, 46: 111, 47: [2, 74] },
                t(N, [2, 68], { 40: 113 }),
                { 47: [2, 18] },
                t(n, [2, 14]),
                { 33: [1, 114] },
                t(g, [2, 85]),
                { 33: [2, 87] },
                { 33: [1, 115] },
                { 32: 116, 33: [2, 60], 73: 117, 74: q },
                t(N, [2, 57]),
                t(D, [2, 59]),
                { 33: [2, 66], 37: 119, 73: 120, 74: q },
                t(N, [2, 63]),
                t(D, [2, 65]),
                { 23: [1, 121] },
                t(A, [2, 49]),
                { 23: [2, 51] },
                { 33: [1, 122] },
                t(g, [2, 89]),
                { 33: [2, 91] },
                t(n, [2, 22]),
                t(C, [2, 97]),
                { 72: L },
                {
                  20: 26,
                  49: 123,
                  63: 27,
                  64: a,
                  71: i,
                  77: 28,
                  78: 29,
                  79: s,
                  80: o,
                  81: l,
                  82: c,
                  83: u,
                  84: h,
                  85: 36,
                },
                { 67: [1, 124] },
                t(x, [2, 93]),
                { 67: [2, 95] },
                t(n, [2, 23]),
                { 47: [2, 19] },
                { 47: [2, 75] },
                t(D, [2, 70], {
                  20: 26,
                  63: 27,
                  77: 28,
                  78: 29,
                  85: 36,
                  69: 74,
                  70: 75,
                  41: 125,
                  49: 126,
                  68: 127,
                  64: a,
                  71: P,
                  79: s,
                  80: o,
                  81: l,
                  82: c,
                  83: u,
                  84: h,
                }),
                t(n, [2, 24]),
                t(n, [2, 21]),
                { 33: [1, 128] },
                { 33: [2, 61] },
                { 71: [1, 130], 75: 129 },
                { 33: [1, 131] },
                { 33: [2, 67] },
                t(m, [2, 12]),
                t(f, [2, 26]),
                t(C, [2, 31]),
                t(y, [2, 29]),
                { 33: [2, 72], 42: 132, 73: 133, 74: q },
                t(N, [2, 69]),
                t(D, [2, 71]),
                t(p, [2, 15]),
                { 71: [1, 135], 76: [1, 134] },
                t(_, [2, 98]),
                t(d, [2, 16]),
                { 33: [1, 136] },
                { 33: [2, 73] },
                { 33: [2, 32] },
                t(_, [2, 99]),
                t(p, [2, 17]),
              ],
              defaultActions: {
                4: [2, 1],
                55: [2, 53],
                57: [2, 20],
                61: [2, 55],
                73: [2, 79],
                81: [2, 83],
                85: [2, 18],
                89: [2, 87],
                99: [2, 51],
                102: [2, 91],
                109: [2, 95],
                111: [2, 19],
                112: [2, 75],
                117: [2, 61],
                120: [2, 67],
                133: [2, 73],
                134: [2, 32],
              },
              parseError: function (t, e) {
                if (!e.recoverable) {
                  var r = new Error(t);
                  throw ((r.hash = e), r);
                }
                this.trace(t);
              },
              parse: function (t) {
                var e = this,
                  r = [0],
                  n = [null],
                  a = [],
                  i = this.table,
                  s = '',
                  o = 0,
                  l = 0,
                  c = 0,
                  u = a.slice.call(arguments, 1),
                  h = Object.create(this.lexer),
                  p = { yy: {} };
                for (var d in this.yy)
                  Object.prototype.hasOwnProperty.call(this.yy, d) && (p.yy[d] = this.yy[d]);
                h.setInput(t, p.yy),
                  (p.yy.lexer = h),
                  (p.yy.parser = this),
                  typeof h.yylloc > 'u' && (h.yylloc = {});
                var m = h.yylloc;
                a.push(m);
                var f = h.options && h.options.ranges;
                'function' == typeof p.yy.parseError
                  ? (this.parseError = p.yy.parseError)
                  : (this.parseError = Object.getPrototypeOf(this).parseError);
                for (
                  var g,
                    y,
                    b,
                    v,
                    S,
                    w,
                    k,
                    T,
                    E,
                    N = function () {
                      var t;
                      return 'number' != typeof (t = h.lex() || 1) && (t = e.symbols_[t] || t), t;
                    },
                    A = {};
                  ;
                ) {
                  if (
                    ((b = r[r.length - 1]),
                    this.defaultActions[b]
                      ? (v = this.defaultActions[b])
                      : ((null === g || typeof g > 'u') && (g = N()), (v = i[b] && i[b][g])),
                    typeof v > 'u' || !v.length || !v[0])
                  ) {
                    var P;
                    for (w in ((E = []), i[b]))
                      this.terminals_[w] && w > 2 && E.push("'" + this.terminals_[w] + "'");
                    (P = h.showPosition
                      ? 'Parse error on line ' +
                        (o + 1) +
                        ':\n' +
                        h.showPosition() +
                        '\nExpecting ' +
                        E.join(', ') +
                        ", got '" +
                        (this.terminals_[g] || g) +
                        "'"
                      : 'Parse error on line ' +
                        (o + 1) +
                        ': Unexpected ' +
                        (1 == g ? 'end of input' : "'" + (this.terminals_[g] || g) + "'")),
                      this.parseError(P, {
                        text: h.match,
                        token: this.terminals_[g] || g,
                        line: h.yylineno,
                        loc: m,
                        expected: E,
                      });
                  }
                  if (v[0] instanceof Array && v.length > 1)
                    throw new Error(
                      'Parse Error: multiple actions possible at state: ' + b + ', token: ' + g
                    );
                  switch (v[0]) {
                    case 1:
                      r.push(g),
                        n.push(h.yytext),
                        a.push(h.yylloc),
                        r.push(v[1]),
                        (g = null),
                        y
                          ? ((g = y), (y = null))
                          : ((l = h.yyleng),
                            (s = h.yytext),
                            (o = h.yylineno),
                            (m = h.yylloc),
                            c > 0 && c--);
                      break;
                    case 2:
                      if (
                        ((k = this.productions_[v[1]][1]),
                        (A.$ = n[n.length - k]),
                        (A._$ = {
                          first_line: a[a.length - (k || 1)].first_line,
                          last_line: a[a.length - 1].last_line,
                          first_column: a[a.length - (k || 1)].first_column,
                          last_column: a[a.length - 1].last_column,
                        }),
                        f &&
                          (A._$.range = [
                            a[a.length - (k || 1)].range[0],
                            a[a.length - 1].range[1],
                          ]),
                        typeof (S = this.performAction.apply(
                          A,
                          [s, l, o, p.yy, v[1], n, a].concat(u)
                        )) < 'u')
                      )
                        return S;
                      k &&
                        ((r = r.slice(0, -1 * k * 2)),
                        (n = n.slice(0, -1 * k)),
                        (a = a.slice(0, -1 * k))),
                        r.push(this.productions_[v[1]][0]),
                        n.push(A.$),
                        a.push(A._$),
                        (T = i[r[r.length - 2]][r[r.length - 1]]),
                        r.push(T);
                      break;
                    case 3:
                      return !0;
                  }
                }
                return !0;
              },
            },
            O = {
              EOF: 1,
              parseError: function (t, e) {
                if (!this.yy.parser) throw new Error(t);
                this.yy.parser.parseError(t, e);
              },
              setInput: function (t, e) {
                return (
                  (this.yy = e || this.yy || {}),
                  (this._input = t),
                  (this._more = this._backtrack = this.done = !1),
                  (this.yylineno = this.yyleng = 0),
                  (this.yytext = this.matched = this.match = ''),
                  (this.conditionStack = ['INITIAL']),
                  (this.yylloc = { first_line: 1, first_column: 0, last_line: 1, last_column: 0 }),
                  this.options.ranges && (this.yylloc.range = [0, 0]),
                  (this.offset = 0),
                  this
                );
              },
              input: function () {
                var t = this._input[0];
                return (
                  (this.yytext += t),
                  this.yyleng++,
                  this.offset++,
                  (this.match += t),
                  (this.matched += t),
                  t.match(/(?:\r\n?|\n).*/g)
                    ? (this.yylineno++, this.yylloc.last_line++)
                    : this.yylloc.last_column++,
                  this.options.ranges && this.yylloc.range[1]++,
                  (this._input = this._input.slice(1)),
                  t
                );
              },
              unput: function (t) {
                var e = t.length,
                  r = t.split(/(?:\r\n?|\n)/g);
                (this._input = t + this._input),
                  (this.yytext = this.yytext.substr(0, this.yytext.length - e)),
                  (this.offset -= e);
                var n = this.match.split(/(?:\r\n?|\n)/g);
                (this.match = this.match.substr(0, this.match.length - 1)),
                  (this.matched = this.matched.substr(0, this.matched.length - 1)),
                  r.length - 1 && (this.yylineno -= r.length - 1);
                var a = this.yylloc.range;
                return (
                  (this.yylloc = {
                    first_line: this.yylloc.first_line,
                    last_line: this.yylineno + 1,
                    first_column: this.yylloc.first_column,
                    last_column: r
                      ? (r.length === n.length ? this.yylloc.first_column : 0) +
                        n[n.length - r.length].length -
                        r[0].length
                      : this.yylloc.first_column - e,
                  }),
                  this.options.ranges && (this.yylloc.range = [a[0], a[0] + this.yyleng - e]),
                  (this.yyleng = this.yytext.length),
                  this
                );
              },
              more: function () {
                return (this._more = !0), this;
              },
              reject: function () {
                return this.options.backtrack_lexer
                  ? ((this._backtrack = !0), this)
                  : this.parseError(
                      'Lexical error on line ' +
                        (this.yylineno + 1) +
                        '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' +
                        this.showPosition(),
                      { text: '', token: null, line: this.yylineno }
                    );
              },
              less: function (t) {
                this.unput(this.match.slice(t));
              },
              pastInput: function () {
                var t = this.matched.substr(0, this.matched.length - this.match.length);
                return (t.length > 20 ? '...' : '') + t.substr(-20).replace(/\n/g, '');
              },
              upcomingInput: function () {
                var t = this.match;
                return (
                  t.length < 20 && (t += this._input.substr(0, 20 - t.length)),
                  (t.substr(0, 20) + (t.length > 20 ? '...' : '')).replace(/\n/g, '')
                );
              },
              showPosition: function () {
                var t = this.pastInput(),
                  e = new Array(t.length + 1).join('-');
                return t + this.upcomingInput() + '\n' + e + '^';
              },
              test_match: function (t, e) {
                var r, n, a;
                if (
                  (this.options.backtrack_lexer &&
                    ((a = {
                      yylineno: this.yylineno,
                      yylloc: {
                        first_line: this.yylloc.first_line,
                        last_line: this.last_line,
                        first_column: this.yylloc.first_column,
                        last_column: this.yylloc.last_column,
                      },
                      yytext: this.yytext,
                      match: this.match,
                      matches: this.matches,
                      matched: this.matched,
                      yyleng: this.yyleng,
                      offset: this.offset,
                      _more: this._more,
                      _input: this._input,
                      yy: this.yy,
                      conditionStack: this.conditionStack.slice(0),
                      done: this.done,
                    }),
                    this.options.ranges && (a.yylloc.range = this.yylloc.range.slice(0))),
                  (n = t[0].match(/(?:\r\n?|\n).*/g)) && (this.yylineno += n.length),
                  (this.yylloc = {
                    first_line: this.yylloc.last_line,
                    last_line: this.yylineno + 1,
                    first_column: this.yylloc.last_column,
                    last_column: n
                      ? n[n.length - 1].length - n[n.length - 1].match(/\r?\n?/)[0].length
                      : this.yylloc.last_column + t[0].length,
                  }),
                  (this.yytext += t[0]),
                  (this.match += t[0]),
                  (this.matches = t),
                  (this.yyleng = this.yytext.length),
                  this.options.ranges &&
                    (this.yylloc.range = [this.offset, (this.offset += this.yyleng)]),
                  (this._more = !1),
                  (this._backtrack = !1),
                  (this._input = this._input.slice(t[0].length)),
                  (this.matched += t[0]),
                  (r = this.performAction.call(
                    this,
                    this.yy,
                    this,
                    e,
                    this.conditionStack[this.conditionStack.length - 1]
                  )),
                  this.done && this._input && (this.done = !1),
                  r)
                )
                  return r;
                if (this._backtrack) {
                  for (var i in a) this[i] = a[i];
                  return !1;
                }
                return !1;
              },
              next: function () {
                if (this.done) return this.EOF;
                var t, e, r, n;
                this._input || (this.done = !0),
                  this._more || ((this.yytext = ''), (this.match = ''));
                for (var a = this._currentRules(), i = 0; i < a.length; i++)
                  if (
                    (r = this._input.match(this.rules[a[i]])) &&
                    (!e || r[0].length > e[0].length)
                  ) {
                    if (((e = r), (n = i), this.options.backtrack_lexer)) {
                      if (!1 !== (t = this.test_match(r, a[i]))) return t;
                      if (this._backtrack) {
                        e = !1;
                        continue;
                      }
                      return !1;
                    }
                    if (!this.options.flex) break;
                  }
                return e
                  ? !1 !== (t = this.test_match(e, a[n])) && t
                  : '' === this._input
                    ? this.EOF
                    : this.parseError(
                        'Lexical error on line ' +
                          (this.yylineno + 1) +
                          '. Unrecognized text.\n' +
                          this.showPosition(),
                        { text: '', token: null, line: this.yylineno }
                      );
              },
              lex: function () {
                return this.next() || this.lex();
              },
              begin: function (t) {
                this.conditionStack.push(t);
              },
              popState: function () {
                return this.conditionStack.length - 1 > 0
                  ? this.conditionStack.pop()
                  : this.conditionStack[0];
              },
              _currentRules: function () {
                return this.conditionStack.length &&
                  this.conditionStack[this.conditionStack.length - 1]
                  ? this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules
                  : this.conditions.INITIAL.rules;
              },
              topState: function (t) {
                return (t = this.conditionStack.length - 1 - Math.abs(t || 0)) >= 0
                  ? this.conditionStack[t]
                  : 'INITIAL';
              },
              pushState: function (t) {
                this.begin(t);
              },
              stateStackSize: function () {
                return this.conditionStack.length;
              },
              options: {},
              performAction: function (t, e, r, n) {
                function a(t, r) {
                  return (e.yytext = e.yytext.substring(t, e.yyleng - r + t));
                }
                switch (r) {
                  case 0:
                    if (
                      ('\\\\' === e.yytext.slice(-2)
                        ? (a(0, 1), this.begin('mu'))
                        : '\\' === e.yytext.slice(-1)
                          ? (a(0, 1), this.begin('emu'))
                          : this.begin('mu'),
                      e.yytext)
                    )
                      return 15;
                    break;
                  case 1:
                  case 5:
                    return 15;
                  case 2:
                    return this.popState(), 15;
                  case 3:
                    return this.begin('raw'), 15;
                  case 4:
                    return (
                      this.popState(),
                      'raw' === this.conditionStack[this.conditionStack.length - 1]
                        ? 15
                        : (a(5, 9), 18)
                    );
                  case 6:
                  case 22:
                    return this.popState(), 14;
                  case 7:
                    return 64;
                  case 8:
                    return 67;
                  case 9:
                    return 19;
                  case 10:
                    return this.popState(), this.begin('raw'), 23;
                  case 11:
                    return 56;
                  case 12:
                    return 60;
                  case 13:
                    return 29;
                  case 14:
                    return 47;
                  case 15:
                  case 16:
                    return this.popState(), 44;
                  case 17:
                    return 34;
                  case 18:
                    return 39;
                  case 19:
                    return 52;
                  case 20:
                  case 23:
                    return 48;
                  case 21:
                    this.unput(e.yytext), this.popState(), this.begin('com');
                    break;
                  case 24:
                    return 72;
                  case 25:
                  case 26:
                  case 41:
                    return 71;
                  case 27:
                    return 86;
                  case 28:
                    break;
                  case 29:
                    return this.popState(), 55;
                  case 30:
                    return this.popState(), 33;
                  case 31:
                    return (e.yytext = a(1, 2).replace(/\\"/g, '"')), 79;
                  case 32:
                    return (e.yytext = a(1, 2).replace(/\\'/g, "'")), 79;
                  case 33:
                    return 84;
                  case 34:
                  case 35:
                    return 81;
                  case 36:
                    return 82;
                  case 37:
                    return 83;
                  case 38:
                    return 80;
                  case 39:
                    return 74;
                  case 40:
                    return 76;
                  case 42:
                    return (e.yytext = e.yytext.replace(/\\([\\\]])/g, '$1')), 71;
                  case 43:
                    return 'INVALID';
                  case 44:
                    return 5;
                }
              },
              rules: [
                /^(?:[^\x00]*?(?=(\{\{)))/,
                /^(?:[^\x00]+)/,
                /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,
                /^(?:\{\{\{\{(?=[^/]))/,
                /^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/,
                /^(?:[^\x00]+?(?=(\{\{\{\{)))/,
                /^(?:[\s\S]*?--(~)?\}\})/,
                /^(?:\()/,
                /^(?:\))/,
                /^(?:\{\{\{\{)/,
                /^(?:\}\}\}\})/,
                /^(?:\{\{(~)?>)/,
                /^(?:\{\{(~)?#>)/,
                /^(?:\{\{(~)?#\*?)/,
                /^(?:\{\{(~)?\/)/,
                /^(?:\{\{(~)?\^\s*(~)?\}\})/,
                /^(?:\{\{(~)?\s*else\s*(~)?\}\})/,
                /^(?:\{\{(~)?\^)/,
                /^(?:\{\{(~)?\s*else\b)/,
                /^(?:\{\{(~)?\{)/,
                /^(?:\{\{(~)?&)/,
                /^(?:\{\{(~)?!--)/,
                /^(?:\{\{(~)?![\s\S]*?\}\})/,
                /^(?:\{\{(~)?\*?)/,
                /^(?:=)/,
                /^(?:\.\.)/,
                /^(?:\.(?=([=~}\s\/.)|])))/,
                /^(?:[\/.])/,
                /^(?:\s+)/,
                /^(?:\}(~)?\}\})/,
                /^(?:(~)?\}\})/,
                /^(?:"(\\["]|[^"])*")/,
                /^(?:'(\\[']|[^'])*')/,
                /^(?:@)/,
                /^(?:true(?=([~}\s)])))/,
                /^(?:false(?=([~}\s)])))/,
                /^(?:undefined(?=([~}\s)])))/,
                /^(?:null(?=([~}\s)])))/,
                /^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/,
                /^(?:as\s+\|)/,
                /^(?:\|)/,
                /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/,
                /^(?:\[(\\\]|[^\]])*\])/,
                /^(?:.)/,
                /^(?:$)/,
              ],
              conditions: {
                mu: {
                  rules: [
                    7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
                    28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
                  ],
                  inclusive: !1,
                },
                emu: { rules: [2], inclusive: !1 },
                com: { rules: [6], inclusive: !1 },
                raw: { rules: [3, 4, 5], inclusive: !1 },
                INITIAL: { rules: [0, 1, 44], inclusive: !0 },
              },
            };
          function B() {
            this.yy = {};
          }
          return (I.lexer = O), (B.prototype = I), (I.Parser = B), new B();
        })(),
        Kt = [
          'description',
          'fileName',
          'lineNumber',
          'endLineNumber',
          'message',
          'name',
          'number',
          'stack',
        ];
      function Qt(t, e) {
        var r,
          n,
          a,
          i,
          s = e && e.loc;
        s &&
          ((r = s.start.line),
          (n = s.end.line),
          (a = s.start.column),
          (i = s.end.column),
          (t += ' - ' + r + ':' + a));
        for (var o = Error.prototype.constructor.call(this, t), l = 0; l < Kt.length; l++)
          this[Kt[l]] = o[Kt[l]];
        Error.captureStackTrace && Error.captureStackTrace(this, Qt);
        try {
          s &&
            ((this.lineNumber = r),
            (this.endLineNumber = n),
            Object.defineProperty
              ? (Object.defineProperty(this, 'column', { value: a, enumerable: !0 }),
                Object.defineProperty(this, 'endColumn', { value: i, enumerable: !0 }))
              : ((this.column = a), (this.endColumn = i)));
        } catch {}
      }
      Qt.prototype = new Error();
      var Jt = Qt;
      function Yt() {
        this.parents = [];
      }
      function Zt(t) {
        this.acceptRequired(t, 'path'), this.acceptArray(t.params), this.acceptKey(t, 'hash');
      }
      function Xt(t) {
        Zt.call(this, t), this.acceptKey(t, 'program'), this.acceptKey(t, 'inverse');
      }
      function te(t) {
        this.acceptRequired(t, 'name'), this.acceptArray(t.params), this.acceptKey(t, 'hash');
      }
      Yt.prototype = {
        constructor: Yt,
        mutating: !1,
        acceptKey: function (t, e) {
          var r = this.accept(t[e]);
          if (this.mutating) {
            if (r && !Yt.prototype[r.type])
              throw new Jt(
                'Unexpected node type "' + r.type + '" found when accepting ' + e + ' on ' + t.type
              );
            t[e] = r;
          }
        },
        acceptRequired: function (t, e) {
          if ((this.acceptKey(t, e), !t[e])) throw new Jt(t.type + ' requires ' + e);
        },
        acceptArray: function (t) {
          for (var e = 0, r = t.length; e < r; e++)
            this.acceptKey(t, e), t[e] || (t.splice(e, 1), e--, r--);
        },
        accept: function (t) {
          if (t) {
            if (!this[t.type]) throw new Jt('Unknown type: ' + t.type, t);
            this.current && this.parents.unshift(this.current), (this.current = t);
            var e = this[t.type](t);
            if (((this.current = this.parents.shift()), !this.mutating || e)) return e;
            if (!1 !== e) return t;
          }
        },
        Program: function (t) {
          this.acceptArray(t.body);
        },
        MustacheStatement: Zt,
        Decorator: Zt,
        BlockStatement: Xt,
        DecoratorBlock: Xt,
        PartialStatement: te,
        PartialBlockStatement: function (t) {
          te.call(this, t), this.acceptKey(t, 'program');
        },
        ContentStatement: function () {},
        CommentStatement: function () {},
        SubExpression: Zt,
        PathExpression: function () {},
        StringLiteral: function () {},
        NumberLiteral: function () {},
        BooleanLiteral: function () {},
        UndefinedLiteral: function () {},
        NullLiteral: function () {},
        Hash: function (t) {
          this.acceptArray(t.pairs);
        },
        HashPair: function (t) {
          this.acceptRequired(t, 'value');
        },
      };
      var ee = Yt;
      function re(t) {
        void 0 === t && (t = {}), (this.options = t);
      }
      function ne(t, e, r) {
        void 0 === e && (e = t.length);
        var n = t[e - 1],
          a = t[e - 2];
        return n
          ? 'ContentStatement' === n.type
            ? (a || !r ? /\r?\n\s*?$/ : /(^|\r?\n)\s*?$/).test(n.original)
            : void 0
          : r;
      }
      function ae(t, e, r) {
        void 0 === e && (e = -1);
        var n = t[e + 1],
          a = t[e + 2];
        return n
          ? 'ContentStatement' === n.type
            ? (a || !r ? /^\s*?\r?\n/ : /^\s*?(\r?\n|$)/).test(n.original)
            : void 0
          : r;
      }
      function ie(t, e, r) {
        var n = t[null == e ? 0 : e + 1];
        if (n && 'ContentStatement' === n.type && (r || !n.rightStripped)) {
          var a = n.value;
          (n.value = n.value.replace(r ? /^\s+/ : /^[ \t]*\r?\n?/, '')),
            (n.rightStripped = n.value !== a);
        }
      }
      function se(t, e, r) {
        var n = t[null == e ? t.length - 1 : e - 1];
        if (n && 'ContentStatement' === n.type && (r || !n.leftStripped)) {
          var a = n.value;
          return (
            (n.value = n.value.replace(r ? /\s+$/ : /[ \t]+$/, '')),
            (n.leftStripped = n.value !== a),
            n.leftStripped
          );
        }
      }
      (re.prototype = new ee()),
        (re.prototype.Program = function (t) {
          var e = !this.options.ignoreStandalone,
            r = !this.isRootSeen;
          this.isRootSeen = !0;
          for (var n = t.body, a = 0, i = n.length; a < i; a++) {
            var s = n[a],
              o = this.accept(s);
            if (o) {
              var l = ne(n, a, r),
                c = ae(n, a, r),
                u = o.openStandalone && l,
                h = o.closeStandalone && c,
                p = o.inlineStandalone && l && c;
              o.close && ie(n, a, !0),
                o.open && se(n, a, !0),
                e &&
                  p &&
                  (ie(n, a),
                  se(n, a) &&
                    'PartialStatement' === s.type &&
                    (s.indent = /([ \t]+$)/.exec(n[a - 1].original)[1])),
                e && u && (ie((s.program || s.inverse).body), se(n, a)),
                e && h && (ie(n, a), se((s.inverse || s.program).body));
            }
          }
          return t;
        }),
        (re.prototype.BlockStatement =
          re.prototype.DecoratorBlock =
          re.prototype.PartialBlockStatement =
            function (t) {
              this.accept(t.program), this.accept(t.inverse);
              var e = t.program || t.inverse,
                r = t.program && t.inverse,
                n = r,
                a = r;
              if (r && r.chained)
                for (n = r.body[0].program; a.chained; ) a = a.body[a.body.length - 1].program;
              var i = {
                open: t.openStrip.open,
                close: t.closeStrip.close,
                openStandalone: ae(e.body),
                closeStandalone: ne((n || e).body),
              };
              if ((t.openStrip.close && ie(e.body, null, !0), r)) {
                var s = t.inverseStrip;
                s.open && se(e.body, null, !0),
                  s.close && ie(n.body, null, !0),
                  t.closeStrip.open && se(a.body, null, !0),
                  !this.options.ignoreStandalone &&
                    ne(e.body) &&
                    ae(n.body) &&
                    (se(e.body), ie(n.body));
              } else t.closeStrip.open && se(e.body, null, !0);
              return i;
            }),
        (re.prototype.Decorator = re.prototype.MustacheStatement =
          function (t) {
            return t.strip;
          }),
        (re.prototype.PartialStatement = re.prototype.CommentStatement =
          function (t) {
            var e = t.strip || {};
            return { inlineStandalone: !0, open: e.open, close: e.close };
          });
      var oe = re,
        le = {};
      function ce(t, e) {
        if (((e = e.path ? e.path.original : e), t.path.original !== e)) {
          var r = { loc: t.path.loc };
          throw new Jt(t.path.original + " doesn't match " + e, r);
        }
      }
      function ue(t, e) {
        (this.source = t),
          (this.start = { line: e.first_line, column: e.first_column }),
          (this.end = { line: e.last_line, column: e.last_column });
      }
      function he(t) {
        return /^\[.*\]$/.test(t) ? t.substring(1, t.length - 1) : t;
      }
      function pe(t, e) {
        return { open: '~' === t.charAt(2), close: '~' === e.charAt(e.length - 3) };
      }
      function de(t) {
        return t.replace(/^\{\{~?!-?-?/, '').replace(/-?-?~?\}\}$/, '');
      }
      function me(t, e, r) {
        r = this.locInfo(r);
        for (var n = t ? '@' : '', a = [], i = 0, s = 0, o = e.length; s < o; s++) {
          var l = e[s].part,
            c = e[s].original !== l;
          if (((n += (e[s].separator || '') + l), c || ('..' !== l && '.' !== l && 'this' !== l)))
            a.push(l);
          else {
            if (a.length > 0) throw new Jt('Invalid path: ' + n, { loc: r });
            '..' === l && i++;
          }
        }
        return { type: 'PathExpression', data: t, depth: i, parts: a, original: n, loc: r };
      }
      function fe(t, e, r, n, a, i) {
        var s = n.charAt(3) || n.charAt(2),
          o = '{' !== s && '&' !== s;
        return {
          type: /\*/.test(n) ? 'Decorator' : 'MustacheStatement',
          path: t,
          params: e,
          hash: r,
          escaped: o,
          strip: a,
          loc: this.locInfo(i),
        };
      }
      function ge(t, e, r, n) {
        ce(t, r);
        var a = { type: 'Program', body: e, strip: {}, loc: (n = this.locInfo(n)) };
        return {
          type: 'BlockStatement',
          path: t.path,
          params: t.params,
          hash: t.hash,
          program: a,
          openStrip: {},
          inverseStrip: {},
          closeStrip: {},
          loc: n,
        };
      }
      function ye(t, e, r, n, a, i) {
        n && n.path && ce(t, n);
        var s,
          o,
          l = /\*/.test(t.open);
        if (((e.blockParams = t.blockParams), r)) {
          if (l) throw new Jt('Unexpected inverse block on decorator', r);
          r.chain && (r.program.body[0].closeStrip = n.strip), (o = r.strip), (s = r.program);
        }
        return (
          a && ((a = s), (s = e), (e = a)),
          {
            type: l ? 'DecoratorBlock' : 'BlockStatement',
            path: t.path,
            params: t.params,
            hash: t.hash,
            program: e,
            inverse: s,
            openStrip: t.strip,
            inverseStrip: o,
            closeStrip: n && n.strip,
            loc: this.locInfo(i),
          }
        );
      }
      function be(t, e) {
        if (!e && t.length) {
          var r = t[0].loc,
            n = t[t.length - 1].loc;
          r &&
            n &&
            (e = {
              source: r.source,
              start: { line: r.start.line, column: r.start.column },
              end: { line: n.end.line, column: n.end.column },
            });
        }
        return { type: 'Program', body: t, strip: {}, loc: e };
      }
      function ve(t, e, r, n) {
        return (
          ce(t, r),
          {
            type: 'PartialBlockStatement',
            name: t.path,
            params: t.params,
            hash: t.hash,
            program: e,
            openStrip: t.strip,
            closeStrip: r && r.strip,
            loc: this.locInfo(n),
          }
        );
      }
      i(le, {
        SourceLocation: () => ue,
        id: () => he,
        prepareBlock: () => ye,
        prepareMustache: () => fe,
        preparePartialBlock: () => ve,
        preparePath: () => me,
        prepareProgram: () => be,
        prepareRawBlock: () => ge,
        stripComment: () => de,
        stripFlags: () => pe,
      });
      var Se,
        we = {};
      for (Se in le) Object.prototype.hasOwnProperty.call(le, Se) && (we[Se] = le[Se]);
      function ke(t, e) {
        return 'Program' === t.type
          ? t
          : ((Gt.yy = we),
            (Gt.yy.locInfo = function (t) {
              return new ue(e && e.srcName, t);
            }),
            Gt.parse(t));
      }
      function Te(t, e) {
        var r = ke(t, e);
        return new oe(e).accept(r);
      }
      var Ee = {
          Aacute: 'Á',
          aacute: 'á',
          Abreve: 'Ă',
          abreve: 'ă',
          ac: '∾',
          acd: '∿',
          acE: '∾̳',
          Acirc: 'Â',
          acirc: 'â',
          acute: '´',
          Acy: 'А',
          acy: 'а',
          AElig: 'Æ',
          aelig: 'æ',
          af: '⁡',
          Afr: '𝔄',
          afr: '𝔞',
          Agrave: 'À',
          agrave: 'à',
          alefsym: 'ℵ',
          aleph: 'ℵ',
          Alpha: 'Α',
          alpha: 'α',
          Amacr: 'Ā',
          amacr: 'ā',
          amalg: '⨿',
          amp: '&',
          AMP: '&',
          andand: '⩕',
          And: '⩓',
          and: '∧',
          andd: '⩜',
          andslope: '⩘',
          andv: '⩚',
          ang: '∠',
          ange: '⦤',
          angle: '∠',
          angmsdaa: '⦨',
          angmsdab: '⦩',
          angmsdac: '⦪',
          angmsdad: '⦫',
          angmsdae: '⦬',
          angmsdaf: '⦭',
          angmsdag: '⦮',
          angmsdah: '⦯',
          angmsd: '∡',
          angrt: '∟',
          angrtvb: '⊾',
          angrtvbd: '⦝',
          angsph: '∢',
          angst: 'Å',
          angzarr: '⍼',
          Aogon: 'Ą',
          aogon: 'ą',
          Aopf: '𝔸',
          aopf: '𝕒',
          apacir: '⩯',
          ap: '≈',
          apE: '⩰',
          ape: '≊',
          apid: '≋',
          apos: "'",
          ApplyFunction: '⁡',
          approx: '≈',
          approxeq: '≊',
          Aring: 'Å',
          aring: 'å',
          Ascr: '𝒜',
          ascr: '𝒶',
          Assign: '≔',
          ast: '*',
          asymp: '≈',
          asympeq: '≍',
          Atilde: 'Ã',
          atilde: 'ã',
          Auml: 'Ä',
          auml: 'ä',
          awconint: '∳',
          awint: '⨑',
          backcong: '≌',
          backepsilon: '϶',
          backprime: '‵',
          backsim: '∽',
          backsimeq: '⋍',
          Backslash: '∖',
          Barv: '⫧',
          barvee: '⊽',
          barwed: '⌅',
          Barwed: '⌆',
          barwedge: '⌅',
          bbrk: '⎵',
          bbrktbrk: '⎶',
          bcong: '≌',
          Bcy: 'Б',
          bcy: 'б',
          bdquo: '„',
          becaus: '∵',
          because: '∵',
          Because: '∵',
          bemptyv: '⦰',
          bepsi: '϶',
          bernou: 'ℬ',
          Bernoullis: 'ℬ',
          Beta: 'Β',
          beta: 'β',
          beth: 'ℶ',
          between: '≬',
          Bfr: '𝔅',
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
          bNot: '⫭',
          bnot: '⌐',
          Bopf: '𝔹',
          bopf: '𝕓',
          bot: '⊥',
          bottom: '⊥',
          bowtie: '⋈',
          boxbox: '⧉',
          boxdl: '┐',
          boxdL: '╕',
          boxDl: '╖',
          boxDL: '╗',
          boxdr: '┌',
          boxdR: '╒',
          boxDr: '╓',
          boxDR: '╔',
          boxh: '─',
          boxH: '═',
          boxhd: '┬',
          boxHd: '╤',
          boxhD: '╥',
          boxHD: '╦',
          boxhu: '┴',
          boxHu: '╧',
          boxhU: '╨',
          boxHU: '╩',
          boxminus: '⊟',
          boxplus: '⊞',
          boxtimes: '⊠',
          boxul: '┘',
          boxuL: '╛',
          boxUl: '╜',
          boxUL: '╝',
          boxur: '└',
          boxuR: '╘',
          boxUr: '╙',
          boxUR: '╚',
          boxv: '│',
          boxV: '║',
          boxvh: '┼',
          boxvH: '╪',
          boxVh: '╫',
          boxVH: '╬',
          boxvl: '┤',
          boxvL: '╡',
          boxVl: '╢',
          boxVL: '╣',
          boxvr: '├',
          boxvR: '╞',
          boxVr: '╟',
          boxVR: '╠',
          bprime: '‵',
          breve: '˘',
          Breve: '˘',
          brvbar: '¦',
          bscr: '𝒷',
          Bscr: 'ℬ',
          bsemi: '⁏',
          bsim: '∽',
          bsime: '⋍',
          bsolb: '⧅',
          bsol: '\\',
          bsolhsub: '⟈',
          bull: '•',
          bullet: '•',
          bump: '≎',
          bumpE: '⪮',
          bumpe: '≏',
          Bumpeq: '≎',
          bumpeq: '≏',
          Cacute: 'Ć',
          cacute: 'ć',
          capand: '⩄',
          capbrcup: '⩉',
          capcap: '⩋',
          cap: '∩',
          Cap: '⋒',
          capcup: '⩇',
          capdot: '⩀',
          CapitalDifferentialD: 'ⅅ',
          caps: '∩︀',
          caret: '⁁',
          caron: 'ˇ',
          Cayleys: 'ℭ',
          ccaps: '⩍',
          Ccaron: 'Č',
          ccaron: 'č',
          Ccedil: 'Ç',
          ccedil: 'ç',
          Ccirc: 'Ĉ',
          ccirc: 'ĉ',
          Cconint: '∰',
          ccups: '⩌',
          ccupssm: '⩐',
          Cdot: 'Ċ',
          cdot: 'ċ',
          cedil: '¸',
          Cedilla: '¸',
          cemptyv: '⦲',
          cent: '¢',
          centerdot: '·',
          CenterDot: '·',
          cfr: '𝔠',
          Cfr: 'ℭ',
          CHcy: 'Ч',
          chcy: 'ч',
          check: '✓',
          checkmark: '✓',
          Chi: 'Χ',
          chi: 'χ',
          circ: 'ˆ',
          circeq: '≗',
          circlearrowleft: '↺',
          circlearrowright: '↻',
          circledast: '⊛',
          circledcirc: '⊚',
          circleddash: '⊝',
          CircleDot: '⊙',
          circledR: '®',
          circledS: 'Ⓢ',
          CircleMinus: '⊖',
          CirclePlus: '⊕',
          CircleTimes: '⊗',
          cir: '○',
          cirE: '⧃',
          cire: '≗',
          cirfnint: '⨐',
          cirmid: '⫯',
          cirscir: '⧂',
          ClockwiseContourIntegral: '∲',
          CloseCurlyDoubleQuote: '”',
          CloseCurlyQuote: '’',
          clubs: '♣',
          clubsuit: '♣',
          colon: ':',
          Colon: '∷',
          Colone: '⩴',
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
          Congruent: '≡',
          conint: '∮',
          Conint: '∯',
          ContourIntegral: '∮',
          copf: '𝕔',
          Copf: 'ℂ',
          coprod: '∐',
          Coproduct: '∐',
          copy: '©',
          COPY: '©',
          copysr: '℗',
          CounterClockwiseContourIntegral: '∳',
          crarr: '↵',
          cross: '✗',
          Cross: '⨯',
          Cscr: '𝒞',
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
          cupbrcap: '⩈',
          cupcap: '⩆',
          CupCap: '≍',
          cup: '∪',
          Cup: '⋓',
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
          curren: '¤',
          curvearrowleft: '↶',
          curvearrowright: '↷',
          cuvee: '⋎',
          cuwed: '⋏',
          cwconint: '∲',
          cwint: '∱',
          cylcty: '⌭',
          dagger: '†',
          Dagger: '‡',
          daleth: 'ℸ',
          darr: '↓',
          Darr: '↡',
          dArr: '⇓',
          dash: '‐',
          Dashv: '⫤',
          dashv: '⊣',
          dbkarow: '⤏',
          dblac: '˝',
          Dcaron: 'Ď',
          dcaron: 'ď',
          Dcy: 'Д',
          dcy: 'д',
          ddagger: '‡',
          ddarr: '⇊',
          DD: 'ⅅ',
          dd: 'ⅆ',
          DDotrahd: '⤑',
          ddotseq: '⩷',
          deg: '°',
          Del: '∇',
          Delta: 'Δ',
          delta: 'δ',
          demptyv: '⦱',
          dfisht: '⥿',
          Dfr: '𝔇',
          dfr: '𝔡',
          dHar: '⥥',
          dharl: '⇃',
          dharr: '⇂',
          DiacriticalAcute: '´',
          DiacriticalDot: '˙',
          DiacriticalDoubleAcute: '˝',
          DiacriticalGrave: '`',
          DiacriticalTilde: '˜',
          diam: '⋄',
          diamond: '⋄',
          Diamond: '⋄',
          diamondsuit: '♦',
          diams: '♦',
          die: '¨',
          DifferentialD: 'ⅆ',
          digamma: 'ϝ',
          disin: '⋲',
          div: '÷',
          divide: '÷',
          divideontimes: '⋇',
          divonx: '⋇',
          DJcy: 'Ђ',
          djcy: 'ђ',
          dlcorn: '⌞',
          dlcrop: '⌍',
          dollar: '$',
          Dopf: '𝔻',
          dopf: '𝕕',
          Dot: '¨',
          dot: '˙',
          DotDot: '⃜',
          doteq: '≐',
          doteqdot: '≑',
          DotEqual: '≐',
          dotminus: '∸',
          dotplus: '∔',
          dotsquare: '⊡',
          doublebarwedge: '⌆',
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
          DownArrowBar: '⤓',
          downarrow: '↓',
          DownArrow: '↓',
          Downarrow: '⇓',
          DownArrowUpArrow: '⇵',
          DownBreve: '̑',
          downdownarrows: '⇊',
          downharpoonleft: '⇃',
          downharpoonright: '⇂',
          DownLeftRightVector: '⥐',
          DownLeftTeeVector: '⥞',
          DownLeftVectorBar: '⥖',
          DownLeftVector: '↽',
          DownRightTeeVector: '⥟',
          DownRightVectorBar: '⥗',
          DownRightVector: '⇁',
          DownTeeArrow: '↧',
          DownTee: '⊤',
          drbkarow: '⤐',
          drcorn: '⌟',
          drcrop: '⌌',
          Dscr: '𝒟',
          dscr: '𝒹',
          DScy: 'Ѕ',
          dscy: 'ѕ',
          dsol: '⧶',
          Dstrok: 'Đ',
          dstrok: 'đ',
          dtdot: '⋱',
          dtri: '▿',
          dtrif: '▾',
          duarr: '⇵',
          duhar: '⥯',
          dwangle: '⦦',
          DZcy: 'Џ',
          dzcy: 'џ',
          dzigrarr: '⟿',
          Eacute: 'É',
          eacute: 'é',
          easter: '⩮',
          Ecaron: 'Ě',
          ecaron: 'ě',
          Ecirc: 'Ê',
          ecirc: 'ê',
          ecir: '≖',
          ecolon: '≕',
          Ecy: 'Э',
          ecy: 'э',
          eDDot: '⩷',
          Edot: 'Ė',
          edot: 'ė',
          eDot: '≑',
          ee: 'ⅇ',
          efDot: '≒',
          Efr: '𝔈',
          efr: '𝔢',
          eg: '⪚',
          Egrave: 'È',
          egrave: 'è',
          egs: '⪖',
          egsdot: '⪘',
          el: '⪙',
          Element: '∈',
          elinters: '⏧',
          ell: 'ℓ',
          els: '⪕',
          elsdot: '⪗',
          Emacr: 'Ē',
          emacr: 'ē',
          empty: '∅',
          emptyset: '∅',
          EmptySmallSquare: '◻',
          emptyv: '∅',
          EmptyVerySmallSquare: '▫',
          emsp13: ' ',
          emsp14: ' ',
          emsp: ' ',
          ENG: 'Ŋ',
          eng: 'ŋ',
          ensp: ' ',
          Eogon: 'Ę',
          eogon: 'ę',
          Eopf: '𝔼',
          eopf: '𝕖',
          epar: '⋕',
          eparsl: '⧣',
          eplus: '⩱',
          epsi: 'ε',
          Epsilon: 'Ε',
          epsilon: 'ε',
          epsiv: 'ϵ',
          eqcirc: '≖',
          eqcolon: '≕',
          eqsim: '≂',
          eqslantgtr: '⪖',
          eqslantless: '⪕',
          Equal: '⩵',
          equals: '=',
          EqualTilde: '≂',
          equest: '≟',
          Equilibrium: '⇌',
          equiv: '≡',
          equivDD: '⩸',
          eqvparsl: '⧥',
          erarr: '⥱',
          erDot: '≓',
          escr: 'ℯ',
          Escr: 'ℰ',
          esdot: '≐',
          Esim: '⩳',
          esim: '≂',
          Eta: 'Η',
          eta: 'η',
          ETH: 'Ð',
          eth: 'ð',
          Euml: 'Ë',
          euml: 'ë',
          euro: '€',
          excl: '!',
          exist: '∃',
          Exists: '∃',
          expectation: 'ℰ',
          exponentiale: 'ⅇ',
          ExponentialE: 'ⅇ',
          fallingdotseq: '≒',
          Fcy: 'Ф',
          fcy: 'ф',
          female: '♀',
          ffilig: 'ﬃ',
          fflig: 'ﬀ',
          ffllig: 'ﬄ',
          Ffr: '𝔉',
          ffr: '𝔣',
          filig: 'ﬁ',
          FilledSmallSquare: '◼',
          FilledVerySmallSquare: '▪',
          fjlig: 'fj',
          flat: '♭',
          fllig: 'ﬂ',
          fltns: '▱',
          fnof: 'ƒ',
          Fopf: '𝔽',
          fopf: '𝕗',
          forall: '∀',
          ForAll: '∀',
          fork: '⋔',
          forkv: '⫙',
          Fouriertrf: 'ℱ',
          fpartint: '⨍',
          frac12: '½',
          frac13: '⅓',
          frac14: '¼',
          frac15: '⅕',
          frac16: '⅙',
          frac18: '⅛',
          frac23: '⅔',
          frac25: '⅖',
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
          Fscr: 'ℱ',
          gacute: 'ǵ',
          Gamma: 'Γ',
          gamma: 'γ',
          Gammad: 'Ϝ',
          gammad: 'ϝ',
          gap: '⪆',
          Gbreve: 'Ğ',
          gbreve: 'ğ',
          Gcedil: 'Ģ',
          Gcirc: 'Ĝ',
          gcirc: 'ĝ',
          Gcy: 'Г',
          gcy: 'г',
          Gdot: 'Ġ',
          gdot: 'ġ',
          ge: '≥',
          gE: '≧',
          gEl: '⪌',
          gel: '⋛',
          geq: '≥',
          geqq: '≧',
          geqslant: '⩾',
          gescc: '⪩',
          ges: '⩾',
          gesdot: '⪀',
          gesdoto: '⪂',
          gesdotol: '⪄',
          gesl: '⋛︀',
          gesles: '⪔',
          Gfr: '𝔊',
          gfr: '𝔤',
          gg: '≫',
          Gg: '⋙',
          ggg: '⋙',
          gimel: 'ℷ',
          GJcy: 'Ѓ',
          gjcy: 'ѓ',
          gla: '⪥',
          gl: '≷',
          glE: '⪒',
          glj: '⪤',
          gnap: '⪊',
          gnapprox: '⪊',
          gne: '⪈',
          gnE: '≩',
          gneq: '⪈',
          gneqq: '≩',
          gnsim: '⋧',
          Gopf: '𝔾',
          gopf: '𝕘',
          grave: '`',
          GreaterEqual: '≥',
          GreaterEqualLess: '⋛',
          GreaterFullEqual: '≧',
          GreaterGreater: '⪢',
          GreaterLess: '≷',
          GreaterSlantEqual: '⩾',
          GreaterTilde: '≳',
          Gscr: '𝒢',
          gscr: 'ℊ',
          gsim: '≳',
          gsime: '⪎',
          gsiml: '⪐',
          gtcc: '⪧',
          gtcir: '⩺',
          gt: '>',
          GT: '>',
          Gt: '≫',
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
          Hacek: 'ˇ',
          hairsp: ' ',
          half: '½',
          hamilt: 'ℋ',
          HARDcy: 'Ъ',
          hardcy: 'ъ',
          harrcir: '⥈',
          harr: '↔',
          hArr: '⇔',
          harrw: '↭',
          Hat: '^',
          hbar: 'ℏ',
          Hcirc: 'Ĥ',
          hcirc: 'ĥ',
          hearts: '♥',
          heartsuit: '♥',
          hellip: '…',
          hercon: '⊹',
          hfr: '𝔥',
          Hfr: 'ℌ',
          HilbertSpace: 'ℋ',
          hksearow: '⤥',
          hkswarow: '⤦',
          hoarr: '⇿',
          homtht: '∻',
          hookleftarrow: '↩',
          hookrightarrow: '↪',
          hopf: '𝕙',
          Hopf: 'ℍ',
          horbar: '―',
          HorizontalLine: '─',
          hscr: '𝒽',
          Hscr: 'ℋ',
          hslash: 'ℏ',
          Hstrok: 'Ħ',
          hstrok: 'ħ',
          HumpDownHump: '≎',
          HumpEqual: '≏',
          hybull: '⁃',
          hyphen: '‐',
          Iacute: 'Í',
          iacute: 'í',
          ic: '⁣',
          Icirc: 'Î',
          icirc: 'î',
          Icy: 'И',
          icy: 'и',
          Idot: 'İ',
          IEcy: 'Е',
          iecy: 'е',
          iexcl: '¡',
          iff: '⇔',
          ifr: '𝔦',
          Ifr: 'ℑ',
          Igrave: 'Ì',
          igrave: 'ì',
          ii: 'ⅈ',
          iiiint: '⨌',
          iiint: '∭',
          iinfin: '⧜',
          iiota: '℩',
          IJlig: 'Ĳ',
          ijlig: 'ĳ',
          Imacr: 'Ī',
          imacr: 'ī',
          image: 'ℑ',
          ImaginaryI: 'ⅈ',
          imagline: 'ℐ',
          imagpart: 'ℑ',
          imath: 'ı',
          Im: 'ℑ',
          imof: '⊷',
          imped: 'Ƶ',
          Implies: '⇒',
          incare: '℅',
          in: '∈',
          infin: '∞',
          infintie: '⧝',
          inodot: 'ı',
          intcal: '⊺',
          int: '∫',
          Int: '∬',
          integers: 'ℤ',
          Integral: '∫',
          intercal: '⊺',
          Intersection: '⋂',
          intlarhk: '⨗',
          intprod: '⨼',
          InvisibleComma: '⁣',
          InvisibleTimes: '⁢',
          IOcy: 'Ё',
          iocy: 'ё',
          Iogon: 'Į',
          iogon: 'į',
          Iopf: '𝕀',
          iopf: '𝕚',
          Iota: 'Ι',
          iota: 'ι',
          iprod: '⨼',
          iquest: '¿',
          iscr: '𝒾',
          Iscr: 'ℐ',
          isin: '∈',
          isindot: '⋵',
          isinE: '⋹',
          isins: '⋴',
          isinsv: '⋳',
          isinv: '∈',
          it: '⁢',
          Itilde: 'Ĩ',
          itilde: 'ĩ',
          Iukcy: 'І',
          iukcy: 'і',
          Iuml: 'Ï',
          iuml: 'ï',
          Jcirc: 'Ĵ',
          jcirc: 'ĵ',
          Jcy: 'Й',
          jcy: 'й',
          Jfr: '𝔍',
          jfr: '𝔧',
          jmath: 'ȷ',
          Jopf: '𝕁',
          jopf: '𝕛',
          Jscr: '𝒥',
          jscr: '𝒿',
          Jsercy: 'Ј',
          jsercy: 'ј',
          Jukcy: 'Є',
          jukcy: 'є',
          Kappa: 'Κ',
          kappa: 'κ',
          kappav: 'ϰ',
          Kcedil: 'Ķ',
          kcedil: 'ķ',
          Kcy: 'К',
          kcy: 'к',
          Kfr: '𝔎',
          kfr: '𝔨',
          kgreen: 'ĸ',
          KHcy: 'Х',
          khcy: 'х',
          KJcy: 'Ќ',
          kjcy: 'ќ',
          Kopf: '𝕂',
          kopf: '𝕜',
          Kscr: '𝒦',
          kscr: '𝓀',
          lAarr: '⇚',
          Lacute: 'Ĺ',
          lacute: 'ĺ',
          laemptyv: '⦴',
          lagran: 'ℒ',
          Lambda: 'Λ',
          lambda: 'λ',
          lang: '⟨',
          Lang: '⟪',
          langd: '⦑',
          langle: '⟨',
          lap: '⪅',
          Laplacetrf: 'ℒ',
          laquo: '«',
          larrb: '⇤',
          larrbfs: '⤟',
          larr: '←',
          Larr: '↞',
          lArr: '⇐',
          larrfs: '⤝',
          larrhk: '↩',
          larrlp: '↫',
          larrpl: '⤹',
          larrsim: '⥳',
          larrtl: '↢',
          latail: '⤙',
          lAtail: '⤛',
          lat: '⪫',
          late: '⪭',
          lates: '⪭︀',
          lbarr: '⤌',
          lBarr: '⤎',
          lbbrk: '❲',
          lbrace: '{',
          lbrack: '[',
          lbrke: '⦋',
          lbrksld: '⦏',
          lbrkslu: '⦍',
          Lcaron: 'Ľ',
          lcaron: 'ľ',
          Lcedil: 'Ļ',
          lcedil: 'ļ',
          lceil: '⌈',
          lcub: '{',
          Lcy: 'Л',
          lcy: 'л',
          ldca: '⤶',
          ldquo: '“',
          ldquor: '„',
          ldrdhar: '⥧',
          ldrushar: '⥋',
          ldsh: '↲',
          le: '≤',
          lE: '≦',
          LeftAngleBracket: '⟨',
          LeftArrowBar: '⇤',
          leftarrow: '←',
          LeftArrow: '←',
          Leftarrow: '⇐',
          LeftArrowRightArrow: '⇆',
          leftarrowtail: '↢',
          LeftCeiling: '⌈',
          LeftDoubleBracket: '⟦',
          LeftDownTeeVector: '⥡',
          LeftDownVectorBar: '⥙',
          LeftDownVector: '⇃',
          LeftFloor: '⌊',
          leftharpoondown: '↽',
          leftharpoonup: '↼',
          leftleftarrows: '⇇',
          leftrightarrow: '↔',
          LeftRightArrow: '↔',
          Leftrightarrow: '⇔',
          leftrightarrows: '⇆',
          leftrightharpoons: '⇋',
          leftrightsquigarrow: '↭',
          LeftRightVector: '⥎',
          LeftTeeArrow: '↤',
          LeftTee: '⊣',
          LeftTeeVector: '⥚',
          leftthreetimes: '⋋',
          LeftTriangleBar: '⧏',
          LeftTriangle: '⊲',
          LeftTriangleEqual: '⊴',
          LeftUpDownVector: '⥑',
          LeftUpTeeVector: '⥠',
          LeftUpVectorBar: '⥘',
          LeftUpVector: '↿',
          LeftVectorBar: '⥒',
          LeftVector: '↼',
          lEg: '⪋',
          leg: '⋚',
          leq: '≤',
          leqq: '≦',
          leqslant: '⩽',
          lescc: '⪨',
          les: '⩽',
          lesdot: '⩿',
          lesdoto: '⪁',
          lesdotor: '⪃',
          lesg: '⋚︀',
          lesges: '⪓',
          lessapprox: '⪅',
          lessdot: '⋖',
          lesseqgtr: '⋚',
          lesseqqgtr: '⪋',
          LessEqualGreater: '⋚',
          LessFullEqual: '≦',
          LessGreater: '≶',
          lessgtr: '≶',
          LessLess: '⪡',
          lesssim: '≲',
          LessSlantEqual: '⩽',
          LessTilde: '≲',
          lfisht: '⥼',
          lfloor: '⌊',
          Lfr: '𝔏',
          lfr: '𝔩',
          lg: '≶',
          lgE: '⪑',
          lHar: '⥢',
          lhard: '↽',
          lharu: '↼',
          lharul: '⥪',
          lhblk: '▄',
          LJcy: 'Љ',
          ljcy: 'љ',
          llarr: '⇇',
          ll: '≪',
          Ll: '⋘',
          llcorner: '⌞',
          Lleftarrow: '⇚',
          llhard: '⥫',
          lltri: '◺',
          Lmidot: 'Ŀ',
          lmidot: 'ŀ',
          lmoustache: '⎰',
          lmoust: '⎰',
          lnap: '⪉',
          lnapprox: '⪉',
          lne: '⪇',
          lnE: '≨',
          lneq: '⪇',
          lneqq: '≨',
          lnsim: '⋦',
          loang: '⟬',
          loarr: '⇽',
          lobrk: '⟦',
          longleftarrow: '⟵',
          LongLeftArrow: '⟵',
          Longleftarrow: '⟸',
          longleftrightarrow: '⟷',
          LongLeftRightArrow: '⟷',
          Longleftrightarrow: '⟺',
          longmapsto: '⟼',
          longrightarrow: '⟶',
          LongRightArrow: '⟶',
          Longrightarrow: '⟹',
          looparrowleft: '↫',
          looparrowright: '↬',
          lopar: '⦅',
          Lopf: '𝕃',
          lopf: '𝕝',
          loplus: '⨭',
          lotimes: '⨴',
          lowast: '∗',
          lowbar: '_',
          LowerLeftArrow: '↙',
          LowerRightArrow: '↘',
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
          Lscr: 'ℒ',
          lsh: '↰',
          Lsh: '↰',
          lsim: '≲',
          lsime: '⪍',
          lsimg: '⪏',
          lsqb: '[',
          lsquo: '‘',
          lsquor: '‚',
          Lstrok: 'Ł',
          lstrok: 'ł',
          ltcc: '⪦',
          ltcir: '⩹',
          lt: '<',
          LT: '<',
          Lt: '≪',
          ltdot: '⋖',
          lthree: '⋋',
          ltimes: '⋉',
          ltlarr: '⥶',
          ltquest: '⩻',
          ltri: '◃',
          ltrie: '⊴',
          ltrif: '◂',
          ltrPar: '⦖',
          lurdshar: '⥊',
          luruhar: '⥦',
          lvertneqq: '≨︀',
          lvnE: '≨︀',
          macr: '¯',
          male: '♂',
          malt: '✠',
          maltese: '✠',
          Map: '⤅',
          map: '↦',
          mapsto: '↦',
          mapstodown: '↧',
          mapstoleft: '↤',
          mapstoup: '↥',
          marker: '▮',
          mcomma: '⨩',
          Mcy: 'М',
          mcy: 'м',
          mdash: '—',
          mDDot: '∺',
          measuredangle: '∡',
          MediumSpace: ' ',
          Mellintrf: 'ℳ',
          Mfr: '𝔐',
          mfr: '𝔪',
          mho: '℧',
          micro: 'µ',
          midast: '*',
          midcir: '⫰',
          mid: '∣',
          middot: '·',
          minusb: '⊟',
          minus: '−',
          minusd: '∸',
          minusdu: '⨪',
          MinusPlus: '∓',
          mlcp: '⫛',
          mldr: '…',
          mnplus: '∓',
          models: '⊧',
          Mopf: '𝕄',
          mopf: '𝕞',
          mp: '∓',
          mscr: '𝓂',
          Mscr: 'ℳ',
          mstpos: '∾',
          Mu: 'Μ',
          mu: 'μ',
          multimap: '⊸',
          mumap: '⊸',
          nabla: '∇',
          Nacute: 'Ń',
          nacute: 'ń',
          nang: '∠⃒',
          nap: '≉',
          napE: '⩰̸',
          napid: '≋̸',
          napos: 'ŉ',
          napprox: '≉',
          natural: '♮',
          naturals: 'ℕ',
          natur: '♮',
          nbsp: ' ',
          nbump: '≎̸',
          nbumpe: '≏̸',
          ncap: '⩃',
          Ncaron: 'Ň',
          ncaron: 'ň',
          Ncedil: 'Ņ',
          ncedil: 'ņ',
          ncong: '≇',
          ncongdot: '⩭̸',
          ncup: '⩂',
          Ncy: 'Н',
          ncy: 'н',
          ndash: '–',
          nearhk: '⤤',
          nearr: '↗',
          neArr: '⇗',
          nearrow: '↗',
          ne: '≠',
          nedot: '≐̸',
          NegativeMediumSpace: '​',
          NegativeThickSpace: '​',
          NegativeThinSpace: '​',
          NegativeVeryThinSpace: '​',
          nequiv: '≢',
          nesear: '⤨',
          nesim: '≂̸',
          NestedGreaterGreater: '≫',
          NestedLessLess: '≪',
          NewLine: '\n',
          nexist: '∄',
          nexists: '∄',
          Nfr: '𝔑',
          nfr: '𝔫',
          ngE: '≧̸',
          nge: '≱',
          ngeq: '≱',
          ngeqq: '≧̸',
          ngeqslant: '⩾̸',
          nges: '⩾̸',
          nGg: '⋙̸',
          ngsim: '≵',
          nGt: '≫⃒',
          ngt: '≯',
          ngtr: '≯',
          nGtv: '≫̸',
          nharr: '↮',
          nhArr: '⇎',
          nhpar: '⫲',
          ni: '∋',
          nis: '⋼',
          nisd: '⋺',
          niv: '∋',
          NJcy: 'Њ',
          njcy: 'њ',
          nlarr: '↚',
          nlArr: '⇍',
          nldr: '‥',
          nlE: '≦̸',
          nle: '≰',
          nleftarrow: '↚',
          nLeftarrow: '⇍',
          nleftrightarrow: '↮',
          nLeftrightarrow: '⇎',
          nleq: '≰',
          nleqq: '≦̸',
          nleqslant: '⩽̸',
          nles: '⩽̸',
          nless: '≮',
          nLl: '⋘̸',
          nlsim: '≴',
          nLt: '≪⃒',
          nlt: '≮',
          nltri: '⋪',
          nltrie: '⋬',
          nLtv: '≪̸',
          nmid: '∤',
          NoBreak: '⁠',
          NonBreakingSpace: ' ',
          nopf: '𝕟',
          Nopf: 'ℕ',
          Not: '⫬',
          not: '¬',
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
          notin: '∉',
          notindot: '⋵̸',
          notinE: '⋹̸',
          notinva: '∉',
          notinvb: '⋷',
          notinvc: '⋶',
          NotLeftTriangleBar: '⧏̸',
          NotLeftTriangle: '⋪',
          NotLeftTriangleEqual: '⋬',
          NotLess: '≮',
          NotLessEqual: '≰',
          NotLessGreater: '≸',
          NotLessLess: '≪̸',
          NotLessSlantEqual: '⩽̸',
          NotLessTilde: '≴',
          NotNestedGreaterGreater: '⪢̸',
          NotNestedLessLess: '⪡̸',
          notni: '∌',
          notniva: '∌',
          notnivb: '⋾',
          notnivc: '⋽',
          NotPrecedes: '⊀',
          NotPrecedesEqual: '⪯̸',
          NotPrecedesSlantEqual: '⋠',
          NotReverseElement: '∌',
          NotRightTriangleBar: '⧐̸',
          NotRightTriangle: '⋫',
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
          nparallel: '∦',
          npar: '∦',
          nparsl: '⫽⃥',
          npart: '∂̸',
          npolint: '⨔',
          npr: '⊀',
          nprcue: '⋠',
          nprec: '⊀',
          npreceq: '⪯̸',
          npre: '⪯̸',
          nrarrc: '⤳̸',
          nrarr: '↛',
          nrArr: '⇏',
          nrarrw: '↝̸',
          nrightarrow: '↛',
          nRightarrow: '⇏',
          nrtri: '⋫',
          nrtrie: '⋭',
          nsc: '⊁',
          nsccue: '⋡',
          nsce: '⪰̸',
          Nscr: '𝒩',
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
          Ntilde: 'Ñ',
          ntilde: 'ñ',
          ntlg: '≸',
          ntriangleleft: '⋪',
          ntrianglelefteq: '⋬',
          ntriangleright: '⋫',
          ntrianglerighteq: '⋭',
          Nu: 'Ν',
          nu: 'ν',
          num: '#',
          numero: '№',
          numsp: ' ',
          nvap: '≍⃒',
          nvdash: '⊬',
          nvDash: '⊭',
          nVdash: '⊮',
          nVDash: '⊯',
          nvge: '≥⃒',
          nvgt: '>⃒',
          nvHarr: '⤄',
          nvinfin: '⧞',
          nvlArr: '⤂',
          nvle: '≤⃒',
          nvlt: '<⃒',
          nvltrie: '⊴⃒',
          nvrArr: '⤃',
          nvrtrie: '⊵⃒',
          nvsim: '∼⃒',
          nwarhk: '⤣',
          nwarr: '↖',
          nwArr: '⇖',
          nwarrow: '↖',
          nwnear: '⤧',
          Oacute: 'Ó',
          oacute: 'ó',
          oast: '⊛',
          Ocirc: 'Ô',
          ocirc: 'ô',
          ocir: '⊚',
          Ocy: 'О',
          ocy: 'о',
          odash: '⊝',
          Odblac: 'Ő',
          odblac: 'ő',
          odiv: '⨸',
          odot: '⊙',
          odsold: '⦼',
          OElig: 'Œ',
          oelig: 'œ',
          ofcir: '⦿',
          Ofr: '𝔒',
          ofr: '𝔬',
          ogon: '˛',
          Ograve: 'Ò',
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
          Omacr: 'Ō',
          omacr: 'ō',
          Omega: 'Ω',
          omega: 'ω',
          Omicron: 'Ο',
          omicron: 'ο',
          omid: '⦶',
          ominus: '⊖',
          Oopf: '𝕆',
          oopf: '𝕠',
          opar: '⦷',
          OpenCurlyDoubleQuote: '“',
          OpenCurlyQuote: '‘',
          operp: '⦹',
          oplus: '⊕',
          orarr: '↻',
          Or: '⩔',
          or: '∨',
          ord: '⩝',
          order: 'ℴ',
          orderof: 'ℴ',
          ordf: 'ª',
          ordm: 'º',
          origof: '⊶',
          oror: '⩖',
          orslope: '⩗',
          orv: '⩛',
          oS: 'Ⓢ',
          Oscr: '𝒪',
          oscr: 'ℴ',
          Oslash: 'Ø',
          oslash: 'ø',
          osol: '⊘',
          Otilde: 'Õ',
          otilde: 'õ',
          otimesas: '⨶',
          Otimes: '⨷',
          otimes: '⊗',
          Ouml: 'Ö',
          ouml: 'ö',
          ovbar: '⌽',
          OverBar: '‾',
          OverBrace: '⏞',
          OverBracket: '⎴',
          OverParenthesis: '⏜',
          para: '¶',
          parallel: '∥',
          par: '∥',
          parsim: '⫳',
          parsl: '⫽',
          part: '∂',
          PartialD: '∂',
          Pcy: 'П',
          pcy: 'п',
          percnt: '%',
          period: '.',
          permil: '‰',
          perp: '⊥',
          pertenk: '‱',
          Pfr: '𝔓',
          pfr: '𝔭',
          Phi: 'Φ',
          phi: 'φ',
          phiv: 'ϕ',
          phmmat: 'ℳ',
          phone: '☎',
          Pi: 'Π',
          pi: 'π',
          pitchfork: '⋔',
          piv: 'ϖ',
          planck: 'ℏ',
          planckh: 'ℎ',
          plankv: 'ℏ',
          plusacir: '⨣',
          plusb: '⊞',
          pluscir: '⨢',
          plus: '+',
          plusdo: '∔',
          plusdu: '⨥',
          pluse: '⩲',
          PlusMinus: '±',
          plusmn: '±',
          plussim: '⨦',
          plustwo: '⨧',
          pm: '±',
          Poincareplane: 'ℌ',
          pointint: '⨕',
          popf: '𝕡',
          Popf: 'ℙ',
          pound: '£',
          prap: '⪷',
          Pr: '⪻',
          pr: '≺',
          prcue: '≼',
          precapprox: '⪷',
          prec: '≺',
          preccurlyeq: '≼',
          Precedes: '≺',
          PrecedesEqual: '⪯',
          PrecedesSlantEqual: '≼',
          PrecedesTilde: '≾',
          preceq: '⪯',
          precnapprox: '⪹',
          precneqq: '⪵',
          precnsim: '⋨',
          pre: '⪯',
          prE: '⪳',
          precsim: '≾',
          prime: '′',
          Prime: '″',
          primes: 'ℙ',
          prnap: '⪹',
          prnE: '⪵',
          prnsim: '⋨',
          prod: '∏',
          Product: '∏',
          profalar: '⌮',
          profline: '⌒',
          profsurf: '⌓',
          prop: '∝',
          Proportional: '∝',
          Proportion: '∷',
          propto: '∝',
          prsim: '≾',
          prurel: '⊰',
          Pscr: '𝒫',
          pscr: '𝓅',
          Psi: 'Ψ',
          psi: 'ψ',
          puncsp: ' ',
          Qfr: '𝔔',
          qfr: '𝔮',
          qint: '⨌',
          qopf: '𝕢',
          Qopf: 'ℚ',
          qprime: '⁗',
          Qscr: '𝒬',
          qscr: '𝓆',
          quaternions: 'ℍ',
          quatint: '⨖',
          quest: '?',
          questeq: '≟',
          quot: '"',
          QUOT: '"',
          rAarr: '⇛',
          race: '∽̱',
          Racute: 'Ŕ',
          racute: 'ŕ',
          radic: '√',
          raemptyv: '⦳',
          rang: '⟩',
          Rang: '⟫',
          rangd: '⦒',
          range: '⦥',
          rangle: '⟩',
          raquo: '»',
          rarrap: '⥵',
          rarrb: '⇥',
          rarrbfs: '⤠',
          rarrc: '⤳',
          rarr: '→',
          Rarr: '↠',
          rArr: '⇒',
          rarrfs: '⤞',
          rarrhk: '↪',
          rarrlp: '↬',
          rarrpl: '⥅',
          rarrsim: '⥴',
          Rarrtl: '⤖',
          rarrtl: '↣',
          rarrw: '↝',
          ratail: '⤚',
          rAtail: '⤜',
          ratio: '∶',
          rationals: 'ℚ',
          rbarr: '⤍',
          rBarr: '⤏',
          RBarr: '⤐',
          rbbrk: '❳',
          rbrace: '}',
          rbrack: ']',
          rbrke: '⦌',
          rbrksld: '⦎',
          rbrkslu: '⦐',
          Rcaron: 'Ř',
          rcaron: 'ř',
          Rcedil: 'Ŗ',
          rcedil: 'ŗ',
          rceil: '⌉',
          rcub: '}',
          Rcy: 'Р',
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
          Re: 'ℜ',
          rect: '▭',
          reg: '®',
          REG: '®',
          ReverseElement: '∋',
          ReverseEquilibrium: '⇋',
          ReverseUpEquilibrium: '⥯',
          rfisht: '⥽',
          rfloor: '⌋',
          rfr: '𝔯',
          Rfr: 'ℜ',
          rHar: '⥤',
          rhard: '⇁',
          rharu: '⇀',
          rharul: '⥬',
          Rho: 'Ρ',
          rho: 'ρ',
          rhov: 'ϱ',
          RightAngleBracket: '⟩',
          RightArrowBar: '⇥',
          rightarrow: '→',
          RightArrow: '→',
          Rightarrow: '⇒',
          RightArrowLeftArrow: '⇄',
          rightarrowtail: '↣',
          RightCeiling: '⌉',
          RightDoubleBracket: '⟧',
          RightDownTeeVector: '⥝',
          RightDownVectorBar: '⥕',
          RightDownVector: '⇂',
          RightFloor: '⌋',
          rightharpoondown: '⇁',
          rightharpoonup: '⇀',
          rightleftarrows: '⇄',
          rightleftharpoons: '⇌',
          rightrightarrows: '⇉',
          rightsquigarrow: '↝',
          RightTeeArrow: '↦',
          RightTee: '⊢',
          RightTeeVector: '⥛',
          rightthreetimes: '⋌',
          RightTriangleBar: '⧐',
          RightTriangle: '⊳',
          RightTriangleEqual: '⊵',
          RightUpDownVector: '⥏',
          RightUpTeeVector: '⥜',
          RightUpVectorBar: '⥔',
          RightUpVector: '↾',
          RightVectorBar: '⥓',
          RightVector: '⇀',
          ring: '˚',
          risingdotseq: '≓',
          rlarr: '⇄',
          rlhar: '⇌',
          rlm: '‏',
          rmoustache: '⎱',
          rmoust: '⎱',
          rnmid: '⫮',
          roang: '⟭',
          roarr: '⇾',
          robrk: '⟧',
          ropar: '⦆',
          ropf: '𝕣',
          Ropf: 'ℝ',
          roplus: '⨮',
          rotimes: '⨵',
          RoundImplies: '⥰',
          rpar: ')',
          rpargt: '⦔',
          rppolint: '⨒',
          rrarr: '⇉',
          Rrightarrow: '⇛',
          rsaquo: '›',
          rscr: '𝓇',
          Rscr: 'ℛ',
          rsh: '↱',
          Rsh: '↱',
          rsqb: ']',
          rsquo: '’',
          rsquor: '’',
          rthree: '⋌',
          rtimes: '⋊',
          rtri: '▹',
          rtrie: '⊵',
          rtrif: '▸',
          rtriltri: '⧎',
          RuleDelayed: '⧴',
          ruluhar: '⥨',
          rx: '℞',
          Sacute: 'Ś',
          sacute: 'ś',
          sbquo: '‚',
          scap: '⪸',
          Scaron: 'Š',
          scaron: 'š',
          Sc: '⪼',
          sc: '≻',
          sccue: '≽',
          sce: '⪰',
          scE: '⪴',
          Scedil: 'Ş',
          scedil: 'ş',
          Scirc: 'Ŝ',
          scirc: 'ŝ',
          scnap: '⪺',
          scnE: '⪶',
          scnsim: '⋩',
          scpolint: '⨓',
          scsim: '≿',
          Scy: 'С',
          scy: 'с',
          sdotb: '⊡',
          sdot: '⋅',
          sdote: '⩦',
          searhk: '⤥',
          searr: '↘',
          seArr: '⇘',
          searrow: '↘',
          sect: '§',
          semi: ';',
          seswar: '⤩',
          setminus: '∖',
          setmn: '∖',
          sext: '✶',
          Sfr: '𝔖',
          sfr: '𝔰',
          sfrown: '⌢',
          sharp: '♯',
          SHCHcy: 'Щ',
          shchcy: 'щ',
          SHcy: 'Ш',
          shcy: 'ш',
          ShortDownArrow: '↓',
          ShortLeftArrow: '←',
          shortmid: '∣',
          shortparallel: '∥',
          ShortRightArrow: '→',
          ShortUpArrow: '↑',
          shy: '­',
          Sigma: 'Σ',
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
          SmallCircle: '∘',
          smallsetminus: '∖',
          smashp: '⨳',
          smeparsl: '⧤',
          smid: '∣',
          smile: '⌣',
          smt: '⪪',
          smte: '⪬',
          smtes: '⪬︀',
          SOFTcy: 'Ь',
          softcy: 'ь',
          solbar: '⌿',
          solb: '⧄',
          sol: '/',
          Sopf: '𝕊',
          sopf: '𝕤',
          spades: '♠',
          spadesuit: '♠',
          spar: '∥',
          sqcap: '⊓',
          sqcaps: '⊓︀',
          sqcup: '⊔',
          sqcups: '⊔︀',
          Sqrt: '√',
          sqsub: '⊏',
          sqsube: '⊑',
          sqsubset: '⊏',
          sqsubseteq: '⊑',
          sqsup: '⊐',
          sqsupe: '⊒',
          sqsupset: '⊐',
          sqsupseteq: '⊒',
          square: '□',
          Square: '□',
          SquareIntersection: '⊓',
          SquareSubset: '⊏',
          SquareSubsetEqual: '⊑',
          SquareSuperset: '⊐',
          SquareSupersetEqual: '⊒',
          SquareUnion: '⊔',
          squarf: '▪',
          squ: '□',
          squf: '▪',
          srarr: '→',
          Sscr: '𝒮',
          sscr: '𝓈',
          ssetmn: '∖',
          ssmile: '⌣',
          sstarf: '⋆',
          Star: '⋆',
          star: '☆',
          starf: '★',
          straightepsilon: 'ϵ',
          straightphi: 'ϕ',
          strns: '¯',
          sub: '⊂',
          Sub: '⋐',
          subdot: '⪽',
          subE: '⫅',
          sube: '⊆',
          subedot: '⫃',
          submult: '⫁',
          subnE: '⫋',
          subne: '⊊',
          subplus: '⪿',
          subrarr: '⥹',
          subset: '⊂',
          Subset: '⋐',
          subseteq: '⊆',
          subseteqq: '⫅',
          SubsetEqual: '⊆',
          subsetneq: '⊊',
          subsetneqq: '⫋',
          subsim: '⫇',
          subsub: '⫕',
          subsup: '⫓',
          succapprox: '⪸',
          succ: '≻',
          succcurlyeq: '≽',
          Succeeds: '≻',
          SucceedsEqual: '⪰',
          SucceedsSlantEqual: '≽',
          SucceedsTilde: '≿',
          succeq: '⪰',
          succnapprox: '⪺',
          succneqq: '⪶',
          succnsim: '⋩',
          succsim: '≿',
          SuchThat: '∋',
          sum: '∑',
          Sum: '∑',
          sung: '♪',
          sup1: '¹',
          sup2: '²',
          sup3: '³',
          sup: '⊃',
          Sup: '⋑',
          supdot: '⪾',
          supdsub: '⫘',
          supE: '⫆',
          supe: '⊇',
          supedot: '⫄',
          Superset: '⊃',
          SupersetEqual: '⊇',
          suphsol: '⟉',
          suphsub: '⫗',
          suplarr: '⥻',
          supmult: '⫂',
          supnE: '⫌',
          supne: '⊋',
          supplus: '⫀',
          supset: '⊃',
          Supset: '⋑',
          supseteq: '⊇',
          supseteqq: '⫆',
          supsetneq: '⊋',
          supsetneqq: '⫌',
          supsim: '⫈',
          supsub: '⫔',
          supsup: '⫖',
          swarhk: '⤦',
          swarr: '↙',
          swArr: '⇙',
          swarrow: '↙',
          swnwar: '⤪',
          szlig: 'ß',
          Tab: '\t',
          target: '⌖',
          Tau: 'Τ',
          tau: 'τ',
          tbrk: '⎴',
          Tcaron: 'Ť',
          tcaron: 'ť',
          Tcedil: 'Ţ',
          tcedil: 'ţ',
          Tcy: 'Т',
          tcy: 'т',
          tdot: '⃛',
          telrec: '⌕',
          Tfr: '𝔗',
          tfr: '𝔱',
          there4: '∴',
          therefore: '∴',
          Therefore: '∴',
          Theta: 'Θ',
          theta: 'θ',
          thetasym: 'ϑ',
          thetav: 'ϑ',
          thickapprox: '≈',
          thicksim: '∼',
          ThickSpace: '  ',
          ThinSpace: ' ',
          thinsp: ' ',
          thkap: '≈',
          thksim: '∼',
          THORN: 'Þ',
          thorn: 'þ',
          tilde: '˜',
          Tilde: '∼',
          TildeEqual: '≃',
          TildeFullEqual: '≅',
          TildeTilde: '≈',
          timesbar: '⨱',
          timesb: '⊠',
          times: '×',
          timesd: '⨰',
          tint: '∭',
          toea: '⤨',
          topbot: '⌶',
          topcir: '⫱',
          top: '⊤',
          Topf: '𝕋',
          topf: '𝕥',
          topfork: '⫚',
          tosa: '⤩',
          tprime: '‴',
          trade: '™',
          TRADE: '™',
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
          TripleDot: '⃛',
          triplus: '⨹',
          trisb: '⧍',
          tritime: '⨻',
          trpezium: '⏢',
          Tscr: '𝒯',
          tscr: '𝓉',
          TScy: 'Ц',
          tscy: 'ц',
          TSHcy: 'Ћ',
          tshcy: 'ћ',
          Tstrok: 'Ŧ',
          tstrok: 'ŧ',
          twixt: '≬',
          twoheadleftarrow: '↞',
          twoheadrightarrow: '↠',
          Uacute: 'Ú',
          uacute: 'ú',
          uarr: '↑',
          Uarr: '↟',
          uArr: '⇑',
          Uarrocir: '⥉',
          Ubrcy: 'Ў',
          ubrcy: 'ў',
          Ubreve: 'Ŭ',
          ubreve: 'ŭ',
          Ucirc: 'Û',
          ucirc: 'û',
          Ucy: 'У',
          ucy: 'у',
          udarr: '⇅',
          Udblac: 'Ű',
          udblac: 'ű',
          udhar: '⥮',
          ufisht: '⥾',
          Ufr: '𝔘',
          ufr: '𝔲',
          Ugrave: 'Ù',
          ugrave: 'ù',
          uHar: '⥣',
          uharl: '↿',
          uharr: '↾',
          uhblk: '▀',
          ulcorn: '⌜',
          ulcorner: '⌜',
          ulcrop: '⌏',
          ultri: '◸',
          Umacr: 'Ū',
          umacr: 'ū',
          uml: '¨',
          UnderBar: '_',
          UnderBrace: '⏟',
          UnderBracket: '⎵',
          UnderParenthesis: '⏝',
          Union: '⋃',
          UnionPlus: '⊎',
          Uogon: 'Ų',
          uogon: 'ų',
          Uopf: '𝕌',
          uopf: '𝕦',
          UpArrowBar: '⤒',
          uparrow: '↑',
          UpArrow: '↑',
          Uparrow: '⇑',
          UpArrowDownArrow: '⇅',
          updownarrow: '↕',
          UpDownArrow: '↕',
          Updownarrow: '⇕',
          UpEquilibrium: '⥮',
          upharpoonleft: '↿',
          upharpoonright: '↾',
          uplus: '⊎',
          UpperLeftArrow: '↖',
          UpperRightArrow: '↗',
          upsi: 'υ',
          Upsi: 'ϒ',
          upsih: 'ϒ',
          Upsilon: 'Υ',
          upsilon: 'υ',
          UpTeeArrow: '↥',
          UpTee: '⊥',
          upuparrows: '⇈',
          urcorn: '⌝',
          urcorner: '⌝',
          urcrop: '⌎',
          Uring: 'Ů',
          uring: 'ů',
          urtri: '◹',
          Uscr: '𝒰',
          uscr: '𝓊',
          utdot: '⋰',
          Utilde: 'Ũ',
          utilde: 'ũ',
          utri: '▵',
          utrif: '▴',
          uuarr: '⇈',
          Uuml: 'Ü',
          uuml: 'ü',
          uwangle: '⦧',
          vangrt: '⦜',
          varepsilon: 'ϵ',
          varkappa: 'ϰ',
          varnothing: '∅',
          varphi: 'ϕ',
          varpi: 'ϖ',
          varpropto: '∝',
          varr: '↕',
          vArr: '⇕',
          varrho: 'ϱ',
          varsigma: 'ς',
          varsubsetneq: '⊊︀',
          varsubsetneqq: '⫋︀',
          varsupsetneq: '⊋︀',
          varsupsetneqq: '⫌︀',
          vartheta: 'ϑ',
          vartriangleleft: '⊲',
          vartriangleright: '⊳',
          vBar: '⫨',
          Vbar: '⫫',
          vBarv: '⫩',
          Vcy: 'В',
          vcy: 'в',
          vdash: '⊢',
          vDash: '⊨',
          Vdash: '⊩',
          VDash: '⊫',
          Vdashl: '⫦',
          veebar: '⊻',
          vee: '∨',
          Vee: '⋁',
          veeeq: '≚',
          vellip: '⋮',
          verbar: '|',
          Verbar: '‖',
          vert: '|',
          Vert: '‖',
          VerticalBar: '∣',
          VerticalLine: '|',
          VerticalSeparator: '❘',
          VerticalTilde: '≀',
          VeryThinSpace: ' ',
          Vfr: '𝔙',
          vfr: '𝔳',
          vltri: '⊲',
          vnsub: '⊂⃒',
          vnsup: '⊃⃒',
          Vopf: '𝕍',
          vopf: '𝕧',
          vprop: '∝',
          vrtri: '⊳',
          Vscr: '𝒱',
          vscr: '𝓋',
          vsubnE: '⫋︀',
          vsubne: '⊊︀',
          vsupnE: '⫌︀',
          vsupne: '⊋︀',
          Vvdash: '⊪',
          vzigzag: '⦚',
          Wcirc: 'Ŵ',
          wcirc: 'ŵ',
          wedbar: '⩟',
          wedge: '∧',
          Wedge: '⋀',
          wedgeq: '≙',
          weierp: '℘',
          Wfr: '𝔚',
          wfr: '𝔴',
          Wopf: '𝕎',
          wopf: '𝕨',
          wp: '℘',
          wr: '≀',
          wreath: '≀',
          Wscr: '𝒲',
          wscr: '𝓌',
          xcap: '⋂',
          xcirc: '◯',
          xcup: '⋃',
          xdtri: '▽',
          Xfr: '𝔛',
          xfr: '𝔵',
          xharr: '⟷',
          xhArr: '⟺',
          Xi: 'Ξ',
          xi: 'ξ',
          xlarr: '⟵',
          xlArr: '⟸',
          xmap: '⟼',
          xnis: '⋻',
          xodot: '⨀',
          Xopf: '𝕏',
          xopf: '𝕩',
          xoplus: '⨁',
          xotime: '⨂',
          xrarr: '⟶',
          xrArr: '⟹',
          Xscr: '𝒳',
          xscr: '𝓍',
          xsqcup: '⨆',
          xuplus: '⨄',
          xutri: '△',
          xvee: '⋁',
          xwedge: '⋀',
          Yacute: 'Ý',
          yacute: 'ý',
          YAcy: 'Я',
          yacy: 'я',
          Ycirc: 'Ŷ',
          ycirc: 'ŷ',
          Ycy: 'Ы',
          ycy: 'ы',
          yen: '¥',
          Yfr: '𝔜',
          yfr: '𝔶',
          YIcy: 'Ї',
          yicy: 'ї',
          Yopf: '𝕐',
          yopf: '𝕪',
          Yscr: '𝒴',
          yscr: '𝓎',
          YUcy: 'Ю',
          yucy: 'ю',
          yuml: 'ÿ',
          Yuml: 'Ÿ',
          Zacute: 'Ź',
          zacute: 'ź',
          Zcaron: 'Ž',
          zcaron: 'ž',
          Zcy: 'З',
          zcy: 'з',
          Zdot: 'Ż',
          zdot: 'ż',
          zeetrf: 'ℨ',
          ZeroWidthSpace: '​',
          Zeta: 'Ζ',
          zeta: 'ζ',
          zfr: '𝔷',
          Zfr: 'ℨ',
          ZHcy: 'Ж',
          zhcy: 'ж',
          zigrarr: '⇝',
          zopf: '𝕫',
          Zopf: 'ℤ',
          Zscr: '𝒵',
          zscr: '𝓏',
          zwj: '‍',
          zwnj: '‌',
        },
        Ne = /^#[xX]([A-Fa-f0-9]+)$/,
        Ae = /^#([0-9]+)$/,
        Pe = /^([A-Za-z0-9]+)$/,
        xe = (function () {
          function t(t) {
            this.named = t;
          }
          return (
            (t.prototype.parse = function (t) {
              if (t) {
                var e = t.match(Ne);
                if (e) return String.fromCharCode(parseInt(e[1], 16));
                if ((e = t.match(Ae))) return String.fromCharCode(parseInt(e[1], 10));
                if ((e = t.match(Pe))) return this.named[e[1]];
              }
            }),
            t
          );
        })(),
        De = /[\t\n\f ]/,
        Ce = /[A-Za-z]/,
        Le = /\r\n?/g;
      function qe(t) {
        return De.test(t);
      }
      function _e(t) {
        return Ce.test(t);
      }
      var Ie = (function () {
          function t(t, e, r) {
            void 0 === r && (r = 'precompile'),
              (this.delegate = t),
              (this.entityParser = e),
              (this.mode = r),
              (this.state = 'beforeData'),
              (this.line = -1),
              (this.column = -1),
              (this.input = ''),
              (this.index = -1),
              (this.tagNameBuffer = ''),
              (this.states = {
                beforeData: function () {
                  var t = this.peek();
                  if ('<' !== t || this.isIgnoredEndTag()) {
                    if ('precompile' === this.mode && '\n' === t) {
                      var e = this.tagNameBuffer.toLowerCase();
                      ('pre' === e || 'textarea' === e) && this.consume();
                    }
                    this.transitionTo('data'), this.delegate.beginData();
                  } else this.transitionTo('tagOpen'), this.markTagStart(), this.consume();
                },
                data: function () {
                  var t = this.peek(),
                    e = this.tagNameBuffer;
                  '<' !== t || this.isIgnoredEndTag()
                    ? '&' === t && 'script' !== e && 'style' !== e
                      ? (this.consume(), this.delegate.appendToData(this.consumeCharRef() || '&'))
                      : (this.consume(), this.delegate.appendToData(t))
                    : (this.delegate.finishData(),
                      this.transitionTo('tagOpen'),
                      this.markTagStart(),
                      this.consume());
                },
                tagOpen: function () {
                  var t = this.consume();
                  '!' === t
                    ? this.transitionTo('markupDeclarationOpen')
                    : '/' === t
                      ? this.transitionTo('endTagOpen')
                      : ('@' === t || ':' === t || _e(t)) &&
                        (this.transitionTo('tagName'),
                        (this.tagNameBuffer = ''),
                        this.delegate.beginStartTag(),
                        this.appendToTagName(t));
                },
                markupDeclarationOpen: function () {
                  var t = this.consume();
                  '-' === t && '-' === this.peek()
                    ? (this.consume(),
                      this.transitionTo('commentStart'),
                      this.delegate.beginComment())
                    : 'DOCTYPE' ===
                        t.toUpperCase() +
                          this.input.substring(this.index, this.index + 6).toUpperCase() &&
                      (this.consume(),
                      this.consume(),
                      this.consume(),
                      this.consume(),
                      this.consume(),
                      this.consume(),
                      this.transitionTo('doctype'),
                      this.delegate.beginDoctype && this.delegate.beginDoctype());
                },
                doctype: function () {
                  qe(this.consume()) && this.transitionTo('beforeDoctypeName');
                },
                beforeDoctypeName: function () {
                  var t = this.consume();
                  qe(t) ||
                    (this.transitionTo('doctypeName'),
                    this.delegate.appendToDoctypeName &&
                      this.delegate.appendToDoctypeName(t.toLowerCase()));
                },
                doctypeName: function () {
                  var t = this.consume();
                  qe(t)
                    ? this.transitionTo('afterDoctypeName')
                    : '>' === t
                      ? (this.delegate.endDoctype && this.delegate.endDoctype(),
                        this.transitionTo('beforeData'))
                      : this.delegate.appendToDoctypeName &&
                        this.delegate.appendToDoctypeName(t.toLowerCase());
                },
                afterDoctypeName: function () {
                  var t = this.consume();
                  if (!qe(t))
                    if ('>' === t)
                      this.delegate.endDoctype && this.delegate.endDoctype(),
                        this.transitionTo('beforeData');
                    else {
                      var e =
                          t.toUpperCase() +
                          this.input.substring(this.index, this.index + 5).toUpperCase(),
                        r = 'PUBLIC' === e.toUpperCase(),
                        n = 'SYSTEM' === e.toUpperCase();
                      (r || n) &&
                        (this.consume(),
                        this.consume(),
                        this.consume(),
                        this.consume(),
                        this.consume(),
                        this.consume()),
                        r
                          ? this.transitionTo('afterDoctypePublicKeyword')
                          : n && this.transitionTo('afterDoctypeSystemKeyword');
                    }
                },
                afterDoctypePublicKeyword: function () {
                  var t = this.peek();
                  qe(t)
                    ? (this.transitionTo('beforeDoctypePublicIdentifier'), this.consume())
                    : '"' === t
                      ? (this.transitionTo('doctypePublicIdentifierDoubleQuoted'), this.consume())
                      : "'" === t
                        ? (this.transitionTo('doctypePublicIdentifierSingleQuoted'), this.consume())
                        : '>' === t &&
                          (this.consume(),
                          this.delegate.endDoctype && this.delegate.endDoctype(),
                          this.transitionTo('beforeData'));
                },
                doctypePublicIdentifierDoubleQuoted: function () {
                  var t = this.consume();
                  '"' === t
                    ? this.transitionTo('afterDoctypePublicIdentifier')
                    : '>' === t
                      ? (this.delegate.endDoctype && this.delegate.endDoctype(),
                        this.transitionTo('beforeData'))
                      : this.delegate.appendToDoctypePublicIdentifier &&
                        this.delegate.appendToDoctypePublicIdentifier(t);
                },
                doctypePublicIdentifierSingleQuoted: function () {
                  var t = this.consume();
                  "'" === t
                    ? this.transitionTo('afterDoctypePublicIdentifier')
                    : '>' === t
                      ? (this.delegate.endDoctype && this.delegate.endDoctype(),
                        this.transitionTo('beforeData'))
                      : this.delegate.appendToDoctypePublicIdentifier &&
                        this.delegate.appendToDoctypePublicIdentifier(t);
                },
                afterDoctypePublicIdentifier: function () {
                  var t = this.consume();
                  qe(t)
                    ? this.transitionTo('betweenDoctypePublicAndSystemIdentifiers')
                    : '>' === t
                      ? (this.delegate.endDoctype && this.delegate.endDoctype(),
                        this.transitionTo('beforeData'))
                      : '"' === t
                        ? this.transitionTo('doctypeSystemIdentifierDoubleQuoted')
                        : "'" === t && this.transitionTo('doctypeSystemIdentifierSingleQuoted');
                },
                betweenDoctypePublicAndSystemIdentifiers: function () {
                  var t = this.consume();
                  qe(t) ||
                    ('>' === t
                      ? (this.delegate.endDoctype && this.delegate.endDoctype(),
                        this.transitionTo('beforeData'))
                      : '"' === t
                        ? this.transitionTo('doctypeSystemIdentifierDoubleQuoted')
                        : "'" === t && this.transitionTo('doctypeSystemIdentifierSingleQuoted'));
                },
                doctypeSystemIdentifierDoubleQuoted: function () {
                  var t = this.consume();
                  '"' === t
                    ? this.transitionTo('afterDoctypeSystemIdentifier')
                    : '>' === t
                      ? (this.delegate.endDoctype && this.delegate.endDoctype(),
                        this.transitionTo('beforeData'))
                      : this.delegate.appendToDoctypeSystemIdentifier &&
                        this.delegate.appendToDoctypeSystemIdentifier(t);
                },
                doctypeSystemIdentifierSingleQuoted: function () {
                  var t = this.consume();
                  "'" === t
                    ? this.transitionTo('afterDoctypeSystemIdentifier')
                    : '>' === t
                      ? (this.delegate.endDoctype && this.delegate.endDoctype(),
                        this.transitionTo('beforeData'))
                      : this.delegate.appendToDoctypeSystemIdentifier &&
                        this.delegate.appendToDoctypeSystemIdentifier(t);
                },
                afterDoctypeSystemIdentifier: function () {
                  var t = this.consume();
                  qe(t) ||
                    ('>' === t &&
                      (this.delegate.endDoctype && this.delegate.endDoctype(),
                      this.transitionTo('beforeData')));
                },
                commentStart: function () {
                  var t = this.consume();
                  '-' === t
                    ? this.transitionTo('commentStartDash')
                    : '>' === t
                      ? (this.delegate.finishComment(), this.transitionTo('beforeData'))
                      : (this.delegate.appendToCommentData(t), this.transitionTo('comment'));
                },
                commentStartDash: function () {
                  var t = this.consume();
                  '-' === t
                    ? this.transitionTo('commentEnd')
                    : '>' === t
                      ? (this.delegate.finishComment(), this.transitionTo('beforeData'))
                      : (this.delegate.appendToCommentData('-'), this.transitionTo('comment'));
                },
                comment: function () {
                  var t = this.consume();
                  '-' === t
                    ? this.transitionTo('commentEndDash')
                    : this.delegate.appendToCommentData(t);
                },
                commentEndDash: function () {
                  var t = this.consume();
                  '-' === t
                    ? this.transitionTo('commentEnd')
                    : (this.delegate.appendToCommentData('-' + t), this.transitionTo('comment'));
                },
                commentEnd: function () {
                  var t = this.consume();
                  '>' === t
                    ? (this.delegate.finishComment(), this.transitionTo('beforeData'))
                    : (this.delegate.appendToCommentData('--' + t), this.transitionTo('comment'));
                },
                tagName: function () {
                  var t = this.consume();
                  qe(t)
                    ? this.transitionTo('beforeAttributeName')
                    : '/' === t
                      ? this.transitionTo('selfClosingStartTag')
                      : '>' === t
                        ? (this.delegate.finishTag(), this.transitionTo('beforeData'))
                        : this.appendToTagName(t);
                },
                endTagName: function () {
                  var t = this.consume();
                  qe(t)
                    ? (this.transitionTo('beforeAttributeName'), (this.tagNameBuffer = ''))
                    : '/' === t
                      ? (this.transitionTo('selfClosingStartTag'), (this.tagNameBuffer = ''))
                      : '>' === t
                        ? (this.delegate.finishTag(),
                          this.transitionTo('beforeData'),
                          (this.tagNameBuffer = ''))
                        : this.appendToTagName(t);
                },
                beforeAttributeName: function () {
                  var t = this.peek();
                  qe(t)
                    ? this.consume()
                    : '/' === t
                      ? (this.transitionTo('selfClosingStartTag'), this.consume())
                      : '>' === t
                        ? (this.consume(),
                          this.delegate.finishTag(),
                          this.transitionTo('beforeData'))
                        : '=' === t
                          ? (this.delegate.reportSyntaxError(
                              'attribute name cannot start with equals sign'
                            ),
                            this.transitionTo('attributeName'),
                            this.delegate.beginAttribute(),
                            this.consume(),
                            this.delegate.appendToAttributeName(t))
                          : (this.transitionTo('attributeName'), this.delegate.beginAttribute());
                },
                attributeName: function () {
                  var t = this.peek();
                  qe(t)
                    ? (this.transitionTo('afterAttributeName'), this.consume())
                    : '/' === t
                      ? (this.delegate.beginAttributeValue(!1),
                        this.delegate.finishAttributeValue(),
                        this.consume(),
                        this.transitionTo('selfClosingStartTag'))
                      : '=' === t
                        ? (this.transitionTo('beforeAttributeValue'), this.consume())
                        : '>' === t
                          ? (this.delegate.beginAttributeValue(!1),
                            this.delegate.finishAttributeValue(),
                            this.consume(),
                            this.delegate.finishTag(),
                            this.transitionTo('beforeData'))
                          : '"' === t || "'" === t || '<' === t
                            ? (this.delegate.reportSyntaxError(
                                t + ' is not a valid character within attribute names'
                              ),
                              this.consume(),
                              this.delegate.appendToAttributeName(t))
                            : (this.consume(), this.delegate.appendToAttributeName(t));
                },
                afterAttributeName: function () {
                  var t = this.peek();
                  qe(t)
                    ? this.consume()
                    : '/' === t
                      ? (this.delegate.beginAttributeValue(!1),
                        this.delegate.finishAttributeValue(),
                        this.consume(),
                        this.transitionTo('selfClosingStartTag'))
                      : '=' === t
                        ? (this.consume(), this.transitionTo('beforeAttributeValue'))
                        : '>' === t
                          ? (this.delegate.beginAttributeValue(!1),
                            this.delegate.finishAttributeValue(),
                            this.consume(),
                            this.delegate.finishTag(),
                            this.transitionTo('beforeData'))
                          : (this.delegate.beginAttributeValue(!1),
                            this.delegate.finishAttributeValue(),
                            this.transitionTo('attributeName'),
                            this.delegate.beginAttribute(),
                            this.consume(),
                            this.delegate.appendToAttributeName(t));
                },
                beforeAttributeValue: function () {
                  var t = this.peek();
                  qe(t)
                    ? this.consume()
                    : '"' === t
                      ? (this.transitionTo('attributeValueDoubleQuoted'),
                        this.delegate.beginAttributeValue(!0),
                        this.consume())
                      : "'" === t
                        ? (this.transitionTo('attributeValueSingleQuoted'),
                          this.delegate.beginAttributeValue(!0),
                          this.consume())
                        : '>' === t
                          ? (this.delegate.beginAttributeValue(!1),
                            this.delegate.finishAttributeValue(),
                            this.consume(),
                            this.delegate.finishTag(),
                            this.transitionTo('beforeData'))
                          : (this.transitionTo('attributeValueUnquoted'),
                            this.delegate.beginAttributeValue(!1),
                            this.consume(),
                            this.delegate.appendToAttributeValue(t));
                },
                attributeValueDoubleQuoted: function () {
                  var t = this.consume();
                  '"' === t
                    ? (this.delegate.finishAttributeValue(),
                      this.transitionTo('afterAttributeValueQuoted'))
                    : '&' === t
                      ? this.delegate.appendToAttributeValue(this.consumeCharRef() || '&')
                      : this.delegate.appendToAttributeValue(t);
                },
                attributeValueSingleQuoted: function () {
                  var t = this.consume();
                  "'" === t
                    ? (this.delegate.finishAttributeValue(),
                      this.transitionTo('afterAttributeValueQuoted'))
                    : '&' === t
                      ? this.delegate.appendToAttributeValue(this.consumeCharRef() || '&')
                      : this.delegate.appendToAttributeValue(t);
                },
                attributeValueUnquoted: function () {
                  var t = this.peek();
                  qe(t)
                    ? (this.delegate.finishAttributeValue(),
                      this.consume(),
                      this.transitionTo('beforeAttributeName'))
                    : '/' === t
                      ? (this.delegate.finishAttributeValue(),
                        this.consume(),
                        this.transitionTo('selfClosingStartTag'))
                      : '&' === t
                        ? (this.consume(),
                          this.delegate.appendToAttributeValue(this.consumeCharRef() || '&'))
                        : '>' === t
                          ? (this.delegate.finishAttributeValue(),
                            this.consume(),
                            this.delegate.finishTag(),
                            this.transitionTo('beforeData'))
                          : (this.consume(), this.delegate.appendToAttributeValue(t));
                },
                afterAttributeValueQuoted: function () {
                  var t = this.peek();
                  qe(t)
                    ? (this.consume(), this.transitionTo('beforeAttributeName'))
                    : '/' === t
                      ? (this.consume(), this.transitionTo('selfClosingStartTag'))
                      : '>' === t
                        ? (this.consume(),
                          this.delegate.finishTag(),
                          this.transitionTo('beforeData'))
                        : this.transitionTo('beforeAttributeName');
                },
                selfClosingStartTag: function () {
                  '>' === this.peek()
                    ? (this.consume(),
                      this.delegate.markTagAsSelfClosing(),
                      this.delegate.finishTag(),
                      this.transitionTo('beforeData'))
                    : this.transitionTo('beforeAttributeName');
                },
                endTagOpen: function () {
                  var t = this.consume();
                  ('@' === t || ':' === t || _e(t)) &&
                    (this.transitionTo('endTagName'),
                    (this.tagNameBuffer = ''),
                    this.delegate.beginEndTag(),
                    this.appendToTagName(t));
                },
              }),
              this.reset();
          }
          return (
            (t.prototype.reset = function () {
              this.transitionTo('beforeData'),
                (this.input = ''),
                (this.tagNameBuffer = ''),
                (this.index = 0),
                (this.line = 1),
                (this.column = 0),
                this.delegate.reset();
            }),
            (t.prototype.transitionTo = function (t) {
              this.state = t;
            }),
            (t.prototype.tokenize = function (t) {
              this.reset(), this.tokenizePart(t), this.tokenizeEOF();
            }),
            (t.prototype.tokenizePart = function (t) {
              for (
                this.input += (function (t) {
                  return t.replace(Le, '\n');
                })(t);
                this.index < this.input.length;
              ) {
                var e = this.states[this.state];
                if (void 0 === e) throw new Error('unhandled state ' + this.state);
                e.call(this);
              }
            }),
            (t.prototype.tokenizeEOF = function () {
              this.flushData();
            }),
            (t.prototype.flushData = function () {
              'data' === this.state &&
                (this.delegate.finishData(), this.transitionTo('beforeData'));
            }),
            (t.prototype.peek = function () {
              return this.input.charAt(this.index);
            }),
            (t.prototype.consume = function () {
              var t = this.peek();
              return this.index++, '\n' === t ? (this.line++, (this.column = 0)) : this.column++, t;
            }),
            (t.prototype.consumeCharRef = function () {
              var t = this.input.indexOf(';', this.index);
              if (-1 !== t) {
                var e = this.input.slice(this.index, t),
                  r = this.entityParser.parse(e);
                if (r) {
                  for (var n = e.length; n; ) this.consume(), n--;
                  return this.consume(), r;
                }
              }
            }),
            (t.prototype.markTagStart = function () {
              this.delegate.tagOpen();
            }),
            (t.prototype.appendToTagName = function (t) {
              (this.tagNameBuffer += t), this.delegate.appendToTagName(t);
            }),
            (t.prototype.isIgnoredEndTag = function () {
              var t = this.tagNameBuffer;
              return (
                ('title' === t &&
                  '</title>' !== this.input.substring(this.index, this.index + 8)) ||
                ('style' === t &&
                  '</style>' !== this.input.substring(this.index, this.index + 8)) ||
                ('script' === t &&
                  '<\/script>' !== this.input.substring(this.index, this.index + 9))
              );
            }),
            t
          );
        })(),
        Oe =
          ((function () {
            function t(t, e) {
              void 0 === e && (e = {}),
                (this.options = e),
                (this.token = null),
                (this.startLine = 1),
                (this.startColumn = 0),
                (this.tokens = []),
                (this.tokenizer = new Ie(this, t, e.mode)),
                (this._currentAttribute = void 0);
            }
            (t.prototype.tokenize = function (t) {
              return (this.tokens = []), this.tokenizer.tokenize(t), this.tokens;
            }),
              (t.prototype.tokenizePart = function (t) {
                return (this.tokens = []), this.tokenizer.tokenizePart(t), this.tokens;
              }),
              (t.prototype.tokenizeEOF = function () {
                return (this.tokens = []), this.tokenizer.tokenizeEOF(), this.tokens[0];
              }),
              (t.prototype.reset = function () {
                (this.token = null), (this.startLine = 1), (this.startColumn = 0);
              }),
              (t.prototype.current = function () {
                var t = this.token;
                if (null === t) throw new Error('token was unexpectedly null');
                if (0 === arguments.length) return t;
                for (var e = 0; e < arguments.length; e++) if (t.type === arguments[e]) return t;
                throw new Error('token type was unexpectedly ' + t.type);
              }),
              (t.prototype.push = function (t) {
                (this.token = t), this.tokens.push(t);
              }),
              (t.prototype.currentAttribute = function () {
                return this._currentAttribute;
              }),
              (t.prototype.addLocInfo = function () {
                this.options.loc &&
                  (this.current().loc = {
                    start: { line: this.startLine, column: this.startColumn },
                    end: { line: this.tokenizer.line, column: this.tokenizer.column },
                  }),
                  (this.startLine = this.tokenizer.line),
                  (this.startColumn = this.tokenizer.column);
              }),
              (t.prototype.beginDoctype = function () {
                this.push({ type: 'Doctype', name: '' });
              }),
              (t.prototype.appendToDoctypeName = function (t) {
                this.current('Doctype').name += t;
              }),
              (t.prototype.appendToDoctypePublicIdentifier = function (t) {
                var e = this.current('Doctype');
                void 0 === e.publicIdentifier
                  ? (e.publicIdentifier = t)
                  : (e.publicIdentifier += t);
              }),
              (t.prototype.appendToDoctypeSystemIdentifier = function (t) {
                var e = this.current('Doctype');
                void 0 === e.systemIdentifier
                  ? (e.systemIdentifier = t)
                  : (e.systemIdentifier += t);
              }),
              (t.prototype.endDoctype = function () {
                this.addLocInfo();
              }),
              (t.prototype.beginData = function () {
                this.push({ type: 'Chars', chars: '' });
              }),
              (t.prototype.appendToData = function (t) {
                this.current('Chars').chars += t;
              }),
              (t.prototype.finishData = function () {
                this.addLocInfo();
              }),
              (t.prototype.beginComment = function () {
                this.push({ type: 'Comment', chars: '' });
              }),
              (t.prototype.appendToCommentData = function (t) {
                this.current('Comment').chars += t;
              }),
              (t.prototype.finishComment = function () {
                this.addLocInfo();
              }),
              (t.prototype.tagOpen = function () {}),
              (t.prototype.beginStartTag = function () {
                this.push({ type: 'StartTag', tagName: '', attributes: [], selfClosing: !1 });
              }),
              (t.prototype.beginEndTag = function () {
                this.push({ type: 'EndTag', tagName: '' });
              }),
              (t.prototype.finishTag = function () {
                this.addLocInfo();
              }),
              (t.prototype.markTagAsSelfClosing = function () {
                this.current('StartTag').selfClosing = !0;
              }),
              (t.prototype.appendToTagName = function (t) {
                this.current('StartTag', 'EndTag').tagName += t;
              }),
              (t.prototype.beginAttribute = function () {
                this._currentAttribute = ['', '', !1];
              }),
              (t.prototype.appendToAttributeName = function (t) {
                this.currentAttribute()[0] += t;
              }),
              (t.prototype.beginAttributeValue = function (t) {
                this.currentAttribute()[2] = t;
              }),
              (t.prototype.appendToAttributeValue = function (t) {
                this.currentAttribute()[1] += t;
              }),
              (t.prototype.finishAttributeValue = function () {
                this.current('StartTag').attributes.push(this._currentAttribute);
              }),
              (t.prototype.reportSyntaxError = function (t) {
                this.current().syntaxError = t;
              });
          })(),
          30);
      function Be(t) {
        return function (e) {
          return Array.isArray(e) && e[0] === t;
        };
      }
      Be(12),
        Be(Oe),
        new RegExp(/["\x26\xa0]/u.source, 'gu'),
        new RegExp(/[&<>\xa0]/u.source, 'gu');
      var Ve = new Set([
        'area',
        'base',
        'br',
        'col',
        'command',
        'embed',
        'hr',
        'img',
        'input',
        'keygen',
        'link',
        'meta',
        'param',
        'source',
        'track',
        'wbr',
      ]);
      function Re(t) {
        return !!t && t.length > 0;
      }
      function $e(t) {
        return 0 === t.length ? void 0 : t[t.length - 1];
      }
      var Ue = Object.freeze({ line: 1, column: 0 }),
        Fe = Object.freeze({ source: '(synthetic)', start: Ue, end: Ue }),
        He = Object.freeze({ source: '(nonexistent)', start: Ue, end: Ue }),
        ze = Object.freeze({ source: '(broken)', start: Ue, end: Ue }),
        Me = class {
          constructor(t) {
            this._whens = t;
          }
          first(t) {
            for (let e of this._whens) {
              let r = e.match(t);
              if (Re(r)) return r[0];
            }
            return null;
          }
        },
        je = class {
          get(t, e) {
            let r = this._map.get(t);
            return r || ((r = e()), this._map.set(t, r), r);
          }
          add(t, e) {
            this._map.set(t, e);
          }
          match(t) {
            let e = (function (t) {
                switch (t) {
                  case 'Broken':
                  case 'InternalsSynthetic':
                  case 'NonExistent':
                    return 'IS_INVISIBLE';
                  default:
                    return t;
                }
              })(t),
              r = [],
              n = this._map.get(e),
              a = this._map.get('MATCH_ANY');
            return n && r.push(n), a && r.push(a), r;
          }
          constructor() {
            this._map = new Map();
          }
        };
      function We(t) {
        return t(new Ke()).validate();
      }
      var Ge,
        Ke = class {
          validate() {
            return (t, e) => this.matchFor(t.kind, e.kind)(t, e);
          }
          matchFor(t, e) {
            let r = this._whens.match(t);
            return Re(r), new Me(r).first(e);
          }
          when(t, e, r) {
            return this._whens.get(t, () => new je()).add(e, r), this;
          }
          constructor() {
            this._whens = new je();
          }
        },
        Qe = class t {
          static synthetic(e) {
            let r = Je.synthetic(e);
            return new t({ loc: r, chars: e });
          }
          static load(e, r) {
            return new t({ loc: Je.load(e, r[1]), chars: r[0] });
          }
          constructor(t) {
            (this.loc = t.loc), (this.chars = t.chars);
          }
          getString() {
            return this.chars;
          }
          serialize() {
            return [this.chars, this.loc.serialize()];
          }
        },
        Je = class t {
          static get NON_EXISTENT() {
            return new er('NonExistent', He).wrap();
          }
          static load(e, r) {
            return 'number' == typeof r
              ? t.forCharPositions(e, r, r)
              : 'string' == typeof r
                ? t.synthetic(r)
                : Array.isArray(r)
                  ? t.forCharPositions(e, r[0], r[1])
                  : 'NonExistent' === r
                    ? t.NON_EXISTENT
                    : 'Broken' === r
                      ? t.broken(ze)
                      : void (function (t, e = 'unexpected unreachable branch') {
                          throw (
                            (Wt.log('unreachable', t),
                            Wt.log(`${e} :: ${JSON.stringify(t)} (${t})`),
                            new Error('code reached unreachable'))
                          );
                        })(r);
          }
          static forHbsLoc(t, e) {
            let r = new sr(t, e.start),
              n = new sr(t, e.end);
            return new tr(t, { start: r, end: n }, e).wrap();
          }
          static forCharPositions(t, e, r) {
            let n = new ir(t, e),
              a = new ir(t, r);
            return new Ye(t, { start: n, end: a }).wrap();
          }
          static synthetic(t) {
            return new er('InternalsSynthetic', He, t).wrap();
          }
          static broken(t = ze) {
            return new er('Broken', t).wrap();
          }
          constructor(t) {
            var e;
            (this.data = t),
              (this.isInvisible = 'CharPosition' !== (e = t.kind) && 'HbsPosition' !== e);
          }
          getStart() {
            return this.data.getStart().wrap();
          }
          getEnd() {
            return this.data.getEnd().wrap();
          }
          get loc() {
            let t = this.data.toHbsSpan();
            return null === t ? ze : t.toHbsLoc();
          }
          get module() {
            return this.data.getModule();
          }
          get startPosition() {
            return this.loc.start;
          }
          get endPosition() {
            return this.loc.end;
          }
          toJSON() {
            return this.loc;
          }
          withStart(t) {
            return rr(t.data, this.data.getEnd());
          }
          withEnd(t) {
            return rr(this.data.getStart(), t.data);
          }
          asString() {
            return this.data.asString();
          }
          toSlice(t) {
            let e = this.data.asString();
            return JSON.stringify(e), JSON.stringify(t), new Qe({ loc: this, chars: t || e });
          }
          get start() {
            return this.loc.start;
          }
          set start(t) {
            this.data.locDidUpdate({ start: t });
          }
          get end() {
            return this.loc.end;
          }
          set end(t) {
            this.data.locDidUpdate({ end: t });
          }
          get source() {
            return this.module;
          }
          collapse(t) {
            switch (t) {
              case 'start':
                return this.getStart().collapsed();
              case 'end':
                return this.getEnd().collapsed();
            }
          }
          extend(t) {
            return rr(this.data.getStart(), t.data.getEnd());
          }
          serialize() {
            return this.data.serialize();
          }
          slice({ skipStart: t = 0, skipEnd: e = 0 }) {
            return rr(this.getStart().move(t).data, this.getEnd().move(-e).data);
          }
          sliceStartChars({ skipStart: t = 0, chars: e }) {
            return rr(this.getStart().move(t).data, this.getStart().move(t + e).data);
          }
          sliceEndChars({ skipEnd: t = 0, chars: e }) {
            return rr(this.getEnd().move(t - e).data, this.getStart().move(-t).data);
          }
        },
        Ye = class {
          constructor(t, e) {
            l(this, Ge),
              (this.source = t),
              (this.charPositions = e),
              (this.kind = 'CharPosition'),
              c(this, Ge, null);
          }
          wrap() {
            return new Je(this);
          }
          asString() {
            return this.source.slice(
              this.charPositions.start.charPos,
              this.charPositions.end.charPos
            );
          }
          getModule() {
            return this.source.module;
          }
          getStart() {
            return this.charPositions.start;
          }
          getEnd() {
            return this.charPositions.end;
          }
          locDidUpdate() {}
          toHbsSpan() {
            let t = o(this, Ge);
            if (null === t) {
              let e = this.charPositions.start.toHbsPos(),
                r = this.charPositions.end.toHbsPos();
              t = c(
                this,
                Ge,
                null === e || null === r ? nr : new tr(this.source, { start: e, end: r })
              );
            }
            return t === nr ? null : t;
          }
          serialize() {
            let {
              start: { charPos: t },
              end: { charPos: e },
            } = this.charPositions;
            return t === e ? t : [t, e];
          }
          toCharPosSpan() {
            return this;
          }
        };
      Ge = new WeakMap();
      var Ze,
        Xe,
        tr = class {
          constructor(t, e, r = null) {
            l(this, Ze),
              l(this, Xe),
              (this.source = t),
              (this.hbsPositions = e),
              (this.kind = 'HbsPosition'),
              c(this, Ze, null),
              c(this, Xe, r);
          }
          serialize() {
            let t = this.toCharPosSpan();
            return null === t ? 'Broken' : t.wrap().serialize();
          }
          wrap() {
            return new Je(this);
          }
          updateProvided(t, e) {
            o(this, Xe) && (o(this, Xe)[e] = t),
              c(this, Ze, null),
              c(this, Xe, { start: t, end: t });
          }
          locDidUpdate({ start: t, end: e }) {
            void 0 !== t &&
              (this.updateProvided(t, 'start'),
              (this.hbsPositions.start = new sr(this.source, t, null))),
              void 0 !== e &&
                (this.updateProvided(e, 'end'),
                (this.hbsPositions.end = new sr(this.source, e, null)));
          }
          asString() {
            let t = this.toCharPosSpan();
            return null === t ? '' : t.asString();
          }
          getModule() {
            return this.source.module;
          }
          getStart() {
            return this.hbsPositions.start;
          }
          getEnd() {
            return this.hbsPositions.end;
          }
          toHbsLoc() {
            return { start: this.hbsPositions.start.hbsPos, end: this.hbsPositions.end.hbsPos };
          }
          toHbsSpan() {
            return this;
          }
          toCharPosSpan() {
            let t = o(this, Ze);
            if (null === t) {
              let e = this.hbsPositions.start.toCharPos(),
                r = this.hbsPositions.end.toCharPos();
              if (!e || !r) return (t = c(this, Ze, nr)), null;
              t = c(this, Ze, new Ye(this.source, { start: e, end: r }));
            }
            return t === nr ? null : t;
          }
        };
      (Ze = new WeakMap()), (Xe = new WeakMap());
      var er = class {
          constructor(t, e, r = null) {
            (this.kind = t), (this.loc = e), (this.string = r);
          }
          serialize() {
            switch (this.kind) {
              case 'Broken':
              case 'NonExistent':
                return this.kind;
              case 'InternalsSynthetic':
                return this.string || '';
            }
          }
          wrap() {
            return new Je(this);
          }
          asString() {
            return this.string || '';
          }
          locDidUpdate({ start: t, end: e }) {
            void 0 !== t && (this.loc.start = t), void 0 !== e && (this.loc.end = e);
          }
          getModule() {
            return 'an unknown module';
          }
          getStart() {
            return new or(this.kind, this.loc.start);
          }
          getEnd() {
            return new or(this.kind, this.loc.end);
          }
          toCharPosSpan() {
            return this;
          }
          toHbsSpan() {
            return null;
          }
          toHbsLoc() {
            return ze;
          }
        },
        rr = We((t) =>
          t
            .when('HbsPosition', 'HbsPosition', (t, e) =>
              new tr(t.source, { start: t, end: e }).wrap()
            )
            .when('CharPosition', 'CharPosition', (t, e) =>
              new Ye(t.source, { start: t, end: e }).wrap()
            )
            .when('CharPosition', 'HbsPosition', (t, e) => {
              let r = e.toCharPos();
              return null === r ? new er('Broken', ze).wrap() : rr(t, r);
            })
            .when('HbsPosition', 'CharPosition', (t, e) => {
              let r = t.toCharPos();
              return null === r ? new er('Broken', ze).wrap() : rr(r, e);
            })
            .when('IS_INVISIBLE', 'MATCH_ANY', (t) => new er(t.kind, ze).wrap())
            .when('MATCH_ANY', 'IS_INVISIBLE', (t, e) => new er(e.kind, ze).wrap())
        ),
        nr = 'BROKEN',
        ar = class t {
          static forHbsPos(t, e) {
            return new sr(t, e, null).wrap();
          }
          static broken(t = Ue) {
            return new or('Broken', t).wrap();
          }
          constructor(t) {
            this.data = t;
          }
          get offset() {
            let t = this.data.toCharPos();
            return null === t ? null : t.offset;
          }
          eql(t) {
            return lr(this.data, t.data);
          }
          until(t) {
            return rr(this.data, t.data);
          }
          move(e) {
            let r = this.data.toCharPos();
            if (null === r) return t.broken();
            {
              let n = r.offset + e;
              return r.source.validate(n) ? new ir(r.source, n).wrap() : t.broken();
            }
          }
          collapsed() {
            return rr(this.data, this.data);
          }
          toJSON() {
            return this.data.toJSON();
          }
        },
        ir = class {
          constructor(t, e) {
            (this.source = t),
              (this.charPos = e),
              (this.kind = 'CharPosition'),
              (this._locPos = null);
          }
          toCharPos() {
            return this;
          }
          toJSON() {
            let t = this.toHbsPos();
            return null === t ? Ue : t.toJSON();
          }
          wrap() {
            return new ar(this);
          }
          get offset() {
            return this.charPos;
          }
          toHbsPos() {
            let t = this._locPos;
            if (null === t) {
              let e = this.source.hbsPosFor(this.charPos);
              this._locPos = t = null === e ? nr : new sr(this.source, e, this.charPos);
            }
            return t === nr ? null : t;
          }
        },
        sr = class {
          constructor(t, e, r = null) {
            (this.source = t),
              (this.hbsPos = e),
              (this.kind = 'HbsPosition'),
              (this._charPos = null === r ? null : new ir(t, r));
          }
          toCharPos() {
            let t = this._charPos;
            if (null === t) {
              let e = this.source.charPosFor(this.hbsPos);
              this._charPos = t = null === e ? nr : new ir(this.source, e);
            }
            return t === nr ? null : t;
          }
          toJSON() {
            return this.hbsPos;
          }
          wrap() {
            return new ar(this);
          }
          toHbsPos() {
            return this;
          }
        },
        or = class {
          constructor(t, e) {
            (this.kind = t), (this.pos = e);
          }
          toCharPos() {
            return null;
          }
          toJSON() {
            return this.pos;
          }
          wrap() {
            return new ar(this);
          }
          get offset() {
            return null;
          }
        },
        lr = We((t) =>
          t
            .when(
              'HbsPosition',
              'HbsPosition',
              ({ hbsPos: t }, { hbsPos: e }) => t.column === e.column && t.line === e.line
            )
            .when('CharPosition', 'CharPosition', ({ charPos: t }, { charPos: e }) => t === e)
            .when('CharPosition', 'HbsPosition', ({ offset: t }, e) => {
              var r;
              return t === (null == (r = e.toCharPos()) ? void 0 : r.offset);
            })
            .when('HbsPosition', 'CharPosition', (t, { offset: e }) => {
              var r;
              return (null == (r = t.toCharPos()) ? void 0 : r.offset) === e;
            })
            .when('MATCH_ANY', 'MATCH_ANY', () => !1)
        ),
        cr = class t {
          static from(e, r = {}) {
            var n;
            return new t(e, null == (n = r.meta) ? void 0 : n.moduleName);
          }
          constructor(t, e = 'an unknown module') {
            (this.source = t), (this.module = e);
          }
          validate(t) {
            return t >= 0 && t <= this.source.length;
          }
          slice(t, e) {
            return this.source.slice(t, e);
          }
          offsetFor(t, e) {
            return ar.forHbsPos(this, { line: t, column: e });
          }
          spanFor({ start: t, end: e }) {
            return Je.forHbsLoc(this, {
              start: { line: t.line, column: t.column },
              end: { line: e.line, column: e.column },
            });
          }
          hbsPosFor(t) {
            let e = 0,
              r = 0;
            if (t > this.source.length) return null;
            for (;;) {
              let n = this.source.indexOf('\n', r);
              if (t <= n || -1 === n) return { line: e + 1, column: t - r };
              (e += 1), (r = n + 1);
            }
          }
          charPosFor(t) {
            let { line: e, column: r } = t,
              n = this.source.length,
              a = 0,
              i = 0;
            for (; i < n; ) {
              let t = this.source.indexOf('\n', i);
              if ((-1 === t && (t = this.source.length), a === e - 1)) return i + r > t ? t : i + r;
              if (-1 === t) return 0;
              (a += 1), (i = t + 1);
            }
            return n;
          }
        };
      function ur(t, e) {
        let { module: r, loc: n } = e,
          { line: a, column: i } = n.start,
          s = e.asString(),
          o = s ? `\n\n|\n|  ${s.split('\n').join('\n|  ')}\n|\n\n` : '',
          l = new Error(`${t}: ${o}(error occurred in '${r}' @ line ${a} : column ${i})`);
        return (l.name = 'SyntaxError'), (l.location = e), (l.code = s), l;
      }
      var hr = {
          Template: ['body'],
          Block: ['body'],
          MustacheStatement: ['path', 'params', 'hash'],
          BlockStatement: ['path', 'params', 'hash', 'program', 'inverse'],
          ElementModifierStatement: ['path', 'params', 'hash'],
          CommentStatement: [],
          MustacheCommentStatement: [],
          ElementNode: ['attributes', 'modifiers', 'children', 'comments'],
          AttrNode: ['value'],
          TextNode: [],
          ConcatStatement: ['parts'],
          SubExpression: ['path', 'params', 'hash'],
          PathExpression: [],
          StringLiteral: [],
          BooleanLiteral: [],
          NumberLiteral: [],
          NullLiteral: [],
          UndefinedLiteral: [],
          Hash: ['pairs'],
          HashPair: ['value'],
        },
        pr = (function () {
          function t(t, e, r, n) {
            let a = Error.call(this, t);
            (this.key = n),
              (this.message = t),
              (this.node = e),
              (this.parent = r),
              a.stack && (this.stack = a.stack);
          }
          return (t.prototype = Object.create(Error.prototype)), (t.prototype.constructor = t), t;
        })();
      function dr(t, e, r) {
        return new pr('Cannot remove a node unless it is part of an array', t, e, r);
      }
      function mr(t, e) {
        return new pr('Replacing and removing in key handlers is not yet supported.', t, null, e);
      }
      var fr,
        gr = class {
          constructor(t, e = null, r = null) {
            (this.node = t), (this.parent = e), (this.parentKey = r);
          }
          get parentNode() {
            return this.parent ? this.parent.node : null;
          }
          parents() {
            return { [Symbol.iterator]: () => new yr(this) };
          }
        },
        yr = class {
          constructor(t) {
            this.path = t;
          }
          next() {
            return this.path.parent
              ? ((this.path = this.path.parent), { done: !1, value: this.path })
              : { done: !0, value: null };
          }
        };
      function br(t) {
        return 'function' == typeof t ? t : t.enter;
      }
      function vr(t) {
        return 'function' == typeof t ? void 0 : t.exit;
      }
      function Sr(t, e) {
        let r,
          n,
          a,
          { node: i, parent: s, parentKey: o } = e,
          l = (function (t, e) {
            if (t.Program && (('Template' === e && !t.Template) || ('Block' === e && !t.Block)))
              return t.Program;
            let r = t[e];
            return void 0 !== r ? r : t.All;
          })(t, i.type);
        if (
          (void 0 !== l && ((r = br(l)), (n = vr(l))), void 0 !== r && (a = r(i, e)), null != a)
        ) {
          if (JSON.stringify(i) !== JSON.stringify(a))
            return Array.isArray(a) ? (Tr(t, a, s, o), a) : Sr(t, new gr(a, s, o)) || a;
          a = void 0;
        }
        if (void 0 === a) {
          let r = hr[i.type];
          for (let n = 0; n < r.length; n++) kr(t, l, e, r[n]);
          void 0 !== n && (a = n(i, e));
        }
        return a;
      }
      function wr(t, e, r) {
        t[e] = r;
      }
      function kr(t, e, r, n) {
        let a,
          i,
          { node: s } = r,
          o = s[n];
        if (o) {
          if (void 0 !== e) {
            let t = (function (t, e) {
              let r = 'function' != typeof t ? t.keys : void 0;
              if (void 0 === r) return;
              let n = r[e];
              return void 0 !== n ? n : r.All;
            })(e, n);
            void 0 !== t && ((a = br(t)), (i = vr(t)));
          }
          if (void 0 !== a && void 0 !== a(s, n)) throw mr(s, n);
          if (Array.isArray(o)) Tr(t, o, r, n);
          else {
            let e = Sr(t, new gr(o, r, n));
            void 0 !== e &&
              (function (t, e, r, n) {
                if (null === n) throw dr(r, t, e);
                if (Array.isArray(n)) {
                  if (1 !== n.length)
                    throw 0 === n.length
                      ? dr(r, t, e)
                      : (function (t, e, r) {
                          return new pr(
                            'Cannot replace a node with multiple nodes unless it is part of an array',
                            t,
                            e,
                            r
                          );
                        })(r, t, e);
                  wr(t, e, n[0]);
                } else wr(t, e, n);
              })(s, n, o, e);
          }
          if (void 0 !== i && void 0 !== i(s, n)) throw mr(s, n);
        }
      }
      function Tr(t, e, r, n) {
        for (let a = 0; a < e.length; a++) {
          let i = e[a],
            s = Sr(t, new gr(i, r, n));
          void 0 !== s && (a += Er(e, a, s) - 1);
        }
      }
      function Er(t, e, r) {
        return null === r
          ? (t.splice(e, 1), 0)
          : Array.isArray(r)
            ? (t.splice(e, 1, ...r), r.length)
            : (t.splice(e, 1, r), 1);
      }
      function Nr(t, e) {
        Sr(e, new gr(t));
      }
      function Ar(t, e) {
        (function (t) {
          switch (t.type) {
            case 'Block':
            case 'Template':
              return t.body;
            case 'ElementNode':
              return t.children;
          }
        })(t).push(e);
      }
      function Pr(t) {
        return (
          'StringLiteral' === t.type ||
          'BooleanLiteral' === t.type ||
          'NumberLiteral' === t.type ||
          'NullLiteral' === t.type ||
          'UndefinedLiteral' === t.type
        );
      }
      function xr() {
        return fr || (fr = new cr('', '(synthetic)')), fr;
      }
      function Dr(...t) {
        if (1 === t.length) {
          let e = t[0];
          return e && 'object' == typeof e ? Je.forHbsLoc(xr(), e) : Je.forHbsLoc(xr(), Fe);
        }
        {
          let [e, r, n, a, i] = t,
            s = i ? new cr('', i) : xr();
          return Je.forHbsLoc(s, {
            start: { line: e, column: r },
            end: { line: n || e, column: a || r },
          });
        }
      }
      function Cr(t) {
        return function (e, r) {
          return (function (t, e, r) {
            return qr.literal({ type: t, value: e, loc: Dr(r || null) });
          })(t, e, r);
        };
      }
      Cr('StringLiteral'), Cr('BooleanLiteral'), Cr('NumberLiteral');
      var Lr = { close: !1, open: !1 },
        qr = new (class {
          pos({ line: t, column: e }) {
            return { line: t, column: e };
          }
          blockItself({ body: t, params: e, chained: r = !1, loc: n }) {
            return {
              type: 'Block',
              body: t,
              params: e,
              get blockParams() {
                return this.params.map((t) => t.name);
              },
              set blockParams(t) {
                this.params = t.map((t) => qr.var({ name: t, loc: Je.synthetic(t) }));
              },
              chained: r,
              loc: n,
            };
          }
          template({ body: t, blockParams: e, loc: r }) {
            return { type: 'Template', body: t, blockParams: e, loc: r };
          }
          mustache({ path: t, params: e, hash: r, trusting: n, loc: a, strip: i = Lr }) {
            return (function ({ path: t, params: e, hash: r, trusting: n, strip: a, loc: i }) {
              let s = {
                type: 'MustacheStatement',
                path: t,
                params: e,
                hash: r,
                trusting: n,
                strip: a,
                loc: i,
              };
              return (
                Object.defineProperty(s, 'escaped', {
                  enumerable: !1,
                  get() {
                    return !this.trusting;
                  },
                  set(t) {
                    this.trusting = !t;
                  },
                }),
                s
              );
            })({ path: t, params: e, hash: r, trusting: n, strip: i, loc: a });
          }
          block({
            path: t,
            params: e,
            hash: r,
            defaultBlock: n,
            elseBlock: a = null,
            loc: i,
            openStrip: s = Lr,
            inverseStrip: o = Lr,
            closeStrip: l = Lr,
          }) {
            return {
              type: 'BlockStatement',
              path: t,
              params: e,
              hash: r,
              program: n,
              inverse: a,
              loc: i,
              openStrip: s,
              inverseStrip: o,
              closeStrip: l,
            };
          }
          comment({ value: t, loc: e }) {
            return { type: 'CommentStatement', value: t, loc: e };
          }
          mustacheComment({ value: t, loc: e }) {
            return { type: 'MustacheCommentStatement', value: t, loc: e };
          }
          concat({ parts: t, loc: e }) {
            return { type: 'ConcatStatement', parts: t, loc: e };
          }
          element({
            path: t,
            selfClosing: e,
            attributes: r,
            modifiers: n,
            params: a,
            comments: i,
            children: s,
            openTag: o,
            closeTag: l,
            loc: c,
          }) {
            let u = e;
            return {
              type: 'ElementNode',
              path: t,
              attributes: r,
              modifiers: n,
              params: a,
              comments: i,
              children: s,
              openTag: o,
              closeTag: l,
              loc: c,
              get tag() {
                return this.path.original;
              },
              set tag(t) {
                this.path.original = t;
              },
              get blockParams() {
                return this.params.map((t) => t.name);
              },
              set blockParams(t) {
                this.params = t.map((t) => qr.var({ name: t, loc: Je.synthetic(t) }));
              },
              get selfClosing() {
                return u;
              },
              set selfClosing(t) {
                (u = t), (this.closeTag = t ? null : Je.synthetic(`</${this.tag}>`));
              },
            };
          }
          elementModifier({ path: t, params: e, hash: r, loc: n }) {
            return { type: 'ElementModifierStatement', path: t, params: e, hash: r, loc: n };
          }
          attr({ name: t, value: e, loc: r }) {
            return { type: 'AttrNode', name: t, value: e, loc: r };
          }
          text({ chars: t, loc: e }) {
            return { type: 'TextNode', chars: t, loc: e };
          }
          sexpr({ path: t, params: e, hash: r, loc: n }) {
            return { type: 'SubExpression', path: t, params: e, hash: r, loc: n };
          }
          path({ head: t, tail: e, loc: r }) {
            return (function ({ head: t, tail: e, loc: r }) {
              let n = {
                type: 'PathExpression',
                head: t,
                tail: e,
                get original() {
                  return [this.head.original, ...this.tail].join('.');
                },
                set original(t) {
                  let [e, ...r] = t.split('.');
                  (this.head = (function (t, e) {
                    return qr.head({ original: t, loc: Dr(e || null) });
                  })(e, this.head.loc)),
                    (this.tail = r);
                },
                loc: r,
              };
              return (
                Object.defineProperty(n, 'parts', {
                  enumerable: !1,
                  get() {
                    let t = this.original.split('.');
                    return (
                      'this' === t[0] ? t.shift() : t[0].startsWith('@') && (t[0] = t[0].slice(1)),
                      Object.freeze(t)
                    );
                  },
                  set(t) {
                    var e;
                    let r = [...t];
                    'this' === r[0] ||
                      (null != (e = r[0]) && e.startsWith('@')) ||
                      ('ThisHead' === this.head.type
                        ? r.unshift('this')
                        : 'AtHead' === this.head.type && (r[0] = `@${r[0]}`)),
                      (this.original = r.join('.'));
                  },
                }),
                Object.defineProperty(n, 'this', {
                  enumerable: !1,
                  get() {
                    return 'ThisHead' === this.head.type;
                  },
                }),
                Object.defineProperty(n, 'data', {
                  enumerable: !1,
                  get() {
                    return 'AtHead' === this.head.type;
                  },
                }),
                n
              );
            })({ head: t, tail: e, loc: r });
          }
          head({ original: t, loc: e }) {
            return 'this' === t
              ? this.this({ loc: e })
              : '@' === t[0]
                ? this.atName({ name: t, loc: e })
                : this.var({ name: t, loc: e });
          }
          this({ loc: t }) {
            return {
              type: 'ThisHead',
              get original() {
                return 'this';
              },
              loc: t,
            };
          }
          atName({ name: t, loc: e }) {
            let r = '',
              n = {
                type: 'AtHead',
                get name() {
                  return r;
                },
                set name(t) {
                  t[0], t.indexOf('.'), (r = t);
                },
                get original() {
                  return this.name;
                },
                set original(t) {
                  this.name = t;
                },
                loc: e,
              };
            return (n.name = t), n;
          }
          var({ name: t, loc: e }) {
            let r = '',
              n = {
                type: 'VarHead',
                get name() {
                  return r;
                },
                set name(t) {
                  t[0], t.indexOf('.'), (r = t);
                },
                get original() {
                  return this.name;
                },
                set original(t) {
                  this.name = t;
                },
                loc: e,
              };
            return (n.name = t), n;
          }
          hash({ pairs: t, loc: e }) {
            return { type: 'Hash', pairs: t, loc: e };
          }
          pair({ key: t, value: e, loc: r }) {
            return { type: 'HashPair', key: t, value: e, loc: r };
          }
          literal({ type: t, value: e, loc: r }) {
            return (function ({ type: t, value: e, loc: r }) {
              let n = { type: t, value: e, loc: r };
              return (
                Object.defineProperty(n, 'original', {
                  enumerable: !1,
                  get() {
                    return this.value;
                  },
                  set(t) {
                    this.value = t;
                  },
                }),
                n
              );
            })({ type: t, value: e, loc: r });
          }
        })(),
        _r = class {
          constructor(t, e = new xe(Ee), r = 'precompile') {
            (this.elementStack = []),
              (this.currentAttribute = null),
              (this.currentNode = null),
              (this.source = t),
              (this.lines = t.source.split(/\r\n?|\n/u)),
              (this.tokenizer = new Ie(this, e, r));
          }
          offset() {
            let { line: t, column: e } = this.tokenizer;
            return this.source.offsetFor(t, e);
          }
          pos({ line: t, column: e }) {
            return this.source.offsetFor(t, e);
          }
          finish(t) {
            return jt({}, t, { loc: t.start.until(this.offset()) });
          }
          get currentAttr() {
            return this.currentAttribute;
          }
          get currentTag() {
            let t = this.currentNode;
            return t && ('StartTag' === t.type || t.type), t;
          }
          get currentStartTag() {
            let t = this.currentNode;
            return t && t.type, t;
          }
          get currentEndTag() {
            let t = this.currentNode;
            return t && t.type, t;
          }
          get currentComment() {
            let t = this.currentNode;
            return t && t.type, t;
          }
          get currentData() {
            let t = this.currentNode;
            return t && t.type, t;
          }
          acceptNode(t) {
            return this[t.type](t);
          }
          currentElement() {
            return $e(this.elementStack);
          }
          sourceForNode(t, e) {
            let r,
              n,
              a,
              i = t.loc.start.line - 1,
              s = i - 1,
              o = t.loc.start.column,
              l = [];
            for (
              e
                ? ((n = e.loc.end.line - 1), (a = e.loc.end.column))
                : ((n = t.loc.end.line - 1), (a = t.loc.end.column));
              s < n;
            )
              s++,
                (r = this.lines[s]),
                s === i
                  ? i === n
                    ? l.push(r.slice(o, a))
                    : l.push(r.slice(o))
                  : s === n
                    ? l.push(r.slice(0, a))
                    : l.push(r);
            return l.join('\n');
          }
        },
        Ir = class extends _r {
          parse(t, e) {
            var r;
            t.loc;
            let n = qr.template({ body: [], blockParams: e, loc: this.source.spanFor(t.loc) }),
              a = this.parseProgram(n, t);
            return null == (r = this.pendingError) || r.eof(a.loc.getEnd()), a;
          }
          Program(t, e) {
            t.loc;
            let r = qr.blockItself({
              body: [],
              params: e,
              chained: t.chained,
              loc: this.source.spanFor(t.loc),
            });
            return this.parseProgram(r, t);
          }
          parseProgram(t, e) {
            if (0 === e.body.length) return t;
            let r;
            try {
              this.elementStack.push(t);
              for (let t of e.body) this.acceptNode(t);
            } finally {
              r = this.elementStack.pop();
            }
            if (t !== r) {
              if ('ElementNode' === (null == r ? void 0 : r.type))
                throw ur(`Unclosed element \`${r.tag}\``, r.loc);
              t.type;
            }
            return t;
          }
          BlockStatement(t) {
            var e;
            if ('comment' === this.tokenizer.state)
              return t.loc, void this.appendToCommentData(this.sourceForNode(t));
            if ('data' !== this.tokenizer.state && 'beforeData' !== this.tokenizer.state)
              throw ur(
                'A block may only be used inside an HTML element or another block.',
                this.source.spanFor(t.loc)
              );
            let r,
              { path: n, params: a, hash: i } = Or(this, t),
              s = this.source.spanFor(t.loc),
              o = [];
            if (null != (e = t.program.blockParams) && e.length) {
              let e = i.loc.collapse('end');
              (e = t.program.loc
                ? e.withEnd(this.source.spanFor(t.program.loc).getStart())
                : t.program.body[0]
                  ? e.withEnd(this.source.spanFor(t.program.body[0].loc).getStart())
                  : e.withEnd(s.getEnd())),
                (r = Vr(this.source, t, e));
              let n = e.asString(),
                a = n.indexOf('|') + 1,
                l = n.indexOf('|', a);
              for (let r of t.program.blockParams) {
                let t, i;
                (t = a >= l ? -1 : n.indexOf(r, a)),
                  -1 === t || t + r.length > l
                    ? ((a = l), (i = this.source.spanFor(He)))
                    : ((a = t),
                      (i = e.sliceStartChars({ skipStart: a, chars: r.length })),
                      (a += r.length)),
                  o.push(qr.var({ name: r, loc: i }));
              }
            } else r = Vr(this.source, t, s);
            let l = this.Program(r.program, o),
              c = r.inverse ? this.Program(r.inverse, []) : null,
              u = qr.block({
                path: n,
                params: a,
                hash: i,
                defaultBlock: l,
                elseBlock: c,
                loc: this.source.spanFor(t.loc),
                openStrip: t.openStrip,
                inverseStrip: t.inverseStrip,
                closeStrip: t.closeStrip,
              });
            Ar(this.currentElement(), u);
          }
          MustacheStatement(t) {
            var e;
            null == (e = this.pendingError) || e.mustache(this.source.spanFor(t.loc));
            let { tokenizer: r } = this;
            if ('comment' === r.state) return void this.appendToCommentData(this.sourceForNode(t));
            let n,
              { escaped: a, loc: i, strip: s } = t;
            if ('original' in t.path && '...attributes' === t.path.original)
              throw ur('Illegal use of ...attributes', this.source.spanFor(t.loc));
            if (Pr(t.path))
              n = qr.mustache({
                path: this.acceptNode(t.path),
                params: [],
                hash: qr.hash({ pairs: [], loc: this.source.spanFor(t.path.loc).collapse('end') }),
                trusting: !a,
                loc: this.source.spanFor(i),
                strip: s,
              });
            else {
              let { path: e, params: r, hash: o } = Or(this, t);
              n = qr.mustache({
                path: e,
                params: r,
                hash: o,
                trusting: !a,
                loc: this.source.spanFor(i),
                strip: s,
              });
            }
            switch (r.state) {
              case 'tagOpen':
              case 'tagName':
                throw ur('Cannot use mustaches in an elements tagname', n.loc);
              case 'beforeAttributeName':
                Br(this.currentStartTag, n);
                break;
              case 'attributeName':
              case 'afterAttributeName':
                this.beginAttributeValue(!1),
                  this.finishAttributeValue(),
                  Br(this.currentStartTag, n),
                  r.transitionTo('beforeAttributeName');
                break;
              case 'afterAttributeValueQuoted':
                Br(this.currentStartTag, n), r.transitionTo('beforeAttributeName');
                break;
              case 'beforeAttributeValue':
                this.beginAttributeValue(!1),
                  this.appendDynamicAttributeValuePart(n),
                  r.transitionTo('attributeValueUnquoted');
                break;
              case 'attributeValueDoubleQuoted':
              case 'attributeValueSingleQuoted':
              case 'attributeValueUnquoted':
                this.appendDynamicAttributeValuePart(n);
                break;
              default:
                Ar(this.currentElement(), n);
            }
            return n;
          }
          appendDynamicAttributeValuePart(t) {
            this.finalizeTextPart();
            let e = this.currentAttr;
            (e.isDynamic = !0), e.parts.push(t);
          }
          finalizeTextPart() {
            let t = this.currentAttr.currentPart;
            null !== t && (this.currentAttr.parts.push(t), this.startTextPart());
          }
          startTextPart() {
            this.currentAttr.currentPart = null;
          }
          ContentStatement(t) {
            (function (t, e) {
              let r = e.loc.start.line,
                n = e.loc.start.column,
                a = (function (t, e) {
                  if ('' === e) return { lines: t.split('\n').length - 1, columns: 0 };
                  let [r] = t.split(e),
                    n = r.split(/\n/u),
                    a = n.length - 1;
                  return { lines: a, columns: n[a].length };
                })(e.original, e.value);
              (r += a.lines),
                a.lines ? (n = a.columns) : (n += a.columns),
                (t.line = r),
                (t.column = n);
            })(this.tokenizer, t),
              this.tokenizer.tokenizePart(t.value),
              this.tokenizer.flushData();
          }
          CommentStatement(t) {
            let { tokenizer: e } = this;
            if ('comment' === e.state) return this.appendToCommentData(this.sourceForNode(t)), null;
            let { value: r, loc: n } = t,
              a = qr.mustacheComment({ value: r, loc: this.source.spanFor(n) });
            switch (e.state) {
              case 'beforeAttributeName':
              case 'afterAttributeName':
                this.currentStartTag.comments.push(a);
                break;
              case 'beforeData':
              case 'data':
                Ar(this.currentElement(), a);
                break;
              default:
                throw ur(
                  `Using a Handlebars comment when in the \`${e.state}\` state is not supported`,
                  this.source.spanFor(t.loc)
                );
            }
            return a;
          }
          PartialStatement(t) {
            throw ur('Handlebars partials are not supported', this.source.spanFor(t.loc));
          }
          PartialBlockStatement(t) {
            throw ur('Handlebars partial blocks are not supported', this.source.spanFor(t.loc));
          }
          Decorator(t) {
            throw ur('Handlebars decorators are not supported', this.source.spanFor(t.loc));
          }
          DecoratorBlock(t) {
            throw ur('Handlebars decorator blocks are not supported', this.source.spanFor(t.loc));
          }
          SubExpression(t) {
            let { path: e, params: r, hash: n } = Or(this, t);
            return qr.sexpr({ path: e, params: r, hash: n, loc: this.source.spanFor(t.loc) });
          }
          PathExpression(t) {
            let e,
              { original: r } = t;
            if (-1 !== r.indexOf('/')) {
              if ('./' === r.slice(0, 2))
                throw ur(
                  'Using "./" is not supported in Glimmer and unnecessary',
                  this.source.spanFor(t.loc)
                );
              if ('../' === r.slice(0, 3))
                throw ur(
                  'Changing context using "../" is not supported in Glimmer',
                  this.source.spanFor(t.loc)
                );
              if (-1 !== r.indexOf('.'))
                throw ur(
                  "Mixing '.' and '/' in paths is not supported in Glimmer; use only '.' to separate property paths",
                  this.source.spanFor(t.loc)
                );
              e = [t.parts.join('/')];
            } else {
              if ('.' === r)
                throw ur(
                  "'.' is not a supported path in Glimmer; check for a path with a trailing '.'",
                  this.source.spanFor(t.loc)
                );
              e = t.parts;
            }
            let n,
              a = !1;
            if ((/^this(?:\..+)?$/u.test(r) && (a = !0), a))
              n = qr.this({
                loc: this.source.spanFor({
                  start: t.loc.start,
                  end: { line: t.loc.start.line, column: t.loc.start.column + 4 },
                }),
              });
            else if (t.data) {
              let r = e.shift();
              if (void 0 === r)
                throw ur(
                  'Attempted to parse a path expression, but it was not valid. Paths beginning with @ must start with a-z.',
                  this.source.spanFor(t.loc)
                );
              n = qr.atName({
                name: `@${r}`,
                loc: this.source.spanFor({
                  start: t.loc.start,
                  end: { line: t.loc.start.line, column: t.loc.start.column + r.length + 1 },
                }),
              });
            } else {
              let r = e.shift();
              if (void 0 === r)
                throw ur(
                  'Attempted to parse a path expression, but it was not valid. Paths must start with a-z or A-Z.',
                  this.source.spanFor(t.loc)
                );
              n = qr.var({
                name: r,
                loc: this.source.spanFor({
                  start: t.loc.start,
                  end: { line: t.loc.start.line, column: t.loc.start.column + r.length },
                }),
              });
            }
            return qr.path({ head: n, tail: e, loc: this.source.spanFor(t.loc) });
          }
          Hash(t) {
            let e = t.pairs.map((t) =>
              qr.pair({
                key: t.key,
                value: this.acceptNode(t.value),
                loc: this.source.spanFor(t.loc),
              })
            );
            return qr.hash({ pairs: e, loc: this.source.spanFor(t.loc) });
          }
          StringLiteral(t) {
            return qr.literal({
              type: 'StringLiteral',
              value: t.value,
              loc: this.source.spanFor(t.loc),
            });
          }
          BooleanLiteral(t) {
            return qr.literal({
              type: 'BooleanLiteral',
              value: t.value,
              loc: this.source.spanFor(t.loc),
            });
          }
          NumberLiteral(t) {
            return qr.literal({
              type: 'NumberLiteral',
              value: t.value,
              loc: this.source.spanFor(t.loc),
            });
          }
          UndefinedLiteral(t) {
            return qr.literal({
              type: 'UndefinedLiteral',
              value: void 0,
              loc: this.source.spanFor(t.loc),
            });
          }
          NullLiteral(t) {
            return qr.literal({
              type: 'NullLiteral',
              value: null,
              loc: this.source.spanFor(t.loc),
            });
          }
          constructor(...t) {
            super(...t), (this.pendingError = null);
          }
        };
      function Or(t, e) {
        let r;
        switch (e.path.type) {
          case 'PathExpression':
            r = t.PathExpression(e.path);
            break;
          case 'SubExpression':
            r = t.SubExpression(e.path);
            break;
          case 'StringLiteral':
          case 'UndefinedLiteral':
          case 'NullLiteral':
          case 'NumberLiteral':
          case 'BooleanLiteral': {
            let r;
            throw (
              ((r =
                'BooleanLiteral' === e.path.type
                  ? e.path.original.toString()
                  : 'StringLiteral' === e.path.type
                    ? `"${e.path.original}"`
                    : 'NullLiteral' === e.path.type
                      ? 'null'
                      : 'NumberLiteral' === e.path.type
                        ? e.path.value.toString()
                        : 'undefined'),
              ur(
                `${e.path.type} "${'StringLiteral' === e.path.type ? e.path.original : r}" cannot be called as a sub-expression, replace (${r}) with ${r}`,
                t.source.spanFor(e.path.loc)
              ))
            );
          }
        }
        let n = e.params.map((e) => t.acceptNode(e)),
          a = Re(n) ? $e(n).loc : r.loc;
        return {
          path: r,
          params: n,
          hash: e.hash
            ? t.Hash(e.hash)
            : qr.hash({ pairs: [], loc: t.source.spanFor(a).collapse('end') }),
        };
      }
      function Br(t, e) {
        let { path: r, params: n, hash: a, loc: i } = e;
        if (Pr(r)) {
          let n = `{{${((s = r), 'UndefinedLiteral' === s.type ? 'undefined' : JSON.stringify(s.value))}}}`;
          throw ur(`In <${t.name} ... ${n} ..., ${n} is not a valid modifier`, e.loc);
        }
        var s;
        let o = qr.elementModifier({ path: r, params: n, hash: a, loc: i });
        t.modifiers.push(o);
      }
      function Vr(t, e, r) {
        if (!e.program.loc) {
          let n = x(!1, e.program.body, 0),
            a = x(!1, e.program.body, -1);
          if (n && a) e.program.loc = { ...n.loc, end: a.loc.end };
          else {
            let n = t.spanFor(e.loc);
            e.program.loc = r.withEnd(n.getEnd());
          }
        }
        let n = t.spanFor(e.program.loc).getEnd();
        return e.inverse && !e.inverse.loc && (e.inverse.loc = n.collapsed()), e;
      }
      function Rr(t) {
        return /[\t\n\f ]/u.test(t);
      }
      var $r = class extends Ir {
          reset() {
            this.currentNode = null;
          }
          beginComment() {
            this.currentNode = {
              type: 'CommentStatement',
              value: '',
              start: this.source.offsetFor(this.tagOpenLine, this.tagOpenColumn),
            };
          }
          appendToCommentData(t) {
            this.currentComment.value += t;
          }
          finishComment() {
            Ar(this.currentElement(), qr.comment(this.finish(this.currentComment)));
          }
          beginData() {
            this.currentNode = { type: 'TextNode', chars: '', start: this.offset() };
          }
          appendToData(t) {
            this.currentData.chars += t;
          }
          finishData() {
            Ar(this.currentElement(), qr.text(this.finish(this.currentData)));
          }
          tagOpen() {
            (this.tagOpenLine = this.tokenizer.line), (this.tagOpenColumn = this.tokenizer.column);
          }
          beginStartTag() {
            this.currentNode = {
              type: 'StartTag',
              name: '',
              nameStart: null,
              nameEnd: null,
              attributes: [],
              modifiers: [],
              comments: [],
              params: [],
              selfClosing: !1,
              start: this.source.offsetFor(this.tagOpenLine, this.tagOpenColumn),
            };
          }
          beginEndTag() {
            this.currentNode = {
              type: 'EndTag',
              name: '',
              start: this.source.offsetFor(this.tagOpenLine, this.tagOpenColumn),
            };
          }
          finishTag() {
            let t = this.finish(this.currentTag);
            if ('StartTag' === t.type) {
              if ((this.finishStartTag(), ':' === t.name))
                throw ur(
                  'Invalid named block named detected, you may have created a named block without a name, or you may have began your name with a number. Named blocks must have names that are at least one character long, and begin with a lower case letter',
                  this.source.spanFor({
                    start: this.currentTag.start.toJSON(),
                    end: this.offset().toJSON(),
                  })
                );
              (Ve.has(t.name) || t.selfClosing) && this.finishEndTag(!0);
            } else t.type, t.type, this.finishEndTag(!1);
          }
          finishStartTag() {
            let { name: t, nameStart: e, nameEnd: r } = this.currentStartTag,
              n = e.until(r),
              [a, ...i] = t.split('.'),
              s = qr.path({
                head: qr.head({ original: a, loc: n.sliceStartChars({ chars: a.length }) }),
                tail: i,
                loc: n,
              }),
              {
                attributes: o,
                modifiers: l,
                comments: c,
                params: u,
                selfClosing: h,
                loc: p,
              } = this.finish(this.currentStartTag),
              d = qr.element({
                path: s,
                selfClosing: h,
                attributes: o,
                modifiers: l,
                comments: c,
                params: u,
                children: [],
                openTag: p,
                closeTag: h ? null : Je.broken(),
                loc: p,
              });
            this.elementStack.push(d);
          }
          finishEndTag(t) {
            let { start: e } = this.currentTag,
              r = this.finish(this.currentTag),
              n = this.elementStack.pop();
            this.validateEndTag(r, n, t);
            let a = this.currentElement();
            t
              ? (n.closeTag = null)
              : n.selfClosing
                ? n.closeTag
                : (n.closeTag = e.until(this.offset())),
              (n.loc = n.loc.withEnd(this.offset())),
              Ar(a, qr.element(n));
          }
          markTagAsSelfClosing() {
            let t = this.currentTag;
            if ('StartTag' !== t.type)
              throw ur(
                'Invalid end tag: closing tag must not be self-closing',
                this.source.spanFor({ start: t.start.toJSON(), end: this.offset().toJSON() })
              );
            t.selfClosing = !0;
          }
          appendToTagName(t) {
            let e = this.currentTag;
            if (((e.name += t), 'StartTag' === e.type)) {
              let t = this.offset();
              null === e.nameStart && (e.nameEnd, (e.nameStart = t.move(-1))), (e.nameEnd = t);
            }
          }
          beginAttribute() {
            let t = this.offset();
            this.currentAttribute = {
              name: '',
              parts: [],
              currentPart: null,
              isQuoted: !1,
              isDynamic: !1,
              start: t,
              valueSpan: t.collapsed(),
            };
          }
          appendToAttributeName(t) {
            (this.currentAttr.name += t),
              'as' === this.currentAttr.name && this.parsePossibleBlockParams();
          }
          beginAttributeValue(t) {
            (this.currentAttr.isQuoted = t),
              this.startTextPart(),
              (this.currentAttr.valueSpan = this.offset().collapsed());
          }
          appendToAttributeValue(t) {
            let e = this.currentAttr.parts,
              r = e[e.length - 1],
              n = this.currentAttr.currentPart;
            if (n) (n.chars += t), (n.loc = n.loc.withEnd(this.offset()));
            else {
              let e = this.offset();
              (e =
                '\n' === t
                  ? r
                    ? r.loc.getEnd()
                    : this.currentAttr.valueSpan.getStart()
                  : e.move(-1)),
                (this.currentAttr.currentPart = qr.text({ chars: t, loc: e.collapsed() }));
            }
          }
          finishAttributeValue() {
            this.finalizeTextPart();
            let t = this.currentTag,
              e = this.offset();
            if ('EndTag' === t.type)
              throw ur(
                'Invalid end tag: closing tag must not have attributes',
                this.source.spanFor({ start: t.start.toJSON(), end: e.toJSON() })
              );
            let {
              name: r,
              parts: n,
              start: a,
              isQuoted: i,
              isDynamic: s,
              valueSpan: o,
            } = this.currentAttr;
            if (r.startsWith('|') && 0 === n.length && !i && !s)
              throw ur(
                'Invalid block parameters syntax: block parameters must be preceded by the `as` keyword',
                a.until(a.move(r.length))
              );
            let l = this.assembleAttributeValue(n, i, s, a.until(e));
            l.loc = o.withEnd(e);
            let c = qr.attr({ name: r, value: l, loc: a.until(e) });
            this.currentStartTag.attributes.push(c);
          }
          parsePossibleBlockParams() {
            let t = /[!"#%&'()*+./;<=>@[\\\]^`{|}~]/u;
            this.tokenizer.state;
            let e,
              r = this.currentStartTag,
              n = this.currentAttr,
              a = { state: 'PossibleAs' },
              i = {
                PossibleAs: (t) => {
                  if ((a.state, Rr(t)))
                    (a = { state: 'BeforeStartPipe' }),
                      this.tokenizer.transitionTo('afterAttributeName'),
                      this.tokenizer.consume();
                  else {
                    if ('|' === t)
                      throw ur(
                        'Invalid block parameters syntax: expecting at least one space character between "as" and "|"',
                        n.start.until(this.offset().move(1))
                      );
                    a = { state: 'Done' };
                  }
                },
                BeforeStartPipe: (t) => {
                  a.state,
                    Rr(t)
                      ? this.tokenizer.consume()
                      : '|' === t
                        ? ((a = { state: 'BeforeBlockParamName' }),
                          this.tokenizer.transitionTo('beforeAttributeName'),
                          this.tokenizer.consume())
                        : (a = { state: 'Done' });
                },
                BeforeBlockParamName: (t) => {
                  if ((a.state, Rr(t))) this.tokenizer.consume();
                  else if ('' === t)
                    (a = { state: 'Done' }),
                      (this.pendingError = {
                        mustache(t) {
                          throw ur(
                            'Invalid block parameters syntax: mustaches cannot be used inside parameters list',
                            t
                          );
                        },
                        eof(t) {
                          throw ur(
                            'Invalid block parameters syntax: expecting the tag to be closed with ">" or "/>" after parameters list',
                            n.start.until(t)
                          );
                        },
                      });
                  else if ('|' === t) {
                    if (0 === r.params.length)
                      throw ur(
                        'Invalid block parameters syntax: empty parameters list, expecting at least one identifier',
                        n.start.until(this.offset().move(1))
                      );
                    (a = { state: 'AfterEndPipe' }), this.tokenizer.consume();
                  } else {
                    if ('>' === t || '/' === t)
                      throw ur(
                        'Invalid block parameters syntax: incomplete parameters list, expecting "|" but the tag was closed prematurely',
                        n.start.until(this.offset().move(1))
                      );
                    (a = { state: 'BlockParamName', name: t, start: this.offset() }),
                      this.tokenizer.consume();
                  }
                },
                BlockParamName: (e) => {
                  if ((a.state, '' === e))
                    (a = { state: 'Done' }),
                      (this.pendingError = {
                        mustache(t) {
                          throw ur(
                            'Invalid block parameters syntax: mustaches cannot be used inside parameters list',
                            t
                          );
                        },
                        eof(t) {
                          throw ur(
                            'Invalid block parameters syntax: expecting the tag to be closed with ">" or "/>" after parameters list',
                            n.start.until(t)
                          );
                        },
                      });
                  else if ('|' === e || Rr(e)) {
                    let n = a.start.until(this.offset());
                    if ('this' === a.name || t.test(a.name))
                      throw ur(
                        `Invalid block parameters syntax: invalid identifier name \`${a.name}\``,
                        n
                      );
                    r.params.push(qr.var({ name: a.name, loc: n })),
                      (a =
                        '|' === e ? { state: 'AfterEndPipe' } : { state: 'BeforeBlockParamName' }),
                      this.tokenizer.consume();
                  } else {
                    if ('>' === e || '/' === e)
                      throw ur(
                        'Invalid block parameters syntax: expecting "|" but the tag was closed prematurely',
                        n.start.until(this.offset().move(1))
                      );
                    (a.name += e), this.tokenizer.consume();
                  }
                },
                AfterEndPipe: (t) => {
                  a.state,
                    Rr(t)
                      ? this.tokenizer.consume()
                      : '' === t
                        ? ((a = { state: 'Done' }),
                          (this.pendingError = {
                            mustache(t) {
                              throw ur(
                                'Invalid block parameters syntax: modifiers cannot follow parameters list',
                                t
                              );
                            },
                            eof(t) {
                              throw ur(
                                'Invalid block parameters syntax: expecting the tag to be closed with ">" or "/>" after parameters list',
                                n.start.until(t)
                              );
                            },
                          }))
                        : '>' === t || '/' === t
                          ? (a = { state: 'Done' })
                          : ((a = {
                              state: 'Error',
                              message:
                                'Invalid block parameters syntax: expecting the tag to be closed with ">" or "/>" after parameters list',
                              start: this.offset(),
                            }),
                            this.tokenizer.consume());
                },
                Error: (t) => {
                  if ((a.state, '' === t || '/' === t || '>' === t || Rr(t)))
                    throw ur(a.message, a.start.until(this.offset()));
                  this.tokenizer.consume();
                },
                Done: () => {},
              };
            do {
              (e = this.tokenizer.peek()), i[a.state](e);
            } while ('Done' !== a.state && '' !== e);
            a.state;
          }
          reportSyntaxError(t) {
            throw ur(t, this.offset().collapsed());
          }
          assembleConcatenatedValue(t) {
            let e = 0 === (n = t).length ? void 0 : n[0],
              r = $e(t);
            var n;
            return qr.concat({
              parts: t,
              loc: this.source.spanFor(e.loc).extend(this.source.spanFor(r.loc)),
            });
          }
          validateEndTag(t, e, r) {
            if (Ve.has(t.name) && !r)
              throw ur(`<${t.name}> elements do not need end tags. You should remove it`, t.loc);
            if ('ElementNode' !== e.type)
              throw ur(`Closing tag </${t.name}> without an open tag`, t.loc);
            if (e.tag !== t.name)
              throw ur(
                `Closing tag </${t.name}> did not match last open tag <${e.tag}> (on line ${e.loc.startPosition.line})`,
                t.loc
              );
          }
          assembleAttributeValue(t, e, r, n) {
            if (r) {
              if (e) return this.assembleConcatenatedValue(t);
              {
                let [e, r] = t;
                if (void 0 === r || ('TextNode' === r.type && '/' === r.chars)) return e;
                throw ur(
                  "An unquoted attribute value must be a string or a mustache, preceded by whitespace or a '=' character, and followed by whitespace, a '>' character, or '/>'",
                  n
                );
              }
            }
            return Re(t) ? t[0] : qr.text({ chars: '', loc: n });
          }
          constructor(...t) {
            super(...t), (this.tagOpenLine = 0), (this.tagOpenColumn = 0);
          }
        },
        Ur = {},
        Fr = class extends xe {
          constructor() {
            super({});
          }
          parse() {}
        },
        Hr = {
          mode: 'codemod',
          plugins: {
            ast: [
              () => ({
                name: 'glimmerPrettierParsePlugin',
                visitor: {
                  All(t) {
                    ((t) => {
                      let { start: e, end: r } = t.loc;
                      (e.offset = t.loc.getStart().offset), (r.offset = t.loc.getEnd().offset);
                    })(t),
                      (function (t) {
                        let e = t.children ?? t.body;
                        if (e)
                          for (let t = 0; t < e.length - 1; t++)
                            'TextNode' === e[t].type &&
                              'MustacheStatement' === e[t + 1].type &&
                              (e[t].chars = e[t].chars.replace(/\\$/u, '\\\\'));
                      })(t);
                  },
                },
              }),
            ],
          },
        },
        zr = {
          parse: function (t) {
            let e;
            try {
              e = (function (t, e = {}) {
                var r, n, a;
                let i,
                  s,
                  o,
                  l = e.mode || 'precompile';
                'string' == typeof t
                  ? ((i = new cr(t, null == (r = e.meta) ? void 0 : r.moduleName)),
                    (s = 'codemod' === l ? ke(t, e.parseOptions) : Te(t, e.parseOptions)))
                  : t instanceof cr
                    ? ((i = t),
                      (s =
                        'codemod' === l
                          ? ke(t.source, e.parseOptions)
                          : Te(t.source, e.parseOptions)))
                    : ((i = new cr('', null == (n = e.meta) ? void 0 : n.moduleName)), (s = t)),
                  'codemod' === l && (o = new Fr());
                let c = Je.forCharPositions(i, 0, i.source.length);
                s.loc = { source: '(program)', start: c.startPosition, end: c.endPosition };
                let u = new $r(i, o, l).parse(s, e.locals ?? []);
                if (null != (a = e.plugins) && a.ast)
                  for (let t of e.plugins.ast)
                    Nr(u, t(jt({}, e, { syntax: Ur }, { plugins: void 0 })).visitor);
                return u;
              })(t, Hr);
            } catch (t) {
              let e = (function (t) {
                let { location: e, hash: r } = t;
                if (e) {
                  let { start: t, end: r } = e;
                  return 'number' != typeof r.line ? { start: t } : e;
                }
                if (r) {
                  let {
                    loc: { last_line: t, last_column: e },
                  } = r;
                  return { start: { line: t, column: e + 1 } };
                }
              })(t);
              if (e) {
                let r = (function (t) {
                  let { message: e } = t,
                    r = e.split('\n');
                  return r.length >= 4 &&
                    /^Parse error on line \d+:$/u.test(r[0]) &&
                    /^-*\^$/u.test(x(!1, r, -2))
                    ? x(!1, r, -1)
                    : r.length >= 4 &&
                        /:\s?$/u.test(r[0]) &&
                        /^\(error occurred in '.*?' @ line \d+ : column \d+\)$/u.test(
                          x(!1, r, -1)
                        ) &&
                        '' === r[1] &&
                        '' === x(!1, r, -2) &&
                        r.slice(2, -2).every((t) => t.startsWith('|'))
                      ? r[0].trim().slice(0, -1)
                      : e;
                })(t);
                throw (function (t, e) {
                  let r = new SyntaxError(
                    t + ' (' + e.loc.start.line + ':' + e.loc.start.column + ')'
                  );
                  return Object.assign(r, e);
                })(r, { loc: e, cause: t });
              }
              throw t;
            }
            return e;
          },
          astFormat: 'glimmer',
          locStart: nt,
          locEnd: at,
        },
        Mr = { glimmer: Ut },
        jr = u;
    },
  });
//# sourceMappingURL=54.extension.js.map
