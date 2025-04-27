import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lat, lon } = await req.json()

    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ error: 'Missing latitude or longitude' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // First, get the city name using reverse geocoding
    const reverseGeocodeResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    )
    
    if (!reverseGeocodeResponse.ok) {
      throw new Error('Failed to fetch location data')
    }
    
    const reverseGeocodeData = await reverseGeocodeResponse.json()
    const city = reverseGeocodeData.address?.city || reverseGeocodeData.address?.town || reverseGeocodeData.address?.village || 'Unknown Location'

    // Then, get the weather data
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data')
    }
    
    const data = await response.json()
    
    if (!data.current) {
      throw new Error('Invalid weather data received')
    }

    // Map weather codes to descriptions and icons
    const weatherDescriptions: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    }

    const weatherIconMap: Record<number, string> = {
      0: '01d',
      1: '02d',
      2: '03d',
      3: '04d',
      45: '50d',
      48: '50d',
      51: '09d',
      53: '09d',
      55: '09d',
      61: '10d',
      63: '10d',
      65: '10d',
      71: '13d',
      73: '13d',
      75: '13d',
      77: '13d',
      80: '09d',
      81: '09d',
      82: '09d',
      85: '13d',
      86: '13d',
      95: '11d',
      96: '11d',
      99: '11d'
    }

    const weatherData = {
      temperature: Math.round(data.current.temperature_2m),
      description: weatherDescriptions[data.current.weather_code] || 'Unknown weather',
      weather_code: data.current.weather_code,
      city: city,
      icon: weatherIconMap[data.current.weather_code] || '03d'
    }

    return new Response(
      JSON.stringify(weatherData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 