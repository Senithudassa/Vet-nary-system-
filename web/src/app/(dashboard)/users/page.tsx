"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { Users, Search, ShieldCheck, UserX, UserCheck } from "lucide-react";
import { mockUsers } from "@/lib/mock-data";
import type { User, Role } from "@/lib/types";
import { toast } from "sonner";

const ROLE_COLORS: Record<Role, string> = {
    MAIN_ADMIN: "bg-violet-500 hover:bg-violet-600 text-white",
    MINOR_ADMIN: "bg-blue-500 hover:bg-blue-600 text-white",
    VET: "bg-emerald-500 hover:bg-emerald-600 text-white",
    CUSTOMER: "bg-gray-200 hover:bg-gray-300 text-gray-800",
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("ALL");
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newRole, setNewRole] = useState<Role>("CUSTOMER");

    const filtered = useMemo(() => {
        return users.filter(u => {
            const matchSearch = search === "" ||
                u.firstName.toLowerCase().includes(search.toLowerCase()) ||
                u.lastName.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase()) ||
                u.accountNumber?.toLowerCase().includes(search.toLowerCase());
            const matchRole = roleFilter === "ALL" || u.role === roleFilter;
            return matchSearch && matchRole;
        });
    }, [users, search, roleFilter]);

    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.isActive).length,
        admins: users.filter(u => u.role === "MAIN_ADMIN" || u.role === "MINOR_ADMIN").length,
        vets: users.filter(u => u.role === "VET").length,
    }), [users]);

    const handleRoleChange = () => {
        if (!editingUser) return;
        setUsers(prev => prev.map(u =>
            u.id === editingUser.id ? { ...u, role: newRole, updatedAt: new Date().toISOString() } : u
        ));
        toast.success(`${editingUser.firstName} ${editingUser.lastName}'s role updated to ${newRole}`);
        setEditingUser(null);
    };

    const toggleActive = (user: User) => {
        setUsers(prev => prev.map(u =>
            u.id === user.id ? { ...u, isActive: !u.isActive, updatedAt: new Date().toISOString() } : u
        ));
        toast.success(`${user.firstName} ${user.lastName} ${user.isActive ? "deactivated" : "activated"}`);
    };

    return (
        <ProtectedRoute allowedRoles={["main_admin"]}>
            <div className="space-y-8 p-4 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground mt-1">Manage all platform users, roles, and account statuses.</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <UserCheck className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Admins</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-violet-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-violet-600">{stats.admins}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Vets</CardTitle>
                            <UserCheck className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{stats.vets}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>Search, filter, and manage user accounts across the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, or account number..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Roles</SelectItem>
                                    <SelectItem value="MAIN_ADMIN">Main Admin</SelectItem>
                                    <SelectItem value="MINOR_ADMIN">Minor Admin</SelectItem>
                                    <SelectItem value="VET">Vet</SelectItem>
                                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>A/C No.</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No users match your search criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filtered.map((user) => (
                                    <TableRow key={user.id} className={!user.isActive ? "opacity-50" : ""}>
                                        <TableCell className="font-mono text-sm">{user.accountNumber || "—"}</TableCell>
                                        <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>
                                            <Badge className={ROLE_COLORS[user.role]}>{user.role.replace("_", " ")}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.isActive ? "default" : "secondary"} className={user.isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                                                {user.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingUser(user);
                                                            setNewRole(user.role);
                                                        }}
                                                    >
                                                        Edit Role
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Change Role for {editingUser?.firstName} {editingUser?.lastName}</DialogTitle>
                                                        <DialogDescription>
                                                            Changing a user&apos;s role will immediately affect their access permissions across the platform.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="MAIN_ADMIN">Main Admin</SelectItem>
                                                            <SelectItem value="MINOR_ADMIN">Minor Admin</SelectItem>
                                                            <SelectItem value="VET">Vet</SelectItem>
                                                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <DialogFooter>
                                                        <Button onClick={handleRoleChange}>Save Changes</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                            <Button
                                                variant={user.isActive ? "destructive" : "default"}
                                                size="sm"
                                                onClick={() => toggleActive(user)}
                                            >
                                                {user.isActive ? <><UserX className="h-3 w-3 mr-1" /> Deactivate</> : <><UserCheck className="h-3 w-3 mr-1" /> Activate</>}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="mt-4 text-sm text-muted-foreground">
                            Showing {filtered.length} of {users.length} users
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
