import moment from 'moment'
import api from './init'
import { roomData as fallbackRoomData } from '../utils/fallbackData'

// Modify the listRooms function to use fallback data if API fails
export function listRooms() {
  return api
    .get('/rooms')
    .then(res => res.data)
    .catch(error => {
      console.warn('Failed to fetch room data from API, using fallback data', error);
      // Return the fallback data as a resolved promise
      return Promise.resolve(fallbackRoomData);
    });
}
