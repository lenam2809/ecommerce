import { logger } from '@/lib/logger'
import { useState, useEffect } from "react"
import axios from "axios"

export interface Province {
  code: number
  name: string
  division_type: string
  codename: string
  phone_code: number
}

export interface District {
  code: number
  name: string
  division_type: string
  codename: string
  province_code: number
}

export interface Ward {
  code: number
  name: string
  division_type: string
  codename: string
  district_code: number
}

export function useLocation() {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])

  const [isLoading, setIsLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  })

  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoading((prev) => ({ ...prev, provinces: true }))
      try {
        const response = await axios.get("https://provinces.open-api.vn/api/p/")
        setProvinces(response.data)
      } catch (error) {
        logger.error("Failed to fetch provinces:", error)
      } finally {
        setIsLoading((prev) => ({ ...prev, provinces: false }))
      }
    }

    fetchProvinces()
  }, [])

  const fetchDistricts = async (provinceCode: number) => {
    if (!provinceCode) {
      setDistricts([])
      return
    }
    setIsLoading((prev) => ({ ...prev, districts: true }))
    try {
      const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
      setDistricts(response.data.districts)
    } catch (error) {
      logger.error("Failed to fetch districts:", error)
      setDistricts([])
    } finally {
      setIsLoading((prev) => ({ ...prev, districts: false }))
    }
  }

  const fetchWards = async (districtCode: number) => {
    if (!districtCode) {
      setWards([])
      return
    }
    setIsLoading((prev) => ({ ...prev, wards: true }))
    try {
      const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
      setWards(response.data.wards)
    } catch (error) {
      logger.error("Failed to fetch wards:", error)
      setWards([])
    } finally {
      setIsLoading((prev) => ({ ...prev, wards: false }))
    }
  }

  return {
    provinces,
    districts,
    wards,
    isLoading,
    fetchDistricts,
    fetchWards,
    setDistricts,
    setWards
  }
}
