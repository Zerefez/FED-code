import { Link } from "react-router-dom";

interface AuthNavigationProps {
  type: 'login' | 'register';
  className?: string;
}

export function AuthNavigation({ type, className = "" }: AuthNavigationProps) {
  const authLinks = {
    login: {
      text: "Har du ikke en konto?",
      linkText: "Opret bruger",
      to: "/auth/register"
    },
    register: {
      text: "Har du allerede en konto?",
      linkText: "Log ind", 
      to: "/auth/login"
    }
  };

  const currentLink = authLinks[type];

  return (
    <div className={`mt-4 text-center text-sm ${className}`}>
      {currentLink.text}{" "}
      <Link 
        to={currentLink.to}
        className="underline underline-offset-4 hover:text-primary"
      >
        {currentLink.linkText}
      </Link>
    </div>
  );
} 