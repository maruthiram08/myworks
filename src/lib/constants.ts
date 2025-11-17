export const AMENITIES = [
  { id: 'wifi', name: 'WiFi', icon: '📶' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
  { id: 'washer', name: 'Washer', icon: '🧺' },
  { id: 'dryer', name: 'Dryer', icon: '👕' },
  { id: 'ac', name: 'Air Conditioning', icon: '❄️' },
  { id: 'heating', name: 'Heating', icon: '🔥' },
  { id: 'tv', name: 'TV', icon: '📺' },
  { id: 'pool', name: 'Pool', icon: '🏊' },
  { id: 'hot_tub', name: 'Hot Tub', icon: '🛁' },
  { id: 'gym', name: 'Gym', icon: '🏋️' },
  { id: 'parking', name: 'Free Parking', icon: '🅿️' },
  { id: 'ev_charger', name: 'EV Charger', icon: '🔌' },
  { id: 'workspace', name: 'Dedicated Workspace', icon: '💼' },
  { id: 'fireplace', name: 'Fireplace', icon: '🔥' },
  { id: 'bbq', name: 'BBQ Grill', icon: '🍖' },
  { id: 'beach', name: 'Beach Access', icon: '🏖️' },
  { id: 'lake', name: 'Lake Access', icon: '🏞️' },
  { id: 'ski', name: 'Ski-in/Ski-out', icon: '⛷️' },
  { id: 'pets', name: 'Pets Allowed', icon: '🐕' },
  { id: 'smoking', name: 'Smoking Allowed', icon: '🚬' },
]

export const PROPERTY_TYPES = [
  { value: 'ENTIRE_PLACE', label: 'Entire Place', description: 'Guests have the whole place to themselves' },
  { value: 'PRIVATE_ROOM', label: 'Private Room', description: 'Guests have their own room in a shared space' },
  { value: 'SHARED_ROOM', label: 'Shared Room', description: 'Guests sleep in a room shared with others' },
]

export const PROPERTY_CATEGORIES = [
  { value: 'APARTMENT', label: 'Apartment', icon: '🏢' },
  { value: 'HOUSE', label: 'House', icon: '🏠' },
  { value: 'VILLA', label: 'Villa', icon: '🏡' },
  { value: 'CABIN', label: 'Cabin', icon: '🏕️' },
  { value: 'COTTAGE', label: 'Cottage', icon: '🏘️' },
  { value: 'LOFT', label: 'Loft', icon: '🏙️' },
  { value: 'TOWNHOUSE', label: 'Townhouse', icon: '🏘️' },
  { value: 'CASTLE', label: 'Castle', icon: '🏰' },
  { value: 'TREEHOUSE', label: 'Treehouse', icon: '🌳' },
  { value: 'BOAT', label: 'Boat', icon: '⛵' },
  { value: 'OTHER', label: 'Other', icon: '🏚️' },
]

export const GUEST_COUNTS = {
  adults: { min: 1, max: 16 },
  children: { min: 0, max: 15 },
  infants: { min: 0, max: 5 },
}

export const PLATFORM_FEE_PERCENTAGE = Number(process.env.PLATFORM_FEE_PERCENTAGE) || 10
