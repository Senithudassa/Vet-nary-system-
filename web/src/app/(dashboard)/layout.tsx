import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ProtectedRoute } from "@/components/ui/protected-route"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={["vet", "minor_admin", "main_admin"]}>
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full">
                    <div className="flex shrink-0 items-center justify-between p-4 border-b">
                        <SidebarTrigger />
                        <div className="font-semibold">VetNary Web Portal</div>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </SidebarProvider>
        </ProtectedRoute>
    )
}
