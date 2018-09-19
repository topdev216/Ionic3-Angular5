import { Component, ViewChild, Input, ElementRef, Renderer2, Output, EventEmitter } from '@angular/core';

/**
 * Generated class for the AccordionComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'accordion',
  templateUrl: 'accordion.html'
})
export class AccordionComponent {

  @ViewChild('expandWrapper', {read: ElementRef}) expandWrapper;
  @Input('expanded') expanded;
  @Input('expandHeight') expandHeight;
  @Output() open: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  constructor(public renderer: Renderer2) {

    if(this.expanded){
      console.log('HEIGHT:',this.expandWrapper.nativeElement.offsetHeight);
    }
  }

  ngAfterViewInit(){
    this.renderer.setStyle(this.expandWrapper.nativeElement, 'height', this.expandHeight + 'px');  
  }

  ngOnChanges(){
    console.log('HEIGHT 2:',this.expandWrapper.nativeElement.offsetHeight);
  }



}
