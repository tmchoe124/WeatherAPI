import fs from 'fs-extra';

class City {
  name: string;
  id: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

class HistoryService {
  private path: string = './db/db.json';
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readJson(this.path);
      return data as City[];
    } catch (error) {
      console.log(error);
      return [];
    }
  }
  
  private async write(cities: City[]): Promise<void>{
    try {
      await fs.writeJson(this.path, cities, { spaces: 2 });
      console.log('Data written to file successfully ');
    } catch (error) {
      console.log(error);
    }
  }
  
  async getCities(): Promise<City[]> {
    return this.read();
  }
  
  async addCity(city: string): Promise<void>{
    try {
      const cities = await this.getCities();

      const newCity = new City(city, `${Date.now()}`);
      cities.push(newCity);
  
      await this.write(cities);
    } catch (error) {
      console.log(error);
    }
  }

  async removeCity(id: string) {
    try {
      const cities = await this.getCities();
      
      const updatedCities = cities.filter(city => city.id !== id);
      
      await this.write(updatedCities);
    } catch (error) {
      console.log(error);
    }
  }
}

export default new HistoryService();
