/**
 * ngx-pagination-bootstrap - A bootstrap(4) based angular(4+) pagination module.
 * @version v1.6.0
 * @author Manish Kumar
 * @link https://github.com/manishjanky/ngx-pagination-bootstrap#readme
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@angular/core"), require("@angular/common"), require("@angular/forms"));
	else if(typeof define === 'function' && define.amd)
		define(["@angular/core", "@angular/common", "@angular/forms"], factory);
	else if(typeof exports === 'object')
		exports["ticktock"] = factory(require("@angular/core"), require("@angular/common"), require("@angular/forms"));
	else
		root["ticktock"] = factory(root["ng"]["core"], root["ng"]["common"], root["ng"]["forms"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_10__, __WEBPACK_EXTERNAL_MODULE_11__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(1);
var PaginationComponent = /** @class */ (function () {
    function PaginationComponent() {
        this.data = null;
        this.position = "left";
        this.getPageData = new core_1.EventEmitter();
        this.currentPage = 1;
        this.totalPages = [];
        this.pages = [];
        this.itemsRange = {
            from: 1,
            to: 0
        };
        this.nullAble = null;
        this.pageSize = 10;
    }
    PaginationComponent.prototype.ngOnInit = function () {
        if (this.data != null) {
            this.itemsCount = this.data.length;
        }
        this.calculatePageNumbers();
        this.calculateCurrentItemsRange();
    };
    PaginationComponent.prototype.ngOnChanges = function (changes) {
        this.currentPage = 1;
        var $event = {
            event: changes,
            pageNo: this.currentPage,
            pageSize: this.pageSize,
            data: this.nullAble
        };
        this.calculatePageNumbers();
        this.changePageData($event);
    };
    PaginationComponent.prototype.calculatePageNumbers = function () {
        var pages = Math.ceil(this.itemsCount / this.pageSize);
        this.totalPages = [];
        for (var y = 0; y < pages; y++) {
            this.totalPages[y] = y + 1;
        }
        this.pages = this.totalPages.slice(0, 5);
    };
    PaginationComponent.prototype.navigateToPage = function (pageNo) {
        this.currentPage = pageNo;
        var $event = {
            event: event,
            pageNo: pageNo,
            pageSize: this.pageSize,
            data: this.nullAble
        };
        this.changePageData($event);
    };
    PaginationComponent.prototype.changePageData = function ($event) {
        this.getPageItems($event);
        this.getNextPagesArrayToDisplay();
        this.calculateCurrentItemsRange();
    };
    PaginationComponent.prototype.getPageItems = function ($event) {
        var thisPageData = null;
        if (this.data != null) {
            thisPageData = this.getCurrentPageData();
        }
        $event.data = thisPageData;
        this.getPageData.emit($event);
    };
    PaginationComponent.prototype.getCurrentPageData = function () {
        var start = (this.currentPage - 1) * this.pageSize;
        var end = start + Number(this.pageSize);
        return this.data.slice(start, end);
    };
    PaginationComponent.prototype.getNextPagesArrayToDisplay = function () {
        var startIndex = this.currentPage - 3 >= 0 ? this.currentPage - 3 : 0;
        var endIndex = this.currentPage + 2 < 5 ? 5 : this.currentPage + 2;
        if (endIndex > this.totalPages.length) {
            endIndex = this.totalPages.length;
            startIndex =
                this.totalPages.length - 5 < 0 ? 0 : this.totalPages.length - 5;
        }
        this.pages = this.totalPages.slice(startIndex, endIndex);
    };
    PaginationComponent.prototype.changePageSize = function () {
        this.calculatePageNumbers();
        this.currentPage = 1;
        var $event = {
            event: event,
            pageNo: 1,
            pageSize: this.pageSize,
            data: this.nullAble
        };
        this.changePageData($event);
    };
    PaginationComponent.prototype.nextPage = function () {
        this.navigateToPage(this.currentPage + 1);
    };
    PaginationComponent.prototype.previousPage = function () {
        this.navigateToPage(this.currentPage - 1);
    };
    PaginationComponent.prototype.calculateCurrentItemsRange = function () {
        if (this.itemsCount === 0) {
            this.itemsRange.to = 0;
            this.itemsRange.from = 0;
            return;
        }
        this.itemsRange.from = this.pageSize * this.currentPage - this.pageSize + 1;
        if (this.currentPage === this.pages[this.pages.length - 1]) {
            this.itemsRange.to = this.itemsCount;
            return;
        }
        this.itemsRange.to = this.pageSize * this.currentPage;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], PaginationComponent.prototype, "pageSize", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], PaginationComponent.prototype, "itemsCount", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], PaginationComponent.prototype, "data", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], PaginationComponent.prototype, "position", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], PaginationComponent.prototype, "getPageData", void 0);
    PaginationComponent = __decorate([
        core_1.Component({
            selector: "ng-pagination",
            template: __webpack_require__(5),
            styles: [__webpack_require__(6)]
        }),
        __metadata("design:paramtypes", [])
    ], PaginationComponent);
    return PaginationComponent;
}());
exports.PaginationComponent = PaginationComponent;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var components_1 = __webpack_require__(3);
exports.PaginationComponent = components_1.PaginationComponent;
var ngx_pagination_bootstrap_module_1 = __webpack_require__(9);
exports.PaginationModule = ngx_pagination_bootstrap_module_1.PaginationModule;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(4));


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(0));


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = "<nav aria-label=\"pagination\" class=\"p-1 d-flex\" [ngClass]=\"{'justify-content-center':position=='center','justify-content-end':position=='right'}\">\r\n  <select data-toggle=\"tooltip\" data-placement=\"top\" title=\"Items Per Page\" [(ngModel)]=\"pageSize\" class=\"form-control p-0\" style=\"width:50px\" (change)=\"changePageSize()\">\r\n    <option value=\"10\">10</option>\r\n    <option value=\"20\">20</option>\r\n    <option value=\"50\">50</option>\r\n <option value=\"100\">100</option>\r\n  </select>\r\n  <ul class=\"pagination\">\r\n    <li class=\"page-item\" [ngClass]=\"{'disabled':currentPage == 1}\">\r\n      <button [disabled]=\"currentPage == 1\" (click)=\"navigateToPage(1)\" class=\"page-link\" aria-label=\"first\">\r\n        <span aria-hidden=\"true\">First</span>\r\n        <span class=\"sr-only\">First</span>\r\n      </button>\r\n    </li>\r\n    <li class=\"page-item\">\r\n      <button [disabled]=\"currentPage == 1\" (click)=\"previousPage()\" class=\"page-link\" aria-label=\"Previous\">\r\n        <span aria-hidden=\"true\">&laquo;</span>\r\n        <span class=\"sr-only\">Previous</span>\r\n      </button>\r\n    </li>\r\n    <li [ngClass]=\"{'active':currentPage == page}\" class=\"page-item\" *ngFor=\"let page of pages\" (click)=\"navigateToPage(page)\">\r\n      <button class=\"page-link\">{{page}}</button>\r\n    </li>\r\n    <li class=\"page-item\">\r\n      <button [disabled]=\"currentPage == totalPages[totalPages.length -1]\" (click)=\"nextPage()\" class=\"page-link\" aria-label=\"Next\">\r\n        <span aria-hidden=\"true\">&raquo;</span>\r\n        <span class=\"sr-only\">Next</span>\r\n      </button>\r\n    </li>\r\n    <li class=\"page-item\" [ngClass]=\"{'disabled':currentPage == totalPages[totalPages.length -1]}\">\r\n      <button [disabled]=\"currentPage == totalPages[totalPages.length -1]\" (click)=\"navigateToPage(totalPages[totalPages.length -1])\"\r\n        class=\"page-link\" aria-label=\"last\">\r\n        <span aria-hidden=\"true\">Last</span>\r\n        <span class=\"sr-only\">Last</span>\r\n      </button>\r\n    </li>\r\n    <li class=\"page-item d-none d-md-block\">\r\n      <button disabled class=\"page-link\" aria-label=\"count\">\r\n        <span>{{itemsRange.from}} - {{itemsRange.to}} of {{itemsCount}}</span>\r\n      </button>\r\n    </li>\r\n  </ul>\r\n</nav>"

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {


        var result = __webpack_require__(7);

        if (typeof result === "string") {
            module.exports = result;
        } else {
            module.exports = result.toString();
        }
    

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(8)(undefined);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 8 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(1);
var common_1 = __webpack_require__(10);
var forms_1 = __webpack_require__(11);
var ngx_pagination_bootstrap_component_1 = __webpack_require__(0);
var PaginationModule = /** @class */ (function () {
    function PaginationModule() {
    }
    PaginationModule = __decorate([
        core_1.NgModule({
            declarations: [ngx_pagination_bootstrap_component_1.PaginationComponent],
            imports: [common_1.CommonModule, forms_1.FormsModule],
            exports: [ngx_pagination_bootstrap_component_1.PaginationComponent],
            providers: [],
            bootstrap: []
        })
    ], PaginationModule);
    return PaginationModule;
}());
exports.PaginationModule = PaginationModule;


/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_10__;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_11__;

/***/ })
/******/ ]);
});
//# sourceMappingURL=index.umd.js.map