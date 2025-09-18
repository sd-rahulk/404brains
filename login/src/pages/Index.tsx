import { LoginForm } from "@/components/LoginForm";
import techBg from "@/assets/tech-bg.jpg";

const Index = () => {
  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${techBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-xs text-muted-foreground/80">
          © 2024 TechCorp IT Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Index;
