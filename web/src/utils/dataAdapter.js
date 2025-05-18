// Utility to convert external API room data to the format expected by the application

/**
 * Transforms room data from external API format to application format
 * @param {Array} externalRooms - Array of room objects from external API
 * @returns {Array} - Transformed room objects compatible with the application
 */
const transformRoomData = (externalRooms) => {
  if (!externalRooms || !Array.isArray(externalRooms)) {
    console.error('Invalid room data provided', externalRooms);
    return [];
  }
  
  return externalRooms.map(room => ({
    _id: room.id.toString(),
    name: room.name,
    floor: room.floor,
    capacity: room.capacity,
    assets: room.assets || {
      macLab: false,
      pcLab: false,
      projector: false,
      tv: false,
      opWalls: false,
      whiteBoard: false
    },
    bookings: room.Bookings || [],
    createdAt: room.createdAt,
    updatedAt: room.updatedAt
  }));
};

export { transformRoomData }; 