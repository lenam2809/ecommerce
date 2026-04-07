"use client"
import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCcw } from "lucide-react"
import Link from "next/link"

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
    errorCount: number
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, errorCount: 0 }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorCount: 0 }
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error("[ErrorBoundary] Error caught:", error, errorInfo)
        // In production, send error to logging service
        // Example: logErrorToService(error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorCount: 0 })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="w-full max-w-md text-center p-8 rounded-lg border border-border bg-card">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mb-6">
                            <AlertTriangle className="h-8 w-8" />
                        </div>

                        <h1 className="text-3xl font-bold mb-4 text-foreground">Oops! Có lỗi xảy ra</h1>

                        <p className="text-muted-foreground mb-2 text-sm">
                            Xin lỗi, đã có lỗi không mong muốn xảy ra. Vui lòng thử lại.
                        </p>

                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <div className="mt-4 p-3 bg-muted rounded text-left text-xs text-muted-foreground overflow-auto max-h-32">
                                <p className="font-mono text-destructive">{this.state.error.message}</p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                            <Button
                                onClick={this.handleReset}
                                className="bg-primary hover:bg-primary/90"
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Thử lại
                            </Button>

                            <Button asChild variant="outline">
                                <Link href="/">
                                    <Home className="mr-2 h-4 w-4" />
                                    Về trang chủ
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
