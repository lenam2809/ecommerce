"use client"

import { Button } from "@/components/ui/button"
import { toast, useToast } from "@/hooks/use-toast"

export default function ToastDemoPage() {
    const { toasts, dismiss } = useToast()

    const handleBasicToast = () => {
        toast({ title: "Basic Toast" })
    }

    const handleDescriptionToast = () => {
        toast({
            title: "Info",
            description: "This is a toast with description.",
        })
    }

    const handleToastWithAction = () => {
        toast({
            title: "Unsaved Changes",
            description: "You have unsaved changes. Do you want to save them?",
            action: (
                <button
                    className="text-blue-500 underline text-sm"
                    onClick={() => alert("Saved!")}
                >
                    Save
                </button>
            ),
        })
    }

    const handleDismissById = () => {
        const t = toast({ title: "Will dismiss in 3s" })
        setTimeout(() => t.dismiss(), 3000)
    }

    const handleUpdateToast = () => {
        const t = toast({ title: "Uploading..." })
        setTimeout(() => {
            t.update({ id: '1', title: "Upload Success!", description: "File uploaded" })
        }, 2000)
    }

    const handleDismissAll = () => {
        dismiss() // no toastId → dismiss all
    }

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">Toast Demo</h1>

            <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleBasicToast}>Show Basic Toast</Button>
                <Button onClick={handleDescriptionToast}>Toast with Description</Button>
                <Button onClick={handleToastWithAction}>Toast with Action</Button>
                <Button onClick={handleDismissById}>Toast & Dismiss by ID</Button>
                <Button onClick={handleUpdateToast}>Toast & Update Later</Button>
                <Button onClick={handleDismissAll} variant="destructive">
                    Dismiss All Toasts
                </Button>
            </div>

            <div className="mt-6 text-sm text-gray-500">
                <p>Current Toasts:</p>
                <ul className="list-disc ml-5">
                    {toasts.map((t) => (
                        <li key={t.id}>
                            ID: {t.id}, Title: {typeof t.title === "string" ? t.title : "Custom Node"}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
