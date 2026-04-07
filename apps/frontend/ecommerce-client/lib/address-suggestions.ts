// Vietnamese cities and their postal codes for address auto-complete
// This provides fast, offline address suggestions without API dependency

interface AddressSuggestion {
  street: string
  city: string
  state: string
  postalCode: string
}

const VIETNAMESE_CITIES = [
  { city: "Hà Nội", state: "Hà Nội", code: "100000" },
  { city: "Hồ Chí Minh", state: "Hồ Chí Minh", code: "700000" },
  { city: "Đà Nẵng", state: "Đà Nẵng", code: "550000" },
  { city: "Hải Phòng", state: "Hải Phòng", code: "180000" },
  { city: "Cần Thơ", state: "Cần Thơ", code: "900000" },
  { city: "Bình Dương", state: "Bình Dương", code: "750000" },
  { city: "Đồng Nai", state: "Đồng Nai", code: "810000" },
  { city: "Bắc Ninh", state: "Bắc Ninh", code: "222000" },
  { city: "Hải Dương", state: "Hải Dương", code: "320000" },
  { city: "Quảng Ninh", state: "Quảng Ninh", code: "200000" },
  { city: "Huế", state: "Thừa Thiên Huế", code: "530000" },
  { city: "Nha Trang", state: "Khánh Hòa", code: "650000" },
  { city: "Đà Lạt", state: "Lâm Đồng", code: "720000" },
  { city: "Quảng Ngãi", state: "Quảng Ngãi", code: "570000" },
  { city: "Hội An", state: "Quảng Nam", code: "560000" },
]

export function getAddressSuggestions(query: string): AddressSuggestion[] {
  if (!query || query.length < 2) return []

  const lowerQuery = query.toLowerCase()
  const suggestions = VIETNAMESE_CITIES.filter(
    (item) =>
      item.city.toLowerCase().includes(lowerQuery) ||
      item.state.toLowerCase().includes(lowerQuery)
  )

  return suggestions.map((item) => ({
    street: "",
    city: item.city,
    state: item.state,
    postalCode: item.code,
  }))
}

export function getStateByCity(city: string): string {
  const match = VIETNAMESE_CITIES.find(
    (item) => item.city.toLowerCase() === city.toLowerCase()
  )
  return match?.state || ""
}

export function getPostalCodeByCity(city: string): string {
  const match = VIETNAMESE_CITIES.find(
    (item) => item.city.toLowerCase() === city.toLowerCase()
  )
  return match?.code || ""
}
