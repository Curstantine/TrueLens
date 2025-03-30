import { useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import Button from "~/app/_components/form/Button";

export default function AdminUserPage() {
    const { data: users, isLoading } = api.user.getAll.useQuery();
    const deleteUser = api.user.delete.useMutation({
        onSuccess: () => {
            toast.success("User deleted successfully.");
            refetchUsers();
        },
        onError: (error) => {
            toast.error(`Failed to delete user: ${error.message}`);
        },
    });

    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    if (isLoading) {
        return <div>Loading users...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Admin - User Management</h1>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 px-4 py-2">Name</th>
                        <th className="border border-gray-300 px-4 py-2">Email</th>
                        <th className="border border-gray-300 px-4 py-2">Role</th>
                        <th className="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users?.map((user) => (
                        <tr key={user.id}>
                            <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                            <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                            <td className="border border-gray-300 px-4 py-2">{user.role}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                <Button
                                    intent="icon"
                                    className="mr-2"
                                    onClick={() => setSelectedUser(user.id)}
                                >
                                    View
                                </Button>
                                <Button
                                    intent="destructive"
                                    onClick={() => deleteUser.mutate({ id: user.id })}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedUser && (
                <div className="mt-4 p-4 border border-gray-300">
                    <h2 className="text-xl font-bold">User Details</h2>
                    {/* Fetch and display user details here */}
                    <p>User ID: {selectedUser}</p>
                    <Button onClick={() => setSelectedUser(null)}>Close</Button>
                </div>
            )}
        </div>
    );
}