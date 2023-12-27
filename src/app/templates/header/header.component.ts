import { Component, Input } from '@angular/core';
import { EncryptService } from '../../services/encrypt.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() name: string;
  constructor(private service: EncryptService, private route: Router){}


}
