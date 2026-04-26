import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, CreditCard, Search, ArrowRight } from "lucide-react"

export default function AssistantPage() {
    const queue = [
        { id: "Q-12", pet: "Max", owner: "Senith U.", time: "09:00 AM", status: "Checked In" },
        { id: "Q-13", pet: "Luna", owner: "Kasun P.", time: "09:30 AM", status: "In Consult" },
        { id: "Q-14", pet: "Rocky", owner: "Nuwan J.", time: "10:15 AM", status: "Expected" },
    ]

    return (
        <div className="space-y-8 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Front Desk</h1>
                    <p className="text-muted-foreground mt-1">Manage check-ins, queue, and billing.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Queue Management</CardTitle>
                        <CardDescription>Live view of the clinic waiting room.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2 mb-4">
                            <Input placeholder="Search patient or owner..." className="max-w-sm" />
                            <Button variant="secondary"><Search className="h-4 w-4 mr-2" /> Search</Button>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No.</TableHead>
                                    <TableHead>Pet</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {queue.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.id}</TableCell>
                                        <TableCell>{item.pet}</TableCell>
                                        <TableCell className="text-muted-foreground">{item.owner}</TableCell>
                                        <TableCell>{item.time}</TableCell>
                                        <TableCell>
                                            <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold
                                                ${item.status === 'Checked In' ? 'border-amber-500 text-amber-700 bg-amber-50' :
                                                    item.status === 'In Consult' ? 'border-primary text-primary bg-primary/10' :
                                                        'border-muted text-muted-foreground'}`}>
                                                {item.status}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.status === 'Expected' ? (
                                                <Button size="sm">Check In</Button>
                                            ) : (
                                                <Button variant="outline" size="sm">View</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card className="bg-zinc-900 text-zinc-50">
                        <CardHeader>
                            <CardTitle className="text-zinc-50">Quick Bill</CardTitle>
                            <CardDescription className="text-zinc-400">Process payment for completed consults</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-50">Enter Invoice Number</Label>
                                <div className="flex space-x-2">
                                    <Input placeholder="INV-0000" className="bg-zinc-800 border-zinc-700 text-zinc-50" />
                                    <Button variant="secondary">Fetch</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Waiting Room</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4</div>
                            <p className="text-xs text-muted-foreground">Patients currently waiting</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function Label({ className, children }: { className?: string, children: React.ReactNode }) {
    return <label className={`text-sm font-medium leading-none ${className || ''}`}>{children}</label>
}
