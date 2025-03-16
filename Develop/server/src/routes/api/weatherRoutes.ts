import { Router, type Request, type Response } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { cityName } = req.body;
  console.log("POST route:", req.body, cityName);
  try {
    const weatherData = await WeatherService.getWeatherForCity(cityName);
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).send({ error: 'Failed to fetch weather data' });
    return;
  }
  try {
    await HistoryService.addCity(cityName);
  } catch (error) {
    console.error('Error adding city to history:', error);
    res.status(500).send({ error: 'Failed to add city to history' });
  }
});

router.get('/history', async (_req: Request, res: Response) => {
  try {
    const cities = await HistoryService.getCities();
    res.json(cities);
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).send({ error: 'Failed to fetch search history' });
  }
});

router.delete('/history/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await HistoryService.removeCity(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error removing city from history:', error);
    res.status(500).send({ error: 'Failed to remove city from history' });
  }
});

export default router;




