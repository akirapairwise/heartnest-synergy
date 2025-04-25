
import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, ChevronRight, Sparkles, Target, MessageSquare, BarChart4, Calendar } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

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
            <Button 
              variant="outline" 
              size="lg" 
              className="px-6 py-6"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div id="features" className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Features Designed for Deeper Connections</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            HeartNest provides the tools you need to nurture and grow your relationship
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Event Planning Card */}
          <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 relative cursor-pointer"
                onClick={() => navigate('/event-suggestions')}>
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-love-100 p-3 rounded-full group-hover:bg-love-200 transition-colors">
                  <Calendar className="h-6 w-6 text-love-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">AI Event Planning</h3>
              <p className="text-center text-muted-foreground">
                Get personalized date ideas and event suggestions powered by AI.
              </p>
              <div className="mt-4 flex justify-center">
                <Button variant="ghost" size="sm" className="group-hover:bg-love-50">
                  Try Now <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Emotional Tracking Card */}
          <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 relative cursor-pointer"
                onClick={() => navigate('/moods')}>
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-harmony-100 p-3 rounded-full group-hover:bg-harmony-200 transition-colors">
                  <Heart className="h-6 w-6 text-harmony-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Mood Tracking</h3>
              <p className="text-center text-muted-foreground">
                Track your relationship moods and emotions to identify patterns.
              </p>
              <div className="mt-4 flex justify-center">
                <Button variant="ghost" size="sm" className="group-hover:bg-harmony-50">
                  Try Now <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Goals Card */}
          <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 relative cursor-pointer"
                onClick={() => navigate('/goals')}>
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-calm-100 p-3 rounded-full group-hover:bg-calm-200 transition-colors">
                  <Target className="h-6 w-6 text-calm-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Relationship Goals</h3>
              <p className="text-center text-muted-foreground">
                Set and achieve meaningful goals together to strengthen your bond.
              </p>
              <div className="mt-4 flex justify-center">
                <Button variant="ghost" size="sm" className="group-hover:bg-calm-50">
                  Try Now <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Relationship Insights Card */}
          <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 relative cursor-pointer"
                onClick={() => navigate('/recommendations')}>
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-harmony-100 p-3 rounded-full group-hover:bg-harmony-200 transition-colors">
                  <BarChart4 className="h-6 w-6 text-harmony-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Relationship Insights</h3>
              <p className="text-center text-muted-foreground">
                Gain valuable insights into your relationship patterns and dynamics over time.
              </p>
              <div className="mt-4 flex justify-center">
                <Button variant="ghost" size="sm" className="group-hover:bg-harmony-50">
                  Try Now <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
          
          {/* AI Recommendations Card */}
          <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 relative cursor-pointer"
                onClick={() => navigate('/event-suggestions')}>
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-love-100 p-3 rounded-full group-hover:bg-love-200 transition-colors">
                  <Sparkles className="h-6 w-6 text-love-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">AI Recommendations</h3>
              <p className="text-center text-muted-foreground">
                Discover personalized events and activities tailored to your relationship preferences.
              </p>
              <div className="mt-4 flex justify-center">
                <Button variant="ghost" size="sm" className="group-hover:bg-love-50">
                  Try Now <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Couples Therapy Card */}
          <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 relative cursor-pointer">
            <div className="absolute -top-10 -right-10 bg-green-500 text-white text-xs transform rotate-45 py-1 px-10">
              <span className="font-medium">Coming Soon</span>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-calm-100 p-3 rounded-full group-hover:bg-calm-200 transition-colors">
                  <MessageSquare className="h-6 w-6 text-calm-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Couples Therapy</h3>
              <p className="text-center text-muted-foreground">
                Access guided therapy exercises and resources developed by relationship experts.
              </p>
              <div className="mt-4 flex justify-center">
                <Button variant="ghost" size="sm" className="group-hover:bg-calm-50" disabled>
                  Coming Soon <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
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
