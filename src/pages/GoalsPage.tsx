
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, Target, Calendar, PlusCircle, Clock, ArrowUpCircle } from "lucide-react";

type Goal = {
  id: number;
  title: string;
  description?: string;
  progress: number;
  completed: boolean;
  dueDate?: string;
  category: string;
  createdAt: string;
};

const GoalsPage = () => {
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const { toast } = useToast();
  
  // Mock goals data (in a real app, this would come from a database)
  const [goals, setGoals] = useState<Goal[]>([
    { 
      id: 1, 
      title: "Have a weekly date night", 
      description: "Schedule quality time together each week to reconnect",
      progress: 75, 
      completed: false,
      dueDate: "2025-04-30",
      category: "quality-time",
      createdAt: "2025-03-15"
    },
    { 
      id: 2, 
      title: "Create a shared bucket list", 
      description: "Document experiences we want to have together",
      progress: 100, 
      completed: true,
      category: "adventure",
      createdAt: "2025-03-10"
    },
    { 
      id: 3, 
      title: "Practice active listening", 
      description: "Focus on truly understanding each other's perspective",
      progress: 40, 
      completed: false,
      dueDate: "2025-05-15",
      category: "communication",
      createdAt: "2025-03-20"
    },
    { 
      id: 4, 
      title: "Plan a weekend getaway", 
      description: "Find a nearby destination for a weekend trip",
      progress: 25, 
      completed: false,
      dueDate: "2025-06-01",
      category: "adventure",
      createdAt: "2025-03-25"
    },
    { 
      id: 5, 
      title: "Learn each other's love languages", 
      description: "Read the book together and discuss how to apply it",
      progress: 60, 
      completed: false,
      dueDate: "2025-05-10",
      category: "understanding",
      createdAt: "2025-03-05"
    },
  ]);
  
  const completedGoals = goals.filter(goal => goal.completed);
  const activeGoals = goals.filter(goal => !goal.completed);
  
  const handleSubmitNewGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would save to the database
    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);
    
    const newGoal: Goal = {
      id: goals.length + 1,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      progress: 0,
      completed: false,
      dueDate: formData.get('dueDate') as string || undefined,
      category: formData.get('category') as string,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setGoals([...goals, newGoal]);
    setIsNewGoalOpen(false);
    
    toast({
      title: "Goal created!",
      description: "Your new relationship goal has been added.",
    });
  };
  
  const handleUpdateProgress = (goalId: number, newProgress: number) => {
    setGoals(
      goals.map(goal => 
        goal.id === goalId 
          ? { 
              ...goal, 
              progress: newProgress, 
              completed: newProgress === 100 
            } 
          : goal
      )
    );
    
    toast({
      title: "Progress updated",
      description: `Goal progress updated to ${newProgress}%`,
    });
  };
  
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Relationship Goals</h1>
          <p className="text-muted-foreground">Track and achieve your relationship aspirations together</p>
        </div>
        
        <Dialog open={isNewGoalOpen} onOpenChange={setIsNewGoalOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary-gradient">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <form onSubmit={handleSubmitNewGoal}>
              <DialogHeader>
                <DialogTitle>Create a New Goal</DialogTitle>
                <DialogDescription>
                  Set a meaningful goal to strengthen your relationship
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input id="title" name="title" placeholder="What do you want to achieve?" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    placeholder="Add more details about this goal"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue="quality-time">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="communication">Communication</SelectItem>
                        <SelectItem value="quality-time">Quality Time</SelectItem>
                        <SelectItem value="adventure">Adventure</SelectItem>
                        <SelectItem value="understanding">Understanding</SelectItem>
                        <SelectItem value="growth">Personal Growth</SelectItem>
                        <SelectItem value="intimacy">Intimacy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date (optional)</Label>
                    <Input id="dueDate" name="dueDate" type="date" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsNewGoalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Goal</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Goal Progress</CardTitle>
          <CardDescription>
            You have completed {completedGoals.length} of {goals.length} goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round((completedGoals.length / goals.length) * 100)}%</span>
            </div>
            <Progress value={(completedGoals.length / goals.length) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Goals ({activeGoals.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          <div className="grid gap-4">
            {activeGoals.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No active goals. Create one to get started!</p>
                </CardContent>
              </Card>
            ) : (
              activeGoals.map((goal) => (
                <Card key={goal.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-md ${
                            goal.category === 'communication' ? 'bg-blue-100' :
                            goal.category === 'quality-time' ? 'bg-purple-100' :
                            goal.category === 'adventure' ? 'bg-green-100' :
                            goal.category === 'understanding' ? 'bg-yellow-100' :
                            goal.category === 'growth' ? 'bg-orange-100' :
                            'bg-pink-100'
                          }`}>
                            <Target className={`h-5 w-5 ${
                              goal.category === 'communication' ? 'text-blue-600' :
                              goal.category === 'quality-time' ? 'text-purple-600' :
                              goal.category === 'adventure' ? 'text-green-600' :
                              goal.category === 'understanding' ? 'text-yellow-600' :
                              goal.category === 'growth' ? 'text-orange-600' :
                              'text-pink-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-medium">{goal.title}</h3>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {goal.dueDate && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                  <Calendar className="h-3 w-3" />
                                  <span>Due {new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                <Clock className="h-3 w-3" />
                                <span>Created {new Date(goal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full sm:w-40">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                          
                          <div className="flex gap-2 mt-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-xs"
                              onClick={() => handleUpdateProgress(goal.id, Math.min(100, goal.progress + 25))}
                            >
                              <ArrowUpCircle className="h-3 w-3 mr-1" />
                              Update
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-xs"
                              onClick={() => handleUpdateProgress(goal.id, 100)}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4">
            {completedGoals.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No completed goals yet. Keep going!</p>
                </CardContent>
              </Card>
            ) : (
              completedGoals.map((goal) => (
                <Card key={goal.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-md">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium line-through text-muted-foreground">{goal.title}</h3>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            <Clock className="h-3 w-3" />
                            <span>Completed on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoalsPage;
