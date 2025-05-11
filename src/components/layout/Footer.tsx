
import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground mt-auto">
      <p>&copy; {new Date().getFullYear()} Usora. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
