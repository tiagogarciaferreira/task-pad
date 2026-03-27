import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private http = inject(HttpClient);

  get<T>(url: string) {
    return this.http.get<T>(url);
  }

  getWithParams<T>(url: string, params: Record<string, string | string[] | number>) {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          httpParams = httpParams.append(key, v);
        });
      } else {
        httpParams = httpParams.set(key, value);
      }
    });

    return this.http.get<T>(url, { params: httpParams });
  }

  post<T>(url: string, body: any) {
    return this.http.post<T>(url, body);
  }

  put<T>(url: string, body: any) {
    return this.http.put<T>(url, body);
  }

  delete<T>(url: string) {
    return this.http.delete<T>(url);
  }
}
