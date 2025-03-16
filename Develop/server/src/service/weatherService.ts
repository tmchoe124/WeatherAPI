import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

export class Weather {
  constructor(
    public city: string,
    public date: string,
    public icon: string,
    public iconDescription: string,
    public tempF: number,
    public windSpeed: number,
    public humidity: number
  ) {}
}

class WeatherService {
  private baseUrl = process.env.API_BASE_URL as string;
  private apiKey = process.env.API_KEY as string;
  private cityName!: string;
  private units = 'imperial';

  private async fetchLocationData(query: string): Promise<any> {
    try {
      const response = await fetch(query);
      const data = await response.json();
      console.log('Location Data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching location data:', error);
      return null;
    }
  }

  private buildGeocodeQuery(): string {
    return `${this.baseUrl}/geo/1.0/direct?q=${encodeURIComponent(
      this.cityName
    )}&limit=1&appid=${this.apiKey}`;
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseUrl}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=${this.units}`;
  }

  private async fetchCoordinates(): Promise<Coordinates | null> {
    const locationData = await this.fetchLocationData(this.buildGeocodeQuery());
    if (Array.isArray(locationData) && locationData.length > 0) {
      const { lat, lon } = locationData[0];
      return { lat, lon };
    }
    console.error('No location data found');
    return null;
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const response = await fetch(this.buildWeatherQuery(coordinates));
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    return await response.json();
  }

  private parseCurrentWeather(data: any): Weather {
    const current = data.list[0];
    const date = new Date(current.dt * 1000).toLocaleDateString();
    const { icon, description: iconDescription } = current.weather[0];
    const tempF = current.main.temp;
    return new Weather(
      this.cityName,
      date,
      icon,
      iconDescription,
      tempF,
      current.wind.speed,
      current.main.humidity
    );
  }

  private buildForecastArray(list: any[]): Weather[] {
    const forecasts: Weather[] = [];
    for (let i = 8; i < list.length; i += 8) {
      const forecast = list[i];
      const date = new Date(forecast.dt * 1000).toLocaleDateString();
      const { icon, description: iconDescription } = forecast.weather[0];
      const tempF = forecast.main.temp;
      forecasts.push(
        new Weather(
          this.cityName,
          date,
          icon,
          iconDescription,
          tempF,
          forecast.wind.speed,
          forecast.main.humidity
        )
      );
    }
    return forecasts;
  }

  async getWeatherForCity(city: string): Promise<Weather[]> {
    this.cityName = city;
    const coordinates = await this.fetchCoordinates();
    if (!coordinates) {
      throw new Error('Coordinates could not be retrieved');
    }
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(weatherData.list);
    console.log({ currentWeather, forecastArray });
    return [currentWeather, ...forecastArray];
  }
}

export default new WeatherService();




