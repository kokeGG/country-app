import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, delay, map, of, tap } from 'rxjs';
import { Observable } from 'rxjs';

import { Country } from '../interfaces/country';
import { CacheStore } from '../interfaces/cache-store.interface';
import { Region } from '../interfaces/region.type';

@Injectable({ providedIn: 'root' })
export class CountriesService {

  private apiUrl:string = 'https://restcountries.com/v3.1'

  public cachesStore: CacheStore = {
    byCapital: { term: '', countries: [] },
    byCountries: { term: '', countries: [] },
    byRegion:  { region: '', countries: [] },

  }

  constructor(private http: HttpClient) {
    //cuando el servicio se carga, se carga el localStorage
    this.loadFromLocalStorage();
  }

  private saveToLocalStorage() {
    localStorage.setItem('cacheStore', JSON.stringify(this.cachesStore));
  }

  private loadFromLocalStorage() {
    if ( !localStorage.getItem('cacheStore') ) return;

    this.cachesStore = JSON.parse( localStorage.getItem('cacheStore')! );
  }

  private getCountriesRequest( url: string ): Observable<Country[]> {
    return this.http.get<Country[]>( url )
      .pipe(
        catchError( () => of([]) ),
      );
  }


  searchCountryByAlphaCode( code: string ): Observable<Country | null> {

    const url = `${this.apiUrl}/alpha/${code}`;

    return this.http.get<Country[]>( url )
      .pipe(
        map( countries => countries.length > 0 ? countries[0] : null ),
        catchError( () => of(null) )
      );
  }

  searchCapital( term: string ): Observable<Country[]> {

    const url = `${this.apiUrl}/capital/${term}`;
    return this.getCountriesRequest(url)
      .pipe(
        tap( countries => this.cachesStore.byCapital = { term, countries} ),
        tap( () => this.saveToLocalStorage() )
      );
  }

  searchCountry( term: string ): Observable<Country[]> {
    const url = `${this.apiUrl}/name/${term}`;
    return this.getCountriesRequest(url)
    .pipe(
      tap( countries => this.cachesStore.byCountries = { term, countries} ),
      tap( () => this.saveToLocalStorage() )
    );
  }

  searchRegion( region: Region ): Observable<Country[]> {
    const url = `${this.apiUrl}/region/${region}`;
    return this.getCountriesRequest(url)
      .pipe(
        tap( countries => this.cachesStore.byRegion = { region, countries} ),
        tap( () => this.saveToLocalStorage() )
      );
  }


}
