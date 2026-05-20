"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ProtectedRoute } from "@/components/ui/protected-route";
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import type { User, Role } from "@/lib/types";
import { toast } from "sonner";
import { userService } from "@/app/services/user.service";
import type { PaginationMeta } from "@/app/services/user.service";

const ROLE_COLORS: Record<Role, string> = {
  MAIN_ADMIN: "bg-violet-500 hover:bg-violet-600 text-white",
  MINOR_ADMIN: "bg-blue-500 hover:bg-blue-600 text-white",
  VET: "bg-emerald-500 hover:bg-emerald-600 text-white",
  CUSTOMER: "bg-gray-200 hover:bg-gray-300 text-gray-800",
};

const LIMIT = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: LIMIT,
    totalPages: 1,
  });

  // Edit-role dialog state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<Role>("CUSTOMER");

  // View-user dialog state
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // ── Fetch users whenever page / search / role filter changes ──────────────
  useEffect(() => {
    let cancelled = false;

    const doFetch = async () => {
      setLoading(true);
      try {
        const result = await userService.getUsers({
          page: currentPage,
          limit: LIMIT,
          search: search || undefined,
          role: roleFilter !== "ALL" ? (roleFilter as Role) : undefined,
        });
        if (!cancelled) {
          setUsers(result.data ?? []);
          setMeta(result.meta);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to fetch users");
          console.error(error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Debounce only when the search string drives the fetch
    const delay = search ? 300 : 0;
    const timer = setTimeout(doFetch, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [currentPage, search, roleFilter]);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  // ── View user by ID ────────────────────────────────────────────────────────
  const handleViewUser = async (user: User) => {
    setViewDialogOpen(true);
    setViewingUser(null);
    setViewLoading(true);
    try {
      const detail = await userService.getUserById(user.id);
      setViewingUser(detail);
    } catch (error) {
      toast.error("Failed to load user details");
      console.error(error);
      setViewDialogOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // ── Update role ────────────────────────────────────────────────────────────
  const handleRoleChange = async () => {
    if (!editingUser) return;
    try {
      const updatedUser = await userService.updateUserRole(
        editingUser.id,
        newRole,
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? updatedUser : u)),
      );
      toast.success(
        `${editingUser.firstName} ${editingUser.lastName}'s role updated to ${newRole}`,
      );
      setEditingUser(null);
    } catch (error) {
      toast.error("Failed to update user role");
      console.error(error);
    }
  };

  // ── Derived stats (from current page data + meta total) ───────────────────
  const stats = {
    total: meta.total,
    active: users.filter((u) => u.isActive).length,
    admins: users.filter(
      (u) => u.role === "MAIN_ADMIN" || u.role === "MINOR_ADMIN",
    ).length,
    vets: users.filter((u) => u.role === "VET").length,
  };

  return (
    <ProtectedRoute allowedRoles={["main_admin"]}>
      <div className="space-y-8 p-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all platform users, roles, and account statuses.
          </p>
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
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <ShieldCheck className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-600">
                {stats.admins}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vets</CardTitle>
              <UserCheck className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {stats.vets}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Search, filter, and manage user accounts across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or account number..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && users.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No users match your search criteria.
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  users.map((user) => (
                    <TableRow
                      key={user.id}
                      className={!user.isActive ? "opacity-50" : ""}
                    >
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.phone || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={ROLE_COLORS[user.role]}>
                          {user.role.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                          className={
                            user.isActive
                              ? "bg-green-500 hover:bg-green-600"
                              : ""
                          }
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {/* View details */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>

                        {/* Edit role */}
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
                              <DialogTitle>
                                Change Role for {editingUser?.firstName}{" "}
                                {editingUser?.lastName}
                              </DialogTitle>
                              <DialogDescription>
                                Changing a user&apos;s role will immediately
                                affect their access permissions across the
                                platform.
                              </DialogDescription>
                            </DialogHeader>
                            <Select
                              value={newRole}
                              onValueChange={(v) => setNewRole(v as Role)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MAIN_ADMIN">
                                  Main Admin
                                </SelectItem>
                                <SelectItem value="MINOR_ADMIN">
                                  Minor Admin
                                </SelectItem>
                                <SelectItem value="VET">Vet</SelectItem>
                                <SelectItem value="CUSTOMER">
                                  Customer
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <DialogFooter>
                              <Button onClick={handleRoleChange}>
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {meta.total === 0 ? 0 : (currentPage - 1) * LIMIT + 1}
                </span>{" "}
                –{" "}
                <span className="font-medium">
                  {Math.min(currentPage * LIMIT, meta.total)}
                </span>{" "}
                of <span className="font-medium">{meta.total}</span> users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {currentPage} of {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= meta.totalPages || loading}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── View User Dialog ──────────────────────────────────────────────── */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Full profile information for this account.
            </DialogDescription>
          </DialogHeader>

          {viewLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!viewLoading && viewingUser && (
            <div className="space-y-4">
              {/* Name & role */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">
                    {viewingUser.firstName} {viewingUser.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {viewingUser.email}
                  </p>
                </div>
                <Badge className={ROLE_COLORS[viewingUser.role]}>
                  {viewingUser.role.replace("_", " ")}
                </Badge>
              </div>

              <Separator />

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge
                      variant={viewingUser.isActive ? "default" : "secondary"}
                      className={
                        viewingUser.isActive
                          ? "bg-green-500 hover:bg-green-600"
                          : ""
                      }
                    >
                      {viewingUser.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-medium">{viewingUser.phone ?? "—"}</dd>
                </div>
                {viewingUser.licenseCertificateUrl && (
                  <div className="col-span-2 space-y-2">
                    <dt className="text-muted-foreground font-medium">
                      License Certificate
                    </dt>
                    <dd>
                      {/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(
                        viewingUser.licenseCertificateUrl,
                      ) ? (
                        <img
                          src={viewingUser.licenseCertificateUrl}
                          alt="License Certificate"
                          className="w-full rounded-md border object-contain max-h-72"
                        />
                      ) : (
                        <iframe
                          src={viewingUser.licenseCertificateUrl}
                          title="License Certificate"
                          className="w-full h-72 rounded-md border"
                        />
                      )}
                      <a
                        href={viewingUser.licenseCertificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-1 text-xs text-blue-600 hover:underline"
                      >
                        Open in new tab ↗
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">Joined</dt>
                  <dd className="font-medium">
                    {new Date(viewingUser.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Last Updated</dt>
                  <dd className="font-medium">
                    {new Date(viewingUser.updatedAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
