
"use client";

import { useState, useEffect } from "react";
// AI functionality removed - imports commented out
// import { getMenuSuggestions, MenuSuggestionsInput } from "@/ai/flows/menu-suggestions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Wand2 } from "lucide-react";
import { useAppData } from "@/context/app-context";

export default function AiSuggestion() {
    const { toast } = useToast();
    const { menuItems } = useAppData();
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState("");
    const [formData, setFormData] = useState({
        popularItems: "Spaghetti Carbonara, Margherita Pizza",
        currentSpecials: "None",
        menu: "",
    });

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            menu: menuItems.map(item => `${item.name} - ${item.description}`).join('\n')
        }))
    }, [menuItems]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuggestion("");
        try {
            // AI functionality is not available
            toast({
                title: "AI Not Available",
                description: "AI menu suggestions are currently disabled. Please check back later.",
                variant: "destructive",
            });
        } catch (error) {
            console.error("Error:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <form onSubmit={handleSubmit}>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <Wand2 className="h-5 w-5 text-primary" />
                        AI Menu Suggestions
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Get AI-powered suggestions for new specials based on your current menu and popular items.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="popularItems" className="text-foreground">Popular Items</Label>
                        <Textarea
                            id="popularItems"
                            name="popularItems"
                            value={formData.popularItems}
                            onChange={handleInputChange}
                            placeholder="e.g., Spaghetti, Pizza"
                            className="bg-background border border-input rounded-xl focus:ring-2 focus:ring-ring transition-all duration-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currentSpecials" className="text-foreground">Current Specials</Label>
                        <Textarea
                            id="currentSpecials"
                            name="currentSpecials"
                            value={formData.currentSpecials}
                            onChange={handleInputChange}
                            placeholder="e.g., Taco Tuesday"
                            className="bg-background border border-input rounded-xl focus:ring-2 focus:ring-ring transition-all duration-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="menu" className="text-foreground">Full Menu (auto-populated)</Label>
                        <Textarea
                            id="menu"
                            name="menu"
                            value={formData.menu}
                            onChange={handleInputChange}
                            placeholder="Your full menu..."
                            rows={6}
                            readOnly
                            className="bg-muted border border-input rounded-xl focus:ring-2 focus:ring-ring transition-all duration-200"
                        />
                    </div>
                    {suggestion && (
                        <div className="space-y-2 rounded-xl border border-border bg-muted/50 p-4">
                            <Label className="text-foreground">Suggestion</Label>
                            <p className="text-sm whitespace-pre-wrap text-foreground">{suggestion}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        {loading ? "Generating..." : "Get Suggestions"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
