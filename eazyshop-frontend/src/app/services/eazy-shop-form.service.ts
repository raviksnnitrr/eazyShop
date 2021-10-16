import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Country } from '../common/country';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root'
})
export class EazyShopFormService {

  private countriesUrl=environment.eazyshopApiUrl+'/countries';
  private statesUrl=environment.eazyshopApiUrl+'/states';
  constructor(private httpClient:HttpClient) { }
  
  getCreditCardMonths(startMonth:number): Observable<number[]>{
    let data:number[]=[];
    for(let theMonth=startMonth;theMonth<=12;theMonth++){
      data.push(theMonth);
    }
    return of(data);
  }
  getCreditCardYears(): Observable<number[]>{
    let data:number[]=[];
    const startYear: number=new Date().getFullYear();
    const endYear:number=startYear+10;
    for(let theYear=startYear;theYear<=endYear;theYear++){
      data.push(theYear);
    } 

   return of(data);   
  }
  getCountries():Observable<Country[]>{
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response=>response._embedded.countries)
    );
  }
  getStatesFromCountryCode(countryCode:string):Observable<State[]>{
    const searchStatesUrl=`${this.statesUrl}/search/findByCountryCode?code=${countryCode}`;
    return this.httpClient.get<GetResponseStates>(searchStatesUrl).pipe(
      map(response=>response._embedded.states)
    );
  }
} 
interface GetResponseCountries {
    _embedded: {
      countries: Country[];
    }
}
interface GetResponseStates {
  _embedded: {
    states: State[];
  }
}
