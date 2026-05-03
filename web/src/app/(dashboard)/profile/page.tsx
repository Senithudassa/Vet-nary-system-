"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { useAuth } from "@/context/AuthContext";
import { UserCircle, Mail, Phone, Shield, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user, role } = useAuth();

    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState("0771234567");
    const [isSaving, setIsSaving] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSaveProfile = async () => {
        setIsSaving(true);
        // Simulate save
        await new Promise(r => setTimeout(r, 800));
        setIsSaving(false);
        toast.success("Profile updated successfully.");
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            toast.error("Please fill in all password fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }
        // Simulate password change
        await new Promise(r => setTimeout(r, 800));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Password changed successfully.");
    };

    const ROLE_LABELS: Record<string, string> = {
        main_admin: "Main Administrator",
        minor_admin: "Minor Administrator",
        vet: "Veterinarian",
        customer: "Customer",
    };

    return (
        <ProtectedRoute allowedRoles={["main_admin", "minor_admin", "vet"]}>
            <div className="space-y-8 p-4 max-w-3xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your account information and security settings.</p>
                </div>

                {/* Profile Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserCircle className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <CardTitle>{user?.user_metadata?.full_name || "User"}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <Mail className="h-3 w-3" />
                                    {user?.email}
                                </CardDescription>
                                <Badge className="mt-2" variant="secondary">
                                    <Shield className="h-3 w-3 mr-1" />
                                    {role ? ROLE_LABELS[role] || role : "Unknown"}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Edit Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your password to keep your account secure.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            </div>
                        </div>
                        <Button variant="secondary" onClick={handleChangePassword}>
                            Change Password
                        </Button>
                    </CardContent>
                </Card>

                {/* Account Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Account ID</span>
                                <p className="font-mono">{user?.id || "—"}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Role</span>
                                <p className="font-medium capitalize">{role?.replace("_", " ")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
