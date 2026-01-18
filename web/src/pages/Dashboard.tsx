import { useEffect, useState } from "react";

import { userService } from "@/services/api/userService";
import type { User } from "@/types/api.types";
import Toast from "../component/Toast";

export default function Dashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            await userService.deleteUser(userToDelete);
            setUsers(users.filter((u) => u.id !== userToDelete));
        } catch (error) {
            console.error("Failed to delete user:", error);
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-y-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your application users and monitor system state.
                    </p>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-black">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Users ({users.length})
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-sm font-medium text-gray-500 border-b border-gray-100">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Registered</th>
                                <th className="px-6 py-4">Auth</th>
                                <th className="px-6 py-4 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(
                                            user.created_at
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                user.auth_platform === "local"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-purple-100 text-purple-700"
                                            }`}
                                        >
                                            {user.auth_platform}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() =>
                                                setUserToDelete(user.id)
                                            }
                                            className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Toast
                visible={!!userToDelete}
                title="Delete User"
                subtitle="Are you sure you want to delete this user? This action cannot be undone."
                onConfirm={handleDeleteUser}
                onCancel={() => setUserToDelete(null)}
                loading={isDeleting}
            />
        </div>
    );
}
