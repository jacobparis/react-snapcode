function createGumroadOverlay() {
    window.GumroadOverlay || (window.GumroadOverlay = new GumroadOverlayManager)
}! function() {
    var o = !1,
        r = /xyz/.test(function() {}) ? /\b_super\b/ : /.*/;
    this._GumroadClass = function() {}, _GumroadClass.extend = function(t) {
        function e() {
            !o && this.init && this.init.apply(this, arguments)
        }
        var a = this.prototype;
        o = !0;
        var i = new this;
        for (var n in o = !1, t) i[n] = "function" == typeof t[n] && "function" == typeof a[n] && r.test(t[n]) ? function(i, n) {
            return function() {
                var t = this._super;
                this._super = a[i];
                var e = n.apply(this, arguments);
                return this._super = t, e
            }
        }(n, t[n]) : t[n];
        return e.prototype = i, (e.prototype.constructor = e).extend = arguments.callee, e
    }
}();
var GumroadClass = _GumroadClass.extend({
    setEnvironment: function() {
        this.environment = "production", this.domain = "https://gumroad.com", this.isMobile = navigator.userAgent.match(/Mobile[\/; ]/i) || navigator.userAgent.match(/Opera (Mini|Mobi)/i) || navigator.userAgent.match(/IEMobile/i), this[this.environment] = !0, this.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "")
    },
    startNodeAdditionObserver: function() {
        MutationObserver && (this.nodeAdditionObserver = new MutationObserver(function(t) {
            for (var e = 0; e < t.length; e++)
                for (var i = 0; i < t[e].addedNodes.length; i++) this.nodeAdditionCallback && this.nodeAdditionCallback(t[e].addedNodes[i])
        }.bind(this)), this.nodeAdditionObserver.observe(document.body, {
            childList: !0,
            subtree: !0
        }))
    }
});
! function(t) {
    t.hasOwnProperty("remove") || Object.defineProperty(t, "remove", {
        configurable: !0,
        enumerable: !0,
        writable: !0,
        value: function e() {
            null !== this.parentNode && this.parentNode.removeChild(this)
        }
    })
}(Element.prototype);
var GumroadLink = GumroadClass.extend({
        init: function(t, e) {
            this.element = t, this.manager = e, this.vars = {
                as_modal: !0,
                referrer: encodeURIComponent(document.referrer + "/" + window.location.search.substring(1)),
                url_parameters: {
                    source_url: encodeURIComponent(window.location.href)
                }
            }, this.validateUrl()
        },
        validParams: ["locale", "referrer", "wanted", "email", "gift", "monthly", "quarterly", "biannually", "yearly", "duration", "recommended_by", "quantity", "price", "variant"],
        makeActiveLink: function() {
            var t = document.createElement("span"),
                e = this,
                i = !1;
            if (t.className = this.manager.logoClassName, this.manager.hasClass(this.element, "gumroad-button")) {
                if (this.element.hasChildNodes())
                    for (var n = 0; n < this.element.childNodes.length; n++) {
                        var a = this.element.childNodes[n];
                        "span" === a.nodeName.toLowerCase() && this.manager.hasClass(a, this.manager.logoClassName) && (i = !0)
                    }
                i || this.element.insertBefore(t, this.element.firstChild)
            }
            if (!this.manager.isMobile) {
                if (this.element.getAttribute("data-gumroad-default-cover")) {
                    var o = document.createElement("img");
                    o.src = this.manager.domain + "/products/" + this.vars.permalink + "/default_cover", this.element.insertBefore(o, this.element.firstChild)
                }
                this.element.getAttribute("data-gumroad-single-product") && (this.manager.isSingleProductMode = !0), this.origin !== this.manager.domain && (this.element.target = "_blank"), this.element.onclick = function(t) {
                    t.preventDefault(), e.manager.showInIframe(e)
                }, this.element.onmouseover = function() {
                    e.manager.createIframe()
                }
            }
        },
        setUrlVars: function(t) {
            if (t) {
                var e = t.split("&");
                if (e.length)
                    for (var i = 0; i < e.length; i++)
                        if (e[i]) {
                            var n = decodeURIComponent(e[i]).split("=");
                            2 === n.length && (-1 < this.validParams.indexOf(n[0]) ? this.vars[n[0]] = n[1] : this.vars.url_parameters[n[0]] = n[1])
                        }
            }
        },
        validateUrl: function() {
            for (var t = this.element.href.split("?"), e = t[0], i = 0; i < this.manager.productMatches.length; i++) {
                var n = this.manager.productMatches[i];
                if (0 === e.indexOf(n)) {
                    var a = e.replace(n, "").split("/");
                    return this.vars.permalink = a[0], "function" == typeof window.URLSearchParams && (this.vars.offerCodeName = new URLSearchParams(this.element.search).get("offer_code")), !this.vars.offerCodeName && a[1] && 0 < a[1].length && (this.vars.offerCodeName = a[1]), this.setUrlVars(t[1]), this.manager.links.push(this), this.manager.allPermalinks.indexOf(this.vars.permalink) < 0 && this.manager.allPermalinks.push(this.vars.permalink), this.manager.allPermalinks = this.manager.allPermalinks.slice(-4), this.makeActiveLink(), !0
                }
            }
        }
    }),
    GumroadOverlayManager = GumroadClass.extend({
        init: function() {
            this.setEnvironment(), this.links = [], this.allPermalinks = [], window.addEventListener ? window.addEventListener("message", function(t) {
                this.gotMessage(t)
            }.bind(this), !1) : window.attachEvent("onmessage", function(t) {
                this.gotMessage(t)
            }.bind(this), !1), this.insertStylesheet(), this.insertLoadingIndicator(), this.bindKeys(), this.addLinks(), this.domain !== this.origin && 1 === this.links.length && (this.isSingleProductMode = !0), this.startNodeAdditionObserver()
        },
        addClass: function(t, e) {
            var i = t.classList.toString().split(/\s+/);
            this.hasClass(t, e) && (i.push(e), t.className = className.join(" "))
        },
        addLinks: function() {
            for (var t = document.querySelectorAll("a:not(.gr-overlay-disabled),area"), e = this, i = 0; i < t.length; i++) new GumroadLink(t[i], e)
        },
        append: function(t, e) {
            e = e || "body", document.getElementsByTagName(e)[0].appendChild(t)
        },
        askForProduct: function() {
            if (this.currentLink) {
                var t = this.getGoogleAnalyticsClientId();
                t && (this.currentLink.vars.googleAnalyticsClientId = t), this.messageIframe({
                    overlayMethod: "getProduct",
                    overlayArgs: this.currentLink.vars
                })
            }
        },
        getGoogleAnalyticsClientId: function() {
            if ("string" == typeof window.GoogleAnalyticsObject && "function" == typeof window[window.GoogleAnalyticsObject] && "function" == typeof window[window.GoogleAnalyticsObject].getAll) {
                var t = window[window.GoogleAnalyticsObject].getAll(),
                    e = "object" == typeof t ? t[0] : null;
                if ("object" == typeof e && "function" == typeof e.get) return e.get("clientId")
            }
        },
        bindKeys: function() {
            document.onkeydown = function(t) {
                27 === t.keyCode && this.minimizeIframe()
            }.bind(this)
        },
        buildIframeSrc: function() {
            var t = (this.domain ? this.domain : "") + "/overlay_page",
                e = [];
            if (this.isSingleProductMode && e.push("single_product_mode=true"), this.allPermalinks && 0 < this.allPermalinks.length && e.push("all_permalinks=" + this.allPermalinks.join(",")), this.currentLink)
                for (var i in this.currentLink.vars) this.currentLink.vars.hasOwnProperty(i) && e.push(i + "=" + this.currentLink.vars[i]);
            return 0 < e.length && (t += "?" + e.join("&")), t
        },
        createIframe: function() {
            if (!this.iframe) {
                var t = this;
                this.iframe = document.createElement("iframe"), this.iframe.setAttribute("allowFullScreen", "allowfullscreen"), this.iframe.allowtransparency = !0, this.iframe.className = "gumroad-overlay-iframe", this.iframe.onload = function() {
                    t.setupMessaging()
                }, this.iframe.src = this.buildIframeSrc(), this.append(this.iframe)
            }
        },
        gotMessage: function(t) {
            var e = {};
            if (t.data) try {
                e = JSON.parse(t.data)
            } catch (i) {}
            e.parentMethod && this[e.parentMethod] && this[e.parentMethod](e.parentArgs)
        },
        handshake: function() {
            this.iframeReady || (this.iframeReady = !0, clearInterval(this.handshakeTimer), delete this.handshakeTimer, this.messagingSetupCallback())
        },
        hasClass: function(t, e) {
            return -1 < t.classList.toString().split(/\s+/).indexOf(e)
        },
        hideLoadingIndicator: function() {
            this.setOpacity(this.loadingIndicator, 0)
        },
        insertLoadingIndicator: function() {
            this.loadingIndicator = document.createElement("div"), this.loadingIndicator.className = "gumroad-loading-indicator", this.loadingIndicator.appendChild(document.createElement("i")), this.append(this.loadingIndicator)
        },
        insertStylesheet: function() {
            var t = 'a.gumroad-button { background-color: white !important; background-image: url("GUMROAD_ORIGIN/button/button_bar.jpg") !important; background-repeat: repeat-x !important; border-radius: 4px !important; box-shadow: rgba(0, 0, 0, .4) 0 0 2px !important; color: #999 !important; display: inline-block !important; font-family: -apple-system, ".SFNSDisplay-Regular", "Helvetica Neue", Helvetica, Arial, sans-serif !important; font-size: 16px !important; font-style: normal !important; font-weight: 500 !important; line-height: 50px !important; padding: 0 15px !important; text-shadow: none !important; text-decoration: none !important; } .gumroad-button-logo { background-image: url("GUMROAD_ORIGIN/button/button_logo.png") !important; background-size: cover !important; height: 17px !important; width: 16px !important; display: inline-block !important; margin-bottom: -3px !important; margin-right: 15px !important; } .gumroad-loading-indicator { background: white; border-radius: 50%; box-shadow: 0 1px 2px rgba(0, 0, 0, .1); box-sizing: border-box; display: none; height: 60px; left: 50% !important; margin-left: -30px !important; margin-top: -30px !important; padding: 10px; position: fixed; top: 50% !important; width: 60px; z-index: 99997; } .gumroad-loading-indicator i { background: url("GUMROAD_ORIGIN/js/loading-rainbow.svg"); height: 40px; width: 40px; display: inline-block; background-size: contain; animation: gumroad-spin 1.5s infinite linear; } .gumroad-overlay-iframe { position: fixed !important; overflow: hidden !important; z-index: 99998 !important; top: 0 !important; right: 0 !important; width: 0; height: 0; border: none !important; margin: 0 !important; padding: 0 !important; zoom: 1; } @keyframes gumroad-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(359deg); } } '.replace(/GUMROAD_ORIGIN/g, this.domain),
                e = document.createElement("style");
            e.type = "text/css", e.appendChild(document.createTextNode(t)), this.append(e, "head")
        },
        logoClassName: "gumroad-button-logo",
        maximizeIframe: function() {
            this.hideLoadingIndicator(), this.resizeIframe({
                height: "100%",
                width: "100%"
            }), this.messageIframe({
                overlayMethod: "maximizeCallback"
            })
        },
        messageIframe: function(t) {
            this.iframe && ("object" == typeof t && (t = JSON.stringify(t)), this.iframe.contentWindow.postMessage(t, this.domain))
        },
        messagingSetupCallback: function() {
            this.askForProduct(), this.messageIframe({
                overlayMethod: "getPersistentBundle"
            })
        },
        minimizeIframe: function(t) {
            this.hideLoadingIndicator(), this.resizeIframe(t), this.messageIframe({
                overlayMethod: "minimizeCallback"
            })
        },
        nodeAdditionCallback: function() {
            this.resetLinks()
        },
        redirect: function(t) {
            t && t.match(/^http/) && (window.location.href = t)
        },
        reload: function() {
            this.minimizeIframe(), this.resetLinks()
        },
        removeClass: function(t, e) {
            for (; this.hasClass(t, e);) {
                var i = t.classList.toString().split(/\s+/),
                    n = i.indexOf(e); - 1 < n && i.splice(n, 1), t.className = i.join(" ")
            }
        },
        resetLinks: function() {
            this.links = [], this.addLinks()
        },
        resizeIframe: function(t) {
            this.iframe && ((t = t || {
                width: "0px",
                height: "0px"
            }).width && (this.iframe.style.width = t.width), t.height && (this.iframe.style.height = t.height))
        },
        sendDomain: function() {
            this.messageIframe({
                overlayMethod: "setOverlayParentDomain",
                overlayArgs: this.origin
            })
        },
        setEnvironment: function() {
            this._super(), this.test && (this.domain = this.origin), this.productMatches = {
                development: ["https://gum.co/l/"],
                production: ["http://gum.co/", "https://gum.co/"],
                staging: ["http://gum.co/", "https://gum.co/"],
                test: ["https://gum.co/l/"]
            } [this.environment], this.productMatches.push("https://gumroad.com/l/")
        },
        setOpacity: function(t, e) {
            t.style.display = 0 === e ? "none" : "block", t.style.opacity = t.style.MozOpacity = t.style.khtmlOpacity = e, t.style.filter = "alpha(opacity=" + 100 * e + ");"
        },
        setupMessaging: function() {
            this.handshakeTimer = setInterval(function() {
                this.sendDomain()
            }.bind(this), 100)
        },
        showInIframe: function(t) {
            this.currentLink = t, this.showLoadingIndicator(), this.iframeReady && this.askForProduct()
        },
        showLoadingIndicator: function() {
            this.setOpacity(this.loadingIndicator, 1)
        },
        showSingleProduct: function() {
            this.maximizeIframe(), this.messageIframe({
                overlayMethod: "setIsSingleLink"
            }), this.messageIframe({
                overlayMethod: "refreshPreview"
            })
        }
    });
window.addEventListener ? window.addEventListener("load", createGumroadOverlay) : window.attachEvent && window.attachEvent("onload", createGumroadOverlay);