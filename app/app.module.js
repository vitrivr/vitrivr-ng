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
var app_component_1 = require('./app.component');
var app_config_1 = require("./configuration/app.config");
var gallery_module_1 = require("./views/gallery/gallery.module");
require('hammerjs');
var research_module_1 = require("./views/research/research.module");
var queries_service_1 = require("./services/queries/queries.service");
var cineast_api_service_1 = require("./services/api/cineast-api.service");
var ping_component_1 = require("./views/ping/ping.component");
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [platform_browser_1.BrowserModule, forms_1.FormsModule, material_1.MaterialModule.forRoot(), gallery_module_1.GalleryModule, research_module_1.ResearchModule],
            declarations: [app_component_1.AppComponent, ping_component_1.PingComponent],
            providers: [app_config_1.Configuration, queries_service_1.QueryService, cineast_api_service_1.CineastAPI],
            bootstrap: [app_component_1.AppComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map