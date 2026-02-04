import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<h1>SDR Specialization</h1> <pre>{{ data | json }}</pre>`
})
export class AppComponent implements OnInit {
  data: any;
  // Use the Cloud Run URL of your backend here
  private apiUrl = 'https://backend-service-xxxxxx.a.run.app/api/sdr-by-specialization';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get(this.apiUrl).subscribe(res => this.data = res);
  }
}
