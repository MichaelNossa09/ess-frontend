import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { EncryptService } from '../../services/encrypt.service';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';

export type ChartOptions = {
  series: any;
  chart: any;
  xaxis: any;
  stroke: any;
  tooltip: any;
  dataLabels: any;
};


@Component({
  selector: 'app-pools',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, NgApexchartsModule],
  templateUrl: './pools.component.html',
  styleUrl: './pools.component.css'
})


export class PoolsComponent {
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  dataCargada: boolean = false;
  pools:any = [];
  modal: boolean = false;
  user:string | null;
  success: boolean = true;
  public archivo1: any;
  public archivo2: any;
  public previsualizacion: string;
  public previsualizacion2: string;


  // FormGroup
  poolsForm = new FormGroup({
    capacidad_pool_a: new FormControl('', [Validators.required]),
    capacidad_disponible_pool_a: new FormControl('', [Validators.required]),
    capacidad_pool_b: new FormControl('', [Validators.required]),
    capacidad_disponible_pool_b: new FormControl('', [Validators.required]),
    v_fisica_1: new FormControl(null, [Validators.required]),
    v_fisica_2: new FormControl(null, [Validators.required]),
    registrado_por: new FormControl('', [Validators.required]),
  });

  constructor(private http: HttpClient,
    private service: EncryptService, private sanitizer: DomSanitizer){
      this.GetPools();
      this.poolsForm.get('registrado_por')?.setValue(this.user);
    }


  enlargedImage: string | null = null;
  public baseUrl = 'http://127.0.0.1:8000';
  private poolsUrl = 'http://127.0.0.1:8000/api/pool';
  
  GetPools(){
    const authToken = this.service.getDecryptedToken();
    this.user = localStorage.getItem('user');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    });

    this.http.get<any>(`${this.poolsUrl}`, { headers }).subscribe({
      next: (res) => {
        if (res) {
          this.pools = res;
          const poola: any = [];
          const poolb: any = [];
          const fechas: any = [];
          for(const item of res){
            poola.push(item.porcentaje_disponible_pool_a);
            poolb.push(item.porcentaje_disponible_pool_b);
            fechas.push(item.created_at);
          }
          this.generateChart(poola, poolb, fechas);
        }
      },
      error: (error) => {
        console.log("error", error);
      },
    });
  }
  generateChart(poola:any, poolb:any, fechas:any){
    this.chartOptions = {
      series: [
        {
          name: "% Disponibilidad Pool A",
          data: poola
        },
        {
          name: "% Disponibilidad Pool B",
          data: poolb
        }
      ],
      chart: {
        height: 300,
        type: "area"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: fechas
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      }
    };
    this.dataCargada = true;
  }
  onPools(){
    if (this.poolsForm.valid) {
      const authToken = this.service.getDecryptedToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${authToken}`,
      });
      const formData = new FormData();

      const capacidadPoolA = this.poolsForm.get('capacidad_pool_a')?.value;
      const capacidadDisponiblePoolA = this.poolsForm.get('capacidad_disponible_pool_a')?.value;
      const capacidadPoolB = this.poolsForm.get('capacidad_pool_b')?.value;
      const capacidadDisponiblePoolB = this.poolsForm.get('capacidad_disponible_pool_b')?.value;
      
      if (capacidadPoolA !== null && capacidadPoolA !== undefined) {
        formData.append('capacidad_pool_a', capacidadPoolA);
      }
  
      if (capacidadDisponiblePoolA !== null && capacidadDisponiblePoolA !== undefined) {
        formData.append('capacidad_disponible_pool_a', capacidadDisponiblePoolA);
      }
  
      if (capacidadPoolB !== null && capacidadPoolB !== undefined) {
        formData.append('capacidad_pool_b', capacidadPoolB);
      }
  
      if (capacidadDisponiblePoolB !== null && capacidadDisponiblePoolB !== undefined) {
        formData.append('capacidad_disponible_pool_b', capacidadDisponiblePoolB);
      }
      
      formData.append('v_fisica_1', this.archivo1);
      formData.append('v_fisica_2', this.archivo2);

      if(this.user){
        formData.append('registrado_por', this.user);
      }

      this.http.post<any>(`${this.poolsUrl}`, formData, { headers })
        .subscribe({
          next: (res) => {
            if (res) {
              this.poolsForm.reset();
              this.modal = false;
              document.querySelector('.alert-success')?.classList.add('show');
              setTimeout(function() {
                document.querySelector('.alert-success')?.classList.remove('show');
              }, 3000);
            }
          },
          error: (error) => {
            alert(error.error.error);
          },
        });
    } else {
      alert('Verifica los Campos, por favor.');
    }
  }

extraerBase64 = async ($event: any) => {
  try {
    const unsafeImg = window.URL.createObjectURL($event);
    const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.readAsDataURL($event);

      reader.onload = () => {
        resolve({
          base: reader.result
        });
      };

      reader.onerror = error => {
        resolve({
          base: null
        });
      };
    });
  } catch (e) {
    return null;
  }
};

  handleFileInput1(event: any): void {
    const archivoCapturadao = event.target.files[0];
    this.extraerBase64(archivoCapturadao).then((imagen : any) => {
      this.previsualizacion = imagen.base;
    })
    this.archivo1 = archivoCapturadao;
  }

  handleFileInput2(event: any): void {
    const archivoCapturado = event.target.files[0];
    this.extraerBase64(archivoCapturado).then((imagen : any) => {
      this.previsualizacion2 = imagen.base;
    })
    this.archivo2 = archivoCapturado;
  }


  getImageUrl(imagePath: string): string {
    return `${this.baseUrl}/storage/${imagePath}`;
  }
  
  enlargeImage(imagePath: string): void {
    this.enlargedImage = imagePath;
  }
  resetEnlarged(): void {
    this.enlargedImage = null;
  }

  activeModal(){
    this.modal = true;
  }
  desactiveModal(){
    this.modal = false;
  }
}
