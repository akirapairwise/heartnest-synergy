
import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-muted py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <Heart className="h-5 w-5 text-love-500 mr-2" />
            <span className="text-lg font-bold gradient-heading">Usora</span>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link>
            <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms of Use</Link>
            <a href="#" className="text-muted-foreground hover:text-foreground">Contact</a>
          </div>
        </div>
        <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Usora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
