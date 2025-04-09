
import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, ChevronRight, Sparkles, Target, MessageSquare, BarChart4 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-16 w-16 text-love-500 animate-pulse-soft" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold gradient-heading mb-6 font-heading">
            HeartNest: Nurture Your Relationship
          </h1>
          
          <p className="text-xl mb-8 max-w-3xl mx-auto text-muted-foreground">
            Track, understand, and strengthen your relationship with intuitive tools and personalized insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="btn-primary-gradient text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              Get Started
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-6 py-6">
              Learn More
            </Button>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Features Designed for Deeper Connections</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            HeartNest provides the tools you need to nurture and grow your relationship
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="heart-card">
            <div className="flex justify-center mb-4">
              <div className="bg-love-100 p-3 rounded-full">
                <Heart className="h-6 w-6 text-love-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Emotional Tracking</h3>
            <p className="text-center text-muted-foreground">
              Track your relationship moods and emotions to identify patterns and growth opportunities.
            </p>
          </div>
          
          <div className="heart-card">
            <div className="flex justify-center mb-4">
              <div className="bg-harmony-100 p-3 rounded-full">
                <Target className="h-6 w-6 text-harmony-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Relationship Goals</h3>
            <p className="text-center text-muted-foreground">
              Set and achieve meaningful goals to strengthen your connection and build a shared vision.
            </p>
          </div>
          
          <div className="heart-card">
            <div className="flex justify-center mb-4">
              <div className="bg-calm-100 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-calm-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Conflict Resolution</h3>
            <p className="text-center text-muted-foreground">
              Navigate disagreements constructively with guided communication tools and strategies.
            </p>
          </div>
          
          <div className="heart-card">
            <div className="flex justify-center mb-4">
              <div className="bg-harmony-100 p-3 rounded-full">
                <BarChart4 className="h-6 w-6 text-harmony-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Relationship Insights</h3>
            <p className="text-center text-muted-foreground">
              Gain valuable insights into your relationship patterns and dynamics over time.
            </p>
          </div>
          
          <div className="heart-card">
            <div className="flex justify-center mb-4">
              <div className="bg-love-100 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-love-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">AI Recommendations</h3>
            <p className="text-center text-muted-foreground">
              Receive personalized recommendations and activities tailored to your relationship.
            </p>
          </div>
          
          <div className="heart-card relative overflow-hidden">
            <div className="absolute -top-10 -right-10 bg-green-500 text-white text-xs transform rotate-45 py-1 px-10">
              <span className="font-medium">Coming Soon</span>
            </div>
            <div className="flex justify-center mb-4">
              <div className="bg-calm-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-calm-600">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Couples Therapy</h3>
            <p className="text-center text-muted-foreground">
              Access guided therapy exercises and resources developed by relationship experts.
            </p>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-love-500 to-harmony-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Strengthen Your Relationship?</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of couples who are using HeartNest to build deeper, more meaningful connections.
          </p>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => navigate('/auth')}
          >
            Start Your Journey
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-love-500 mr-2" />
              <span className="text-xl font-bold gradient-heading">HeartNest</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground">About</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Features</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Pricing</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Contact</a>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} HeartNest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
