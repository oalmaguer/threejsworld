import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class WorldService {
  public url: string = `threejsworld-gules.vercel.app/`;

  constructor() {}

  async getCapitalsFromDb(country: string) {
    let city;
    await axios.get(`${this.url}/world/${country}`).then((resp) => {
      if (resp) {
        city = resp;
      }
    });
    return city;
  }
}
