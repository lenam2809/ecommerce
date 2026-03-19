"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Trash2 } from "lucide-react"

interface AvatarUploadProps {
  currentAvatar?: string
  onAvatarChange: (file: File | string | undefined) => void
}

export default function AvatarUpload({ currentAvatar, onAvatarChange }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(currentAvatar)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng tải lên tệp hình ảnh hợp lệ.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước tệp phải nhỏ hơn 5MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    onAvatarChange(file)
  }

  const handleRemoveAvatar = () => {
    setPreview(undefined)
    onAvatarChange(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getInitials = () => {
    return "U"
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={preview || "/placeholder.svg"} alt="Profile" />
          <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-2 -right-2 flex space-x-1">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            <span className="sr-only">Tải lên ảnh đại diện</span>
          </Button>
          {preview && (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="h-8 w-8 rounded-full"
              onClick={handleRemoveAvatar}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Xoá ảnh đại diện</span>
            </Button>
          )}
        </div>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <p className="text-sm text-muted-foreground">Tải lên ảnh đại diện (tối đa 5MB)</p>
    </div>
  )
}
