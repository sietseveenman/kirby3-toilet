(function() {
  "use strict";
  function sfdump(doc) {
    var refStyle = doc.createElement("style"), rxEsc = /([.*+?^${}()|\[\]\/\\])/g, idRx = /\bsf-dump-\d+-ref[012]\w+\b/, keyHint = 0 <= navigator.platform.toUpperCase().indexOf("MAC") ? "Cmd" : "Ctrl", addEventListener = function(e, n, cb) {
      e.addEventListener(n, cb, false);
    };
    (doc.documentElement.firstElementChild || doc.documentElement.children[0]).appendChild(refStyle);
    if (!doc.addEventListener) {
      addEventListener = function(element, eventName, callback) {
        element.attachEvent("on" + eventName, function(e) {
          e.preventDefault = function() {
            e.returnValue = false;
          };
          e.target = e.srcElement;
          callback(e);
        });
      };
    }
    function toggle(a, recursive) {
      var s = a.nextSibling || {}, oldClass = s.className, arrow, newClass;
      if (/\bsf-dump-compact\b/.test(oldClass)) {
        arrow = "\u25BC";
        newClass = "sf-dump-expanded";
      } else if (/\bsf-dump-expanded\b/.test(oldClass)) {
        arrow = "\u25B6";
        newClass = "sf-dump-compact";
      } else {
        return false;
      }
      if (doc.createEvent && s.dispatchEvent) {
        var event = doc.createEvent("Event");
        event.initEvent(
          "sf-dump-expanded" === newClass ? "sfbeforedumpexpand" : "sfbeforedumpcollapse",
          true,
          false
        );
        s.dispatchEvent(event);
      }
      a.lastChild.innerHTML = arrow;
      s.className = s.className.replace(/\bsf-dump-(compact|expanded)\b/, newClass);
      if (recursive) {
        try {
          a = s.querySelectorAll("." + oldClass);
          for (s = 0; s < a.length; ++s) {
            if (-1 == a[s].className.indexOf(newClass)) {
              a[s].className = newClass;
              a[s].previousSibling.lastChild.innerHTML = arrow;
            }
          }
        } catch (e) {
        }
      }
      return true;
    }
    function collapse(a, recursive) {
      var s = a.nextSibling || {}, oldClass = s.className;
      if (/\bsf-dump-expanded\b/.test(oldClass)) {
        toggle(a, recursive);
        return true;
      }
      return false;
    }
    function expand(a, recursive) {
      var s = a.nextSibling || {}, oldClass = s.className;
      if (/\bsf-dump-compact\b/.test(oldClass)) {
        toggle(a, recursive);
        return true;
      }
      return false;
    }
    function collapseAll(root) {
      var a = root.querySelector("a.sf-dump-toggle");
      if (a) {
        collapse(a, true);
        expand(a);
        return true;
      }
      return false;
    }
    function reveal(node) {
      var previous, parents = [];
      while ((node = node.parentNode || {}) && (previous = node.previousSibling) && "A" === previous.tagName) {
        parents.push(previous);
      }
      if (0 !== parents.length) {
        parents.forEach(function(parent) {
          expand(parent);
        });
        return true;
      }
      return false;
    }
    function highlight(root, activeNode, nodes) {
      resetHighlightedNodes(root);
      Array.from(nodes || []).forEach(function(node) {
        if (!/\bsf-dump-highlight\b/.test(node.className)) {
          node.className = node.className + " sf-dump-highlight";
        }
      });
      if (!/\bsf-dump-highlight-active\b/.test(activeNode.className)) {
        activeNode.className = activeNode.className + " sf-dump-highlight-active";
      }
    }
    function resetHighlightedNodes(root) {
      Array.from(
        root.querySelectorAll(".sf-dump-str, .sf-dump-key, .sf-dump-public, .sf-dump-protected, .sf-dump-private")
      ).forEach(function(strNode) {
        strNode.className = strNode.className.replace(/\bsf-dump-highlight\b/, "");
        strNode.className = strNode.className.replace(/\bsf-dump-highlight-active\b/, "");
      });
    }
    return function(root, x) {
      root = doc.getElementById(root);
      var indentRx = new RegExp(
        "^(" + (root.getAttribute("data-indent-pad") || "  ").replace(rxEsc, "\\$1") + ")+",
        "m"
      ), options = { maxDepth: 1, maxStringLength: 160, fileLinkFormat: false }, elt = root.getElementsByTagName("A"), len = elt.length, i = 0, s, h, t = [];
      while (i < len)
        t.push(elt[i++]);
      for (i in x) {
        options[i] = x[i];
      }
      function a(e, f) {
        addEventListener(root, e, function(e2, n) {
          if ("A" == e2.target.tagName) {
            f(e2.target, e2);
          } else if ("A" == e2.target.parentNode.tagName) {
            f(e2.target.parentNode, e2);
          } else {
            n = /\bsf-dump-ellipsis\b/.test(e2.target.className) ? e2.target.parentNode : e2.target;
            if ((n = n.nextElementSibling) && "A" == n.tagName) {
              if (!/\bsf-dump-toggle\b/.test(n.className)) {
                n = n.nextElementSibling || n;
              }
              f(n, e2, true);
            }
          }
        });
      }
      function isCtrlKey(e) {
        return e.ctrlKey || e.metaKey;
      }
      function xpathString(str) {
        var parts = str.match(/[^'"]+|['"]/g).map(function(part) {
          if ("'" == part) {
            return `"'"`;
          }
          if ('"' == part) {
            return `'"'`;
          }
          return "'" + part + "'";
        });
        return "concat(" + parts.join(",") + ", '')";
      }
      function xpathHasClass(className2) {
        return "contains(concat(' ', normalize-space(@class), ' '), ' " + className2 + " ')";
      }
      addEventListener(root, "mouseover", function(e) {
        if ("" != refStyle.innerHTML) {
          refStyle.innerHTML = "";
        }
      });
      a("mouseover", function(a2, e, c) {
        if (c) {
          e.target.style.cursor = "pointer";
        } else if (a2 = idRx.exec(a2.className)) {
          try {
            refStyle.innerHTML = "pre.sf-dump ." + a2[0] + "{background-color: #B729D9; color: #FFF !important; border-radius: 2px}";
          } catch (e2) {
          }
        }
      });
      a("click", function(a2, e, c) {
        if (/\bsf-dump-toggle\b/.test(a2.className)) {
          e.preventDefault();
          if (!toggle(a2, isCtrlKey(e))) {
            var r = doc.getElementById(a2.getAttribute("href").substr(1)), s2 = r.previousSibling, f = r.parentNode, t2 = a2.parentNode;
            t2.replaceChild(r, a2);
            f.replaceChild(a2, s2);
            t2.insertBefore(s2, r);
            f = f.firstChild.nodeValue.match(indentRx);
            t2 = t2.firstChild.nodeValue.match(indentRx);
            if (f && t2 && f[0] !== t2[0]) {
              r.innerHTML = r.innerHTML.replace(new RegExp("^" + f[0].replace(rxEsc, "\\$1"), "mg"), t2[0]);
            }
            if (/\bsf-dump-compact\b/.test(r.className)) {
              toggle(s2, isCtrlKey(e));
            }
          }
          if (c)
            ;
          else if (doc.getSelection) {
            try {
              doc.getSelection().removeAllRanges();
            } catch (e2) {
              doc.getSelection().empty();
            }
          } else {
            doc.selection.empty();
          }
        } else if (/\bsf-dump-str-toggle\b/.test(a2.className)) {
          e.preventDefault();
          e = a2.parentNode.parentNode;
          e.className = e.className.replace(/\bsf-dump-str-(expand|collapse)\b/, a2.parentNode.className);
        }
      });
      elt = root.getElementsByTagName("SAMP");
      len = elt.length;
      i = 0;
      while (i < len)
        t.push(elt[i++]);
      len = t.length;
      for (i = 0; i < len; ++i) {
        elt = t[i];
        if ("SAMP" == elt.tagName) {
          a = elt.previousSibling || {};
          if ("A" != a.tagName) {
            a = doc.createElement("A");
            a.className = "sf-dump-ref";
            elt.parentNode.insertBefore(a, elt);
          } else {
            a.innerHTML += " ";
          }
          a.title = (a.title ? a.title + "\n[" : "[") + keyHint + "+click] Expand all children";
          a.innerHTML += "<span>\u25BC</span>";
          a.className += " sf-dump-toggle";
          x = 1;
          if ("sf-dump" != elt.parentNode.className) {
            x += elt.parentNode.getAttribute("data-depth") / 1;
          }
          elt.setAttribute("data-depth", x);
          var className = elt.className;
          elt.className = "sf-dump-expanded";
          if (className ? "sf-dump-expanded" !== className : x > options.maxDepth) {
            toggle(a);
          }
        } else if (/\bsf-dump-ref\b/.test(elt.className) && (a = elt.getAttribute("href"))) {
          a = a.substr(1);
          elt.className += " " + a;
          if (/[\[{]$/.test(elt.previousSibling.nodeValue)) {
            a = a != elt.nextSibling.id && doc.getElementById(a);
            try {
              s = a.nextSibling;
              elt.appendChild(a);
              s.parentNode.insertBefore(a, s);
              if (/^[@#]/.test(elt.innerHTML)) {
                elt.innerHTML += " <span>\u25B6</span>";
              } else {
                elt.innerHTML = "<span>\u25B6</span>";
                elt.className = "sf-dump-ref";
              }
              elt.className += " sf-dump-toggle";
            } catch (e) {
              if ("&" == elt.innerHTML.charAt(0)) {
                elt.innerHTML = "\u2026";
                elt.className = "sf-dump-ref";
              }
            }
          }
        }
      }
      if (doc.evaluate && Array.from && root.children.length > 1) {
        let showCurrent = function(state2) {
          var currentNode = state2.current(), currentRect, searchRect;
          if (currentNode) {
            reveal(currentNode);
            highlight(root, currentNode, state2.nodes);
            if ("scrollIntoView" in currentNode) {
              currentNode.scrollIntoView(true);
              currentRect = currentNode.getBoundingClientRect();
              searchRect = search.getBoundingClientRect();
              if (currentRect.top < searchRect.top + searchRect.height) {
                window.scrollBy(0, -(searchRect.top + searchRect.height + 5));
              }
            }
          }
          counter.textContent = (state2.isEmpty() ? 0 : state2.idx + 1) + " of " + state2.count();
        };
        root.setAttribute("tabindex", 0);
        let SearchState = function() {
          this.nodes = [];
          this.idx = 0;
        };
        SearchState.prototype = {
          next: function() {
            if (this.isEmpty()) {
              return this.current();
            }
            this.idx = this.idx < this.nodes.length - 1 ? this.idx + 1 : 0;
            return this.current();
          },
          previous: function() {
            if (this.isEmpty()) {
              return this.current();
            }
            this.idx = this.idx > 0 ? this.idx - 1 : this.nodes.length - 1;
            return this.current();
          },
          isEmpty: function() {
            return 0 === this.count();
          },
          current: function() {
            if (this.isEmpty()) {
              return null;
            }
            return this.nodes[this.idx];
          },
          reset: function() {
            this.nodes = [];
            this.idx = 0;
          },
          count: function() {
            return this.nodes.length;
          }
        };
        var search = doc.createElement("div");
        search.className = "sf-dump-search-wrapper sf-dump-search-hidden";
        search.innerHTML = `
                <input type="text" class="sf-dump-search-input">
                <span class="sf-dump-search-count">0 of 0</span>
                <button type="button" class="sf-dump-search-input-previous" tabindex="-1">
                    <svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1683 1331l-166 165q-19 19-45 19t-45-19L896 965l-531 531q-19 19-45 19t-45-19l-166-165q-19-19-19-45.5t19-45.5l742-741q19-19 45-19t45 19l742 741q19 19 19 45.5t-19 45.5z"/></svg>
                </button>
                <button type="button" class="sf-dump-search-input-next" tabindex="-1">
                    <svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1683 808l-742 741q-19 19-45 19t-45-19L109 808q-19-19-19-45.5t19-45.5l166-165q19-19 45-19t45 19l531 531 531-531q19-19 45-19t45 19l166 165q19 19 19 45.5t-19 45.5z"/></svg>
                </button>
            `;
        root.insertBefore(search, root.firstChild);
        var state = new SearchState();
        var searchInput = search.querySelector(".sf-dump-search-input");
        var counter = search.querySelector(".sf-dump-search-count");
        var searchInputTimer = 0;
        var previousSearchQuery = "";
        addEventListener(searchInput, "keyup", function(e) {
          var searchQuery = e.target.value;
          if (searchQuery === previousSearchQuery) {
            return;
          }
          previousSearchQuery = searchQuery;
          clearTimeout(searchInputTimer);
          searchInputTimer = setTimeout(function() {
            state.reset();
            collapseAll(root);
            resetHighlightedNodes(root);
            if ("" === searchQuery) {
              counter.textContent = "0 of 0";
              return;
            }
            var classMatches = [
              "sf-dump-str",
              "sf-dump-key",
              "sf-dump-public",
              "sf-dump-protected",
              "sf-dump-private"
            ].map(xpathHasClass).join(" or ");
            var xpathResult = doc.evaluate(
              ".//span[" + classMatches + "][contains(translate(child::text(), " + xpathString(searchQuery.toUpperCase()) + ", " + xpathString(searchQuery.toLowerCase()) + "), " + xpathString(searchQuery.toLowerCase()) + ")]",
              root,
              null,
              XPathResult.ORDERED_NODE_ITERATOR_TYPE,
              null
            );
            let node;
            while (node = xpathResult.iterateNext())
              state.nodes.push(node);
            showCurrent(state);
          }, 400);
        });
        Array.from(search.querySelectorAll(".sf-dump-search-input-next, .sf-dump-search-input-previous")).forEach(
          function(btn) {
            addEventListener(btn, "click", function(e) {
              e.preventDefault();
              -1 !== e.target.className.indexOf("next") ? state.next() : state.previous();
              searchInput.focus();
              collapseAll(root);
              showCurrent(state);
            });
          }
        );
        addEventListener(root, "keydown", function(e) {
          var isSearchActive = !/\bsf-dump-search-hidden\b/.test(search.className);
          if (114 === e.keyCode && !isSearchActive || isCtrlKey(e) && 70 === e.keyCode) {
            if (70 === e.keyCode && document.activeElement === searchInput) {
              return;
            }
            e.preventDefault();
            search.className = search.className.replace(/\bsf-dump-search-hidden\b/, "");
            searchInput.focus();
          } else if (isSearchActive) {
            if (27 === e.keyCode) {
              search.className += " sf-dump-search-hidden";
              e.preventDefault();
              resetHighlightedNodes(root);
              searchInput.value = "";
            } else if (isCtrlKey(e) && 71 === e.keyCode || 13 === e.keyCode || 114 === e.keyCode) {
              e.preventDefault();
              e.shiftKey ? state.previous() : state.next();
              collapseAll(root);
              showCurrent(state);
            }
          }
        });
      }
      if (0 >= options.maxStringLength) {
        return;
      }
      try {
        elt = root.querySelectorAll(".sf-dump-str");
        len = elt.length;
        i = 0;
        t = [];
        while (i < len)
          t.push(elt[i++]);
        len = t.length;
        for (i = 0; i < len; ++i) {
          elt = t[i];
          s = elt.innerText || elt.textContent;
          x = s.length - options.maxStringLength;
          if (0 < x) {
            h = elt.innerHTML;
            elt[elt.innerText ? "innerText" : "textContent"] = s.substring(0, options.maxStringLength);
            elt.className += " sf-dump-str-collapse";
            elt.innerHTML = "<span class=sf-dump-str-collapse>" + h + '<a class="sf-dump-ref sf-dump-str-toggle" title="Collapse"> \u25C0</a></span><span class=sf-dump-str-expand>' + elt.innerHTML + '<a class="sf-dump-ref sf-dump-str-toggle" title="' + x + ' remaining characters"> \u25B6</a></span>';
          }
        }
      } catch (e) {
      }
    };
  }
  const Toilet_vue_vue_type_style_index_0_lang = "";
  function normalizeComponent(scriptExports, render, staticRenderFns, functionalTemplate, injectStyles, scopeId, moduleIdentifier, shadowMode) {
    var options = typeof scriptExports === "function" ? scriptExports.options : scriptExports;
    if (render) {
      options.render = render;
      options.staticRenderFns = staticRenderFns;
      options._compiled = true;
    }
    if (functionalTemplate) {
      options.functional = true;
    }
    if (scopeId) {
      options._scopeId = "data-v-" + scopeId;
    }
    var hook;
    if (moduleIdentifier) {
      hook = function(context) {
        context = context || this.$vnode && this.$vnode.ssrContext || this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext;
        if (!context && typeof __VUE_SSR_CONTEXT__ !== "undefined") {
          context = __VUE_SSR_CONTEXT__;
        }
        if (injectStyles) {
          injectStyles.call(this, context);
        }
        if (context && context._registeredComponents) {
          context._registeredComponents.add(moduleIdentifier);
        }
      };
      options._ssrRegister = hook;
    } else if (injectStyles) {
      hook = shadowMode ? function() {
        injectStyles.call(
          this,
          (options.functional ? this.parent : this).$root.$options.shadowRoot
        );
      } : injectStyles;
    }
    if (hook) {
      if (options.functional) {
        options._injectStyles = hook;
        var originalRender = options.render;
        options.render = function renderWithStyleInjection(h, context) {
          hook.call(context);
          return originalRender(h, context);
        };
      } else {
        var existing = options.beforeCreate;
        options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
      }
    }
    return {
      exports: scriptExports,
      options
    };
  }
  const _sfc_main = {
    props: {
      headline: String,
      timeout: Number
    },
    computed: {
      parsedDumps() {
        return this.dumps.map((d) => JSON.parse(d)).reverse();
      }
    },
    data() {
      return {
        dumpTimeout: null,
        firstDump: true,
        dumps: [],
        dump: null,
        ready: false,
        sfDump: null,
        triggered: [],
        farts: [
          new Audio("/media/plugins/sietseveenman/kirby3-toilet/fart-1.mp3"),
          new Audio("/media/plugins/sietseveenman/kirby3-toilet/fart-2.mp3"),
          new Audio("/media/plugins/sietseveenman/kirby3-toilet/fart-3.mp3"),
          new Audio("/media/plugins/sietseveenman/kirby3-toilet/fart-4.mp3"),
          new Audio("/media/plugins/sietseveenman/kirby3-toilet/fart-5.mp3"),
          new Audio("/media/plugins/sietseveenman/kirby3-toilet/fart-6.mp3")
        ]
      };
    },
    mounted() {
      this.sfDump = sfdump(document);
      this.addStyles();
      this.receiveDumps();
    },
    destroyed() {
      clearTimeout(this.dumpTimeout);
    },
    methods: {
      addStyles() {
        let style = document.createElement("style");
        style.innerText = "pre.sf-dump .sf-dump-compact, .sf-dump-str-collapse .sf-dump-str-collapse, .sf-dump-str-expand .sf-dump-str-expand { display: none; }";
        document.head.append(style);
      },
      flush() {
        this.$api.post("flush").then((res) => {
          if (res.success) {
            let sound = new Audio("/media/plugins/sietseveenman/kirby3-toilet/flush.mp3");
            sound == null ? void 0 : sound.play();
            this.dumps.splice(0);
          } else {
            console.err("Something went wrong flushing");
          }
        }).catch((err) => {
          console.err(err);
        });
      },
      removeDump(timestamp) {
        this.$api.post("remove-dump/" + timestamp).then((res) => {
          if (res.success) {
            const dumpIndex = this.dumps.map((d) => JSON.parse(d).timestamp).indexOf(timestamp);
            this.dumps.splice(dumpIndex, 1);
          } else {
            console.err("Something went wrong removing: ", JSON.parse(this.dumps.dumpIndex));
          }
        }).catch((err) => {
          console.err(err);
        });
      },
      receiveDumps() {
        this.dumpTimeout = setTimeout(() => {
          console.log("check");
          this.$api.get("receive-fresh-dumps", this.firstDump ? { initial: true } : {}).then((res) => {
            var _a;
            this.firstDump = false;
            if ((_a = res.dumps) == null ? void 0 : _a.length) {
              res.dumps.forEach((dump) => this.dumps.push(dump));
              this.$nextTick(this.triggerDumps);
              this.farts[Math.floor(Math.random() * this.farts.length)].play().then().catch((err) => console.info("Not alowed to play sound yet:", err));
            }
            this.receiveDumps();
          }).catch((err) => {
            console.err(err);
          });
        }, this.firstDump ? 50 : this.timeout);
      },
      triggerDumps() {
        const dumpDivs = this.$refs.dump;
        if (!dumpDivs)
          return;
        dumpDivs.forEach((el) => {
          const dumpEl = el.querySelector(".sf-dump[id]");
          const id = dumpEl.id;
          if (this.triggered.includes(id))
            return;
          this.sfDump(id);
          this.triggered.push(id);
        });
      }
    }
  };
  var _sfc_render = function render() {
    var _vm = this, _c = _vm._self._c;
    return _c("k-inside", [_c("k-view", { staticClass: "k-toilet-view" }, [_c("div", { staticClass: "container" }, [_c("div", { staticClass: "header" }, [_c("k-headline", { attrs: { "size": "large" } }, [_vm._v("Don't forget to wash your hands")]), _c("button", { directives: [{ name: "show", rawName: "v-show", value: _vm.parsedDumps.length > 1, expression: "parsedDumps.length > 1" }], staticClass: "flush", on: { "click": _vm.flush } }, [_c("k-icon", { staticClass: "icon", attrs: { "type": "refresh" } }), _vm._v(" Flush ")], 1)], 1), _vm._l(_vm.parsedDumps, function(dump, index) {
      return _c("div", { key: dump.timestamp, staticClass: "dump" }, [_c("div", { staticClass: "meta" }, [_c("k-text", { staticClass: "timestamp", attrs: { "size": "tiny" } }, [_c("k-icon", { staticClass: "icon", attrs: { "type": "clock" } }), _c("span", [_vm._v(_vm._s(dump.time))])], 1), _c("button", { staticClass: "remove", on: { "click": function($event) {
        return _vm.removeDump(dump.timestamp);
      } } }, [_c("k-icon", { attrs: { "type": "remove" } })], 1)], 1), _c("div", { staticClass: "print" }, [dump.label ? _c("k-headline", { staticClass: "label" }, [_vm._v(_vm._s(dump.label))]) : _vm._e(), _c("div", { ref: "dump", refInFor: true, attrs: { "data-index": index }, domProps: { "innerHTML": _vm._s(dump.fecal_matter) } })], 1)]);
    })], 2)])], 1);
  };
  var _sfc_staticRenderFns = [];
  _sfc_render._withStripped = true;
  var __component__ = /* @__PURE__ */ normalizeComponent(
    _sfc_main,
    _sfc_render,
    _sfc_staticRenderFns,
    false,
    null,
    null,
    null,
    null
  );
  __component__.options.__file = "/Users/sietseveenman/projects/_boiler/update-kirby/kirby-3/site/plugins/kirby3-toilet/src/components/areas/Toilet.vue";
  const Toilet = __component__.exports;
  panel.plugin("sietseveenman/kirby3-toilet", {
    components: {
      toilet: Toilet
    }
  });
})();
