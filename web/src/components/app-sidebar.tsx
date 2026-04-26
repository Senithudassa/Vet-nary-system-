"use client";

import { Calendar, Home, Inbox, Search, Settings, Activity, Users, FileText, Banknote, LogOut } from "lucide-react"
import Link from "next/link"
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
} from "@/components/ui/sidebar"

// Define the full universe of possible routes
const allItems = [
    { title: "Main Admin Dashboard", url: "/main-admin", icon: Activity, requiredRoles: ["main_admin"] },
    { title: "Minor Admin Panel", url: "/minor-admin", icon: Settings, requiredRoles: ["main_admin", "minor_admin"] },
    { title: "Vet Portal", url: "/vet", icon: Activity, requiredRoles: ["main_admin", "vet"] },
    { title: "Assistant Till", url: "/assistant", icon: Banknote, requiredRoles: ["main_admin", "vet"] },
    { title: "Patient Records", url: "/records", icon: FileText, requiredRoles: ["main_admin", "vet", "customer"] },
    { title: "User Management", url: "/users", icon: Users, requiredRoles: ["main_admin"] },
]

export function AppSidebar() {
    const { role, loading, signOut } = useAuth();

    // Filter items based on the user's secure role claim
    const visibleItems = allItems.filter(item => {
        if (!role) return false;
        return item.requiredRoles.includes(role);
    });

    const handleLogout = async () => {
        try {
            await signOut();
            // The AuthContext onAuthStateChanged listener was replaced by mock state,
            // so we manually call signOut which clears state and localStorage.
        } catch (error) {
            console.error("Logout failed", error);
        }
    }

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        VetNary System
                        {!loading && role && <span className="ml-2 text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">{role}</span>}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {!loading && visibleItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}

                            {loading && (
                                <div className="p-4 flex justify-center">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                </div>
                            )}

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
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
