import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { auth, db } from "@/lib/firebase";
import { browserLocalPersistence, setPersistence, signInWithEmailAndPassword, getIdToken } from "firebase/auth";
import { doc, setDoc, serverTimestamp, increment, updateDoc, getDocs, where, collection, query } from "firebase/firestore";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const incrementVisits = async () => {
      const counterRef = doc(db, "counters", "userCount");
      try {
        await updateDoc(counterRef, { count: increment(1) });
      } catch (err) {
        console.error("Failed to increment user visits:", err);
      }
    };
    incrementVisits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    await setPersistence(auth, browserLocalPersistence);

    // Sign in normally
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Reference centralized userActivities doc
    const userActivityRef = doc(db, "userActivities", user.email!);

    // Update last login and increment login count
    await setDoc(
      userActivityRef,
      {
        email: user.email,
        lastLogin: serverTimestamp(),
        login_count: increment(1),
      },
      { merge: true } // merge so it won't overwrite other fields
    );

    // Optional: reset failed login attempts if login successful
    await updateDoc(userActivityRef, {
      failed_login: 0,
    }).catch(() => {}); // ignore if field doesn't exist yet

    // Request custom token from your backend
    const tokenResponse = await fetch("http://localhost:5000/generateToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid, email: user.email }),
    });
    const { token } = await tokenResponse.json();

    // Redirect to dashboard with token
    window.location.href = `http://localhost:8082/?token=${token}`;
  } catch (error: any) {
    console.error(error);

    // If login failed, increment centralized failed_login counter
    const userActivityRef = doc(db, "userActivities", email);
    await setDoc(
      userActivityRef,
      {
        failed_login: increment(1),
        lastFailedAttempt: serverTimestamp(),
      },
      { merge: true }
    ).catch(() => {}); // ignore if it fails

    toast({
      title: "Login Failed",
      description: error.message,
    });
  } finally {
    setIsLoading(false);
  }
};



  const isFormValid = email.includes("@") && password.length >= 6;

  return (
    <Card className="glass-morphism w-full max-w-md mx-auto border-0">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-tech-gradient flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold bg-tech-gradient bg-clip-text text-transparent">
            TechCorp IT Solutions
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Sign in to your account to continue
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@techcorp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-muted/50 border-border focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-muted/50 border-border focus:border-primary transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <a href="#" className="text-primary hover:text-accent transition-colors">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full bg-tech-gradient hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="#" className="text-primary hover:text-accent transition-colors font-medium">
              Contact IT Support
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
