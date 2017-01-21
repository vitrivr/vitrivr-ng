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
var material_1 = require('@angular/material');
var core_1 = require('@angular/core');
var forms_1 = require("@angular/forms");
var platform_browser_1 = require('@angular/platform-browser');
var research_component_1 = require("./research.component");
var sketch_module_1 = require("../shared/components/sketch/sketch.module");
var query_container_module_1 = require("./containers/query-container.module");
var ResearchModule = (function () {
    function ResearchModule() {
    }
    ResearchModule = __decorate([
        core_1.NgModule({
            imports: [platform_browser_1.BrowserModule, forms_1.FormsModule, material_1.MaterialModule.forRoot(), sketch_module_1.SketchModule, query_container_module_1.QueryContainerModule],
            declarations: [research_component_1.ResearchComponent],
            exports: [research_component_1.ResearchComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], ResearchModule);
    return ResearchModule;
}());
exports.ResearchModule = ResearchModule;
//# sourceMappingURL=research.module.js.map