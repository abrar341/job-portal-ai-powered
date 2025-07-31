'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'SEEKER', // or 'RECRUITER'
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: '',
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful! Please sign in.');
                router.push('/login');
            } else {
                setErrors({ general: data.message || 'Registration failed' });
            }
        } catch (err) {
            setErrors({ general: 'Network error. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full space-y-8">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Create your account
                </h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {errors.general && (
                        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded">
                            {errors.general}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <input
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.firstName && (
                                <p className="text-sm text-red-600">{errors.firstName}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <input
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.lastName && (
                                <p className="text-sm text-red-600">{errors.lastName}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                        >
                            <option value="SEEKER">Job Seeker</option>
                            <option value="RECRUITER">Recruiter</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex justify-center py-2 px-4 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                            }`}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <div className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
