import React, { useState, useEffect } from 'react';
import { userService } from '../../../services/userService';
import Loader from '../../../components/shared/Loader';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers();
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      try {
        await userService.updateUserStatus(id, !currentStatus);
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert('Failed to update user status');
      }
    }
  };

  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (window.confirm(`Change user role to ${newRole}?`)) {
      try {
        await userService.updateUserRole(id, newRole);
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert('Failed to update user role');
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-serif text-black mb-8">User Management</h1>

      <div className="bg-white shadow-sm border border-gray-100 rounded overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <Loader />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Join Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-white transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-black">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium tracking-wide ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      <button 
                        onClick={() => handleRoleChange(user._id, user.role)}
                        className={`text-xs font-medium px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors`}
                      >
                        Make {user.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                      <button 
                        onClick={() => handleToggleActive(user._id, user.isActive)}
                        className={`text-xs font-medium px-3 py-1 rounded ${user.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'} transition-colors`}
                        disabled={user.role === 'admin'}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
