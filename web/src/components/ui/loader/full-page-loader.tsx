export function FullPageLoader({ message = "Authenticating..." }: { message?: string }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30">
            <div className="flex flex-col items-center space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    )
}
