(function () {
    Object.prototype.extend = function (obj, overwrite, supplement) {
        if (obj == undefined) return;
        for (i in obj) {
            if (this[i] == undefined || overwrite)
                this[i] = obj[i];
        }
        if (supplement && typeof supplement === 'function') {
            supplement.apply(this);
        }
        return this;
    };

    Object.prototype.getType = function () {
        return Object.prototype.toString.call(this).replace(/\[object|\s|\]/g, '').toLowerCase();
    };

    Object.prototype.clone = function () {
        if (typeof this === 'function') throw new Error('nonsupport function');
        if (typeof this.valueOf() !== 'object') return this.valueOf();
        var origin = this;
        var ectype = origin instanceof Array ? [] : {};
        ectype.__proto__ = origin.__proto__;
        for (var n in origin) {
            if (origin.hasOwnProperty(n))
                ectype[n] = origin[n].clone();
        }
        return ectype;
    };

    Az = function (selector, context) {
        return Az.fn.select(selector, context);
    };

    Az.Object = function () {
        this.selector = '';
        this.Az = 'Ev 0.1';
    };

    Az.fn = Az.Object.prototype = [];

    Az.fn.extend({
        select: function (selector, context) {
            var o = new Az.Object();
            context = context || document;

            if (Az.isString(selector)) {
                if (/^[#]{1}\w+$/.test(selector)) {
                    o.push(context.getElementById(selector.substr(1)));
                }
                else if (/^[.]{1}\w+$/.test(selector)) {
                    Az.each(context.getElementsByClassName(selector.substr(1)), function (n) { o.push(n); });
                }
                else if (/^\w+$/.test(selector)) {
                    Az.each(context.getElementsByTagName(selector), function (n) { o.push(n); });
                }
                o.selector = selector;
            }
            else if (Az.isAzObject(selector))
                o = selector;
            else
                Az.each(selector, function (n) { o.push(n); });
            return o;
        },

        get: function (index) {
            index = index || 0;
            if (this.length > index)
                return this[index];
        },

        find: function (selector) {
            Az.each(this, function (n, i) {

            });
        },

        children: function (selector) {

        },

        parents: function (selector) {
            return
        },

        html: function (html) {
            var ele = this.get();
            if (!Az.isHtmlElement(ele)) throw new Error('Type mismatch: Required HtmlElement');
            if (html != undefined) {
                this.get().innerHTML = html;
                return this;
            } else {
                return this.get().innerHTML;
            }
        }
    });

    Az.extend({
        each: function (obj, func) {
            if (obj == undefined) return;
            if (obj.length != undefined && Az.isNumber(obj.length))
                for (var i = 0; i < obj.length; i++)
                    func(obj[i], i);
            else
                func(obj, 0);
        },

        type: function (obj) {
            return obj == null ? String(obj) : obj.getType();
        },

        isString: function (obj) {
            return typeof obj === typeof '';
        },

        isArray: function (obj) {
            return Az.type(obj) === 'array';
        },

        isNumber: function (obj) {
            return typeof obj === typeof 0;
        },

        isFunction: function (obj) {
            return typeof obj === typeof function () { };
        },

        isHtmlElement: function (obj) {
            return Az.type(obj).match('html') && Az.type(obj).match('element');
        },

        isAzObject: function (obj) {
            return obj instanceof Az.Object;
        }
    });

    //window.$ = Az;
})();