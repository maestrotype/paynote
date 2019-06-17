import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { PaginationModule } from 'ngx-pagination-bootstrap';
import {PaginationModule} from '../../ngx-pagination-bootstrap/dist/ngx-pagination-bootstrap.module';
import {RecurringComponent} from '../../views/recurring/recurring.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@NgModule({
    imports: [
        CommonModule,
        PaginationModule,
        FormsModule,
        MatTooltipModule,
        MatSlideToggleModule
    ],
    declarations: [
        RecurringComponent
    ],
    exports: [
        RecurringComponent
    ]
})
export class RecurringModule {
}