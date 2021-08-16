import {Component, NgModule, OnInit} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { multi } from './data';

@Component({
  selector: 'app-bool-term-chart',
  templateUrl: './bool-term-chart.component.html',
  styleUrls: ['./bool-term-chart.component.css']
})
export class BoolTermChartComponent implements OnInit{

    multi: any[];
    view: any[] = [300, 200];

    // options
    legend = true;
    showLabels = true;
    animations = true;
    xAxis = true;
    yAxis = true;
    showYAxisLabel = true;
    showXAxisLabel = true;
    xAxisLabel = 'Year';
    yAxisLabel = 'Population1';
    timeline = true;

    colorScheme = {
        domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
    };

    constructor() {
        Object.assign(this, { multi });
    }
    ngOnInit(): void {
}

    onSelect(data): void {
        console.log('Item clicked', JSON.parse(JSON.stringify(data)));
    }

    onActivate(data): void {
        console.log('Activate', JSON.parse(JSON.stringify(data)));
    }

    onDeactivate(data): void {
        console.log('Deactivate', JSON.parse(JSON.stringify(data)));
    }
}
