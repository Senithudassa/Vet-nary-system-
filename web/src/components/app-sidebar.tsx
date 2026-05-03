"use client";

import { Activity, Settings, Banknote, LogOut, Users, FileText, PawPrint, Calendar, Receipt, Building2, LifeBuoy, UserCircle, BarChart3 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { ModeToggle } from "@/components/mode-toggle"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarSeparator,
} from "@/components/ui/sidebar"

// Define the full universe of possible routes
const allItems = [
    // ── Main Admin ─────────────────────────────────────
    { title: "System Control", url: "/main-admin", icon: Activity, requiredRoles: ["main_admin"], group: "Administration" },
    { title: "Platform Stats", url: "/main-admin/stats", icon: BarChart3, requiredRoles: ["main_admin"], group: "Administration" },
    { title: "Clinic Approvals", url: "/clinics", icon: Building2, requiredRoles: ["main_admin"], group: "Administration" },
    { title: "User Management", url: "/users", icon: Users, requiredRoles: ["main_admin"], group: "Administration" },

    // ── Minor Admin ────────────────────────────────────
    { title: "Contact Center", url: "/minor-admin", icon: Settings, requiredRoles: ["main_admin", "minor_admin"], group: "Support" },
    { title: "Support Tickets", url: "/support", icon: LifeBuoy, requiredRoles: ["main_admin", "minor_admin"], group: "Support" },

    // ── Vet ────────────────────────────────────────────
    { title: "Vet Dashboard", url: "/vet", icon: Activity, requiredRoles: ["main_admin", "vet"], group: "Clinic Operations" },
    { title: "Front Desk", url: "/assistant", icon: Banknote, requiredRoles: ["main_admin", "vet"], group: "Clinic Operations" },
    { title: "Appointments", url: "/appointments", icon: Calendar, requiredRoles: ["main_admin", "vet"], group: "Clinic Operations" },
    { title: "Pet Registry", url: "/pets", icon: PawPrint, requiredRoles: ["main_admin", "vet"], group: "Clinic Operations" },
    { title: "Patient Records", url: "/records", icon: FileText, requiredRoles: ["main_admin", "vet"], group: "Clinic Operations" },
    { title: "Invoices", url: "/invoices", icon: Receipt, requiredRoles: ["main_admin", "vet"], group: "Clinic Operations" },
]

export function AppSidebar() {
    const { role, loading, signOut, user } = useAuth();
    const pathname = usePathname();

    // Filter items based on the user's secure role claim
    const visibleItems = allItems.filter(item => {
        if (!role) return false;
        return item.requiredRoles.includes(role);
    });

    // Group items
    const groups = visibleItems.reduce<Record<string, typeof visibleItems>>((acc, item) => {
        if (!acc[item.group]) acc[item.group] = [];
        acc[item.group].push(item);
        return acc;
    }, {});

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Logout failed", error);
        }
    }

    return (
        <Sidebar>
            <SidebarContent>
                {Object.entries(groups).map(([groupName, items], groupIdx) => (
                    <SidebarGroup key={groupName}>
                        {groupIdx > 0 && <SidebarSeparator className="mb-2" />}
                        <SidebarGroupLabel>
                            {groupName}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {!loading && items.map((item) => (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton asChild isActive={pathname === item.url}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}

                {loading && (
                    <div className="p-4 flex justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    {!loading && role && (
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/profile"}>
                                    <Link href="/profile">
                                        <UserCircle className="h-4 w-4" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{user?.user_metadata?.full_name || "Profile"}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">{role}</span>
                                        </div>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarSeparator />
                        </>
                    )}
                    <SidebarMenuItem className="flex justify-between items-center mb-2 px-2">
                        <span className="text-sm font-medium">Theme</span>
                        <ModeToggle />
                    </SidebarMenuItem>
                    {!loading && role && (
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <LogOut className="h-4 w-4" />
                                <span>Sign out</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
