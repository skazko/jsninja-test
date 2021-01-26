// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/wysiwig.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Editor = void 0;
var boldText = 'bold-text';
var italicText = 'italic-text';
var h1Text = 'header1-text';
var h2Text = 'header2-text';
var styles = [h1Text, h2Text];

var Editor =
/** @class */
function () {
  function Editor(options) {
    var _a;

    var _this = this;

    var _b, _c, _d, _e, _f, _g;

    this._toolbar = (_a = {}, _a[boldText] = false, _a[italicText] = false, _a.style = null, _a);

    this.upParagraphs = function (par) {
      var last = par;
      par.querySelectorAll('.paragraph').forEach(function (p) {
        console.log(p);
        last.after(p);
        last = p;
      });
    };

    this.wrapText = function (par) {
      par.childNodes.forEach(function (n) {
        if (n.nodeType === 3) {
          var span = document.createElement('span');
          span.innerText = n.textContent;
          n.replaceWith(span);
        }
      });
    };

    this.addParagraph = function () {
      var div = document.createElement('div');
      var span = document.createElement('span');
      span.innerHTML = '&#8203;';
      div.appendChild(span);
      div.classList.add('paragraph');

      _this.textarea.appendChild(div);
    };

    this.select = function () {
      var selection = document.getSelection(); // console.log(selection)

      if (_this.textarea.contains(selection.anchorNode)) {
        if (selection.isCollapsed) {
          var span = selection.anchorNode.parentElement;

          if (span && span.nodeName === 'SPAN') {
            // выделение кнопок
            _this.toolbar[boldText] = span.classList.contains(boldText);
            _this.toolbar[italicText] = span.classList.contains(italicText);
            var p = span.closest('.paragraph');
            _this.toolbar.style = p.classList.contains(h1Text) ? h1Text : p.classList.contains(h2Text) ? h2Text : null;
          }

          if (_this.selection) {
            _this.selection = null;
          }
        } else {
          _this.selection = selection;
          var container = selection.getRangeAt(0).commonAncestorContainer; // выделение кнопок

          if (container.nodeType === 3) {
            var span = container.parentElement;
            _this.toolbar[boldText] = span.classList.contains(boldText);
            _this.toolbar[italicText] = span.classList.contains(italicText);
            var p = span.closest('.paragraph');
            _this.toolbar.style = p.classList.contains(h1Text) ? h1Text : p.classList.contains(h2Text) ? h2Text : null;
          } else if (container.nodeName === 'SPAN') {
            _this.toolbar[boldText] = container.classList.contains(boldText);
            _this.toolbar[italicText] = container.classList.contains(italicText);
            var p = container.closest('.paragraph');
            _this.toolbar.style = p.classList.contains(h1Text) ? h1Text : p.classList.contains(h2Text) ? h2Text : null;
          } else {
            var fr = _this.selection.getRangeAt(0).cloneContents();

            var spans = fr.querySelectorAll('span');
            var spansAr = Array.from(spans);
            _this.toolbar[boldText] = spansAr.length > 0 && spansAr.every(function (span) {
              return span.classList.contains(boldText);
            });
            _this.toolbar[italicText] = spansAr.length > 0 && spansAr.every(function (span) {
              return span.classList.contains(italicText);
            });

            if (container.classList.contains('paragraph')) {
              var p = container;
              _this.toolbar.style = p.classList.contains(h1Text) ? h1Text : p.classList.contains(h2Text) ? h2Text : null;
            } else {
              var paragraphs_1 = new Set();
              spans.forEach(function (span) {
                paragraphs_1.add(span.closest('.paragraph'));
              });
              var ar = Array.from(paragraphs_1);
              _this.toolbar.style = ar.every(function (p) {
                return p.classList.contains(h1Text);
              }) ? h1Text : ar.every(function (p) {
                return p.classList.contains(h2Text);
              }) ? h2Text : null;
            }
          }
        }
      } else {
        if (_this.selection) {
          _this.selection = null;
        }
      }
    };

    this.applyModifier = function (mod) {
      return function () {
        var spans = _this.processSelection();

        var isAllSelectedSpansModified = spans.every(function (span) {
          return span.classList.contains(mod);
        });

        if (isAllSelectedSpansModified) {
          spans.forEach(function (span) {
            return span.classList.toggle(mod);
          });
          _this.toolbar[mod] = !_this.toolbar[mod];
        } else {
          spans.forEach(function (span) {
            return span.classList.add(mod);
          });
          _this.toolbar[mod] = true;
        }
      };
    };

    this.makeBold = this.applyModifier(boldText);
    this.makeItalic = this.applyModifier(italicText);

    this.applyStyle = function (style) {
      return function () {
        var spans = _this.processSelection();

        if (spans[0] !== spans[0].closest('.paragraph').firstElementChild) {
          var parToSplit = spans[0].closest('.paragraph');
          parToSplit.after(splitParagraph(parToSplit, spans));
        }

        if (spans[spans.length - 1] !== spans[spans.length - 1].closest('.paragraph').lastElementChild) {
          var parToSplit = spans[spans.length - 1].closest('.paragraph');
          parToSplit.before(splitParagraph(parToSplit, spans));
        }

        var paragraphs = new Set();
        spans.forEach(function (span) {
          paragraphs.add(span.closest('.paragraph'));
        });
        var ar = Array.from(paragraphs);
        var isStyled = ar.every(function (p) {
          return p.classList.contains(style);
        });
        var filteredStyles = styles.filter(function (s) {
          return s !== style;
        });

        if (isStyled) {
          ar.forEach(function (p) {
            return p.classList.toggle(style);
          });
          _this.toolbar.style = null;
        } else {
          ar.forEach(function (p) {
            filteredStyles.forEach(function (fStyle) {
              return p.classList.remove(fStyle);
            });
            p.classList.add(style);
            _this.toolbar.style = style;
          });
        }
      };
    };

    this.applyH1 = this.applyStyle(h1Text);
    this.applyH2 = this.applyStyle(h2Text);
    this.editor = document.querySelector((_b = options === null || options === void 0 ? void 0 : options.editor) !== null && _b !== void 0 ? _b : '.editor');
    this.textarea = this.editor.querySelector((_c = options === null || options === void 0 ? void 0 : options.textarea) !== null && _c !== void 0 ? _c : 'textarea');
    this.btn_h1 = this.editor.querySelector((_d = options === null || options === void 0 ? void 0 : options.btn_h1) !== null && _d !== void 0 ? _d : 'btn_h1');
    this.btn_h2 = this.editor.querySelector((_e = options === null || options === void 0 ? void 0 : options.btn_h2) !== null && _e !== void 0 ? _e : 'btn_h2');
    this.btn_bold = this.editor.querySelector((_f = options === null || options === void 0 ? void 0 : options.btn_bold) !== null && _f !== void 0 ? _f : 'btn_bold');
    this.btn_italic = this.editor.querySelector((_g = options === null || options === void 0 ? void 0 : options.btn_italic) !== null && _g !== void 0 ? _g : 'btn_italic');
    this.selection = null;
    this.textdelete = new CustomEvent('textdelete');
    this.toolbar = new Proxy(this._toolbar, {
      set: function set(t, p, v, r) {
        if (p === 'style') {
          if (v === h1Text) {
            _this.btn_h1.classList.add('active');

            _this.btn_h2.classList.remove('active');
          }

          if (v === h2Text) {
            _this.btn_h2.classList.add('active');

            _this.btn_h1.classList.remove('active');
          }

          if (v === null) {
            _this.btn_h2.classList.remove('active');

            _this.btn_h1.classList.remove('active');
          }
        } else {
          var action = v ? 'add' : 'remove';

          if (p === boldText) {
            _this.btn_bold.classList[action]('active');
          }

          if (p === italicText) {
            _this.btn_italic.classList[action]('active');
          }
        }

        return Reflect.set(t, p, v, r);
      }
    });
  }

  Editor.prototype.init = function () {
    var _this = this;

    this.textarea.setAttribute('tabindex', '1');
    this.textarea.setAttribute('contentEditable', 'true');
    this.btn_bold.addEventListener('click', this.makeBold);
    this.btn_italic.addEventListener('click', this.makeItalic);
    this.btn_h1.addEventListener('click', this.applyH1);
    this.btn_h2.addEventListener('click', this.applyH2);
    document.addEventListener('selectionchange', this.select);
    this.addPStyle();
    this.textarea.addEventListener('focus', function () {
      if (_this.textarea.children.length === 0) {
        _this.addParagraph();

        var span = _this.textarea.lastElementChild.querySelector('span');

        _this.moveCaretTo(span);
      }
    });
    this.textarea.addEventListener('textdelete', function () {
      setTimeout(function () {
        if (_this.textarea.innerText == "\n" || _this.textarea.innerText === "") {
          _this.textarea.innerHTML = '';

          _this.addParagraph();
        } else {
          var pars = _this.textarea.querySelectorAll('.' + Array.from(_this.textarea.classList).join('.') + ' .paragraph');

          pars.forEach(_this.wrapText);
        }
      }, 0);
    }); // предотвращает удаление первого параграфа и спана внутри

    this.textarea.addEventListener('keydown', function (e) {
      if (_this.textarea.innerText === "\u200B" || _this.textarea.innerText.length === 0) {
        if (e.code === 'Backspace') {
          e.preventDefault();
        }
      }

      if (e.code === 'Backspace' || e.code === 'Delete') {
        if (_this.selection) {
          _this.textarea.dispatchEvent(_this.textdelete);
        }
      }
    });
    this.textarea.addEventListener('keyup', function (e) {
      if (e.code === 'Backspace' || e.code === 'Delete') {
        var pars = _this.textarea.querySelectorAll('.paragraph');

        pars.forEach(function (p) {
          if (!p.querySelector('span')) {
            // FIXME подумать как сделать чтобы сохранять курсор 
            _this.textarea.dispatchEvent(new CustomEvent('emptyparagraph', {
              detail: {
                p: p
              }
            }));
          }
        });
      }
    });
    this.textarea.addEventListener('emptyparagraph', function (e) {
      e.detail.p.remove();
    });
    this.textarea.addEventListener('blur', function () {
      if (_this.textarea.innerText === "\u200B" || _this.textarea.innerText === "") {
        _this.textarea.innerHTML = '';
      }
    });
    this.textarea.addEventListener('cut', function (e) {
      _this.applyStylesToParagraphs();

      setTimeout(function () {
        _this.textarea.dispatchEvent(_this.textdelete);
      }, 0);
    });
    this.textarea.addEventListener('paste', function (e) {
      console.log(e.clipboardData.getData('text/html'));
      setTimeout(function () {
        var pars = _this.textarea.querySelectorAll('.' + Array.from(_this.textarea.classList).join('.') + ' .paragraph');

        pars.forEach(_this.upParagraphs);
        pars.forEach(_this.wrapText);
      }, 50);
    });
    this.textarea.addEventListener('copy', function (e) {
      _this.applyStylesToParagraphs();
    });
  };

  Editor.prototype.addPStyle = function () {
    var style = document.createElement('style');
    style.innerHTML = '.paragraph {font-size: 1rem;}';
    document.head.append(style);
  };

  Editor.prototype.moveCaretTo = function (node) {
    var range = document.createRange();
    range.selectNodeContents(node);
    range.collapse(true);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  Editor.prototype.processSelection = function () {
    var selection = this.selection;
    var range = selection.getRangeAt(0);
    var output = [];

    if (range.startContainer === range.endContainer) {
      // выделение внутри одного узла
      if (range.startContainer.nodeType === 3) {
        // выделили текстовый узел
        if (range.startOffset === 0 && range.endOffset === range.endContainer.length) {
          // выделен весь узел полностью
          // все текстовые узлы должны быть в спанах
          var span = range.startContainer.parentElement;
          output.push(span);
        } else {
          // узел выделен не полностью разбить на спаны
          var span = range.startContainer.parentElement;
          var mSpan = splitSpan(span, range.startOffset, range.endOffset);
          output.push(mSpan);
        }
      } else {
        // выделен либо span либо параграф
        if (range.startContainer.nodeName === 'SPAN') {
          output.push(range.startContainer);
        } else if (range.startContainer.classList.contains('paragraph')) {
          for (var i = range.startOffset; i < range.endOffset; i++) {
            output.push(range.startContainer.children.item(i));
          }
        } // TODO: добавить проверку на див

      }
    } else {
      // выделение в разных узлах
      var wrap = range.commonAncestorContainer; // wrap должен быть либо .paragraph либо textarea;
      // FIXME hardcode

      if (wrap.classList.contains('paragraph')) {
        output.push.apply(output, getSpans(wrap, range));
      } // FIXME hardcode


      if (wrap.classList.contains('edit-area')) {
        // внутри textarea должны быть только параграфы
        var firstP = void 0;
        var lastP = void 0;

        if (range.startContainer.nodeType === 3) {
          var el = range.startContainer.parentElement;

          if (el.classList.contains('paragraph')) {
            firstP = el;
          } else {
            firstP = el.closest('.paragraph');
          }
        } else {
          if (range.startContainer.classList.contains('paragraph')) {
            firstP = range.startContainer;
          } else {
            firstP = range.startContainer.closest('.paragraph');
          }
        }

        if (range.endContainer.nodeType === 3) {
          var el = range.endContainer.parentElement;

          if (el.classList.contains('paragraph')) {
            lastP = el;
          } else {
            lastP = el.closest('.paragraph');
          }
        } else {
          if (range.endContainer.classList.contains('paragraph')) {
            lastP = range.endContainer;
          } else {
            lastP = range.endContainer.closest('.paragraph');
          }
        }

        var next = firstP;

        while (next && next !== lastP) {
          output.push.apply(output, getSpans(next, range));
          next = next.nextElementSibling;
        }

        output.push.apply(output, getSpans(lastP, range));
      }
    }

    var newRange = new Range();
    newRange.setStartBefore(output[0]);
    newRange.setEndAfter(output[output.length - 1]);
    var sel = document.getSelection();
    sel.removeAllRanges();
    sel.addRange(newRange);
    return output;
  };

  Editor.prototype.applyStylesToParagraphs = function () {
    document.querySelectorAll('.paragraph').forEach(function (p) {
      var computedProps = getComputedStyle(p);
      getAppliedStyleProps(p).forEach(function (prop) {
        p.style[prop] = computedProps[prop];
      });
    });
  };

  return Editor;
}();

exports.Editor = Editor;

function splitSpan(span, startOffset, endOffset) {
  var fSpan;
  var mSpan = span.cloneNode(true); // выделенный спан

  var lSpan; // выделение не сначала

  if (startOffset !== 0) {
    fSpan = span.cloneNode(true);
    fSpan.firstChild.splitText(startOffset);
    fSpan.lastChild.remove();
    mSpan.firstChild.splitText(startOffset);
    mSpan.firstChild.remove();
  } // выделение не до конца


  if (endOffset !== span.firstChild.length) {
    mSpan.firstChild.splitText(endOffset - startOffset);
    mSpan.lastChild.remove();
    lSpan = span.cloneNode(true);
    lSpan.firstChild.splitText(endOffset);
    lSpan.firstChild.remove();
  }

  var spans = [fSpan, mSpan, lSpan].filter(function (span) {
    return typeof span !== 'undefined' && span.textContent !== "\n" && span.textContent !== "\u200B";
  });
  span.replaceWith.apply(span, spans);
  return mSpan;
}

function getSpans(wrap, range) {
  var output = [];
  var startContainer = range.startContainer;
  var endContainer = range.endContainer;
  var startSpan;
  var endSpan;

  if (wrap.contains(startContainer)) {
    if (startContainer.nodeType === 3) {
      startSpan = splitSpan(startContainer.parentElement, range.startOffset, startContainer.length);
    } else {
      if (startContainer.nodeName === 'SPAN') {
        startSpan = startContainer;
      } else {
        startSpan = startContainer.querySelector('span');
      } // другие варианты?

    }

    output.push(startSpan);
  }

  if (wrap.contains(endContainer)) {
    if (endContainer.nodeType === 3) {
      endSpan = splitSpan(endContainer.parentElement, 0, range.endOffset);
    } else {
      if (endContainer.nodeName === 'SPAN') {
        endSpan = endContainer;
      } else {
        endSpan = endContainer.querySelector('span:last-child');
      } // другие варианты?

    }
  }

  var next = startSpan ? startSpan.nextElementSibling : wrap.firstElementChild;

  while (next && next !== endSpan) {
    output.push(next);
    next = next.nextElementSibling;
  }

  if (endSpan) {
    output.push(endSpan);
  }

  return output;
}

function getAppliedStyleProps(el) {
  var appliedRules = new Set();

  for (var i = 0; i < document.styleSheets.length; i++) {
    var rules = document.styleSheets[i].cssRules;

    for (var j = 0; j < rules.length; j++) {
      var rule = rules[j];

      if (el.matches(rule.selectorText)) {
        for (var k = 0; k < rule.style.length; k++) {
          var styleProp = rule.style[k];
          appliedRules.add(styleProp);
        }
      }
    }
  }

  return Array.from(appliedRules);
}

function splitParagraph(par, spans) {
  var newPar = document.createElement('div');
  newPar.classList.add('paragraph');
  var next = par.firstChild;

  while (next) {
    if (spans.includes(next)) {
      newPar.append(next);
      next = par.firstChild;
    } else {
      next = next.nextSibling;
    }
  }

  return newPar;
}
},{}],"src/index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var wysiwig_1 = require("./wysiwig");

var editor = new wysiwig_1.Editor({
  editor: '.editor',
  textarea: '.edit-area',
  btn_h1: '.head-1',
  btn_h2: '.head-2',
  btn_bold: '.bold',
  btn_italic: '.italic'
});
editor.init();
},{"./wysiwig":"src/wysiwig.ts"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "54285" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/index.ts"], null)
//# sourceMappingURL=/src.f10117fe.js.map