"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/providers/session-provider';
import { login, signUp } from '@/lib/auth/auth';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AuthPage = () => {
    const router = useRouter();
    const { setUser } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isLogin) {
                const user = await login({
                    email: formData.email,
                    password: formData.password
                });
                setUser({
                    id: user.id,
                    name: user.name,
                    email: user.email
                });
                router.push('/documents');
                toast.success('Logged in successfully');
            } else {
                const user = await signUp({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
                setUser({
                    id: user.id,
                    name: user.name,
                    email: user.email
                });
                router.push('/documents');
                toast.success('Signed up successfully');
            }
        } catch (error) {
            console.error(error);
            toast.error(isLogin ? 'Invalid credentials' : 'Signup failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-[#1F1F1F]">
            <Card className="w-[380px]">
                <CardHeader>
                    <CardTitle>{isLogin ? "Welcome back" : "Create account"}</CardTitle>
                    <CardDescription>
                        {isLogin
                            ? "Enter your email and password to sign in"
                            : "Enter your details to create an account"}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={onSubmit}>
                    <CardContent className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={isLoading}
                                    required={!isLogin}
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? (isLogin ? "Signing in..." : "Signing up...")
                                : (isLogin ? "Sign in" : "Sign up")}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => setIsLogin(!isLogin)}
                            disabled={isLoading}
                        >
                            {isLogin
                                ? "Don't have an account? Sign up"
                                : "Already have an account? Sign in"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default AuthPage;
