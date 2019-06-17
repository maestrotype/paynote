import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from "./components/ngx-pagination-bootstrap-component/ngx-pagination-bootstrap.component";
var PaginationModule = /** @class */ (function () {
    function PaginationModule() {
    }
    PaginationModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [PaginationComponent],
                    imports: [CommonModule, FormsModule],
                    exports: [PaginationComponent],
                    providers: [],
                    bootstrap: []
                },] },
    ];
    /** @nocollapse */
    PaginationModule.ctorParameters = function () { return []; };
    return PaginationModule;
}());
export { PaginationModule };
//# sourceMappingURL=ngx-pagination-bootstrap.module.js.map